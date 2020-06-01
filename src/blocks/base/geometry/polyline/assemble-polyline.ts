import { createPolylineBlock } from './polyline'; import { createPolylineLengthBlock } from './polyline-length'; import { createPolylinePointsBlock } from './polyline-points'; import { createPolylineGetPointsCountBlock } from './polyline-points-count';
import { createPolylineReverseBlock } from './polyline-reverse';
import { createPolylineConvertToNurbsCurveBlock } from './polyline-convert-to-nurbs-curve';

export function assemblePolylineBlocks() {
    createPolylineBlock();
    createPolylineLengthBlock();
    createPolylinePointsBlock();
    createPolylineGetPointsCountBlock();
    createPolylineReverseBlock();
    createPolylineConvertToNurbsCurveBlock();
}