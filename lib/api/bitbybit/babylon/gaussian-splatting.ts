
import * as BABYLON from "@babylonjs/core";
import { Context } from "../../context";
import * as Inputs from "../../inputs/inputs";

export class BabylonGaussianSplatting {

    constructor(
        private readonly context: Context,
    ) { }

    /** Creates gaussian splatting mesh
     * @param inputs Contains url of Gaussian splatting mesh
     * @group create
     * @shortname gaussian splatting mesh
     * @disposableOutput true
     */
    async create(inputs: Inputs.BabylonGaussianSplatting.CreateGaussianSplattingMeshDto): Promise<BABYLON.GaussianSplattingMesh> {
        const gs = new BABYLON.GaussianSplattingMesh(`gaussian-splatting-${Math.random()}`, undefined, this.context.scene);
        const prom = new Promise((resolve, reject) => {
            gs.loadFileAsync(inputs.url).then(() => {
                setTimeout(() => {
                    // Timeout is needed to digest the scene with new asset, otherwise cloning and other splat commands do not work well.
                    resolve(gs);
                }, 0);
            }, (err) => { reject(err); });
        });
        await prom;
        return gs;
    }


    /** Clones gaussian splatting mesh
     * @param inputs Contains BabylonJS mesh that should be cloned
     * @group multiply
     * @shortname clone splat
     * @disposableOutput true
     */
    clone(inputs: Inputs.BabylonGaussianSplatting.GaussianSplattingMeshDto): BABYLON.GaussianSplattingMesh {
        return inputs.babylonMesh.clone(`gaussian-splatting-${Math.random()}`);
    }
}

