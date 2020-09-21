import { assembleDrawBlocks } from './draw/assemble-draw';
import { assembleSceneBlocks } from './scene/assemble-scene';
import { assembleNodeBlocks } from './node/assemble-node';
import { assembleTransformationBlocks } from './transformation/assemble-transformation';

export function assembleBabylonBlocks() {
    assembleDrawBlocks();
    assembleSceneBlocks();
    assembleTransformationBlocks();
    assembleNodeBlocks();
}