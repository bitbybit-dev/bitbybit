import { GeometryHelper } from "./geometry-helper";
import * as Inputs from "../inputs";
import { Point } from "./point";
import { Vector } from "./vector";

/**
 * Contains various methods for lines and segments. Line in bitbybit is a simple object that has start and
 * end point properties. { start: [ x, y, z ], end: [ x, y, z ] }
 */
export class Line {

    constructor(private readonly vector: Vector, private readonly point: Point, private readonly geometryHelper: GeometryHelper) { }

    /**
     * Extracts start point from a line.
     * Example: line={start:[0,0,0], end:[10,5,0]} → [0,0,0]
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
     * Extracts end point from a line.
     * Example: line={start:[0,0,0], end:[10,5,0]} → [10,5,0]
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
     * Calculates length (distance) of a line segment.
     * Example: line={start:[0,0,0], end:[3,4,0]} → 5 (using Pythagorean theorem)
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
     * Reverses line direction by swapping start and end points.
     * Example: line={start:[0,0,0], end:[10,5,0]} → {start:[10,5,0], end:[0,0,0]}
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
     * Applies transformation matrix to line (rotates, scales, or translates both endpoints).
     * Example: line={start:[0,0,0], end:[10,0,0]} with translation [5,5,0] → {start:[5,5,0], end:[15,5,0]}
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
            start: transformedControlPoints[0]!,
            end: transformedControlPoints[1]!
        };
    }

    /**
     * Applies multiple transformations to multiple lines (one transform per line).
     * Example: 3 lines with 3 different translation matrices → each line moved independently
     * @param inputs lines
     * @returns transformed lines
     * @group transforms
     * @shortname transform lines
     * @drawable true
     */
    transformsForLines(inputs: Inputs.Line.TransformsLinesDto): Inputs.Base.Line3[] {
        return inputs.lines.map((line, index) => {
            const transformation = inputs.transformation[index]!;
            let transformedControlPoints = [line.start, line.end];
            transformedControlPoints = this.geometryHelper.transformControlPoints(transformation, transformedControlPoints);
            return {
                start: transformedControlPoints[0]!,
                end: transformedControlPoints[1]!
            };
        });
    }

    /**
     * Creates a line from two points (line object with start and end properties).
     * Example: start=[0,0,0], end=[10,5,0] → {start:[0,0,0], end:[10,5,0]}
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
     * Creates a segment from two points (array format: [start, end]).
     * Example: start=[0,0,0], end=[10,5,0] → [[0,0,0], [10,5,0]]
     * @param inputs start and end points of the segment
     * @returns segment
     * @group create
     * @shortname segment
     * @drawable true
     */
    createSegment(inputs: Inputs.Line.LinePointsDto): Inputs.Base.Segment3 {
        return [
            inputs.start,
            inputs.end,
        ];
    }

    /**
     * Calculates point at parameter t along line segment (0=start, 1=end, linear interpolation).
     * Example: line={start:[0,0,0], end:[10,0,0]}, param=0.5 → [5,0,0] (midpoint)
     * @param inputs line
     * @returns point on line
     * @group get
     * @shortname point on line
     * @drawable true
     */
    getPointOnLine(inputs: Inputs.Line.PointOnLineDto): Inputs.Base.Point3 {
        const point1 = inputs.line.start;
        const point2 = inputs.line.end;
        const parameter = inputs.param ?? 0.5;

        const direction = [point2[0] - point1[0], point2[1] - point1[1], point2[2] - point1[2]];

        const point = [point1[0] + parameter * direction[0]!, point1[1] + parameter * direction[1]!, point1[2] + parameter * direction[2]!] as Inputs.Base.Point3;
        return point;
    }

    /**
     * Creates line segments connecting consecutive points in a list (forms a polyline path).
     * Example: points=[[0,0,0], [5,0,0], [5,5,0]] → 2 lines: [0→5] and [5→5,5]
     * @param inputs points
     * @returns lines
     * @group create
     * @shortname lines between points
     * @drawable true
     */
    linesBetweenPoints(inputs: Inputs.Line.PointsLinesDto): Inputs.Base.Line3[] {
        const lines = [];
        for (let i = 1; i < inputs.points.length; i++) {
            const previousPoint = inputs.points[i - 1]!;
            const currentPoint = inputs.points[i]!;
            lines.push({ start: previousPoint, end: currentPoint });
        }
        return lines;
    }

    /**
     * Creates lines by pairing corresponding start and end points from two arrays.
     * Filters out zero-length lines.
     * Example: starts=[[0,0,0], [5,0,0]], ends=[[0,5,0], [5,5,0]] → 2 lines connecting paired points
     * @param inputs start points and end points
     * @returns lines
     * @group create
     * @shortname start and end points to lines
     * @drawable true
     */
    linesBetweenStartAndEndPoints(inputs: Inputs.Line.LineStartEndPointsDto): Inputs.Base.Line3[] {
        return inputs.startPoints
            .map((s, index) => ({ start: s, end: inputs.endPoints[index]! }))
            .filter(line => this.point.distance({ startPoint: line.start, endPoint: line.end }) !== 0);
    }

