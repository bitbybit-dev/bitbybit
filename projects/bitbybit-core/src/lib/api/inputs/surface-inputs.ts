import { Mesh } from '@babylonjs/core';

// tslint:disable-next-line: no-namespace
export namespace Surface {
    export class SurfaceDto {
        /**
         * Nurbs surface
         */
        surface: any;
    }
    export class SurfaceTransformDto {
        /**
         * Nurbs surface
         */
        surface: any;
        /**
         * Transformations
         */
        matrix: number[][] | number[][][];
    }
    export class SurfaceParameterDto {
        /**
         * Nurbs surface
         */
        surface: any;
        /**
         * Parameter on the surface
         */
        parameter: number;
        /**
         * Default parameter is on U direction, use V to switch
         */
        useV: boolean;
    }
    export class IsocurvesParametersDto {
        /**
         * Nurbs surface
         */
        surface: any;
        /**
         * Parameter on the surface
         */
        parameters: number[];
        /**
         * Default parameter is on U direction, use V to switch
         */
        useV: boolean;
    }
    export class IsocurveSubdivisionDto {
        /**
         * Nurbs surface
         */
        surface: any;
        /**
         * Parameter on the surface
         */
        parameter: number;
        /**
         * Default parameter is on U direction, use V to switch
         */
        useV: boolean;
        /**
         * Check to include the last isocurve
         */
        includeLast = true;
        /**
         * Check to include the first isocurve
         */
        includeFirst = true;
        /**
         * Number of segments including surface start and end
         */
        isocurveSegments: number;
    }
    export class DerivativesDto {
        /**
         * Nurbs surface
         */
        surface: any;
        /**
         * U coordinate
         */
        u: number;
        /**
         * V coordinate
         */
        v: number;
        /**
         * Number of derivatives
         */
        numDerivatives: number;
    }
    export class SurfaceLocationDto {
        /**
         * Nurbs surface
         */
        surface: any;
        /**
         * U coordinate
         */
        u: number;
        /**
         * V coordinate
         */
        v: number;
    }
    export class CornersDto {
        /**
         * Corner 1
         */
        point1: number[];
        /**
         * Corner 2
         */
        point2: number[];
        /**
         * Corner 3
         */
        point3: number[];
        /**
         * Corner 4
         */
        point4: number[];
    }
    export class SurfaceParamDto {
        /**
         * Nurbs surface
         */
        surface: any;
        /**
         * Point
         */
        point: number[];
    }
    export class KnotsControlPointsWeightsDto {
        /**
         * U direction degree
         */
        degreeU: number;
        /**
         * V direction degree
         */
        degreeV: number;
        /**
         * U direction knots
         */
        knotsU: number[];
        /**
         * V direction knots
         */
        knotsV: number[];
        /**
         * Points
         */
        points: number[][];
        /**
         * Weights
         */
        weights: number[];
    }
    export class LoftCurvesDto {
        /**
         * V direction degree
         */
        degreeV: number;
        /**
         * Nurbs curves
         */
        curves: any[];
    }
    export class DrawSurfaceDto {
        /**
         * Nurbs surface
         */
        surface: any;
        /**
         * Value between 0 and 1
         */
        opacity = 1;
        /**
         * Hex colour string
         */
        colour = '#444444';
        /**
         * Indicates wether the position of this surface will change in time
         */
        updatable = false;
        /**
         * Surface mesh variable in case it already exists and needs updating
         */
        surfaceMesh?: Mesh;
    }
    export class DrawSurfacesDto {
        /**
         * Nurbs surfaces
         */
        surfaces: any[];
        /**
         * Value between 0 and 1
         */
        opacity = 1;
        /**
         * Hex colour string
         */
        colour = '#444444';
        /**
         * Indicates wether the position of these surfaces will change in time
         */
        updatable = false;
        /**
         * Surfaces mesh variable in case it already exists and needs updating
         */
        surfacesMesh?: Mesh;
    }
    export class DrawSurfacesColoursDto {
        /**
         * Nurbs surfaces
         */
        surfaces: any[];
        /**
         * Value between 0 and 1
         */
        opacity = 1;
        /**
         * Hex colour strings, there has to be a colour for every single surface and lengths of arrays need to match
         */
        colours: string[];
        /**
         * Indicates wether the position of these surfaces will change in time
         */
        updatable = false;
        /**
         * Surfaces mesh variable in case it already exists and needs updating
         */
        surfacesMesh?: Mesh;
    }
    export class ConeParametersDto {
        /**
         * Defines main axis of the cone
         */
        axis = [0, 1, 0];
        /**
         * X axis of the cone
         */
        xAxis = [1, 0, 0];
        /**
         * Base point for the cone
         */
        base = [0, 0, 0];
        /**
         * Height of the cone
         */
        height = 2;
        /**
         * Radius of the cone
         */
        radius = 1;
    }
    export class ConeDto {
        /**
         * Conical Nurbs surface
         */
        cone: any;
    }
}
