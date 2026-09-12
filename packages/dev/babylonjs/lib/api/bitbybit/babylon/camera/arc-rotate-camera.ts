import * as BABYLON from "@babylonjs/core";
import { uniqueName } from "../../../unique-name";
import { Context } from "../../../context";
import * as Inputs from "../../../inputs";

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
        const target = new BABYLON.Vector3(inputs.target[0], inputs.target[1], inputs.target[2]);
        const camera = new BABYLON.ArcRotateCamera(
            uniqueName("arcRotateCamera"),
            this.getRadians(inputs.alpha),
            this.getRadians(inputs.beta),
            inputs.radius,
            target,
            this.context.scene
        );
        if (inputs.angularSensibilityX !== undefined) {
            camera.angularSensibilityX = inputs.angularSensibilityX;
        }
        if (inputs.angularSensibilityY !== undefined) {
            camera.angularSensibilityY = inputs.angularSensibilityY;
        }
        if (inputs.lowerRadiusLimit !== undefined) {
            camera.lowerRadiusLimit = inputs.lowerRadiusLimit;
        }
        if (inputs.upperRadiusLimit !== undefined) {
            camera.upperRadiusLimit = inputs.upperRadiusLimit;
        }
        if (inputs.lowerAlphaLimit !== undefined) {
            camera.lowerAlphaLimit = this.getRadians(inputs.lowerAlphaLimit);
        }
        if (inputs.upperAlphaLimit !== undefined) {
            camera.upperAlphaLimit = this.getRadians(inputs.upperAlphaLimit);
        }
        if (inputs.lowerBetaLimit !== undefined) {
            camera.lowerBetaLimit = this.getRadians(inputs.lowerBetaLimit);
        }
        if (inputs.upperBetaLimit !== undefined) {
            camera.upperBetaLimit = this.getRadians(inputs.upperBetaLimit);
        }
        if (inputs.panningSensibility !== undefined) {
            camera.panningSensibility = inputs.panningSensibility;
        }
        if (inputs.wheelPrecision !== undefined) {
            camera.wheelPrecision = inputs.wheelPrecision;
        }
        if (inputs.maxZ !== undefined) {
            camera.maxZ = inputs.maxZ;
        }
        camera.minZ = 0;

        const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
        camera.attachControl(canvas, true);
        return camera;
    }

    private getRadians(degrees: number): number {
        return BABYLON.Tools.ToRadians(degrees);
    }

}
