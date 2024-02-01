import * as BABYLON from "@babylonjs/core";
import { Context } from "../../../context";
import * as Inputs from "../../../inputs/inputs";

export class BabylonArcRotateCamera {

    constructor(
        private readonly context: Context,
    ) { }

    /**
     * Creates a camera that rotates around a given target while traveling the arc path. This camera is suitable for simple 3D navigation and is a default camera used by bitbybit.
     * Default inputs allow you to control most important camera properties. If you need to change other properties, you can use specific set methods.
     * @param inputs Describes the arc rotate camera
     * @returns BabylonJS arc rotate camera
     */
    create(inputs: Inputs.BabylonCamera.ArcRotateCameraDto): BABYLON.ArcRotateCamera {
        const target = new BABYLON.Vector3(inputs.target[0], inputs.target[1], inputs.target[2]);
        const camera = new BABYLON.ArcRotateCamera(
            `arcRotateCamera${Math.random()}`,
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
        let angle = BABYLON.Angle.FromDegrees(degrees).radians();
        if (degrees < 0) {
            angle = -angle;
        }
        return angle;
    }

}
