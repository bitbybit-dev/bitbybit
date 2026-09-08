
import { uniqueName } from "../../unique-name";
import * as BABYLON from "@babylonjs/core";
import { Context } from "../../context";
import * as Inputs from "../../inputs";

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
                gaussianSplattingMesh.name = uniqueName("gaussian-splatting");
                this.enableShadows(gaussianSplattingMesh);
                return gaussianSplattingMesh;
            });
            return gs;
        }
        else {
            return undefined as unknown as BABYLON.GaussianSplattingMesh;
        }
    }

    /** Clones gaussian splatting mesh
     * @param inputs Contains BabylonJS mesh that should be cloned
     * @group multiply
     * @shortname clone splat
     * @disposableOutput true
     */
    clone(inputs: Inputs.BabylonGaussianSplatting.GaussianSplattingMeshDto): BABYLON.GaussianSplattingMeshBase {
        return inputs.babylonMesh.clone(uniqueName("gaussian-splatting"));
    }

    /**
     * Gets splat positions of the gaussian splat mesh. The engine holds one centre per splat as
     * four floats - x, y, z and a fourth it depth-sorts by - so only three of every four are a point.
     * @param inputs Contains BabylonJS mesh
     * @group get
     * @shortname get splat positions
     * @drawable true
     */
    getSplatPositions(inputs: Inputs.BabylonGaussianSplatting.GaussianSplattingMeshDto): Inputs.Base.Point3[] {
        const data = (inputs.babylonMesh as any)._splatPositions as Float32Array | null;
        const points: Inputs.Base.Point3[] = [];
        if (!data) {
            return points;
        }
        for (let i = 0; i + 2 < data.length; i += 4) {
            points.push([data[i]!, data[i + 1]!, data[i + 2]!]);
        }
        return points;
    }

    private enableShadows(mesh: BABYLON.Mesh) {
        if (this.context.scene.metadata.shadowGenerators) {
            mesh.receiveShadows = true;
            const sgs = this.context.scene.metadata.shadowGenerators as BABYLON.ShadowGenerator[];
            sgs.forEach(s => {
                s.addShadowCaster(mesh);
            });
        }
    }

}

