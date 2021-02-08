import { assembleBabylonBlocks } from './babylon/assemble-babylon';
import { assembleVerbBlocks } from './verb/assemble-verb';
import { assembleBaseBlocks } from './base/assemble-base';
import { assembleCsgBlocks } from './csg/assemble-csg';
import { assembleOCCTBlocks } from './occt/assemble-occt';

export function assembleBlocks(): void {
    assembleBabylonBlocks();
    assembleBaseBlocks();
    assembleVerbBlocks();
    assembleCsgBlocks();
    assembleOCCTBlocks();
}
