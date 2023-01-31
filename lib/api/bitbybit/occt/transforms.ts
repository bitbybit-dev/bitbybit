
import * as Inputs from '../../inputs/inputs';
import { OCCTWorkerManager } from '../../../workers/occ/occ-worker-manager';


export class OCCTTransforms {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }

    /**
     * Transforms the shape
     * <div>
     *  <img src="../assets/images/blockly-images/occt/transforms/transform.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#transform
     * @param inputs Transformation description
     * @returns OpenCascade shape
     */
    transform(inputs: Inputs.OCCT.TransformDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise('transforms.transform', inputs);
    }

    /**
     * Rotate the shape
     * <div>
     *  <img src="../assets/images/blockly-images/occt/transforms/rotate.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#rotate
     * @param inputs Rotation description
     * @returns OpenCascade shape
     */
    rotate(inputs: Inputs.OCCT.RotateDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise('transforms.rotate', inputs);
    }

    /**
     * Align the shape
     * <div>
     *  <img src="../assets/images/blockly-images/occt/transforms/align.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#align
     * @param inputs Align description
     * @returns OpenCascade shape
     */
    align(inputs: Inputs.OCCT.AlignDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise('transforms.align', inputs);
    }

    /**
     * Translates the shape
     * <div>
     *  <img src="../assets/images/blockly-images/occt/transforms/translate.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#translate
     * @param inputs Translation description
     * @returns OpenCascade shape
     */
    translate(inputs: Inputs.OCCT.TranslateDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise('transforms.translate', inputs);
    }

    /**
     * Scales the shape
     * <div>
     *  <img src="../assets/images/blockly-images/occt/transforms/scale.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#scale
     * @param inputs Scale description
     * @returns OpenCascade shape
     */
    scale(inputs: Inputs.OCCT.ScaleDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise('transforms.scale', inputs);
    }

    /**
     * Scales the shape in 3D
     * <div>
     *  <img src="../assets/images/blockly-images/occt/transforms/scale3d.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#scale3d
     * @param inputs Scale 3D description
     * @returns OpenCascade scaled shape
     */
    scale3d(inputs: Inputs.OCCT.Scale3DDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise('transforms.scale3d', inputs);
    }

    /**
     * Mirrors the shape
     * <div>
     *  <img src="../assets/images/blockly-images/occt/transforms/mirror.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#mirror
     * @param inputs Mirror axis origin, axis direction and shape
     * @returns OpenCascade shape
     */
    mirror(inputs: Inputs.OCCT.MirrorDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise('transforms.mirror', inputs);
    }

    /**
     * Mirrors the shape along the normal and origin
     * <div>
     *  <img src="../assets/images/blockly-images/occt/transforms/mirrorAlongNormal.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#mirrorAlongNormal
     * @param inputs Normal for mirroring with origin
     * @returns OpenCascade shape
     */
    mirrorAlongNormal(inputs: Inputs.OCCT.MirrorAlongNormalDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise('transforms.mirrorAlongNormal', inputs);
    }

    /**
     * Transforms the array of shapes with transformations
     * <div>
     *  <img src="../assets/images/blockly-images/occt/transforms/transformShapes.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#transformShapes
     * @param inputs Transformation descriptions
     * @returns OpenCascade shapes
     */
    transformShapes(inputs: Inputs.OCCT.TransformShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise('transforms.transformShapes', inputs);
    }

    /**
     * Rotate the shapes with rotations
     * <div>
     *  <img src="../assets/images/blockly-images/occt/transforms/rotateShapes.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#rotateShapes
     * @param inputs Rotation descriptions
     * @returns OpenCascade shapes
     */
    rotateShapes(inputs: Inputs.OCCT.RotateShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise('transforms.rotateShapes', inputs);
    }

    /**
     * Align the shapes with alignments
     * <div>
     *  <img src="../assets/images/blockly-images/occt/transforms/alignShapes.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#alignShapes
     * @param inputs Align descriptions
     * @returns OpenCascade shapes
     */
    alignShapes(inputs: Inputs.OCCT.AlignShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise('transforms.alignShapes', inputs);
    }

    /**
     * Translates the shapes with translations
     * <div>
     *  <img src="../assets/images/blockly-images/occt/transforms/translateShapes.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#translateShapes
     * @param inputs Translation descriptions
     * @returns OpenCascade shapes
     */
    translateShapes(inputs: Inputs.OCCT.TranslateShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise('transforms.translateShapes', inputs);
    }

    /**
     * Scales the shapes with scale factors
     * <div>
     *  <img src="../assets/images/blockly-images/occt/transforms/scaleShapes.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#scaleShapes
     * @param inputs Scale descriptions
     * @returns OpenCascade shapes
     */
    scaleShapes(inputs: Inputs.OCCT.ScaleShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise('transforms.scaleShapes', inputs);
    }

    /**
     * Scales the shape in 3D
     * <div>
     *  <img src="../assets/images/blockly-images/occt/transforms/scale3dShapes.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#scale3dShapes
     * @param inputs Scale 3D descriptions
     * @returns OpenCascade scaled shapes
     */
    scale3dShapes(inputs: Inputs.OCCT.Scale3DShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise('transforms.scale3dShapes', inputs);
    }

    /**
     * Mirrors the shapes with multiple mirrors
     * <div>
     *  <img src="../assets/images/blockly-images/occt/transforms/mirrorShapes.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#mirrorShapes
     * @param inputs Mirror axis origins, axis directions and shapes
     * @returns OpenCascade shapes
     */
    mirrorShapes(inputs: Inputs.OCCT.MirrorShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise('transforms.mirrorShapes', inputs);
    }

    /**
     * Mirrors the shapes along the normal and origin
     * <div>
     *  <img src="../assets/images/blockly-images/occt/transforms/mirrorAlongNormalShapes.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#mirrorAlongNormalShapes
     * @param inputs Normals for mirroring with origins
     * @returns OpenCascade shapes
     */
    mirrorAlongNormalShapes(inputs: Inputs.OCCT.MirrorAlongNormalShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise('transforms.mirrorAlongNormalShapes', inputs);
    }
}
