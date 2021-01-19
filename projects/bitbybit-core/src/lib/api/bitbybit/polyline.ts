import { Injectable } from '@angular/core';
import { LinesMesh, MeshBuilder, Vector3 } from '@babylonjs/core';
import { Context } from '../context';
import { GeometryHelper } from '../geometry-helper';
import * as Inputs from '../inputs/inputs';

/**
 * Contains various methods for polyline. Polyline in bitbybit is a simple object that has points property containing an array of points.
 * { points: number[][] }
 */
@Injectable()
export class Polyline {

    constructor(private readonly context: Context, private readonly geometryHelper: GeometryHelper) { }

    /**
     * Draws a single polyline
     * <div>
     *  <img src="../assets/images/blockly-images/polyline/drawPolyline.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_polyline.polyline.html#drawpolyline
     * @param inputs Contains a polyline to be drawn
     * @returns Lines mesh that is being drawn by Babylon
     */
    drawPolyline(inputs: Inputs.Polyline.DrawPolylineDto): LinesMesh {
        return this.geometryHelper.drawPolyline(
            inputs.polylineMesh,
            inputs.polyline.points,
            inputs.updatable,
            inputs.width,
            inputs.opacity,
            inputs.colour
        );
    }

    /**
     * Draws multiple polylines
     * <div>
     *  <img src="../assets/images/blockly-images/polyline/drawPolylines.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_polyline.polyline.html#drawpolylines
     * @param inputs Contains a polyline to be drawn
     * @returns Lines mesh that is being drawn by Babylon
     */
    drawPolylines(inputs: Inputs.Polyline.DrawPolylinesDto): LinesMesh {
        const points = inputs.polylines.map(s => s.points);
        return this.geometryHelper.drawPolylines(
            inputs.polylinesMesh,
            points,
            inputs.updatable,
            inputs.width,
            inputs.opacity,
            inputs.colour
        );
    }

    /**
     * Converts a polyline to a NURBS curve
     * <div>
     *  <img src="../assets/images/blockly-images/polyline/convertToNurbsCurve.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_polyline.polyline.html#converttonurbscurve
     * Returns the verbnurbs NurbsCurve object
     * @link http://verbnurbs.com/docs/geom/NurbsCurve/
     * @param inputs Polyline to be transformed to curve
     * @returns Verb nurbs curve
     */
    convertToNurbsCurve(inputs: Inputs.Polyline.PolylineDto): any {
        return this.context.verb.geom.NurbsCurve.byPoints(inputs.polyline.points, 1);
    }

    /**
     * Gets the length of the polyline
     * <div>
     *  <img src="../assets/images/blockly-images/polyline/length.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_polyline.polyline.html#length
     * @param inputs Polyline to be queried
     * @returns Length of the polyline
     */
    length(inputs: Inputs.Polyline.PolylineDto): number {
        let distanceOfPolyline = 0;
        for (let i = 1; i < inputs.polyline.points.length; i++) {
            const previousPoint = inputs.polyline.points[i - 1];
            const currentPoint = inputs.polyline.points[i];
            distanceOfPolyline += this.context.verb.core.Vec.dist(previousPoint, currentPoint);
        }
        return distanceOfPolyline;
    }

    /**
     * Gets the number of points in the polyline
     * <div>
     *  <img src="../assets/images/blockly-images/polyline/countPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_polyline.polyline.html#countpoints
     * @param inputs Polyline to be queried
     * @returns Number of points in polyline
     */
    countPoints(inputs: Inputs.Polyline.PolylineDto): number {
        return inputs.polyline.points.length;
    }

    /**
     * Gets the points of the polyline
     * <div>
     *  <img src="../assets/images/blockly-images/polyline/getPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_polyline.polyline.html#getpoints
     * @param inputs Polyline to be queried
     * @returns Points of the polyline
     */
    getPoints(inputs: Inputs.Polyline.PolylineDto): number[][] {
        return inputs.polyline.points;
    }

    /**
     * Reverse the points of the polyline
     * <div>
     *  <img src="../assets/images/blockly-images/polyline/reverse.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_polyline.polyline.html#reverse
     * @param inputs Polyline to be reversed
     * @returns Reversed polyline
     */
    reverse(inputs: Inputs.Polyline.PolylineDto): Inputs.Polyline.PolylinePropertiesDto {
        return { points: inputs.polyline.points.reverse() };
    }

    /**
     * Transform the polyline
     * <div>
     *  <img src="../assets/images/blockly-images/polyline/transformPolyline.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_polyline.polyline.html#transformpolyline
     * @param inputs Polyline to be transformed
     * @returns Transformed polyline
     */
    transformPolyline(inputs: Inputs.Polyline.TransformPolylineDto): Inputs.Polyline.PolylinePropertiesDto {
        const transformation = inputs.matrix;
        let transformedControlPoints = inputs.polyline.points;
        transformedControlPoints = this.geometryHelper.transformControlPoints(transformation, transformedControlPoints);
        return { points: transformedControlPoints };
    }

    /**
     * Create the polyline
     * <div>
     *  <img src="../assets/images/blockly-images/polyline/create.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_polyline.polyline.html#create
     * @param inputs Points of the polyline
     * @returns Polyline
     */
    create(inputs: Inputs.Polyline.PolylinePropertiesDto): Inputs.Polyline.PolylinePropertiesDto {
        return {
            points: inputs.points,
        };
    }

}

