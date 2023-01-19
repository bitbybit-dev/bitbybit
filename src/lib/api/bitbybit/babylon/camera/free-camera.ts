import { FreeCamera, Vector3 } from '@babylonjs/core';
import { Context } from '../../../context';
import * as Inputs from '../../../inputs/inputs';

export class BabylonFreeCamera {

    constructor(
        private readonly context: Context,
    ) { }

    /**
     * Creates a free camera
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/camera/create.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_camera.BabylonCamera.html#create
     * @param inputs Describes the free camera
     * @returns BabylonJS free camera
     */
    create(inputs: Inputs.BabylonCamera.FreeCameraDto): FreeCamera {
        const pos = new Vector3(inputs.position[0], inputs.position[1], inputs.position[2]);
        const camera = new FreeCamera(`freeCamera${Math.random()}`,
            pos,
            this.context.scene
        );
        const target = new Vector3(inputs.target[0], inputs.target[1], inputs.target[2]);
        camera.setTarget(target)
        const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
        camera.attachControl(canvas, true);
        camera.minZ = 0;
        camera.maxZ = 1000;
        return camera;
    }

}
