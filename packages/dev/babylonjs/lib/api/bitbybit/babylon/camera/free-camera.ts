import * as BABYLON from "@babylonjs/core";
import { uniqueName } from "../../../unique-name";
import { Context } from "../../../context";
import * as Inputs from "../../../inputs";

/**
 * The flying camera: it sits at a position, looks at a target and moves freely with the keyboard
 * and pointer, for walking through a scene rather than looking at one object.
 */
export class BabylonFreeCamera {

    constructor(
        private readonly context: Context,
    ) { }

    /**
     * Creates a camera at `position` looking at `target` that the keyboard and pointer fly around,
     * and adds it to the scene without activating it.
     * @param inputs - The position and the target
     * @returns The free camera
     * @group create
     * @shortname new free camera
     * @example
     * ```typescript
     * const camera = bitbybit.babylon.camera.free.create({ position: [20, 20, 20], target: [0, 0, 0] });
     * bitbybit.babylon.scene.activateCamera({ camera });
     * ```
     */
    create(inputs: Inputs.BabylonCamera.FreeCameraDto): BABYLON.FreeCamera {
        const pos = new BABYLON.Vector3(inputs.position[0], inputs.position[1], inputs.position[2]);
        const camera = new BABYLON.FreeCamera(uniqueName("freeCamera"),
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
