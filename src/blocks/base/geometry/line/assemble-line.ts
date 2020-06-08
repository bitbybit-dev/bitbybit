import { createLineBlock } from './line';
import { createLineEndPointBlock } from './line-end-point';
import { createLineLengthBlock } from './line-length';
import { createLineConvertToNurbsCurveBlock } from './line-length-convert-to-nurbs-curve';
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