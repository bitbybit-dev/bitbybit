import { createRotationCenterAxisBlock } from './rotation-center-axis';
import { createRotationCenterXBlock } from './rotation-center-x';
import { createRotationCenterYBlock } from './rotation-center-y';
import { createRotationCenterZBlock } from './rotation-center-z';
import { createScaleCenterUniformBlock } from './scale-center-uniform';
import { createScaleCenterXYZBlock } from './scale-center-xyz';
import { createScaleUniformBlock } from './scale-uniform';
import { createScaleXYZBlock } from './scale-xyz';
import { createTranslationXYZBlock } from './translation-xyz';

export function assembleTransformationBlocks() {
    createScaleUniformBlock();
    createScaleXYZBlock();
    createScaleCenterUniformBlock();
    createScaleCenterXYZBlock();
    createTranslationXYZBlock();
    createRotationCenterAxisBlock();
    createRotationCenterXBlock();
    createRotationCenterYBlock();
    createRotationCenterZBlock();
}
