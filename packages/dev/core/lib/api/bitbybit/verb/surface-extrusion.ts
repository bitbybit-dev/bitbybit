
import { ContextBase } from "../../context";
import * as Inputs from "../../inputs/inputs";

/**
 * Extrusion surface functions.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */

export class VerbSurfaceExtrusion {

    constructor(private readonly context: ContextBase) { }

    /**
     * Creates the Nurbs surface extrusion from the curve
     * @param inputs Nurbs profile curve and direction vector
     * @returns Nurbs surface
     */
    create(inputs: Inputs.Verb.ExtrusionParametersDto): any {
        return new this.context.verb.geom.ExtrudedSurface(inputs.profile, inputs.direction);
    }

    /**
     * Gets the direction vector of the extrusion
     * @param inputs Extruded Nurbs surface
     * @returns Vector
     */
    direction(inputs: Inputs.Verb.ExtrusionDto): number[] {
        return inputs.extrusion.direction();
    }

    /**
     * Gets the profile Nurbs curve of the extrusion
     * @param inputs Extruded Nurbs surface
     * @returns Profile Nurbs curve
     */
    profile(inputs: Inputs.Verb.ExtrusionDto): number[] {
        return inputs.extrusion.profile();
    }

}
