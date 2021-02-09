import { Injectable } from '@angular/core';
import { Context } from '../../context';
import * as Inputs from '../../inputs/inputs';

/**
 * Extrusion surface functions.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
@Injectable()
export class VerbSurfaceExtrusion {

    constructor(private readonly context: Context) { }

    /**
     * Creates the Nurbs surface extrusion from the curve
     * <div>
     *  <img src="../assets/images/blockly-images/surface/extrusion/create.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_extrusion.verbsurfaceextrusion.html#create
     * @param inputs Nurbs profile curve and direction vector
     * @returns Nurbs surface
     */
    create(inputs: Inputs.Verb.ExtrusionParametersDto): any {
        return new this.context.verb.geom.ExtrudedSurface(inputs.profile, inputs.direction);
    }

    /**
     * Gets the direction vector of the extrusion
     * <div>
     *  <img src="../assets/images/blockly-images/surface/extrusion/direction.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_extrusion.verbsurfaceextrusion.html#direction
     * @param inputs Extruded Nurbs surface
     * @returns Vector
     */
    direction(inputs: Inputs.Verb.ExtrusionDto): number[] {
        return inputs.extrusion.direction();
    }

    /**
     * Gets the profile Nurbs curve of the extrusion
     * <div>
     *  <img src="../assets/images/blockly-images/surface/extrusion/profile.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_extrusion.verbsurfaceextrusion.html#profile
     * @param inputs Extruded Nurbs surface
     * @returns Profile Nurbs curve
     */
    profile(inputs: Inputs.Verb.ExtrusionDto): number[] {
        return inputs.extrusion.profile();
    }

}
