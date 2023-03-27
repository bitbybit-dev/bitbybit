
import { Angle } from '@babylonjs/core';
import { Context } from '../../context';
import * as Inputs from '../../inputs/inputs';

/**
 * Contains various methods for nurbs circle.
 * These methods wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */

export class VerbCurveCircle {

    constructor(private readonly context: Context) { }

    /**
     * Creates the circle Nurbs curve
     * @param inputs Circle parameters
     * @returns Circle Nurbs curve
     */
    createCircle(inputs: Inputs.Verb.CircleParametersDto): any {
        return new this.context.verb.geom.Circle(inputs.center, inputs.xAxis, inputs.yAxis, inputs.radius);
    }

    /**
     * Creates the arc Nurbs curve
     * @param inputs Arc parameters
     * @returns Arc Nurbs curve
     */
    createArc(inputs: Inputs.Verb.ArcParametersDto): any {
        return new this.context.verb.geom.Arc(
            inputs.center,
            inputs.xAxis,
            inputs.yAxis,
            inputs.radius,
            Angle.FromDegrees(inputs.minAngle).radians(),
            Angle.FromDegrees(inputs.maxAngle).radians()
        );
    }

    /**
     * Gets the center point of the circle or an arc
     * @param inputs An arc or a circle Nurbs curve
     * @returns Point
     */
    center(inputs: Inputs.Verb.CircleDto): number[] {
        return inputs.circle.center();
    }

    /**
     * Gets the radius of the circle or an arc
     * @param inputs An arc or a circle Nurbs curve
     * @returns Radius
     */
    radius(inputs: Inputs.Verb.CircleDto): number {
        return inputs.circle.radius();
    }

    /**
     * Gets the max angle of the arc in degrees
     * @param inputs Arc
     * @returns Max angle in degrees
     */
    maxAngle(inputs: Inputs.Verb.CircleDto): number {
        return Angle.FromRadians(inputs.circle.maxAngle()).degrees();
    }

    /**
     * Gets the min angle of the arc in degrees
     * @param inputs Arc
     * @returns Min angle in degrees
     */
    minAngle(inputs: Inputs.Verb.CircleDto): number {
        return Angle.FromRadians(inputs.circle.minAngle()).degrees();
    }

    /**
     * Gets the x angle of the arc
     * @param inputs Circle
     * @returns X axis vector
     */
    xAxis(inputs: Inputs.Verb.CircleDto): number[] {
        return inputs.circle.xaxis();
    }

    /**
     * Gets the y angle of the arc
     * @param inputs Circle
     * @returns Y axis vector
     */
    yAxis(inputs: Inputs.Verb.CircleDto): number[] {
        return inputs.circle.yaxis();
    }
}
