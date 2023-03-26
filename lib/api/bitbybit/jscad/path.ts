
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
