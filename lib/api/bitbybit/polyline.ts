
import * as BABYLON from "@babylonjs/core";
import { Context } from "../context";
import { GeometryHelper } from "../geometry-helper";
import * as Inputs from "../inputs/inputs";

/**
 * Contains various methods for polyline. Polyline in bitbybit is a simple object that has points property containing an array of points.
 * { points: number[][] }
 */

export class Polyline {

    constructor(private readonly context: Context, private readonly geometryHelper: GeometryHelper) { }

    /**
     * Draws a single polyline
     * @param inputs Contains a polyline to be drawn
     * @returns Lines mesh that is being drawn by Babylon
     */
    drawPolyline(inputs: Inputs.Polyline.DrawPolylineDto): BABYLON.GreasedLineMesh {
        // handle jscad isClosed case
        const points = inputs.polyline.points;
        if (inputs.polyline.isClosed) {
            points.push(points[0]);
        }
        return this.geometryHelper.drawPolyline(
            inputs.polylineMesh,
            points,
            inputs.updatable,
            inputs.size,
            inputs.opacity,
            inputs.colours
        );
    }

    /**
     * Draws multiple polylines
     * @param inputs Contains a polyline to be drawn
     * @returns Lines mesh that is being drawn by Babylon
     */
    drawPolylines(inputs: Inputs.Polyline.DrawPolylinesDto): BABYLON.GreasedLineMesh {
        let colours = inputs.colours;
        const points = inputs.polylines.map((s, index) => {
            const pts = s.points;
            //handle jscad
            if (s.isClosed) {
                pts.push(pts[0]);
            }
            // sometimes polylines can have assigned colors in case of jscad for example. Such colour will overwrite the default provided colour for that polyline.
            if (s.color) {
                if (!Array.isArray(colours)) {
                    colours = [];
                }
                if (Array.isArray(s.color)) {
                    colours[index] = BABYLON.Color3.FromArray(s.color).toHexString();
                } else {
                    colours[index] = s.color;
                }
            }
            return pts;
        });

        return this.geometryHelper.drawPolylines(
            inputs.polylinesMesh,
            points,
            inputs.updatable,
            inputs.size,
            inputs.opacity,
            colours
        );
    }

    /**
     * Converts a polyline to a NURBS curve
     * Returns the verbnurbs NurbsCurve object
     * @param inputs Polyline to be transformed to curve
     * @returns Verb nurbs curve
     */
    convertToNurbsCurve(inputs: Inputs.Polyline.PolylineDto): any {
        return this.context.verb.geom.NurbsCurve.byPoints(inputs.polyline.points, 1);
    }

    /**
     * Gets the length of the polyline
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
     * @param inputs Polyline to be queried
     * @returns Number of points in polyline
     */
    countPoints(inputs: Inputs.Polyline.PolylineDto): number {
        return inputs.polyline.points.length;
    }

    /**
     * Gets the points of the polyline
     * @param inputs Polyline to be queried
     * @returns Points of the polyline
     */
    getPoints(inputs: Inputs.Polyline.PolylineDto): number[][] {
        return inputs.polyline.points;
    }

    /**
     * Reverse the points of the polyline
     * @param inputs Polyline to be reversed
     * @returns Reversed polyline
     */
    reverse(inputs: Inputs.Polyline.PolylineDto): Inputs.Polyline.PolylinePropertiesDto {
        return { points: inputs.polyline.points.reverse() };
    }

    /**
     * Transform the polyline
     * @param inputs Polyline to be transformed
     * @returns Transformed polyline
     */
    transformPolyline(inputs: Inputs.Polyline.TransformPolylineDto): Inputs.Polyline.PolylinePropertiesDto {
        const transformation = inputs.transformation;
        let transformedControlPoints = inputs.polyline.points;
        transformedControlPoints = this.geometryHelper.transformControlPoints(transformation, transformedControlPoints);
        return { points: transformedControlPoints };
    }

    /**
     * Create the polyline
     * @param inputs Points of the polyline
     * @returns Polyline
     */
    create(inputs: Inputs.Polyline.PolylinePropertiesDto): Inputs.Polyline.PolylinePropertiesDto {
        return {
            points: inputs.points,
        };
    }

}

