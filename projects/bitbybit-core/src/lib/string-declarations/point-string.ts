import { simplifyDeclaration } from './simplify-declaration';

export const pointString = simplifyDeclaration(`
import { Mesh } from '@babylonjs/core';
import { Context } from '../context';
import { GeometryHelper } from '../geometry-helper';
import * as Inputs from '../inputs/inputs';
/**
 * Contains various methods for points. Point in bitbybit is simply an array containing 3 numbers for [x, y, z].
 * Because of this form Point can be interchanged with Vector, which also is an array in [x, y, z] form.
 * When creating 2D points, z coordinate is simply set to 0 - [x, y, 0].
 * <div>
 *  <img src="../assets/images/blockly-images/point/point.png" alt="Blockly Image"/>
 * </div>
 */
export declare class Point {
    private readonly context;
    private readonly geometryHelper;
    constructor(context: Context, geometryHelper: GeometryHelper);
    /**
     * Draws a single point
     * <div>
     *  <img src="../assets/images/blockly-images/point/drawPoint.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_point_.point.html#drawpoint
     * @param inputs Contains a point to be drawn
     */
    drawPoint(inputs: Inputs.Point.DrawPointDto): Mesh;
    /**
     * Draws multiple points
     * <div>
     *  <img src="../assets/images/blockly-images/point/drawPoints.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_point_.point.html#drawpoints
     * @param inputs Contains a point array to be drawn
     */
    drawPoints(inputs: Inputs.Point.DrawPointsDto): Mesh;
    /**
     * Transforms the single point
     * <div>
     *  <img src="../assets/images/blockly-images/point/transformPoint.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_point_.point.html#transformpoint
     * @param inputs Contains a point and the transformations to apply
     * @returns Transformed point
     */
    transformPoint(inputs: Inputs.Point.TransformPointDto): number[];
    /**
     * Transforms multiple points
     * <div>
     *  <img src="../assets/images/blockly-images/point/transformPoints.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_point_.point.html#transformpoints
     * @param inputs Contains points and the transformations to apply
     * @returns Transformed points
     */
    transformPoints(inputs: Inputs.Point.TransformPointsDto): number[][];
    /**
     * Measures the closest distance between a point and a collection of points
     * <div>
     *  <img src="../assets/images/blockly-images/point/closestPointFromPointsDistance.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_point_.point.html#closestpointfrompointsdistance
     * @param inputs Point from which to measure and points to measure the distance against
     * @returns Distance to closest point
     */
    closestPointFromPointsDistance(inputs: Inputs.Point.ClosestPointFromPointsDto): number;
    /**
     * Finds the closest point index between a point and a collection of points
     * <div>
     *  <img src="../assets/images/blockly-images/point/closestPointFromPointsIndex.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_point_.point.html#closestpointfrompointsindex
     * @param inputs Point from which to find the index in a collection of points
     * @returns Closest point index
     */
    closestPointFromPointsIndex(inputs: Inputs.Point.ClosestPointFromPointsDto): number;
    /**
     * Finds the closest point in a collection
     * <div>
     *  <img src="../assets/images/blockly-images/point/closestPointFromPoints.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_point_.point.html#closestpointfrompoints
     * @param inputs Point and points collection to find the closest point in
     * @returns Closest point
     */
    closestPointFromPoints(inputs: Inputs.Point.ClosestPointFromPointsDto): number;
    /**
     * Finds the distance between two points
     * <div>
     *  <img src="../assets/images/blockly-images/point/distance.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_point_.point.html#distance
     * @param inputs Coordinates of start and end points
     * @returns Distance
     */
    distance(inputs: Inputs.Point.StartEndPointsDto): number;
    /**
     * Multiply point by a specified amount
     * <div>
     *  <img src="../assets/images/blockly-images/point/multiplyPoint.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_point_.point.html#multiplypoint
     * @param inputs The point to be multiplied and the amount of points to create
     * @returns Distance
     */
    multiplyPoint(inputs: Inputs.Point.MultiplyPointDto): number[][];
    /**
     * Get x coordinate of the point
     * <div>
     *  <img src="../assets/images/blockly-images/point/getX.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_point_.point.html#getx
     * @param inputs The point
     * @returns X coordinate
     */
    getX(inputs: Inputs.Point.PointDto): number;
    /**
     * Get y coordinate of the point
     * <div>
     *  <img src="../assets/images/blockly-images/point/getY.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_point_.point.html#gety
     * @param inputs The point
     * @returns Y coordinate
     */
    getY(inputs: Inputs.Point.PointDto): number;
    /**
     * Get z coordinate of the point
     * <div>
     *  <img src="../assets/images/blockly-images/point/getZ.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_point_.point.html#getz
     * @param inputs The point
     * @returns Z coordinate
     */
    getZ(inputs: Inputs.Point.PointDto): number;
    /**
     * Creates the spiral out of multiple points
     * <div>
     *  <img src="../assets/images/blockly-images/point/spiral.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_point_.point.html#spiral
     * @param inputs Spiral information
     * @returns Specified number of points in the array along the spiral
     */
    spiral(inputs: Inputs.Point.SpiralDto): number[][];
}
`);
