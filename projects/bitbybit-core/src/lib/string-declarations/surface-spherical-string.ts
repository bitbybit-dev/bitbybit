import { simplifyDeclaration } from './simplify-declaration';

export const surfaceSphericalString = simplifyDeclaration(`
import { Context } from '../context';
import * as Inputs from '../inputs/inputs';
/**
 * Spherical surface functions.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
export declare class SurfaceSpherical {
    private readonly context;
    constructor(context: Context);
    /**
     * Creates the spherical Nurbs surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/spherical/create.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_surface_spherical.surfacespherical.html#create
     * @param inputs Parameters for Nurbs spherical surface
     * @returns Spherical Nurbs surface
     */
    create(inputs: Inputs.Surface.SphericalParametersDto): any;
    /**
     * Get the radius of the spherical Nurbs surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/spherical/radius.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_surface_spherical.surfacespherical.html#radius
     * @param inputs Spherical Nurbs surface
     * @returns Radius
     */
    radius(inputs: Inputs.Surface.SphereDto): number;
    /**
     * Get the center of the spherical Nurbs surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/spherical/center.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_surface_spherical.surfacespherical.html#center
     * @param inputs Spherical Nurbs surface
     * @returns Center point
     */
    center(inputs: Inputs.Surface.SphereDto): number[];
}

`);
