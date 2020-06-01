import { assembleIntervalBlocks } from './interval/assemble-interval';
import { assembleMatrixBlocks } from './matrix/assemble-matrix';
import { assembleVectorBlocks } from './vector/assemble-vector';
import { assembleUVBlocks } from './uv/assemble-uv';

export function assembleCoreBlocks() {
    assembleIntervalBlocks();
    assembleMatrixBlocks();
    assembleVectorBlocks();
    assembleUVBlocks();
}