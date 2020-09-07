import { assembleDrawBlocks } from './draw/assemble-draw';
import { assembleSceneBlocks } from './scene/assemble-scene';
import { assembleTransformationBlocks } from './transformation/assemble-transformation';


export function assembleBabylonBlocks() {
    assembleDrawBlocks();
    assembleSceneBlocks();
    assembleTransformationBlocks();
}