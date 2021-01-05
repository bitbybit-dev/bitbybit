import { LinesMesh } from '@babylonjs/core';

// tslint:disable-next-line: no-namespace
export namespace Curve {
    export class CurveDto {
        /**
         * Nurbs curve
         */
        curve: any;
    }
    export class CurvesDto {
        /**
         * Nurbs curves
         */
        curves: any[];
    }
    export class ClosestPointDto {
        /**
         * Nurbs curve
         */
        curve: any;
        /**
         * Point
         */
        point: number[];
    }
    export class ClosestPointsDto {
        /**
         * Nurbs curve
         */
        curve: any;
        /**
         * Points
         */
        points: number[][];
    }
    export class BezierCurveDto {
        /**
         * Control points
         */
        points: number[][];
        /**
         * Weights
         */
        weights: number[];
    }
    export class DrawCurveDto {
        /**
         * Nurbs curve
         */
        curve: any;
        /**
         * Value between 0 and 1
         */
        opacity = 1;
        /**
         * Hex colour string
         */
        colour = '#444444';
        /**
         * Width of the polyline
         */
        width = 3;
        /**
         * Indicates wether the position of this polyline will change in time
         */
        updatable = false;
        /**
         * Curve mesh variable in case it already exists and needs updating
         */
        curveMesh: LinesMesh;
    }

    export class CurveParameterDto {
        /**
         * Nurbs curve
         */
        curve: any;
        /**
         * Parameter on the curve
         */
        parameter: number;
    }
    export class CurvesParameterDto {
        /**
         * Nurbs curve
         */
        curves: any;
        /**
         * Parameter on the curve
         */
        parameter: number;
    }
    export class CurveTransformDto {
        /**
         * Nurbs curve
         */
        curve: any;
        /**
         * Transformation matrixes
         */
        matrix: number[][] | number[][][];
    }
    export class CurvesTransformDto {
        /**
         * Nurbs curve
         */
        curves: any[];
        /**
         * Transformation matrixes
         */
        matrix: number[][] | number[][][];
    }
    export class CurveToleranceDto {
        /**
         * Nurbs curve
         */
        curve: any;
        /**
         * Optional tolerance
         */
        tolerance: number;
    }

    export class CurveLengthToleranceDto {
        /**
         * Nurbs curve
         */
        curve: any;
        /**
         * Length on the curve
         */
        length: number;
        /**
         * Tolerance
         */
        tolerance: number;
    }
    export class CurveDerivativesDto {
        /**
         * Nurbs curve
         */
        curve: any;
        /**
         * Number of derivatives
         */
        numDerivatives: number;
        /**
         * Parameter on the curve
         */
        parameter: number;
    }
    export class CurveSubdivisionsDto {
        /**
         * Nurbs curve
         */
        curve: any;
        /**
         * Number of subdivisions
         */
        subdivision: number;
    }
    export class CurvesSubdivisionsDto {
        /**
         * Nurbs curves
         */
        curves: any[];
        /**
         * Number of subdivisions
         */
        subdivision: number;
    }
    export class CurvesDivideLengthDto {
        /**
         * Nurbs curves
         */
        curves: any[];
        /**
         * Length of subdivisions
         */
        length: number;
    }
    export class CurveDivideLengthDto {
        /**
         * Nurbs curve
         */
        curve: any;
        /**
         * Length of subdivisions
         */
        length: number;
    }
    export class DrawCurvesDto {
        /**
         * Nurbs curves
         */
        curves: any[];
        /**
         * Value between 0 and 1
         */
        opacity = 1;
        /**
         * Hex colour string
         */
        colour = '#444444';
        /**
         * Width of the polyline
         */
        width = 3;
        /**
         * Indicates wether the position of this polyline will change in time
         */
        updatable = false;
        /**
         * Curve mesh variable in case it already exists and needs updating
         */
        curveMesh: LinesMesh;
    }
    export class CurveNurbsDataDto {
        /**
         * Nurbs curve degree
         */
        degree: number;
        /**
         * Weights that identify strength that attracts curve to control points
         */
        weights: number[];
        /**
         * Knots of the Nurbs curve
         */
        knots: number[];
        /**
         * Control points of the nurbs curve
         */
        points: number[][];
    }
    export class CurvePathDataDto {
        /**
         * Nurbs curve degree
         */
        degree: number;
        /**
         * Control points of the nurbs curve
         */
        points: number[][];
    }
    export class EllipseDto {
        /**
         * Nurbs ellipse
         */
        ellipse: any;
    }
    export class CircleDto {
        /**
         * Nurbs circle
         */
        circle: any;
    }
    export class ArcDto {
        /**
         * Nurbs arc
         */
        arc: any;
    }
    export class EllipseParametersDto {
        /**
         * X axis of the circle
         */
        xAxis: number[];
        /**
         * Y axis of the circle
         */
        yAxis: number[];
        /**
         * Center of the circle
         */
        center: number[];
    }
    export class CircleParametersDto {
        /**
         * X axis of the circle
         */
        xAxis: number[];
        /**
         * Y axis of the circle
         */
        yAxis: number[];
        /**
         * Radius of the circle
         */
        radius: number;
        /**
         * Center of the circle
         */
        center: number[];
    }
    export class ArcParametersDto extends CircleParametersDto {
        /**
         * Minimum angle in degrees
         */
        minAngle: number;
        /**
         * Maximum angle in degrees
         */
        maxAngle: number;
    }
    export class EllipseArcParametersDto extends EllipseParametersDto {
        /**
         * Minimum angle in degrees
         */
        minAngle: number;
        /**
         * Maximum angle in degrees
         */
        maxAngle: number;
    }
}
