import { LinesMesh, Mesh } from "@babylonjs/core";

// tslint:disable-next-line: no-namespace
export namespace Line {
    export class LinePointsDto {
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
         * Point
         */
        line: LinePointsDto;
        /**
         * Value between 0 and 1
         */
        opacity = 1;
        /**
         * Size of the point
         */
        size = 3;
        /**
         * Hex colour string
         */
        colour = '#444444';
        /**
         * Width of the line
         */
        width: 2;
        /**
         * Indicates wether the position of this point will change in time
         */
        updatable = false;
        /**
         * Point mesh variable in case it already exists and needs updating
         */
        lineMesh: LinesMesh;
    }
    export class DrawLinesDto {
        /**
         * Point
         */
        lines: LinePointsDto[];
        /**
         * Value between 0 and 1
         */
        opacity = 1;
        /**
         * Size of the point
         */
        size = 3;
        /**
         * Hex colour string
         */
        colour = '#444444';
        /**
         * Width of the line
         */
        width: 2;
        /**
         * Indicates wether the position of this point will change in time
         */
        updatable = false;
        /**
         * Point mesh variable in case it already exists and needs updating
         */
        linesMesh: LinesMesh;
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
