
import { ManifoldWorkerManager } from "../../../../workers/manifold/manifold-worker-manager";
import { ManifoldShapes } from "./shapes";
import * as Inputs from "../../../inputs/inputs";
import { ManifoldBooleans } from "./booleans";
import * as Manifold3D from "manifold-3d";
import { ManifoldOperations } from "./operations";
import { ManifoldTransforms } from "./transforms";

/**
 * Contains various functions for Solid meshes from Manifold library https://github.com/elalish/manifold
 * Thanks Manifold community for developing this kernel
 */
export class Manifold {

    public readonly shapes: ManifoldShapes;
    public readonly booleans: ManifoldBooleans;
    public readonly operations: ManifoldOperations;
    public readonly transforms: ManifoldTransforms;

    constructor(
        private readonly manifoldWorkerManager: ManifoldWorkerManager,
    ) {
        this.shapes = new ManifoldShapes(manifoldWorkerManager);
        this.booleans = new ManifoldBooleans(manifoldWorkerManager);
        this.operations = new ManifoldOperations(manifoldWorkerManager);
        this.transforms = new ManifoldTransforms(manifoldWorkerManager);
    }

    /**
     * Turns manifold shape into a mesh
     * @param inputs Manifold shape
     * @returns Decomposed mesh definition
     * @group meshing
     * @shortname manifold to mesh
     * @drawable false
     */
    async manifoldToMesh(inputs: Inputs.Manifold.ManifoldToMeshDto<Inputs.Manifold.ManifoldPointer>): Promise<Manifold3D.Mesh> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.manifoldToMesh", inputs);
    }

    /**
     * Turns manifold shapes into meshes
     * @param inputs Manifold shapes
     * @returns Decomposed mesh definitions
     * @group meshing
     * @shortname manifolds to meshes
     * @drawable false
     */
    async manifoldsToMeshes(inputs: Inputs.Manifold.ManifoldsToMeshesDto<Inputs.Manifold.ManifoldPointer>): Promise<Manifold3D.Mesh[]> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.manifoldsToMeshes", inputs);
    }

}
