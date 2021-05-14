import { Injectable } from '@angular/core';
import * as Inputs from '../../inputs/inputs';
import { OCCTWorkerManager } from '../../../workers/occ/occ-worker-manager';

@Injectable()
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
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_booleans.occtbooleans.html#union
     * @param inputs Objects to join
     * @returns OpenCascade joined shape
     */
    union(inputs: Inputs.OCCT.UnionDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('union', inputs);
    }

    /**
     * Does boolean difference operation between a main shape and given shapes
     * <div>
     *  <img src="../assets/images/blockly-images/occt/booleans/difference.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_booleans.occtbooleans.html#difference
     * @param inputs Main shape and shapes to differ
     * @returns OpenCascade difference shape
     */
    difference(inputs: Inputs.OCCT.DifferenceDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('difference', inputs);
    }

    /**
     * Does boolean intersection operation between a main shape and given shapes
     * <div>
     *  <img src="../assets/images/blockly-images/occt/booleans/difference.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_booleans.occtbooleans.html#difference
     * @param inputs Main shape and shapes to differ
     * @returns OpenCascade difference shape
     */
    intersection(inputs: Inputs.OCCT.IntersectionDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('intersection', inputs);
    }
}
