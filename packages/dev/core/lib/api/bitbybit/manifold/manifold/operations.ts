
import { ManifoldWorkerManager } from "../../../../workers/manifold/manifold-worker-manager";
import * as Inputs from "../../../inputs/inputs";

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
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.operations.hull", inputs);
    }

    /**
     * Creates a slice cross section of the manifold on the given height
     * @param inputs manifold and height
     * @returns sliced cross section
     * @group cross sections
     * @shortname slice
     * @drawable true
     */
    async slice(inputs: Inputs.Manifold.SliceDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.CrossSectionPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.operations.slice", inputs);
    }
        
    /**
     * Creates a projection on xy plane from the shape outline
     * @param inputs manifold
     * @returns projected cross section
     * @group cross sections
     * @shortname project
     * @drawable true
     */
    async project(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.CrossSectionPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.operations.project", inputs);
    }
}
