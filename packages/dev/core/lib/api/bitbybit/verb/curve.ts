import { ContextBase } from "../../context";
import { GeometryHelper } from "../../geometry-helper";
import * as Inputs from "../../inputs/inputs";
import { BaseTypes } from "../base-types";
import { MathBitByBit } from "../math";
import { VerbCurveCircle } from "./curve-circle";
import { VerbCurveEllipse } from "./curve-ellipse";

/**
 * Contains various methods for nurbs curves.
 * These methods wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
export class VerbCurve {

    public readonly circle: VerbCurveCircle;
    public readonly ellipse: VerbCurveEllipse;

    constructor(
        private readonly context: ContextBase,
        private readonly geometryHelper: GeometryHelper,
        private readonly math: MathBitByBit,
    ) {
        this.circle = new VerbCurveCircle(context, this.math);
        this.ellipse = new VerbCurveEllipse(context, this.math);
    }

    /**
     * Creates a Nurbs curve by providing knots, control points & weights
     * @param inputs Contains knots, control points and weights
     * @returns Nurbs curve
     */
    createCurveByKnotsControlPointsWeights(inputs: Inputs.Verb.CurveNurbsDataDto): any {
        return this.context.verb.geom.NurbsCurve.byKnotsControlPointsWeights(inputs.degree, inputs.knots, inputs.points, inputs.weights);
    }

    /**
     * Creates a Nurbs curve by providing control points
     * @param inputs Control points
     * @returns Nurbs curve
     */
    createCurveByPoints(inputs: Inputs.Verb.CurvePathDataDto): any {
        return this.context.verb.geom.NurbsCurve.byPoints(inputs.points, inputs.degree);
    }

    /**
     * Creates a Bezier Nurbs curve by providing control points and weights
     * @param inputs Control points
     * @returns Bezier Nurbs curve
     */
    createBezierCurve(inputs: Inputs.Verb.BezierCurveDto): any {
        return new this.context.verb.geom.BezierCurve(inputs.points, inputs.weights);
    }

    /**
     * Clone the Nurbs curve
     * @param inputs Nurbs curve
     * @returns Nurbs curve
     */
    clone(inputs: Inputs.Verb.CurveDto): any {
        return inputs.curve.clone();
    }

    /**
     * Finds the closest param on the Nurbs curve from the point
     * @param inputs Nurbs curve with point
     * @returns Param number
     */
    closestParam(inputs: Inputs.Verb.ClosestPointDto): number {
        return inputs.curve.closestParam(inputs.point);
    }

    /**
     * Finds the closest params on the Nurbs curve from the points
     * @param inputs Nurbs curve with points
     * @returns Param numbers
     */
    closestParams(inputs: Inputs.Verb.ClosestPointsDto): number[] {
        return inputs.points.map(pt => inputs.curve.closestParam(pt));
    }

    /**
     * Finds the closest point on the Nurbs curve from the point
     * @param inputs Nurbs curve with point
     * @returns Point
     */
    closestPoint(inputs: Inputs.Verb.ClosestPointDto): Inputs.Base.Point3 {
        return inputs.curve.closestPoint(inputs.point);
    }

    /**
     * Finds the closest points on the Nurbs curve from the list of points
     * @param inputs Nurbs curve with points
     * @returns Points
     */
    closestPoints(inputs: Inputs.Verb.ClosestPointsDto): Inputs.Base.Point3[] {
        return inputs.points.map(pt => inputs.curve.closestPoint(pt));
    }

    /**
     * Finds the control points of the Nurbs curve
     * @param inputs Nurbs curve
     * @returns Points
     */
    controlPoints(inputs: Inputs.Verb.CurveDto): Inputs.Base.Point3[] {
        return inputs.curve.controlPoints();
    }

    /**
     * Finds the degree of the Nurbs curve
     * @param inputs Nurbs curve
     * @returns Degree number
     */
    degree(inputs: Inputs.Verb.CurveDto): number {
        return inputs.curve.degree();
    }

    /**
     * Finds the derivatives of the Nurbs curve at parameter
     * @param inputs Nurbs curve with specified derivative number and parameter
     * @returns Derivatives
     */
    derivatives(inputs: Inputs.Verb.CurveDerivativesDto): number[] {
        return inputs.curve.derivatives(inputs.parameter, inputs.numDerivatives);
    }

    /**
     * Divides the curve by equal arc length to parameters
     * @param inputs Nurbs curve
     * @returns Parameters
     */
    divideByEqualArcLengthToParams(inputs: Inputs.Verb.CurveSubdivisionsDto): number[] {
        const segments: BaseTypes.UVDto[] = inputs.curve.divideByEqualArcLength(inputs.subdivision);
        return segments.map(s => s.u);
    }

    /**
     * Divides the curve by equal arc length to points
     * @param inputs Nurbs curve
     * @returns Points
     */
    divideByEqualArcLengthToPoints(inputs: Inputs.Verb.CurveSubdivisionsDto): Inputs.Base.Point3[] {
        const segments: BaseTypes.UVDto[] = inputs.curve.divideByEqualArcLength(inputs.subdivision);
        return segments.map(s => inputs.curve.point(s.u));
    }

    /**
     * Divides the curve by arc length to parameters
     * @param inputs Nurbs curve
     * @returns Parameters
     */
    divideByArcLengthToParams(inputs: Inputs.Verb.CurveDivideLengthDto): number[] {
        const segments: BaseTypes.UVDto[] = inputs.curve.divideByArcLength(inputs.length);
        return segments.map(s => s.u);
    }

    /**
     * Divides the curve by arc length to points
     * @param inputs Nurbs curve
     * @returns Points
     */
    divideByArcLengthToPoints(inputs: Inputs.Verb.CurveDivideLengthDto): Inputs.Base.Point3[] {
        const segments: BaseTypes.UVDto[] = inputs.curve.divideByArcLength(inputs.length);
        return segments.map(s => inputs.curve.point(s.u));
    }

    /**
     * Divides multiple curves by equal arc length to points
     * @param inputs Nurbs curves
     * @returns Points placed for each curve in separate arrays
     */
    divideCurvesByEqualArcLengthToPoints(inputs: Inputs.Verb.CurvesSubdivisionsDto): Inputs.Base.Point3[][] {
        return inputs.curves.map(curve => this.divideByEqualArcLengthToPoints({ curve, subdivision: inputs.subdivision }));
    }

    /**
     * Divides multiple curves by arc length to points
     * @param inputs Nurbs curves
     * @returns Points placed for each curve in separate arrays
     */
    divideCurvesByArcLengthToPoints(inputs: Inputs.Verb.CurvesDivideLengthDto): Inputs.Base.Point3[][] {
        return inputs.curves.map(curve => this.divideByArcLengthToPoints({ curve, length: inputs.length }));
    }

    /**
     * Finds the domain interval of the curve parameters
     * @param inputs Nurbs curve
     * @returns Interval domain
     */
    domain(inputs: Inputs.Verb.CurveDto): BaseTypes.IntervalDto {
        return inputs.curve.domain();
    }

    /**
     * Start point of the curve
     * @param inputs Nurbs curve
     * @returns Start point
     */
    startPoint(inputs: Inputs.Verb.CurveDto): Inputs.Base.Point3 {
        return inputs.curve.point(inputs.curve.domain().min);
    }

    /**
     * End point of the curve
     * @param inputs Nurbs curve
     * @returns End point
     */
    endPoint(inputs: Inputs.Verb.CurveDto): Inputs.Base.Point3 {
        return inputs.curve.point(inputs.curve.domain().max);
    }
    /**
     * Start points of the curves
     * @param inputs Nurbs curves
     * @returns Start points
     */
    startPoints(inputs: Inputs.Verb.CurvesDto): Inputs.Base.Point3[] {
        return inputs.curves.map(curve => this.startPoint({ curve }));
    }

    /**
     * End points of the curves
     * @param inputs Nurbs curves
     * @returns End points
     */
    endPoints(inputs: Inputs.Verb.CurvesDto): Inputs.Base.Point3[] {
        return inputs.curves.map(curve => this.endPoint({ curve }));
    }

    /**
     * Finds the knots of the Nurbs curve
     * @param inputs Nurbs curve
     * @returns Knots
     */
    knots(inputs: Inputs.Verb.CurveDto): number[] {
        return inputs.curve.knots();
    }

    /**
     * Gets the length of the Nurbs curve at specific parameter
     * @param inputs Nurbs curve and parameter
     * @returns Length
     */
    lengthAtParam(inputs: Inputs.Verb.CurveParameterDto): number {
        return inputs.curve.lengthAtParam(inputs.parameter);
    }

    /**
     * Gets the length of the Nurbs curve
     * @param inputs Nurbs curve
     * @returns Length
     */
    length(inputs: Inputs.Verb.CurveDto): number {
        return inputs.curve.length();
    }

    /**
     * Gets the param at specified length on the Nurbs curve
     * @param inputs Nurbs curve, length and tolerance
     * @returns Parameter
     */
    paramAtLength(inputs: Inputs.Verb.CurveLengthToleranceDto): number {
        return inputs.curve.paramAtLength(inputs.length, inputs.tolerance);
    }

    /**
     * Gets the point at specified parameter on the Nurbs curve
     * @param inputs Nurbs curve and a parameter
     * @returns Point
     */
    pointAtParam(inputs: Inputs.Verb.CurveParameterDto): Inputs.Base.Point3 {
        return inputs.curve.point(inputs.parameter);
    }

    /**
     * Gets the points at specified parameter on the Nurbs curves
     * @param inputs Nurbs curves and a parameter
     * @returns Points in arrays for each curve
     */
    pointsAtParam(inputs: Inputs.Verb.CurvesParameterDto): Inputs.Base.Point3[] {
        return inputs.curves.map(curve => this.pointAtParam({ curve, parameter: inputs.parameter }));
    }

    /**
     * Reverses the Nurbs curve
     * @param inputs Nurbs curve
     * @returns Reversed Nurbs curve
     */
    reverse(inputs: Inputs.Verb.CurveDto): any {
        return inputs.curve.reverse();
    }

    /**
     * Splits the Nurbs curve in two at a given parameter
     * @param inputs Nurbs curve with parameter
     * @returns Nurbs curves
     */
    split(inputs: Inputs.Verb.CurveParameterDto): any[] {
        return inputs.curve.split(inputs.parameter);
    }

    /**
     * Tangent of the Nurbs curve at a given parameter
     * @param inputs Nurbs curve with parameter
     * @returns Tangent vector
     */
    tangent(inputs: Inputs.Verb.CurveParameterDto): Inputs.Base.Vector3 {
        return inputs.curve.tangent(inputs.parameter);
    }

    /**
     * Tessellates the Nurbs curve into a list of points
     * @param inputs Nurbs curve with tolerance
     * @returns Points
     */
    tessellate(inputs: Inputs.Verb.CurveToleranceDto): Inputs.Base.Point3[] {
        return inputs.curve.tessellate(inputs.tolerance);
    }

    /**
     * Transforms the Nurbs curve
     * @param inputs Nurbs curve with transformation matrixes
     * @returns Transformed curve
     */
    transform(inputs: Inputs.Verb.CurveTransformDto): any {
        const points = inputs.curve.controlPoints();
        const transformedControlPoints = this.geometryHelper.transformControlPoints(inputs.transformation, points);
        return this.context.verb.geom.NurbsCurve.byKnotsControlPointsWeights(
            inputs.curve.degree(), inputs.curve.knots(), transformedControlPoints, inputs.curve.weights()
        );
    }

    /**
     * Transforms the Nurbs curves
     * @param inputs Nurbs curves with transformation matrixes
     * @returns Transformed curves
     */
    transformCurves(inputs: Inputs.Verb.CurvesTransformDto): any[] {
        return inputs.curves.map(curve => this.transform({ curve, transformation: inputs.transformation }));
    }

    /**
     * Weights of the Nurbs curve
     * @param inputs Nurbs curve
     * @returns Weights
     */
    weights(inputs: Inputs.Verb.CurveDto): number[] {
        return inputs.curve.weights();
    }
}
