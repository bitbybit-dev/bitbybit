import { GeometryHelper } from "./geometry-helper";
import * as Inputs from "../inputs";
import { Point } from "./point";
import { Vector } from "./vector";

/**
 * Contains various methods for lines and segments. Line in bitbybit is a simple object that has start and end point properties.
 * { start: [ x, y, z ], end: [ x, y, z ] }
 */
export class Line {

    constructor(private readonly vector: Vector, private readonly point: Point, private readonly geometryHelper: GeometryHelper) { }

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
     * Create the segment
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

    /**
     * If two lines intersect return the intersection point
     * @param inputs line1 and line2
     * @returns intersection point or undefined if no intersection
     * @group intersection
     * @shortname line-line int
     * @drawable true
     */
    lineLineIntersection(inputs: Inputs.Line.LineLineIntersectionDto): Inputs.Base.Point3 | undefined {
        const epsilon = inputs.tolerance || 1e-6; // Default tolerance
        const checkSegments = inputs.checkSegmentsOnly;
    
        const line1 = inputs.line1;
        const line2 = inputs.line2;
    
        // Input validation
        if (!line1?.start || !line1.end || !line2?.start || !line2.end ||
            line1.start.length !== 3 || line1.end.length !== 3 ||
            line2.start.length !== 3 || line2.end.length !== 3) {
            console.error("Invalid line input to lineLineIntersection");
            return undefined;
        }
    
        const p1 = line1.start;
        const d1 = this.vector.sub({ first: line1.end, second: line1.start }); // Direction vector line 1
        const p2 = line2.start;
        const d2 = this.vector.sub({ first: line2.end, second: line2.start }); // Direction vector line 2
        const p21 = this.vector.sub({ first: p2, second: p1 });              // Vector between start points
    
        // --- Check for Zero-Length Segments ---
        const lenSq1 = this.vector.lengthSq({ vector: d1 as Inputs.Base.Vector3 });
        const lenSq2 = this.vector.lengthSq({ vector: d2 as Inputs.Base.Vector3 });
    
        // Compare squared length against squared epsilon
        if (lenSq1 < epsilon * epsilon || lenSq2 < epsilon * epsilon) {
            return undefined;
        }
    
        // --- Check for Parallelism ---
        const d1_cross_d2 = this.vector.cross({ first: d1, second: d2 });
        const crossMagSq = this.vector.lengthSq({ vector: d1_cross_d2 as Inputs.Base.Vector3 });
    
        // Check if squared magnitude of cross product is near zero (relative to segment lengths)
        // Use epsilon squared as a base tolerance, potentially scale by magnitudes
        const parallel_tolerance_sq = epsilon * epsilon; // May need adjustment: * lenSq1 * lenSq2;
        if (crossMagSq < parallel_tolerance_sq) {
            // Potentially Parallel or Collinear
            // Check if collinear: p21 must be parallel to d1
            const p21_cross_d1 = this.vector.cross({ first: p21, second: d1 });
            // Use similar tolerance logic for collinear check
            const collinear_tolerance_sq = epsilon * epsilon * lenSq1; // Scale by line1 length
            if (this.vector.lengthSq({ vector: p21_cross_d1 as Inputs.Base.Vector3 }) < collinear_tolerance_sq) {
                // Collinear
                if (!checkSegments) {
                    return p1; // Infinite lines intersect everywhere, return p1 arbitrarily
                } else {
                    // --- Check for Segment Overlap (Collinear case) ---
                    const d1d1 = lenSq1; // Reuse calculated squared length
                     // Avoid division by zero if lenSq1 is extremely small (should be caught earlier)
                    const safe_d1d1 = (d1d1 < epsilon * epsilon) ? 1.0 : d1d1;
                    const d1p21 = this.vector.dot({ first: d1, second: p21 }); // Dot product d1·(p2-p1)
                    const t_p2 = d1p21 / safe_d1d1; // Parameter for p2 projected onto line1's frame
                    const vec_e2_p1 = this.vector.sub({ first: line2.end, second: p1 });
                    const t_e2 = this.vector.dot({ first: d1, second: vec_e2_p1 }) / safe_d1d1; // Param for e2
    
                    const interval2_t = [Math.min(t_p2, t_e2), Math.max(t_p2, t_e2)];
                    const interval1_t = [0, 1]; // Line1 segment parameter range
    
                    const overlap_start = Math.max(interval1_t[0], interval2_t[0]);
                    const overlap_end = Math.min(interval1_t[1], interval2_t[1]);
    
                    // Check for overlap including tolerance
                    if (overlap_start <= overlap_end + epsilon) {
                         // Overlap exists, but intersection is a segment, not a single point
                        return undefined;
                    } else {
                        // Collinear but segments do not overlap
                        return undefined;
                    }
                }
            } else {
                // Parallel but not collinear
                return undefined;
            }
        }
    
        // --- Lines are NOT Parallel - Check for Skewness using Scalar Triple Product ---
        const scalarTripleProduct = this.vector.dot({ first: p21, second: d1_cross_d2 });
    
        // If the scalar triple product is significantly non-zero, the lines are skew.
        // Tolerance needs consideration - relates to the "volume" formed by the vectors.
        // A simple absolute check against epsilon^3 or similar might work for typical scales.
        // Consider scaling tolerance if coordinates can be very large/small.
        const skew_tolerance = epsilon * epsilon * epsilon;
        if (Math.abs(scalarTripleProduct) > skew_tolerance) {
            // Lines are Skew
            return undefined;
        }
    
        // --- Lines are Intersecting (Coplanar and Non-Parallel) ---
        // Calculate intersection parameters t (for line1) and u (for line2)
        // We can use the formulas derived earlier, which are valid for intersecting lines.
        const d1d1 = lenSq1;
        const d2d2 = lenSq2;
        const d1d2 = this.vector.dot({ first: d1, second: d2 });
        const d1p21 = this.vector.dot({ first: d1, second: p21 });
        const d2p21 = this.vector.dot({ first: d2, second: p21 });
    
        // Denominator for parameter calculation (same as crossMagSq, essentially)
        const denominator = d1d1 * d2d2 - d1d2 * d1d2;
    
        // Denominator *should* be non-zero based on the parallelism check above,
        // but add a defensive check.
        if (Math.abs(denominator) < epsilon * epsilon) {
             console.error("Internal error: Denominator near zero after non-parallel check.");
             return undefined; // Should not happen
        }
    
        const t = (d2d2 * d1p21 - d1d2 * d2p21) / denominator;
        const u = (d1d2 * d1p21 - d1d1 * d2p21) / denominator;
    
        // --- Optional check: Is intersection within segment bounds? ---
        if (checkSegments) {
            // Check if t and u are within the range [0, 1] (using tolerance)
            if (t < -epsilon || t > 1.0 + epsilon || u < -epsilon || u > 1.0 + epsilon) {
                return undefined; // Intersection point is outside one or both segments
            }
        }
    
        // --- Calculate Intersection Point ---
        const intersectionPoint = this.getPointOnLine({ param: t, line: line1 });
    
        // Clip near-zero results based on the input epsilon
        return [
            Math.abs(intersectionPoint[0]) < epsilon ? 0 : intersectionPoint[0],
            Math.abs(intersectionPoint[1]) < epsilon ? 0 : intersectionPoint[1],
            Math.abs(intersectionPoint[2]) < epsilon ? 0 : intersectionPoint[2],
        ] as Inputs.Base.Point3;
    }

}

