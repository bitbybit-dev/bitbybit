import { JSCADWorkerManager } from "../jscad-worker/jscad-worker-manager";
import * as Inputs from "@bitbybit-dev/jscad/lib/api/inputs";


/**
 * Contains various functions for Solid extrusions from JSCAD library https://github.com/jscad/OpenJSCAD.org
 * Thanks JSCAD community for developing this kernel
 */

export class JSCADExtrusions {

    constructor(
        private readonly jscadWorkerManager: JSCADWorkerManager,
    ) { }

    /**
     * Linear extrude 2D geometries of solid category
     * @param inputs Contains options and geometries for linear extrude
     * @returns Extruded geometry
     * @group extrude
     * @shortname linear
     * @drawable true
     */
    async extrudeLinear(inputs: Inputs.JSCAD.ExtrudeLinearDto): Promise<Inputs.JSCAD.JSCADEntity> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("extrusions.extrudeLinear", inputs);
    }

    /**
     * Rectangular extrude 2D geometries of solid category. Creates a wall-type extrusion of certain height and size.
     * @param inputs Contains options and geometries for rectangular extrude
     * @returns Extruded geometry
     * @group extrude
     * @shortname rectangular
     * @drawable true
     */
    async extrudeRectangular(inputs: Inputs.JSCAD.ExtrudeRectangularDto): Promise<Inputs.JSCAD.JSCADEntity> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("extrusions.extrudeRectangular", inputs);
    }

    /**
     * Rectangular extrude a list of 2D points. Creates a wall-type extrusion of certain height and size.
     * @param inputs Contains options and points for extrusion
     * @returns Extruded geometry
     * @group extrude
     * @shortname rectangular points
     * @drawable true
     */
    async extrudeRectangularPoints(inputs: Inputs.JSCAD.ExtrudeRectangularPointsDto): Promise<Inputs.JSCAD.JSCADEntity> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("extrusions.extrudeRectangularPoints", inputs);
    }

    /**
     * Rectangular extrude a list of 2D points. Creates a wall-type extrusion of certain height and size.
     * @param inputs Contains options and points for extrusion
     * @returns Extruded geometry
     * @group extrude
     * @shortname rotational
     * @drawable true
     */
    async extrudeRotate(inputs: Inputs.JSCAD.ExtrudeRotateDto): Promise<Inputs.JSCAD.JSCADEntity> {
        return this.jscadWorkerManager.genericCallToWorkerPromise("extrusions.extrudeRotate", inputs);
    }

}
