import type { Base } from "../../inputs";

/**
 * A straight segment from the current point to `to`, which is a sketch point, or an offset from the
 * current point when `relative` is true.
 */
export interface SketchLineCommand {
    type: "line";
    id?: string;
    to: Base.Point2;
    relative?: boolean;
}

/**
 * A straight segment `length` along the sketch's x axis; a negative length runs the other way.
 */
export interface SketchHLineCommand {
    type: "hLine";
    id?: string;
    length: number;
}

/**
 * A straight segment `length` along the sketch's y axis; a negative length runs the other way.
 */
export interface SketchVLineCommand {
    type: "vLine";
    id?: string;
    length: number;
}

/**
 * A straight segment `length` long at `angle` degrees from the sketch's x axis, counterclockwise.
 */
export interface SketchPolarLineCommand {
    type: "polarLine";
    id?: string;
    length: number;
    angle: number;
}

/**
 * A straight segment `length` long that carries on in the direction the previous segment ended in.
 */
export interface SketchTangentLineCommand {
    type: "tangentLine";
    id?: string;
    length: number;
}

/**
 * A circular arc from the current point through `through` to `to`; with `relative` true both are
 * offsets from the current point.
 */
export interface SketchThreePointArcCommand {
    type: "threePointArc";
    id?: string;
    through: Base.Point2;
    to: Base.Point2;
    relative?: boolean;
}

/**
 * A circular arc to `to` that leaves the current point in the direction the previous segment ended
 * in.
 */
export interface SketchTangentArcCommand {
    type: "tangentArc";
    id?: string;
    to: Base.Point2;
    relative?: boolean;
}

/**
 * A circular arc to `to` whose middle stands `sagitta` away from the straight line between its ends:
 * a positive sagitta bulges to the left of the direction of travel, a negative one to the right.
 */
export interface SketchSagittaArcCommand {
    type: "sagittaArc";
    id?: string;
    to: Base.Point2;
    sagitta: number;
    relative?: boolean;
}

/**
 * A circular arc to `to` given by its bulge, as DXF files write arcs: the tangent of a quarter of the
 * angle it sweeps, positive counterclockwise.
 */
export interface SketchBulgeArcCommand {
    type: "bulgeArc";
    id?: string;
    to: Base.Point2;
    bulge: number;
    relative?: boolean;
}

/**
 * A quadratic Bezier segment to `to`, pulled toward `control`.
 */
export interface SketchQuadraticCommand {
    type: "quadratic";
    id?: string;
    control: Base.Point2;
    to: Base.Point2;
    relative?: boolean;
}

/**
 * A cubic Bezier segment to `to`, leaving toward `control1` and arriving from `control2`.
 */
export interface SketchCubicCommand {
    type: "cubic";
    id?: string;
    control1: Base.Point2;
    control2: Base.Point2;
    to: Base.Point2;
    relative?: boolean;
}

/**
 * A straight segment back to the start point, which closes the outline; when the pen is already
 * there, it only closes it.
 */
export interface SketchCloseCommand {
    type: "close";
    id?: string;
}

/**
 * Rounds the corner where the segment before it meets the segment after it with an arc of `radius`;
 * after `close`, the corner at the start point.
 */
export interface SketchFilletCornerCommand {
    type: "filletCorner";
    id?: string;
    radius: number;
}

/**
 * Bevels the corner where the segment before it meets the segment after it, cutting `distance` off
 * each, measured along the segments; after `close`, the corner at the start point.
 */
export interface SketchChamferCornerCommand {
    type: "chamferCorner";
    id?: string;
    distance: number;
}

/**
 * One move of the pen that `sketch.pen` draws: a line, an arc, a Bezier segment, closing the outline,
 * or rounding or beveling a corner. `type` says which; `id` names the command in the segments
 * `sketch.penWithSegments` reports.
 */
export type SketchCommand =
    | SketchLineCommand
    | SketchHLineCommand
    | SketchVLineCommand
    | SketchPolarLineCommand
    | SketchTangentLineCommand
    | SketchThreePointArcCommand
    | SketchTangentArcCommand
    | SketchSagittaArcCommand
    | SketchBulgeArcCommand
    | SketchQuadraticCommand
    | SketchCubicCommand
    | SketchCloseCommand
    | SketchFilletCornerCommand
    | SketchChamferCornerCommand;

/**
 * The edges one command drew: `id` is the command's own id, or its position in the list as text when
 * it has none, `command` is that position, and `edges` are edge indexes as `shapes.edge.getEdges`
 * counts them on the result.
 */
export interface SketchSegment {
    id: string;
    command: number;
    edges: number[];
}

/**
 * An outline `sketch.penWithSegments` drew, with the edges each command drew; commands that drew
 * nothing, such as a `close` where the pen already was, are left out.
 */
export interface SketchWithSegments<T> {
    shape: T;
    segments: SketchSegment[];
}
