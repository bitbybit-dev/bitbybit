
import { ManifoldWorkerManager } from "../../../../workers/manifold/manifold-worker-manager";
import { MeshOperations } from "./operations";
import { MeshEvaluate } from "./evaluate";
import * as Inputs from "../../../inputs/inputs";
import * as Manifold3D from "manifold-3d";

/**
 * Contains various functions for Solid meshes from Manifold library https://github.com/elalish/manifold
 * Thanks Manifold community for developing this kernel
 */
export class Mesh {

    public readonly operations: MeshOperations;
    public readonly evaluate: MeshEvaluate;
    constructor(
        private readonly manifoldWorkerManager: ManifoldWorkerManager,
    ) {
        this.operations = new MeshOperations(manifoldWorkerManager);
        this.evaluate = new MeshEvaluate(manifoldWorkerManager);
    }

}
