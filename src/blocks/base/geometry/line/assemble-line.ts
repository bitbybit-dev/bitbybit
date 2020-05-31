import { createLineBlock } from './line';
import { createLineLengthBlock } from './line-length';
import { createLineStartPointBlock } from './line-start-point';
import { createLineEndPointBlock } from './line-end-point';

export function assembleLineBlocks() {
    createLineBlock();
    createLineLengthBlock();
    createLineStartPointBlock();
    createLineEndPointBlock()
}