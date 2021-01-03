import { Injectable } from '@angular/core';
import { Color3, Color4, LinesMesh, Mesh, MeshBuilder, Vector3 } from '@babylonjs/core';
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
     *  <img src="../assets/images/blockly-images/polyline/drawPolyline.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_polyline_.polyline.html#drawpolyline
     * @param inputs Contains a polyline to be drawn
     * @returns Lines mesh that is being drawn by Babylon
     */
    drawPolyline(inputs: Inputs.Polyline.DrawPolylineDto): LinesMesh {
        const points = [];
        const colors = [];
        inputs.polyline.points.forEach(pt => {
            points.push(new Vector3(pt[0], pt[1], pt[2]));
            colors.push(new Color4(1, 1, 1, 0));
        });

        if (inputs.polylineMesh && inputs.updatable) {

            if (inputs.polylineMesh.getTotalVertices() === points.length) {
                inputs.polylineMesh = MeshBuilder.CreateLines(null, {
                    points,
                    colors,
                    instance: inputs.polylineMesh,
                    useVertexAlpha: true,
                    updatable: inputs.updatable
                }, null);
            } else {
                inputs.polylineMesh.dispose();
                inputs.polylineMesh = this.CreateLines(inputs, points, colors);
            }
        } else {
            inputs.polylineMesh = this.CreateLines(inputs, points, colors);
        }

        this.geometryHelper.edgesRendering(inputs.polylineMesh, inputs.width, inputs.opacity, inputs.colour);
        return inputs.polylineMesh;
    }

    /**
     * Draws multiple polylines
     * <div>
     *  <img src="../assets/images/blockly-images/polyline/drawPolylines.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_polyline_.polyline.html#drawpolylines
     * @param inputs Contains a polyline to be drawn
     * @returns Lines mesh that is being drawn by Babylon
     */
    drawPolylines(inputs: Inputs.Polyline.DrawPolylinesDto): LinesMesh {
        const linesForRender = [];
        inputs.polylines.forEach(polyline => {
            linesForRender.push(polyline.points.map(pt => new Vector3(pt[0], pt[1], pt[2])));
        });

        if (inputs.polylinesMesh && inputs.updatable) {
            if (inputs.polylinesMesh.getTotalVertices() / 2 === linesForRender.length) {
                inputs.polylinesMesh = MeshBuilder.CreateLineSystem(null,
                    {
                        lines: linesForRender,
                        instance: inputs.polylinesMesh,
                        useVertexAlpha: true,
                        updatable: inputs.updatable
                    }, null);
            } else {
                inputs.polylinesMesh.dispose();
                inputs.polylinesMesh = this.createLineSystem(inputs.updatable, linesForRender);
            }
        } else {
            inputs.polylinesMesh = this.createLineSystem(inputs.updatable, linesForRender);
        }

        this.geometryHelper.edgesRendering(inputs.polylinesMesh, inputs.width, inputs.opacity, inputs.colour);
        return inputs.polylinesMesh;
    }

    /**
     * Converts a polyline to a NURBS curve
     * <div>
     *  <img src="../assets/images/blockly-images/polyline/convertToNurbsCurve.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_polyline_.polyline.html#converttonurbscurve
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
     *  <img src="../assets/images/blockly-images/polyline/length.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_polyline_.polyline.html#length
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
     *  <img src="../assets/images/blockly-images/polyline/countPoints.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_polyline_.polyline.html#countpoints
     * @param inputs Polyline to be queried
     * @returns Number of points in polyline
     */
    countPoints(inputs: Inputs.Polyline.PolylineDto): number {
        return inputs.polyline.points.length;
    }

    /**
     * Gets the points of the polyline
     * <div>
     *  <img src="../assets/images/blockly-images/polyline/getPoints.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_polyline_.polyline.html#getpoints
     * @param inputs Polyline to be queried
     * @returns Points of the polyline
     */
    getPoints(inputs: Inputs.Polyline.PolylineDto): number[][] {
        return inputs.polyline.points;
    }

    /**
     * Reverse the points of the polyline
     * <div>
     *  <img src="../assets/images/blockly-images/polyline/reverse.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_polyline_.polyline.html#reverse
     * @param inputs Polyline to be reversed
     * @returns Reversed polyline
     */
    reverse(inputs: Inputs.Polyline.PolylineDto): Inputs.Polyline.PolylinePointsDto {
        return { points: inputs.polyline.points.reverse() };
    }

    /**
     * Transform the polyline
     * <div>
     *  <img src="../assets/images/blockly-images/polyline/transformPolyline.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_polyline_.polyline.html#transformpolyline
     * @param inputs Polyline to be transformed
     * @returns Transformed polyline
     */
    transformPolyline(inputs: Inputs.Polyline.TransformPolylineDto): Inputs.Polyline.PolylinePointsDto {
        const transformation = inputs.matrix;
        let transformedControlPoints = inputs.polyline.points;
        transformedControlPoints = this.geometryHelper.transformControlPoints(transformation, transformedControlPoints);
        return { points: transformedControlPoints };
    }

    /**
     * Create the polyline
     * <div>
     *  <img src="../assets/images/blockly-images/polyline/create.png" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/_api_bitbybit_polyline_.polyline.html#create
     * @param inputs Points of the polyline
     * @returns Polyline
     */
    create(inputs: Inputs.Polyline.PolylinePointsDto): Inputs.Polyline.PolylinePointsDto {
        return {
            points: inputs.points,
        };
    }

    private createLineSystem(updatable: boolean, lines: Vector3[][]): LinesMesh {
        return MeshBuilder.CreateLineSystem(`lines${Math.random()}`,
            {
                lines,
                useVertexAlpha: true,
                updatable
            }, this.context.scene);
    }

    private CreateLines(inputs: Inputs.Polyline.DrawPolylineDto, points: Vector3[], colors: Color4[]): LinesMesh {
        return MeshBuilder.CreateLines(`polylineMesh${Math.random()}`,
            {
                points,
                colors,
                updatable: inputs.updatable,
                useVertexAlpha: true
            }, this.context.scene);
    }
}

