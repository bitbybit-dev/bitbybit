import { simplifyDeclaration } from '../simplify-declaration';

export const pointInputsString = simplifyDeclaration(`
import { Mesh } from '@babylonjs/core';
export declare namespace Point {
    class PointDto {
        /**
         * Point
         */
        point: number[];
    }
    class PointsDto {
        /**
         * Points
         */
        points: number[][];
    }
    class DrawPointDto {
        /**
         * Provide options without default values
         */
        constructor(point?: number[]);
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
        pointMesh?: Mesh;
    }
    class DrawPointsDto {
        /**
         * Provide options without default values
         */
        constructor(points?: number[][]);
        /**
         * Point
         */
        points: number[][];
        /**
         * Value between 0 and 1
         */
        opacity: number;
        /**
         * Size of the points
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
         * Points mesh variable in case it already exists and needs updating
         */
        pointsMesh?: Mesh;
    }
    class TransformPointDto {
        /**
         * Point to transform
         */
        point: number[];
        /**
         * Transformation matrix or a list of transformation matrixes
         */
        matrix: number[][] | number[][][];
    }
    class TransformPointsDto {
        /**
         * Points to transform
         */
        points: number[][];
        /**
         * Transformation matrix or a list of transformation matrixes
         */
        matrix: number[][] | number[][][];
    }
    class ClosestPointFromPointsDto {
        /**
         * Points to transform
         */
        points: number[][];
        /**
         * Transformation matrix or a list of transformation matrixes
         */
        point: number[];
    }
    class StartEndPointsDto {
        /**
         * Start point
         */
        startPoint: number[];
        /**
         * End point
         */
        endPoint: number[];
    }
    class MultiplyPointDto {
        /**
         * Point for multiplication
         */
        point: number[];
        /**
         * Number of points to create in the list
         */
        amountOfPoints: number;
    }
    class SpiralDto {
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
    class HexGridCentersDto {
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

`);
