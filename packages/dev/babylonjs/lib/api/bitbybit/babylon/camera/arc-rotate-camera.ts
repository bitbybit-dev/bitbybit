import * as BABYLON from "@babylonjs/core";
import { uniqueName } from "../../../unique-name";
import type { Context } from "../../../context";
import * as Inputs from "../../../inputs";
import { resolveDto } from "@bitbybit-dev/base";
import type * as Resolved from "../../../resolved-inputs";

/**
 * The orbiting camera: it circles a target point at a distance, the way you would turn a product in
 * your hands, and is the camera this library uses by default. Angles are given in degrees: `alpha`
 * around the vertical axis, `beta` down from the top.
 */
export class BabylonArcRotateCamera {

    constructor(
        private readonly context: Context,
    ) { }

    /**
     * Creates a camera that orbits `target` at distance `radius`, controlled by the pointer on the
     * canvas, and adds it to the scene without activating it.
     *
     * `alpha` and `beta` place it in degrees, `beta` counted down from straight above; the limits
     * fence how far it can zoom and orbit, and the sensibilities set how fast it reacts, lower
     * being faster.
     * @param inputs - The radius, target, angles, limits and sensitivities
     * @returns The orbiting camera
     * @group create
     * @shortname new arc rotate camera
     * @example
     * ```typescript
     * const camera = bitbybit.babylon.camera.arcRotate.create({ radius: 20, target: [0, 0, 0], alpha: 45, beta: 70, lowerBetaLimit: 1, upperBetaLimit: 179, angularSensibilityX: 1000, angularSensibilityY: 1000, panningSensibility: 1000, wheelPrecision: 3, maxZ: 1000 });
     * bitbybit.babylon.scene.activateCamera({ camera });
     * ```
     */
    create(inputs: Inputs.BabylonCamera.ArcRotateCameraDto): BABYLON.ArcRotateCamera {
        const resolved = resolveDto(Inputs.BabylonCamera.ArcRotateCameraDto, inputs) as Resolved.BabylonCamera.ArcRotateCameraDto;
        const target = new BABYLON.Vector3(resolved.target[0], resolved.target[1], resolved.target[2]);
        const camera = new BABYLON.ArcRotateCamera(
            uniqueName("arcRotateCamera"),
            this.getRadians(resolved.alpha),
            this.getRadians(resolved.beta),
            resolved.radius,
            target,
            this.context.scene
        );
        camera.angularSensibilityX = resolved.angularSensibilityX;
        camera.angularSensibilityY = resolved.angularSensibilityY;
        if (resolved.lowerRadiusLimit !== undefined) {
            camera.lowerRadiusLimit = resolved.lowerRadiusLimit;
        }
        if (resolved.upperRadiusLimit !== undefined) {
            camera.upperRadiusLimit = resolved.upperRadiusLimit;
        }
        if (resolved.lowerAlphaLimit !== undefined) {
            camera.lowerAlphaLimit = this.getRadians(resolved.lowerAlphaLimit);
        }
        if (resolved.upperAlphaLimit !== undefined) {
            camera.upperAlphaLimit = this.getRadians(resolved.upperAlphaLimit);
        }
        camera.lowerBetaLimit = this.getRadians(resolved.lowerBetaLimit);
        camera.upperBetaLimit = this.getRadians(resolved.upperBetaLimit);
        camera.panningSensibility = resolved.panningSensibility;
        camera.wheelPrecision = resolved.wheelPrecision;
        camera.maxZ = resolved.maxZ;
        camera.minZ = 0;

        const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
        camera.attachControl(canvas, true);
        return camera;
    }

    private getRadians(degrees: number): number {
        return BABYLON.Tools.ToRadians(degrees);
    }

}
