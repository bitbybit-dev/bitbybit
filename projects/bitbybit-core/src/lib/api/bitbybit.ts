import { Injectable } from '@angular/core';
import { Scene } from './bitbybit/scene';
import { Transforms } from './bitbybit/transforms';
import { Vector } from './bitbybit/vector';
import { Node } from './bitbybit/node';
import { Point } from './bitbybit/point';
import { Line } from './bitbybit/line';
import { Polyline } from './bitbybit/polyline';
import { Curve } from './bitbybit/curve';

@Injectable()
export class BitByBitBase {
    constructor(
        public readonly scene: Scene,
        public readonly transforms: Transforms,
        public readonly vector: Vector,
        public readonly node: Node,
        public readonly point: Point,
        public readonly line: Line,
        public readonly polyline: Polyline,
        public readonly curve: Curve,
    ) {
    }
}