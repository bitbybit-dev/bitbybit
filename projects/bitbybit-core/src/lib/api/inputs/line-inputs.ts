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
