import { assembleDrawBlocks } from './draw/assemble-draw';
import { assembleSceneBlocks } from './scene/assemble-scene';


export function assembleBabylonBlocks() {
    assembleDrawBlocks();
    assembleSceneBlocks();
}