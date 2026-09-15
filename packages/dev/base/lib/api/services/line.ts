import { GeometryHelper } from "./geometry-helper";
import * as Inputs from "../inputs";
import { Point } from "./point";
import { Vector } from "./vector";

/**
 * Straight lines between two points, held as plain objects of the form `{ start, end }`, and the
 * segment form `[start, end]` of the same thing. The methods here build lines, measure and
 * transform them, convert between the two forms, place points along them and find where two lines
 * cross. Lengths are in model units.
 */
export class Line {

    constructor(private readonly vector: Vector, private readonly point: Point, private readonly geometryHelper: GeometryHelper) { }

    /**
     * Reads the start point of a line.
     *
     * Example: { start: [0,0,0], end: [10,5,0] } -> [0,0,0]
     * @param inputs - The line
     * @returns The start point
     * @group get
     * @shortname line start point
     * @drawable true
     */
    getStartPoint(inputs: Inputs.Line.LineDto): Inputs.Base.Point3 {
        return inputs.line.start;
    }

    /**
     * Reads the end point of a line.
     *
     * Example: { start: [0,0,0], end: [10,5,0] } -> [10,5,0]
     * @param inputs - The line
     * @returns The end point
     * @group get
     * @shortname line end point
     * @drawable true
     */
    getEndPoint(inputs: Inputs.Line.LineDto): Inputs.Base.Point3 {
        return inputs.line.end;
    }

    /**
     * Measures the straight distance from the start of a line to its end.
     *
     * Example: { start: [0,0,0], end: [3,4,0] } -> 5
     * @param inputs - The line
     * @returns The length in model units
     * @group get
     * @shortname line length
     * @drawable false
     */
    length(inputs: Inputs.Line.LineDto): number {
        return this.point.distance({ startPoint: inputs.line.start, endPoint: inputs.line.end });
    }

    /**
     * Swaps the start and end of a line, so it runs the other way.
     *
     * Example: { start: [0,0,0], end: [10,5,0] } -> { start: [10,5,0], end: [0,0,0] }
     * @param inputs - The line
     * @returns A new line running the other way
     * @group operations
     * @shortname reversed line
     * @drawable true
     */
    reverse(inputs: Inputs.Line.LineDto): Inputs.Base.Line3 {
        return { start: inputs.line.end, end: inputs.line.start };
    }

    /**
     * Applies a transformation matrix, or a list of them in order, to both ends of a line.
     *
     * Example: { start: [0,0,0], end: [10,0,0] } moved by [5,5,0] -> { start: [5,5,0], end:
     * [15,5,0] }
     * @param inputs - The line and the transformation
     * @returns A new line with the transformed ends
     * @group transforms
     * @shortname transform line
     * @drawable true
     * @example
     * ```typescript
     * const moved = bitbybit.line.transformLine({
     *     line: { start: [0, 0, 0], end: [10, 0, 0] },
     *     transformation: bitbybit.transforms.translationXYZ({ translation: [5, 5, 0] }),
     * });
     * ```
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
     * Applies a different transformation to each line: the first transformation to the first line,
     * and so on.
     *
     * Example: three lines with three translations -> each line moved by its own translation
     * @param inputs - The lines and one transformation per line
     * @returns The transformed lines, in the same order
     * @group transforms
     * @shortname transform lines
     * @drawable true
     * @example
     * ```typescript
     * const placed = bitbybit.line.transformsForLines({
     *     lines: [{ start: [0, 0, 0], end: [1, 0, 0] }, { start: [0, 0, 0], end: [0, 1, 0] }],
     *     transformation: bitbybit.transforms.translationsXYZ({ translations: [[0, 1, 0], [0, 2, 0]] }),
     * });
     * ```
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
     * Builds a line object from a start and an end point.
     *
     * Example: start [0,0,0], end [10,5,0] -> { start: [0,0,0], end: [10,5,0] }
     * @param inputs - The start and end points
     * @returns The line object
     * @group create
     * @shortname line
     * @drawable true
     * @example
     * ```typescript
     * const line = bitbybit.line.create({ start: [0, 0, 0], end: [10, 5, 0] });
     * ```
     */
    create(inputs: Inputs.Line.LinePointsDto): Inputs.Base.Line3 {
        return {
            start: inputs.start,
            end: inputs.end,
        };
    }

    /**
     * Builds a segment, the pair-of-points form of a line, from a start and an end point.
     *
     * Example: start [0,0,0], end [10,5,0] -> [[0,0,0], [10,5,0]]
     * @param inputs - The start and end points
     * @returns The segment as `[start, end]`
     * @group create
     * @shortname segment
     * @drawable true
     * @example
     * ```typescript
     * const segment = bitbybit.line.createSegment({ start: [0, 0, 0], end: [10, 5, 0] });
     * ```
     */
    createSegment(inputs: Inputs.Line.LinePointsDto): Inputs.Base.Segment3 {
        return [
            inputs.start,
            inputs.end,
        ];
    }

