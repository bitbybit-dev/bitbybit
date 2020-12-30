import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Scene } from '@babylonjs/core';
import { BitByBitBase } from './api/bitbybit';
import { Transforms } from './api/bitbybit/transforms';
import { Vector } from './api/bitbybit/vector';
import { Node } from './api/bitbybit/node';
import { Context } from './api/context';
import { Point } from './api/bitbybit/point';

@NgModule({
    declarations: [],
    imports: [
        CommonModule
    ],
    providers: [
        BitByBitBase, Context, Scene, Transforms, Vector, Node, Point
    ],
    exports: []
})
export class BitbybitCoreModule { }
