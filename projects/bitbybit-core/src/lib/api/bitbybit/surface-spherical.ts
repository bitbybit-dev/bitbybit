import { Injectable } from '@angular/core';
import { Context } from '../context';
import * as Inputs from '../inputs/inputs';

/**
 * Spherical surface functions.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
@Injectable()
export class SurfaceSpherical {

    constructor(private readonly context: Context) { }

    /**
     * Creates the spherical Nurbs surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/spherical/create.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_spherical_.surfacespherical.html#create
     * @param inputs Parameters for Nurbs spherical surface
     * @returns Spherical Nurbs surface
     */
    create(inputs: Inputs.Surface.SphericalParametersDto): any {
        return new this.context.verb.geom.SphericalSurface(inputs.center, inputs.radius);
    }

    /**
     * Get the radius of the spherical Nurbs surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/spherical/radius.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_spherical_.surfacespherical.html#radius
     * @param inputs Spherical Nurbs surface
     * @returns Radius
     */
    radius(inputs: Inputs.Surface.SphereDto): number {
        return inputs.sphere.radius();
    }

    /**
     * Get the center of the spherical Nurbs surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/spherical/center.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_spherical_.surfacespherical.html#center
     * @param inputs Spherical Nurbs surface
     * @returns Center point
     */
    center(inputs: Inputs.Surface.SphereDto): number[] {
        return inputs.sphere.center();
    }
}
