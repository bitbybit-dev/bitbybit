import { IFCStateEnum, IFCWorkerManager, IFCWorkerMock } from "@bitbybit-dev/ifc-worker";
import { JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { waitForKernelInitialization } from "./init-kernels";
import { createIfcWorkerFromCDN, createWorkersFromCDN, createWorkersFromUrls } from "./worker-utils";
import type { CreatedWorker } from "./__test__/test-types";

describe("the IFC worker helpers", () => {
    const created: CreatedWorker[] = [];
    const createObjectURL = vi.fn((_blob: Blob): string => "blob:ifc");

    beforeEach(() => {
        created.length = 0;
        vi.stubGlobal("Worker", vi.fn(function (url: string | URL, options?: WorkerOptions) {
            created.push({ url, options });
            return { postMessage: vi.fn() };
        }));
        createObjectURL.mockClear();
        URL.createObjectURL = createObjectURL;
        URL.revokeObjectURL = vi.fn();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it("should load the IFC worker as a classic worker from the CDN it is given", () => {
        // Act
        createIfcWorkerFromCDN("https://cdn.example.com/v1");
        const blob = createObjectURL.mock.calls[0]?.[0];

        // Assert
        expect(created).toEqual([{ url: "blob:ifc", options: { name: "IFC_WORKER" } }]);
        expect(blob?.type).toBe("text/javascript");
    });

    it("should create the IFC worker only when it is enabled", () => {
        // Act
        const without = createWorkersFromCDN({ enableManifold: false });
        const withIfc = createWorkersFromCDN({ enableIFC: true, cdnUrl: "https://cdn.example.com/v1" });

        // Assert
        expect(without.ifcWorker).toBeUndefined();
        expect(Object.keys(withIfc)).toEqual(["ifcWorker"]);
        expect(created.map((worker) => worker.options?.name)).toEqual(["IFC_WORKER"]);
    });

    it("should create the IFC worker as a module worker from a local file", () => {
        // Act
        const workers = createWorkersFromUrls({ ifcWorkerUrl: "/workers/ifc.worker.js" });

        // Assert
        expect(Object.keys(workers)).toEqual(["ifcWorker"]);
        expect(created).toEqual([{ url: "/workers/ifc.worker.js", options: { name: "IFC_WORKER", type: "module" } }]);
    });
});

describe("waiting for the IFC worker", () => {
    it("should wait until the IFC worker reports that it has started", async () => {
        // Arrange
        const ifcWorkerManager = new IFCWorkerManager();
        const mock = new IFCWorkerMock();
        ifcWorkerManager.setIfcWorker(mock);
        const managers = { occtWorkerManager: new OCCTWorkerManager(), jscadWorkerManager: new JSCADWorkerManager(), manifoldWorkerManager: new ManifoldWorkerManager(), ifcWorkerManager };

        // Act
        const waiting = waitForKernelInitialization(managers, { enableIFC: true });
        mock.initializationComplete();
        const result = await waiting;

        // Assert
        expect(result).toEqual({ message: "Successfully initialized: IFC", initializedKernels: ["IFC"] });
    });

    it("should fail rather than wait for ever when the IFC worker cannot start", async () => {
        // Arrange
        const ifcWorkerManager = new IFCWorkerManager();
        ifcWorkerManager.setIfcWorker(new IFCWorkerMock());
        const managers = { occtWorkerManager: new OCCTWorkerManager(), jscadWorkerManager: new JSCADWorkerManager(), manifoldWorkerManager: new ManifoldWorkerManager(), ifcWorkerManager };

        // Act
        const waiting = waitForKernelInitialization(managers, { enableIFC: true });
        ifcWorkerManager.ifcWorkerState$.next({ state: IFCStateEnum.failed });

        // Assert
        await expect(waiting).rejects.toThrow("The IFC worker failed to start");
    });

    it("should fail at once when IFC is enabled but no IFC worker was handed over", async () => {
        // Arrange
        const managers = { occtWorkerManager: new OCCTWorkerManager(), jscadWorkerManager: new JSCADWorkerManager(), manifoldWorkerManager: new ManifoldWorkerManager(), ifcWorkerManager: new IFCWorkerManager() };

        // Act
        const waiting = waitForKernelInitialization(managers, { enableIFC: true });

        // Assert
        await expect(waiting).rejects.toThrow("IFC is enabled, but no IFC worker was handed over");
    });

    it("should not wait for a worker that started before the wait began", async () => {
        // Arrange
        const ifcWorkerManager = new IFCWorkerManager();
        const mock = new IFCWorkerMock();
        mock.initializationComplete(true);
        ifcWorkerManager.setIfcWorker(mock);
        const managers = { occtWorkerManager: new OCCTWorkerManager(), jscadWorkerManager: new JSCADWorkerManager(), manifoldWorkerManager: new ManifoldWorkerManager(), ifcWorkerManager };

        // Act
        const result = await waitForKernelInitialization(managers, { enableIFC: true });

        // Assert
        expect(result.initializedKernels).toEqual(["IFC"]);
    });
});
