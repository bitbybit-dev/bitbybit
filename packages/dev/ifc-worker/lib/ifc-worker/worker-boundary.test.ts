import { InputError, KernelCallError } from "@bitbybit-dev/base";
import { describe, expect, it } from "vitest";
import { BitByBitIFC } from "../api/bitbybit-ifc";
import type { IFCInfo } from "./ifc-info";
import { IFCStateEnum } from "./ifc-state.enum";
import { IFCWorkerManager } from "./ifc-worker-manager";
import { IFCWorkerMock } from "./ifc-worker-mock";
import { ModelCache } from "./model-cache";

function started(): BitByBitIFC {
    const mock = new IFCWorkerMock();
    const facade = new BitByBitIFC();
    facade.init(mock);
    mock.initializationComplete();
    return facade;
}

class FailingWorker extends IFCWorkerMock {
    readonly sent: unknown[] = [];
    private listener: ((event: ErrorEvent) => void) | undefined;

    addEventListener(type: string, listener: (event: ErrorEvent) => void): void {
        this.listener = type === "error" ? listener : this.listener;
    }

    override postMessage(data: unknown): void {
        this.sent.push(data);
    }

    failToLoad(message: string): void {
        this.listener?.({ message } as ErrorEvent);
    }
}

describe("the IFC worker mock", () => {
    it("should keep each mock's models to itself", async () => {
        // Arrange
        const first = started();
        const model = await first.ifc.model.create({ name: "First", seed: "mock" });

        // Act
        started();
        const summary = await first.ifc.model.summary({ model });

        // Assert
        expect(summary.project).toBe("First");
    });

    it("should copy answers across, so changing one leaves what the next call answers as it was", async () => {
        // Arrange
        const facade = started();
        const model = await facade.ifc.spatial.addStorey({ model: await facade.ifc.model.create({ seed: "mock" }), id: "ground", name: "Ground" });
        const storeys = await facade.ifc.spatial.storeys({ model });

        // Act
        storeys[0]!.name = "Changed";
        const again = await facade.ifc.spatial.storeys({ model });

        // Assert
        expect(again[0]!.name).toBe("Ground");
    });
});

describe("calls that are meant to differ each time", () => {
    it("should make a new model for each create without a seed", async () => {
        // Arrange
        const facade = started();

        // Act
        const first = await facade.ifc.model.create({ name: "House" });
        const second = await facade.ifc.model.create({ name: "House" });

        // Assert
        expect(second.hash).not.toBe(first.hash);
        expect(await facade.ifc.model.globalIdOf({ model: second, id: "south" })).not.toBe(await facade.ifc.model.globalIdOf({ model: first, id: "south" }));
    });

    it("should still answer a create with a seed from what it made before", async () => {
        // Arrange
        const facade = started();

        // Act
        const first = await facade.ifc.model.create({ name: "House", seed: "fixed" });
        const second = await facade.ifc.model.create({ name: "House", seed: "fixed" });

        // Assert
        expect(second).toEqual(first);
    });
});

describe("ModelCache.keyOf with unusual inputs", () => {
    it("should tell apart the values JSON would write alike", () => {
        // Arrange
        const cache = new ModelCache();

        // Act
        const keys = [[null], [undefined], [Number.NaN], [Infinity], [-Infinity], [0], [-0]].map((values) => cache.keyOf("model.summary", { values }));

        // Assert
        expect(new Set(keys).size).toBe(keys.length);
    });

    it("should key objects the same whatever order their properties were written in", () => {
        // Arrange
        const cache = new ModelCache();

        // Act
        const first = cache.keyOf("walls.add", { storey: "ground", id: "south" });
        const second = cache.keyOf("walls.add", { id: "south", storey: "ground" });

        // Assert
        expect(second).toBe(first);
    });

    it("should key a date by its time", () => {
        // Arrange
        const cache = new ModelCache();

        // Act
        const first = cache.keyOf("model.write", { when: new Date(1000) });
        const same = cache.keyOf("model.write", { when: new Date(1000) });
        const later = cache.keyOf("model.write", { when: new Date(2000) });

        // Assert
        expect(same).toBe(first);
        expect(later).not.toBe(first);
    });

    it("should refuse inputs that refer to themselves", () => {
        // Arrange
        const cache = new ModelCache();
        const inputs: Record<string, unknown> = { name: "loop" };
        inputs["self"] = inputs;

        // Act & Assert
        expect(() => cache.keyOf("model.create", inputs)).toThrow(InputError);
    });
});

describe("IFCWorkerManager and the worker's start", () => {
    it("should notice a start the worker announced before the manager was listening", () => {
        // Arrange
        const mock = new IFCWorkerMock();
        mock.initializationComplete(true);
        const manager = new IFCWorkerManager();
        const states: IFCInfo[] = [];
        manager.ifcWorkerState$.subscribe((info) => states.push(info));

        // Act
        manager.setIfcWorker(mock);

        // Assert
        expect(manager.ifcWorkerStarted()).toBe(true);
        expect(states.map((info) => info.state)).toContain(IFCStateEnum.initialised);
    });

    it("should reject every waiting call and report the failure when the worker cannot load its script", async () => {
        // Arrange
        const worker = new FailingWorker();
        const manager = new IFCWorkerManager();
        const states: IFCInfo[] = [];
        const reported: string[] = [];
        manager.ifcWorkerState$.subscribe((info) => states.push(info));
        manager.errorCallback = (error: string): void => {
            reported.push(error);
        };
        manager.setIfcWorker(worker);
        const waiting = manager.genericCallToWorkerPromise("model.create", {}).catch((error: unknown) => error);

        // Act
        worker.failToLoad("404 Not Found");
        const failure = await waiting;

        // Assert
        expect(failure).toBeInstanceOf(KernelCallError);
        expect((failure as KernelCallError).message).toBe("The IFC worker failed to run its script: 404 Not Found");
        expect(states.at(-1)?.state).toBe(IFCStateEnum.failed);
        expect(reported).toEqual(["The IFC worker failed to run its script: 404 Not Found"]);
    });

    it("should report a failure the worker gives no message for", async () => {
        // Arrange
        const worker = new FailingWorker();
        const manager = new IFCWorkerManager();
        manager.setIfcWorker(worker);
        const waiting = manager.genericCallToWorkerPromise("model.create", {}).catch((error: unknown) => error);

        // Act
        worker.failToLoad("");
        const failure = await waiting;

        // Assert
        expect((failure as KernelCallError).message).toBe("The IFC worker failed to run its script");
    });
});
