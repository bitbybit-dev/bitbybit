import * as Inputs from "../../inputs/manifold-inputs";
import type * as Manifold3D from "manifold-3d";
import type { Base } from "@bitbybit-dev/base";
import { InputError, resolveDto } from "@bitbybit-dev/base";
import { isTransformMatrix, linearDeterminant } from "@bitbybit-dev/base/lib/api/services/helpers/matrices";
import { pathTangents, roundedPath3, sweepMatrices, transportedAxes } from "@bitbybit-dev/base/lib/api/services/helpers/paths";
import type * as Resolved from "../../resolved-inputs";
import { loftMesh } from "../recipes/recipe-loft";
import type { ProfileRings } from "../recipes/recipe-types";
import { DEGENERATE_DETERMINANT, FULL_TURN, MIN_CIRCLE_SIDES, MIN_LOFT_FRAMES, NO_DIRECTION } from "./cross-section.constants";

function isPlacing(frame: unknown): frame is Base.TransformMatrix {
    return isTransformMatrix(frame) && frame[3] === 0 && frame[7] === 0 && frame[11] === 0 && frame[15] === 1 && Math.abs(linearDeterminant(frame)) > DEGENERATE_DETERMINANT;
}

function distinctPoints(path: readonly Base.Point3[]): Base.Point3[] {
    return path.filter((point, at) => at === 0 || point.some((value, axis) => value !== path[at - 1]![axis]));
}

