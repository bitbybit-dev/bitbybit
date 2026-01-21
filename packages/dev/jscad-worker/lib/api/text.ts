import { JSCADWorkerManager } from "../jscad-worker/jscad-worker-manager";
import * as Inputs from "@bitbybit-dev/jscad/lib/api/inputs";

/**
 * Contains various functions for solid 3D texts from JSCAD library https://github.com/jscad/OpenJSCAD.org
 * Thanks JSCAD community for developing this kernel
 */

export class JSCADText {

    constructor(
        private readonly jscadWorkerManager: JSCADWorkerManager,
    ) { }

    /**
     * Creates a text that is based on chain hulling cylinders
     * @param inputs Cylindrical text parameters
     * @returns List of solids for text
     * @group text
     * @shortname cylindrical
     * @drawable true
     */
    async cylindricalText(inputs: Inputs.JSCAD.CylinderTextDto): Promise<Inputs.JSCAD.JSCADEntity[]> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("text.cylindricalText", inputs);
    }

    /**
     * Creates a text that is based on chain hulling spheres
     * @param inputs Spherical text parameters
     * @returns List of solids for text
     * @group text
     * @shortname spherical
     * @drawable true
     */
    async sphericalText(inputs: Inputs.JSCAD.SphereTextDto): Promise<Inputs.JSCAD.JSCADEntity[]> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("text.sphericalText", inputs);
    }

    /**
     * Creates a vector text
     * @param inputs Vector text parameters
     * @returns List of polygons
     * @group text
     * @shortname vector
     * @drawable false
     */
    async createVectorText(inputs: Inputs.JSCAD.TextDto): Promise<Inputs.Base.Point2[][]> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("text.createVectorText", inputs);
    }
}
