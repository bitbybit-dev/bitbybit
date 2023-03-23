
import { JSCADWorkerManager } from '../../../workers/jscad/jscad-worker-manager';
import * as Inputs from '../../inputs/inputs';

/**
 * Contains various functions for Path from JSCAD library https://github.com/jscad/OpenJSCAD.org
 * Thanks JSCAD community for developing this kernel
 */

export class JSCADPath {

    constructor(
        private readonly jscadWorkerManager: JSCADWorkerManager,
    ) { }

    /**
     * Create a 2D path from a list of points
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/path/createFromPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.JSCADPath.html#createFromPoints
     * @param inputs Points and indication if we want a closed path or not
     * @returns Path
     * @group from
     * @shortname points
     * @drawable true
     */
    async createFromPoints(inputs: Inputs.JSCAD.PathFromPointsDto): Promise<any> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('path.createFromPoints', inputs);
    }


    /**
     * Create a 2D path from a polyline
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/path/createFromPolyline.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.JSCADPath.html#createFromPolyline
     * @param inputs Polyline and indication if we want a closed path or not
     * @returns Path
     * @group from
     * @shortname polyline
     * @drawable true
     */
    async createFromPolyline(inputs: Inputs.JSCAD.PathFromPolylineDto): Promise<any> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('path.createFromPolyline', inputs);
    }

    /**
     * Create a 2D path from a curve
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/path/createFromCurve.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.JSCADPath.html#createFromCurve
     * @param inputs Curve and indication if we want a closed path or not
     * @returns Path
     * @group from
     * @shortname curve
     * @drawable true
     */
    async createFromCurve(inputs: Inputs.JSCAD.PathFromCurveDto): Promise<any> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('path.createFromCurve', inputs);
    }

    /**
     * Create empty 2D path
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/path/createEmpty.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.JSCADPath.html#createEmpty
     * @returns Empty path
     * @group create
     * @shortname empty
     * @drawable false
     */
    async createEmpty(): Promise<any> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('path.createEmpty', {});
    }

    /**
     * Closes an open 2D path
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/path/close.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.JSCADPath.html#close
     * @param inputs Path
     * @returns Closed path
     * @group edit
     * @shortname close
     * @drawable true
     */
    async close(inputs: Inputs.JSCAD.PathDto): Promise<any> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('path.close', inputs);
    }

    /**
     * Append the path with 2D points
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/path/appendpoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.JSCADPath.html#appendPoints
     * @param inputs Path to append and points
     * @returns Appended path
     * @group append
     * @shortname points
     * @drawable true
     */
    async appendPoints(inputs: Inputs.JSCAD.PathAppendPointsDto): Promise<any> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('path.appendPoints', inputs);
    }

    /**
     * Append the path with polyline
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/path/appendpolyline.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.JSCADPath.html#appendPolyline
     * @param inputs Path to append and polyline
     * @returns Appended path
     * @group append
     * @shortname polyline
     * @drawable true
     */
    async appendPolyline(inputs: Inputs.JSCAD.PathAppendPolylineDto): Promise<any> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('path.appendPolyline', inputs);
    }

    /**
     * Append the path with the curve
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/path/appendcurve.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.JSCADPath.html#appendCurve
     * @param inputs Path to append and a curve
     * @returns Appended path
     * @group append
     * @shortname curve
     * @drawable true
     */
    async appendCurve(inputs: Inputs.JSCAD.PathAppendCurveDto): Promise<any> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('path.appendCurve', inputs);
    }

    /**
     * Append the arc to the path
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/path/appendarc.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.JSCADPath.html#appendArc
     * @param inputs Path and arc parameters
     * @returns Appended path
     * @group append
     * @shortname arc
     * @drawable true
     */
    async appendArc(inputs: Inputs.JSCAD.PathAppendArcDto): Promise<any> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('path.appendArc', inputs);
    }
}
