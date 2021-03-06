import { Injectable } from '@angular/core';
import { Color3, Color4, LinesMesh, Mesh, MeshBuilder, Vector3 } from '@babylonjs/core';
import { Context } from '../context';
import { GeometryHelper } from '../geometry-helper';
import * as Inputs from '../inputs/inputs';

/**
 * Contains various methods for lines. Line in bitbybit is a simple object that has star and end point properties.
 * { start: [ x, y, z ], end: [ x, y, z ] }
 */
@Injectable()
export class Line {

    constructor(private readonly context: Context, private readonly geometryHelper: GeometryHelper) { }

    /**
     * Draws a single line
     * <div>
     *  <img src="../assets/images/blockly-images/line/drawLine.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#drawline
     * @param inputs Contains a line to be drawn
     * @returns Lines mesh that is being drawn by Babylon
     */
    drawLine(inputs: Inputs.Line.DrawLineDto): LinesMesh {
        const line = inputs.line;

        const points = [
            new Vector3(line.start[0], line.start[1], line.start[2]),
            new Vector3(line.end[0], line.end[1], line.end[2])
        ];

        if (inputs.lineMesh && inputs.updatable) {
            inputs.lineMesh = MeshBuilder.CreateLines(null,
                {
                    points,
                    instance: inputs.lineMesh,
                    useVertexAlpha: true,
                    updatable: inputs.updatable
                },
                null);
        } else {
            inputs.lineMesh =
                MeshBuilder.CreateLines(`lines${Math.random()}`,
                    {
                        points,
                        updatable: inputs.updatable,
                        useVertexAlpha: true
                    },
                    this.context.scene);

        }

        this.geometryHelper.edgesRendering(inputs.lineMesh, inputs.width, inputs.opacity, inputs.colour);
        return inputs.lineMesh;
    }

    /**
     * Draws multiple lines
     * <div>
     *  <img src="../assets/images/blockly-images/line/drawLines.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#drawlines
     * @param inputs Contains a line to be drawn
     * @returns Lines mesh that is being drawn by Babylon
     */
    drawLines(inputs: Inputs.Line.DrawLinesDto): LinesMesh {
        const lines = [];
        const colors = [];
        inputs.lines.forEach(line => {
            lines.push([
                new Vector3(line.start[0], line.start[1], line.start[2]),
                new Vector3(line.end[0], line.end[1], line.end[2])]
            );
            const col = Color3.FromHexString(inputs.colour);
            colors.push([
                new Color4(col.r, col.g, col.b, inputs.opacity),
                new Color4(col.r, col.g, col.b, inputs.opacity)
            ]);
        });

        if (inputs.linesMesh && inputs.updatable) {
            if (inputs.linesMesh.getTotalVertices() / 2 === lines.length) {
                inputs.linesMesh = MeshBuilder.CreateLineSystem(null,
                    {
                        lines,
                        instance: inputs.linesMesh,
                        colors, useVertexAlpha: true,
                        updatable: inputs.updatable
                    }, null);
            } else {
                inputs.linesMesh.dispose();
                inputs.linesMesh = this.createLineSystemMesh(inputs.updatable, lines, colors);
            }
        } else {
            inputs.linesMesh = this.createLineSystemMesh(inputs.updatable, lines, colors);
        }

        this.geometryHelper.edgesRendering(inputs.linesMesh, inputs.width, inputs.opacity, inputs.colour);
        return inputs.linesMesh;
    }

    /**
     * Converts a line to a NURBS line curve
     * <div>
     *  <img src="../assets/images/blockly-images/line/convertToNurbsCurve.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#converttonurbscurve
     * Returns the verbnurbs Line object
     * @link http://verbnurbs.com/docs/geom/Line/
     * @param inputs Line to be transformed to curve
     * @returns Verb nurbs curve
     */
    convertToNurbsCurve(inputs: Inputs.Line.LineDto): any {
        return new this.context.verb.geom.Line(inputs.line.start, inputs.line.end);
    }

