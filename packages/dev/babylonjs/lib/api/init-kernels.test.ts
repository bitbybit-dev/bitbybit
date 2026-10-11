import { describe, it, expect, beforeEach, vi } from "vitest";
import * as BABYLON from "@babylonjs/core";

const core = vi.hoisted(() => {
    const workers: { occtWorker: object; jscadWorker: object; manifoldWorker: object; ifcWorker?: object } = { occtWorker: {}, jscadWorker: {}, manifoldWorker: {}, ifcWorker: {} };
    return {
        workers,
        getOrCreateWorkers: vi.fn(() => workers),
        waitForKernelInitialization: vi.fn(() => Promise.resolve({ occt: true, jscad: true, manifold: true })),
    };
});

vi.mock("@bitbybit-dev/core", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@bitbybit-dev/core")>();
    return {
        ...actual,
        getOrCreateWorkers: core.getOrCreateWorkers,
        waitForKernelInitialization: core.waitForKernelInitialization,
    };
});

import { initBitByBit } from "./init-kernels";
import { BitByBitBase } from "./bitbybit-base";

describe("initBitByBit", () => {
    let scene: BABYLON.Scene;
    let engine: BABYLON.NullEngine;
    let bitbybit: BitByBitBase;

    beforeEach(() => {
        core.getOrCreateWorkers.mockClear();
        core.waitForKernelInitialization.mockClear();
        engine = new BABYLON.NullEngine();
        scene = new BABYLON.Scene(engine);
        bitbybit = new BitByBitBase();
    });

    it("should hand the scene and every kernel worker to the library and the IFC worker to its manager", async () => {
        // Arrange
        const init = vi.spyOn(bitbybit, "init");
        const setIfcWorker = vi.spyOn(bitbybit.ifcWorkerManager, "setIfcWorker").mockImplementation(() => undefined);

        // Act
        await initBitByBit(scene, bitbybit, {});

        // Assert
        expect(init).toHaveBeenCalledWith(scene, core.workers.occtWorker, core.workers.jscadWorker, core.workers.manifoldWorker, undefined);
        expect(setIfcWorker).toHaveBeenCalledWith(core.workers.ifcWorker);
    });

    it("should leave the IFC manager without a worker when it is given none", async () => {
        // Arrange
        core.getOrCreateWorkers.mockReturnValueOnce({ occtWorker: {}, jscadWorker: {}, manifoldWorker: {} });
        const setIfcWorker = vi.spyOn(bitbybit.ifcWorkerManager, "setIfcWorker");

        // Act
        await initBitByBit(scene, bitbybit, {});

        // Assert
        expect(setIfcWorker).not.toHaveBeenCalled();
    });

    it("should pass on the physics plugin it was given", async () => {
        // Arrange
        const init = vi.spyOn(bitbybit, "init");
        const havokPlugin = {} as BABYLON.HavokPlugin;

        // Act
        await initBitByBit(scene, bitbybit, { havokPlugin });

        // Assert
        expect(init).toHaveBeenCalledWith(scene, core.workers.occtWorker, core.workers.jscadWorker, core.workers.manifoldWorker, havokPlugin);
    });

    it("should wait for every kernel to be ready before it hands anything back", async () => {
        // Act
        await initBitByBit(scene, bitbybit, {});

        // Assert
        expect(core.waitForKernelInitialization).toHaveBeenCalledWith(bitbybit, {});
    });

    it("should hand back the readiness of each kernel along with the library itself", async () => {
        // Act
        const result = await initBitByBit(scene, bitbybit, {});

        // Assert
        expect(result.bitbybit).toBe(bitbybit);
        expect(result).toMatchObject({ occt: true, jscad: true, manifold: true });
    });
});
