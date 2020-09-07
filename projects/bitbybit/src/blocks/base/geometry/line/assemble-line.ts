import { createLineBlock } from './line';
import { createLineConvertToNurbsCurveBlock } from './line-convert-to-nurbs-curve';
import { createLineEndPointBlock } from './line-end-point';
import { createLineLengthBlock } from './line-length';
import { createLineReverseBlock } from './line-reverse';
import { createLineStartPointBlock } from './line-start-point';
import { createLineTransformBlock } from './line-transform';
import { createLinesBlock } from './lines';
import { createLinesBetweenPointsBlock } from './lines-between-points';
import { createLinesConvertToNurbsCurvesBlock } from './lines-convert-to-nurbs-curves';

export function assembleLineBlocks() {
    createLineBlock();
    createLineLengthBlock();
    createLineStartPointBlock();
    createLineEndPointBlock();
    createLineReverseBlock();
    createLineConvertToNurbsCurveBlock();
    createLineTransformBlock();
    createLinesBlock();
    createLinesConvertToNurbsCurvesBlock();
    createLinesBetweenPointsBlock();
}
