import { assembleBabylonBlocks } from './babylon/assemble-babylon';
import { assembleVerbBlocks } from './verb/assemble-verb';
import { assembleBaseBlocks } from './base/assemble-base';

export function assembleBlocks() {
    assembleBabylonBlocks();
    assembleBaseBlocks();
    assembleVerbBlocks();
}