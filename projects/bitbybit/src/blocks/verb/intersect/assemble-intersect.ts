import { createIntersectCurveCurveBlock } from './curve-curve';
import { createIntersectCurveSurfaceBlock } from './curve-surface';
import { createIntersectSurfaceSurfaceBlock } from './surface-surface';
import { createIntersectCurveCurveFirstParamsBlock } from './curve-curve-first-params';
import { createIntersectCurveCurveFirstPointsBlock } from './curve-curve-first-points';
import { createIntersectCurveCurveSecondParamsBlock } from './curve-curve-second-params';
import { createIntersectCurveCurveSecondPointsBlock } from './curve-curve-second-points';
import { createIntersectCurveSurfaceCurveParamsBlock } from './curve-surface-curve-params';
import { createIntersectCurveSurfaceCurvePointsBlock } from './curve-surface-curve-points';
import { createIntersectCurveSurfaceSurfaceParamsBlock } from './curve-surface-surface-params';
import { createIntersectCurveSurfaceSurfacePointsBlock } from './curve-surface-surface-points';

export function assembleIntersectBlocks() {
    createIntersectCurveCurveBlock();
    createIntersectCurveSurfaceBlock();
    createIntersectSurfaceSurfaceBlock();
    createIntersectCurveCurveFirstParamsBlock();
    createIntersectCurveCurveFirstPointsBlock();
    createIntersectCurveCurveSecondParamsBlock();
    createIntersectCurveCurveSecondPointsBlock();
    createIntersectCurveSurfaceCurveParamsBlock();
    createIntersectCurveSurfaceCurvePointsBlock();
    createIntersectCurveSurfaceSurfaceParamsBlock();
    createIntersectCurveSurfaceSurfacePointsBlock();
}
