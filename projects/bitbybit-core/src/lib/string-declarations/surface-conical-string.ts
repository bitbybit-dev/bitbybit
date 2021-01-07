import { simplifyDeclaration } from './simplify-declaration';

export const surfaceConicalString = simplifyDeclaration(`
import { Context } from '../context';
import * as Inputs from '../inputs/inputs';
/**
 * Conical surface functions.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
export declare class SurfaceConical {
    private readonly context;
    constructor(context: Context);
    /**
     * Creates the conical Nurbs surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/conical/create.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_conical_.surfaceconical.html#create
     * @param inputs Parameters for Nurbs conical surface
     * @returns Conical Nurbs surface
     */
    create(inputs: Inputs.Surface.ConeAndCylinderParametersDto): any;
    /**
     * Get cone axis
     * <div>
     *  <img src="../assets/images/blockly-images/surface/conical/axis.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_conical_.surfaceconical.html#axis
     * @param inputs Nurbs conical surface
     * @returns Axis vector
     */
    axis(inputs: Inputs.Surface.ConeDto): number[];
    /**
     * Get cone base
     * <div>
     *  <img src="../assets/images/blockly-images/surface/conical/base.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_conical_.surfaceconical.html#base
     * @param inputs Nurbs conical surface
     * @returns Base point
     */
    base(inputs: Inputs.Surface.ConeDto): number[];
    /**
     * Get cone height
     * <div>
     *  <img src="../assets/images/blockly-images/surface/conical/height.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_conical_.surfaceconical.html#height
     * @param inputs Nurbs conical surface
     * @returns Height
     */
    height(inputs: Inputs.Surface.ConeDto): number;
    /**
     * Get cone radius
     * <div>
     *  <img src="../assets/images/blockly-images/surface/conical/radius.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_conical_.surfaceconical.html#radius
     * @param inputs Nurbs conical surface
     * @returns Radius
     */
    radius(inputs: Inputs.Surface.ConeDto): number;
    /**
     * Get cone x axis
     * <div>
     *  <img src="../assets/images/blockly-images/surface/conical/xAxis.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_conical_.surfaceconical.html#xaxis
     * @param inputs Nurbs conical surface
     * @returns X axis vector
     */
    xAxis(inputs: Inputs.Surface.ConeDto): number[];
}

`);
