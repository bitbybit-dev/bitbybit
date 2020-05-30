import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import { createPointBlock } from './blocks/point';
import { createPointDistanceBlock } from './blocks/point-distance';
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

prepareBabylonForBlockly();

createPointBlock();
createPointDistanceBlock();
createPolylineBlock();
createPolylineLengthBlock();
createLineBlock();
createLineLengthBlock();
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

if (environment.production) {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));

