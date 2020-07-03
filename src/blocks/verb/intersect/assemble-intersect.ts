import { createIntersectCurveCurveBlock } from './curve-curve';
import { createIntersectCurveCurveFirstParamsBlock } from './curve-curve-first-params';
import { createIntersectCurveCurveFirstPointsBlock } from './curve-curve-first-points';
import { createIntersectCurveCurveSecondParamsBlock } from './curve-curve-second-params';
import { createIntersectCurveCurveSecondPointsBlock } from './curve-curve-second-points';

export function assembleIntersectBlocks() {
    createIntersectCurveCurveBlock();
    createIntersectCurveCurveFirstParamsBlock();
    createIntersectCurveCurveFirstPointsBlock();
    createIntersectCurveCurveSecondParamsBlock();
    createIntersectCurveCurveSecondPointsBlock();
}
