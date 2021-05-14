import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BitByBitBase } from './api/bitbybit';
import { Transforms } from './api/bitbybit/transforms';
import { Vector } from './api/bitbybit/vector';
import { Node } from './api/bitbybit/node';
import { Context } from './api/context';
import { Point } from './api/bitbybit/point';
import { GeometryHelper } from './api/geometry-helper';
import { Scene } from './api/bitbybit/scene';
import { Line } from './api/bitbybit/line';
import { Polyline } from './api/bitbybit/polyline';
import { VerbCurve } from './api/bitbybit/verb/curve';
import { VerbCurveCircle } from './api/bitbybit/verb/curve-circle';
import { VerbCurveEllipse } from './api/bitbybit/verb/curve-ellipse';
import { VerbSurface } from './api/bitbybit/verb/surface';
import { VerbSurfaceConical } from './api/bitbybit/verb/surface-conical';
import { VerbSurfaceCylindrical } from './api/bitbybit/verb/surface-cylindrical';
import { VerbSurfaceExtrusion } from './api/bitbybit/verb/surface-extrusion';
import { VerbSurfaceSpherical } from './api/bitbybit/verb/surface-spherical';
import { VerbSurfaceRevolved } from './api/bitbybit/verb/surface-revolved';
import { VerbSurfaceSweep } from './api/bitbybit/verb/surface-sweep';
import { JSCAD } from './api/bitbybit/jscad';
import { JSCADBooleans } from './api/bitbybit/jscad-booleans';
import { JSCADExpansions } from './api/bitbybit/jscad-expansions';
import { JSCADExtrusions } from './api/bitbybit/jscad-extrusions';
import { JSCADHulls } from './api/bitbybit/jscad-hulls';
import { JSCADPolygon } from './api/bitbybit/jscad-polygon';
import { JSCADPath } from './api/bitbybit/jscad-path';
import { JSCADShapes } from './api/bitbybit/jscad-shapes';
import { JSCADText } from './api/bitbybit/jscad-text';
import { VerbIntersect } from './api/bitbybit/verb/intersect';
import { Tag } from './api/bitbybit/tag';
import { Time } from './api/bitbybit/time';
import { OCCT } from './api/bitbybit/occt/occt';
import { Verb } from './api/bitbybit/verb/verb';
import { OCCTWorkerManager } from './workers/occ/occ-worker-manager';
import { OCCTShapes } from './api/bitbybit/occt/shapes/shapes';
import { OCCTEdge } from './api/bitbybit/occt/shapes/edge';
import { OCCTWire } from './api/bitbybit/occt/shapes/wire';
import { OCCTFace } from './api/bitbybit/occt/shapes/face';
import { OCCTBooleans } from './api/bitbybit/occt/booleans';
import { OCCTIO } from './api/bitbybit/occt/io';
import { OCCTOperations } from './api/bitbybit/occt/operations';
import { OCCTTransforms } from './api/bitbybit/occt/transforms';
import { OCCTSolid } from './api/bitbybit/occt/shapes/solid';
import { OCCTCompound } from './api/bitbybit/occt/shapes/compound';
import { AssetManager } from './asset-manager';
import { Asset } from './api/bitbybit/asset';
@NgModule({
    declarations: [],
    imports: [
        CommonModule
    ],
    providers: [
        BitByBitBase,
        GeometryHelper,
        Context,
        Scene,
        Transforms,
        Vector,
        Node,
        Point,
        Line,
        Polyline,
        Verb,
        VerbCurve,
        VerbCurveCircle,
        VerbCurveEllipse,
        VerbSurface,
        VerbSurfaceConical,
        VerbSurfaceCylindrical,
        VerbSurfaceExtrusion,
        VerbSurfaceSpherical,
        VerbSurfaceRevolved,
        VerbSurfaceSweep,
        VerbIntersect,
        JSCAD,
        JSCADBooleans,
        JSCADExpansions,
        JSCADExtrusions,
        JSCADHulls,
        JSCADPath,
        JSCADPolygon,
        JSCADShapes,
        JSCADText,
        Tag,
        Time,
        OCCT,
        OCCTShapes,
        OCCTEdge,
        OCCTWire,
        OCCTFace,
        OCCTSolid,
        OCCTCompound,
        OCCTTransforms,
        OCCTBooleans,
        OCCTIO,
        OCCTOperations,
        OCCTWorkerManager,
        Asset,
        AssetManager
    ],
    exports: []
})
export class BitbybitCoreModule { }
