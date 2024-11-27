
import { ContextBase } from "../../context";
import * as Inputs from "../../inputs/inputs";

/**
 * Conical surface functions.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */

export class VerbSurfaceConical {

    constructor(private readonly context: ContextBase) { }

    /**
     * Creates the conical Nurbs surface
     * @param inputs Parameters for Nurbs conical surface
     * @returns Conical Nurbs surface
     */
    create(inputs: Inputs.Verb.ConeAndCylinderParametersDto): any {
        return new this.context.verb.geom.ConicalSurface(inputs.axis, inputs.xAxis, inputs.base, inputs.height, inputs.radius);
    }

    /**
     * Get cone axis
     * @param inputs Nurbs conical surface
     * @returns Axis vector
     */
    axis(inputs: Inputs.Verb.ConeDto): number[] {
        return inputs.cone.axis();
    }

    /**
     * Get cone base
     * @param inputs Nurbs conical surface
     * @returns Base point
     */
    base(inputs: Inputs.Verb.ConeDto): number[] {
        return inputs.cone.base();
    }

    /**
     * Get cone height
     * @param inputs Nurbs conical surface
     * @returns Height
     */
    height(inputs: Inputs.Verb.ConeDto): number {
        return inputs.cone.height();
    }

    /**
     * Get cone radius
     * @param inputs Nurbs conical surface
     * @returns Radius
     */
    radius(inputs: Inputs.Verb.ConeDto): number {
        return inputs.cone.radius();
    }
    /**
     * Get cone x axis
     * @param inputs Nurbs conical surface
     * @returns X axis vector
     */
    xAxis(inputs: Inputs.Verb.ConeDto): number[] {
        return inputs.cone.xaxis();
    }
}
