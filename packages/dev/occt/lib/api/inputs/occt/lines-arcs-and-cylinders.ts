// A fragment of the OCCT inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../occ-inputs.ts. Edit here, then regenerate.
import { Base } from "@bitbybit-dev/base";

/**
 * Two points for `shapes.edge.line` and `shapes.wire.createLineWire`, a straight edge or wire
 * between them.
 */
export class LineDto {
    constructor(start?: Base.Point3, end?: Base.Point3) {
        if (start !== undefined) { this.start = start; }
        if (end !== undefined) { this.end = end; }
    }
    /**
     * The point the line starts at.
     * @default [0, 0, 0]
     */
    start: Base.Point3 = [0, 0, 0];
    /**
     * The point the line ends at.
     * @default [0, 1, 0]
     */
    end: Base.Point3 = [0, 1, 0];
}

/**
 * Two points and how far to lengthen the line past each for
 * `shapes.wire.createLineWireWithExtensions`.
 */
export class LineWithExtensionsDto {
    constructor(start?: Base.Point3, end?: Base.Point3, extensionStart?: number, extensionEnd?: number) {
        if (start !== undefined) { this.start = start; }
        if (end !== undefined) { this.end = end; }
        if (extensionStart !== undefined) { this.extensionStart = extensionStart; }
        if (extensionEnd !== undefined) { this.extensionEnd = extensionEnd; }
    }
    /**
     * The point the line starts at, before the extension.
     * @default [0, 0, 0]
     */
    start: Base.Point3 = [0, 0, 0];
    /**
     * The point the line ends at, before the extension.
     * @default [0, 1, 0]
     */
    end: Base.Point3 = [0, 1, 0];
    /**
     * How far the line is lengthened past its start, in model units.
     * @default 0.1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    extensionStart = 0.1;
    /**
     * How far the line is lengthened past its end, in model units.
     * @default 0.1
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    extensionEnd = 0.1;
}
/**
 * Several line definitions for `shapes.wire.createLines`, which builds one wire per line.
 */
export class LinesDto {
    constructor(lines?: LineDto[], returnCompound?: boolean) {
        if (lines !== undefined) { this.lines = lines; }
        if (returnCompound !== undefined) { this.returnCompound = returnCompound; }
    }
    /**
     * One start and end point pair per line.
     * @default undefined
     */
    lines!: LineDto[];
    /**
     * When true, the wires are packed into one compound instead of a list.
     */
    returnCompound = false;
}
/**
 * Two points and a starting direction for `shapes.edge.arcThroughTwoPointsAndTangent`, a circular
 * arc between the points.
 */
export class ArcEdgeTwoPointsTangentDto {
    constructor(start?: Base.Point3, tangentVec?: Base.Vector3, end?: Base.Point3) {
        if (start !== undefined) { this.start = start; }
        if (tangentVec !== undefined) { this.tangentVec = tangentVec; }
        if (end !== undefined) { this.end = end; }
    }
    /**
     * The point the arc begins at, where the tangent applies.
     * @default [0, 0, 0]
     */
    start: Base.Point3 = [0, 0, 0];
    /**
     * The direction the arc leaves the start point in; it fixes the plane and radius of the arc.
     * @default [0, 1, 0]
     */
    tangentVec: Base.Vector3 = [0, 1, 0];
    /**
     * The point the arc finishes at.
     * @default [0, 0, 1]
     */
    end: Base.Point3 = [0, 0, 1];
}
/**
 * A circle edge and two points on it for `shapes.edge.arcFromCircleAndTwoPoints`, which cuts the
 * arc between them.
 */
export class ArcEdgeCircleTwoPointsDto<T> {
    constructor(circle?: T, start?: Base.Point3, end?: Base.Point3, sense?: boolean) {
        if (circle !== undefined) { this.circle = circle; }
        if (start !== undefined) { this.start = start; }
        if (end !== undefined) { this.end = end; }
        if (sense !== undefined) { this.sense = sense; }
    }
    /**
     * The circle edge the arc is cut from.
     * @default undefined
     */
    circle!: T;
    /**
     * The point on the circle where the arc starts.
     * @default [0, 0, 0]
     */
    start: Base.Point3 = [0, 0, 0];
    /**
     * The point on the circle where the arc ends.
     * @default [0, 0, 1]
     */
    end: Base.Point3 = [0, 0, 1];
    /**
     * Which way round the circle the arc runs from start to end: true follows the circle's own
     * direction, false goes the other way.
     * @default true
     */
    sense = true;
}
/**
 * A circle edge and two angles for `shapes.edge.arcFromCircleAndTwoAngles`, which cuts the arc
 * between them.
 */
export class ArcEdgeCircleTwoAnglesDto<T> {
    constructor(circle?: T, alphaAngle1?: number, alphaAngle2?: number, sense?: boolean) {
        if (circle !== undefined) { this.circle = circle; }
        if (alphaAngle1 !== undefined) { this.alphaAngle1 = alphaAngle1; }
        if (alphaAngle2 !== undefined) { this.alphaAngle2 = alphaAngle2; }
        if (sense !== undefined) { this.sense = sense; }
    }
    /**
     * The circle edge the arc is cut from.
     * @default undefined
     */
    circle!: T;
    /**
     * The angle where the arc starts, in degrees around the circle from its own start.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    alphaAngle1 = 0;
    /**
     * The angle where the arc ends, in degrees around the circle from its own start.
     * @default 90
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    alphaAngle2 = 90;
    /**
     * Which way round the circle the arc runs from the first angle to the second: true follows the
     * circle's own direction, false goes the other way.
     * @default true
     */
    sense = true;
}
/**
 * A circle edge, a point on it and an angle for `shapes.edge.arcFromCirclePointAndAngle`, which
 * cuts an arc of that angle from the point.
 */
export class ArcEdgeCirclePointAngleDto<T> {
    constructor(circle?: T, alphaAngle?: number, _alphaAngle2?: number, sense?: boolean) {
        if (circle !== undefined) { this.circle = circle; }
        if (alphaAngle !== undefined) { this.alphaAngle = alphaAngle; }
        if (sense !== undefined) { this.sense = sense; }
    }
    /**
     * The circle edge the arc is cut from.
     * @default undefined
     */
    circle!: T;
    /**
     * The point on the circle where the arc starts.
     * @default undefined
     */
    point!: Base.Point3;
    /**
     * How far the arc spans from the point, in degrees.
     * @default 90
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    alphaAngle = 90;
    /**
     * Which way round the circle the arc runs: true follows the circle's own direction, false goes
     * the other way.
     * @default true
     */
    sense = true;
}
/**
 * Three points for `shapes.edge.arcThroughThreePoints`, the circular arc that passes through all
 * three.
 */
export class ArcEdgeThreePointsDto {
    constructor(start?: Base.Point3, middle?: Base.Point3, end?: Base.Point3) {
        if (start !== undefined) { this.start = start; }
        if (middle !== undefined) { this.middle = middle; }
        if (end !== undefined) { this.end = end; }
    }
    /**
     * The point the arc begins at.
     * @default [0, 0, 0]
     */
    start: Base.Point3 = [0, 0, 0];
    /**
     * A point the arc passes through on its way; it fixes the plane and radius.
     * @default [0, 1, 0]
     */
    middle: Base.Point3 = [0, 1, 0];
    /**
     * The point the arc finishes at.
     * @default [0, 0, 1]
     */
    end: Base.Point3 = [0, 0, 1];
}
/**
 * The size and placement of a cylinder for `shapes.solid.createCylinder`, which stands it on a
 * round base at `center`.
 */
export class CylinderDto {
    constructor(radius?: number, height?: number, center?: Base.Point3, direction?: Base.Vector3, angle?: number, originOnCenter?: boolean) {
        if (radius !== undefined) { this.radius = radius; }
        if (height !== undefined) { this.height = height; }
        if (center !== undefined) { this.center = center; }
        if (direction !== undefined) { this.direction = direction; }
        if (angle !== undefined) { this.angle = angle; }
        if (originOnCenter !== undefined) { this.originOnCenter = originOnCenter; }
    }
    /**
     * The radius of the round base, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius = 1;
    /**
     * How far the cylinder grows from its base along `direction`, in model units.
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 2;
    /**
     * The center of the base, or the middle of the cylinder when `originOnCenter` is true.
     * @default [0, 0, 0]
     */
    center: Base.Point3 = [0, 0, 0];
    /**
     * The direction the cylinder grows in; the default stands it up along Y.
     * @default [0, 1, 0]
     */
    direction?: Base.Vector3 | undefined = [0, 1, 0];
    /**
     * How much of the full round to build, in degrees; less than 360 cuts a wedge out, like a slice
     * of cake.
     * @default 360
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    angle?: number | undefined = 360;
    /**
     * When true, the cylinder is shifted back by half its height so `center` sits in its middle.
     * @default false
     */
    originOnCenter?: boolean | undefined = false;
}
/**
 * Lines and a radius for `shapes.solid.createCylindersOnLines`, which builds one cylinder along
 * each line.
 */
export class CylindersOnLinesDto {
    constructor(radius?: number, lines?: Base.Line3[]) {
        if (radius !== undefined) { this.radius = radius; }
        if (lines !== undefined) { this.lines = lines; }
    }
    /**
     * The radius shared by every cylinder, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    radius: number = 1;
    /**
     * The lines the cylinders follow, each from its start to its end.
     * @default undefined
     */
    lines!: Base.Line3[];
}
