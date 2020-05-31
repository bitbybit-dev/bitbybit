import { createLineBlock } from './line';
import { createLineLengthBlock } from './line-length';
import { createLineStartPointBlock } from './line-start-point';
import { createLineEndPointBlock } from './line-end-point';
import { createLineReverseBlock } from './line-reverse';

export function assembleLineBlocks() {
    createLineBlock();
    createLineLengthBlock();
    createLineStartPointBlock();
    createLineEndPointBlock();
    createLineReverseBlock();
}