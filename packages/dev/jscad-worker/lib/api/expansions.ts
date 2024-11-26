import { JSCADWorkerManager } from "../jscad-worker/jscad-worker-manager";
import * as Inputs from "@bitbybit-dev/jscad/lib/api/inputs/inputs";


/**
 * Contains various functions for Solid expansions from JSCAD library https://github.com/jscad/OpenJSCAD.org
 * Thanks JSCAD community for developing this kernel
 */

export class JSCADExpansions {

    constructor(
        private readonly jscadWorkerManager: JSCADWorkerManager,
    ) { }

    /**
     * Expand geometries of solid category
     * @param inputs Contains options and geometries for expansion
     * @returns Expanded geometry
     * @group expansion
     * @shortname expand
     * @drawable true
     */
    async expand(inputs: Inputs.JSCAD.ExpansionDto): Promise<Inputs.JSCAD.JSCADEntity> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("expansions.expand", inputs);
    }

    /**
     * Offset 2d geometries of solid category
     * @param inputs Contains options and geometries for offset
     * @returns Expanded geometry
     * @group expansion
     * @shortname offset
     * @drawable true
     */
    async offset(inputs: Inputs.JSCAD.ExpansionDto): Promise<Inputs.JSCAD.JSCADEntity> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("expansions.offset", inputs);
    }
}
