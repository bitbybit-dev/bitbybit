
import * as Inputs from '../../../inputs/inputs';
import { OCCTWorkerManager } from '../../../../workers/occ/occ-worker-manager';


export class OCCTCompound {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }

    /**
     * Makes the compound shape, which can include any kind of shapes
     * <div>
     *  <img src="../assets/images/blockly-images/occt/shapes/compound/makeCompound.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_compound.OCCTCompound.html#makeCompound
     * @param inputs OpenCascade shapes
     * @returns OpenCascade compounded shape
     */
    makeCompound(inputs: Inputs.OCCT.CompoundShapesDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.compound.makeCompound', inputs);
    }

}