    /**
     * Converts lines to a NURBS curves
     * <div>
     *  <img src="../assets/images/blockly-images/line/convertLinesToNurbsCurves.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#convertlinestonurbscurves
     * Returns array of the verbnurbs Line objects
     * @link http://verbnurbs.com/docs/geom/Line/
     * @param inputs Lines to be transformed to curves
     * @returns Verb nurbs curves
     */
    convertLinesToNurbsCurves(inputs: Inputs.Line.LinesDto): any[] {
        return inputs.lines.map(line => new this.context.verb.geom.Line(line.start, line.end));
    }

    /**
     * Gets the start point of the line
     * <div>
     *  <img src="../assets/images/blockly-images/line/getStartPoint.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#getstartpoint
     * @param inputs Line to be queried
     * @returns Start point
     */
    getStartPoint(inputs: Inputs.Line.LineDto): number[] {
        return inputs.line.start;
    }

    /**
     * Gets the end point of the line
     * <div>
     *  <img src="../assets/images/blockly-images/line/getEndPoint.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#getendpoint
     * @param inputs Line to be queried
     * @returns End point
     */
    getEndPoint(inputs: Inputs.Line.LineDto): number[] {
        return inputs.line.end;
    }

    /**
     * Gets the length of the line
     * <div>
     *  <img src="../assets/images/blockly-images/line/length.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#length
     * @param inputs Line to be queried
     * @returns Length of the line
     */
    length(inputs: Inputs.Line.LineDto): number {
        return this.context.verb.core.Vec.dist(inputs.line.start, inputs.line.end);
    }

    /**
     * Reverse the endpoints of the line
     * <div>
     *  <img src="../assets/images/blockly-images/line/reverse.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#reverse
     * @param inputs Line to be reversed
     * @returns Reversed line
     */
    reverse(inputs: Inputs.Line.LineDto): Inputs.Line.LinePointsDto {
        return { start: inputs.line.end, end: inputs.line.start };
    }

    /**
     * Transform the line
     * <div>
     *  <img src="../assets/images/blockly-images/line/transformLine.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#transformline
     * @param inputs Line to be transformed
     * @returns Transformed line
     */
    transformLine(inputs: Inputs.Line.TransformLineDto): Inputs.Line.LinePointsDto {
        const transformation = inputs.matrix;
        let transformedControlPoints = [inputs.line.start, inputs.line.end];
        transformedControlPoints = this.geometryHelper.transformControlPoints(transformation, transformedControlPoints);
        return {
            start: transformedControlPoints[0],
            end: transformedControlPoints[1]
        };
    }

    /**
     * Create the line
     * <div>
     *  <img src="../assets/images/blockly-images/line/create.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#create
     * @param inputs Endpoints of the line
     * @returns Line
     */
    create(inputs: Inputs.Line.LinePointsDto): Inputs.Line.LinePointsDto {
        return {
            start: inputs.start,
            end: inputs.end,
        };
    }

    /**
     * Create the line segments between all of the points in a list
     * <div>
     *  <img src="../assets/images/blockly-images/line/linesBetweenPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#linesbetweenpoints
     * @param inputs Lines in a list
     * @returns Lines
     */
    linesBetweenPoints(inputs: Inputs.Line.PointsLinesDto): Inputs.Line.LinePointsDto[] {
        const lines = [];
        for (let i = 1; i < inputs.points.length; i++) {
            const previousPoint = inputs.points[i - 1];
            const currentPoint = inputs.points[i];
            lines.push({ start: previousPoint, end: currentPoint });
        }
        return lines;
    }

    /**
     * Create the lines between two lists of start and end points of equal length
     * <div>
     *  <img src="../assets/images/blockly-images/line/linesBetweenStartAndEndPoints.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#linesbetweenstartandendpoints
     * @param inputs Two lists of start and end points
     * @returns Lines
     */
    linesBetweenStartAndEndPoints(inputs: Inputs.Line.LineStartEndPointsDto): Inputs.Line.LinePointsDto[] {
        return inputs.startPoints
            .map((s, index) => ({ start: s, end: inputs.endPoints[index] }))
            .filter(line => this.context.verb.core.Vec.dist(line.start, line.end) !== 0);
    }

    private createLineSystemMesh(updatable: boolean, lines: Vector3[][], colors: Color4[][]): LinesMesh {
        return MeshBuilder.CreateLineSystem(`lines${Math.random()}`,
            {
                lines,
                colors,
                useVertexAlpha: true,
                updatable
            }, this.context.scene);
    }
}

