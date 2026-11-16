import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
vi.mock("playcanvas", async () => {
    const { createSceneHelperMock } = await vi.importActual<typeof import("./__mocks__/playcanvas.mock")>("./__mocks__/playcanvas.mock");
    return createSceneHelperMock();
});

import * as pc from "playcanvas";
import { BitByBitBase } from "./bitbybit-base";
import { initBitByBit } from "./init-kernels";
import { KernelWorkerFake, stateWithin } from "../../../__test__/kernel-workers";

const KERNELS_READY_WITHIN_MS = 200;

class SilentWorker extends EventTarget implements Worker {
    onmessage: Worker["onmessage"] = null;
    onmessageerror: Worker["onmessageerror"] = null;
    onerror: Worker["onerror"] = null;

    postMessage(): void {
        return undefined;
    }

    terminate(): void {
        return undefined;
    }
}

describe("initBitByBit", () => {
    let app: pc.Application;
    let scene: pc.Entity;
    let bitbybit: BitByBitBase;
    let workers: { occtWorker: Worker; jscadWorker: Worker; manifoldWorker: Worker; ifcWorker: Worker };

    beforeEach(() => {
        vi.spyOn(console, "log").mockImplementation(() => undefined);
        app = new pc.Application(document.createElement("canvas"));
        scene = new pc.Entity("root");
        bitbybit = new BitByBitBase();
        workers = { occtWorker: new SilentWorker(), jscadWorker: new SilentWorker(), manifoldWorker: new SilentWorker(), ifcWorker: new SilentWorker() };
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should hand back the instance it was given", async () => {
        // Act
        const result = await initBitByBit(app, scene, bitbybit, { enableOCCT: false, enableJSCAD: false, enableManifold: false, workers });

        // Assert
        expect(result.bitbybit).toBe(bitbybit);
    });

    it("should give the base the application it was given", async () => {
        // Act
        await initBitByBit(app, scene, bitbybit, { enableOCCT: false, enableJSCAD: false, enableManifold: false, workers });

        // Assert
        expect(bitbybit.context.app).toBe(app);
    });

    it("should give each worker manager the worker meant for it", async () => {
        // Act
        await initBitByBit(app, scene, bitbybit, { enableOCCT: false, enableJSCAD: false, enableManifold: false, workers });

        // Assert
        expect(bitbybit.occtWorkerManager.occWorkerAlreadyInitialised()).toBe(true);
        expect(bitbybit.jscadWorkerManager.jscadWorkerAlreadyInitialised()).toBe(true);
        expect(bitbybit.manifoldWorkerManager.manifoldWorkerAlreadyInitialised()).toBe(true);
        expect(bitbybit.ifcWorkerManager.ifcWorkerAlreadyInitialised()).toBe(true);
    });

    it("should leave the IFC manager without a worker when it is given none", async () => {
        // Act
        await initBitByBit(app, scene, bitbybit, { enableOCCT: false, enableJSCAD: false, enableManifold: false, workers: { occtWorker: workers.occtWorker } });

        // Assert
        expect(bitbybit.ifcWorkerManager.ifcWorkerAlreadyInitialised()).toBe(false);
    });

    it("should say so when no kernel was asked for", async () => {
        // Act
        const result = await initBitByBit(app, scene, bitbybit, { enableOCCT: false, enableJSCAD: false, enableManifold: false, workers });

        // Assert
        expect(result).toMatchObject({ message: "No kernels selected for initialization.", initializedKernels: [] });
    });

    it("should set the conventions it was given once the library has its scene", async () => {
        // Arrange
        const order: string[] = [];
        vi.spyOn(bitbybit, "init").mockImplementation(() => { order.push("init"); });
        const setConventions = vi.spyOn(bitbybit, "setConventions").mockImplementation(() => { order.push("conventions"); return Promise.resolve({}); });

        // Act
        await initBitByBit(app, scene, bitbybit, { enableOCCT: false, enableJSCAD: false, enableManifold: false, workers, conventions: 1 });

        // Assert
        expect(setConventions.mock.calls).toEqual([[1]]);
        expect(order).toEqual(["init", "conventions"]);
    });

    it("should come up with the conventions it was given while each kernel worker holds its calls until its kernel is ready", async () => {
        // Arrange
        const occtWorker = new KernelWorkerFake("occ-initialised");
        const jscadWorker = new KernelWorkerFake("jscad-initialised");
        const manifoldWorker = new KernelWorkerFake("manifold-initialised");
        const kernels = [occtWorker, jscadWorker, manifoldWorker];
        const started = initBitByBit(app, scene, bitbybit, { enableOCCT: true, enableJSCAD: true, enableManifold: true, workers: { occtWorker, jscadWorker, manifoldWorker }, conventions: 1 });
        await new Promise((resolve) => setTimeout(resolve, 0));

        // Act
        kernels.forEach((kernel) => kernel.ready());

        // Assert
        expect(await stateWithin(started, KERNELS_READY_WITHIN_MS)).toBe("resolved");
        expect(kernels.map((kernel) => kernel.calls)).toEqual(kernels.map(() => [{ functionName: "setSettings", inputs: { coordinateSystem: "rightHanded" } }]));
    });

    it("should set no conventions when it was given none, so an app made earlier runs as it did", async () => {
        // Arrange
        const setConventions = vi.spyOn(bitbybit, "setConventions");

        // Act
        await initBitByBit(app, scene, bitbybit, { enableOCCT: false, enableJSCAD: false, enableManifold: false, workers, });

        // Assert
        expect(setConventions).not.toHaveBeenCalled();
    });

    it("should set level 0 when that is what it was given, which says so on purpose", async () => {
        // Arrange
        const setConventions = vi.spyOn(bitbybit, "setConventions").mockResolvedValue({});

        // Act
        await initBitByBit(app, scene, bitbybit, { enableOCCT: false, enableJSCAD: false, enableManifold: false, workers, conventions: 0 });

        // Assert
        expect(setConventions.mock.calls).toEqual([[0]]);
    });
});
