import { LinesMesh } from "@babylonjs/core";
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
         */
        start: Base.Point3;
        /**
         * End point
         */
        end: Base.Point3;
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
         */
        startPoints: Base.Point3[];
        /**
         * End points
         */
        endPoints: Base.Point3[];
    }
    export class DrawLineDto {
        /**
         * Provide options without default values
         */
        constructor(line?: LinePointsDto, opacity?: number, colours?: string | string[], size?: number, updatable?: boolean, lineMesh?: LinesMesh) {
            if (line !== undefined) { this.line = line; }
            if (opacity !== undefined) { this.opacity = opacity; }
            if (colours !== undefined) { this.colours = colours; }
            if (size !== undefined) { this.size = size; }
            if (updatable !== undefined) { this.updatable = updatable; }
            if (lineMesh !== undefined) { this.lineMesh = lineMesh; }
        }
        /**
         * Line
         */
        line: LinePointsDto;
        /**
         * Value between 0 and 1
         */
        opacity = 1;
        /**
         * Hex colour string
         */
        colours: string | string[] = "#444444";
        /**
         * Width of the line
         */
        size = 3;
        /**
         * Indicates wether the position of this line will change in time
         */
        updatable = false;
        /**
         * Line mesh variable in case it already exists and needs updating
         */
        lineMesh?: LinesMesh;
    }
    export class DrawLinesDto {

        /**
         * Provide options without default values
         */
        constructor(lines?: LinePointsDto[], opacity?: number, colours?: string | string[], size?: number, updatable?: boolean, linesMesh?: LinesMesh) {
            if (lines !== undefined) { this.lines = lines; }
            if (opacity !== undefined) { this.opacity = opacity; }
            if (colours !== undefined) { this.colours = colours; }
            if (size !== undefined) { this.size = size; }
            if (updatable !== undefined) { this.updatable = updatable; }
            if (linesMesh !== undefined) { this.linesMesh = linesMesh; }
        }
        /**
         * Lines
         */
        lines: LinePointsDto[];
        /**
         * Value between 0 and 1
         */
        opacity = 1;
        /**
         * Hex colour string
         */
        colours: string | string[] = "#444444";
        /**
         * Width of the line
         */
        size = 3;
        /**
         * Indicates wether the position of these lines will change in time
         */
        updatable = false;
        /**
         * Line mesh variable in case it already exists and needs updating
         */
        linesMesh?: LinesMesh;
    }
    export class PointsLinesDto {
        constructor(points?: Base.Point3[]) {
            if (points !== undefined) { this.points = points; }
        }
        /**
         * Points
         */
        points: Base.Point3[];
    }
    export class LineDto {
        constructor(line?: LinePointsDto) {
            if (line !== undefined) { this.line = line; }
        }
        /**
         * Line to convert
         */
        line: LinePointsDto;
    }
    export class LinesDto {
        constructor(lines?: LinePointsDto[]) {
            if (lines !== undefined) { this.lines = lines; }
        }
        /**
         * Lines to convert
         */
        lines: LinePointsDto[];
    }
    export class PointOnLineDto {
        constructor(line?: LinePointsDto, param?: number) {
            if (line !== undefined) { this.line = line; }
            if (param !== undefined) { this.param = param; }
        }
        /**
         * Line to get point on
         */
        line: LinePointsDto;
        /**
         * Param to use for point on line
         */
        param: number;
    }
    export class TransformLineDto {
        constructor(line?: LinePointsDto, transformation?: Base.TransformMatrixes) {
            if (line !== undefined) { this.line = line; }
            if (transformation !== undefined) { this.transformation = transformation; }
        }
        /**
         * Line to transform
         */
        line: LinePointsDto;
        /**
         * Transformation matrix or a list of transformation matrixes
         */
        transformation: Base.TransformMatrixes;
    }
    export class TransformsLinesDto {
        constructor(lines?: LinePointsDto[], transformation?: Base.TransformMatrixes[]) {
            if (lines !== undefined) { this.lines = lines; }
            if (transformation !== undefined) { this.transformation = transformation; }
        }
        /**
         * Lines to transform
         */
        lines: LinePointsDto[];
        /**
         * Transformations matrix or a list of transformations matrixes
         */
        transformation: Base.TransformMatrixes[];
    }
    export class TransformLinesDto {
        constructor(lines?: LinePointsDto[], transformation?: Base.TransformMatrixes) {
            if (lines !== undefined) { this.lines = lines; }
            if (transformation !== undefined) { this.transformation = transformation; }
        }
        /**
         * Lines to transform
         */
        lines: LinePointsDto[];
        /**
         * Transformation matrix or a list of transformation matrixes
         */
        transformation: Base.TransformMatrixes;
    }
}
