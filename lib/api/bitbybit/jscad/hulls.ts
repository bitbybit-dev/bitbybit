
import { JSCADWorkerManager } from '../../../workers/jscad/jscad-worker-manager';
import * as Inputs from '../../inputs/inputs';

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
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/hulls/hull1.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/jscad/hulls/hull2.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/jscad/hulls/hull3.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_hulls.JSCADHulls.html#hullChain
     * @param inputs Geometries
     * @returns Chain hulled geometry
     * @group hulls
     * @shortname hullChain
     * @drawable true
     */
    async hullChain(inputs: Inputs.JSCAD.HullDto): Promise<any | any[]> {
        return this.jscadWorkerManager.genericCallToWorkerPromise('hulls.hullChain', inputs);
    }
    /**
     * Convex hull connects solids or 2d geometries by filling an empty space in between without following order.
     * Geometries need to be of the same type.
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/hulls/hullChain1.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/jscad/hulls/hullChain2.svg" alt="Blockly Image"/>
     *  <img src="../assets/images/blockly-images/jscad/hulls/hullChain3.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_hulls.JSCADHulls.html#hull
     * @param inputs Geometries
     * @returns Hulled geometry
     * @group hulls
     * @shortname hull
     * @drawable true
     */
    async hull(inputs: Inputs.JSCAD.HullDto): Promise<any | any[]>{
        return this.jscadWorkerManager.genericCallToWorkerPromise('hulls.hullChain', inputs);
    }
}
