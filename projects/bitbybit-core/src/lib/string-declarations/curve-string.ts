import { simplifyDeclaration } from './simplify-declaration';

export const curveString = simplifyDeclaration(`
import { LinesMesh } from '@babylonjs/core';
import { Context } from '../context';
import { GeometryHelper } from '../geometry-helper';
import * as Inputs from '../inputs/inputs';
import { BaseTypes } from './base-types';
import { CurveCircle } from './curve-circle';
import { CurveEllipse } from './curve-ellipse';
/**
 * Contains various methods for nurbs curves.
 * These methods wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
export declare class Curve {
    readonly circle: CurveCircle;
    readonly ellipse: CurveEllipse;
    private readonly context;
    private readonly geometryHelper;
    constructor(circle: CurveCircle, ellipse: CurveEllipse, context: Context, geometryHelper: GeometryHelper);
    /**
     * Draws a single curve
     * <div>
     *  <img src="../assets/images/blockly-images/curve/drawCurve.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#drawcurve
     * @param inputs Contains a curve to be drawn
     * @returns Lines mesh that is being drawn by Babylon
     */
    drawCurve(inputs: Inputs.Curve.DrawCurveDto): LinesMesh;
    /**
     * Draws multiple curves
     * <div>
     *  <img src="../assets/images/blockly-images/curve/drawCurves.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#drawcurves
     * @param inputs Contains curves to be drawn
     * @returns Lines mesh that is being drawn by Babylon
     */
    drawCurves(inputs: Inputs.Curve.DrawCurvesDto): LinesMesh;
    /**
     * Creates a Nurbs curve by providing knots, control points & weights
     * <div>
     *  <img src="../assets/images/blockly-images/curve/createCurveByKnotsControlPointsWeights.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#createcurvebyknotscontrolpointsweights
     * @param inputs Contains knots, control points and weights
     * @returns Nurbs curve
     */
    createCurveByKnotsControlPointsWeights(inputs: Inputs.Curve.CurveNurbsDataDto): any;
    /**
     * Creates a Nurbs curve by providing control points
     * <div>
     *  <img src="../assets/images/blockly-images/curve/createCurveByPoints.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#createcurvebypoints
     * @param inputs Control points
     * @returns Nurbs curve
     */
    createCurveByPoints(inputs: Inputs.Curve.CurvePathDataDto): any;
    /**
     * Creates a Bezier Nurbs curve by providing control points and weights
     * <div>
     *  <img src="../assets/images/blockly-images/curve/createBezierCurve.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#createbeziercurve
     * @param inputs Control points
     * @returns Bezier Nurbs curve
     */
    createBezierCurve(inputs: Inputs.Curve.BezierCurveDto): any;
    /**
     * Clone the Nurbs curve
     * <div>
     *  <img src="../assets/images/blockly-images/curve/clone.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#clone
     * @param inputs Nurbs curve
     * @returns Nurbs curve
     */
    clone(inputs: Inputs.Curve.CurveDto): any;
    /**
     * Finds the closest param on the Nurbs curve from the point
     * <div>
     *  <img src="../assets/images/blockly-images/curve/closestParam.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#closestparam
     * @param inputs Nurbs curve with point
     * @returns Param number
     */
    closestParam(inputs: Inputs.Curve.ClosestPointDto): number;
    /**
     * Finds the closest params on the Nurbs curve from the points
     * <div>
     *  <img src="../assets/images/blockly-images/curve/closestParams.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#closestparams
     * @param inputs Nurbs curve with points
     * @returns Param numbers
     */
    closestParams(inputs: Inputs.Curve.ClosestPointsDto): number[];
    /**
     * Finds the closest point on the Nurbs curve from the point
     * <div>
     *  <img src="../assets/images/blockly-images/curve/closestPoint.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#closestpoint
     * @param inputs Nurbs curve with point
     * @returns Point
     */
    closestPoint(inputs: Inputs.Curve.ClosestPointDto): number[];
    /**
     * Finds the closest points on the Nurbs curve from the list of points
     * <div>
     *  <img src="../assets/images/blockly-images/curve/closestPoints.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#closestpoints
     * @param inputs Nurbs curve with points
     * @returns Points
     */
    closestPoints(inputs: Inputs.Curve.ClosestPointsDto): number[][];
    /**
     * Finds the control points of the Nurbs curve
     * <div>
     *  <img src="../assets/images/blockly-images/curve/controlPoints.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#controlpoints
     * @param inputs Nurbs curve
     * @returns Points
     */
    controlPoints(inputs: Inputs.Curve.CurveDto): number[][];
    /**
     * Finds the degree of the Nurbs curve
     * <div>
     *  <img src="../assets/images/blockly-images/curve/degree.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#degree
     * @param inputs Nurbs curve
     * @returns Degree number
     */
    degree(inputs: Inputs.Curve.CurveDto): number;
    /**
     * Finds the derivatives of the Nurbs curve at parameter
     * <div>
     *  <img src="../assets/images/blockly-images/curve/derivatives.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#derivatives
     * @param inputs Nurbs curve with specified derivative number and parameter
     * @returns Derivatives
     */
    derivatives(inputs: Inputs.Curve.CurveDerivativesDto): number[];
    /**
     * Divides the curve by equal arc length to parameters
     * <div>
     *  <img src="../assets/images/blockly-images/curve/divideByEqualArcLengthToParams.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#dividebyequalarclengthtoparams
     * @param inputs Nurbs curve
     * @returns Parameters
     */
    divideByEqualArcLengthToParams(inputs: Inputs.Curve.CurveSubdivisionsDto): number[];
    /**
     * Divides the curve by equal arc length to points
     * <div>
     *  <img src="../assets/images/blockly-images/curve/divideByEqualArcLengthToPoints.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#dividebyequalarclengthtopoints
     * @param inputs Nurbs curve
     * @returns Points
     */
    divideByEqualArcLengthToPoints(inputs: Inputs.Curve.CurveSubdivisionsDto): number[][];
    /**
     * Divides the curve by arc length to parameters
     * <div>
     *  <img src="../assets/images/blockly-images/curve/divideByArcLengthToParams.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#dividebyarclengthtoparams
     * @param inputs Nurbs curve
     * @returns Parameters
     */
    divideByArcLengthToParams(inputs: Inputs.Curve.CurveDivideLengthDto): number[];
    /**
     * Divides the curve by arc length to points
     * <div>
     *  <img src="../assets/images/blockly-images/curve/divideByArcLengthToPoints.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#dividebyarclengthtopoints
     * @param inputs Nurbs curve
     * @returns Points
     */
    divideByArcLengthToPoints(inputs: Inputs.Curve.CurveDivideLengthDto): number[][];
    /**
     * Divides multiple curves by equal arc length to points
     * <div>
     *  <img src="../assets/images/blockly-images/curve/divideCurvesByEqualArcLengthToPoints.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#dividecurvesbyequalarclengthtopoints
     * @param inputs Nurbs curves
     * @returns Points placed for each curve in separate arrays
     */
    divideCurvesByEqualArcLengthToPoints(inputs: Inputs.Curve.CurvesSubdivisionsDto): number[][][];
    /**
     * Divides multiple curves by arc length to points
     * <div>
     *  <img src="../assets/images/blockly-images/curve/divideCurvesByArcLengthToPoints.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#dividecurvesbyarclengthtopoints
     * @param inputs Nurbs curves
     * @returns Points placed for each curve in separate arrays
     */
    divideCurvesByArcLengthToPoints(inputs: Inputs.Curve.CurvesDivideLengthDto): number[][][];
    /**
     * Finds the domain interval of the curve parameters
     * <div>
     *  <img src="../assets/images/blockly-images/curve/domain.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#domain
     * @param inputs Nurbs curve
     * @returns Interval domain
     */
    domain(inputs: Inputs.Curve.CurveDto): BaseTypes.IntervalDto;
    /**
     * Start point of the curve
     * <div>
     *  <img src="../assets/images/blockly-images/curve/startPoint.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#startpoint
     * @param inputs Nurbs curve
     * @returns Start point
     */
    startPoint(inputs: Inputs.Curve.CurveDto): number[];
    /**
     * End point of the curve
     * <div>
     *  <img src="../assets/images/blockly-images/curve/endPoint.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#endpoint
     * @param inputs Nurbs curve
     * @returns End point
     */
    endPoint(inputs: Inputs.Curve.CurveDto): number[];
    /**
     * Start points of the curves
     * <div>
     *  <img src="../assets/images/blockly-images/curve/startPoints.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#startpoints
     * @param inputs Nurbs curves
     * @returns Start points
     */
    startPoints(inputs: Inputs.Curve.CurvesDto): number[][];
    /**
     * End points of the curves
     * <div>
     *  <img src="../assets/images/blockly-images/curve/endPoints.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#endpoints
     * @param inputs Nurbs curves
     * @returns End points
     */
    endPoints(inputs: Inputs.Curve.CurvesDto): number[][];
    /**
     * Finds the knots of the Nurbs curve
     * <div>
     *  <img src="../assets/images/blockly-images/curve/knots.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#knots
     * @param inputs Nurbs curve
     * @returns Knots
     */
    knots(inputs: Inputs.Curve.CurveDto): number[];
    /**
     * Gets the length of the Nurbs curve at specific parameter
     * <div>
     *  <img src="../assets/images/blockly-images/curve/lengthAtParam.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#lengthatparam
     * @param inputs Nurbs curve and parameter
     * @returns Length
     */
    lengthAtParam(inputs: Inputs.Curve.CurveParameterDto): number;
    /**
     * Gets the length of the Nurbs curve
     * <div>
     *  <img src="../assets/images/blockly-images/curve/length.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#length
     * @param inputs Nurbs curve
     * @returns Length
     */
    length(inputs: Inputs.Curve.CurveDto): number;
    /**
     * Gets the param at specified length on the Nurbs curve
     * <div>
     *  <img src="../assets/images/blockly-images/curve/paramAtLength.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#paramatlength
     * @param inputs Nurbs curve, length and tolerance
     * @returns Parameter
     */
    paramAtLength(inputs: Inputs.Curve.CurveLengthToleranceDto): number;
    /**
     * Gets the point at specified parameter on the Nurbs curve
     * <div>
     *  <img src="../assets/images/blockly-images/curve/pointAtParam.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#pointAtParam
     * @param inputs Nurbs curve and a parameter
     * @returns Point
     */
    pointAtParam(inputs: Inputs.Curve.CurveParameterDto): number[];
    /**
     * Gets the points at specified parameter on the Nurbs curves
     * <div>
     *  <img src="../assets/images/blockly-images/curve/pointAtParam.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#pointAtParam
     * @param inputs Nurbs curves and a parameter
     * @returns Points in arrays for each curve
     */
    pointsAtParam(inputs: Inputs.Curve.CurvesParameterDto): number[][];
    /**
     * Reverses the Nurbs curve
     * <div>
     *  <img src="../assets/images/blockly-images/curve/reverse.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#reverse
     * @param inputs Nurbs curve
     * @returns Reversed Nurbs curve
     */
    reverse(inputs: Inputs.Curve.CurveDto): any;
    /**
     * Splits the Nurbs curve in two at a given parameter
     * <div>
     *  <img src="../assets/images/blockly-images/curve/split.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#split
     * @param inputs Nurbs curve with parameter
     * @returns Nurbs curves
     */
    split(inputs: Inputs.Curve.CurveParameterDto): any[];
    /**
     * Tangent of the Nurbs curve at a given parameter
     * <div>
     *  <img src="../assets/images/blockly-images/curve/tangent.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#tangent
     * @param inputs Nurbs curve with parameter
     * @returns Tangent vector
     */
    tangent(inputs: Inputs.Curve.CurveParameterDto): number[];
    /**
     * Tessellates the Nurbs curve into a list of points
     * <div>
     *  <img src="../assets/images/blockly-images/curve/tessellate.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#tessellate
     * @param inputs Nurbs curve with tolerance
     * @returns Points
     */
    tessellate(inputs: Inputs.Curve.CurveToleranceDto): number[][];
    /**
     * Transforms the Nurbs curve
     * <div>
     *  <img src="../assets/images/blockly-images/curve/transform.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#transform
     * @param inputs Nurbs curve with transformation matrixes
     * @returns Transformed curve
     */
    transform(inputs: Inputs.Curve.CurveTransformDto): any;
    /**
     * Transforms the Nurbs curves
     * <div>
     *  <img src="../assets/images/blockly-images/curve/transformCurves.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#transformcurves
     * @param inputs Nurbs curves with transformation matrixes
     * @returns Transformed curves
     */
    transformCurves(inputs: Inputs.Curve.CurvesTransformDto): any[];
    /**
     * Weights of the Nurbs curve
     * <div>
     *  <img src="../assets/images/blockly-images/curve/weights.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#weights
     * @param inputs Nurbs curve
     * @returns Weights
     */
    weights(inputs: Inputs.Curve.CurveDto): number[];
}

`);