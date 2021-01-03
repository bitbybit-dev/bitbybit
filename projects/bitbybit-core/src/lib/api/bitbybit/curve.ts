import { Injectable } from '@angular/core';
import { LinesMesh } from '@babylonjs/core';
import { Context } from '../context';
import { GeometryHelper } from '../geometry-helper';
import * as Inputs from '../inputs/inputs';

/**
 * Contains various methods for nurbs curves.
 * These methods mostly wrap around Verbnurbs library that you can find here https://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
@Injectable()
export class Curve {

    constructor(private readonly context: Context, private readonly geometryHelper: GeometryHelper) { }

    /**
     * Draws a single curve
     * <div>
     *  <img src="../assets/images/blockly-images/curve/drawCurve.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_curve_.curve.html#drawcurve
     * @param inputs Contains a curve to be drawn
     * @returns Lines mesh that is being drawn by Babylon
     */
    drawCurve(inputs: Inputs.Curve.DrawCurveDto): LinesMesh {
        const points = inputs.curve.tessellate();
        return this.geometryHelper.drawPolyline(
            inputs.curveMesh,
            points,
            inputs.updatable,
            inputs.width,
            inputs.opacity,
            inputs.colour
        );
    }
}
