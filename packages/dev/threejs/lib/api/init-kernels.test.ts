import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as THREEJS from "three";
import { BitByBitBase } from "./bitbybit-base";
import { initBitByBit, initKernels } from "./init-kernels";

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
    let scene: THREEJS.Scene;
    let bitbybit: BitByBitBase;
    let workers: { occtWorker: Worker; jscadWorker: Worker; manifoldWorker: Worker };

    beforeEach(() => {
        vi.spyOn(console, "log").mockImplementation(() => undefined);
        scene = new THREEJS.Scene();
        bitbybit = new BitByBitBase();
        workers = { occtWorker: new SilentWorker(), jscadWorker: new SilentWorker(), manifoldWorker: new SilentWorker() };
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should hand back the instance it was given", async () => {
        // Act
        const result = await initBitByBit(scene, bitbybit, { enableOCCT: false, enableJSCAD: false, enableManifold: false, workers });

        // Assert
        expect(result.bitbybit).toBe(bitbybit);
    });

    it("should give the base the scene it was given", async () => {
        // Act
        await initBitByBit(scene, bitbybit, { enableOCCT: false, enableJSCAD: false, enableManifold: false, workers });

        // Assert
        expect(bitbybit.context.scene).toBe(scene);
    });

    it("should give each worker manager the worker meant for it", async () => {
        // Act
        await initBitByBit(scene, bitbybit, { enableOCCT: false, enableJSCAD: false, enableManifold: false, workers });

        // Assert
        expect(bitbybit.occtWorkerManager.occWorkerAlreadyInitialised()).toBe(true);
        expect(bitbybit.jscadWorkerManager.jscadWorkerAlreadyInitialised()).toBe(true);
        expect(bitbybit.manifoldWorkerManager.manifoldWorkerAlreadyInitialised()).toBe(true);
    });

    it("should say so when no kernel was asked for", async () => {
        // Act
        const result = await initBitByBit(scene, bitbybit, { enableOCCT: false, enableJSCAD: false, enableManifold: false, workers });

        // Assert
        expect(result).toMatchObject({ message: "No kernels selected for initialization.", initializedKernels: [] });
    });
});

describe("initKernels", () => {
    let scene: THREEJS.Scene;
    let bitbybit: BitByBitBase;
    let workers: { occtWorker: Worker; jscadWorker: Worker; manifoldWorker: Worker };

    beforeEach(() => {
        vi.spyOn(console, "log").mockImplementation(() => undefined);
        scene = new THREEJS.Scene();
        bitbybit = new BitByBitBase();
        workers = { occtWorker: new SilentWorker(), jscadWorker: new SilentWorker(), manifoldWorker: new SilentWorker() };
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should take the workers given beside the options", async () => {
        // Act
        const result = await initKernels(scene, bitbybit, { enableOCCT: false, enableJSCAD: false, enableManifold: false }, workers);

        // Assert
        expect(bitbybit.occtWorkerManager.occWorkerAlreadyInitialised()).toBe(true);
        expect(result.initializedKernels).toEqual([]);
    });

    it("should take the workers named in the options when none were given beside them", async () => {
        // Act
        await initKernels(scene, bitbybit, { enableOCCT: false, enableJSCAD: false, enableManifold: false, workers });

        // Assert
        expect(bitbybit.jscadWorkerManager.jscadWorkerAlreadyInitialised()).toBe(true);
    });

    it("should report what was initialised and nothing else", async () => {
        // Act
        const result = await initKernels(scene, bitbybit, { enableOCCT: false, enableJSCAD: false, enableManifold: false }, workers);

        // Assert
        expect(Object.keys(result).sort()).toEqual(["initializedKernels", "message"]);
    });
});
