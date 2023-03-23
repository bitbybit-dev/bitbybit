
import { JSCADWorkerManager } from '../../../workers/jscad/jscad-worker-manager';
import * as Inputs from '../../inputs/inputs';

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
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/extrusions/extrudeLinear1.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/jscad/extrusions/extrudeLinear2.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_extrusions.JSCADExtrusions.html#extrudeLinear
     * @param inputs Contains options and geometries for linear extrude
     * @returns Extruded geometry
     * @group extrude
     * @shortname linear
     * @drawable true
     */
    async extrudeLinear(inputs: Inputs.JSCAD.ExtrudeLinearDto): Promise<any | any[]> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('extrusions.extrudeLinear', inputs);
    }

    /**
     * Rectangular extrude 2D geometries of solid category. Creates a wall-type extrusion of certain height and size.
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/extrusions/extrudeRectangular1.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/jscad/extrusions/extrudeRectangular2.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_extrusions.JSCADExtrusions.html#extrudeRectangular
     * @param inputs Contains options and geometries for rectangular extrude
     * @returns Extruded geometry
     * @group extrude
     * @shortname rectangular
     * @drawable true
     */
    async extrudeRectangular(inputs: Inputs.JSCAD.ExtrudeRectangularDto): Promise<any | any[]> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('extrusions.extrudeRectangular', inputs);
    }

    /**
     * Rectangular extrude a list of 2D points. Creates a wall-type extrusion of certain height and size.
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/extrusions/extrudeRectangularPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_extrusions.JSCADExtrusions.html#extrudeRectangularPoints
     * @param inputs Contains options and points for extrusion
     * @returns Extruded geometry
     * @group extrude
     * @shortname rectangular points
     * @drawable true
     */
    async extrudeRectangularPoints(inputs: Inputs.JSCAD.ExtrudeRectangularPointsDto): Promise<any> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('extrusions.extrudeRectangularPoints', inputs);
    }

    /**
     * Rectangular extrude a list of 2D points. Creates a wall-type extrusion of certain height and size.
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/extrusions/extrudeRectangularPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_extrusions.JSCADExtrusions.html#extrudeRotate
     * @param inputs Contains options and points for extrusion
     * @returns Extruded geometry
     * @group extrude
     * @shortname rotational
     * @drawable true
     */
    async extrudeRotate(inputs: Inputs.JSCAD.ExtrudeRotateDto): Promise<any> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('extrusions.extrudeRotate', inputs);
    }

}
