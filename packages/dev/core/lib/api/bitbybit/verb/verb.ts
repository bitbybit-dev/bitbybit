
import { ContextBase } from "../../context";
import { GeometryHelper } from "../../geometry-helper";
import { VerbCurve } from "./curve";
import { VerbIntersect } from "./intersect";
import { VerbSurface } from "./surface";

/**
 * Contains various functions for Nurbs curves and surfaces.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
export class Verb {

    public readonly curve: VerbCurve;
    public readonly surface: VerbSurface;
    public readonly intersect: VerbIntersect;

    constructor(
        context: ContextBase,
        geometryHelper: GeometryHelper
    ) {
        this.curve = new VerbCurve(context, geometryHelper);
        this.surface = new VerbSurface(context, geometryHelper);
        this.intersect = new VerbIntersect(context, geometryHelper);
    }
}
