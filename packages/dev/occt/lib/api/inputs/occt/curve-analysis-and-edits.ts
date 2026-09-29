// A fragment of the OCCT inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../occ-inputs.ts. Edit here, then regenerate.
import { Base } from "@bitbybit-dev/base";
import { joinTypeEnum } from "./enums";

/**
 * An edge or a wire and places along it as fractions, for `analysis.curves.curvaturesAtParams`,
 * `shapes.edge.splitEdgeAtParams` and `shapes.wire.splitWireAtParams`.
 */
export class DataOnGeometryAtParamsDto<T> {
    constructor(shape?: T, params?: number[]) {
        if (shape !== undefined) { this.shape = shape; }
        if (params !== undefined) { this.params = params; }
    }
    /**
     * The edge or wire to read or cut.
     * @default undefined
     */
    shape!: T;
    /**
     * Places along the curve, each a fraction from 0 at the start to 1 at the end; each edge of a
     * wire takes an equal share, as in `shapes.wire.pointOnWireAtParam`.
     * @default undefined
     */
    params!: number[];
}
/**
 * An edge or a wire, a tooth count and a scale for `analysis.curves.curvatureComb`, which draws the
 * curvature as teeth standing on the curve.
 */
export class CurvatureCombDto<T> {
    constructor(shape?: T, samples?: number, scale?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (samples !== undefined) { this.samples = samples; }
        if (scale !== undefined) { this.scale = scale; }
    }
    /**
     * The edge or wire whose curvature is drawn.
     * @default undefined
     */
    shape!: T;
    /**
     * How many teeth, spaced evenly by length from the start of the curve to its end.
     * @default 50
     * @minimum 2
     * @maximum Infinity
     * @step 1
     */
    samples?: number | undefined = 50;
    /**
     * How long a tooth is per unit of curvature; 0 picks the scale that makes the longest tooth a
     * fifth of the curve's length.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    scale?: number | undefined = 0;
}
/**
 * An edge or a wire and an angle for `analysis.curves.kinks`, which finds the joints where the
 * tangent turns sharply.
 */
export class CurveKinksDto<T> {
    constructor(shape?: T, angle?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (angle !== undefined) { this.angle = angle; }
    }
    /**
     * The edge or wire to look along.
     * @default undefined
     */
    shape!: T;
    /**
     * How far the tangent must turn where two edges meet for the joint to count as a kink, in
     * degrees; a turn of exactly this much does not count.
     * @default 1
     * @minimum 0
     * @maximum 180
     * @step 1
     */
    angle?: number | undefined = 1;
}
/**
 * An edge or a wire and the way up for `analysis.curves.extremesAlong`, which finds the curve's
 * highest and lowest points along that direction.
 */
export class CurveExtremesAlongDto<T> {
    constructor(shape?: T, direction?: Base.Vector3) {
        if (shape !== undefined) { this.shape = shape; }
        if (direction !== undefined) { this.direction = direction; }
    }
    /**
     * The edge or wire to look along.
     * @default undefined
     */
    shape!: T;
    /**
     * The way up: the highest points lie furthest along it; only its direction matters.
     * @default [0, 1, 0]
     */
    direction?: Base.Vector3 | undefined = [0, 1, 0];
}
/**
 * Two edges or wires and a tolerance for `analysis.curves.intersectCurves`, which finds where the
 * two cross or run together.
 */
export class IntersectCurvesDto<T> {
    constructor(shapeA?: T, shapeB?: T, tolerance?: number) {
        if (shapeA !== undefined) { this.shapeA = shapeA; }
        if (shapeB !== undefined) { this.shapeB = shapeB; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * The first edge or wire; the points come back in order along it.
     * @default undefined
     */
    shapeA!: T;
    /**
     * The second edge or wire, the one the first meets.
     * @default undefined
     */
    shapeB!: T;
    /**
     * How close the curves may pass and still count as meeting, in model units; points closer than
     * it to each other merge into one.
     * @default 1e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.00001
     */
    tolerance?: number | undefined = 1e-7;
}
/**
 * An edge or a wire, a face and a tolerance for `analysis.curves.intersectCurveWithFace`, which
 * finds where the curve passes through the face or lies on it.
 */
export class IntersectCurveWithFaceDto<T, U> {
    constructor(shape?: T, face?: U, tolerance?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (face !== undefined) { this.face = face; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * The edge or wire that meets the face; the points come back in order along it.
     * @default undefined
     */
    shape!: T;
    /**
     * The face the curve meets, within its edges; the surface beyond them does not count.
     * @default undefined
     */
    face!: U;
    /**
     * How close the curve may pass and still count as meeting the face, in model units; points
     * closer than it to each other merge into one.
     * @default 1e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.00001
     */
    tolerance?: number | undefined = 1e-7;
}
/**
 * An edge and the lengths to add at its ends for `shapes.edge.extendEdge`, which carries the curve
 * on past its start and its end.
 */
export class ExtendEdgeDto<T> {
    constructor(shape?: T, atStart?: number, atEnd?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (atStart !== undefined) { this.atStart = atStart; }
        if (atEnd !== undefined) { this.atEnd = atEnd; }
    }
    /**
     * The edge to lengthen; it stays as it is and a longer copy comes back.
     * @default undefined
     */
    shape!: T;
    /**
     * How much length to add before the start, in model units.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    atStart?: number | undefined = 0;
    /**
     * How much length to add past the end, in model units.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    atEnd?: number | undefined = 1;
}
/**
 * Two edges and the kind of join for `shapes.edge.blendBetweenEdges`, which bridges the gap from
 * the end of one to the start of the other with a smooth curve.
 */
export class BlendBetweenEdgesDto<T> {
    constructor(from?: T, to?: T, matchCurvature?: boolean, bulge?: number) {
        if (from !== undefined) { this.from = from; }
        if (to !== undefined) { this.to = to; }
        if (matchCurvature !== undefined) { this.matchCurvature = matchCurvature; }
        if (bulge !== undefined) { this.bulge = bulge; }
    }
    /**
     * The edge whose end the blend leaves from, along its tangent there.
     * @default undefined
     */
    from!: T;
    /**
     * The edge whose start the blend arrives at, along its tangent there.
     * @default undefined
     */
    to!: T;
    /**
     * False matches the tangents at both ends with a cubic curve; true also matches the curvature
     * there, with a quintic curve.
     * @default false
     */
    matchCurvature?: boolean | undefined = false;
    /**
     * How far the blend holds each tangent before it turns; larger values swing wider.
     * @default 1
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.1
     */
    bulge?: number | undefined = 1;
}
/**
 * Three edges or vertices, the plane they lie in and a tolerance for
 * `shapes.edge.circlesTangentToThree`, which draws every circle touching the edges and passing
 * through the vertices.
 */
export class CirclesTangentToThreeDto<T> {
    constructor(shapes?: T[], frame?: Base.Frame, tolerance?: number, onArgumentsOnly?: boolean) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (frame !== undefined) { this.frame = frame; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
        if (onArgumentsOnly !== undefined) { this.onArgumentsOnly = onArgumentsOnly; }
    }
    /**
     * Three edges or vertices lying in the plane: each circle touches every edge and passes through
     * every vertex.
     * @default undefined
     */
    shapes!: T[];
    /**
     * A frame whose origin and normal give the plane the shapes lie in; the circles are drawn in it
     * too.
     * @default undefined
     */
    frame!: Base.Frame;
    /**
     * How close lines and circles may come to touching and still count as tangent, in model units.
     * @default 1e-7
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.00001
     */
    tolerance?: number | undefined = 1e-7;
    /**
     * When true, keeps only the circles that touch each edge within its ends; otherwise straight
     * edges count as endless lines and arcs as whole circles.
     * @default false
     */
    onArgumentsOnly?: boolean | undefined = false;
}
/**
 * Two edges or vertices, a radius and the plane they lie in for
 * `shapes.edge.circlesTangentToTwoWithRadius`, which draws every circle of that radius touching the
 * edges and passing through the vertices.
 */
export class CirclesTangentToTwoWithRadiusDto<T> {
    constructor(shapes?: T[], frame?: Base.Frame, radius?: number, tolerance?: number, onArgumentsOnly?: boolean) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (frame !== undefined) { this.frame = frame; }
        if (radius !== undefined) { this.radius = radius; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
        if (onArgumentsOnly !== undefined) { this.onArgumentsOnly = onArgumentsOnly; }
    }
    /**
     * Two edges or vertices lying in the plane: each circle touches every edge and passes through
     * every vertex.
     * @default undefined
     */
    shapes!: T[];
    /**
     * A frame whose origin and normal give the plane the shapes lie in; the circles are drawn in it
     * too.
     * @default undefined
     */
    frame!: Base.Frame;
    /**
     * The radius of every circle drawn, in model units.
     * @default 1
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.1
     */
    radius?: number | undefined = 1;
    /**
     * How close lines and circles may come to touching and still count as tangent, in model units.
     * @default 1e-7
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.00001
     */
    tolerance?: number | undefined = 1e-7;
    /**
     * When true, keeps only the circles that touch each edge within its ends; otherwise straight
     * edges count as endless lines and arcs as whole circles.
     * @default false
     */
    onArgumentsOnly?: boolean | undefined = false;
}
/**
 * Two edges or vertices, the edge the centers lie on and the plane for
 * `shapes.edge.circlesTangentToTwoCenteredOn`, which draws every circle centered on that edge
 * touching the edges and passing through the vertices.
 */
export class CirclesTangentToTwoCenteredOnDto<T> {
    constructor(shapes?: T[], centerOn?: T, frame?: Base.Frame, tolerance?: number, onArgumentsOnly?: boolean) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (centerOn !== undefined) { this.centerOn = centerOn; }
        if (frame !== undefined) { this.frame = frame; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
        if (onArgumentsOnly !== undefined) { this.onArgumentsOnly = onArgumentsOnly; }
    }
    /**
     * Two edges or vertices lying in the plane: each circle touches every edge and passes through
     * every vertex.
     * @default undefined
     */
    shapes!: T[];
    /**
     * The edge in the plane that the center of every circle lies on.
     * @default undefined
     */
    centerOn!: T;
    /**
     * A frame whose origin and normal give the plane the shapes lie in; the circles are drawn in it
     * too.
     * @default undefined
     */
    frame!: Base.Frame;
    /**
     * How close lines and circles may come to touching and still count as tangent, in model units.
     * @default 1e-7
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.00001
     */
    tolerance?: number | undefined = 1e-7;
    /**
     * When true, keeps only the circles touching each edge within its ends and centered within
     * `centerOn`; otherwise straight edges count as endless lines and arcs as whole circles.
     * @default false
     */
    onArgumentsOnly?: boolean | undefined = false;
}
/**
 * Two edges, or an edge and a vertex, and the plane they lie in for
 * `shapes.edge.linesTangentToTwo`, which draws every straight line touching both.
 */
export class LinesTangentToTwoDto<T> {
    constructor(shapes?: T[], frame?: Base.Frame, angularTolerance?: number, onArgumentsOnly?: boolean) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (frame !== undefined) { this.frame = frame; }
        if (angularTolerance !== undefined) { this.angularTolerance = angularTolerance; }
        if (onArgumentsOnly !== undefined) { this.onArgumentsOnly = onArgumentsOnly; }
    }
    /**
     * Two curved edges, or a curved edge and a vertex, lying in the plane; each line touches the
     * edges and passes through the vertex.
     * @default undefined
     */
    shapes!: T[];
    /**
     * A frame whose origin and normal give the plane the shapes lie in; the lines are drawn in it
     * too.
     * @default undefined
     */
    frame!: Base.Frame;
    /**
     * How nearly a line must run along a curve where it touches to count as tangent, as the sine of
     * the angle between them.
     * @default 1e-6
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.00001
     */
    angularTolerance?: number | undefined = 1e-6;
    /**
     * When true, keeps only the lines that touch each edge within its ends; otherwise arcs count as
     * whole circles.
     * @default false
     */
    onArgumentsOnly?: boolean | undefined = false;
}
/**
 * A curve, a straight reference edge, an angle and the plane for
 * `shapes.edge.linesTangentAtAngle`, which draws every line touching the curve at that angle to the
 * reference.
 */
export class LinesTangentAtAngleDto<T> {
    constructor(shape?: T, reference?: T, frame?: Base.Frame, angle?: number, angularTolerance?: number, onArgumentsOnly?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (reference !== undefined) { this.reference = reference; }
        if (frame !== undefined) { this.frame = frame; }
        if (angle !== undefined) { this.angle = angle; }
        if (angularTolerance !== undefined) { this.angularTolerance = angularTolerance; }
        if (onArgumentsOnly !== undefined) { this.onArgumentsOnly = onArgumentsOnly; }
    }
    /**
     * The curved edge the lines touch, lying in the plane.
     * @default undefined
     */
    shape!: T;
    /**
     * The straight edge the angle is measured from, lying in the plane; each line runs from its touch
     * to where it crosses this edge's line.
     * @default undefined
     */
    reference!: T;
    /**
     * A frame whose origin and normal give the plane the edges lie in; the angle turns about the
     * normal.
     * @default undefined
     */
    frame!: Base.Frame;
    /**
     * The angle from the reference's direction to the lines, in degrees, turning counterclockwise
     * about the frame's normal.
     * @default 45
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    angle?: number | undefined = 45;
    /**
     * The tolerance of the search for touching lines, in radians; an `angle` this close to 0, a
     * right angle or a half turn is taken as exactly that.
     * @default 1e-6
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.00001
     */
    angularTolerance?: number | undefined = 1e-6;
    /**
     * When true, keeps only the lines that touch the curve within its ends and cross the reference
     * within its ends, which leaves out lines parallel to it.
     * @default false
     */
    onArgumentsOnly?: boolean | undefined = false;
}
/**
 * An open wire or an edge, a distance and the corner style for `shapes.wire.offsetOpen`, which
 * draws the offset curve on one side of it instead of a loop around it.
 */
export class OffsetOpenDto<T, U> {
    constructor(shape?: T, face?: U, distance?: number, joinType?: joinTypeEnum) {
        if (shape !== undefined) { this.shape = shape; }
        if (face !== undefined) { this.face = face; }
        if (distance !== undefined) { this.distance = distance; }
        if (joinType !== undefined) { this.joinType = joinType; }
    }
    /**
     * The open wire or edge to offset, lying in a plane; a straight one needs `face` to give it one.
     * @default undefined
     */
    shape!: T;
    /**
     * A flat face whose plane the offset lies in, seen from the side it looks to; leave it out to use
     * the plane the wire lies in.
     * @default undefined
     * @optional true
     */
    face?: U | undefined;
    /**
     * How far the offset curve lies from the wire, in model units: positive to the right of the
     * direction the wire runs, negative to the left.
     * @default 0.2
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    distance?: number | undefined = 0.2;
    /**
     * How the offset pieces meet where the wire has a corner: `arc` rounds them, `intersection`
     * extends them to a sharp corner, `tangent` keeps them tangent.
     * @default arc
     */
    joinType?: joinTypeEnum | undefined = joinTypeEnum.arc;
}
/**
 * Edges or wires, a shape with faces and the fitting settings for `shapes.wire.projectNormal`,
 * which lays the curves onto the faces along their normals.
 */
export class ProjectNormalDto<T, U> {
    constructor(wires?: T[], shape?: U, tolerance?: number, maxDistance?: number) {
        if (wires !== undefined) { this.wires = wires; }
        if (shape !== undefined) { this.shape = shape; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
        if (maxDistance !== undefined) { this.maxDistance = maxDistance; }
    }
    /**
     * The edges or wires to lay onto the shape.
     * @default undefined
     */
    wires!: T[];
    /**
     * The shape whose faces the curves land on, within the faces' edges.
     * @default undefined
     */
    shape!: U;
    /**
     * How far the fitted curves may stray from the exact projection, in model units.
     * @default 1e-4
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.00001
     */
    tolerance?: number | undefined = 1e-4;
    /**
     * Drops the parts of the projection lying farther than this from the curves they come from, in
     * model units; 0 keeps everything.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    maxDistance?: number | undefined = 0;
}
/**
 * An edge or a wire, a shape and a point for `shapes.wire.projectConical`, which casts the curve onto
 * the shape along the lines from the point through it.
 */
export class ProjectConicalDto<T, U> {
    constructor(wire?: T, shape?: U, from?: Base.Point3) {
        if (wire !== undefined) { this.wire = wire; }
        if (shape !== undefined) { this.shape = shape; }
        if (from !== undefined) { this.from = from; }
    }
    /**
     * The edge or wire to cast onto the shape.
     * @default undefined
     */
    wire!: T;
    /**
     * The shape whose faces the curve lands on.
     * @default undefined
     */
    shape!: U;
    /**
     * The point the curve is cast from, like a lamp throwing its shadow; it must not lie on the curve.
     * @default [0, 10, 0]
     */
    from?: Base.Point3 | undefined = [0, 10, 0];
}
/**
 * Flat wires or edges, a face and a tolerance for `shapes.wire.wrapWiresOnFace`, which wraps the
 * drawing around a plane, cylinder or cone face with its lengths kept.
 */
export class WrapWiresOnFaceDto<T, U> {
    constructor(wires?: T[], face?: U, tolerance?: number) {
        if (wires !== undefined) { this.wires = wires; }
        if (face !== undefined) { this.face = face; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * The wires or edges drawn flat on the ground plane, where the face's development lies with X
     * along its U direction and Z along V; Y is ignored.
     * @default undefined
     */
    wires!: T[];
    /**
     * The plane, cylinder or cone face to wrap them around.
     * @default undefined
     */
    face!: U;
    /**
     * How far the wrapped curves may stray from the exact wrap, in model units.
     * @default 1e-4
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.00001
     */
    tolerance?: number | undefined = 1e-4;
}
