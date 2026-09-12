import * as BABYLON from "@babylonjs/core";
import { uniqueName } from "../../../unique-name";
import { Context } from "../../../context";
import * as Inputs from "../../../inputs";

/**
 * The fixed camera: it sits at a position looking at a target with no navigation controls of its
 * own, for views a script places itself.
 */
export class BabylonTargetCamera {

    constructor(
        private readonly context: Context,
    ) { }

    /**
     * Creates a camera at `position` looking at `target` with no navigation controls of its own,
     * and adds it to the scene without activating it.
     * @param inputs - The position and the target
     * @returns The target camera
     * @group create
     * @shortname new target camera
     * @example
     * ```typescript
     * const camera = bitbybit.babylon.camera.target.create({ position: [20, 20, 20], target: [0, 0, 0] });
     * bitbybit.babylon.scene.activateCamera({ camera });
     * ```
     */
    create(inputs: Inputs.BabylonCamera.TargetCameraDto): BABYLON.TargetCamera {
        const pos = new BABYLON.Vector3(inputs.position[0], inputs.position[1], inputs.position[2]);
        const camera = new BABYLON.TargetCamera(uniqueName("targetCamera"),
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
