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

@NgModule({
    declarations: [],
    imports: [
        CommonModule
    ],
    providers: [
        BitByBitBase, GeometryHelper, Context, Scene, Transforms, Vector, Node, Point
    ],
    exports: []
})
export class BitbybitCoreModule { }
