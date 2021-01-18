import { simplifyDeclaration } from './simplify-declaration';

export const solidPathString = simplifyDeclaration(`
import { Context } from '../context';
import { GeometryHelper } from '../geometry-helper';
import * as Inputs from '../inputs/inputs';
/**
 * Contains various functions for Path from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
export declare class SolidPath {
    private readonly context;
    private readonly geometryHelper;
    constructor(context: Context, geometryHelper: GeometryHelper);
    /**
     * Create a 2D path from a list of points
     * <div>
     *  <img src="../assets/images/blockly-images/solid/path/createFromPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_path_.solidpath.html#createfrompoints
     * @param inputs Points and indication if we want a closed path or not
     * @returns Path
     */
    createFromPoints(inputs: Inputs.Solid.PathFromPointsDto): any;
    /**
     * Create a 2D path from a polyline
     * <div>
     *  <img src="../assets/images/blockly-images/solid/path/createFromPolyline.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_path_.solidpath.html#createfrompolyline
     * @param inputs Polyline and indication if we want a closed path or not
     * @returns Path
     */
    createFromPolyline(inputs: Inputs.Solid.PathFromPolylineDto): any;
    /**
     * Create a 2D path from a curve
     * <div>
     *  <img src="../assets/images/blockly-images/solid/path/createFromCurve.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_path_.solidpath.html#createfromcurve
     * @param inputs Curve and indication if we want a closed path or not
     * @returns Path
     */
    createFromCurve(inputs: Inputs.Solid.PathFromCurveDto): any;
    /**
     * Create empty 2D path
     * <div>
     *  <img src="../assets/images/blockly-images/solid/path/createEmpty.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_path_.solidpath.html#createempty
     * @returns Emprty path
     */
    createEmpty(): any;
    /**
     * Closes an open 2D path
     * <div>
     *  <img src="../assets/images/blockly-images/solid/path/close.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_path_.solidpath.html#close
     * @param inputs Path
     * @returns Closed path
     */
    close(inputs: Inputs.Solid.PathDto): any;
    /**
     * Append the path with 2D points
     * <div>
     *  <img src="../assets/images/blockly-images/solid/path/appendpoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_path_.solidpath.html#appendpoints
     * @param inputs Path to append and points
     * @returns Appended path
     */
    appendPoints(inputs: Inputs.Solid.PathAppendPointsDto): any;
    /**
     * Append the path with polyline
     * <div>
     *  <img src="../assets/images/blockly-images/solid/path/appendpolyline.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_path_.solidpath.html#appendpolyline
     * @param inputs Path to append and polyline
     * @returns Appended path
     */
    appendPolyline(inputs: Inputs.Solid.PathAppendPolylineDto): any;
    /**
     * Append the path with the curve
     * <div>
     *  <img src="../assets/images/blockly-images/solid/path/appendcurve.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_path_.solidpath.html#appendcurve
     * @param inputs Path to append and a curve
     * @returns Appended path
     */
    appendCurve(inputs: Inputs.Solid.PathAppendCurveDto): any;
    /**
     * Append the arc to the path
     * <div>
     *  <img src="../assets/images/blockly-images/solid/path/appendarc.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_solid_path_.solidpath.html#appendarc
     * @param inputs Path and arc parameters
     * @returns Appended path
     */
    appendArc(inputs: Inputs.Solid.PathAppendArcDto): any;
    private removeDuplicatesAndCreateFromPoints;
}

`);
