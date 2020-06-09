import { createPolylineBlock } from './polyline';
import { createPolylineConvertToNurbsCurveBlock } from './polyline-convert-to-nurbs-curve';
import { createPolylineLengthBlock } from './polyline-length';
import { createPolylinePointsBlock } from './polyline-points';
import { createPolylineGetPointsCountBlock } from './polyline-points-count';
import { createPolylineReverseBlock } from './polyline-reverse';

export function assemblePolylineBlocks() {
    createPolylineBlock();
    createPolylineLengthBlock();
    createPolylinePointsBlock();
    createPolylineGetPointsCountBlock();
    createPolylineReverseBlock();
    createPolylineConvertToNurbsCurveBlock();
}
