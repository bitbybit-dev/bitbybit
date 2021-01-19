import { Mesh } from '@babylonjs/core';

// tslint:disable-next-line: no-namespace
export namespace Point {
    export class PointDto {
        /**
         * Point
         */
        point: number[];
    }
    export class PointsDto {
        /**
         * Points
         */
        points: number[][];
    }
    export class DrawPointDto {
        /**
         * Provide options without default values
         */
        constructor(point?: number[]) {
            this.point = point;
        }
        /**
         * Point
         */
        point: number[];
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
         * Indicates wether the position of this point will change in time
         */
        updatable = false;
        /**
         * Point mesh variable in case it already exists and needs updating
         */
        pointMesh?: Mesh;
    }
    export class DrawPointsDto {
        /**
         * Provide options without default values
         */
        constructor(points?: number[][]) {
            this.points = points;
        }
        /**
         * Point
         */
        points: number[][];
        /**
         * Value between 0 and 1
         */
        opacity = 1;
        /**
         * Size of the points
         */
        size = 3;
        /**
         * Hex colour string
         */
        colour = '#444444';
        /**
         * Indicates wether the position of this point will change in time
         */
        updatable = false;
        /**
         * Points mesh variable in case it already exists and needs updating
         */
        pointsMesh?: Mesh;
    }
    export class TransformPointDto {
        /**
         * Point to transform
         */
        point: number[];
        /**
         * Transformation matrix or a list of transformation matrixes
         */
        matrix: number[][] | number[][][];
    }
    export class TransformPointsDto {
        /**
         * Points to transform
         */
        points: number[][];
        /**
         * Transformation matrix or a list of transformation matrixes
         */
        matrix: number[][] | number[][][];
    }
    export class ClosestPointFromPointsDto {
        /**
         * Points to transform
         */
        points: number[][];
        /**
         * Transformation matrix or a list of transformation matrixes
         */
        point: number[];
    }
    export class StartEndPointsDto {
        /**
         * Start point
         */
        startPoint: number[];
        /**
         * End point
         */
        endPoint: number[];
    }

    export class MultiplyPointDto {
        /**
         * Point for multiplication
         */
        point: number[];
        /**
         * Number of points to create in the list
         */
        amountOfPoints: number;
    }

    export class SpiralDto {
        /**
         * Identifies phi angle
         */
        phi = 0.9;
        /**
         * Identifies how many points will be created
         */
        numberPoints = 200;
        /**
         * Widening factor of the spiral
         */
        widening = 3;
        /**
         * Radius of the spiral
         */
        radius = 6;
        /**
         * Factor of the spiral
         */
        factor = 1;
    }
}
