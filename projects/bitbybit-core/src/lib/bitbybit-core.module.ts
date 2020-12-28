import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Scene } from '@babylonjs/core';
import { BitByBitBase } from './api/bitbybit';
import { Transforms } from './api/bitbybit/transforms';
import { Vector } from './api/bitbybit/vector';
import { Context } from './api/context';

@NgModule({
    declarations: [],
    imports: [
        CommonModule
    ],
    providers: [
        BitByBitBase, Context, Scene, Transforms, Vector
    ],
    exports: []
})
export class BitbybitCoreModule { }
