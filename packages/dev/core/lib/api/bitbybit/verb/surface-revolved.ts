import { ContextBase } from "../../context";
import * as Inputs from "../../inputs/inputs";
import { MathBitByBit } from "@bitbybit-dev/base";

/**
 * Revolved surface functions.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */

export class VerbSurfaceRevolved {

    constructor(private readonly context: ContextBase, private readonly math: MathBitByBit) { }

    /**
     * Creates the revolved Nurbs surface
     * @param inputs Parameters for Nurbs revolved surface
     * @returns Revolved Nurbs surface
     */
    create(inputs: Inputs.Verb.RevolutionParametersDto): any {
        return new this.context.verb.geom.RevolvedSurface(
            inputs.profile, inputs.center, inputs.axis, this.math.degToRad({ number: inputs.angle })
        );
    }

    /**
     * Get the profile Nurbs curve of the revolved Nurbs surface
     * @param inputs Revolved Nurbs surface
     * @returns Nurbs curve
     */
    profile(inputs: Inputs.Verb.RevolutionDto): any {
        return inputs.revolution.profile();
    }

    /**
     * Get the center Nurbs curve of the revolved Nurbs surface
     * @param inputs Revolved Nurbs surface
     * @returns Center point
     */
    center(inputs: Inputs.Verb.RevolutionDto): number[] {
        return inputs.revolution.center();
    }

    /**
     * Get the rotation axis of the revolved Nurbs surface
     * @param inputs Revolved Nurbs surface
     * @returns Axis vector of rotation
     */
    axis(inputs: Inputs.Verb.RevolutionDto): number[] {
        return inputs.revolution.axis();
    }

    /**
     * Get the angle of rotation from revolved Nurbs surface
     * @param inputs Revolved Nurbs surface
     * @returns Angle in degrees
     */
    angle(inputs: Inputs.Verb.RevolutionDto): number {
        return this.math.radToDeg({ number: inputs.revolution.angle() });
    }
}
