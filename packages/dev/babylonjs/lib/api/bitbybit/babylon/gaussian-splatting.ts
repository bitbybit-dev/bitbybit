
import { uniqueName } from "../../unique-name";
import * as BABYLON from "@babylonjs/core";
import { Context } from "../../context";
import * as Inputs from "../../inputs";

/**
 * Gaussian splatting scenes, captured real-world environments stored as clouds of soft colored
 * blobs in `.ply` files, loaded into the scene as meshes that can be moved, cloned and shadowed
 * like any other.
 */
export class BabylonGaussianSplatting {

    constructor(
        private readonly context: Context,
    ) { }

    /**
     * Loads a Gaussian splatting `.ply` file from a URL into the scene as a mesh that casts and
     * receives shadows; nothing is loaded without a URL.
     * @param inputs - The URL of the file
     * @returns The splatting mesh
     * @group create
     * @shortname gaussian splatting mesh
     * @disposableOutput true
     * @example
     * ```typescript
     * const splat = await bitbybit.babylon.gaussianSplatting.create({ url: "https://example.com/scans/room.ply" });
     * ```
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

    /**
     * Makes a copy of a Gaussian splatting mesh that shares its splat data, so the same capture can
     * appear at several places cheaply.
     * @param inputs - The splatting mesh to copy
     * @returns The copy
     * @group multiply
     * @shortname clone splat
     * @disposableOutput true
     * @example
     * ```typescript
     * const copy = bitbybit.babylon.gaussianSplatting.clone({ babylonMesh: splat });
     * bitbybit.babylon.mesh.setPosition({ babylonMesh: copy, position: [10, 0, 0] });
     * ```
     */
    clone(inputs: Inputs.BabylonGaussianSplatting.GaussianSplattingMeshDto): BABYLON.GaussianSplattingMeshBase {
        return inputs.babylonMesh.clone(uniqueName("gaussian-splatting"));
    }

    /**
     * Reads the center point of every splat in a Gaussian splatting mesh, in its own coordinates;
     * the engine stores four numbers per splat and only the first three are the point. An unloaded
     * mesh gives an empty list.
     * @param inputs - The splatting mesh
     * @returns One point per splat
     * @group get
     * @shortname get splat positions
     * @drawable true
     * @example
     * ```typescript
     * const centers = bitbybit.babylon.gaussianSplatting.getSplatPositions({ babylonMesh: splat });
     * ```
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

