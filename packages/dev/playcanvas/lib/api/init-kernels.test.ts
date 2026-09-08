import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
vi.mock("playcanvas", async () => {
    const { createSceneHelperMock } = await vi.importActual<typeof import("./__mocks__/playcanvas.mock")>("./__mocks__/playcanvas.mock");
    return createSceneHelperMock();
});

import * as pc from "playcanvas";
import { BitByBitBase } from "./bitbybit-base";
import { initBitByBit } from "./init-kernels";

// The one call that sets a PlayCanvas application up: it takes the workers a host already has (or
// fetches them from the CDN, which is not something a suite should do), hands them to the base along
// with the application, and waits for the kernels the host asked for to report themselves ready.

// A worker that never answers. The cases below enable no kernel, so nothing is waited for; what is
// under test is that the workers reach the base and that the application is the one that was given.
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
    let workers: { occtWorker: Worker; jscadWorker: Worker; manifoldWorker: Worker };

    beforeEach(() => {
        vi.spyOn(console, "log").mockImplementation(() => undefined);
        app = new pc.Application(document.createElement("canvas"));
        scene = new pc.Entity("root");
        bitbybit = new BitByBitBase();
        workers = { occtWorker: new SilentWorker(), jscadWorker: new SilentWorker(), manifoldWorker: new SilentWorker() };
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
    });

    it("should say so when no kernel was asked for", async () => {
        // Act
        const result = await initBitByBit(app, scene, bitbybit, { enableOCCT: false, enableJSCAD: false, enableManifold: false, workers });

        // Assert
        expect(result).toMatchObject({ message: "No kernels selected for initialization.", initializedKernels: [] });
    });
});
