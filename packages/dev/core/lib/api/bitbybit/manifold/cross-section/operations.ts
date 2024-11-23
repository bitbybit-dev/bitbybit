
import { ManifoldWorkerManager } from "../../../../workers/manifold/manifold-worker-manager";
import * as Inputs from "../../../inputs/inputs";

/**
 * Contains various functions for Solid meshes from Manifold library https://github.com/elalish/manifold
 * Thanks Manifold community for developing this kernel
 */
export class CrossSectionOperations {

    constructor(
        private readonly manifoldWorkerManager: ManifoldWorkerManager,
    ) { }

    /**
     * Extrude the cross section to create a 3D shape
     * @param inputs cross section and extrusion parameters
     * @returns extruded manifold shape
     * @group basic
     * @shortname extrude
     * @drawable true
     */
    async extrude(inputs: Inputs.Manifold.ExtrudeDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("crossSection.operations.extrude", inputs);
    }

    /**
     * Revolve the cross section to create a 3D shape
     * @param inputs cross section and extrusion parameters
     * @returns extruded manifold shape
     * @group basic
     * @shortname revolve
     * @drawable true
     */
    async revolve(inputs: Inputs.Manifold.RevolveDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.ManifoldPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("crossSection.operations.revolve", inputs);
    }

    /**
     * Offsets the cross section to create a new cross section with a given delta (uses Clipper2 algorithm behind)
     * @param inputs cross section and offset parameters
     * @returns offset cross section
     * @group basic
     * @shortname offset
     * @drawable true
     */
    async offset(inputs: Inputs.Manifold.OffsetDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("crossSection.operations.offset", inputs);
    }

    /**
     * Remove vertices from the contours in this CrossSection that are less than
     * the specified distance epsilon from an imaginary line that passes through
     * its two adjacent vertices. Near duplicate vertices and collinear points
     * will be removed at lower epsilons, with elimination of line segments
     * becoming increasingly aggressive with larger epsilons.
     * @param inputs cross section and epsilon parameters
     * @returns simplified cross section
     * @group basic
     * @shortname simplify
     * @drawable true
     */
    async simplify(inputs: Inputs.Manifold.SimplifyDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("crossSection.operations.simplify", inputs);
    }
}
