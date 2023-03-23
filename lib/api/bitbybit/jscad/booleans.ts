
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
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/booleans/intersect1.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/jscad/booleans/intersect2.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_booleans.JSCADBooleans.html#intersect
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
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/booleans/subtract1.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/jscad/booleans/subtract2.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/jscad/booleans/subtract3.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_booleans.JSCADBooleans.html#subtract
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
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/booleans/union1.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/jscad/booleans/union2.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_booleans.JSCADBooleans.html#union
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
