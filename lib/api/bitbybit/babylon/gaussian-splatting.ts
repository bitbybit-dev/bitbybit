
import * as BABYLON from "@babylonjs/core";
import { Context } from "../../context";
import * as Inputs from "../../inputs/inputs";

export class BabylonGaussianSplatting {

    constructor(
        private readonly context: Context,
    ) { }

    /** Creates gaussian splatting mesh
     * @param inputs Contains BabylonJS mesh that should be disposed
     * @group create
     * @shortname gaussian splatting mesh
     * @disposableOutput true
     */
    async create(inputs: Inputs.BabylonGaussianSplatting.CreateGaussianSplattingMeshDto): Promise<BABYLON.GaussianSplattingMesh> {
        const gs = new BABYLON.GaussianSplattingMesh(`gaussian-splatting-${Math.random()}`, undefined, this.context.scene);
        await gs.loadFileAsync(inputs.url);
        return gs;
    }
}

