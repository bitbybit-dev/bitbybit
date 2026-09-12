import * as Inputs from "../../inputs/manifold-inputs";
import * as Manifold3D from "manifold-3d";

/**
 * Working with Manifold cross-sections beyond booleans: turning them into solids by extruding along
 * Z or revolving, offsetting their outlines, wrapping them in a convex hull, simplifying them, and
 * composing and decomposing them. Every method returns a new shape.
 */
export class CrossSectionOperations {

    private manifold: Manifold3D.ManifoldToplevel;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.manifold = wasm;
    }

    /**
     * Wraps a cross-section in its convex hull, the smallest outline without dents that contains
     * it, like a rubber band stretched around it.
     * @param inputs - The cross-section
     * @returns The convex hull
     * @group basic
     * @shortname hull
     * @drawable true
     * @example
     * ```typescript
     * const wrapped = await bitbybit.manifold.crossSection.operations.hull({ crossSection: outline });
     * ```
     */
    hull(inputs: Inputs.Manifold.CrossSectionDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.hull();
    }

    /**
     * Sweeps a cross-section along Z into a solid of the given height.
     *
     * `twistDegrees` turns the top against the bottom, `scaleTopX` and `scaleTopY` shrink or grow
     * it, and `nDivisions` adds sections in between so twists and tapers stay smooth; 0 for both
     * top scales makes a cone. `center` centers the solid on the XY plane instead of standing it on
     * it.
     * @param inputs - The cross-section, the height, the divisions, the twist in degrees, the top scale and whether to center it
     * @returns The extruded solid
     * @group basic
     * @shortname extrude
     * @drawable true
     * @example
     * ```typescript
     * const twisted = await bitbybit.manifold.crossSection.operations.extrude({ crossSection: square, height: 20, nDivisions: 20, twistDegrees: 90, scaleTopX: 0.5, scaleTopY: 0.5, center: false });
     * ```
     */
    extrude(inputs: Inputs.Manifold.ExtrudeDto<Manifold3D.CrossSection>): Manifold3D.Manifold {
        return inputs.crossSection.extrude(inputs.height, inputs.nDivisions, inputs.twistDegrees, [inputs.scaleTopX, inputs.scaleTopY], inputs.center);
    }

    /**
     * Spins a cross-section around the Y axis into a solid, like a lathe; only the part of the
     * outline on the positive X side is used.
     *
     * `revolveDegrees` below 360 gives a partial turn and `circularSegments` sets how round the
     * result is. The kernel stands the result along Z; `matchProfile`, true by default, turns it
     * back to match the profile.
     * @param inputs - The cross-section, the angle in degrees, the number of segments and whether to match the profile
     * @returns The revolved solid
     * @group basic
     * @shortname revolve
     * @drawable true
     * @example
     * ```typescript
     * const vase = await bitbybit.manifold.crossSection.operations.revolve({ crossSection: profile, revolveDegrees: 360, circularSegments: 64, matchProfile: true });
     * ```
     */
    revolve(inputs: Inputs.Manifold.RevolveDto<Manifold3D.CrossSection>): Manifold3D.Manifold {
        const res = inputs.crossSection.revolve(inputs.circularSegments, inputs.revolveDegrees);
        if (inputs.matchProfile) {
            return res.rotate([-90, 0, 0]);
        } else {
            return res;
        }
    }

    /**
     * Moves the outline of a cross-section outward by `delta`, or inward for a negative delta, so
     * an outer contour grows and a hole shrinks.
     *
     * `joinType` says how corners are treated: rounded, squared off, mitered or beveled;
     * `miterLimit` caps how far a miter may reach and `circularSegments` how round a rounded corner
     * is. `simplify` afterwards cleans up tiny segments.
     * @param inputs - The cross-section, the distance, the corner treatment and its settings
     * @returns The offset cross-section
     * @group basic
     * @shortname offset
     * @drawable true
     * @example
     * ```typescript
     * const bigger = await bitbybit.manifold.crossSection.operations.offset({ crossSection: outline, delta: 1, joinType: Bit.Inputs.Manifold.manifoldJoinTypeEnum.round, miterLimit: 2, circularSegments: 32 });
     * ```
     */
    offset(inputs: Inputs.Manifold.OffsetDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.offset(inputs.delta, inputs.joinType as Manifold3D.JoinType, inputs.miterLimit, inputs.circularSegments);
    }

    /**
     * Removes points of a cross-section that lie within `epsilon` of the line between their
     * neighbors, dropping near-duplicates and collinear points.
     *
     * A larger epsilon removes more; run it after `offset` to clean up the tiny segments offsetting
     * leaves behind.
     * @param inputs - The cross-section and the distance below which a point is dropped
     * @returns The simplified cross-section
     * @group basic
     * @shortname simplify
     * @drawable true
     * @example
     * ```typescript
     * const cleaner = await bitbybit.manifold.crossSection.operations.simplify({ crossSection: offsetOutline, epsilon: 1e-4 });
     * ```
     */
    simplify(inputs: Inputs.Manifold.SimplifyDto<Manifold3D.CrossSection>): Manifold3D.CrossSection {
        return inputs.crossSection.simplify(inputs.epsilon);
    }

    /**
     * Packs several cross-sections or polygons into one cross-section without fusing them, the
     * inverse of `decompose`.
     * @param inputs - The cross-sections or polygons to pack together
     * @returns One cross-section holding all of them
     * @group composition
     * @shortname compose
     * @drawable true
     * @example
     * ```typescript
     * const packed = await bitbybit.manifold.crossSection.operations.compose({ polygons: [square, disc] });
     * ```
     */
    compose(inputs: Inputs.Manifold.ComposeDto<(Manifold3D.CrossSection | Manifold3D.Polygons)[]>): Manifold3D.CrossSection {
        const { CrossSection } = this.manifold;
        const { compose } = CrossSection;
        return compose(inputs.polygons);
    }

    /**
     * Splits a cross-section into its separate, unconnected outlines, each with its own holes, the
     * inverse of `compose`.
     * @param inputs - The cross-section
     * @returns The separate outlines
     * @group composition
     * @shortname decompose
     * @drawable true
     * @example
     * ```typescript
     * const pieces = await bitbybit.manifold.crossSection.operations.decompose({ crossSection: packed });
     * ```
     */
    decompose(inputs: Inputs.Manifold.CrossSectionDto<Manifold3D.CrossSection>): Manifold3D.CrossSection[] {
        return inputs.crossSection.decompose();
    }
}
