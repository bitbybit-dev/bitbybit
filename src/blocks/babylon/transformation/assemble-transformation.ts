import { createScaleUniformBlock } from './scale-uniform';
import { createScaleXYZBlock } from './scale-xyz';

export function assembleTransformationBlocks() {
    createScaleUniformBlock();
    createScaleXYZBlock();
}