import { ArcRotateCamera, Vector3 } from '@babylonjs/core';
import { Context } from '../../../context';
import * as Inputs from '../../../inputs/inputs';

export class BabylonArcRotateCamera {

    constructor(
        private readonly context: Context,
    ) { }

    /**
     * Creates a arc rotate camera
     * <div>
     *  <img src="../assets/images/blockly-images/babylon/camera/create.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_babylon_camera.BabylonCamera.html#create
     * @param inputs Describes the arc rotate camera
     * @returns BabylonJS arc rotate camera
     */
    create(inputs: Inputs.BabylonCamera.ArcRotateCameraDto): ArcRotateCamera {
        const target = new Vector3(inputs.target[0], inputs.target[1], inputs.target[2]);
        const camera = new ArcRotateCamera(`arcRotateCamera${Math.random()}`, inputs.alpha, inputs.beta, inputs.radius, target,
            this.context.scene
        );
        const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
        camera.attachControl(canvas, true);
        return camera;
    }

}
