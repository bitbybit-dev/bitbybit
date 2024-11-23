
import { ManifoldWorkerManager } from "../../../workers/manifold/manifold-worker-manager";
import * as Inputs from "../../inputs/inputs";

/**
 * Contains various functions for Solid meshes from Manifold library https://github.com/elalish/manifold
 * Thanks Manifold community for developing this kernel
 */
export class ManifoldOperations {

    constructor(
        private readonly manifoldWorkerManager: ManifoldWorkerManager,

    ) { }

    /**
     * Computes convex hull of the manifold shape provided
     * @param inputs two shapes
     * @returns hulled manifold shape
     * @group hulls
     * @shortname convex hull
     * @drawable true
     */
    async hull(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("operations.hull", inputs);
    }

}
