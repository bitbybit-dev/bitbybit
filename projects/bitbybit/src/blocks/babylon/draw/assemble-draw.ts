import { createClearAllDrawnBlock } from './clear-all-drawn';
import { createDrawCurveBlock } from './draw-curve';
import { createDrawCurvesBlock } from './draw-curves';
import { createDrawGridBlock } from './draw-grid';
import { createDrawLineBlock } from './draw-line';
import { createDrawLinesBlock } from './draw-lines';
import { createDrawPointBlock } from './draw-point';
import { createDrawPointsBlock } from './draw-points';
import { createDrawPolylineBlock } from './draw-polyline';
import { createDrawPolylinesBlock } from './draw-polylines';
import { createDrawSurfaceBlock } from './draw-surface';
import { createDrawSurfacesBlock } from './draw-surfaces';
import { createDrawSurfacesColoursBlock } from './draw-surfaces-colours';

export function assembleDrawBlocks(){
    createDrawPointBlock();
    createDrawPointsBlock();
    createDrawGridBlock();
    createDrawLineBlock();
    createDrawLinesBlock();
    createDrawPolylineBlock();
    createDrawCurveBlock();
    createDrawCurvesBlock();
    createDrawSurfaceBlock();
    createDrawSurfacesBlock();
    createDrawSurfacesColoursBlock();
    createClearAllDrawnBlock();
    createDrawPolylinesBlock();
}
