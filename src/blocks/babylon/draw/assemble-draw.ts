import { createDrawPointBlock } from './draw-point';
import { createDrawPointsBlock } from './draw-points';
import { createDrawGridBlock } from './draw-grid';
import { createDrawLineBlock } from './draw-line';
import { createDrawLinesBlock } from './draw-lines';
import { createDrawPolylineBlock } from './draw-polyline';
import { createDrawCurveBlock } from './draw-curve';
import { createDrawSurfaceBlock } from './draw-surface';

export function assembleDrawBlocks(){
    createDrawPointBlock();
    createDrawPointsBlock();
    createDrawGridBlock();
    createDrawLineBlock();
    createDrawLinesBlock();
    createDrawPolylineBlock();
    createDrawCurveBlock();    
    createDrawSurfaceBlock();
}