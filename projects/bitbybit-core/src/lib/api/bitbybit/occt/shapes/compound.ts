import { Injectable } from '@angular/core';
import * as Inputs from '../../../inputs/inputs';
import { OCCTWorkerManager } from '../../../../workers/occ/occ-worker-manager';

@Injectable()
export class OCCTCompound {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }

    /**
     * Makes the compound shape, which can include any kind of shapes
     * <div>
     *  <img src="../assets/images/blockly-images/occ/makeCompound.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#makecompound
     * @param inputs OpenCascade shapes
     * @returns OpenCascade compounded shape
     */
    makeCompound(inputs: Inputs.OCC.CompoundShapesDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('makeCompound', inputs);
    }

}
