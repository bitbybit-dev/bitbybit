
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
        if (inputs.url) {
            const gs = BABYLON.SceneLoader.ImportMeshAsync(null, inputs.url, undefined, this.context.scene, undefined, ".ply").then((result) => {
                const gaussianSplattingMesh = result.meshes[0] as BABYLON.GaussianSplattingMesh;
                gaussianSplattingMesh.name = `gaussian-splatting-${Math.random()}`;
                return gaussianSplattingMesh;
            });
            return gs;
        }
        else {
            return undefined;
        }
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

    /**
     * Gets splat positions of the gaussian splat mesh
     * @param inputs Contains BabylonJS mesh
     * @group get
     * @shortname get splat positions
     * @drawable true
     */
    getSplatPositions(inputs: Inputs.BabylonGaussianSplatting.GaussianSplattingMeshDto): Inputs.Base.Point3[] {
        const data = (inputs.babylonMesh as any)._splatPositions;
        const points: Inputs.Base.Point3[] = [];
        for (let i = 0; i < data.length; i += 3) {
            points.push([data[i], data[i + 1], data[i + 2]]);
        }
        return points;
    }
}

