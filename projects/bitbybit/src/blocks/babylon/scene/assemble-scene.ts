import { createScenePointLightBlock } from './point-light';
import { createSceneBackgroundColourBlock } from './scene-background-colour';

export function assembleSceneBlocks(): void {
    createSceneBackgroundColourBlock();
    createScenePointLightBlock();
}