import { Injectable } from '@angular/core';
import * as Inputs from '../../inputs/inputs';
import { OCCTWorkerManager } from '../../../workers/occ/occ-worker-manager';

@Injectable()
export class OCCTTransforms {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }

    /**
     * Transforms the array of shapes
     * <div>
     *  <img src="../assets/images/blockly-images/occt/transforms/transform.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.occttransforms.html#transform
     * @param inputs Transformation description
     * @returns OpenCascade shapes
     */
    transform(inputs: Inputs.OCC.TransformDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('transform', inputs);
    }


    /**
     * Rotate the shapes
     * <div>
     *  <img src="../assets/images/blockly-images/occt/transforms/rotate.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.occttransforms.html#rotate
     * @param inputs Rotation description
     * @returns OpenCascade shapes
     */
    rotate(inputs: Inputs.OCC.RotateDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('rotate', inputs);
    }


    /**
     * Translates the shapes
     * <div>
     *  <img src="../assets/images/blockly-images/occt/transforms/translate.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.occttransforms.html#translate
     * @param inputs Translation description
     * @returns OpenCascade shapes
     */
    translate(inputs: Inputs.OCC.TranslateDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('translate', inputs);
    }

    /**
     * Scales the shapes
     * <div>
     *  <img src="../assets/images/blockly-images/occt/transforms/scale.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.occttransforms.html#scale
     * @param inputs Scale description
     * @returns OpenCascade shapes
     */
    scale(inputs: Inputs.OCC.ScaleDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('scale', inputs);
    }

}
