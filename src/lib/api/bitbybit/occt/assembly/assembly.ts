
import * as Inputs from '../../../inputs/inputs';
import { OCCTWorkerManager } from '../../../../workers/occ/occ-worker-manager';


export class OCCTAssembly {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }

    /**
     * Scans assembly
     * <div>
     *  <img src="../assets/images/blockly-images/occt/assembly/scan.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_assembly.OCCTAssembly.html#scan
     * @param inputs Shape to scan
     * @returns Data for assembly preview
     */
    scan(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('assembly.scan', inputs);
    }

}
