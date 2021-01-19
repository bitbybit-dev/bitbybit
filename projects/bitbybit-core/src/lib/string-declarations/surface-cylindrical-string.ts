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
     *  <img src="../assets/images/blockly-images/surface/cylindrical/create.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_surface_cylindrical.surfacecylindrical.html#create
     * @param inputs Parameters for cylindrical Nurbs surface
     * @returns Cylindrical Nurbs surface
     */
    create(inputs: Inputs.Surface.ConeAndCylinderParametersDto): any;
    /**
     * Get cylinder axis
     * <div>
     *  <img src="../assets/images/blockly-images/surface/cylindrical/axis.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_surface_cylindrical.surfacecylindrical.html#axis
     * @param inputs Nurbs cylindrical surface
     * @returns Axis vector
     */
    axis(inputs: Inputs.Surface.CylinderDto): number[];
    /**
     * Get cylinder base
     * <div>
     *  <img src="../assets/images/blockly-images/surface/cylindrical/base.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_surface_cylindrical.surfacecylindrical.html#base
     * @param inputs Nurbs cylindrical surface
     * @returns Base point
     */
    base(inputs: Inputs.Surface.CylinderDto): number[];
    /**
     * Get cylinder height
     * <div>
     *  <img src="../assets/images/blockly-images/surface/cylindrical/height.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_surface_cylindrical.surfacecylindrical.html#height
     * @param inputs Nurbs cylindrical surface
     * @returns Height
     */
    height(inputs: Inputs.Surface.CylinderDto): number;
    /**
     * Get cylinder radius
     * <div>
     *  <img src="../assets/images/blockly-images/surface/cylindrical/radius.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_surface_cylindrical.surfacecylindrical.html#radius
     * @param inputs Nurbs cylindrical surface
     * @returns Radius
     */
    radius(inputs: Inputs.Surface.CylinderDto): number;
    /**
     * Get cylinder x axis
     * <div>
     *  <img src="../assets/images/blockly-images/surface/cylindrical/xAxis.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_surface_cylindrical.surfacecylindrical.html#xaxis
     * @param inputs Nurbs cylindrical surface
     * @returns X axis vector
     */
    xAxis(inputs: Inputs.Surface.CylinderDto): number[];
}
`);
