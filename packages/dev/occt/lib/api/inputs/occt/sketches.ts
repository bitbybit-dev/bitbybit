import type { Base } from "@bitbybit-dev/base";
import type * as Models from "../../models";
import { joinTypeEnum } from "./enums";

/**
 * How `sketch.stroke` finishes the two ends of an open wire.
 * - `flat`: a straight cut across each end.
 * - `round`: a half circle around each end.
 * - `square`: a straight cut half the width past each end.
 */
export enum strokeCapEnum {
    flat = "flat",
    round = "round",
    square = "square"
}

/**
 * A point to draw a straight segment to, for `sketch.commands.line`, which makes the command
 * `sketch.pen` draws; the point is a sketch point, or an offset from the pen with `relative`.
 */
export class SketchLineDto {
    constructor(to?: Base.Point2, relative?: boolean, id?: string) {
        if (to !== undefined) { this.to = to; }
        if (relative !== undefined) { this.relative = relative; }
        if (id !== undefined) { this.id = id; }
    }
    /**
     * Where the segment ends, in the sketch's x and y.
     * @default [10, 0]
     */
    to?: Base.Point2 | undefined = [10, 0];
    /**
     * When true, `to` is an offset from where the pen is rather than a point of the sketch.
     * @default false
     */
    relative?: boolean | undefined = false;
    /**
     * A name for the command, reported with the edges it draws; leave it out to be named by position.
     * @default undefined
     * @optional true
     */
    id?: string | undefined;
}

/**
 * A length to draw along the sketch's x axis, for `sketch.commands.hLine`, which makes the command
 * `sketch.pen` draws; a negative length draws to the left.
 */
export class SketchHLineDto {
    constructor(length?: number, id?: string) {
        if (length !== undefined) { this.length = length; }
        if (id !== undefined) { this.id = id; }
    }
    /**
     * How far to draw along the sketch's x axis, in model units; negative draws the other way.
     * @default 10
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    length?: number | undefined = 10;
    /**
     * A name for the command, reported with the edges it draws; leave it out to be named by position.
     * @default undefined
     * @optional true
     */
    id?: string | undefined;
}

/**
 * A length to draw along the sketch's y axis, for `sketch.commands.vLine`, which makes the command
 * `sketch.pen` draws; a negative length draws downward.
 */
export class SketchVLineDto {
    constructor(length?: number, id?: string) {
        if (length !== undefined) { this.length = length; }
        if (id !== undefined) { this.id = id; }
    }
    /**
     * How far to draw along the sketch's y axis, in model units; negative draws the other way.
     * @default 10
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    length?: number | undefined = 10;
    /**
     * A name for the command, reported with the edges it draws; leave it out to be named by position.
     * @default undefined
     * @optional true
     */
    id?: string | undefined;
}

/**
 * A length and an angle to draw at, for `sketch.commands.polarLine`, which makes the command
 * `sketch.pen` draws; the angle is measured from the sketch's x axis, counterclockwise.
 */
export class SketchPolarLineDto {
    constructor(length?: number, angle?: number, id?: string) {
        if (length !== undefined) { this.length = length; }
        if (angle !== undefined) { this.angle = angle; }
        if (id !== undefined) { this.id = id; }
    }
    /**
     * How far to draw, in model units; negative draws the opposite way.
     * @default 10
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    length?: number | undefined = 10;
    /**
     * The direction to draw in, in degrees from the sketch's x axis, counterclockwise.
     * @default 45
     * @minimum -Infinity
     * @maximum Infinity
     * @step 15
     */
    angle?: number | undefined = 45;
    /**
     * A name for the command, reported with the edges it draws; leave it out to be named by position.
     * @default undefined
     * @optional true
     */
    id?: string | undefined;
}

/**
 * A length to carry on straight for, for `sketch.commands.tangentLine`, which makes the command
 * `sketch.pen` draws in the direction the previous segment ended in.
 */
export class SketchTangentLineDto {
    constructor(length?: number, id?: string) {
        if (length !== undefined) { this.length = length; }
        if (id !== undefined) { this.id = id; }
    }
    /**
     * How far to carry on, in model units.
     * @default 10
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 1
     */
    length?: number | undefined = 10;
    /**
     * A name for the command, reported with the edges it draws; leave it out to be named by position.
     * @default undefined
     * @optional true
     */
    id?: string | undefined;
}

