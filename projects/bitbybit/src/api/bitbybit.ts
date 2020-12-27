import { Injectable } from '@angular/core';
import { Scene } from './categories/scene';
import { Transforms } from './categories/transforms';
import { Vector } from './categories/vector';
@Injectable()
export class BitByBitBase {
    constructor(
        public readonly scene: Scene,
        public readonly transforms: Transforms,
        public readonly vector: Vector
    ) {
    }
}
