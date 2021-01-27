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
import { Curve } from './api/bitbybit/curve';
import { CurveCircle } from './api/bitbybit/curve-circle';
import { CurveEllipse } from './api/bitbybit/curve-ellipse';
import { Surface } from './api/bitbybit/surface';
import { SurfaceConical } from './api/bitbybit/surface-conical';
import { SurfaceCylindrical } from './api/bitbybit/surface-cylindrical';
import { SurfaceExtrusion } from './api/bitbybit/surface-extrusion';
import { SurfaceSpherical } from './api/bitbybit/surface-spherical';
import { SurfaceRevolved } from './api/bitbybit/surface-revolved';
import { SurfaceSweep } from './api/bitbybit/surface-sweep';
import { JSCAD } from './api/bitbybit/jscad';
import { JSCADBooleans } from './api/bitbybit/jscad-booleans';
import { JSCADExpansions } from './api/bitbybit/jscad-expansions';
import { JSCADExtrusions } from './api/bitbybit/jscad-extrusions';
import { JSCADHulls } from './api/bitbybit/jscad-hulls';
import { JSCADPolygon } from './api/bitbybit/jscad-polygon';
import { JSCADPath } from './api/bitbybit/jscad-path';
import { JSCADShapes } from './api/bitbybit/jscad-shapes';
import { JSCADText } from './api/bitbybit/jscad-text';
import { Intersect } from './api/bitbybit/intersect';
import { Tag } from './api/bitbybit/tag';
import { Time } from './api/bitbybit/time';
import { OCC } from './api/bitbybit/occ/occ';
import { OCCHelper } from './api/bitbybit/occ/occ-helper';
import { OCCService } from './api/bitbybit/occ/occ-service';

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
        Curve,
        CurveCircle,
        CurveEllipse,
        Surface,
        SurfaceConical,
        SurfaceCylindrical,
        SurfaceExtrusion,
        SurfaceSpherical,
        SurfaceRevolved,
        SurfaceSweep,
        JSCAD,
        JSCADBooleans,
        JSCADExpansions,
        JSCADExtrusions,
        JSCADHulls,
        JSCADPath,
        JSCADPolygon,
        JSCADShapes,
        JSCADText,
        Intersect,
        Tag,
        Time,
        OCC,
        OCCHelper,
        OCCService,
    ],
    exports: []
})
export class BitbybitCoreModule { }