/**
 * A point to pass through and a point to end at, for `sketch.commands.threePointArc`, which makes
 * the circular arc command `sketch.pen` draws from where the pen is.
 */
export class SketchThreePointArcDto {
    constructor(through?: Base.Point2, to?: Base.Point2, relative?: boolean, id?: string) {
        if (through !== undefined) { this.through = through; }
        if (to !== undefined) { this.to = to; }
        if (relative !== undefined) { this.relative = relative; }
        if (id !== undefined) { this.id = id; }
    }
    /**
     * A point the arc passes through between its ends, in the sketch's x and y.
     * @default [5, 5]
     */
    through?: Base.Point2 | undefined = [5, 5];
    /**
     * Where the arc ends, in the sketch's x and y.
     * @default [10, 0]
     */
    to?: Base.Point2 | undefined = [10, 0];
    /**
     * When true, `through` and `to` are offsets from where the pen is rather than points of the sketch.
     * @default false
     */
    relative?: boolean | undefined = false;
    /**
     * A name for the command, reported with the edges it draws; leave it out to be named by position.
     * @default undefined
     * @optional true
     */
    id?: string | undefined;
}

/**
 * A point to end at, for `sketch.commands.tangentArc`, which makes the command `sketch.pen` draws: a
 * circular arc leaving in the direction the previous segment ended in.
 */
export class SketchTangentArcDto {
    constructor(to?: Base.Point2, relative?: boolean, id?: string) {
        if (to !== undefined) { this.to = to; }
        if (relative !== undefined) { this.relative = relative; }
        if (id !== undefined) { this.id = id; }
    }
    /**
     * Where the arc ends, in the sketch's x and y.
     * @default [10, 10]
     */
    to?: Base.Point2 | undefined = [10, 10];
    /**
     * When true, `to` is an offset from where the pen is rather than a point of the sketch.
     * @default false
     */
    relative?: boolean | undefined = false;
    /**
     * A name for the command, reported with the edges it draws; leave it out to be named by position.
     * @default undefined
     * @optional true
     */
    id?: string | undefined;
}

/**
 * A point to end at and how far the arc stands off the straight line to it, for
 * `sketch.commands.sagittaArc`, which makes the circular arc command `sketch.pen` draws.
 */
export class SketchSagittaArcDto {
    constructor(to?: Base.Point2, sagitta?: number, relative?: boolean, id?: string) {
        if (to !== undefined) { this.to = to; }
        if (sagitta !== undefined) { this.sagitta = sagitta; }
        if (relative !== undefined) { this.relative = relative; }
        if (id !== undefined) { this.id = id; }
    }
    /**
     * Where the arc ends, in the sketch's x and y.
     * @default [10, 0]
     */
    to?: Base.Point2 | undefined = [10, 0];
    /**
     * How far the arc's middle stands off the straight line between its ends, in model units:
     * positive to the left of travel, negative to the right.
     * @default 2
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.5
     */
    sagitta?: number | undefined = 2;
    /**
     * When true, `to` is an offset from where the pen is rather than a point of the sketch.
     * @default false
     */
    relative?: boolean | undefined = false;
    /**
     * A name for the command, reported with the edges it draws; leave it out to be named by position.
     * @default undefined
     * @optional true
     */
    id?: string | undefined;
}

/**
 * A point to end at and the arc's bulge, as DXF files write arcs, for `sketch.commands.bulgeArc`,
 * which makes the circular arc command `sketch.pen` draws.
 */
export class SketchBulgeArcDto {
    constructor(to?: Base.Point2, bulge?: number, relative?: boolean, id?: string) {
        if (to !== undefined) { this.to = to; }
        if (bulge !== undefined) { this.bulge = bulge; }
        if (relative !== undefined) { this.relative = relative; }
        if (id !== undefined) { this.id = id; }
    }
    /**
     * Where the arc ends, in the sketch's x and y.
     * @default [10, 0]
     */
    to?: Base.Point2 | undefined = [10, 0];
    /**
     * The tangent of a quarter of the angle the arc sweeps: positive turns counterclockwise, 1 is a
     * half circle, and 0 would be a straight line.
     * @default 0.5
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    bulge?: number | undefined = 0.5;
    /**
     * When true, `to` is an offset from where the pen is rather than a point of the sketch.
     * @default false
     */
    relative?: boolean | undefined = false;
    /**
     * A name for the command, reported with the edges it draws; leave it out to be named by position.
     * @default undefined
     * @optional true
     */
    id?: string | undefined;
}