/**
 * Working with Manifold cross-sections beyond booleans: turning them into solids by extruding along
 * Z, revolving, lofting through frames or sweeping along a path, offsetting their outlines, wrapping
 * them in a convex hull, simplifying them, and composing and decomposing them. Every method returns a
 * new shape.
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
        const resolved = resolveDto(Inputs.Manifold.ExtrudeDto, inputs) as Resolved.Manifold.ExtrudeDto<Manifold3D.CrossSection>;
        return resolved.crossSection.extrude(resolved.height, resolved.nDivisions, resolved.twistDegrees, [resolved.scaleTopX, resolved.scaleTopY], resolved.center);
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
        const resolved = resolveDto(Inputs.Manifold.RevolveDto, inputs) as Resolved.Manifold.RevolveDto<Manifold3D.CrossSection>;
        const res = resolved.crossSection.revolve(resolved.circularSegments, resolved.revolveDegrees);
        if (resolved.matchProfile) {
            return res.rotate([-90, 0, 0]);
        } else {
            return res;
        }
    }

    /**
     * Joins cross-sections placed by frames into a solid, each section to the next by straight
     * sides, closed at both ends: a taper from one outline to another, or one outline through many
     * frames.
     *
     * Corner `i` of a section joins corner `i` of the next, so differing sections need matching loops;
     * frames move the sections apart, mirroring all or none.
     * @param inputs - The cross-sections, one or one per frame, and the frames that place them
     * @returns The lofted solid
     * @group basic
     * @shortname loft
     * @drawable true
     * @example
     * ```typescript
     * const square = await bitbybit.manifold.crossSection.shapes.square({ size: 2, center: true });
     * const solid = await bitbybit.manifold.crossSection.operations.loft({ crossSections: [square], frames: [[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], [0.5, 0, 0, 0, 0, 0.5, 0, 0, 0, 0, 1, 0, 0, 0, 4, 1]] });
     * ```
     */
    loft(inputs: Inputs.Manifold.LoftDto<Manifold3D.CrossSection>): Manifold3D.Manifold {
        const { crossSections, frames } = inputs;
        if (!Array.isArray(frames) || frames.length < MIN_LOFT_FRAMES) {
            throw new InputError(`A loft needs at least ${MIN_LOFT_FRAMES} frames`, "frames");
        }
        const wrong = frames.findIndex((frame) => !isPlacing(frame));
        if (wrong >= 0) {
            throw new InputError(`Frame ${wrong} is not sixteen numbers in column-major order with 0, 0, 0, 1 as the bottom row that place a plane without flattening it`, "frames");
        }
        const firstMirrors = linearDeterminant(frames[0]!) < 0;
        const turnedOver = frames.findIndex((frame) => linearDeterminant(frame) < 0 !== firstMirrors);
        if (turnedOver >= 0) {
            throw new InputError(`Frame ${turnedOver} turns the profile over where frame 0 does not, or the other way round: a loft's frames all mirror, or none do`, "frames");
        }
        if (!Array.isArray(crossSections) || (crossSections.length !== 1 && crossSections.length !== frames.length)) {
            throw new InputError(`A loft needs one cross-section, or one for each of its ${frames.length} frames`, "crossSections");
        }
        const sections: ProfileRings[] = crossSections.map((crossSection) => crossSection.toPolygons());
        return this.manifold.Manifold.ofMesh(loftMesh(this.manifold, sections, Float64Array.from(frames.flat()), undefined, "The loft"));
    }

    /**
     * Carries a cross-section along a path of points into a solid, square to the path at every
     * point and turning with it without twisting, like a pipe, a rail or a cable.
     *
     * Sharp corners are mitred so the solid keeps its width; `cornerRadius` rounds them instead.
     * `xDirection` sets where the profile's X axis points at the start.
     * @param inputs - The cross-section, the path, the corner radius and its segments, and the profile's starting X direction
     * @returns The swept solid
     * @group basic
     * @shortname sweep
     * @drawable true
     * @example
     * ```typescript
     * const ring = await bitbybit.manifold.crossSection.shapes.circle({ radius: 1, circularSegments: 32 });
     * const pipe = await bitbybit.manifold.crossSection.operations.sweep({ crossSection: ring, path: [[0, 0, 0], [10, 0, 0], [10, 10, 0], [10, 10, 10]], cornerRadius: 3, circularSegments: 32 });
     * ```
     */
    sweep(inputs: Inputs.Manifold.SweepDto<Manifold3D.CrossSection>): Manifold3D.Manifold {
        const resolved = resolveDto(Inputs.Manifold.SweepDto, inputs) as Resolved.Manifold.SweepDto<Manifold3D.CrossSection>;
        const path = Array.isArray(resolved.path) ? distinctPoints(resolved.path) : [];
        if (path.length < MIN_LOFT_FRAMES) {
            throw new InputError(`A sweep needs a path of at least ${MIN_LOFT_FRAMES} distinct points`, "path");
        }
        if (!Number.isSafeInteger(resolved.circularSegments) || resolved.circularSegments < MIN_CIRCLE_SIDES) {
            throw new InputError(`A rounded corner needs at least ${MIN_CIRCLE_SIDES} segments a turn, got ${resolved.circularSegments}`, "circularSegments");
        }
        const step = FULL_TURN / resolved.circularSegments;
        const points = resolved.cornerRadius > 0 ? roundedPath3(path, resolved.cornerRadius, (turn) => Math.ceil(turn / step)) : path;
        const tangents = pathTangents(points);
        const frames = sweepMatrices(points, tangents, transportedAxes(points, tangents, resolved.xDirection ?? NO_DIRECTION));
        return this.loft({ crossSections: [resolved.crossSection], frames });
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
        const resolved = resolveDto(Inputs.Manifold.OffsetDto, inputs) as Resolved.Manifold.OffsetDto<Manifold3D.CrossSection>;
        return resolved.crossSection.offset(resolved.delta, resolved.joinType as Manifold3D.JoinType, resolved.miterLimit, resolved.circularSegments);
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
        const resolved = resolveDto(Inputs.Manifold.SimplifyDto, inputs) as Resolved.Manifold.SimplifyDto<Manifold3D.CrossSection>;
        return resolved.crossSection.simplify(resolved.epsilon);
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
        return CrossSection.compose(inputs.polygons);
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
