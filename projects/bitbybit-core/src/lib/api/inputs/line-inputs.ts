import { LinesMesh } from '@babylonjs/core';

// tslint:disable-next-line: no-namespace
export namespace Line {
    export class LinePointsDto {
        /**
         * Provide options without default values
         */
        constructor(start?: number[], end?: number[]) {
            this.start = start;
            this.end = end;
        }
        /**
         * Start point
         */
        start: number[];
        /**
         * End point
         */
        end: number[];
    }
    export class LineStartEndPointsDto {
        /**
         * Provide options without default values
         */
        constructor(startPoints?: number[][], endPoints?: number[][]) {
            this.startPoints = startPoints;
            this.endPoints = endPoints;
        }
        /**
         * Start points
         */
        startPoints: number[][];
        /**
         * End points
         */
        endPoints: number[][];
    }
    export class DrawLineDto {
        /**
         * Provide options without default values
         */
        constructor(line?: LinePointsDto) {
            this.line = line;
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
        colour = '#444444';
        /**
         * Width of the line
         */
        width = 3;
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
        constructor(lines?: LinePointsDto[]) {
            this.lines = lines;
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
        colour = '#444444';
        /**
         * Width of the line
         */
        width = 3;
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
        /**
         * Points
         */
        points: number[][];
    }
    export class LineDto {
        /**
         * Line to convert
         */
        line: LinePointsDto;
    }
    export class LinesDto {
        /**
         * Lines to convert
         */
        lines: LinePointsDto[];
    }
    export class TransformLineDto {
        /**
         * Line to transform
         */
        line: LinePointsDto;
        /**
         * Transformation matrix or a list of transformation matrixes
         */
        matrix: number[][] | number[][][];
    }
    export class TransformLinesDto {
        /**
         * Lines to transform
         */
        lines: LinePointsDto[];
        /**
         * Transformation matrix or a list of transformation matrixes
         */
        matrix: number[][] | number[][][];
    }
}
