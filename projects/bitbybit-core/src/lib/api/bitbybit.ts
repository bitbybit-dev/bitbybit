import { Injectable } from '@angular/core';
import { Scene } from './bitbybit/scene';
import { Transforms } from './bitbybit/transforms';
import { Vector } from './bitbybit/vector';
import { Node } from './bitbybit/node';
import { Point } from './bitbybit/point';
import { Line } from './bitbybit/line';
import { Polyline } from './bitbybit/polyline';
import { Verb } from './bitbybit/verb/verb';
import { JSCAD } from './bitbybit/jscad';
import { Tag } from './bitbybit/tag';
import { Time } from './bitbybit/time';
import { OCCT } from './bitbybit/occt/occt';
import { Asset } from './bitbybit/asset';

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
        public readonly verb: Verb,
        public readonly jscad: JSCAD,
        public readonly tag: Tag,
        public readonly time: Time,
        public readonly occt: OCCT,
        public readonly asset: Asset,
    ) {
    }
}
