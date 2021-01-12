import { simplifyDeclaration } from './simplify-declaration';

export const polylineString = simplifyDeclaration(`
import { LinesMesh } from '@babylonjs/core';
import { Context } from '../context';
import { GeometryHelper } from '../geometry-helper';
import * as Inputs from '../inputs/inputs';
/**
 * Contains various methods for polyline. Polyline in bitbybit is a simple object that has points property containing an array of points.
 * { points: number[][] }
 */
export declare class Polyline {
    private readonly context;
    private readonly geometryHelper;
    constructor(context: Context, geometryHelper: GeometryHelper);
    /**
     * Draws a single polyline
     * <div>
     *  <img src="../assets/images/blockly-images/polyline/drawPolyline.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_polyline_.polyline.html#drawpolyline
     * @param inputs Contains a polyline to be drawn
     * @returns Lines mesh that is being drawn by Babylon
     */
    drawPolyline(inputs: Inputs.Polyline.DrawPolylineDto): LinesMesh;
    /**
     * Draws multiple polylines
     * <div>
     *  <img src="../assets/images/blockly-images/polyline/drawPolylines.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_polyline_.polyline.html#drawpolylines
     * @param inputs Contains a polyline to be drawn
     * @returns Lines mesh that is being drawn by Babylon
     */
    drawPolylines(inputs: Inputs.Polyline.DrawPolylinesDto): LinesMesh;
    /**
     * Converts a polyline to a NURBS curve
     * <div>
     *  <img src="../assets/images/blockly-images/polyline/convertToNurbsCurve.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_polyline_.polyline.html#converttonurbscurve
     * Returns the verbnurbs NurbsCurve object
     * @link http://verbnurbs.com/docs/geom/NurbsCurve/
     * @param inputs Polyline to be transformed to curve
     * @returns Verb nurbs curve
     */
    convertToNurbsCurve(inputs: Inputs.Polyline.PolylineDto): any;
    /**
     * Gets the length of the polyline
     * <div>
     *  <img src="../assets/images/blockly-images/polyline/length.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_polyline_.polyline.html#length
     * @param inputs Polyline to be queried
     * @returns Length of the polyline
     */
    length(inputs: Inputs.Polyline.PolylineDto): number;
    /**
     * Gets the number of points in the polyline
     * <div>
     *  <img src="../assets/images/blockly-images/polyline/countPoints.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_polyline_.polyline.html#countpoints
     * @param inputs Polyline to be queried
     * @returns Number of points in polyline
     */
    countPoints(inputs: Inputs.Polyline.PolylineDto): number;
    /**
     * Gets the points of the polyline
     * <div>
     *  <img src="../assets/images/blockly-images/polyline/getPoints.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_polyline_.polyline.html#getpoints
     * @param inputs Polyline to be queried
     * @returns Points of the polyline
     */
    getPoints(inputs: Inputs.Polyline.PolylineDto): number[][];
    /**
     * Reverse the points of the polyline
     * <div>
     *  <img src="../assets/images/blockly-images/polyline/reverse.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_polyline_.polyline.html#reverse
     * @param inputs Polyline to be reversed
     * @returns Reversed polyline
     */
    reverse(inputs: Inputs.Polyline.PolylineDto): Inputs.Polyline.PolylinePropertiesDto;
    /**
     * Transform the polyline
     * <div>
     *  <img src="../assets/images/blockly-images/polyline/transformPolyline.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_polyline_.polyline.html#transformpolyline
     * @param inputs Polyline to be transformed
     * @returns Transformed polyline
     */
    transformPolyline(inputs: Inputs.Polyline.TransformPolylineDto): Inputs.Polyline.PolylinePropertiesDto;
    /**
     * Create the polyline
     * <div>
     *  <img src="../assets/images/blockly-images/polyline/create.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_polyline_.polyline.html#create
     * @param inputs Points of the polyline
     * @returns Polyline
     */
    create(inputs: Inputs.Polyline.PolylinePropertiesDto): Inputs.Polyline.PolylinePropertiesDto;
}
`);
