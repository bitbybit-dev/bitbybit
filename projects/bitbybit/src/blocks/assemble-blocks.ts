import { assembleBabylonBlocks } from './babylon/assemble-babylon';
import { assembleVerbBlocks } from './verb/assemble-verb';
import { assembleBaseBlocks } from './base/assemble-base';
import { assembleCsgBlocks } from './csg/assemble-csg';

export function assembleBlocks() {
    assembleBabylonBlocks();
    assembleBaseBlocks();
    assembleVerbBlocks();
    assembleCsgBlocks();
}