import { Injectable } from '@angular/core';
import { Scene } from './scene';
import { Transforms } from './transforms';
import * as a from '@babylonjs/core';
@Injectable()
export class BitByBitBase {
    constructor(
        public readonly scene: Scene,
        public readonly transforms: Transforms,
    ) {
    }
}