    /**
     * Finds the point a fraction of the way along a line: 0 gives the start, 1 the end, 0.5 the
     * middle.
     *
     * A fraction outside 0 to 1 continues past the ends.
     * Example: { start: [0,0,0], end: [10,0,0] } at 0.5 -> [5,0,0]
     * @param inputs - The line and the fraction along it
     * @returns The point on the line
     * @group get
     * @shortname point on line
     * @drawable true
     * @example
     * ```typescript
     * const middle = bitbybit.line.getPointOnLine({ line: { start: [0, 0, 0], end: [10, 0, 0] }, param: 0.5 });
     * ```
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
     * Joins each point to the next with a line, so a list of points becomes a chain of lines.
     *
     * Example: [[0,0,0], [5,0,0], [5,5,0]] -> two lines, [0,0,0] to [5,0,0] and [5,0,0] to [5,5,0]
     * @param inputs - The points, in order
     * @returns One line per pair of neighboring points
     * @group create
     * @shortname lines between points
     * @drawable true
     * @example
     * ```typescript
     * const chain = bitbybit.line.linesBetweenPoints({ points: [[0, 0, 0], [5, 0, 0], [5, 5, 0]] });
     * ```
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
     * Pairs each start point with the end point at the same position and joins them with a line.
     *
     * A pair whose two points coincide makes no line and is left out.
     * Example: starts [[0,0,0], [5,0,0]] and ends [[0,5,0], [5,5,0]] -> two lines
     * @param inputs - The start points and the end points, in matching order
     * @returns One line per pair, skipping pairs of length 0
     * @group create
     * @shortname start and end points to lines
     * @drawable true
     * @example
     * ```typescript
     * const rungs = bitbybit.line.linesBetweenStartAndEndPoints({
     *     startPoints: [[0, 0, 0], [5, 0, 0]],
     *     endPoints: [[0, 5, 0], [5, 5, 0]],
     * });
     * ```
     */
    linesBetweenStartAndEndPoints(inputs: Inputs.Line.LineStartEndPointsDto): Inputs.Base.Line3[] {
        return inputs.startPoints
            .map((s, index) => ({ start: s, end: inputs.endPoints[index]! }))
            .filter(line => this.point.distance({ startPoint: line.start, endPoint: line.end }) !== 0);
    }

    /**
     * Turns a line object into its segment form, the pair `[start, end]`.
     *
     * Example: { start: [0,0,0], end: [10,5,0] } -> [[0,0,0], [10,5,0]]
     * @param inputs - The line
     * @returns The segment
     * @group convert
     * @shortname line to segment
     * @drawable false
     */
    lineToSegment(inputs: Inputs.Line.LineDto): Inputs.Base.Segment3 {
        return [inputs.line.start, inputs.line.end];
    }

    /**
     * Turns each line object into its segment form, the pair `[start, end]`.
     *
     * Example: three lines -> three segments, in the same order
     * @param inputs - The lines
     * @returns One segment per line
     * @group convert
     * @shortname lines to segments
     * @drawable false
     */
    linesToSegments(inputs: Inputs.Line.LinesDto): Inputs.Base.Segment3[] {
        return inputs.lines.map(line => [line.start, line.end]);
    }

    /**
     * Turns a segment, the pair `[start, end]`, into a line object.
     *
     * Example: [[0,0,0], [10,5,0]] -> { start: [0,0,0], end: [10,5,0] }
     * @param inputs - The segment
     * @returns The line
     * @group convert
     * @shortname segment to line
     * @drawable true
     */
    segmentToLine(inputs: Inputs.Line.SegmentDto): Inputs.Base.Line3 {
        return { start: inputs.segment[0], end: inputs.segment[1] };
    }

    /**
     * Turns each segment, a pair `[start, end]`, into a line object.
     *
     * Example: three segments -> three lines, in the same order
     * @param inputs - The segments
     * @returns One line per segment
     * @group convert
     * @shortname segments to lines
     * @drawable true
     */
    segmentsToLines(inputs: Inputs.Line.SegmentsDto): Inputs.Base.Line3[] {
        return inputs.segments.map(segment => ({ start: segment[0], end: segment[1] }));
    }

    /**
     * Finds the point where two lines cross.
     *
     * With `checkSegmentsOnly` on, the crossing must lie within both segments; off, the lines
     * extend without end. Parallel lines, lines that pass each other without meeting, and segments
     * that do not reach each other give undefined. The tolerance says how close counts as meeting.
     * Example: [0,0,0] to [10,0,0] and [5,-5,0] to [5,5,0] -> [5,0,0]
     * @param inputs - The two lines, whether to stay within the segments, and the tolerance
     * @returns The crossing point, or undefined when there is none
     * @group intersection
     * @shortname line-line int
     * @drawable true
     * @example
     * ```typescript
     * const crossing = bitbybit.line.lineLineIntersection({
     *     line1: { start: [0, 0, 0], end: [10, 0, 0] },
     *     line2: { start: [5, -5, 0], end: [5, 5, 0] },
     *     checkSegmentsOnly: true,
     *     tolerance: 1e-6,
     * });
     * ```
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

