
import { ContextBase } from "../../context";
import * as Inputs from "../../inputs/inputs";

/**
 * Cylindrical surface functions.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */

export class VerbSurfaceCylindrical {

    constructor(private readonly context: ContextBase) { }

    /**
     * Creates the cylindrical Nurbs surface
     * @param inputs Parameters for cylindrical Nurbs surface
     * @returns Cylindrical Nurbs surface
     */
    create(inputs: Inputs.Verb.ConeAndCylinderParametersDto): any {
        return new this.context.verb.geom.CylindricalSurface(inputs.axis, inputs.xAxis, inputs.base, inputs.height, inputs.radius);
    }

    /**
     * Get cylinder axis
     * @param inputs Nurbs cylindrical surface
     * @returns Axis vector
     */
    axis(inputs: Inputs.Verb.CylinderDto): number[] {
        return inputs.cylinder.axis();
    }

    /**
     * Get cylinder base
     * @param inputs Nurbs cylindrical surface
     * @returns Base point
     */
    base(inputs: Inputs.Verb.CylinderDto): number[] {
        return inputs.cylinder.base();
    }

    /**
     * Get cylinder height
     * @param inputs Nurbs cylindrical surface
     * @returns Height
     */
    height(inputs: Inputs.Verb.CylinderDto): number {
        return inputs.cylinder.height();
    }

    /**
     * Get cylinder radius
     * @param inputs Nurbs cylindrical surface
     * @returns Radius
     */
    radius(inputs: Inputs.Verb.CylinderDto): number {
        return inputs.cylinder.radius();
    }

    /**
     * Get cylinder x axis
     * @param inputs Nurbs cylindrical surface
     * @returns X axis vector
     */
    xAxis(inputs: Inputs.Verb.CylinderDto): number[] {
        return inputs.cylinder.xaxis();
    }
}
