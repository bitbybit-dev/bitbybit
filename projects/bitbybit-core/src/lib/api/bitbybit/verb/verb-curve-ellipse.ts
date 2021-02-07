import { Injectable } from '@angular/core';
import { Angle } from '@babylonjs/core';
import { Context } from '../../context';
import * as Inputs from '../../inputs/inputs';

/**
 * Contains various methods for nurbs ellipse.
 * These methods wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
@Injectable()
export class VerbCurveEllipse {

    constructor(private readonly context: Context) { }

    /**
     * Creates the ellipse Nurbs curve
     * <div>
     *  <img src="../assets/images/blockly-images/curve/ellipse/createEllipse.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_verb_curve_ellipse.verbcurveellipse.html#createellipse
     * @param inputs Ellipse parameters
     * @returns Ellipse Nurbs curve
     */
    createEllipse(inputs: Inputs.Verb.EllipseParametersDto): any {
        return new this.context.verb.geom.Ellipse(inputs.center, inputs.xAxis, inputs.yAxis);
    }

    /**
     * Creates the ellipse arc Nurbs curve
     * <div>
     *  <img src="../assets/images/blockly-images/curve/ellipse/createArc.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_verb_curve_ellipse.verbcurveellipse.html#createarc
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
     * <div>
     *  <img src="../assets/images/blockly-images/curve/ellipse/center.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_verb_curve_ellipse.verbcurveellipse.html#center
     * @param inputs The arc or the ellipse Nurbs curve
     * @returns Point
     */
    center(inputs: Inputs.Verb.EllipseDto): number[] {
        return inputs.ellipse.center();
    }

    /**
     * Gets the max angle of the arc in degrees
     * <div>
     *  <img src="../assets/images/blockly-images/curve/ellipse/maxAngle.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_verb_curve_ellipse.verbcurveellipse.html#maxangle
     * @param inputs Arc
     * @returns Max angle in degrees
     */
    maxAngle(inputs: Inputs.Verb.EllipseDto): number {
        return Angle.FromRadians(inputs.ellipse.maxAngle()).degrees();
    }

    /**
     * Gets the min angle of the arc in degrees
     * <div>
     *  <img src="../assets/images/blockly-images/curve/ellipse/minAngle.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_verb_curve_ellipse.verbcurveellipse.html#minangle
     * @param inputs Arc
     * @returns Min angle in degrees
     */
    minAngle(inputs: Inputs.Verb.EllipseDto): number {
        return Angle.FromRadians(inputs.ellipse.minAngle()).degrees();
    }

    /**
     * Gets the x angle of the arc or an ellipse
     * <div>
     *  <img src="../assets/images/blockly-images/curve/ellipse/xAxis.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_verb_curve_ellipse.verbcurveellipse.html#xaxis
     * @param inputs Ellipse or an arc
     * @returns X axis vector
     */
    xAxis(inputs: Inputs.Verb.EllipseDto): number[] {
        return inputs.ellipse.xaxis();
    }

    /**
     * Gets the y angle of the arc or an ellipse
     * <div>
     *  <img src="../assets/images/blockly-images/curve/ellipse/yAxis.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_verb_curve_ellipse.verbcurveellipse.html#yaxis
     * @param inputs Ellipse or an arc
     * @returns Y axis vector
     */
    yAxis(inputs: Inputs.Verb.EllipseDto): number[] {
        return inputs.ellipse.yaxis();
    }
}
