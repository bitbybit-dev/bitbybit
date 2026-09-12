import { Base } from "./base-inputs";

/* eslint-disable @typescript-eslint/no-namespace */

/**
 * Parameters for straight line segments: the start and end points that define one, the options for
 * creating many at once from point lists, and the settings for measuring, reversing, transforming and
 * converting them into polylines or kernel edges.
 */
export namespace Line {
    /**
     * A line as a plain object: where it starts and where it ends. Also the input of `line.create`
     * and `line.createSegment`.
     */
    export class LinePointsDto {
        /**
         * Provide options without default values
         */
        constructor(start?: Base.Point3, end?: Base.Point3) {
            if (start !== undefined) { this.start = start; }
            if (end !== undefined) { this.end = end; }
        }
        /**
         * The first point of the line, where it begins.
         * @default undefined
         */
        start!: Base.Point3;
        /**
         * The second point of the line, where it finishes; the direction runs from start to end.
         * @default undefined
         */
        end!: Base.Point3;
    }
    /**
     * Two matching lists of points for `line.linesBetweenStartAndEndPoints`.
     */
    export class LineStartEndPointsDto {
        /**
         * Provide options without default values
         */
        constructor(startPoints?: Base.Point3[], endPoints?: Base.Point3[]) {
            if (startPoints !== undefined) { this.startPoints = startPoints; }
            if (endPoints !== undefined) { this.endPoints = endPoints; }
        }
        /**
         * The start of each line, in order.
         * @default undefined
         */
        startPoints!: Base.Point3[];
        /**
         * The end of each line, in the same order as the starts.
         * @default undefined
         */
        endPoints!: Base.Point3[];
    }
    /**
     * One line and how to draw it: its width, color and opacity, and whether the drawn mesh will
     * be updated later.
     */
    export class DrawLineDto<T> {
        /**
         * Provide options without default values
         */
        constructor(line?: LinePointsDto, opacity?: number, colours?: string | string[], size?: number, updatable?: boolean, lineMesh?: T) {
            if (line !== undefined) { this.line = line; }
            if (opacity !== undefined) { this.opacity = opacity; }
            if (colours !== undefined) { this.colours = colours; }
            if (size !== undefined) { this.size = size; }
            if (updatable !== undefined) { this.updatable = updatable; }
            if (lineMesh !== undefined) { this.lineMesh = lineMesh; }
        }
        /**
         * The line to draw, with its start and end.
         * @default undefined
         */
        line!: LinePointsDto;
        /**
         * How opaque the line is, from 0 (invisible) to 1 (solid).
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        opacity?: number | undefined = 1;
        /**
         * Color of the line as a hex text such as `#ff0000`; a list of texts is also accepted.
         * @default #444444
         */
        colours?: string | string[] | undefined = "#444444";
        /**
         * Width of the drawn line.
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size?: number | undefined = 3;
        /**
         * When true, the drawn mesh is built so its ends can be moved later without redrawing.
         * @default false
         */
        updatable?: boolean | undefined = false;
        /**
         * A mesh drawn earlier for this line; when given it is updated in place instead of a new
         * one being made.
         * @default undefined
         */
        lineMesh?: T | undefined;
    }
    /**
     * A list of lines and how to draw them: their width, colors and opacity, and whether the drawn
     * mesh will be updated later.
     */
    export class DrawLinesDto<T> {

