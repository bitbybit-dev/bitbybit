import { Injectable } from '@angular/core';
import { Angle } from '@babylonjs/core';
import { Context } from '../context';
import * as Inputs from '../inputs/inputs';

/**
 * Contains various methods for nurbs circle.
 * These methods wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
@Injectable()
export class CurveCircle {

    constructor(private readonly context: Context) { }

    /**
     * Creates the circle Nurbs curve
     * <div>
     *  <img src="../assets/images/blockly-images/curve/circle/createCircle.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_curve_circle.curvecircle.html#createcircle
     * @param inputs Circle parameters
     * @returns Circle Nurbs curve
     */
    createCircle(inputs: Inputs.Curve.CircleParametersDto): any {
        return new this.context.verb.geom.Circle(inputs.center, inputs.xAxis, inputs.yAxis, inputs.radius);
    }

    /**
     * Creates the arc Nurbs curve
     * <div>
     *  <img src="../assets/images/blockly-images/curve/circle/createArc.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_curve_circle.curvecircle.html#createarc
     * @param inputs Arc parameters
     * @returns Arc Nurbs curve
     */
    createArc(inputs: Inputs.Curve.ArcParametersDto): any {
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
     * <div>
     *  <img src="../assets/images/blockly-images/curve/circle/center.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_curve_circle.curvecircle.html#center
     * @param inputs An arc or a circle Nurbs curve
     * @returns Point
     */
    center(inputs: Inputs.Curve.CircleDto): number[] {
        return inputs.circle.center();
    }

    /**
     * Gets the radius of the circle or an arc
     * <div>
     *  <img src="../assets/images/blockly-images/curve/circle/radius.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_curve_circle.curvecircle.html#radius
     * @param inputs An arc or a circle Nurbs curve
     * @returns Radius
     */
    radius(inputs: Inputs.Curve.CircleDto): number {
        return inputs.circle.radius();
    }

    /**
     * Gets the max angle of the arc in degrees
     * <div>
     *  <img src="../assets/images/blockly-images/curve/circle/maxAngle.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_curve_circle.curvecircle.html#maxangle
     * @param inputs Arc
     * @returns Max angle in degrees
     */
    maxAngle(inputs: Inputs.Curve.CircleDto): number {
        return Angle.FromRadians(inputs.circle.maxAngle()).degrees();
    }

    /**
     * Gets the min angle of the arc in degrees
     * <div>
     *  <img src="../assets/images/blockly-images/curve/circle/minAngle.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_curve_circle.curvecircle.html#minangle
     * @param inputs Arc
     * @returns Min angle in degrees
     */
    minAngle(inputs: Inputs.Curve.CircleDto): number {
        return Angle.FromRadians(inputs.circle.minAngle()).degrees();
    }

    /**
     * Gets the x angle of the arc
     * <div>
     *  <img src="../assets/images/blockly-images/curve/circle/xAxis.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_curve_circle.curvecircle.html#xaxis
     * @param inputs Circle
     * @returns X axis vector
     */
    xAxis(inputs: Inputs.Curve.CircleDto): number[] {
        return inputs.circle.xaxis();
    }

    /**
     * Gets the y angle of the arc
     * <div>
     *  <img src="../assets/images/blockly-images/curve/circle/yAxis.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_curve_circle.curvecircle.html#yaxis
     * @param inputs Circle
     * @returns Y axis vector
     */
    yAxis(inputs: Inputs.Curve.CircleDto): number[] {
        return inputs.circle.yaxis();
    }
}
