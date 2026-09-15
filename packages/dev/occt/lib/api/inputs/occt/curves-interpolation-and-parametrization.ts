// A fragment of the OCCT inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../occ-inputs.ts. Edit here, then regenerate.
import { Base } from "@bitbybit-dev/base";
import { combinationCirclesForFaceEnum, fourSidesStrictEnum, twoSidesStrictEnum, wireFromPointsTypeEnum } from "./enums";

/**
 * Points and a closing flag for `shapes.wire.createBSpline`, which fits a smooth curve close to the
 * points.
 */
export class BSplineDto {
    constructor(points?: Base.Point3[], closed?: boolean) {
        if (points !== undefined) { this.points = points; }
        if (closed !== undefined) { this.closed = closed; }
    }
    /**
     * The points the curve follows closely, in order; it need not pass through them exactly.
     * @default undefined
     */
    points!: Base.Point3[];
    /**
     * When true, the first point is appended again so the ends meet.
     * @default false
     */
    closed = false;
}
/**
 * Several B-spline definitions for `shapes.wire.createBSplines`, which builds one wire per
 * definition.
 */
export class BSplinesDto {
    constructor(bSplines?: BSplineDto[], returnCompound?: boolean) {
        if (bSplines !== undefined) { this.bSplines = bSplines; }
        if (returnCompound !== undefined) { this.returnCompound = returnCompound; }
    }
    /**
     * One definition per curve, as `createBSpline` takes them.
     * @default undefined
     */
    bSplines!: BSplineDto[];
    /**
     * When true, the wires are packed into one compound instead of a list.
     */
    returnCompound = false;
}
/**
 * Two circles in one plane and which pieces to keep for `shapes.wire.createWireFromTwoCirclesTan`,
 * a closed outline around both circles.
 */
