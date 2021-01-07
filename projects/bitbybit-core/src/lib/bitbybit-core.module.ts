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
    ],
    exports: []
})
export class BitbybitCoreModule { }
