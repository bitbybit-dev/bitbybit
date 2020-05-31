import { createLineBlock } from './line';
import { createLineLengthBlock } from './line-length';
import { createLineGetStartPointBlock } from './line-start-point';
import { createLineGetEndPointBlock } from './line-end-point';

export function assembleLineBlocks() {
    createLineBlock();
    createLineLengthBlock();
    createLineGetStartPointBlock();
    createLineGetEndPointBlock()
}