export class WireFromTwoCirclesTanDto<T> {
    constructor(circle1?: T, circle2?: T, keepLines?: twoSidesStrictEnum, circleRemainders?: fourSidesStrictEnum, tolerance?: number) {
        if (circle1 !== undefined) { this.circle1 = circle1; }
        if (circle2 !== undefined) { this.circle2 = circle2; }
        if (keepLines !== undefined) { this.keepLines = keepLines; }
        if (circleRemainders !== undefined) { this.circleRemainders = circleRemainders; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * The first circle wire; it must consist of a single edge.
     * @default undefined
     */
    circle1!: T;
    /**
     * The second circle wire; it must consist of a single edge.
     * @default undefined
     */
    circle2!: T;
    /**
     * Which tangent lines join the circles: `outside` gives the belt that does not cross itself,
     * `inside` the crossing lines.
     * @default outside
     */
    keepLines: twoSidesStrictEnum = twoSidesStrictEnum.outside;
    /**
     * Which arc of each circle stays in the outline: both outside, both inside, or one of each.
     * @default outside
     */
    circleRemainders: fourSidesStrictEnum = fourSidesStrictEnum.outside;
    /**
     * How close a line must come to a circle to count as touching it, in model units.
     * @default 1e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.00001
     */
    tolerance = 1e-7;
}
/**
 * Circles in one plane and how to pair them for `shapes.face.createFaceFromMultipleCircleTanWires`,
 * which joins the pairs with tangent belts.
 */
export class FaceFromMultipleCircleTanWiresDto<T> {
    constructor(circles?: T[], combination?: combinationCirclesForFaceEnum, unify?: boolean, tolerance?: number) {
        if (circles !== undefined) { this.circles = circles; }
        if (combination !== undefined) { this.combination = combination; }
        if (unify !== undefined) { this.unify = unify; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * The circle wires to join, each a single edge.
     * @default undefined
     */
    circles!: T[];
    /**
     * Which pairs get a belt: `allWithAll` every circle with every other, `inOrder` neighbors in
     * the list, `inOrderClosed` also the last with the first.
     * @default allWithAll
     */
    combination: combinationCirclesForFaceEnum = combinationCirclesForFaceEnum.allWithAll;
    /**
     * When true, the belt faces are fused into one shape; when false they come back as a compound,
     * which is faster.
     * @default true
     */
    unify = true;
    /**
     * How close a line must come to a circle to count as touching it, in model units.
     * @default 1e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.00001
     */
    tolerance = 1e-7;
}
/**
 * Lists of circles and how to pair them for
 * `shapes.face.createFaceFromMultipleCircleTanWireCollections`, which joins circles of consecutive
 * lists with tangent belts.
 */
export class FaceFromMultipleCircleTanWireCollectionsDto<T> {
    constructor(listsOfCircles?: T[][], combination?: combinationCirclesForFaceEnum, unify?: boolean, tolerance?: number) {
        if (listsOfCircles !== undefined) { this.listsOfCircles = listsOfCircles; }
        if (combination !== undefined) { this.combination = combination; }
        if (unify !== undefined) { this.unify = unify; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * The lists of circle wires; belts run between one list and the next.
     * @default undefined
     */
    listsOfCircles!: T[][];
    /**
     * Which pairs get a belt: `allWithAll` every circle of a list with every circle of the next,
     * `inOrder` circles at the same position, `inOrderClosed` also closes each list.
     * @default allWithAll
     */
    combination: combinationCirclesForFaceEnum = combinationCirclesForFaceEnum.allWithAll;
    /**
     * When true, the belt faces are fused into one shape; when false they come back as a compound,
     * which is faster.
     * @default true
     */
    unify = true;
    /**
     * How close a line must come to a circle to count as touching it, in model units.
     * @default 1e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.00001
     */
    tolerance = 1e-7;
}
/**
 * Two wires and a bounce count for `shapes.wire.createZigZagBetweenTwoWires`, which draws a
 * polyline bouncing between them.
 */
export class ZigZagBetweenTwoWiresDto<T> {
    constructor(wire1?: T, wire2?: T, nrZigZags?: number, inverse?: boolean, divideByEqualDistance?: boolean, zigZagsPerEdge?: boolean) {
        if (wire1 !== undefined) { this.wire1 = wire1; }
        if (wire2 !== undefined) { this.wire2 = wire2; }
        if (nrZigZags !== undefined) { this.nrZigZags = nrZigZags; }
        if (inverse !== undefined) { this.inverse = inverse; }
        if (divideByEqualDistance !== undefined) { this.divideByEqualDistance = divideByEqualDistance; }
        if (zigZagsPerEdge !== undefined) { this.zigZagsPerEdge = zigZagsPerEdge; }
    }
    /**
     * The wire the zig-zag starts on.
     * @default undefined
     */
    wire1!: T;
    /**
     * The wire the zig-zag bounces to.
     * @default undefined
     */
    wire2!: T;
    /**
     * How many bounces to draw, per edge with `zigZagsPerEdge` or over the whole wire without; one
     * bounce is two segments meeting at a corner.
     * @default 20
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrZigZags = 20;
    /**
     * When true, the zig-zag starts on the second wire instead of the first.
     * @default false
     */
    inverse: boolean = false;
    /**
     * When true, the bounce points are spaced by length along the wires; when false they follow the
     * curves' parameters, which can be uneven.
     * @default false
     */
    divideByEqualDistance = false;

    /**
     * When true, each edge of the wires gets `nrZigZags` bounces and the wires need matching edge
     * counts; when false the count covers the whole wire.
     * @default true
     */
    zigZagsPerEdge = true;
}
/**
 * Wires or edges and wire options for
 * `shapes.wire.createWiresBetweenStartEndPointsOfWiresAndEdges`, which joins their start points
 * into one wire and their end points into another.
 */
export class WiresBetweenStartEndPointsOfWiresAndEdgesDto<T> {
    constructor(shapes?: T[], wireType?: wireFromPointsTypeEnum, closed?: boolean, tolerance?: number) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (wireType !== undefined) { this.wireType = wireType; }
        if (closed !== undefined) { this.closed = closed; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * Two or more wires or edges, in the order their points are joined.
     * @default undefined
     */
    shapes!: T[];
    /**
     * Whether the points are joined with straight segments or with a smooth interpolated curve.
     * @default polyline
     */
    wireType?: wireFromPointsTypeEnum | undefined = wireFromPointsTypeEnum.polyline;
    /**
     * When true, each new wire loops back to its first point: a polygon, or a periodic curve for
     * the interpolated kind.
     * @default false
     */
    closed?: boolean | undefined = false;
    /**
     * How far the interpolated curve may stray from the points, in model units; unused for
     * polylines.
     * @default 1e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.00001
     */
    tolerance?: number | undefined = 1e-7;
}
/**
 * Wires or edges, a division count and wire options for
 * `shapes.wire.createWiresBetweenSubdividedPointsOfWiresAndEdges`, which connects matching division
 * points like the rungs of a ladder.
 */
export class WiresBetweenSubdividedPointsOfWiresAndEdgesDto<T> {
    constructor(shapes?: T[], nrOfDivisions?: number, divideByEqualDistance?: boolean, wireType?: wireFromPointsTypeEnum, closed?: boolean, tolerance?: number) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (nrOfDivisions !== undefined) { this.nrOfDivisions = nrOfDivisions; }
        if (divideByEqualDistance !== undefined) { this.divideByEqualDistance = divideByEqualDistance; }
        if (wireType !== undefined) { this.wireType = wireType; }
        if (closed !== undefined) { this.closed = closed; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * Two or more wires or edges, in the order their points are joined.
     * @default undefined
     */
    shapes!: T[];
    /**
     * How many steps each shape is divided into; one rung more than that is drawn, the ends
     * included.
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrOfDivisions?: number | undefined = 10;
    /**
     * When true, the division points are spaced by length along each shape; when false they follow
     * the curves' parameters, which can be uneven.
     * @default false
     */
    divideByEqualDistance?: boolean | undefined = false;
    /**
     * Whether each rung is a polyline of straight segments or a smooth interpolated curve.
     * @default polyline
     */
    wireType?: wireFromPointsTypeEnum | undefined = wireFromPointsTypeEnum.polyline;
    /**
     * When true, each rung loops back to its first point: a polygon, or a periodic curve for the
     * interpolated kind.
     * @default false
     */
    closed?: boolean | undefined = false;
    /**
     * How far an interpolated rung may stray from its points, in model units; unused for polylines.
     * @default 1e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.00001
     */
    tolerance?: number | undefined = 1e-7;
}

export enum bSplineParametrizationEnum {
    /** Equal parameter spacing - symmetric for symmetric inputs, but can overshoot on uneven spacing. */
    uniform = "uniform",
    /** Spacing proportional to chord length (OCCT's historic default). */
    chordLength = "chordLength",
    /** Spacing proportional to sqrt(chord) - best general default; resists cusps and overshoot. */
    centripetal = "centripetal",
}
/**
 * Points and fitting options for `shapes.wire.interpolatePoints`, which draws a smooth curve
 * through every point.
 */
export class InterpolationDto {
    constructor(points?: Base.Point3[], periodic?: boolean, tolerance?: number, parametrization?: bSplineParametrizationEnum, startTangent?: Base.Vector3, endTangent?: Base.Vector3, tangents?: (Base.Vector3 | undefined)[]) {
        if (points !== undefined) { this.points = points; }
        if (periodic !== undefined) { this.periodic = periodic; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
        if (parametrization !== undefined) { this.parametrization = parametrization; }
        if (startTangent !== undefined) { this.startTangent = startTangent; }
        if (endTangent !== undefined) { this.endTangent = endTangent; }
        if (tangents !== undefined) { this.tangents = tangents; }
    }
    /**
     * The points the curve passes through, in order.
     * @default undefined
     */
    points!: Base.Point3[];
    /**
     * When true, the curve closes into a loop that is smooth across the seam.
     * @default false
     */
    periodic = false;
    /**
     * How far the curve may stray from the points, in model units.
     * @default 1e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.00001
     */
    tolerance = 1e-7;
    /**
     * How the curve is spaced between points: chord length by default, `centripetal` to resist
     * cusps and overshoot with uneven points, or `uniform`.
     * @default chordLength
     */
    parametrization?: bSplineParametrizationEnum | undefined;
    /**
     * A direction the curve must leave the first point in; only for open curves.
     * @default undefined
     * @optional true
     */
    startTangent?: Base.Vector3 | undefined;
    /**
     * A direction the curve must arrive at the last point in; only for open curves.
     * @default undefined
     * @optional true
     */
    endTangent?: Base.Vector3 | undefined;
    /**
     * One direction per point that the curve must follow there, with undefined entries left free;
     * when given, the start and end tangents are ignored.
     * @default undefined
     * @optional true
     */
    tangents?: (Base.Vector3 | undefined)[] | undefined;
}
/**
 * Points and a tolerance for `shapes.wire.interpolatePointsSymmetric`, a closed smooth curve that
 * stays mirror-symmetric when the points are; it works out its own tangents, so nothing else is
 * needed.
 */
export class InterpolateSymmetricDto {
    constructor(points?: Base.Point3[], tolerance?: number) {
        if (points !== undefined) { this.points = points; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * At least three points the closed curve passes through, in order.
     * @default undefined
     */
    points!: Base.Point3[];
    /**
     * How far the curve may stray from the points, in model units.
     * @default 1e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.00001
     */
    tolerance = 1e-7;
}
/**
 * Several interpolation definitions for `shapes.wire.interpolateWires`, which builds one wire per
 * definition.
 */
export class InterpolateWiresDto {
    constructor(interpolations?: InterpolationDto[], returnCompound?: boolean) {
        if (interpolations !== undefined) { this.interpolations = interpolations; }
        if (returnCompound !== undefined) { this.returnCompound = returnCompound; }
    }
    /**
     * One definition per curve, as `interpolatePoints` takes them.
     * @default undefined
     */
    interpolations!: InterpolationDto[];
    /**
     * When true, the wires are packed into one compound instead of a list.
     */
    returnCompound = false;
}
/**
 * Control points and shape options for `shapes.wire.createBezier`, a smooth curve pulled toward its
 * control points.
 */
export class BezierDto {
    constructor(points?: Base.Point3[], closed?: boolean, degree?: number, periodic?: boolean) {
        if (points !== undefined) { this.points = points; }
        if (closed !== undefined) { this.closed = closed; }
        if (degree !== undefined) { this.degree = degree; }
        if (periodic !== undefined) { this.periodic = periodic; }
    }
    /**
     * The control points: the curve starts at the first, ends at the last and is pulled toward the
     * ones between.
     * @default undefined
     */
    points!: Base.Point3[];
    /**
     * When true, the first point is appended again so the ends meet, with a corner at the seam.
     * @default false
     */
    closed = false;
    /**
     * How many neighboring control points shape each part of the curve; leave it out for a classic
     * Bezier, capped at 25 and bounded automatically above 26 points.
     * @default undefined
     * @optional true
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    degree?: number | undefined;
    /**
     * When true, the curve closes into a loop that is smooth across the seam, using `degree` or a
     * default; it overrides `closed`.
     * @default false
     * @optional true
     */
    periodic?: boolean | undefined = false;
}
/**
 * Control points with a weight each and shape options for `shapes.wire.createBezierWeights`; the
 * weights say how strongly each point pulls the curve.
 */
export class BezierWeightsDto {
    constructor(points?: Base.Point3[], weights?: number[], closed?: boolean, periodic?: boolean, degree?: number) {
        if (points !== undefined) { this.points = points; }
        if (weights !== undefined) { this.weights = weights; }
        if (closed !== undefined) { this.closed = closed; }
        if (periodic !== undefined) { this.periodic = periodic; }
        if (degree !== undefined) { this.degree = degree; }
    }
    /**
     * The control points: the curve starts at the first, ends at the last and is pulled toward the
     * ones between.
     * @default undefined
     */
    points!: Base.Point3[];
    /**
     * One weight per control point, plus one more when `closed` is true and `periodic` false; above
     * 1 pulls harder, below 1 lets go.
     * @default undefined
     */
    weights!: number[];
    /**
     * When true, the first point is appended again so the ends meet, with a corner at the seam.
     * @default false
     */
    closed = false;
    /**
     * When true, the curve closes into a loop that is smooth across the seam and needs exactly one
     * weight per point; it overrides `closed`.
     * @default false
     * @optional true
     */
    periodic?: boolean | undefined = false;
    /**
     * How many neighboring control points shape each part of a periodic curve; ignored otherwise.
     * @default undefined
     * @optional true
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    degree?: number | undefined;
}
/**
 * A wire or edge, a degree and a tolerance for `shapes.wire.rebuildWireDegree` and
 * `shapes.edge.rebuildEdgeDegree`.
 */
export class RebuildCurveDegreeDto<T> {
    constructor(shape?: T, degree?: number, tolerance?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (degree !== undefined) { this.degree = degree; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * The wire or edge whose curve is rebuilt.
     * @default undefined
     */
    shape!: T;
    /**
     * The degree to rebuild to; lowering smooths the curve within the tolerance, raising keeps it
     * exact, and 3 is the practical minimum.
     * @default 3
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    degree = 3;
    /**
     * How far the rebuilt curve may stray from the old one when the degree is lowered, in model
     * units.
     * @default 0.0001
     * @minimum 0
     * @maximum Infinity
     * @step 0.0001
     */
    tolerance = 1e-4;
}
/**
 * A closed periodic wire or edge and a parameter for `moveWireSeamByParameter` and
 * `moveEdgeSeamByParameter`.
 */
export class CurveSeamByParameterDto<T> {
    constructor(shape?: T, parameter?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (parameter !== undefined) { this.parameter = parameter; }
    }
    /**
     * The periodic wire or edge whose seam moves; a non-periodic one comes back unchanged.
     * @default undefined
     */
    shape!: T;
    /**
     * The curve parameter where the new seam sits, in the curve's own range.
     * @default 0
     * @step 0.1
     */
    parameter = 0;
}
/**
 * A closed periodic wire or edge and a distance for `moveWireSeamByLength` and
 * `moveEdgeSeamByLength`.
 */
export class CurveSeamByLengthDto<T> {
    constructor(shape?: T, length?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (length !== undefined) { this.length = length; }
    }
    /**
     * The periodic wire or edge whose seam moves; a non-periodic one comes back unchanged.
     * @default undefined
     */
    shape!: T;
    /**
     * How far along the curve from the current start the new seam sits, in model units.
     * @default 0
     * @step 0.1
     */
    length = 0;
}
/**
 * A face, target degrees and a tolerance for `shapes.face.rebuildFaceDegree`.
 */
export class RebuildFaceDegreeDto<T> {
    constructor(shape?: T, uDegree?: number, vDegree?: number, tolerance?: number, keepTrim?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (uDegree !== undefined) { this.uDegree = uDegree; }
        if (vDegree !== undefined) { this.vDegree = vDegree; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
        if (keepTrim !== undefined) { this.keepTrim = keepTrim; }
    }
    /**
     * The face whose surface is rebuilt.
     * @default undefined
     */
    shape!: T;
    /**
     * The degree to rebuild to in U; lowering smooths within the tolerance, raising keeps the
     * surface exact, and 3 is the practical minimum.
     * @default 3
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    uDegree = 3;
    /**
     * The degree to rebuild to in V, with the same rules as `uDegree`.
     * @default 3
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    vDegree = 3;
    /**
     * How far the rebuilt surface may stray from the old one when a degree is lowered, in model
     * units.
     * @default 0.0001
     * @minimum 0
     * @maximum Infinity
     * @step 0.0001
     */
    tolerance = 1e-4;
    /**
     * When true, the face keeps its boundary wires, which is reliable when raising; when false it
     * covers the whole rebuilt surface.
     * @default false
     */
    keepTrim = false;
}
/**
 * A face and which flips to apply for `shapes.face.flipFaceUV`.
 */
export class FlipFaceUVDto<T> {
    constructor(shape?: T, swapUV?: boolean, reverseU?: boolean, reverseV?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (swapUV !== undefined) { this.swapUV = swapUV; }
        if (reverseU !== undefined) { this.reverseU = reverseU; }
        if (reverseV !== undefined) { this.reverseV = reverseV; }
    }
    /**
     * The face whose UV parameters are changed.
     * @default undefined
     */
    shape!: T;
    /**
     * When true, U and V change places.
     * @default false
     */
    swapUV = false;
    /**
     * When true, U runs the other way.
     * @default false
     */
    reverseU = false;
    /**
     * When true, V runs the other way.
     * @default false
     */
    reverseV = false;
}
/**
 * A face and fitting options for `shapes.face.normalizeFaceParametrization`, which makes equal
 * parameter steps into roughly equal distances.
 */
export class NormalizeFaceParametrizationDto<T> {
    constructor(shape?: T, normalizeU?: boolean, normalizeV?: boolean, samples?: number, tolerance?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (normalizeU !== undefined) { this.normalizeU = normalizeU; }
        if (normalizeV !== undefined) { this.normalizeV = normalizeV; }
        if (samples !== undefined) { this.samples = samples; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * The face to reparametrize.
     * @default undefined
     */
    shape!: T;
    /**
     * When true, the U parameter is evened out by distance.
     * @default true
     */
    normalizeU = true;
    /**
     * When true, the V parameter is evened out by distance.
     * @default true
     */
    normalizeV = true;
    /**
     * How many points per direction the surface is resampled at; more is closer to the original and
     * slower.
     * @default 24
     * @minimum 4
     * @maximum Infinity
     * @step 1
     */
    samples = 24;
    /**
     * How far the refitted surface may stray from the original, in model units.
     * @default 0.0001
     * @minimum 0
     * @maximum Infinity
     * @step 0.0001
     */
    tolerance = 1e-4;
}
/**
 * Several Bezier definitions for `shapes.wire.createBezierWires`, which builds one wire per
 * definition.
 */
export class BezierWiresDto {
    constructor(bezierWires?: BezierDto[], returnCompound?: boolean) {
        if (bezierWires !== undefined) { this.bezierWires = bezierWires; }
        if (returnCompound !== undefined) { this.returnCompound = returnCompound; }
    }
    /**
     * One definition per curve, as `createBezier` takes them.
     * @default undefined
     */
    bezierWires!: BezierDto[];
    /**
     * When true, the wires are packed into one compound instead of a list.
     */
    returnCompound = false;
}
