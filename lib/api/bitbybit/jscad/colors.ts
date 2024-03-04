
import { JSCADWorkerManager } from "../../../workers/jscad/jscad-worker-manager";
import * as Inputs from "../../inputs/inputs";

/**
 * Contains functions for colorizing objects
 */

export class JSCADColors {

    constructor(
        private readonly jscadWorkerManager: JSCADWorkerManager,
    ) { }

    /**
     * Colorizes geometry of jscad. If geometry is in the array it will colorize all items and return them. If geometry is a single item it will return a single item.
     * Keep in mind that colorized geometry in jscad will always be drawn in that color even if you try to change it via draw options.
     * @param inputs contain geometry and hex color
     * @returns Colorized geometry of jsacd
     * @group colorize
     * @shortname colorize geometry
     * @drawable true
     */
    async colorize(inputs: Inputs.JSCAD.ColorizeDto): Promise<Inputs.JSCAD.JSCADEntity | Inputs.JSCAD.JSCADEntity[]> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("colors.colorize", inputs);
    }

}
