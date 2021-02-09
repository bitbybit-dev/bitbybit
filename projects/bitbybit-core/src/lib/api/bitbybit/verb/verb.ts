import { Injectable } from '@angular/core';
import { VerbCurve } from './curve';
import { VerbIntersect } from './intersect';
import { VerbSurface } from './surface';

/**
 * Contains various functions for Nurbs curves and surfaces.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
@Injectable()
export class Verb {

    constructor(
        public readonly curve: VerbCurve,
        public readonly surface: VerbSurface,
        public readonly intersect: VerbIntersect,
    ) { }
}