        /**
         * Provide options without default values
         */
        constructor(lines?: LinePointsDto[], opacity?: number, colours?: string | string[], size?: number, updatable?: boolean, linesMesh?: T) {
            if (lines !== undefined) { this.lines = lines; }
            if (opacity !== undefined) { this.opacity = opacity; }
            if (colours !== undefined) { this.colours = colours; }
            if (size !== undefined) { this.size = size; }
            if (updatable !== undefined) { this.updatable = updatable; }
            if (linesMesh !== undefined) { this.linesMesh = linesMesh; }
        }
        /**
         * The lines to draw, each with its start and end.
         * @default undefined
         */
        lines!: LinePointsDto[];
        /**
         * How opaque the lines are, from 0 (invisible) to 1 (solid).
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        opacity?: number | undefined = 1;
        /**
         * One hex color text for all lines, or one text per line.
         * @default #444444
         */
        colours?: string | string[] | undefined = "#444444";
        /**
         * Width of the drawn lines.
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size?: number | undefined = 3;
        /**
         * When true, the drawn mesh is built so the ends can be moved later without redrawing.
         * @default false
         */
        updatable?: boolean | undefined = false;
        /**
         * A mesh drawn earlier for these lines; when given it is updated in place instead of a new
         * one being made.
         * @default undefined
         */
        linesMesh?: T | undefined;
    }
    /**
     * Points in order for `line.linesBetweenPoints`, which joins each to the next.
     */
    export class PointsLinesDto {
        constructor(points?: Base.Point3[]) {
            if (points !== undefined) { this.points = points; }
        }
        /**
         * The points to join, in order along the chain.
         * @default undefined
         */
        points!: Base.Point3[];
    }
    /**
     * One line for the methods that read or convert it: `line.length`, `line.reverse`,
     * `line.lineToSegment` and the others.
     */
    export class LineDto {
        constructor(line?: LinePointsDto) {
            if (line !== undefined) { this.line = line; }
        }
        /**
         * The line object with its start and end.
         * @default undefined
         */
        line!: LinePointsDto;
    }
    /**
     * One segment, a pair of points, for `line.segmentToLine`.
     */
    export class SegmentDto {
        constructor(segment?: Base.Segment3) {
            if (segment !== undefined) { this.segment = segment; }
        }
        /**
         * The segment as `[start, end]`.
         * @default undefined
         */
        segment!: Base.Segment3;
    }
    /**
     * Several segments, each a pair of points, for `line.segmentsToLines`.
     */
    export class SegmentsDto {
        constructor(segments?: Base.Segment3[]) {
            if (segments !== undefined) { this.segments = segments; }
        }
        /**
         * The segments, each `[start, end]`.
         * @default undefined
         */
        segments!: Base.Segment3[];
    }
    /**
     * Several line objects for `line.linesToSegments`, which converts each to its pair-of-points
     * form.
     */
    export class LinesDto {
        constructor(lines?: LinePointsDto[]) {
            if (lines !== undefined) { this.lines = lines; }
        }
        /**
         * The line objects to convert.
         * @default undefined
         */
        lines!: LinePointsDto[];
    }
    /**
     * Two lines and the rules for `line.lineLineIntersection`.
     */
    export class LineLineIntersectionDto {
        constructor(line1?: LinePointsDto, line2?: LinePointsDto, tolerance?: number) {
            if (line1 !== undefined) { this.line1 = line1; }
            if (line2 !== undefined) { this.line2 = line2; }
            if (tolerance !== undefined) { this.tolerance = tolerance; }
        }
        /**
         * The first line.
         * @default undefined
         */
        line1!: LinePointsDto;
        /**
         * The second line.
         * @default undefined
         */
        line2!: LinePointsDto;
        /**
         * When true, the crossing must lie within both segments; when false the lines are extended
         * without end.
         * @default true
         */ 
        checkSegmentsOnly?: boolean | undefined = true;
        /**
         * How close, in model units, two lines must come to count as meeting; also the distance
         * below which a line counts as having no length.
         * @default 0.01
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        tolerance?: number | undefined = 0.01;
    }
    /**
     * A line and a fraction along it for `line.getPointOnLine`.
     */
    export class PointOnLineDto {
        constructor(line?: LinePointsDto, param?: number) {
            if (line !== undefined) { this.line = line; }
            if (param !== undefined) { this.param = param; }
        }
        /**
         * The line to place the point on.
         * @default undefined
         */
        line!: LinePointsDto;
        /**
         * How far along the line, from 0 at the start to 1 at the end; values outside that range
         * continue past the ends.
         * @default 0.5
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        param?: number | undefined = 0.5;
    }
    /**
     * A line and the transformation `line.transformLine` applies to both its ends.
     */
    export class TransformLineDto {
        constructor(line?: LinePointsDto, transformation?: Base.TransformMatrixes) {
            if (line !== undefined) { this.line = line; }
            if (transformation !== undefined) { this.transformation = transformation; }
        }
        /**
         * The line to transform; a new line is returned.
         * @default undefined
         */
        line!: LinePointsDto;
        /**
         * A transformation matrix, or a list of them applied in order.
         * @default undefined
         */
        transformation!: Base.TransformMatrixes;
    }
    /**
     * Lines and one transformation per line for `line.transformsForLines`.
     */
    export class TransformsLinesDto {
        constructor(lines?: LinePointsDto[], transformation?: Base.TransformMatrixes[]) {
            if (lines !== undefined) { this.lines = lines; }
            if (transformation !== undefined) { this.transformation = transformation; }
        }
        /**
         * The lines to transform, as many as there are transformations.
         * @default undefined
         */
        lines!: LinePointsDto[];
        /**
         * One transformation per line, in the same order; each may be a matrix or a list of
         * matrices applied in order.
         * @default undefined
         */
        transformation!: Base.TransformMatrixes[];
    }
    /**
     * Lines and the one transformation applied to all of them.
     */
    export class TransformLinesDto {
        constructor(lines?: LinePointsDto[], transformation?: Base.TransformMatrixes) {
            if (lines !== undefined) { this.lines = lines; }
            if (transformation !== undefined) { this.transformation = transformation; }
        }
        /**
         * The lines to transform; the result keeps their order.
         * @default undefined
         */
        lines!: LinePointsDto[];
        /**
         * A transformation matrix, or a list of them applied in order, used for every line.
         * @default undefined
         */
        transformation!: Base.TransformMatrixes;
    }
}
