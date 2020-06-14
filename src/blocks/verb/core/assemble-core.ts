import { assembleIntervalBlocks } from './interval/assemble-interval';
import { assembleUVBlocks } from './uv/assemble-uv';
import { assembleVectorBlocks } from './vector/assemble-vector';

export function assembleCoreBlocks() {
    assembleIntervalBlocks();
    assembleVectorBlocks();
    assembleUVBlocks();
}