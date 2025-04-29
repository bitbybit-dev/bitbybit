import { GeometryHelper } from "./geometry-helper";
import * as Inputs from "../inputs";
import { Point } from "./point";

/**
 * Contains various methods for lines and segments. Line in bitbybit is a simple object that has start and end point properties.
 * { start: [ x, y, z ], end: [ x, y, z ] }
 */
export class Line {

    constructor(private readonly point: Point, private readonly geometryHelper: GeometryHelper) { }

    /**
     * Gets the start point of the line
     * @param inputs a line
     * @returns start point
     * @group get
     * @shortname line start point
     * @drawable true
     */
    getStartPoint(inputs: Inputs.Line.LineDto): Inputs.Base.Point3 {
        return inputs.line.start;
    }

    /**
     * Gets the end point of the line
     * @param inputs a line
     * @returns end point
     * @group get
     * @shortname line end point
     * @drawable true
     */
    getEndPoint(inputs: Inputs.Line.LineDto): Inputs.Base.Point3 {
        return inputs.line.end;
    }

    /**
     * Gets the length of the line
     * @param inputs a line
     * @returns line length
     * @group get
     * @shortname line length
     * @drawable false
     */
    length(inputs: Inputs.Line.LineDto): number {
        return this.point.distance({ startPoint: inputs.line.start, endPoint: inputs.line.end });
    }

    /**
     * Reverse the endpoints of the line
     * @param inputs a line
     * @returns reversed line
     * @group operations
     * @shortname reversed line
     * @drawable true
     */
    reverse(inputs: Inputs.Line.LineDto): Inputs.Base.Line3 {
        return { start: inputs.line.end, end: inputs.line.start };
    }

    /**
     * Transform the line
     * @param inputs a line
     * @returns transformed line
     * @group transforms
     * @shortname transform line
     * @drawable true
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
     * @param inputs lines
     * @returns transformed lines
     * @group transforms
     * @shortname transform lines
     * @drawable true
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
     * @param inputs start and end points of the line
     * @returns line
     * @group create
     * @shortname line
     * @drawable true
     */
    create(inputs: Inputs.Line.LinePointsDto): Inputs.Base.Line3 {
        return {
            start: inputs.start,
            end: inputs.end,
        };
    }

    /**
     * Gets the point on the line segment at a given param
     * @param inputs line
     * @returns point on line
     * @group get
     * @shortname point on line
     * @drawable true
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
     * Create the lines segments between all of the points in a list
     * @param inputs points
     * @returns lines
     * @group create
     * @shortname lines between points
     * @drawable true
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
     * Create the lines between start and end points
     * @param inputs start points and end points
     * @returns lines
     * @group create
     * @shortname start and end points to lines
     * @drawable true
     */
    linesBetweenStartAndEndPoints(inputs: Inputs.Line.LineStartEndPointsDto): Inputs.Base.Line3[] {
        return inputs.startPoints
            .map((s, index) => ({ start: s, end: inputs.endPoints[index] }))
            .filter(line => this.point.distance({ startPoint: line.start, endPoint: line.end }) !== 0);
    }

    /**
     * Convert the line to segment
     * @param inputs line
     * @returns segment
     * @group convert
     * @shortname line to segment
     * @drawable false
     */
    lineToSegment(inputs: Inputs.Line.LineDto): Inputs.Base.Segment3 {
        return [inputs.line.start, inputs.line.end];
    }

    /**
     * Converts the lines to segments
     * @param inputs lines
     * @returns segments
     * @group convert
     * @shortname lines to segments
     * @drawable false
     */
    linesToSegments(inputs: Inputs.Line.LinesDto): Inputs.Base.Segment3[] {
        return inputs.lines.map(line => [line.start, line.end]);
    }

    /**
     * Converts the segment to line
     * @param inputs segment
     * @returns line
     * @group convert
     * @shortname segment to line
     * @drawable true
     */
    segmentToLine(inputs: Inputs.Line.SegmentDto): Inputs.Base.Line3 {
        return { start: inputs.segment[0], end: inputs.segment[1] };
    }

    /**
     * Converts the segments to lines
     * @param inputs segments
     * @returns lines
     * @group convert
     * @shortname segments to lines
     * @drawable true
     */
    segmentsToLines(inputs: Inputs.Line.SegmentsDto): Inputs.Base.Line3[] {
        return inputs.segments.map(segment => ({ start: segment[0], end: segment[1] }));
    }
    
}

