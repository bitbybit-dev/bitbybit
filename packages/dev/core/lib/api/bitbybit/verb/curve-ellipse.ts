
import { Angle } from "@babylonjs/core";
import { ContextBase } from "../../context";
import * as Inputs from "../../inputs/inputs";

/**
 * Contains various methods for nurbs ellipse.
 * These methods wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */

export class VerbCurveEllipse {

    constructor(private readonly context: ContextBase) { }

    /**
     * Creates the ellipse Nurbs curve
     * @param inputs Ellipse parameters
     * @returns Ellipse Nurbs curve
     */
    createEllipse(inputs: Inputs.Verb.EllipseParametersDto): any {
        return new this.context.verb.geom.Ellipse(inputs.center, inputs.xAxis, inputs.yAxis);
    }

    /**
     * Creates the ellipse arc Nurbs curve
     * @param inputs Ellipse arc parameters
     * @returns Ellipse arc Nurbs curve
     */
    createArc(inputs: Inputs.Verb.EllipseArcParametersDto): any {
        return new this.context.verb.geom.EllipseArc(
            inputs.center, inputs.xAxis, inputs.yAxis,
            Angle.FromDegrees(inputs.minAngle).radians(),
            Angle.FromDegrees(inputs.maxAngle).radians()
        );
    }

    /**
     * Gets the center point of the ellipse or an arc
     * @param inputs The arc or the ellipse Nurbs curve
     * @returns Point
     */
    center(inputs: Inputs.Verb.EllipseDto): number[] {
        return inputs.ellipse.center();
    }

    /**
     * Gets the max angle of the arc in degrees
     * @param inputs Arc
     * @returns Max angle in degrees
     */
    maxAngle(inputs: Inputs.Verb.EllipseDto): number {
        return Angle.FromRadians(inputs.ellipse.maxAngle()).degrees();
    }

    /**
     * Gets the min angle of the arc in degrees
     * @param inputs Arc
     * @returns Min angle in degrees
     */
    minAngle(inputs: Inputs.Verb.EllipseDto): number {
        return Angle.FromRadians(inputs.ellipse.minAngle()).degrees();
    }

    /**
     * Gets the x angle of the arc or an ellipse
     * @param inputs Ellipse or an arc
     * @returns X axis vector
     */
    xAxis(inputs: Inputs.Verb.EllipseDto): number[] {
        return inputs.ellipse.xaxis();
    }

    /**
     * Gets the y angle of the arc or an ellipse
     * @param inputs Ellipse or an arc
     * @returns Y axis vector
     */
    yAxis(inputs: Inputs.Verb.EllipseDto): number[] {
        return inputs.ellipse.yaxis();
    }
}
