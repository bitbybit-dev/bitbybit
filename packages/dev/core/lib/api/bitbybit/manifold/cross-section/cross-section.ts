
import { ManifoldWorkerManager } from "../../../../workers/manifold/manifold-worker-manager";
import { CrossSectionOperations } from "./operations";
import { CrossSectionShapes } from "./shapes";

/**
 * Contains various functions for Solid meshes from Manifold library https://github.com/elalish/manifold
 * Thanks Manifold community for developing this kernel
 */
export class ManifoldCrossSection{

    shapes: CrossSectionShapes;
    operations: CrossSectionOperations;

    constructor(
        private readonly manifoldWorkerManager: ManifoldWorkerManager,
    ) { 
        this.shapes = new CrossSectionShapes(manifoldWorkerManager);
        this.operations = new CrossSectionOperations(manifoldWorkerManager);
    }

}
