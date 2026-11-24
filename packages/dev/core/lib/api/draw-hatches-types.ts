import type * as Inputs from "./inputs";

/**
 * Triangles in one flat colour: `positions` holds three numbers a corner and `indices` three corners
 * a triangle. Without triangles both lists are empty.
 * @beta
 */
export interface FlatTriangles {
    /** The corners, three numbers each. */
    readonly positions: number[];
    /** Three indexes into `positions`, counted in corners, for each triangle. */
    readonly indices: number[];
}

/**
 * What a renderer draws of hatched regions in 3D, worked out once for all three: the regions of
 * pattern hatches filled as `faces`, the regions of solid hatches as `ink`, each region's outline
 * as closed polylines and each pattern line as a polyline of two points.
 * @beta
 */
export interface HatchesDrawing {
    /** The regions hatched with a pattern of lines, filled under the even-odd rule. */
    readonly faces: FlatTriangles;
    /** The regions hatched solid, filled under the even-odd rule. */
    readonly ink: FlatTriangles;
    /** The pattern lines clipped to their regions, each a start and an end point. */
    readonly lines: Inputs.Base.Point3[][];
    /** Every region's outlines, each closed by repeating its first point. */
    readonly outlines: Inputs.Base.Point3[][];
}
