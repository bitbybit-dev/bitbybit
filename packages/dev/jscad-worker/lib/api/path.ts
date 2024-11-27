import { JSCADWorkerManager } from "../jscad-worker/jscad-worker-manager";
import * as Inputs from "@bitbybit-dev/jscad/lib/api/inputs/inputs";

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
    async createFromPoints(inputs: Inputs.JSCAD.PathFromPointsDto): Promise<Inputs.JSCAD.JSCADEntity> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("path.createFromPoints", inputs);
    }


    /**
     * Create 2D paths from a lists of points
     * @param inputs Points lists
     * @returns Paths
     * @group from
     * @shortname paths from points
     * @drawable true
     */
    async createPathsFromPoints(inputs: Inputs.JSCAD.PathsFromPointsDto): Promise<Inputs.JSCAD.JSCADEntity[]> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("path.createPathsFromPoints", inputs);
    }

    /**
     * Create a 2D path from a polyline
     * @param inputs Polyline and indication if we want a closed path or not
     * @returns Path
     * @group from
     * @shortname polyline
     * @drawable true
     */
    async createFromPolyline(inputs: Inputs.JSCAD.PathFromPolylineDto): Promise<Inputs.JSCAD.JSCADEntity> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("path.createFromPolyline", inputs);
    }

    /**
     * Create empty 2D path
     * @returns Empty path
     * @group create
     * @shortname empty
     * @drawable false
     */
    async createEmpty(): Promise<Inputs.JSCAD.JSCADEntity> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("path.createEmpty", {});
    }

    /**
     * Closes an open 2D path
     * @param inputs Path
     * @returns Closed path
     * @group edit
     * @shortname close
     * @drawable true
     */
    async close(inputs: Inputs.JSCAD.PathDto): Promise<Inputs.JSCAD.JSCADEntity> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("path.close", inputs);
    }

    /**
     * Append the path with 2D points
     * @param inputs Path to append and points
     * @returns Appended path
     * @group append
     * @shortname points
     * @drawable true
     */
    async appendPoints(inputs: Inputs.JSCAD.PathAppendPointsDto): Promise<Inputs.JSCAD.JSCADEntity> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("path.appendPoints", inputs);
    }

    /**
     * Append the path with polyline
     * @param inputs Path to append and polyline
     * @returns Appended path
     * @group append
     * @shortname polyline
     * @drawable true
     */
    async appendPolyline(inputs: Inputs.JSCAD.PathAppendPolylineDto): Promise<Inputs.JSCAD.JSCADEntity> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("path.appendPolyline", inputs);
    }

    /**
     * Append the arc to the path
     * @param inputs Path and arc parameters
     * @returns Appended path
     * @group append
     * @shortname arc
     * @drawable true
     */
    async appendArc(inputs: Inputs.JSCAD.PathAppendArcDto): Promise<Inputs.JSCAD.JSCADEntity> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("path.appendArc", inputs);
    }
}
