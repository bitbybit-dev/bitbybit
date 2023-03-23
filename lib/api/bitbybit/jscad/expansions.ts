
import { JSCADWorkerManager } from '../../../workers/jscad/jscad-worker-manager';
import * as Inputs from '../../inputs/inputs';

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
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/expansions/expand1.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/jscad/expansions/expand2.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/jscad/expansions/expand3.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/jscad/expansions/expand4.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/jscad/expansions/expand5.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/jscad/expansions/expand6.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_expansions.JSCADExpansions.html#expand
     * @param inputs Contains options and geometries for expansion
     * @returns Expanded geometry
     * @group expansion
     * @shortname expand
     * @drawable true
     */
    async expand(inputs: Inputs.JSCAD.ExpansionDto): Promise<any | any[]> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('expansions.expand', inputs);
    }

    /**
     * Offset 2d geometries of solid category
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/expansions/offset1.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/jscad/expansions/offset2.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/jscad/expansions/offset3.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/jscad/expansions/offset4.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_expansions.JSCADExpansions.html#offset
     * @param inputs Contains options and geometries for offset
     * @returns Expanded geometry
     * @group expansion
     * @shortname offset
     * @drawable true
     */
    async offset(inputs: Inputs.JSCAD.ExpansionDto): Promise<any | any[]> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('expansions.offset', inputs);
    }
}
