import { JSCADWorkerManager } from "../jscad-worker/jscad-worker-manager";
import * as Inputs from "@bitbybit-dev/jscad/lib/api/inputs";


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
    async intersect(inputs: Inputs.JSCAD.BooleanObjectsDto): Promise<Inputs.JSCAD.JSCADEntity> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("booleans.intersect", inputs);
    }

    /**
     * Subtract multiple solid mesh objects
     * @param inputs Contains multiple solids for subtraction
     * @returns Solid mesh     
     * @group boolean
     * @shortname subtract
     * @drawable true
     */
    async subtract(inputs: Inputs.JSCAD.BooleanObjectsDto): Promise<Inputs.JSCAD.JSCADEntity> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("booleans.subtract", inputs);
    }

    /**
     * Union multiple solid mesh objects
     * @param inputs Contains multiple solids for union
     * @returns Solid mesh
     * @group boolean
     * @shortname union
     * @drawable true
     */
    async union(inputs: Inputs.JSCAD.BooleanObjectsDto): Promise<Inputs.JSCAD.JSCADEntity> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("booleans.union", inputs);
    }

    /**
     * Intersect two solid mesh objects
     * @param inputs Contains multiple solids for intersection
     * @returns Solid mesh     
     * @group boolean
     * @shortname intersect two
     * @drawable true
     */
    async intersectTwo(inputs: Inputs.JSCAD.BooleanTwoObjectsDto): Promise<Inputs.JSCAD.JSCADEntity> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("booleans.intersectTwo", inputs);
    }

    /**
     * Subtract two solid mesh objects
     * @param inputs Contains multiple solids for subtraction
     * @returns Solid mesh     
     * @group boolean
     * @shortname subtract two
     * @drawable true
     */
    async subtractTwo(inputs: Inputs.JSCAD.BooleanTwoObjectsDto): Promise<Inputs.JSCAD.JSCADEntity> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("booleans.subtractTwo", inputs);
    }

    /**
     * Union two solid mesh objects
     * @param inputs Contains multiple solids for union
     * @returns Solid mesh
     * @group boolean
     * @shortname union two
     * @drawable true
     */
    async unionTwo(inputs: Inputs.JSCAD.BooleanTwoObjectsDto): Promise<Inputs.JSCAD.JSCADEntity> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("booleans.unionTwo", inputs);
    }

    /**
     * Subtract multiple meshes from one mesh object
     * @param inputs Contains mesh from which to subtract and multiple meshes for subtraction
     * @returns mesh     
     * @group boolean
     * @shortname subtract from
     * @drawable true
     */
    async subtractFrom(inputs: Inputs.JSCAD.BooleanObjectsFromDto): Promise<Inputs.JSCAD.JSCADEntity> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("booleans.subtractFrom", inputs);
    }

}
