import { describe, expect, it } from "vitest";
import { Inputs } from "@bitbybit-dev/base";
import { ContextBase } from "./context";
import { createSharedServices } from "./shared-services";
import type { SharedServices } from "./shared-services-types";
import { KernelWorkerFake, stateWithin } from "../../../__test__/kernel-workers";

const RIGHT_HANDED = { coordinateSystem: Inputs.Base.coordinateSystemEnum.rightHanded };
const LEFT_HANDED = { coordinateSystem: Inputs.Base.coordinateSystemEnum.leftHanded };
const TOLD_RIGHT_HANDED = { functionName: "setSettings", inputs: { coordinateSystem: "rightHanded" } };
const TOLD_LEFT_HANDED = { functionName: "setSettings", inputs: { coordinateSystem: "leftHanded" } };

type Kernels = { occt: KernelWorkerFake; jscad: KernelWorkerFake; manifold: KernelWorkerFake };

const servicesWith = (kernels?: Kernels): { shared: SharedServices; context: ContextBase } => {
    const context = new ContextBase();
    const shared = createSharedServices(context);
    if (kernels !== undefined) {
        shared.occtWorkerManager.setOccWorker(kernels.occt);
        shared.jscadWorkerManager.setJscadWorker(kernels.jscad);
        shared.manifoldWorkerManager.setManifoldWorker(kernels.manifold);
    }
    return { shared, context };
};

const answeringKernels = (): Kernels => ({ occt: new KernelWorkerFake(), jscad: new KernelWorkerFake(), manifold: new KernelWorkerFake() });

const groundDepths = (shared: SharedServices): number[] => shared.point
    .hexGrid({ radiusHexagon: 1, nrHexagonsX: 1, nrHexagonsY: 2, orientOnCenter: false, pointsOnGround: true })
    .map((point) => point[2] + 0);

