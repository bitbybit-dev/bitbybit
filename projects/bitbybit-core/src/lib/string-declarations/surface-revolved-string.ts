import { simplifyDeclaration } from './simplify-declaration';

export const surfaceRevolvedString = simplifyDeclaration(`
import { Context } from '../context';
import * as Inputs from '../inputs/inputs';
/**
 * Revolved surface functions.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
export declare class SurfaceRevolved {
    private readonly context;
    constructor(context: Context);
    /**
     * Creates the revolved Nurbs surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/revolved/create.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_revolved_.surfacerevolved.html#create
     * @param inputs Parameters for Nurbs revolved surface
     * @returns Revolved Nurbs surface
     */
    create(inputs: Inputs.Surface.RevolutionParametersDto): any;
    /**
     * Get the profile Nurbs curve of the revolved Nurbs surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/revolved/profile.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_revolved_.surfacerevolved.html#profile
     * @param inputs Revolved Nurbs surface
     * @returns Nurbs curve
     */
    profile(inputs: Inputs.Surface.RevolutionDto): any;
    /**
     * Get the center Nurbs curve of the revolved Nurbs surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/revolved/center.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_revolved_.surfacerevolved.html#center
     * @param inputs Revolved Nurbs surface
     * @returns Center point
     */
    center(inputs: Inputs.Surface.RevolutionDto): number[];
    /**
     * Get the rotation axis of the revolved Nurbs surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/revolved/axis.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_revolved_.surfacerevolved.html#axis
     * @param inputs Revolved Nurbs surface
     * @returns Axis vector of rotation
     */
    axis(inputs: Inputs.Surface.RevolutionDto): number[];
    /**
     * Get the angle of rotation from revolved Nurbs surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/revolved/angle.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_revolved_.surfacerevolved.html#angle
     * @param inputs Revolved Nurbs surface
     * @returns Angle in degrees
     */
    angle(inputs: Inputs.Surface.RevolutionDto): number;
}
`);
