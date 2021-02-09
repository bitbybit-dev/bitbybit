import { LinesMesh, Mesh } from '@babylonjs/core';
import { BaseTypes } from '../bitbybit/base-types';

// tslint:disable-next-line: no-namespace
export namespace Verb {

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
         * Provide options without default values
         */
        constructor(curve?: any) {
            this.curve = curve;
        }
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
         * Indicates wether the position of this curve will change in time
         */
        updatable = false;
        /**
         * Curve mesh variable in case it already exists and needs updating
         */
        curveMesh?: LinesMesh;
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
         * Provide options without default values
         */
        constructor(curves?: any[]) {
            this.curves = curves;
        }
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
        curvesMesh?: LinesMesh;
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
         * Provide undefined options
         */
        constructor(surface?: any, isocurveSegments?: number) {
            this.surface = surface;
            this.isocurveSegments = isocurveSegments;
        }
        /**
         * Nurbs surface
         */
        surface: any;
        /**
         * Default parameter is on U direction, use V to switch
         */
        useV = false;
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
         * Provide options without default values
         */
        constructor(surface?: any) {
            this.surface = surface;
        }
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
         * Provide options without default values
         */
        constructor(surfaces?: any[]) {
            this.surfaces = surfaces;
        }
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
         * Provide options without default values
         */
        constructor(surfaces?: any[], colours?: string[]) {
            this.surfaces = surfaces;
            this.colours = colours;
        }
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
    export class ConeAndCylinderParametersDto {
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
    export class CylinderDto {
        /**
         * Cylindrical Nurbs surface
         */
        cylinder: any;
    }
    export class ExtrusionParametersDto {
        /**
         * Profile Nurbs curve
         */
        profile: any;
        /**
         * Direction vector
         */
        direction: number[];
    }
    export class ExtrusionDto {
        /**
         * Nurbs surface created through extrusion
         */
        extrusion: any;
    }
    export class SphericalParametersDto {
        /**
         * Radius of the sphere
         */
        radius: any;
        /**
         * Center point
         */
        center: number[];
    }
    export class SphereDto {
        /**
         * Spherical Nurbs surface
         */
        sphere: any;
    }
    export class RevolutionParametersDto {
        /**
         * Profile Nurbs curve
         */
        profile: any;
        /**
         * Center point
         */
        center: number[];
        /**
         * Axis around which rotation will happen
         */
        axis: number[];
        /**
         * Angle at which to rotate in degrees
         */
        angle: number;
    }
    export class RevolutionDto {
        /**
         * Revolved Nurbs surface
         */
        revolution: any;
    }
    export class SweepParametersDto {
        /**
         * Profile Nurbs curve
         */
        profile: any;
        /**
         * Rail Nurbs curve
         */
        rail: any;
    }
    export class SweepDto {
        /**
         * Revolved Nurbs surface
         */
        sweep: any;
    }
    export class CurveCurveDto {
        /**
         * First Nurbs curve
         */
        firstCurve: any;
        /**
         * Second Nurbs curve
         */
        secondCurve: number[];
        /**
         * Optional tolerance parameter
         */
        tolerance?: number;
    }
    export class CurveSurfaceDto {
        /**
         * Nurbs curve
         */
        curve: any;
        /**
         * Nurbs surface
         */
        surface: any;
        /**
         * Optional tolerance parameter
         */
        tolerance?: number;
    }
    export class SurfaceSurfaceDto {
        /**
         * Nurbs curve
         */
        firstSurface: any;
        /**
         * Nurbs surface
         */
        secondSurface: any;
        /**
         * Optional tolerance parameter
         */
        tolerance?: number;
    }
    export class CurveCurveIntersectionsDto {
        /**
         * Curve curve intersections
         */
        intersections: BaseTypes.CurveCurveIntersection[];
    }
    export class CurveSurfaceIntersectionsDto {
        /**
         * Curve curve intersections
         */
        intersections: BaseTypes.CurveSurfaceIntersection[];
    }
}