describe("createSharedServices", () => {
    describe("setSettings", () => {
        it("should tell every kernel worker the settings once and work by them in this thread", async () => {
            // Arrange
            const kernels = answeringKernels();
            const { shared, context } = servicesWith(kernels);

            // Act
            const settings = await shared.setSettings(RIGHT_HANDED);

            // Assert
            expect(settings).toEqual({ coordinateSystem: "rightHanded" });
            expect([kernels.occt.calls, kernels.jscad.calls, kernels.manifold.calls]).toEqual([[TOLD_RIGHT_HANDED], [TOLD_RIGHT_HANDED], [TOLD_RIGHT_HANDED]]);
            expect(context.settings).toEqual({ coordinateSystem: "rightHanded" });
            expect(groundDepths(shared)).toEqual([0, -1.5]);
        });

        it("should work by settings given before any worker, and tell each worker when it is set", async () => {
            // Arrange
            const { shared } = servicesWith();
            await shared.setSettings(LEFT_HANDED);
            const kernels = answeringKernels();

            // Act
            shared.occtWorkerManager.setOccWorker(kernels.occt);
            shared.jscadWorkerManager.setJscadWorker(kernels.jscad);
            shared.manifoldWorkerManager.setManifoldWorker(kernels.manifold);

            // Assert
            expect([kernels.occt.calls, kernels.jscad.calls, kernels.manifold.calls]).toEqual([[TOLD_LEFT_HANDED], [TOLD_LEFT_HANDED], [TOLD_LEFT_HANDED]]);
            expect(groundDepths(shared)).toEqual([0, 1.5]);
        });

        it("should tell a worker set in place of another the settings in force", async () => {
            // Arrange
            const { shared } = servicesWith(answeringKernels());
            await shared.setSettings(RIGHT_HANDED);
            const replacements = answeringKernels();

            // Act
            shared.occtWorkerManager.setOccWorker(replacements.occt);
            shared.jscadWorkerManager.setJscadWorker(replacements.jscad);
            shared.manifoldWorkerManager.setManifoldWorker(replacements.manifold);

            // Assert
            expect([replacements.occt.calls, replacements.jscad.calls, replacements.manifold.calls]).toEqual([[TOLD_RIGHT_HANDED], [TOLD_RIGHT_HANDED], [TOLD_RIGHT_HANDED]]);
        });

        it("should go back to how it worked before when given no settings", async () => {
            // Arrange
            const { shared, context } = servicesWith(answeringKernels());
            await shared.setSettings(RIGHT_HANDED);

            // Act
            const settings = await shared.setSettings({});

            // Assert
            expect([settings, context.settings]).toEqual([{}, {}]);
            expect(groundDepths(shared)).toEqual([0, 1.5]);
        });

        it("should refuse a name that is no setting as a rejection, tell no worker and keep working as it did", async () => {
            // Arrange
            const kernels = answeringKernels();
            const { shared, context } = servicesWith(kernels);
            await shared.setSettings(RIGHT_HANDED);

            // Act
            const refused = shared.setSettings(JSON.parse("{\"handedness\":\"right\"}"));

            // Assert
            await expect(refused).rejects.toThrow("`handedness` is not a setting");
            expect([kernels.occt.calls, kernels.jscad.calls, kernels.manifold.calls]).toEqual([[TOLD_RIGHT_HANDED], [TOLD_RIGHT_HANDED], [TOLD_RIGHT_HANDED]]);
            expect(context.settings).toEqual({ coordinateSystem: "rightHanded" });
            expect(groundDepths(shared)).toEqual([0, -1.5]);
        });

        it("should resolve without waiting for kernels that are not ready, which take the settings ahead of every later call", async () => {
            // Arrange
            const kernels = { occt: new KernelWorkerFake("occ-initialised"), jscad: new KernelWorkerFake("jscad-initialised"), manifold: new KernelWorkerFake("manifold-initialised") };
            const { shared } = servicesWith(kernels);

            // Act
            const state = await stateWithin(shared.setSettings(RIGHT_HANDED), 0);
            void shared.occtWorkerManager.genericCallToWorkerPromise("shapes.solid.createBox", {});

            // Assert
            expect(state).toBe("resolved");
            expect(kernels.occt.calls).toEqual([TOLD_RIGHT_HANDED, { functionName: "shapes.solid.createBox", inputs: {} }]);
        });

        it("should tell every kernel before a call made after it reaches any of them, while one kernel is not ready yet", () => {
            // Arrange
            const kernels = { occt: new KernelWorkerFake("occ-initialised"), jscad: new KernelWorkerFake(), manifold: new KernelWorkerFake() };
            const { shared } = servicesWith(kernels);

            // Act
            void shared.setSettings(RIGHT_HANDED);
            void shared.jscadWorkerManager.genericCallToWorkerPromise("shapes.cube", {});
            void shared.manifoldWorkerManager.genericCallToWorkerPromise("manifold.shapes.cube", {});

            // Assert
            expect(kernels.jscad.calls).toEqual([TOLD_RIGHT_HANDED, { functionName: "shapes.cube", inputs: {} }]);
            expect(kernels.manifold.calls).toEqual([TOLD_RIGHT_HANDED, { functionName: "manifold.shapes.cube", inputs: {} }]);
        });
    });

    describe("setConventions", () => {
        it.each([
            ["level 1 by the engine's settings", 1, { coordinateSystem: "rightHanded" }, [0, -1.5]],
            ["level 0 as it always ran", 0, {}, [0, 1.5]],
        ])("should run content of %s", async (_name, level, expected, depths) => {
            // Arrange
            const { shared, context } = servicesWith(answeringKernels());

            // Act
            const settings = await shared.setConventions(level, RIGHT_HANDED);

            // Assert
            expect([settings, context.settings]).toEqual([expected, expected]);
            expect(groundDepths(shared)).toEqual(depths);
        });

        it.each([
            ["a fraction", 1.5],
            ["a negative number", -1],
        ])("should refuse %s as a rejection and keep working as it did", async (_name, level) => {
            // Arrange
            const kernels = answeringKernels();
            const { shared, context } = servicesWith(kernels);
            await shared.setConventions(1, RIGHT_HANDED);
            let thrown: unknown;

            // Act
            const refused = ((): Promise<unknown> | undefined => {
                try {
                    return shared.setConventions(level, RIGHT_HANDED);
                } catch (error) {
                    thrown = error;
                    return undefined;
                }
            })();

            // Assert
            expect(thrown).toBeUndefined();
            await expect(refused).rejects.toThrow("A conventions level is a whole number from 0");
            expect(context.settings).toEqual({ coordinateSystem: "rightHanded" });
            expect(kernels.occt.calls).toEqual([TOLD_RIGHT_HANDED]);
        });
    });
});