/**
 * A control point and a point to end at, for `sketch.commands.quadratic`, which makes the quadratic
 * Bezier command `sketch.pen` draws from where the pen is.
 */
export class SketchQuadraticDto {
    constructor(control?: Base.Point2, to?: Base.Point2, relative?: boolean, id?: string) {
        if (control !== undefined) { this.control = control; }
        if (to !== undefined) { this.to = to; }
        if (relative !== undefined) { this.relative = relative; }
        if (id !== undefined) { this.id = id; }
    }
    /**
     * The point the curve is pulled toward, in the sketch's x and y.
     * @default [5, 5]
     */
    control?: Base.Point2 | undefined = [5, 5];
    /**
     * Where the curve ends, in the sketch's x and y.
     * @default [10, 0]
     */
    to?: Base.Point2 | undefined = [10, 0];
    /**
     * When true, `control` and `to` are offsets from where the pen is rather than points of the sketch.
     * @default false
     */
    relative?: boolean | undefined = false;
    /**
     * A name for the command, reported with the edges it draws; leave it out to be named by position.
     * @default undefined
     * @optional true
     */
    id?: string | undefined;
}

/**
 * Two control points and a point to end at, for `sketch.commands.cubic`, which makes the cubic Bezier
 * command `sketch.pen` draws from where the pen is.
 */
export class SketchCubicDto {
    constructor(control1?: Base.Point2, control2?: Base.Point2, to?: Base.Point2, relative?: boolean, id?: string) {
        if (control1 !== undefined) { this.control1 = control1; }
        if (control2 !== undefined) { this.control2 = control2; }
        if (to !== undefined) { this.to = to; }
        if (relative !== undefined) { this.relative = relative; }
        if (id !== undefined) { this.id = id; }
    }
    /**
     * The point the curve leaves toward, in the sketch's x and y.
     * @default [3, 5]
     */
    control1?: Base.Point2 | undefined = [3, 5];
    /**
     * The point the curve arrives from, in the sketch's x and y.
     * @default [7, 5]
     */
    control2?: Base.Point2 | undefined = [7, 5];
    /**
     * Where the curve ends, in the sketch's x and y.
     * @default [10, 0]
     */
    to?: Base.Point2 | undefined = [10, 0];
    /**
     * When true, the control points and `to` are offsets from where the pen is rather than points of
     * the sketch.
     * @default false
     */
    relative?: boolean | undefined = false;
    /**
     * A name for the command, reported with the edges it draws; leave it out to be named by position.
     * @default undefined
     * @optional true
     */
    id?: string | undefined;
}

/**
 * An optional name for the command `sketch.commands.close` makes, which `sketch.pen` draws as a
 * straight segment back to the start point, closing the outline.
 */
export class SketchCloseDto {
    constructor(id?: string) {
        if (id !== undefined) { this.id = id; }
    }
    /**
     * A name for the command, reported with the edge it draws; leave it out to be named by position.
     * @default undefined
     * @optional true
     */
    id?: string | undefined;
}

/**
 * A radius for `sketch.commands.filletCorner`, which makes the command `sketch.pen` uses to round the
 * corner between the segments before and after it.
 */
export class SketchFilletCornerDto {
    constructor(radius?: number, id?: string) {
        if (radius !== undefined) { this.radius = radius; }
        if (id !== undefined) { this.id = id; }
    }
    /**
     * The radius of the rounding arc, in model units.
     * @default 1
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.1
     */
    radius?: number | undefined = 1;
    /**
     * A name for the command, reported with the arc it draws; leave it out to be named by position.
     * @default undefined
     * @optional true
     */
    id?: string | undefined;
}

/**
 * A distance for `sketch.commands.chamferCorner`, which makes the command `sketch.pen` uses to bevel
 * the corner between the segments before and after it.
 */
