
import { Context } from '../../context';
import * as Inputs from '../../inputs/inputs';

/**
 * Cylindrical surface functions.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */

export class VerbSurfaceCylindrical {

    constructor(private readonly context: Context) { }

    /**
     * Creates the cylindrical Nurbs surface
     * <div>
     *  <img src="../assets/images/blockly-images/surface/cylindrical/create.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_cylindrical.VerbSurfaceCylindrical.html#create
     * @param inputs Parameters for cylindrical Nurbs surface
     * @returns Cylindrical Nurbs surface
     */
    create(inputs: Inputs.Verb.ConeAndCylinderParametersDto): any {
        return new this.context.verb.geom.CylindricalSurface(inputs.axis, inputs.xAxis, inputs.base, inputs.height, inputs.radius);
    }

    /**
     * Get cylinder axis
     * <div>
     *  <img src="../assets/images/blockly-images/surface/cylindrical/axis.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_cylindrical.VerbSurfaceCylindrical.html#axis
     * @param inputs Nurbs cylindrical surface
     * @returns Axis vector
     */
    axis(inputs: Inputs.Verb.CylinderDto): number[] {
        return inputs.cylinder.axis();
    }

    /**
     * Get cylinder base
     * <div>
     *  <img src="../assets/images/blockly-images/surface/cylindrical/base.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_cylindrical.VerbSurfaceCylindrical.html#base
     * @param inputs Nurbs cylindrical surface
     * @returns Base point
     */
    base(inputs: Inputs.Verb.CylinderDto): number[] {
        return inputs.cylinder.base();
    }

    /**
     * Get cylinder height
     * <div>
     *  <img src="../assets/images/blockly-images/surface/cylindrical/height.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_cylindrical.VerbSurfaceCylindrical.html#height
     * @param inputs Nurbs cylindrical surface
     * @returns Height
     */
    height(inputs: Inputs.Verb.CylinderDto): number {
        return inputs.cylinder.height();
    }

    /**
     * Get cylinder radius
     * <div>
     *  <img src="../assets/images/blockly-images/surface/cylindrical/radius.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_cylindrical.VerbSurfaceCylindrical.html#radius
     * @param inputs Nurbs cylindrical surface
     * @returns Radius
     */
    radius(inputs: Inputs.Verb.CylinderDto): number {
        return inputs.cylinder.radius();
    }

    /**
     * Get cylinder x axis
     * <div>
     *  <img src="../assets/images/blockly-images/surface/cylindrical/xAxis.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_cylindrical.VerbSurfaceCylindrical.html#xAxis
     * @param inputs Nurbs cylindrical surface
     * @returns X axis vector
     */
    xAxis(inputs: Inputs.Verb.CylinderDto): number[] {
        return inputs.cylinder.xaxis();
    }
}
