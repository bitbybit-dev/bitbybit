import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import { createPointBlock } from './blocks/point';
import { createPointDistanceBlock } from './blocks/point-distance';
import { createPointGetXBlock } from './blocks/point-get-x';
import { createPointGetYBlock } from './blocks/point-get-y';
import { createPointGetZBlock } from './blocks/point-get-z';
import { createDrawPointBlock } from './blocks/draw-point';
import { createDrawPointsBlock } from './blocks/draw-points';
import { createDrawGridBlock } from './blocks/draw-grid';
import { createSceneBackgroundColourBlock } from './blocks/scene-background-colour';
import { createLineBlock } from './blocks/line';
import { createDrawLineBlock } from './blocks/draw-line';
import { createDrawLinesBlock } from './blocks/draw-lines';
import { prepareBabylonForBlockly } from './babylon-to-blockly';
import { createDrawPolylineBlock } from './blocks/draw-polyline';
import { createPolylineBlock } from './blocks/polyline';
import { createCurveByPointsBlock } from './blocks/curve-by-points';
import { createDrawCurveBlock } from './blocks/draw-curve';
import { createCurveDivideByArcLengthPointsBlock } from './blocks/curve-divide-by-arc-length-points';
import { createCurveDivideByEqualArcLengthPointsBlock } from './blocks/curve-divide-by-arc-equal-length-point';
import { createCurveDivideByEqualArcLengthParamsBlock } from './blocks/curve-divide-by-arc-equal-length-params';
import { createCurveDivideByArcLengthParamsBlock } from './blocks/curve-divide-by-arc-length-params';
import { createCurveClosestPointBlock } from './blocks/curve-closest-point';
import { createCurveClosestPointsBlock } from './blocks/curve-closest-points';
import { createCurveSplitBlock } from './blocks/curve-split';
import { createCurveClosestParamBlock } from './blocks/curve-closest-param';
import { createCurveClosestParamsBlock } from './blocks/curve-closest-params';
import { createCurveLengthBlock } from './blocks/curve-length';
import { createCurveLengthAtParamBlock } from './blocks/curve-length-at-param';
import { createCurveParamAtLengthBlock } from './blocks/curve-param-at-length';
import { createLineLengthBlock } from './blocks/line-length';
import { createPolylineLengthBlock } from './blocks/polyline-length';
import { createCurveByKnotsControlPointsWeightsBlock } from './blocks/curve-by-knots-control-points-weights';
import { createCurveDegreeBlock } from './blocks/curve-degree';
import { createCurveKnotsBlock } from './blocks/curve-knots';
import { createCurveControlPointsBlock } from './blocks/curve-control-points';
import { createCurveWeightsBlock } from './blocks/curve-weights';
import { createCurveCloneBlock } from './blocks/curve-clone';
import { createCoreIntervalBlock } from './blocks/core-interval';
import { createLineGetStartPointBlock } from './blocks/line-start-point';
import { createLineGetEndPointBlock } from './blocks/line-end-point';
import { createPolylineGetPointsBlock } from './blocks/polyline-points';
import { createPolylineGetPointsCountBlock } from './blocks/polyline-points-count';

prepareBabylonForBlockly();

createPointBlock();
createPointDistanceBlock();
createPointGetXBlock();
createPointGetYBlock();
createPointGetZBlock();
createPolylineBlock();
createPolylineLengthBlock();
createPolylineGetPointsBlock();
createPolylineGetPointsCountBlock();
createLineBlock();
createLineLengthBlock();
createLineGetStartPointBlock();
createLineGetEndPointBlock()
createDrawPointBlock();
createDrawPointsBlock();
createDrawGridBlock();
createSceneBackgroundColourBlock();
createDrawLineBlock();
createDrawLinesBlock();
createDrawPolylineBlock();
createDrawCurveBlock();
createCurveByKnotsControlPointsWeightsBlock();
createCurveByPointsBlock();
createCurveDivideByArcLengthPointsBlock();
createCurveDivideByEqualArcLengthPointsBlock();
createCurveDivideByArcLengthParamsBlock();
createCurveDivideByEqualArcLengthParamsBlock();
createCurveClosestPointBlock();
createCurveClosestPointsBlock();
createCurveSplitBlock();
createCurveClosestParamBlock();
createCurveClosestParamsBlock();
createCurveLengthBlock();
createCurveLengthAtParamBlock();
createCurveParamAtLengthBlock();
createCurveDegreeBlock();
createCurveKnotsBlock();
createCurveControlPointsBlock();
createCurveWeightsBlock();
createCurveCloneBlock();
createCoreIntervalBlock();

if (environment.production) {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));

