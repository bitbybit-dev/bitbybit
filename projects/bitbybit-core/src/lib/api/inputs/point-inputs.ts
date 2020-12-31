import { Mesh } from "@babylonjs/core";

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
         * Point
         */
        point: number[];
        /**
         * Value between 0 and 1
         */
        opacity: number;
        /**
         * Size of the point
         */
        size: number;
        /**
         * Hex colour string
         */
        colour: string;
        /**
         * Indicates wether the position of this point will change in time
         */
        updatable: boolean;
        /**
         * Point mesh variable in case it already exists and needs updating
         */
        pointMesh: Mesh;
    }
    export class DrawPointsDto {
        /**
         * Point
         */
        points: number[][];
        /**
         * Value between 0 and 1
         */
        opacity: number;
        /**
         * Size of the point
         */
        size: number;
        /**
         * Hex colour string
         */
        colour: string;
        /**
         * Indicates wether the position of these points will change in time
         */
        updatable: boolean;
        /**
         * Points mesh variable in case it already exists and needs updating
         */
        pointsMesh: Mesh;
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
        phi: number;
        /**
         * Identifies how many points will be created
         */
        numberPoints: number;
        /**
         * Widening factor of the spiral
         */
        widening: number;
        /**
         * Radius of the spiral
         */
        radius: number;
        /**
         * Factor of the spiral
         */
        factor: number;
    }
}
