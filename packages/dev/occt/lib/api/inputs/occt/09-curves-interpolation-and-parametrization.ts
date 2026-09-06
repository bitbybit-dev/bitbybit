// A fragment of the OCCT inputs namespace: scripts/gen-occ-inputs.mjs assembles every file in this
// directory, in file-name order, into ../occ-inputs.ts. Edit here, then regenerate.
import { Base } from "@bitbybit-dev/base";
import { combinationCirclesForFaceEnum, fourSidesStrictEnum, twoSidesStrictEnum, wireFromPointsTypeEnum } from "./02-enums";

export class BSplineDto {
    constructor(points?: Base.Point3[], closed?: boolean) {
        if (points !== undefined) { this.points = points; }
        if (closed !== undefined) { this.closed = closed; }
    }
    /**
     * Points through which the BSpline will be created
     * @default undefined
     */
    points!: Base.Point3[];
    /**
     * Indicates wether BSpline will be cloed
     * @default false
     */
    closed = false;
}
export class BSplinesDto {
    constructor(bSplines?: BSplineDto[], returnCompound?: boolean) {
        if (bSplines !== undefined) { this.bSplines = bSplines; }
        if (returnCompound !== undefined) { this.returnCompound = returnCompound; }
    }
    /**
     * BSpline definitions
     * @default undefined
     */
    bSplines!: BSplineDto[];
    /**
     * Indicates whether the shapes should be returned as a compound
     */
    returnCompound = false;
}
export class WireFromTwoCirclesTanDto<T> {
    constructor(circle1?: T, circle2?: T, keepLines?: twoSidesStrictEnum, circleRemainders?: fourSidesStrictEnum, tolerance?: number) {
        if (circle1 !== undefined) { this.circle1 = circle1; }
        if (circle2 !== undefined) { this.circle2 = circle2; }
        if (keepLines !== undefined) { this.keepLines = keepLines; }
        if (circleRemainders !== undefined) { this.circleRemainders = circleRemainders; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * The first circle to be encloed with tangential lines
     * @default undefined
     */
    circle1!: T;
    /**
     * The second circle to be encloed with tangential lines
     * @default undefined
     */
    circle2!: T;
    /**
     * Choose which side to keep for the wire. Outside gives non-intersecting solution.
     * @default outside
     */
    keepLines: twoSidesStrictEnum = twoSidesStrictEnum.outside;
    /**
     * Choose which side to keep for the wire. Outside gives non-intersecting solution.
     * @default outside
     */
    circleRemainders: fourSidesStrictEnum = fourSidesStrictEnum.outside;
    /**
     * tolerance
     * @default 1e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.00001
     */
    tolerance = 1e-7;
}
export class FaceFromMultipleCircleTanWiresDto<T> {
    constructor(circles?: T[], combination?: combinationCirclesForFaceEnum, unify?: boolean, tolerance?: number) {
        if (circles !== undefined) { this.circles = circles; }
        if (combination !== undefined) { this.combination = combination; }
        if (unify !== undefined) { this.unify = unify; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * The circles that will all be joined into a single face through tangential lines
     * @default undefined
     */
    circles!: T[];
    /**
     * Indicates how circles should be joined together. Users can choose to join all circles with each other. Alternatively it is possible to respect the order of circles and only join consecutive circles. It is also possible to respect order and close the shape with first circle in the list.
     * @default allWithAll
     */
    combination: combinationCirclesForFaceEnum = combinationCirclesForFaceEnum.allWithAll;
    /**
     * Choose whether you want faces to be unifided into a single face or not. Sometimes if you want to get faster result you can set this to false, but in this case faces will be returned as compound.
     * @default true
     */
    unify = true;
    /**
     * tolerance
     * @default 1e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.00001
     */
    tolerance = 1e-7;
}
export class FaceFromMultipleCircleTanWireCollectionsDto<T> {
    constructor(listsOfCircles?: T[][], combination?: combinationCirclesForFaceEnum, unify?: boolean, tolerance?: number) {
        if (listsOfCircles !== undefined) { this.listsOfCircles = listsOfCircles; }
        if (combination !== undefined) { this.combination = combination; }
        if (unify !== undefined) { this.unify = unify; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * The two dimensional circle array that can host multiple circle collections.
     * @default undefined
     */
    listsOfCircles!: T[][];
    /**
     * Indicates how circles should be joined together. Users can choose to join all circles with each other. Alternatively it is possible to respect the order of circles and only join consecutive circles. It is also possible to respect order and close the shape with first circle in the list.
     * @default allWithAll
     */
    combination: combinationCirclesForFaceEnum = combinationCirclesForFaceEnum.allWithAll;
    /**
     * Choose whether you want faces to be unifided into a single face or not. Sometimes if you want to get faster result you can set this to false, but in this case faces will be returned as compound.
     * @default true
     */
    unify = true;
    /**
     * tolerance
     * @default 1e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.00001
     */
    tolerance = 1e-7;
}
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
     * The first wire for zig zag
     * @default undefined
     */
    wire1!: T;
    /**
     * The second wire for zig zag
     * @default undefined
     */
    wire2!: T;
    /**
     * How many zig zags to create between the two wires on each edge. The number of edges should match. Edges will be joined by zigzags in order. One zig zag means two edges forming a corner.
     * @default 20
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrZigZags = 20;
    /**
     * Inverse the the zig zag to go from wire2 to wire1
     * @default false
     */
    inverse: boolean = false;
    /**
     * If true, the zig zags will be spaced equally on each edge. By default we follow parametric subdivision of the edges, which is not always equal to distance based subdivisions.
     * @default false
     */
    divideByEqualDistance = false;

    /**
     * By default the number of zig zags is applied to each edge. If this is set to false, the number of zig zags will be applied to the whole wire. This could then skip some corners where edges meet.
     * @default true
     */
    zigZagsPerEdge = true;
}
export class WiresBetweenStartEndPointsOfWiresAndEdgesDto<T> {
    constructor(shapes?: T[], wireType?: wireFromPointsTypeEnum, closed?: boolean, tolerance?: number) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (wireType !== undefined) { this.wireType = wireType; }
        if (closed !== undefined) { this.closed = closed; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * Two or more wires or edges whose start and end points will be connected
     * @default undefined
     */
    shapes!: T[];
    /**
     * Whether to connect the points with straight polyline segments or to interpolate a smooth BSpline through them
     * @default polyline
     */
    wireType?: wireFromPointsTypeEnum | undefined = wireFromPointsTypeEnum.polyline;
    /**
     * Whether to close the resulting wires. For polyline wires this creates a polygon, for interpolated wires this creates a periodic (closed) BSpline.
     * @default false
     */
    closed?: boolean | undefined = false;
    /**
     * Tolerance used when interpolating the BSpline (only used when wireType is interpolated)
     * @default 1e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.00001
     */
    tolerance?: number | undefined = 1e-7;
}
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
     * Two or more wires or edges that will be subdivided and connected through the points at matching subdivision indexes
     * @default undefined
     */
    shapes!: T[];
    /**
     * Into how many segments each wire or edge should be subdivided. The number of resulting wires will be nrOfDivisions + 1.
     * @default 10
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    nrOfDivisions?: number | undefined = 10;
    /**
     * If true, the subdivision points will be spaced by equal distance along each shape. By default the parametric subdivision is used, which is not always equal to distance based subdivisions.
     * @default false
     */
    divideByEqualDistance?: boolean | undefined = false;
    /**
     * Whether to connect the points with straight polyline segments or to interpolate a smooth BSpline through them
     * @default polyline
     */
    wireType?: wireFromPointsTypeEnum | undefined = wireFromPointsTypeEnum.polyline;
    /**
     * Whether to close the resulting wires. For polyline wires this creates a polygon, for interpolated wires this creates a periodic (closed) BSpline.
     * @default false
     */
    closed?: boolean | undefined = false;
    /**
     * Tolerance used when interpolating the BSpline (only used when wireType is interpolated)
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
     * Points through which the BSpline will be created
     * @default undefined
     */
    points!: Base.Point3[];
    /**
     * Indicates wether BSpline will be periodic (closed, tangent-continuous at the seam)
     * @default false
     */
    periodic = false;
    /**
     * tolerance
     * @default 1e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.00001
     */
    tolerance = 1e-7;
    /**
     * Parametrization controlling point spacing along the curve. When omitted, chord-length is
     * used (backward-compatible). Centripetal is recommended for uneven spacing as it resists
     * cusps and overshoot.
     * @default chordLength
     */
    parametrization?: bSplineParametrizationEnum | undefined;
    /**
     * Optional tangent direction enforced at the start (non-periodic only).
     * @default undefined
     * @optional true
     */
    startTangent?: Base.Vector3 | undefined;
    /**
     * Optional tangent direction enforced at the end (non-periodic only).
     * @default undefined
     * @optional true
     */
    endTangent?: Base.Vector3 | undefined;
    /**
     * Optional per-point tangent directions (one per point); entries that are undefined are
     * left free. When provided, takes precedence over startTangent/endTangent.
     * @default undefined
     * @optional true
     */
    tangents?: (Base.Vector3 | undefined)[] | undefined;
}
/**
 * Options for the symmetric interpolation. This variant is always a closed (periodic) loop and
 * derives its own tangents from the points, so it intentionally exposes only the points and
 * tolerance - periodicity, parametrization and tangent constraints do not apply here.
 */
export class InterpolateSymmetricDto {
    constructor(points?: Base.Point3[], tolerance?: number) {
        if (points !== undefined) { this.points = points; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * Points through which the symmetric closed BSpline will be created (at least 3)
     * @default undefined
     */
    points!: Base.Point3[];
    /**
     * tolerance
     * @default 1e-7
     * @minimum 0
     * @maximum Infinity
     * @step 0.00001
     */
    tolerance = 1e-7;
}
export class InterpolateWiresDto {
    constructor(interpolations?: InterpolationDto[], returnCompound?: boolean) {
        if (interpolations !== undefined) { this.interpolations = interpolations; }
        if (returnCompound !== undefined) { this.returnCompound = returnCompound; }
    }
    /**
     * Interpolation definitions
     * @default undefined
     */
    interpolations!: InterpolationDto[];
    /**
     * Indicates whether the shapes should be returned as a compound
     */
    returnCompound = false;
}
export class BezierDto {
    constructor(points?: Base.Point3[], closed?: boolean, degree?: number, periodic?: boolean) {
        if (points !== undefined) { this.points = points; }
        if (closed !== undefined) { this.closed = closed; }
        if (degree !== undefined) { this.degree = degree; }
        if (periodic !== undefined) { this.periodic = periodic; }
    }
    /**
     * Points through which the Bezier curve will be created
     * @default undefined
     */
    points!: Base.Point3[];
    /**
     * Indicates wether Bezier will be cloed
     * @default false
     */
    closed = false;
    /**
     * Optional maximum local degree. A classic Bezier has degree (controlPoints - 1), which
     * oscillates and is hard-capped at 25; when a degree is given (or there are more than 26
     * control points) a clamped bounded-degree curve is built instead, so it scales to many
     * control points while still following the control polygon. Left empty, a classic Bezier
     * (or auto bounded-degree for many points) is used.
     * @default undefined
     * @optional true
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    degree?: number | undefined;
    /**
     * Build a smooth CLOSED (periodic) curve that wraps the control polygon, continuous across the
     * seam - unlike `closed`, which only meets C0 by repeating the first point. Uses degree (or a
     * sensible default) and ignores `closed` when set.
     * @default false
     * @optional true
     */
    periodic?: boolean | undefined = false;
}
export class BezierWeightsDto {
    constructor(points?: Base.Point3[], weights?: number[], closed?: boolean, periodic?: boolean, degree?: number) {
        if (points !== undefined) { this.points = points; }
        if (weights !== undefined) { this.weights = weights; }
        if (closed !== undefined) { this.closed = closed; }
        if (periodic !== undefined) { this.periodic = periodic; }
        if (degree !== undefined) { this.degree = degree; }
    }
    /**
     * Points through which the Bezier curve will be created
     * @default undefined
     */
    points!: Base.Point3[];
    /**
    * Weights for beziers that will be used, values should be between 0 and 1
    * @default undefined
    */
    weights!: number[];
    /**
     * Indicates wether Bezier will be cloed
     * @default false
     */
    closed = false;
    /**
     * Build a smooth CLOSED (periodic) rational curve that wraps the weighted control polygon,
     * continuous across the seam - unlike `closed`, which only meets C0 by repeating the first
     * point. Requires one weight per point (the points are not duplicated). Ignores `closed` when set.
     * @default false
     * @optional true
     */
    periodic?: boolean | undefined = false;
    /**
     * Maximum local degree used when `periodic` is set (clamped to [1, points-1]); empty uses a
     * sensible default. Ignored for the non-periodic rational Bezier.
     * @default undefined
     * @optional true
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    degree?: number | undefined;
}
/** Rebuild (relax/raise) the polynomial degree of a wire or edge curve. */
export class RebuildCurveDegreeDto<T> {
    constructor(shape?: T, degree?: number, tolerance?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (degree !== undefined) { this.degree = degree; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * Wire or edge whose curve degree is rebuilt.
     * @default undefined
     */
    shape!: T;
    /**
     * Target maximum degree. Lowering relaxes the curve to a smoother, lower-order approximation
     * (within tolerance); raising is exact. The practical lower bound is 3 (cubic).
     * @default 3
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    degree = 3;
    /**
     * Tolerance used when relaxing (approximating) to a lower degree.
     * @default 0.0001
     * @minimum 0
     * @maximum Infinity
     * @step 0.0001
     */
    tolerance = 1e-4;
}
/** Move the seam (origin) of a periodic wire/edge to a given parameter value. */
export class CurveSeamByParameterDto<T> {
    constructor(shape?: T, parameter?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (parameter !== undefined) { this.parameter = parameter; }
    }
    /**
     * Periodic wire or edge whose seam is moved (non-periodic is returned unchanged).
     * @default undefined
     */
    shape!: T;
    /**
     * Parameter value at which to place the new seam (origin).
     * @default 0
     * @step 0.1
     */
    parameter = 0;
}
/** Move the seam (origin) of a periodic wire/edge by an arc length from the current start. */
export class CurveSeamByLengthDto<T> {
    constructor(shape?: T, length?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (length !== undefined) { this.length = length; }
    }
    /**
     * Periodic wire or edge whose seam is moved (non-periodic is returned unchanged).
     * @default undefined
     */
    shape!: T;
    /**
     * Arc length, measured forward from the current start, at which to place the new seam.
     * @default 0
     * @step 0.1
     */
    length = 0;
}
/** Rebuild (relax/raise) the U and V degrees of a face surface. */
export class RebuildFaceDegreeDto<T> {
    constructor(shape?: T, uDegree?: number, vDegree?: number, tolerance?: number, keepTrim?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (uDegree !== undefined) { this.uDegree = uDegree; }
        if (vDegree !== undefined) { this.vDegree = vDegree; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
        if (keepTrim !== undefined) { this.keepTrim = keepTrim; }
    }
    /**
     * Face whose surface degree is rebuilt.
     * @default undefined
     */
    shape!: T;
    /**
     * Target maximum U degree (lowering relaxes within tolerance; raising is exact; floor 3).
     * @default 3
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    uDegree = 3;
    /**
     * Target maximum V degree.
     * @default 3
     * @minimum 1
     * @maximum Infinity
     * @step 1
     */
    vDegree = 3;
    /**
     * Tolerance used when relaxing (approximating) to a lower degree.
     * @default 0.0001
     * @minimum 0
     * @maximum Infinity
     * @step 0.0001
     */
    tolerance = 1e-4;
    /**
     * Keep the face's boundary wires (reliable for a degree raise, which preserves the UV domain);
     * otherwise the face is rebuilt from the surface's natural bounds.
     * @default false
     */
    keepTrim = false;
}
/** Flip a face's UV parametrization: swap U/V and/or reverse the U or V direction. */
export class FlipFaceUVDto<T> {
    constructor(shape?: T, swapUV?: boolean, reverseU?: boolean, reverseV?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (swapUV !== undefined) { this.swapUV = swapUV; }
        if (reverseU !== undefined) { this.reverseU = reverseU; }
        if (reverseV !== undefined) { this.reverseV = reverseV; }
    }
    /**
     * Face whose UV parametrization is flipped.
     * @default undefined
     */
    shape!: T;
    /**
     * Swap the U and V directions.
     * @default false
     */
    swapUV = false;
    /**
     * Reverse the U direction.
     * @default false
     */
    reverseU = false;
    /**
     * Reverse the V direction.
     * @default false
     */
    reverseV = false;
}
/** Reparametrize a face so its U and/or V parameter is ~uniform by arc length (even iso spacing). */
export class NormalizeFaceParametrizationDto<T> {
    constructor(shape?: T, normalizeU?: boolean, normalizeV?: boolean, samples?: number, tolerance?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (normalizeU !== undefined) { this.normalizeU = normalizeU; }
        if (normalizeV !== undefined) { this.normalizeV = normalizeV; }
        if (samples !== undefined) { this.samples = samples; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * Face to reparametrize.
     * @default undefined
     */
    shape!: T;
    /**
     * Make the U parameter ~uniform by arc length.
     * @default true
     */
    normalizeU = true;
    /**
     * Make the V parameter ~uniform by arc length.
     * @default true
     */
    normalizeV = true;
    /**
     * Resampling grid resolution per direction (higher = more faithful, slower).
     * @default 24
     * @minimum 4
     * @maximum Infinity
     * @step 1
     */
    samples = 24;
    /**
     * Refit tolerance.
     * @default 0.0001
     * @minimum 0
     * @maximum Infinity
     * @step 0.0001
     */
    tolerance = 1e-4;
}
export class BezierWiresDto {
    constructor(bezierWires?: BezierDto[], returnCompound?: boolean) {
        if (bezierWires !== undefined) { this.bezierWires = bezierWires; }
        if (returnCompound !== undefined) { this.returnCompound = returnCompound; }
    }
    /**
     * Bezier wires
     * @default undefined
     */
    bezierWires!: BezierDto[];
    /**
     * Indicates whether the shapes should be returned as a compound
     */
    returnCompound = false;
}
