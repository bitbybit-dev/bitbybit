import { assembleIntervalBlocks } from './interval/assemble-interval';
import { assembleMatrixBlocks } from './matrix/assemble-matrix';
import { assembleVectorBlocks } from './vector/assemble-vector';

export function assembleCoreBlocks() {
    assembleIntervalBlocks();
    assembleMatrixBlocks();
    assembleVectorBlocks();
}