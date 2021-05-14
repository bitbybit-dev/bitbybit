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
     *  <img src="../assets/images/blockly-images/occt/io/saveShapeSTEP.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_io.occtio.html#saveshapestep
     * @param inputs STEP filename and shape to be saved
     * @returns String of a step file
     */
    saveShapeSTEP(inputs: Inputs.OCCT.SaveStepDto): Promise<string> {
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

    /**
     * Imports the step or iges asset file
     * <div>
     *  <img src="../assets/images/blockly-images/occt/io/loadSTEPorIGES.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_io.occtio.html#loadsteporiges
     * @param inputs STEP or IGES import
     * @returns OCCT Shape
     */
    loadSTEPorIGES(inputs: Inputs.OCCT.ImportStepIgesDto): Promise<any> {
        // first we should check if we have assetName loaded already
        // if we dont have we do this, otherwise return from the cache...
        return BitByBitBlocklyHelperService.getFile(inputs.assetFile).then(s => {
            return this.occWorkerManager.genericCallToWorkerPromise(
                'loadSTEPorIGES',
                new Inputs.OCCT.LoadStepOrIgesDto(s, inputs.assetFile.name)
            );
        });
    }
}
