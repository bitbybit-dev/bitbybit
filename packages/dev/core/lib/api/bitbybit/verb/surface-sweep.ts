import { ContextBase } from "../../context";
import * as Inputs from "../../inputs";

/**
 * Sweep surface functions.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 *
 * @deprecated Verbnurbs is not maintained upstream and this API is removed in the next major
 * version. Use the OpenCascade (occt) NURBS operations instead. Existing scripts keep working
 * until the removal.
 */

export class VerbSurfaceSweep {

    constructor(private readonly context: ContextBase) { }

    /**
     * Creates the sweep Nurbs surface
     * @param inputs Parameters for Nurbs sweep surface
     * @returns Sweep Nurbs surface
     */
    create(inputs: Inputs.Verb.SweepParametersDto): any {
        return new this.context.verb.geom.SweptSurface(inputs.profile, inputs.rail);
    }

    /**
     * Get the profile Nurbs curve of the swept Nurbs surface
     * @param inputs Sweep Nurbs surface
     * @returns Profile Nurbs curve
     */
    profile(inputs: Inputs.Verb.SweepDto): any {
        return inputs.sweep.profile();
    }

    /**
     * Get the rail Nurbs curve of the swept Nurbs surface
     * @param inputs Sweep Nurbs surface
     * @returns Rail Nurbs curve
     */
    rail(inputs: Inputs.Verb.SweepDto): any {
        return inputs.sweep.rail();
    }
}
