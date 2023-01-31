
import { JSCADWorkerManager } from '../../../workers/jscad/jscad-worker-manager';
import * as Inputs from '../../inputs/inputs';

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
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/text/cylindricalText.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_text.JSCADText.html#cylindricalText
     * @param inputs Cylindrical text parameters
     * @returns List of solids for text
     */
    async cylindricalText(inputs: Inputs.JSCAD.CylinderTextDto): Promise<any[]> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('text.cylindricalText', inputs);
    }


    /**
     * Creates a text that is based on chain hulling spheres
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/text/sphericalText.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_text.JSCADText.html#sphericalText
     * @param inputs Spherical text parameters
     * @returns List of solids for text
     */
    async sphericalText(inputs: Inputs.JSCAD.SphereTextDto): Promise<any[]> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('text.sphericalText', inputs);
    }

    async createVectorText(inputs: Inputs.JSCAD.TextDto): Promise<number[][]> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('text.createVectorText', inputs);

    }
}
