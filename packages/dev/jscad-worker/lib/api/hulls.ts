import { JSCADWorkerManager } from "../jscad-worker/jscad-worker-manager";
import * as Inputs from "@bitbybit-dev/jscad/lib/api/inputs";


/**
 * Contains various functions for Solid hulls from JSCAD library https://github.com/jscad/OpenJSCAD.org
 * Thanks JSCAD community for developing this kernel
 */

export class JSCADHulls {

    constructor(
        private readonly jscadWorkerManager: JSCADWorkerManager,
    ) { }

    /**
     * Hull chain connects solids or 2d geometries by filling an empty space in between objects in order.
     * Geometries need to be of the same type.
     * @param inputs Geometries
     * @returns Chain hulled geometry
     * @group hulls
     * @shortname hull chain
     * @drawable true
     */
    async hullChain(inputs: Inputs.JSCAD.HullDto): Promise<Inputs.JSCAD.JSCADEntity> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("hulls.hullChain", inputs);
    }
    /**
     * Convex hull connects solids or 2d geometries by filling an empty space in between without following order.
     * Geometries need to be of the same type.
     * @param inputs Geometries
     * @returns Hulled geometry
     * @group hulls
     * @shortname hull
     * @drawable true
     */
    async hull(inputs: Inputs.JSCAD.HullDto): Promise<Inputs.JSCAD.JSCADEntity>{
        return this.jscadWorkerManager.genericCallToWorkerPromise("hulls.hullChain", inputs);
    }
}
