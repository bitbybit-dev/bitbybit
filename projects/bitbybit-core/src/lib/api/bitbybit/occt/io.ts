import { Injectable } from '@angular/core';
import * as Inputs from '../../inputs/inputs';
import { OCCTWorkerManager } from '../../../workers/occ/occ-worker-manager';
import { BitByBitBlocklyHelperService } from '../../../bit-by-bit-blockly-helper.service';

@Injectable()
export class OCCTIO {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }

    /**
     * Saves the step file
     * <div>
     *  <img src="../assets/images/blockly-images/occt/saveShapeSTEP.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#saveshapestep
     * @param inputs STEP filename and shape to be saved
     * @returns String of a step file
     */
    saveShapeSTEP(inputs: Inputs.OCC.SaveStepDto): Promise<string> {
        return this.occWorkerManager.genericCallToWorkerPromise('saveShapeSTEP', inputs).then(s => {
            const blob = new Blob([s], { type: 'text/plain' });
            const blobUrl = URL.createObjectURL(blob);

            const fileLink = document.createElement('a');
            fileLink.href = blobUrl;
            fileLink.target = '_self';
            fileLink.download = 'bitbybit-dev.step';
            fileLink.click();
            fileLink.remove();
            return s;
        });
    }

    // importSTEPorIGES(inputs: Inputs.OCC.ImportStepIgesDto): Promise<any> {
    //     // first we should check if we have assetName loaded already
    //     // if we dont have we do this, otherwise return from the cache...
    //     return BitByBitBlocklyHelperService.getFile().then(s => {
    //         return this.occWorkerManager.genericCallToWorkerPromise(
    //             'importSTEPorIGES',
    //             new Inputs.OCC.ImportStepOrIgesDto(s, inputs.assetName)
    //         );
    //     });
    // }
}
