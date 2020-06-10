import { createLineBlock } from './line';
import { createLineConvertToNurbsCurveBlock } from './line-convert-to-nurbs-curve';
import { createLineEndPointBlock } from './line-end-point';
import { createLineLengthBlock } from './line-length';
import { createLineReverseBlock } from './line-reverse';
import { createLineStartPointBlock } from './line-start-point';

export function assembleLineBlocks() {
    createLineBlock();
    createLineLengthBlock();
    createLineStartPointBlock();
    createLineEndPointBlock();
    createLineReverseBlock();
    createLineConvertToNurbsCurveBlock();
}
