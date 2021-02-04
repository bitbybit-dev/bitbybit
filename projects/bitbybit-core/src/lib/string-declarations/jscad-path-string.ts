import { simplifyDeclaration } from './simplify-declaration';

export const jscadPathString = simplifyDeclaration(`
import { Context } from '../context';
import { GeometryHelper } from '../geometry-helper';
import * as Inputs from '../inputs/inputs';
/**
 * Contains various functions for Path from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
export declare class JSCADPath {
    private readonly context;
    private readonly geometryHelper;
    constructor(context: Context, geometryHelper: GeometryHelper);
    /**
     * Create a 2D path from a list of points
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/path/createFromPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.jscadpath.html#createfrompoints
     * @param inputs Points and indication if we want a closed path or not
     * @returns Path
     */
    createFromPoints(inputs: Inputs.JSCAD.PathFromPointsDto): any;
    /**
     * Create a 2D path from a polyline
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/path/createFromPolyline.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.jscadpath.html#createfrompolyline
     * @param inputs Polyline and indication if we want a closed path or not
     * @returns Path
     */
    createFromPolyline(inputs: Inputs.JSCAD.PathFromPolylineDto): any;
    /**
     * Create a 2D path from a curve
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/path/createFromCurve.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.jscadpath.html#createfromcurve
     * @param inputs Curve and indication if we want a closed path or not
     * @returns Path
     */
    createFromCurve(inputs: Inputs.JSCAD.PathFromCurveDto): any;
    /**
     * Create empty 2D path
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/path/createEmpty.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.jscadpath.html#createempty
     * @returns Emprty path
     */
    createEmpty(): any;
    /**
     * Closes an open 2D path
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/path/close.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.jscadpath.html#close
     * @param inputs Path
     * @returns Closed path
     */
    close(inputs: Inputs.JSCAD.PathDto): any;
    /**
     * Append the path with 2D points
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/path/appendpoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.jscadpath.html#appendpoints
     * @param inputs Path to append and points
     * @returns Appended path
     */
    appendPoints(inputs: Inputs.JSCAD.PathAppendPointsDto): any;
    /**
     * Append the path with polyline
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/path/appendpolyline.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.jscadpath.html#appendpolyline
     * @param inputs Path to append and polyline
     * @returns Appended path
     */
    appendPolyline(inputs: Inputs.JSCAD.PathAppendPolylineDto): any;
    /**
     * Append the path with the curve
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/path/appendcurve.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.jscadpath.html#appendcurve
     * @param inputs Path to append and a curve
     * @returns Appended path
     */
    appendCurve(inputs: Inputs.JSCAD.PathAppendCurveDto): any;
    /**
     * Append the arc to the path
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/path/appendarc.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.jscadpath.html#appendarc
     * @param inputs Path and arc parameters
     * @returns Appended path
     */
    appendArc(inputs: Inputs.JSCAD.PathAppendArcDto): any;
    private removeDuplicatesAndCreateFromPoints;
}

`);
