
import { Context } from '../../context';
import * as Inputs from '../../inputs/inputs';

/**
 * Spherical surface functions.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */

export class VerbSurfaceSpherical {

    constructor(private readonly context: Context) { }

    /**
     * Creates the spherical Nurbs surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/spherical/create.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_spherical.VerbSurfaceSpherical.html#create
     * @param inputs Parameters for Nurbs spherical surface
     * @returns Spherical Nurbs surface
     */
    create(inputs: Inputs.Verb.SphericalParametersDto): any {
        return new this.context.verb.geom.SphericalSurface(inputs.center, inputs.radius);
    }

    /**
     * Get the radius of the spherical Nurbs surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/spherical/radius.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_spherical.VerbSurfaceSpherical.html#radius
     * @param inputs Spherical Nurbs surface
     * @returns Radius
     */
    radius(inputs: Inputs.Verb.SphereDto): number {
        return inputs.sphere.radius();
    }

    /**
     * Get the center of the spherical Nurbs surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/spherical/center.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_spherical.VerbSurfaceSpherical.html#center
     * @param inputs Spherical Nurbs surface
     * @returns Center point
     */
    center(inputs: Inputs.Verb.SphereDto): number[] {
        return inputs.sphere.center();
    }
}
