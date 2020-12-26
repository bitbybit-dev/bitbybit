import { Injectable } from '@angular/core';
import { Scene } from './scene';
import { Transforms } from './transforms';
import { Vector } from './vector';
@Injectable()
export class BitByBitBase {
    constructor(
        public readonly scene: Scene,
        public readonly transforms: Transforms,
        public readonly vector: Vector
    ) {
    }
}
