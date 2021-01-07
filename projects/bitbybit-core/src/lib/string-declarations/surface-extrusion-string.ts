import { simplifyDeclaration } from './simplify-declaration';

export const surfaceExtrusionString = simplifyDeclaration(`
import { Context } from '../context';
import * as Inputs from '../inputs/inputs';
/**
 * Extrusion surface functions.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
export declare class SurfaceExtrusion {
    private readonly context;
    constructor(context: Context);
    /**
     * Creates the Nurbs surface extrusion from the curve
     * <div>
     *  <img src="../assets/images/blockly-images/surface/extrusion/create.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_extrusion_.surfaceextrusion.html#create
     * @param inputs Nurbs profile curve and direction vector
     * @returns Nurbs surface
     */
    create(inputs: Inputs.Surface.ExtrusionParametersDto): any;
    /**
     * Gets the direction vector of the extrusion
     * <div>
     *  <img src="../assets/images/blockly-images/surface/extrusion/direction.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_extrusion_.surfaceextrusion.html#direction
     * @param inputs Extruded Nurbs surface
     * @returns Vector
     */
    direction(inputs: Inputs.Surface.ExtrusionDto): number[];
    /**
     * Gets the profile Nurbs curve of the extrusion
     * <div>
     *  <img src="../assets/images/blockly-images/surface/extrusion/profile.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_extrusion_.surfaceextrusion.html#profile
     * @param inputs Extruded Nurbs surface
     * @returns Profile Nurbs curve
     */
    profile(inputs: Inputs.Surface.ExtrusionDto): number[];
}

`);
