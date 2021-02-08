import { Injectable } from '@angular/core';
import { OCCTCompound } from './compound';
import { OCCTEdge } from './edge';
import { OCCTFace } from './face';
import { OCCTSolid } from './solid';
import { OCCTWire } from './wire';

@Injectable()
export class OCCTShapes {

    constructor(
        public readonly edge: OCCTEdge,
        public readonly wire: OCCTWire,
        public readonly face: OCCTFace,
        public readonly solid: OCCTSolid,
        public readonly compound: OCCTCompound,
    ) {
    }

}
