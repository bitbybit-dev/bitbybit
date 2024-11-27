import { ManifoldWorkerManager } from "../../manifold-worker/manifold-worker-manager";
import * as Inputs from "@bitbybit-dev/manifold/lib/api/inputs";

/**
 * Contains various functions for Solid meshes from Manifold library https://github.com/elalish/manifold
 * Thanks Manifold community for developing this kernel
 */
export class CrossSectionOperations {

    constructor(
        private readonly manifoldWorkerManager: ManifoldWorkerManager,
    ) { }

    /**
     * Compute convex hull for the cross section
     * @param inputs cross section
     * @returns hulled cross section
     * @group basic
     * @shortname hull
     * @drawable true
     */
    async hull(inputs: Inputs.Manifold.CrossSectionDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("crossSection.operations.hull", inputs);
    }
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
     * Offsets the cross section to create a new cross section with a given delta (uses Clipper2 algorithm behind).
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
     *
     * It is recommended to apply this function following Offset, in order to
     * clean up any spurious tiny line segments introduced that do not improve
     * quality in any meaningful way. This is particularly important if further
     * offseting operations are to be performed, which would compound the issue.
     * @param inputs cross section and epsilon parameters
     * @returns simplified cross section
     * @group basic
     * @shortname simplify
     * @drawable true
     */
    async simplify(inputs: Inputs.Manifold.SimplifyDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("crossSection.operations.simplify", inputs);
    }

    /**
     * Composes multiple cross sections or polygons into a single cross section
     * @param inputs cross sections or polygons
     * @returns composed cross section
     * @group composition
     * @shortname compose
     * @drawable true
     */
    async compose(inputs: Inputs.Manifold.ComposeDto<(Inputs.Manifold.CrossSectionPointer | Inputs.Base.Vector2[])[]>): Promise<Inputs.Manifold.CrossSectionPointer> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("crossSection.operations.compose", inputs);
    }

    /**
     * Decompose cross sections that are topologically
     * disconnected, each containing one outline contour with zero or more
     * holes.
     * @param inputs cross section
     * @returns decomposed cross sections
     * @group composition
     * @shortname decompose
     * @drawable true
     */
    async decompose(inputs: Inputs.Manifold.CrossSectionDto<Inputs.Manifold.CrossSectionPointer>): Promise<Inputs.Manifold.CrossSectionPointer[]> {
        return this.manifoldWorkerManager.genericCallToWorkerPromise("crossSection.operations.decompose", inputs);
    }
}
