
import { ContextBase } from "../../context";
import { MathBitByBit, GeometryHelper } from "@bitbybit-dev/base";
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
        geometryHelper: GeometryHelper,
        private readonly math: MathBitByBit
    ) {
        this.curve = new VerbCurve(context, geometryHelper, this.math);
        this.surface = new VerbSurface(context, geometryHelper, this.math);
        this.intersect = new VerbIntersect(context, geometryHelper);
    }
}
