import { Mesh } from '@babylonjs/core';
import { Base } from './base-inputs';

// tslint:disable-next-line: no-namespace
export namespace Point {
    export class PointDto {
        /**
         * Point
         * @default undefined
         */
        point: Base.Point3;
    }
    export class PointXYZDto {
        /**
         * Point
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.5
         */
        x: number
        /**
         * Point
         * @default 0
         * @minimum -Infinity
         * @maximum Infinity
         * @step 0.5
         */
        y: number
        /**
        * Point
        * @default 0
        * @minimum -Infinity
        * @maximum Infinity
        * @step 0.5
        */
        z: number
    }
    export class PointsDto {
        /**
         * Points
         * @default undefined
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
         * @default undefined
         */
        point: Base.Point3;
        /**
         * Value between 0 and 1
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        opacity = 1;
        /**
         * Size of the point
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size = 3;
        /**
         * Hex colour string
         * @default #444444
         */
        colours: string | string[] = '#444444';
        /**
         * Indicates wether the position of this point will change in time
         * @default false
         */
        updatable = false;
        /**
         * Point mesh variable in case it already exists and needs updating
         * @default undefined
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
         * @default undefined
         */
        points: Base.Point3[];
        /**
         * Value between 0 and 1
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        opacity = 1;
        /**
         * Size of the points
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        size = 3;
        /**
         * Hex colour string or collection of strings
         * @default #444444
         */
        colours: string | string[] = '#444444';
        /**
         * Indicates wether the position of this point will change in time
         * @default false
         */
        updatable = false;
        /**
         * Points mesh variable in case it already exists and needs updating
         * @default undefined
         */
        pointsMesh?: Mesh;
    }
    export class TransformPointDto {
        /**
         * Point to transform
         * @default undefined
         */
        point: Base.Point3;
        /**
         * Transformation matrix or a list of transformation matrixes
         * @default undefined
         */
        matrix: number[][] | number[][][];
    }
    export class TransformPointsDto {
        /**
         * Points to transform
         * @default undefined
         */
        points: Base.Point3[];
        /**
         * Transformation matrix or a list of transformation matrixes
         * @default undefined
         */
        matrix: number[][] | number[][][];
    }
    export class TransformsForPointsDto {
        /**
         * Points to transform
         * @default undefined
         */
        points: Base.Point3[];
        /**
         * Transformations that have to match nr of points
         * @default undefined
         */
        matrix: number[][][] | number[][][][];
    }
    export class ClosestPointFromPointsDto {
        /**
         * Points to transform
         * @default undefined
         */
        points: Base.Point3[];
        /**
         * Transformation matrix or a list of transformation matrixes
         * @default undefined
         */
        point: Base.Point3;
    }
    export class StartEndPointsDto {
        /**
         * Start point
         * @default undefined
         */
        startPoint: Base.Point3;
        /**
         * End point
         * @default undefined
         */
        endPoint: Base.Point3;
    }

    export class MultiplyPointDto {
        /**
         * Point for multiplication
         * @default undefined
         */
        point: Base.Point3;
        /**
         * Number of points to create in the list
         * @default undefined
         */
        amountOfPoints: number;
    }

    export class SpiralDto {
        /**
         * Identifies phi angle
         * @default 0.9
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        phi = 0.9;
        /**
         * Identifies how many points will be created
         * @default 200
         * @minimum 0
         * @maximum Infinity
         * @step 10
         */
        numberPoints = 200;
        /**
         * Widening factor of the spiral
         * @default 3
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        widening = 3;
        /**
         * Radius of the spiral
         * @default 6
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radius = 6;
        /**
         * Factor of the spiral
         * @default 1
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        factor = 1;
    }

    export class HexGridCentersDto {
        /**
         * Number of hexagons on Y direction
         * @default 20
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        nrHexagonsY: number = 20;
        /**
         * Number of Hexagons on Z direction
         * @default 20
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        nrHexagonsX: number = 20;
        /**
         * radius of a single hexagon
         * @default 0.2
         * @minimum 0
         * @maximum Infinity
         * @step 0.1
         */
        radiusHexagon: number;
    }
}
