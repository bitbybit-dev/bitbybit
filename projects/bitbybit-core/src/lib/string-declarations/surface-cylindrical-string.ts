import { simplifyDeclaration } from './simplify-declaration';

export const surfaceCylindricalString = simplifyDeclaration(`
import { Context } from '../context';
import * as Inputs from '../inputs/inputs';
/**
 * Cylindrical surface functions.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
export declare class SurfaceCylindrical {
    private readonly context;
    constructor(context: Context);
    /**
     * Creates the cylindrical Nurbs surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/cylindrical/create.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_cylindrical_.surfacecylindrical.html#create
     * @param inputs Parameters for cylindrical Nurbs surface
     * @returns Cylindrical Nurbs surface
     */
    create(inputs: Inputs.Surface.ConeAndCylinderParametersDto): any;
    /**
     * Get cylinder axis
     * <div>
     *  <img src="../assets/images/blockly-images/surface/cylindrical/axis.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_cylindrical_.surfacecylindrical.html#axis
     * @param inputs Nurbs cylindrical surface
     * @returns Axis vector
     */
    axis(inputs: Inputs.Surface.CylinderDto): number[];
    /**
     * Get cylinder base
     * <div>
     *  <img src="../assets/images/blockly-images/surface/cylindrical/base.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_cylindrical_.surfacecylindrical.html#base
     * @param inputs Nurbs cylindrical surface
     * @returns Base point
     */
    base(inputs: Inputs.Surface.CylinderDto): number[];
    /**
     * Get cylinder height
     * <div>
     *  <img src="../assets/images/blockly-images/surface/cylindrical/height.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_cylindrical_.surfacecylindrical.html#height
     * @param inputs Nurbs cylindrical surface
     * @returns Height
     */
    height(inputs: Inputs.Surface.CylinderDto): number;
    /**
     * Get cylinder radius
     * <div>
     *  <img src="../assets/images/blockly-images/surface/cylindrical/radius.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_cylindrical_.surfacecylindrical.html#radius
     * @param inputs Nurbs cylindrical surface
     * @returns Radius
     */
    radius(inputs: Inputs.Surface.CylinderDto): number;
    /**
     * Get cylinder x axis
     * <div>
     *  <img src="../assets/images/blockly-images/surface/cylindrical/xAxis.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_surface_cylindrical_.surfacecylindrical.html#xaxis
     * @param inputs Nurbs cylindrical surface
     * @returns X axis vector
     */
    xAxis(inputs: Inputs.Surface.CylinderDto): number[];
}
`);