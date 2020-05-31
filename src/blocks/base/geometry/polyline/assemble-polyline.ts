import { createPolylineBlock } from './polyline'; import { createPolylineLengthBlock } from './polyline-length'; import { createPolylinePointsBlock } from './polyline-points'; import { createPolylineGetPointsCountBlock } from './polyline-points-count';

export function assemblePolylineBlocks() {
    createPolylineBlock();
    createPolylineLengthBlock();
    createPolylinePointsBlock();
    createPolylineGetPointsCountBlock();
}