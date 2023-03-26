
import { JSCADWorkerManager } from '../../../workers/jscad/jscad-worker-manager';
import * as Inputs from '../../inputs/inputs';

/**
 * Contains various functions for Solid booleans from JSCAD library https://github.com/jscad/OpenJSCAD.org
 * Thanks JSCAD community for developing this kernel
 */

export class JSCADBooleans {

    constructor(
        private readonly jscadWorkerManager: JSCADWorkerManager,
    ) { }

    /**
     * Intersect multiple solid mesh objects
     * @param inputs Contains multiple solids for intersection
     * @returns Solid mesh     
     * @group boolean
     * @shortname intersect
     * @drawable true
     */
    async intersect(inputs: Inputs.JSCAD.BooleanObjectsDto): Promise<any> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('booleans.intersect', inputs);
    }

    /**
     * Subtract multiple solid mesh objects
     * @param inputs Contains multiple solids for subtraction
     * @returns Solid mesh     
     * @group boolean
     * @shortname intersect
     * @drawable true
     */
    async subtract(inputs: Inputs.JSCAD.BooleanObjectsDto): Promise<any> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('booleans.subtract', inputs);
    }

    /**
     * Union multiple solid mesh objects
     * @param inputs Contains multiple solids for union
     * @returns Solid mesh
     * @group boolean
     * @shortname union
     * @drawable true
     */
    async union(inputs: Inputs.JSCAD.BooleanObjectsDto): Promise<any> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('booleans.union', inputs);
    }
}