export class SketchChamferCornerDto {
    constructor(distance?: number, id?: string) {
        if (distance !== undefined) { this.distance = distance; }
        if (id !== undefined) { this.id = id; }
    }
    /**
     * How much the bevel cuts off each segment, in model units, measured along the segment.
     * @default 1
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.1
     */
    distance?: number | undefined = 1;
    /**
     * A name for the command, reported with the segment it draws; leave it out to be named by position.
     * @default undefined
     * @optional true
     */
    id?: string | undefined;
}

/**
 * A start point, the pen's commands and a frame for `sketch.pen` and `sketch.penWithSegments`, which
 * draw one outline in the frame's plane as an exact wire, or a face when it closes.
 */
export class SketchPenDto {
    constructor(commands?: Models.OCCT.SketchCommand[], start?: Base.Point2, frame?: Base.Frame, makeFace?: boolean) {
        if (commands !== undefined) { this.commands = commands; }
        if (start !== undefined) { this.start = start; }
        if (frame !== undefined) { this.frame = frame; }
        if (makeFace !== undefined) { this.makeFace = makeFace; }
    }
    /**
     * The moves of the pen, drawn one after another from `start`.
     * @default undefined
     */
    commands!: Models.OCCT.SketchCommand[];
    /**
     * Where the pen starts, in the sketch's x and y.
     * @default [0, 0]
     */
    start?: Base.Point2 | undefined = [0, 0];
    /**
     * The frame the sketch lies in, its direction the sketch's x axis and its normal out of the face.
     * Left out, the ground, with the sketch's y axis along -Z.
     * @default undefined
     * @optional true
     */
    frame?: Base.Frame | undefined;
    /**
     * When true, the closed outline becomes a face whose normal is the frame's normal.
     * @default false
     */
    makeFace?: boolean | undefined = false;
}

/**
 * A wire, a width and how to finish its ends and corners for `sketch.stroke`, which outlines the wire
 * as if drawn with a pen that wide.
 */
export class SketchStrokeDto<T> {
    constructor(shape?: T, width?: number, cap?: strokeCapEnum, join?: joinTypeEnum, frame?: Base.Frame, makeFace?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (width !== undefined) { this.width = width; }
        if (cap !== undefined) { this.cap = cap; }
        if (join !== undefined) { this.join = join; }
        if (frame !== undefined) { this.frame = frame; }
        if (makeFace !== undefined) { this.makeFace = makeFace; }
    }
    /**
     * The wire or edge to outline, lying in the frame's plane.
     * @default undefined
     */
    shape!: T;
    /**
     * How wide the stroke is, in model units; it reaches half the width to each side.
     * @default 1
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.1
     */
    width?: number | undefined = 1;
    /**
     * How the two ends of an open wire are finished; a closed wire has no ends.
     * @default round
     */
    cap?: strokeCapEnum | undefined = strokeCapEnum.round;
    /**
     * How the outline goes around the wire's corners: `arc` rounds them, `intersection` keeps them
     * sharp, `tangent` continues each side tangentially.
     * @default arc
     */
    join?: joinTypeEnum | undefined = joinTypeEnum.arc;
    /**
     * The frame whose plane the wire lies in. Leave it out for the ground plane.
     * @default undefined
     * @optional true
     */
    frame?: Base.Frame | undefined;
    /**
     * When true, the outline becomes a face; a closed wire gives a ring, a face with one hole.
     * @default true
     */
    makeFace?: boolean | undefined = true;
}

/**
 * Vertices, edges and wires lying in a frame's plane for `sketch.hull`, which wraps them in the
 * tightest convex outline, exact along lines, circles and circular arcs.
 */
export class SketchHullDto<T> {
    constructor(shapes?: T[], frame?: Base.Frame, makeFace?: boolean) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (frame !== undefined) { this.frame = frame; }
        if (makeFace !== undefined) { this.makeFace = makeFace; }
    }
    /**
     * The vertices, edges and wires to wrap; their edges must be straight or circular.
     * @default undefined
     */
    shapes!: T[];
    /**
     * The frame whose plane the shapes lie in. Leave it out for the ground plane.
     * @default undefined
     * @optional true
     */
    frame?: Base.Frame | undefined;
    /**
     * When true, the hull becomes a face whose normal is the frame's normal.
     * @default true
     */
    makeFace?: boolean | undefined = true;
}
