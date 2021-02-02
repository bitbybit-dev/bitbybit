import { createSceneAdjustActiveArcRotateBlock } from './adjust-active-arc-rotate-camera';
import { createScenePointLightBlock } from './point-light';
import { createSceneBackgroundColourBlock } from './scene-background-colour';
import { createMeshInstanceAndTransformBlock } from './scene-mesh-instance-and-transform';

export function assembleSceneBlocks(): void {
    createSceneBackgroundColourBlock();
    createScenePointLightBlock();
    createSceneAdjustActiveArcRotateBlock();
    createMeshInstanceAndTransformBlock();
}
