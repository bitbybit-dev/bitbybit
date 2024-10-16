
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
        const gs = BABYLON.SceneLoader.ImportMeshAsync(null, inputs.url, undefined, this.context.scene, undefined, ".ply").then((result) => {
            const gaussianSplattingMesh = result.meshes[0] as BABYLON.GaussianSplattingMesh;
            gaussianSplattingMesh.name = `gaussian-splatting-${Math.random()}`;
            return gaussianSplattingMesh;
        });
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

