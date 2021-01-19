import { simplifyDeclaration } from './simplify-declaration';

export const lineString = simplifyDeclaration(`
import { LinesMesh } from '@babylonjs/core';
import { Context } from '../context';
import { GeometryHelper } from '../geometry-helper';
import * as Inputs from '../inputs/inputs';
/**
 * Contains various methods for lines. Line in bitbybit is a simple object that has star and end point properties.
 * { start: [ x, y, z ], end: [ x, y, z ] }
 * <div>
 *  <img src="../assets/images/blockly-images/line/line.svg" alt="Blockly Image"/>
 * </div>
 */
export declare class Line {
    private readonly context;
    private readonly geometryHelper;
    constructor(context: Context, geometryHelper: GeometryHelper);
    /**
     * Draws a single line
     * <div>
     *  <img src="../assets/images/blockly-images/line/drawLine.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#drawline
     * @param inputs Contains a line to be drawn
     * @returns Lines mesh that is being drawn by Babylon
     */
    drawLine(inputs: Inputs.Line.DrawLineDto): LinesMesh;
    /**
     * Draws multiple lines
     * <div>
     *  <img src="../assets/images/blockly-images/line/drawLines.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#drawlines
     * @param inputs Contains a line to be drawn
     * @returns Lines mesh that is being drawn by Babylon
     */
    drawLines(inputs: Inputs.Line.DrawLinesDto): LinesMesh;
    /**
     * Converts a line to a NURBS line curve
     * <div>
     *  <img src="../assets/images/blockly-images/line/convertToNurbsCurve.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#converttonurbscurve
     * Returns the verbnurbs Line object
     * @link http://verbnurbs.com/docs/geom/Line/
     * @param inputs Line to be transformed to curve
     * @returns Verb nurbs curve
     */
    convertToNurbsCurve(inputs: Inputs.Line.LineDto): any;
    /**
     * Converts lines to a NURBS curves
     * <div>
     *  <img src="../assets/images/blockly-images/line/convertLinesToNurbsCurves.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#convertlinestonurbscurves
     * Returns array of the verbnurbs Line objects
     * @link http://verbnurbs.com/docs/geom/Line/
     * @param inputs Lines to be transformed to curves
     * @returns Verb nurbs curves
     */
    convertLinesToNurbsCurves(inputs: Inputs.Line.LinesDto): any[];
    /**
     * Gets the start point of the line
     * <div>
     *  <img src="../assets/images/blockly-images/line/getStartPoint.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#getstartpoint
     * @param inputs Line to be queried
     * @returns Start point
     */
    getStartPoint(inputs: Inputs.Line.LineDto): number[];
    /**
     * Gets the end point of the line
     * <div>
     *  <img src="../assets/images/blockly-images/line/getEndPoint.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#getendpoint
     * @param inputs Line to be queried
     * @returns End point
     */
    getEndPoint(inputs: Inputs.Line.LineDto): number[];
    /**
     * Gets the length of the line
     * <div>
     *  <img src="../assets/images/blockly-images/line/length.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#length
     * @param inputs Line to be queried
     * @returns Length of the line
     */
    length(inputs: Inputs.Line.LineDto): number;
    /**
     * Reverse the endpoints of the line
     * <div>
     *  <img src="../assets/images/blockly-images/line/reverse.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#reverse
     * @param inputs Line to be reversed
     * @returns Reversed line
     */
    reverse(inputs: Inputs.Line.LineDto): Inputs.Line.LinePointsDto;
    /**
     * Transform the line
     * <div>
     *  <img src="../assets/images/blockly-images/line/transformLine.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#transformline
     * @param inputs Line to be transformed
     * @returns Transformed line
     */
    transformLine(inputs: Inputs.Line.TransformLineDto): Inputs.Line.LinePointsDto;
    /**
     * Create the line
     * <div>
     *  <img src="../assets/images/blockly-images/line/create.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#create
     * @param inputs Endpoints of the line
     * @returns Line
     */
    create(inputs: Inputs.Line.LinePointsDto): Inputs.Line.LinePointsDto;
    /**
     * Create the line segments between all of the points in a list
     * <div>
     *  <img src="../assets/images/blockly-images/line/linesBetweenPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#linesbetweenpoints
     * @param inputs Lines in a list
     * @returns Lines
     */
    linesBetweenPoints(inputs: Inputs.Line.PointsLinesDto): Inputs.Line.LinePointsDto[];
    /**
     * Create the lines between two lists of start and end points of equal length
     * <div>
     *  <img src="../assets/images/blockly-images/line/linesBetweenStartAndEndPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#linesbetweenstartandendpoints
     * @param inputs Two lists of start and end points
     * @returns Lines
     */
    linesBetweenStartAndEndPoints(inputs: Inputs.Line.LineStartEndPointsDto): Inputs.Line.LinePointsDto[];
    private edgesRendering;
    private createLinesMesh;
}

`);
