
import * as Inputs from '../../../inputs/inputs';
import { OCCTWorkerManager } from '../../../../workers/occ/occ-worker-manager';

export class OCCTIntersections {
    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }

    /**
     * Slices the shape at a given step interval along the provided direction
     * Source code of this method is only available in proprietary bitbybit library that is not opensourced
     * <div>
     *  <img src="../assets/images/blockly-images/occt/advanced/intersections/slice.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_advanced_intersections.OCCTIntersections.html#slice
     * @param inputs Shape to slice
     * @returns OpenCascade intersection faces
     */
    slice(inputs: Inputs.OCCT.SliceDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise('advanced.intersections.slice', inputs);
    }
}
