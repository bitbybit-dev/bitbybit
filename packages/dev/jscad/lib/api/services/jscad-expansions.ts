import * as Inputs from "../inputs/jscad-inputs";
import * as JSCAD from "@jscad/modeling";
import { asEntity, asKind, oneOrMany } from "./entity-narrowing";

/**
 * Growing and shrinking JSCAD geometry by a distance: `expand` moves every boundary outward, or
 * inward for a negative distance, and `offset` builds the outline at that distance. Both work on
 * flat 2D shapes and paths and shape their corners as `corners` says; `expand` also grows solids,
 * with round corners only.
 */
export class JSCADExpansions {

    constructor(
        private readonly jscad: typeof JSCAD,
    ) { }

    /**
     * Grows geometry by moving its whole boundary outward by `delta`, or shrinks it when `delta` is
     * negative.
     *
     * A 2D shape stays a 2D shape, a path becomes a 2D band of that width around it, and a solid
     * grows into a bigger solid, with round corners and a positive `delta` only. Corners are
     * rounded when `corners` is left out.
     * @param inputs - The geometry, the distance, the corner style and the segments for round corners
     * @returns The grown or shrunk geometry
     * @group expansion
     * @shortname expand
     * @drawable true
     * @example
     * ```typescript
     * const square = await bitbybit.jscad.polygon.square({ center: [0, 0], size: 10 });
     * const grown = await bitbybit.jscad.expansions.expand({ geometry: square, delta: 1, corners: Bit.Inputs.JSCAD.solidCornerTypeEnum.round, segments: 16 });
     * ```
     */
    expand(inputs: Inputs.JSCAD.ExpansionDto): Inputs.JSCAD.JSCADEntity {
        const geometry = asKind<Inputs.JSCAD.JSCADGeom2>(oneOrMany(inputs.geometry));
        if (!inputs.corners) {
            inputs.corners = Inputs.JSCAD.solidCornerTypeEnum.round;
        }
        const result = this.jscad.expansions.expand({
            delta: inputs.delta,
            corners: inputs.corners,
            segments: inputs.segments,
        }, ...geometry);
        return asEntity(result);
    }

    /**
     * Builds the outline of a 2D shape or path at distance `delta` from the original, outward for
     * positive and inward for negative.
     *
     * A 2D shape gives a bigger or smaller 2D shape and a path gives a parallel path. When
     * `corners` is left out, corners are kept sharp.
     * @param inputs - The 2D shape or path, the distance, the corner style and the segments for round corners
     * @returns The offset 2D shape or path
     * @group expansion
     * @shortname offset
     * @drawable true
     * @example
     * ```typescript
     * const path = await bitbybit.jscad.path.createFromPoints({ points: [[0, 0], [10, 0], [10, 10]], closed: false });
     * const parallel = await bitbybit.jscad.expansions.offset({ geometry: path, delta: 1, corners: Bit.Inputs.JSCAD.solidCornerTypeEnum.edge, segments: 16 });
     * ```
     */
    offset(inputs: Inputs.JSCAD.ExpansionDto): Inputs.JSCAD.JSCADEntity {
        const geometry = asKind<Inputs.JSCAD.JSCADGeom2>(oneOrMany(inputs.geometry));
        if (!inputs.corners) {
            inputs.corners = Inputs.JSCAD.solidCornerTypeEnum.edge;
        }
        const result = this.jscad.expansions.offset({
            delta: inputs.delta,
            corners: inputs.corners,
            segments: inputs.segments,
        }, ...geometry);
        return asEntity(result);
    }
}
