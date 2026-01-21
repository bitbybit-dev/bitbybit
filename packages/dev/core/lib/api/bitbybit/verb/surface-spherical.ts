
import { ContextBase } from "../../context";
import * as Inputs from "../../inputs";

/**
 * Spherical surface functions.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */

export class VerbSurfaceSpherical {

    constructor(private readonly context: ContextBase) { }

    /**
     * Creates the spherical Nurbs surface
     * @param inputs Parameters for Nurbs spherical surface
     * @returns Spherical Nurbs surface
     */
    create(inputs: Inputs.Verb.SphericalParametersDto): any {
        return new this.context.verb.geom.SphericalSurface(inputs.center, inputs.radius);
    }

    /**
     * Get the radius of the spherical Nurbs surface
     * @param inputs Spherical Nurbs surface
     * @returns Radius
     */
    radius(inputs: Inputs.Verb.SphereDto): number {
        return inputs.sphere.radius();
    }

    /**
     * Get the center of the spherical Nurbs surface
     * @param inputs Spherical Nurbs surface
     * @returns Center point
     */
    center(inputs: Inputs.Verb.SphereDto): number[] {
        return inputs.sphere.center();
    }
}