    /**
     * Converts line object to segment array format.
     * Example: {start:[0,0,0], end:[10,5,0]} → [[0,0,0], [10,5,0]]
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
     * Converts multiple line objects to segment array format (batch conversion).
     * Example: 3 line objects → 3 segment arrays [[start1, end1], [start2, end2], ...]
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
     * Converts segment array to line object format.
     * Example: [[0,0,0], [10,5,0]] → {start:[0,0,0], end:[10,5,0]}
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
     * Converts multiple segment arrays to line object format (batch conversion).
     * Example: 3 segment arrays → 3 line objects with start/end properties
     * @param inputs segments
     * @returns lines
     * @group convert
     * @shortname segments to lines
     * @drawable true
     */
    segmentsToLines(inputs: Inputs.Line.SegmentsDto): Inputs.Base.Line3[] {
        return inputs.segments.map(segment => ({ start: segment[0], end: segment[1] }));
    }

    /**
     * Calculates intersection point of two lines (or segments if checkSegmentsOnly=true).
     * Returns undefined if lines are parallel, skew, or segments don't overlap.
     * Example: line1={start:[0,0,0], end:[10,0,0]}, line2={start:[5,-5,0], end:[5,5,0]} → [5,0,0]
     * @param inputs line1 and line2
     * @returns intersection point or undefined if no intersection
     * @group intersection
     * @shortname line-line int
     * @drawable true
     */
    lineLineIntersection(inputs: Inputs.Line.LineLineIntersectionDto): Inputs.Base.Point3 | undefined {
        const epsilon = inputs.tolerance || 1e-6;
        const checkSegments = inputs.checkSegmentsOnly;
    
        const line1 = inputs.line1;
        const line2 = inputs.line2;
    
        if (!line1?.start || !line1.end || !line2?.start || !line2.end ||
            line1.start.length !== 3 || line1.end.length !== 3 ||
            line2.start.length !== 3 || line2.end.length !== 3) {
            console.error("Invalid line input to lineLineIntersection");
            return undefined;
        }
    
        const p1 = line1.start;
        const d1 = this.vector.sub({ first: line1.end, second: line1.start });
        const p2 = line2.start;
        const d2 = this.vector.sub({ first: line2.end, second: line2.start });
        const p21 = this.vector.sub({ first: p2, second: p1 });
    
        const lenSq1 = this.vector.lengthSq({ vector: d1 as Inputs.Base.Vector3 });
        const lenSq2 = this.vector.lengthSq({ vector: d2 as Inputs.Base.Vector3 });
    
        if (lenSq1 < epsilon * epsilon || lenSq2 < epsilon * epsilon) {
            return undefined;
        }
    
        const d1_cross_d2 = this.vector.cross({ first: d1, second: d2 });
        const crossMagSq = this.vector.lengthSq({ vector: d1_cross_d2 as Inputs.Base.Vector3 });
    
        const parallel_tolerance_sq = epsilon * epsilon;
        if (crossMagSq < parallel_tolerance_sq) {
            const p21_cross_d1 = this.vector.cross({ first: p21, second: d1 });
            const collinear_tolerance_sq = epsilon * epsilon * lenSq1;
            if (this.vector.lengthSq({ vector: p21_cross_d1 as Inputs.Base.Vector3 }) < collinear_tolerance_sq) {
                if (!checkSegments) {
                    return p1;
                } else {
                    const d1d1 = lenSq1;
                    const safe_d1d1 = (d1d1 < epsilon * epsilon) ? 1.0 : d1d1;
                    const d1p21 = this.vector.dot({ first: d1, second: p21 });
                    const t_p2 = d1p21 / safe_d1d1;
                    const vec_e2_p1 = this.vector.sub({ first: line2.end, second: p1 });
                    const t_e2 = this.vector.dot({ first: d1, second: vec_e2_p1 }) / safe_d1d1;
    
                    const interval2_t: [number, number] = [Math.min(t_p2, t_e2), Math.max(t_p2, t_e2)];
                    const interval1_t: [number, number] = [0, 1];
    
                    const overlap_start = Math.max(interval1_t[0], interval2_t[0]);
                    const overlap_end = Math.min(interval1_t[1], interval2_t[1]);
    
                    if (overlap_start <= overlap_end + epsilon) {
                        return undefined;
                    } else {
                        return undefined;
                    }
                }
            } else {
                return undefined;
            }
        }
    
        const scalarTripleProduct = this.vector.dot({ first: p21, second: d1_cross_d2 });
    
        const skew_tolerance = epsilon * epsilon * epsilon;
        if (Math.abs(scalarTripleProduct) > skew_tolerance) {
            return undefined;
        }
    
        const d1d1 = lenSq1;
        const d2d2 = lenSq2;
        const d1d2 = this.vector.dot({ first: d1, second: d2 });
        const d1p21 = this.vector.dot({ first: d1, second: p21 });
        const d2p21 = this.vector.dot({ first: d2, second: p21 });
    
        const denominator = d1d1 * d2d2 - d1d2 * d1d2;
    
        if (Math.abs(denominator) < epsilon * epsilon) {
             console.error("Internal error: Denominator near zero after non-parallel check.");
             return undefined;
        }
    
        const t = (d2d2 * d1p21 - d1d2 * d2p21) / denominator;
        const u = (d1d2 * d1p21 - d1d1 * d2p21) / denominator;
    
        if (checkSegments) {
            if (t < -epsilon || t > 1.0 + epsilon || u < -epsilon || u > 1.0 + epsilon) {
                return undefined;
            }
        }
    
        const intersectionPoint = this.getPointOnLine({ param: t, line: line1 });
    
        return [
            Math.abs(intersectionPoint[0]) < epsilon ? 0 : intersectionPoint[0],
            Math.abs(intersectionPoint[1]) < epsilon ? 0 : intersectionPoint[1],
            Math.abs(intersectionPoint[2]) < epsilon ? 0 : intersectionPoint[2],
        ] as Inputs.Base.Point3;
    }

}

