
import { LinesMesh } from '@babylonjs/core';
import { Context } from '../../context';
import { GeometryHelper } from '../../geometry-helper';
import * as Inputs from '../../inputs/inputs';
import { BaseTypes } from '../base-types';
import { VerbCurveCircle } from './curve-circle';
import { VerbCurveEllipse } from './curve-ellipse';

/**
 * Contains various methods for nurbs curves.
 * These methods wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
export class VerbCurve {

    public readonly circle: VerbCurveCircle;
    public readonly ellipse: VerbCurveEllipse;

    constructor(
        private readonly context: Context,
        private readonly geometryHelper: GeometryHelper
    ) {
        this.circle = new VerbCurveCircle(context);
        this.ellipse = new VerbCurveEllipse(context);
    }

    /**
     * Draws a single curve
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.VerbCurve.html#drawCurve
     * @param inputs Contains a curve to be drawn
     * @returns Lines mesh that is being drawn by Babylon
     */
    drawCurve(inputs: Inputs.Verb.DrawCurveDto): LinesMesh {
        const points = inputs.curve.tessellate();
        return this.geometryHelper.drawPolyline(
            inputs.curveMesh,
            points,
            inputs.updatable,
            inputs.size,
            inputs.opacity,
            inputs.colours
        );
    }

    /**
     * Draws multiple curves
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.VerbCurve.html#drawCurves
     * @param inputs Contains curves to be drawn
     * @returns Lines mesh that is being drawn by Babylon
     */
    drawCurves(inputs: Inputs.Verb.DrawCurvesDto): LinesMesh {
        const points = inputs.curves.map(s => s.tessellate());
        return this.geometryHelper.drawPolylines(
            inputs.curvesMesh,
            points,
            inputs.updatable,
            inputs.size,
            inputs.opacity,
            inputs.colours
        );
    }

    /**
     * Creates a Nurbs curve by providing knots, control points & weights
     * <div>
     *  <img src="../assets/images/blockly-images/curve/createCurveByKnotsControlPointsWeights.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.VerbCurve.html#createCurveByKnotsControlPointsWeights
     * @param inputs Contains knots, control points and weights
     * @returns Nurbs curve
     */
    createCurveByKnotsControlPointsWeights(inputs: Inputs.Verb.CurveNurbsDataDto): any {
        return this.context.verb.geom.NurbsCurve.byKnotsControlPointsWeights(inputs.degree, inputs.knots, inputs.points, inputs.weights);
    }

    /**
     * Creates a Nurbs curve by providing control points
     * <div>
     *  <img src="../assets/images/blockly-images/curve/createCurveByPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.VerbCurve.html#createCurveByPoints
     * @param inputs Control points
     * @returns Nurbs curve
     */
    createCurveByPoints(inputs: Inputs.Verb.CurvePathDataDto): any {
        return this.context.verb.geom.NurbsCurve.byPoints(inputs.points, inputs.degree);
    }

    /**
     * Creates a Bezier Nurbs curve by providing control points and weights
     * <div>
     *  <img src="../assets/images/blockly-images/curve/createBezierCurve.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.VerbCurve.html#createBezierCurve
     * @param inputs Control points
     * @returns Bezier Nurbs curve
     */
    createBezierCurve(inputs: Inputs.Verb.BezierCurveDto): any {
        return new this.context.verb.geom.BezierCurve(inputs.points, inputs.weights);
    }

    /**
     * Clone the Nurbs curve
     * <div>
     *  <img src="../assets/images/blockly-images/curve/clone.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.VerbCurve.html#clone
     * @param inputs Nurbs curve
     * @returns Nurbs curve
     */
    clone(inputs: Inputs.Verb.CurveDto): any {
        return inputs.curve.clone();
    }

    /**
     * Finds the closest param on the Nurbs curve from the point
     * <div>
     *  <img src="../assets/images/blockly-images/curve/closestParam.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.VerbCurve.html#closestParam
     * @param inputs Nurbs curve with point
     * @returns Param number
     */
    closestParam(inputs: Inputs.Verb.ClosestPointDto): number {
        return inputs.curve.closestParam(inputs.point);
    }

    /**
     * Finds the closest params on the Nurbs curve from the points
     * <div>
     *  <img src="../assets/images/blockly-images/curve/closestParams.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.VerbCurve.html#closestParams
     * @param inputs Nurbs curve with points
     * @returns Param numbers
     */
    closestParams(inputs: Inputs.Verb.ClosestPointsDto): number[] {
        return inputs.points.map(pt => inputs.curve.closestParam(pt));
    }

    /**
     * Finds the closest point on the Nurbs curve from the point
     * <div>
     *  <img src="../assets/images/blockly-images/curve/closestPoint.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.VerbCurve.html#closestPoint
     * @param inputs Nurbs curve with point
     * @returns Point
     */
    closestPoint(inputs: Inputs.Verb.ClosestPointDto): Inputs.Base.Point3 {
        return inputs.curve.closestPoint(inputs.point);
    }

    /**
     * Finds the closest points on the Nurbs curve from the list of points
     * <div>
     *  <img src="../assets/images/blockly-images/curve/closestPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.VerbCurve.html#closestPoints
     * @param inputs Nurbs curve with points
     * @returns Points
     */
    closestPoints(inputs: Inputs.Verb.ClosestPointsDto): Inputs.Base.Point3[] {
        return inputs.points.map(pt => inputs.curve.closestPoint(pt));
    }

    /**
     * Finds the control points of the Nurbs curve
     * <div>
     *  <img src="../assets/images/blockly-images/curve/controlPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.VerbCurve.html#controlPoints
     * @param inputs Nurbs curve
     * @returns Points
     */
    controlPoints(inputs: Inputs.Verb.CurveDto): Inputs.Base.Point3[] {
        return inputs.curve.controlPoints();
    }

    /**
     * Finds the degree of the Nurbs curve
     * <div>
     *  <img src="../assets/images/blockly-images/curve/degree.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.VerbCurve.html#degree
     * @param inputs Nurbs curve
     * @returns Degree number
     */
    degree(inputs: Inputs.Verb.CurveDto): number {
        return inputs.curve.degree();
    }

    /**
     * Finds the derivatives of the Nurbs curve at parameter
     * <div>
     *  <img src="../assets/images/blockly-images/curve/derivatives.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.VerbCurve.html#derivatives
     * @param inputs Nurbs curve with specified derivative number and parameter
     * @returns Derivatives
     */
    derivatives(inputs: Inputs.Verb.CurveDerivativesDto): number[] {
        return inputs.curve.derivatives(inputs.parameter, inputs.numDerivatives);
    }

    /**
     * Divides the curve by equal arc length to parameters
     * <div>
     *  <img src="../assets/images/blockly-images/curve/divideByEqualArcLengthToParams.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.VerbCurve.html#divideByEqualArcLengthToParams
     * @param inputs Nurbs curve
     * @returns Parameters
     */
    divideByEqualArcLengthToParams(inputs: Inputs.Verb.CurveSubdivisionsDto): number[] {
        const segments: BaseTypes.UVDto[] = inputs.curve.divideByEqualArcLength(inputs.subdivision);
        return segments.map(s => s.u);
    }

    /**
     * Divides the curve by equal arc length to points
     * <div>
     *  <img src="../assets/images/blockly-images/curve/divideByEqualArcLengthToPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.VerbCurve.html#divideByEqualArcLengthToPoints
     * @param inputs Nurbs curve
     * @returns Points
     */
    divideByEqualArcLengthToPoints(inputs: Inputs.Verb.CurveSubdivisionsDto): Inputs.Base.Point3[] {
        const segments: BaseTypes.UVDto[] = inputs.curve.divideByEqualArcLength(inputs.subdivision);
        return segments.map(s => inputs.curve.point(s.u));
    }

    /**
     * Divides the curve by arc length to parameters
     * <div>
     *  <img src="../assets/images/blockly-images/curve/divideByArcLengthToParams.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.VerbCurve.html#divideByArcLengthToParams
     * @param inputs Nurbs curve
     * @returns Parameters
     */
    divideByArcLengthToParams(inputs: Inputs.Verb.CurveDivideLengthDto): number[] {
        const segments: BaseTypes.UVDto[] = inputs.curve.divideByArcLength(inputs.length);
        return segments.map(s => s.u);
    }

    /**
     * Divides the curve by arc length to points
     * <div>
     *  <img src="../assets/images/blockly-images/curve/divideByArcLengthToPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.VerbCurve.html#divideByArcLengthToPoints
     * @param inputs Nurbs curve
     * @returns Points
     */
    divideByArcLengthToPoints(inputs: Inputs.Verb.CurveDivideLengthDto): Inputs.Base.Point3[] {
        const segments: BaseTypes.UVDto[] = inputs.curve.divideByArcLength(inputs.length);
        return segments.map(s => inputs.curve.point(s.u));
    }

    /**
     * Divides multiple curves by equal arc length to points
     * <div>
     *  <img src="../assets/images/blockly-images/curve/divideCurvesByEqualArcLengthToPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.VerbCurve.html#divideCurvesByEqualArcLengthToPoints
     * @param inputs Nurbs curves
     * @returns Points placed for each curve in separate arrays
     */
    divideCurvesByEqualArcLengthToPoints(inputs: Inputs.Verb.CurvesSubdivisionsDto): Inputs.Base.Point3[][] {
        return inputs.curves.map(curve => this.divideByEqualArcLengthToPoints({ curve, subdivision: inputs.subdivision }));
    }

    /**
     * Divides multiple curves by arc length to points
     * <div>
     *  <img src="../assets/images/blockly-images/curve/divideCurvesByArcLengthToPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.VerbCurve.html#divideCurvesByArcLengthToPoints
     * @param inputs Nurbs curves
     * @returns Points placed for each curve in separate arrays
     */
    divideCurvesByArcLengthToPoints(inputs: Inputs.Verb.CurvesDivideLengthDto): Inputs.Base.Point3[][] {
        return inputs.curves.map(curve => this.divideByArcLengthToPoints({ curve, length: inputs.length }));
    }

    /**
     * Finds the domain interval of the curve parameters
     * <div>
     *  <img src="../assets/images/blockly-images/curve/domain.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.VerbCurve.html#domain
     * @param inputs Nurbs curve
     * @returns Interval domain
     */
    domain(inputs: Inputs.Verb.CurveDto): BaseTypes.IntervalDto {
        return inputs.curve.domain();
    }

    /**
     * Start point of the curve
     * <div>
     *  <img src="../assets/images/blockly-images/curve/startPoint.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.VerbCurve.html#startPoint
     * @param inputs Nurbs curve
     * @returns Start point
     */
    startPoint(inputs: Inputs.Verb.CurveDto): Inputs.Base.Point3 {
        return inputs.curve.point(inputs.curve.domain().min);
    }

    /**
     * End point of the curve
     * <div>
     *  <img src="../assets/images/blockly-images/curve/endPoint.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.VerbCurve.html#endPoint
     * @param inputs Nurbs curve
     * @returns End point
     */
    endPoint(inputs: Inputs.Verb.CurveDto): Inputs.Base.Point3 {
        return inputs.curve.point(inputs.curve.domain().max);
    }
    /**
     * Start points of the curves
     * <div>
     *  <img src="../assets/images/blockly-images/curve/startPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.VerbCurve.html#startPoints
     * @param inputs Nurbs curves
     * @returns Start points
     */
    startPoints(inputs: Inputs.Verb.CurvesDto): Inputs.Base.Point3[] {
        return inputs.curves.map(curve => this.startPoint({ curve }));
    }

    /**
     * End points of the curves
     * <div>
     *  <img src="../assets/images/blockly-images/curve/endPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.VerbCurve.html#endPoints
     * @param inputs Nurbs curves
     * @returns End points
     */
    endPoints(inputs: Inputs.Verb.CurvesDto): Inputs.Base.Point3[] {
        return inputs.curves.map(curve => this.endPoint({ curve }));
    }

    /**
     * Finds the knots of the Nurbs curve
     * <div>
     *  <img src="../assets/images/blockly-images/curve/knots.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.VerbCurve.html#knots
     * @param inputs Nurbs curve
     * @returns Knots
     */
    knots(inputs: Inputs.Verb.CurveDto): number[] {
        return inputs.curve.knots();
    }

    /**
     * Gets the length of the Nurbs curve at specific parameter
     * <div>
     *  <img src="../assets/images/blockly-images/curve/lengthAtParam.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.VerbCurve.html#lengthAtParam
     * @param inputs Nurbs curve and parameter
     * @returns Length
     */
    lengthAtParam(inputs: Inputs.Verb.CurveParameterDto): number {
        return inputs.curve.lengthAtParam(inputs.parameter);
    }

    /**
     * Gets the length of the Nurbs curve
     * <div>
     *  <img src="../assets/images/blockly-images/curve/length.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.VerbCurve.html#length
     * @param inputs Nurbs curve
     * @returns Length
     */
    length(inputs: Inputs.Verb.CurveDto): number {
        return inputs.curve.length();
    }

    /**
     * Gets the param at specified length on the Nurbs curve
     * <div>
     *  <img src="../assets/images/blockly-images/curve/paramAtLength.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.VerbCurve.html#paramAtLength
     * @param inputs Nurbs curve, length and tolerance
     * @returns Parameter
     */
    paramAtLength(inputs: Inputs.Verb.CurveLengthToleranceDto): number {
        return inputs.curve.paramAtLength(inputs.length, inputs.tolerance);
    }

    /**
     * Gets the point at specified parameter on the Nurbs curve
     * <div>
     *  <img src="../assets/images/blockly-images/curve/pointAtParam.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.VerbCurve.html#pointAtParam
     * @param inputs Nurbs curve and a parameter
     * @returns Point
     */
    pointAtParam(inputs: Inputs.Verb.CurveParameterDto): Inputs.Base.Point3 {
        return inputs.curve.point(inputs.parameter);
    }

    /**
     * Gets the points at specified parameter on the Nurbs curves
     * <div>
     *  <img src="../assets/images/blockly-images/curve/pointAtParam.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.VerbCurve.html#pointsAtParam
     * @param inputs Nurbs curves and a parameter
     * @returns Points in arrays for each curve
     */
    pointsAtParam(inputs: Inputs.Verb.CurvesParameterDto): Inputs.Base.Point3[] {
        return inputs.curves.map(curve => this.pointAtParam({ curve, parameter: inputs.parameter }));
    }

    /**
     * Reverses the Nurbs curve
     * <div>
     *  <img src="../assets/images/blockly-images/curve/reverse.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.VerbCurve.html#reverse
     * @param inputs Nurbs curve
     * @returns Reversed Nurbs curve
     */
    reverse(inputs: Inputs.Verb.CurveDto): any {
        return inputs.curve.reverse();
    }

    /**
     * Splits the Nurbs curve in two at a given parameter
     * <div>
     *  <img src="../assets/images/blockly-images/curve/split.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.VerbCurve.html#split
     * @param inputs Nurbs curve with parameter
     * @returns Nurbs curves
     */
    split(inputs: Inputs.Verb.CurveParameterDto): any[] {
        return inputs.curve.split(inputs.parameter);
    }

    /**
     * Tangent of the Nurbs curve at a given parameter
     * <div>
     *  <img src="../assets/images/blockly-images/curve/tangent.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.VerbCurve.html#tangent
     * @param inputs Nurbs curve with parameter
     * @returns Tangent vector
     */
    tangent(inputs: Inputs.Verb.CurveParameterDto): Inputs.Base.Vector3 {
        return inputs.curve.tangent(inputs.parameter);
    }

    /**
     * Tessellates the Nurbs curve into a list of points
     * <div>
     *  <img src="../assets/images/blockly-images/curve/tessellate.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.VerbCurve.html#tessellate
     * @param inputs Nurbs curve with tolerance
     * @returns Points
     */
    tessellate(inputs: Inputs.Verb.CurveToleranceDto): Inputs.Base.Point3[] {
        return inputs.curve.tessellate(inputs.tolerance);
    }

    /**
     * Transforms the Nurbs curve
     * <div>
     *  <img src="../assets/images/blockly-images/curve/transform.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.VerbCurve.html#transform
     * @param inputs Nurbs curve with transformation matrixes
     * @returns Transformed curve
     */
    transform(inputs: Inputs.Verb.CurveTransformDto): any {
        const points = inputs.curve.controlPoints();
        const transformedControlPoints = this.geometryHelper.transformControlPoints(inputs.matrix, points);
        return this.context.verb.geom.NurbsCurve.byKnotsControlPointsWeights(
            inputs.curve.degree(), inputs.curve.knots(), transformedControlPoints, inputs.curve.weights()
        );
    }

    /**
     * Transforms the Nurbs curves
     * <div>
     *  <img src="../assets/images/blockly-images/curve/transformCurves.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.VerbCurve.html#transformcurves
     * @param inputs Nurbs curves with transformation matrixes
     * @returns Transformed curves
     */
    transformCurves(inputs: Inputs.Verb.CurvesTransformDto): any[] {
        return inputs.curves.map(curve => this.transform({ curve, matrix: inputs.matrix }));
    }

    /**
     * Weights of the Nurbs curve
     * <div>
     *  <img src="../assets/images/blockly-images/curve/weights.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.VerbCurve.html#weights
     * @param inputs Nurbs curve
     * @returns Weights
     */
    weights(inputs: Inputs.Verb.CurveDto): number[] {
        return inputs.curve.weights();
    }
}
