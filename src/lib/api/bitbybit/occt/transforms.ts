
import * as Inputs from '../../inputs/inputs';
import { OCCTWorkerManager } from '../../../workers/occ/occ-worker-manager';


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
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#transform
     * @param inputs Transformation description
     * @returns OpenCascade shapes
     */
    transform(inputs: Inputs.OCCT.TransformDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('transforms.transform', inputs);
    }


    /**
     * Rotate the shapes
     * <div>
     *  <img src="../assets/images/blockly-images/occt/transforms/rotate.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#rotate
     * @param inputs Rotation description
     * @returns OpenCascade shapes
     */
    rotate(inputs: Inputs.OCCT.RotateDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('transforms.rotate', inputs);
    }


    /**
     * Translates the shapes
     * <div>
     *  <img src="../assets/images/blockly-images/occt/transforms/translate.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#translate
     * @param inputs Translation description
     * @returns OpenCascade shapes
     */
    translate(inputs: Inputs.OCCT.TranslateDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('transforms.translate', inputs);
    }

    /**
     * Scales the shapes
     * <div>
     *  <img src="../assets/images/blockly-images/occt/transforms/scale.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#scale
     * @param inputs Scale description
     * @returns OpenCascade shapes
     */
    scale(inputs: Inputs.OCCT.ScaleDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('transforms.scale', inputs);
    }

    /**
     * Mirrors the shapes
     * <div>
     *  <img src="../assets/images/blockly-images/occt/transforms/mirror.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#mirror
     * @param inputs Mirror axis origin, axis direction and shape
     * @returns OpenCascade shape
     */
    mirror(inputs: Inputs.OCCT.MirrorDto): Promise<any> {
        return this.occWorkerManager.genericCallToWorkerPromise('transforms.mirror', inputs);
    }

}
