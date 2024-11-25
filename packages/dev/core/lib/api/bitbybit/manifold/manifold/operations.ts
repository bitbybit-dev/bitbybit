
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
     * Hull points
     * @param inputs manifold
     * @returns manifold
     * @group hulls
     * @shortname hull points
     * @drawable true
     */
    hullPoints(inputs: Inputs.Manifold.HullPointsDto<(Inputs.Base.Point3 | Inputs.Manifold.ManifoldPointer)[]>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.operations.hullPoints", inputs);
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

    /**
     * Set tolerance of the manifold
     * @param inputs manifold and tolerance
     * @returns manifold with new tolerance
     * @group basic
     * @shortname set tolerance
     * @drawable false
     */
    async setTolerance(inputs: Inputs.Manifold.ManifoldToleranceDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.operations.setTolerance", inputs);
    }

    /**
     * Returns the first of n sequential new unique mesh IDs for marking sets of triangles that can be looked up after further operations. Assign to Mesh.runOriginalID vector.
     * @param inputs count
     * @returns void
     * @group basic
     * @shortname reserve id
     * @drawable false
     */
    async reserveIds(inputs: Inputs.Manifold.CountDto): Promise<number> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.operations.reserveIds", inputs);
    }

    /**
     * Get the original manifold
     * @param inputs manifold
     * @returns original manifold
     * @group basic
     * @shortname as original
     * @drawable true
     */
    async asOriginal(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.operations.asOriginal", inputs);
    }

    /**
     * Composes multiple manifolds into a single manifold
     * @param inputs manifold shapes
     * @returns composed manifold
     * @group composition
     * @shortname compose
     * @drawable true
     */
    async compose(inputs: Inputs.Manifold.ManifoldsDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.operations.compose", inputs);
    }

    /**
     * Decompose manifold that are topologically disconnected
     * @param inputs manifold
     * @returns decomposed manifold shapes
     * @group composition
     * @shortname decompose
     * @drawable true
     */
    async decompose(inputs: Inputs.Manifold.ManifoldDto<Inputs.Manifold.ManifoldPointer>): Promise<Inputs.Manifold.ManifoldPointer[]> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("manifold.operations.decompose", inputs);
    }

}
