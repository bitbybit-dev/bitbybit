import { ManifoldWorkerManager } from "../../manifold-worker/manifold-worker-manager";
import { MeshOperations } from "./operations";
import { MeshEvaluate } from "./evaluate";

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
