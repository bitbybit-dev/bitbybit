import { Mesh } from '@babylonjs/core';
import { Base } from './base-inputs';

// tslint:disable-next-line: no-namespace
export namespace Point {
    export class PointDto {
        /**
         * Point
         */
        point: Base.Point3;
    }
    export class PointsDto {
        /**
         * Points
         */
        points: Base.Point3[];
    }
    export class DrawPointDto {
        /**
         * Provide options without default values
         */
        constructor(point?: Base.Point3) {
            this.point = point;
        }
        /**
         * Point
         */
        point: Base.Point3;
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
        colours: string | string[] = '#444444';
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
        constructor(points?: Base.Point3[]) {
            this.points = points;
        }
        /**
         * Point
         */
        points: Base.Point3[];
        /**
         * Value between 0 and 1
         */
        opacity = 1;
        /**
         * Size of the points
         */
        size = 3;
        /**
         * Hex colour string or collection of strings
         */
        colours: string | string[] = '#444444';
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
        point: Base.Point3;
        /**
         * Transformation matrix or a list of transformation matrixes
         */
        matrix: number[][] | number[][][];
    }
    export class TransformPointsDto {
        /**
         * Points to transform
         */
        points: Base.Point3[];
        /**
         * Transformation matrix or a list of transformation matrixes
         */
        matrix: number[][] | number[][][];
    }
    export class TransformsForPointsDto {
        /**
         * Points to transform
         */
        points: Base.Point3[];
        /**
         * Transformations that have to match nr of points
         */
        matrix: number[][][] | number[][][][];
    }
    export class ClosestPointFromPointsDto {
        /**
         * Points to transform
         */
        points: Base.Point3[];
        /**
         * Transformation matrix or a list of transformation matrixes
         */
        point: Base.Point3;
    }
    export class StartEndPointsDto {
        /**
         * Start point
         */
        startPoint: Base.Point3;
        /**
         * End point
         */
        endPoint: Base.Point3;
    }

    export class MultiplyPointDto {
        /**
         * Point for multiplication
         */
        point: Base.Point3;
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

    export class HexGridCentersDto {
        /**
         * Number of hexagons on Y direction
         */
        nrHexagonsY: number;
        /**
         * Number of Hexagons on Z direction
         */
        nrHexagonsX: number;
        /**
         * Total grid span
         */
        radiusHexagon: number;
    }
}
