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
import { KernelWorkerFake, stateWithin } from "../../../__test__/kernel-workers";

const KERNELS_READY_WITHIN_MS = 200;

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

    it("should set the conventions it was given once the library has its scene", async () => {
        // Arrange
        const order: string[] = [];
        vi.spyOn(bitbybit, "init").mockImplementation(() => { order.push("init"); });
        const setConventions = vi.spyOn(bitbybit, "setConventions").mockImplementation(() => { order.push("conventions"); return Promise.resolve({}); });

        // Act
        await initBitByBit(scene, bitbybit, { conventions: 1 });

        // Assert
        expect(setConventions.mock.calls).toEqual([[1]]);
        expect(order).toEqual(["init", "conventions"]);
    });

    it("should come up with the conventions it was given while each kernel worker holds its calls until its kernel is ready", async () => {
        // Arrange
        const actual = await vi.importActual<typeof import("@bitbybit-dev/core")>("@bitbybit-dev/core");
        const options = { enableOCCT: true, enableJSCAD: true, enableManifold: true, conventions: 1 };
        core.waitForKernelInitialization.mockImplementationOnce(() => actual.waitForKernelInitialization(bitbybit, options).then(() => ({ occt: true, jscad: true, manifold: true })));
        const occtWorker = new KernelWorkerFake("occ-initialised");
        const jscadWorker = new KernelWorkerFake("jscad-initialised");
        const manifoldWorker = new KernelWorkerFake("manifold-initialised");
        const kernels = [occtWorker, jscadWorker, manifoldWorker];
        core.getOrCreateWorkers.mockReturnValueOnce({ occtWorker, jscadWorker, manifoldWorker });
        const started = initBitByBit(scene, bitbybit, options);
        await new Promise((resolve) => setTimeout(resolve, 0));

        // Act
        kernels.forEach((kernel) => kernel.ready());

        // Assert
        expect(await stateWithin(started, KERNELS_READY_WITHIN_MS)).toBe("resolved");
        expect(kernels.map((kernel) => kernel.calls)).toEqual(kernels.map(() => [{ functionName: "setSettings", inputs: { coordinateSystem: "leftHanded" } }]));
    });

    it("should set no conventions when it was given none, so an app made earlier runs as it did", async () => {
        // Arrange
        const setConventions = vi.spyOn(bitbybit, "setConventions");

        // Act
        await initBitByBit(scene, bitbybit, { });

        // Assert
        expect(setConventions).not.toHaveBeenCalled();
    });

    it("should set level 0 when that is what it was given, which says so on purpose", async () => {
        // Arrange
        const setConventions = vi.spyOn(bitbybit, "setConventions").mockResolvedValue({});

        // Act
        await initBitByBit(scene, bitbybit, { conventions: 0 });

        // Assert
        expect(setConventions.mock.calls).toEqual([[0]]);
    });
});
