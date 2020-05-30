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
import { createInterpolatedCurveBlock } from './blocks/curve-through-points';
import { createDrawCurveBlock } from './blocks/draw-curve-through-points';
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

prepareBabylonForBlockly();

createPointBlock();
createPointDistanceBlock();
createPolylineBlock();
createLineBlock();
createLineLengthBlock();
createInterpolatedCurveBlock();
createDrawPointBlock();
createDrawPointsBlock();
createDrawGridBlock();
createSceneBackgroundColourBlock();
createDrawLineBlock();
createDrawLinesBlock();
createDrawPolylineBlock();
createDrawCurveBlock();
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

