import { simplifyDeclaration } from './simplify-declaration';

export const curveEllipseString = simplifyDeclaration(`
import { Context } from '../context';
import * as Inputs from '../inputs/inputs';
/**
 * Contains various methods for nurbs ellipse.
 * These methods wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
export declare class CurveEllipse {
    private readonly context;
    constructor(context: Context);
    /**
     * Creates the ellipse Nurbs curve
     * <div>
     *  <img src="../assets/images/blockly-images/curve/ellipse/createEllipse.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_curve_ellipse.curveellipse.html#createellipse
     * @param inputs Ellipse parameters
     * @returns Ellipse Nurbs curve
     */
    createEllipse(inputs: Inputs.Curve.EllipseParametersDto): any;
    /**
     * Creates the ellipse arc Nurbs curve
     * <div>
     *  <img src="../assets/images/blockly-images/curve/ellipse/createArc.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_curve_ellipse.curveellipse.html#createarc
     * @param inputs Ellipse arc parameters
     * @returns Ellipse arc Nurbs curve
     */
    createArc(inputs: Inputs.Curve.EllipseArcParametersDto): any;
    /**
     * Gets the center point of the ellipse or an arc
     * <div>
     *  <img src="../assets/images/blockly-images/curve/ellipse/center.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_curve_ellipse.curveellipse.html#center
     * @param inputs The arc or the ellipse Nurbs curve
     * @returns Point
     */
    center(inputs: Inputs.Curve.EllipseDto): number[];
    /**
     * Gets the max angle of the arc in degrees
     * <div>
     *  <img src="../assets/images/blockly-images/curve/ellipse/maxAngle.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_curve_ellipse.curveellipse.html#maxangle
     * @param inputs Arc
     * @returns Max angle in degrees
     */
    maxAngle(inputs: Inputs.Curve.EllipseDto): number;
    /**
     * Gets the min angle of the arc in degrees
     * <div>
     *  <img src="../assets/images/blockly-images/curve/ellipse/minAngle.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_curve_ellipse.curveellipse.html#minangle
     * @param inputs Arc
     * @returns Min angle in degrees
     */
    minAngle(inputs: Inputs.Curve.EllipseDto): number;
    /**
     * Gets the x angle of the arc or an ellipse
     * <div>
     *  <img src="../assets/images/blockly-images/curve/ellipse/xAxis.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_curve_ellipse.curveellipse.html#xaxis
     * @param inputs Ellipse or an arc
     * @returns X axis vector
     */
    xAxis(inputs: Inputs.Curve.EllipseDto): number[];
    /**
     * Gets the y angle of the arc or an ellipse
     * <div>
     *  <img src="../assets/images/blockly-images/curve/ellipse/yAxis.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_curve_ellipse.curveellipse.html#yaxis
     * @param inputs Ellipse or an arc
     * @returns Y axis vector
     */
    yAxis(inputs: Inputs.Curve.EllipseDto): number[];
}

`);
