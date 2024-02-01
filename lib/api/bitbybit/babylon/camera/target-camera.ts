import * as BABYLON from "@babylonjs/core";
import { Context } from "../../../context";
import * as Inputs from "../../../inputs/inputs";

export class BabylonTargetCamera {

    constructor(
        private readonly context: Context,
    ) { }

    /**
     * Creates a target camera
     * @param inputs Describes the target camera
     * @returns BabylonJS target camera
     */
    create(inputs: Inputs.BabylonCamera.TargetCameraDto): BABYLON.TargetCamera {
        const pos = new BABYLON.Vector3(inputs.position[0], inputs.position[1], inputs.position[2]);
        const camera = new BABYLON.TargetCamera(`freeCamera${Math.random()}`,
            pos,
            this.context.scene
        );
        const target = new BABYLON.Vector3(inputs.target[0], inputs.target[1], inputs.target[2]);
        camera.setTarget(target);
        const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
        camera.attachControl(canvas, true);
        camera.minZ = 0;
        camera.maxZ = 1000;
        return camera;
    }

}
