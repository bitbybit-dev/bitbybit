import { LinesMesh } from "@babylonjs/core";
import { Base } from "./base-inputs";

/* eslint-disable @typescript-eslint/no-namespace */

export namespace Line {
    export class LinePointsDto {
        /**
         * Provide options without default values
         */
        constructor(start?: Base.Point3, end?: Base.Point3) {
            this.start = start;
            this.end = end;
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
            this.startPoints = startPoints;
            this.endPoints = endPoints;
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
        /**
         * Points
         */
        points: Base.Point3[];
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
    export class PointOnLineDto {
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
