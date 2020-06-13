import { createScaleUniformBlock } from './scale-uniform';
import { createScaleCenterUniformBlock } from './scale-uniform-center';
import { createScaleXYZBlock } from './scale-xyz';

export function assembleTransformationBlocks() {
    createScaleUniformBlock();
    createScaleXYZBlock();
    createScaleCenterUniformBlock();
}
