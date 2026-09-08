import { describe, it, expect, beforeEach, vi } from "vitest";
import * as BABYLON from "@babylonjs/core";

const core = vi.hoisted(() => {
    const workers = { occtWorker: {}, jscadWorker: {}, manifoldWorker: {} };
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

    it("should hand the scene and the three workers to the library", async () => {
        // Arrange
        const init = vi.spyOn(bitbybit, "init");

        // Act
        await initBitByBit(scene, bitbybit, {});

        // Assert
        expect(init).toHaveBeenCalledWith(
            scene, core.workers.occtWorker, core.workers.jscadWorker, core.workers.manifoldWorker, undefined);
    });

    it("should pass on the physics plugin it was given", async () => {
        // Arrange
        const init = vi.spyOn(bitbybit, "init");
        const havokPlugin = {} as BABYLON.HavokPlugin;

        // Act
        await initBitByBit(scene, bitbybit, { havokPlugin });

        // Assert
        expect(init).toHaveBeenCalledWith(
            scene, core.workers.occtWorker, core.workers.jscadWorker, core.workers.manifoldWorker, havokPlugin);
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
