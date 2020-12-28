import { Injectable } from '@angular/core';
import { Scene } from './bitbybit/scene';
import { Transforms } from './bitbybit/transforms';
import { Vector } from './bitbybit/vector';
@Injectable()
export class BitByBitBase {
    constructor(
        public readonly scene: Scene,
        public readonly transforms: Transforms,
        public readonly vector: Vector
    ) {
    }
}
