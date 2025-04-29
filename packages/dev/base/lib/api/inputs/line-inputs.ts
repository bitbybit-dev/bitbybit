import { Base } from "./base-inputs";

/* eslint-disable @typescript-eslint/no-namespace */

export namespace Line {
    export class LinePointsDto {
        /**
         * Provide options without default values
         */
        constructor(start?: Base.Point3, end?: Base.Point3) {
            if (start !== undefined) { this.start = start; }
            if (end !== undefined) { this.end = end; }
        }
        /**
         * Start point
         * @default undefined
         */
        start?: Base.Point3;
        /**
         * End point
         * @default undefined
         */
        end?: Base.Point3;
    }
    export class LineStartEndPointsDto {
        /**
         * Provide options without default values
         */
        constructor(startPoints?: Base.Point3[], endPoints?: Base.Point3[]) {
            if (startPoints !== undefined) { this.startPoints = startPoints; }
            if (endPoints !== undefined) { this.endPoints = endPoints; }
        }
        /**
         * Start points
         * @default undefined
         */
        startPoints: Base.Point3[];
        /**
         * End points
         * @default undefined
         */
        endPoints: Base.Point3[];
    }
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
         * Line
         * @default undefined
         */
        line?: LinePointsDto;
        /**
         * Value between 0 and 1
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        opacity? = 1;
        /**
         * Hex colour string
         * @default #444444
         */
        colours?: string | string[] = "#444444";
        /**
         * Width of the line
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size? = 3;
        /**
         * Indicates wether the position of this line will change in time
         * @default false
         */
        updatable? = false;
        /**
         * Line mesh variable in case it already exists and needs updating
         * @default undefined
         */
        lineMesh?: T;
    }
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
         * Lines
         * @default undefined
         */
        lines?: LinePointsDto[];
        /**
         * Value between 0 and 1
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        opacity? = 1;
        /**
         * Hex colour string
         * @default #444444
         */
        colours?: string | string[] = "#444444";
        /**
         * Width of the line
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size? = 3;
        /**
         * Indicates wether the position of these lines will change in time
         * @default false
         */
        updatable? = false;
        /**
         * Line mesh variable in case it already exists and needs updating
         * @default undefined
         */
        linesMesh?: T;
    }
    export class PointsLinesDto {
        constructor(points?: Base.Point3[]) {
            if (points !== undefined) { this.points = points; }
        }
        /**
         * Points
         * @default undefined
         */
        points?: Base.Point3[];
    }
    export class LineDto {
        constructor(line?: LinePointsDto) {
            if (line !== undefined) { this.line = line; }
        }
        /**
         * Line to convert
         * @default undefined
         */
        line?: LinePointsDto;
    }
    export class SegmentDto {
        constructor(segment?: Base.Segment3) {
            if (segment !== undefined) { this.segment = segment; }
        }
        /**
         * Segment
         * @default undefined
         */
        segment?: Base.Segment3;
    }
    export class SegmentsDto {
        constructor(segments?: Base.Segment3[]) {
            if (segments !== undefined) { this.segments = segments; }
        }
        /**
         * Segments
         * @default undefined
         */
        segments?: Base.Segment3[];
    }
    export class LinesDto {
        constructor(lines?: LinePointsDto[]) {
            if (lines !== undefined) { this.lines = lines; }
        }
        /**
         * Lines to convert
         * @default undefined
         */
        lines?: LinePointsDto[];
    }
    export class PointOnLineDto {
        constructor(line?: LinePointsDto, param?: number) {
            if (line !== undefined) { this.line = line; }
            if (param !== undefined) { this.param = param; }
        }
        /**
         * Line to get point on
         * @default undefined
         */
        line?: LinePointsDto;
        /**
         * Param to use for point on line
         * @default 0.5
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.1
         */
        param? = 0.5;
    }
    export class TransformLineDto {
        constructor(line?: LinePointsDto, transformation?: Base.TransformMatrixes) {
            if (line !== undefined) { this.line = line; }
            if (transformation !== undefined) { this.transformation = transformation; }
        }
        /**
         * Line to transform
         * @default undefined
         */
        line?: LinePointsDto;
        /**
         * Transformation matrix or a list of transformation matrixes
         * @default undefined
         */
        transformation?: Base.TransformMatrixes;
    }
    export class TransformsLinesDto {
        constructor(lines?: LinePointsDto[], transformation?: Base.TransformMatrixes[]) {
            if (lines !== undefined) { this.lines = lines; }
            if (transformation !== undefined) { this.transformation = transformation; }
        }
        /**
         * Lines to transform
         * @default undefined
         */
        lines?: LinePointsDto[];
        /**
         * Transformations matrix or a list of transformations matrixes
         * @default undefined
         */
        transformation?: Base.TransformMatrixes[];
    }
    export class TransformLinesDto {
        constructor(lines?: LinePointsDto[], transformation?: Base.TransformMatrixes) {
            if (lines !== undefined) { this.lines = lines; }
            if (transformation !== undefined) { this.transformation = transformation; }
        }
        /**
         * Lines to transform
         * @default undefined
         */
        lines?: LinePointsDto[];
        /**
         * Transformation matrix or a list of transformation matrixes
         * @default undefined
         */
        transformation?: Base.TransformMatrixes;
    }
}
