import * as Inputs from "../../inputs/manifold-inputs";
import * as Manifold3D from "manifold-3d";

/**
 * Contains various functions for Solid meshes from Manifold library https://github.com/elalish/manifold
 * Thanks Manifold community for developing this kernel
 */
export class CrossSectionOperations {

    private manifold: Manifold3D.ManifoldToplevel;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.manifold = wasm;
    }

    /**
     * Compute convex hull for the cross section
     * @param inputs cross section
     * @returns hulled cross section
     * @group basic
     * @shortname hull
     * @drawable true
     */
    hull(inputs: Inputs.Manifold.CrossSectionDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.hull();
    }

    /**
     * Extrude the cross section to create a 3D shape
     * @param inputs cross section and extrusion parameters
     * @returns extruded manifold shape
     * @group basic
     * @shortname extrude
     * @drawable true
     */
    extrude(inputs: Inputs.Manifold.ExtrudeDto<Manifold3D.CrossSection>): Manifold3D.Manifold {
        return inputs.crossSection.extrude(inputs.height, inputs.nDivisions, inputs.twistDegrees, [inputs.scaleTopX, inputs.scaleTopY], inputs.center);
    }

    /**
     * Revolve the cross section to create a 3D shape
     * @param inputs cross section and extrusion parameters
     * @returns extruded manifold shape
     * @group basic
     * @shortname revolve
     * @drawable true
     */
    revolve(inputs: Inputs.Manifold.RevolveDto<Manifold3D.CrossSection>): Manifold3D.Manifold {
        const res = inputs.crossSection.revolve(inputs.circularSegments, inputs.revolveDegrees);
        if (inputs.matchProfile) {
            // Manifold revolves around Y-axis then sets it as Z-axis
            // We need to rotate -90 degrees around X to make Y point up correctly
            return res.rotate([-90, 0, 0]);
        } else {
            return res;
        }
    }

    /**
     * Offsets the cross section to create a new cross section with a given delta (uses Clipper2 algorithm behind).
     * @param inputs cross section and offset parameters
     * @returns offset cross section
     * @group basic
     * @shortname offset
     * @drawable true
     */
    offset(inputs: Inputs.Manifold.OffsetDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.offset(inputs.delta, inputs.joinType as Manifold3D.JoinType, inputs.miterLimit, inputs.circularSegments);
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
    simplify(inputs: Inputs.Manifold.SimplifyDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.simplify(inputs.epsilon);
    }

    /**
     * Composes multiple cross sections or polygons into a single cross section
     * @param inputs cross sections or polygons
     * @returns composed cross section
     * @group composition
     * @shortname compose
     * @drawable true
     */
    compose(inputs: Inputs.Manifold.ComposeDto<(Manifold3D.CrossSection | Manifold3D.Polygons)[]>): Manifold3D.CrossSection {
        const { CrossSection } = this.manifold;
        const { compose } = CrossSection;
        return compose(inputs.polygons);
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
    decompose(inputs: Inputs.Manifold.CrossSectionDto<Manifold3D.CrossSection>): Manifold3D.CrossSection[] {
        return inputs.crossSection.decompose();
    }
}
