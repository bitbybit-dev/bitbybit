import { createScaleCenterUniformBlock } from './scale-center-uniform';
import { createScaleCenterXYZBlock } from './scale-center-xyz';
import { createScaleUniformBlock } from './scale-uniform';
import { createScaleXYZBlock } from './scale-xyz';
import { createTranslationXYZBlock } from './translation-xyz copy';

export function assembleTransformationBlocks() {
    createScaleUniformBlock();
    createScaleXYZBlock();
    createScaleCenterUniformBlock();
    createScaleCenterXYZBlock();
    createTranslationXYZBlock();
}
