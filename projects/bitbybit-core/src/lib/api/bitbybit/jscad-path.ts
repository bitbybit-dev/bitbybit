import { Injectable } from '@angular/core';
import { Angle } from '@babylonjs/core';
import { Context } from '../context';
import { GeometryHelper } from '../geometry-helper';
import * as Inputs from '../inputs/inputs';

/**
 * Contains various functions for Path from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
@Injectable()
export class JSCADPath {

    constructor(
        private readonly context: Context,
        private readonly geometryHelper: GeometryHelper,

    ) { }

    /**
     * Create a 2D path from a list of points
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/path/createFromPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.jscadpath.html#createfrompoints
     * @param inputs Points and indication if we want a closed path or not
     * @returns Path
     */
    createFromPoints(inputs: Inputs.JSCAD.PathFromPointsDto): any {
        const twoDimensionalPoints = inputs.points.map(pt => [pt[0], pt[1]]);
        return this.removeDuplicatesAndCreateFromPoints(twoDimensionalPoints, inputs.closed);
    }


    /**
     * Create a 2D path from a polyline
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/path/createFromPolyline.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.jscadpath.html#createfrompolyline
     * @param inputs Polyline and indication if we want a closed path or not
     * @returns Path
     */
    createFromPolyline(inputs: Inputs.JSCAD.PathFromPolylineDto): any {
        const twoDimensionalPoints = inputs.polyline.points.map(pt => [pt[0], pt[1]]);
        return this.removeDuplicatesAndCreateFromPoints(twoDimensionalPoints, inputs.closed);
    }

    /**
     * Create a 2D path from a curve
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/path/createFromCurve.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.jscadpath.html#createfromcurve
     * @param inputs Curve and indication if we want a closed path or not
     * @returns Path
     */
    createFromCurve(inputs: Inputs.JSCAD.PathFromCurveDto): any {
        const twoDimensionalPoints = inputs.curve.tessellate().map(pt => [pt[0], pt[1]]);
        return this.removeDuplicatesAndCreateFromPoints(twoDimensionalPoints, inputs.closed);
    }

    /**
     * Create empty 2D path
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/path/createEmpty.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.jscadpath.html#createempty
     * @returns Emprty path
     */
    createEmpty(): any {
        return this.context.jscad.geometries.path2.create();
    }

    /**
     * Closes an open 2D path
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/path/close.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.jscadpath.html#close
     * @param inputs Path
     * @returns Closed path
     */
    close(inputs: Inputs.JSCAD.PathDto): any {
        return this.context.jscad.geometries.path2.close(inputs.path);
    }

    /**
     * Append the path with 2D points
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/path/appendpoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.jscadpath.html#appendpoints
     * @param inputs Path to append and points
     * @returns Appended path
     */
    appendPoints(inputs: Inputs.JSCAD.PathAppendPointsDto): any {
        const twoDimensionalPoints = inputs.points.map(pt => [pt[0], pt[1]]);
        const duplicatePointsRemoved = this.geometryHelper.removeConsecutiveDuplicates(twoDimensionalPoints);
        return this.context.jscad.geometries.path2.appendPoints(duplicatePointsRemoved, inputs.path);
    }

    /**
     * Append the path with polyline
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/path/appendpolyline.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.jscadpath.html#appendpolyline
     * @param inputs Path to append and polyline
     * @returns Appended path
     */
    appendPolyline(inputs: Inputs.JSCAD.PathAppendPolylineDto): any {
        const twoDimensionalPoints = inputs.polyline.points.map(pt => [pt[0], pt[1]]);
        return this.appendPoints({points: twoDimensionalPoints, path: inputs.path});
    }

    /**
     * Append the path with the curve
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/path/appendcurve.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.jscadpath.html#appendcurve
     * @param inputs Path to append and a curve
     * @returns Appended path
     */
    appendCurve(inputs: Inputs.JSCAD.PathAppendCurveDto): any {
        const twoDimensionalPoints = inputs.curve.tessellate().map(pt => [pt[0], pt[1]]);
        return this.appendPoints({points: twoDimensionalPoints, path: inputs.path});
    }

    /**
     * Append the arc to the path
     * <div>
     *  <img src="../assets/images/blockly-images/jscad/path/appendarc.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.jscadpath.html#appendarc
     * @param inputs Path and arc parameters
     * @returns Appended path
     */
    appendArc(inputs: Inputs.JSCAD.PathAppendArcDto): any {
        const endpoint = [inputs.endPoint[0], inputs.endPoint[1]];
        const radius = [inputs.radiusX, inputs.radiusY];
        return this.context.jscad.geometries.path2.appendArc({
            endpoint,
            radius,
            xaxisrotation: Angle.FromDegrees(inputs.xAxisRotation).radians(),
            clockwise: inputs.clockwise,
            large: inputs.large,
            segments: inputs.segments,
        }, inputs.path);
    }

    private removeDuplicatesAndCreateFromPoints(twoDimensionalPoints: number[][], closed: boolean): any {
        const duplicatePointsRemoved = this.geometryHelper.removeConsecutiveDuplicates(twoDimensionalPoints);
        let path2d = this.context.jscad.geometries.path2.fromPoints({}, duplicatePointsRemoved);
        if (closed) {
            path2d = this.context.jscad.geometries.path2.close(path2d);
        }
        return path2d;
    }
}
