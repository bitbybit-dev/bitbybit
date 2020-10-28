import { createRotationCenterAxisBlock } from './rotation-center-axis';
import { createRotationCenterXBlock } from './rotation-center-x';
import { createRotationCenterYBlock } from './rotation-center-y';
import { createRotationCenterZBlock } from './rotation-center-z';
import { createScaleCenterUniformBlock } from './scale-center-uniform';
import { createScaleCenterXYZBlock } from './scale-center-xyz';
import { createScaleUniformBlock } from './scale-uniform';
import { createScaleXYZBlock } from './scale-xyz';
import { createTranslationXYZBlock } from './translation-xyz';
import { createRotationYawPitchRollBlock } from './rotation-yaw-pitch-roll';

export function assembleTransformationBlocks(): void {
    createScaleUniformBlock();
    createScaleXYZBlock();
    createScaleCenterUniformBlock();
    createScaleCenterXYZBlock();
    createTranslationXYZBlock();
    createRotationCenterAxisBlock();
    createRotationCenterXBlock();
    createRotationCenterYBlock();
    createRotationCenterZBlock();
    createRotationYawPitchRollBlock();
}
