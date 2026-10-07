import { KernelCallError } from "@bitbybit-dev/base";
import { describe, expect, it, vi } from "vitest";
import type { IFCInfo } from "./ifc-info";
import { IFCStateEnum } from "./ifc-state.enum";
import { IFCWorkerManager } from "./ifc-worker-manager";
import { IFCWorkerMock } from "./ifc-worker-mock";

function managerWithMock(started = true): [IFCWorkerManager, IFCWorkerMock, IFCInfo[]] {
    const manager = new IFCWorkerManager();
    const mock = new IFCWorkerMock();
    if (started) {
        mock.initializationComplete(true);
    }
    const states: IFCInfo[] = [];
    manager.ifcWorkerState$.subscribe((info) => states.push(info));
    manager.setIfcWorker(mock);
    return [manager, mock, states];
}

describe("IFCWorkerManager", () => {
    it("should report the worker's start, then busy and idle around each call", async () => {
        // Arrange
        const [manager, mock, states] = managerWithMock(false);

        // Act
        mock.initializationComplete();
        await manager.cleanAllCache();

        // Assert
        expect(states.map((info) => info.state)).toEqual([IFCStateEnum.loading, IFCStateEnum.initialised, IFCStateEnum.computing, IFCStateEnum.loaded, IFCStateEnum.computing, IFCStateEnum.loaded]);
    });

    it("should say whether a worker was handed to it", () => {
        // Arrange
        const manager = new IFCWorkerManager();

        // Act
        const before = manager.ifcWorkerAlreadyInitialised();
        manager.setIfcWorker(new IFCWorkerMock());

        // Assert
        expect(before).toBe(false);
        expect(manager.ifcWorkerAlreadyInitialised()).toBe(true);
    });

    it("should reject a call made before any worker was handed to it", async () => {
        // Act
        const failure = await new IFCWorkerManager().genericCallToWorkerPromise("model.summary", {}).catch((error: unknown) => error);

        // Assert
        expect(failure).toBeInstanceOf(KernelCallError);
        expect((failure as KernelCallError).kind).toBe("input");
    });

    it("should reject at once inputs the worker cannot receive, and report itself idle", async () => {
        // Arrange
        const [manager, mock, states] = managerWithMock();
        mock.postMessage = (): void => {
            throw new Error("could not be cloned");
        };

        // Act
        const failure = await manager.genericCallToWorkerPromise("model.summary", {}).catch((error: unknown) => error);

        // Assert
        expect((failure as KernelCallError).message).toBe("model.summary: the inputs could not be sent to the worker: could not be cloned");
        expect(states.at(-1)?.state).toBe(IFCStateEnum.loaded);
    });

    it("should hand every failure's message to the error callback, and survive a callback that throws", async () => {
        // Arrange
        const [manager, mock] = managerWithMock();
        mock.initializationComplete(true);
        const seen: string[] = [];
        const logged = vi.spyOn(console, "error").mockImplementation(() => undefined);
        manager.errorCallback = (error: string): void => {
            seen.push(error);
            throw new Error("callback failed");
        };

        // Act
        const failure = await manager.genericCallToWorkerPromise("model.summary", { model: { hash: 1, type: "ifc-model" } }).catch((error: unknown) => error);

        // Assert
        expect(failure).toBeInstanceOf(KernelCallError);
        expect(seen).toHaveLength(1);
        expect(logged).toHaveBeenCalled();
        logged.mockRestore();
    });

    it("should leave a call it forgot unsettled when its answer arrives later", async () => {
        // Arrange
        const [manager, mock] = managerWithMock();
        const sent: { uid: string }[] = [];
        mock.postMessage = (data): void => {
            sent.push(data);
        };
        const pending = manager.genericCallToWorkerPromise("cleanAllCache", {});

        // Act
        manager.cleanPromisesMade();
        mock.onmessage?.({ data: { uid: sent[0]!.uid, result: {} } });
        const outcome = await Promise.race([pending.then(() => "settled"), new Promise((resolve) => setTimeout(() => resolve("unsettled"), 0))]);

        // Assert
        expect(outcome).toBe("unsettled");
    });

    it("should say only that the inputs could not be sent when the worker throws something other than an error", async () => {
        // Arrange
        const [manager, mock] = managerWithMock();
        const notAnError: unknown = "not cloneable";
        mock.postMessage = (): void => {
            throw notAnError;
        };

        // Act
        const failure = await manager.genericCallToWorkerPromise("model.summary", {}).catch((error: unknown) => error);

        // Assert
        expect((failure as KernelCallError).message).toBe("model.summary: the inputs could not be sent to the worker");
    });

    it("should count a failure the worker answers without a kind as the library's", async () => {
        // Arrange
        const [manager, mock] = managerWithMock();
        const sent: { uid: string }[] = [];
        mock.postMessage = (data): void => {
            sent.push(data);
        };
        const pending = manager.genericCallToWorkerPromise("model.summary", {}).catch((error: unknown) => error);

        // Act
        mock.onmessage?.({ data: { uid: sent[0]!.uid, error: "the library failed" } });
        const failure = await pending;

        // Assert
        expect(failure).toBeInstanceOf(KernelCallError);
        expect((failure as KernelCallError).kind).toBe("kernel");
    });

    it("should stay busy while another call is still waiting for its answer", async () => {
        // Arrange
        const [manager, mock, states] = managerWithMock();
        const sent: { uid: string }[] = [];
        mock.postMessage = (data): void => {
            sent.push(data);
        };
        const first = manager.genericCallToWorkerPromise("cleanAllCache", {});
        const second = manager.genericCallToWorkerPromise("cleanAllCache", {});

        // Act
        mock.onmessage?.({ data: { uid: sent[0]!.uid, result: {} } });
        await first;
        const whileWaiting = states.at(-1)?.state;
        mock.onmessage?.({ data: { uid: sent[1]!.uid, result: {} } });
        await second;

        // Assert
        expect(whileWaiting).toBe(IFCStateEnum.computing);
        expect(states.at(-1)?.state).toBe(IFCStateEnum.loaded);
    });
});
