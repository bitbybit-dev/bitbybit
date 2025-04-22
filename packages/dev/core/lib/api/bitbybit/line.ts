import { ContextBase } from "../context";
import { GeometryHelper } from "@bitbybit-dev/base";
import * as Inputs from "../inputs";

/**
 * Contains various methods for lines. Line in bitbybit is a simple object that has star and end point properties.
 * { start: [ x, y, z ], end: [ x, y, z ] }
 */

export class Line {

    constructor(private readonly context: ContextBase, private readonly geometryHelper: GeometryHelper) { }

    /**
     * Converts a line to a NURBS line curve
     * Returns the verbnurbs Line object
     * @param inputs Line to be transformed to curve
     * @returns Verb nurbs curve
     */
    convertToNurbsCurve(inputs: Inputs.Line.LineDto): any {
        return new this.context.verb.geom.Line(inputs.line.start, inputs.line.end);
    }

    /**
     * Converts lines to a NURBS curves
     * Returns array of the verbnurbs Line objects
     * @param inputs Lines to be transformed to curves
     * @returns Verb nurbs curves
     */
    convertLinesToNurbsCurves(inputs: Inputs.Line.LinesDto): any[] {
        return inputs.lines.map(line => new this.context.verb.geom.Line(line.start, line.end));
    }

    /**
     * Gets the start point of the line
     * @param inputs Line to be queried
     * @returns Start point
     */
    getStartPoint(inputs: Inputs.Line.LineDto): Inputs.Base.Point3 {
        return inputs.line.start;
    }

    /**
     * Gets the end point of the line
     * @param inputs Line to be queried
     * @returns End point
     */
    getEndPoint(inputs: Inputs.Line.LineDto): Inputs.Base.Point3 {
        return inputs.line.end;
    }

    /**
     * Gets the length of the line
     * @param inputs Line to be queried
     * @returns Length of the line
     */
    length(inputs: Inputs.Line.LineDto): number {
        return this.context.verb.core.Vec.dist(inputs.line.start, inputs.line.end);
    }

    /**
     * Reverse the endpoints of the line
     * @param inputs Line to be reversed
     * @returns Reversed line
     */
    reverse(inputs: Inputs.Line.LineDto): Inputs.Base.Line3 {
        return { start: inputs.line.end, end: inputs.line.start };
    }

    /**
     * Transform the line
     * @param inputs Line to be transformed
     * @returns Transformed line
     */
    transformLine(inputs: Inputs.Line.TransformLineDto): Inputs.Base.Line3 {
        const transformation = inputs.transformation;
        let transformedControlPoints = [inputs.line.start, inputs.line.end];
        transformedControlPoints = this.geometryHelper.transformControlPoints(transformation, transformedControlPoints);
        return {
            start: transformedControlPoints[0],
            end: transformedControlPoints[1]
        };
    }

    /**
     * Transforms the lines with multiple transform for each line
     * @param inputs Lines to be transformed and transformations
     * @returns Transformed lines
     */
    transformsForLines(inputs: Inputs.Line.TransformsLinesDto): Inputs.Base.Line3[] {
        return inputs.lines.map((line, index) => {
            const transformation = inputs.transformation[index];
            let transformedControlPoints = [line.start, line.end];
            transformedControlPoints = this.geometryHelper.transformControlPoints(transformation, transformedControlPoints);
            return {
                start: transformedControlPoints[0],
                end: transformedControlPoints[1]
            };
        });
    }

    /**
     * Create the line
     * @param inputs Endpoints of the line
     * @returns Line
     */
    create(inputs: Inputs.Line.LinePointsDto): Inputs.Base.Line3 {
        return {
            start: inputs.start,
            end: inputs.end,
        };
    }

    /**
     * Create the line from possibly async inputs of points
     * @param inputs Endpoints of the line
     * @returns Line
     */
    createAsync(inputs: Inputs.Line.LinePointsDto): Promise<Inputs.Base.Line3> {
        return Promise.resolve({
            start: inputs.start,
            end: inputs.end,
        });
    }

    /**
     * Gets the point on the line segment at a given param
     * @param inputs Line and parameter
     * @returns Point on line
     */
    getPointOnLine(inputs: Inputs.Line.PointOnLineDto): Inputs.Base.Point3 {
        // Calculate direction vector of line segment
        const point1 = inputs.line.start;
        const point2 = inputs.line.end;
        const parameter = inputs.param;

        const direction = [point2[0] - point1[0], point2[1] - point1[1], point2[2] - point1[2]];

        // Calculate point on line segment corresponding to parameter value
        const point = [point1[0] + parameter * direction[0], point1[1] + parameter * direction[1], point1[2] + parameter * direction[2]] as Inputs.Base.Point3;
        return point;
    }

    /**
     * Create the line segments between all of the points in a list
     * @param inputs Lines in a list
     * @returns Lines
     */
    linesBetweenPoints(inputs: Inputs.Line.PointsLinesDto): Inputs.Base.Line3[] {
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
     * @param inputs Two lists of start and end points
     * @returns Lines
     */
    linesBetweenStartAndEndPoints(inputs: Inputs.Line.LineStartEndPointsDto): Inputs.Base.Line3[] {
        return inputs.startPoints
            .map((s, index) => ({ start: s, end: inputs.endPoints[index] }))
            .filter(line => this.context.verb.core.Vec.dist(line.start, line.end) !== 0);
    }

    /**
     * Create the lines between two lists of start and end points of equal length with potential async inputs
     * @param inputs Two lists of start and end points
     * @returns Lines
     */
    linesBetweenStartAndEndPointsAsync(inputs: Inputs.Line.LineStartEndPointsDto): Promise<Inputs.Base.Line3[]> {
        return Promise.resolve(this.linesBetweenStartAndEndPoints(inputs));
    }
}

