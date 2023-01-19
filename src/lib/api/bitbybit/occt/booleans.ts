
import * as Inputs from '../../inputs/inputs';
import { OCCTWorkerManager } from '../../../workers/occ/occ-worker-manager';


export class OCCTBooleans {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }

    /**
     * Joins separate objects
     * <div>
     *  <img src="../assets/images/blockly-images/occt/booleans/union.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_booleans.OCCTBooleans.html#union
     * @param inputs Objects to join
     * @returns OpenCascade joined shape
     */
    union(inputs: Inputs.OCCT.UnionDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise('booleans.union', inputs);
    }

    /**
     * Does boolean difference operation between a main shape and given shapes
     * <div>
     *  <img src="../assets/images/blockly-images/occt/booleans/difference.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_booleans.OCCTBooleans.html#difference
     * @param inputs Main shape and shapes to differ
     * @returns OpenCascade difference shape
     */
    difference(inputs: Inputs.OCCT.DifferenceDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise('booleans.difference', inputs);
    }

    /**
     * Does boolean intersection operation between a main shape and given shapes
     * <div>
     *  <img src="../assets/images/blockly-images/occt/booleans/difference.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_booleans.OCCTBooleans.html#intersection
     * @param inputs Main shape and shapes to differ
     * @returns OpenCascade intersection of shapes
     */
    intersection(inputs: Inputs.OCCT.IntersectionDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise('booleans.intersection', inputs);
    }
}
