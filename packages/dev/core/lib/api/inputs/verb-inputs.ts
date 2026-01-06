/* eslint-disable @typescript-eslint/no-namespace */

import { BaseTypes } from "../bitbybit/base-types";
import { Base } from "./base-inputs";

export namespace Verb {

    export class CurveDto {
        constructor(curve?: any) {
            if (curve !== undefined) { this.curve = curve; }
        }
        /**
         * Nurbs curve
         */
        curve: any;
    }
    export class LineDto {
        constructor(line?: Base.Line3) {
            if (line !== undefined) { this.line = line; }
        }
        /**
         * Basic line
         */
        line: Base.Line3;
    }
    export class LinesDto {
        constructor(lines?: Base.Line3[]) {
            if (lines !== undefined) { this.lines = lines; }
        }
        /**
         * Basic lines
         */
        lines: Base.Line3[];
    }
    export class PolylineDto {
        constructor(polyline?: Base.Polyline3) {
            if (polyline !== undefined) { this.polyline = polyline; }
        }
        /**
         * Basic polyline
         */
        polyline: Base.Polyline3;
    }
    export class PolylinesDto {
        constructor(polylines?: Base.Polyline3[]) {
            if (polylines !== undefined) { this.polylines = polylines; }
        }
        /**
         * Basic polyline
         */
        polylines: Base.Polyline3[];
    }
    export class CurvesDto {
        constructor(curves?: any[]) {
            if (curves !== undefined) { this.curves = curves; }
        }
        /**
         * Nurbs curves
         */
        curves: any[];
    }
    export class ClosestPointDto {
        constructor(curve?: any, point?: Base.Point3) {
            if (curve !== undefined) { this.curve = curve; }
            if (point !== undefined) { this.point = point; }
        }
        /**
         * Nurbs curve
         */
        curve: any;
        /**
         * Point
         */
        point: Base.Point3;
    }
    export class ClosestPointsDto {
        constructor(curve?: any, points?: Base.Point3[]) {
            if (curve !== undefined) { this.curve = curve; }
            if (points !== undefined) { this.points = points; }
        }

        /**
         * Nurbs curve
         */
        curve: any;
        /**
         * Points
         */
        points: Base.Point3[];
    }
    export class BezierCurveDto {
        constructor(points?: Base.Point3[], weights?: number[]) {
            if (points !== undefined) { this.points = points; }
            if (weights !== undefined) { this.weights = weights; }
        }
        /**
         * Control points
         */
        points: Base.Point3[];
        /**
         * Weights
         */
        weights: number[];
    }
    export class DrawCurveDto<T> {
        /**
         * Provide options without default values
         */
        constructor(curve?: any, opacity?: number, colours?: string | string[], size?: number, updatable?: boolean, curveMesh?: T) {
            if (curve !== undefined) { this.curve = curve; }
            if (opacity !== undefined) { this.opacity = opacity; }
            if (colours !== undefined) { this.colours = colours; }
            if (size !== undefined) { this.size = size; }
            if (updatable !== undefined) { this.updatable = updatable; }
            if (curveMesh !== undefined) { this.curveMesh = curveMesh; }
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
        colours: string | string[] = "#444444";
        /**
         * Width of the polyline
         */
        size = 3;
        /**
         * Indicates wether the position of this curve will change in time
         */
        updatable = false;
        /**
         * Curve mesh variable in case it already exists and needs updating
         */
        curveMesh?: T;
    }
    export class CurveParameterDto {
        constructor(curve?: any, parameter?: number) {
            if (curve !== undefined) { this.curve = curve; }
            if (parameter !== undefined) { this.parameter = parameter; }
        }
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
        constructor(curves?: any[], parameter?: number) {
            if (curves !== undefined) { this.curves = curves; }
            if (parameter !== undefined) { this.parameter = parameter; }
        }
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
        constructor(curve?: any, transformation?: Base.TransformMatrixes) {
            if (curve !== undefined) { this.curve = curve; }
            if (transformation !== undefined) { this.transformation = transformation; }
        }
        /**
         * Nurbs curve
         */
        curve: any;
        /**
         * Transformation matrixes
         */
        transformation: Base.TransformMatrixes;
    }
    export class CurvesTransformDto {
        constructor(curves?: any[], transformation?: Base.TransformMatrixes) {
            if (curves !== undefined) { this.curves = curves; }
            if (transformation !== undefined) { this.transformation = transformation; }
        }
        /**
         * Nurbs curve
         */
        curves: any[];
        /**
         * Transformation matrixes
         */
        transformation: Base.TransformMatrixes;
    }
    export class CurveToleranceDto {
        constructor(curve?: any, tolerance?: number) {
            if (curve !== undefined) { this.curve = curve; }
            if (tolerance !== undefined) { this.tolerance = tolerance; }
        }
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
        constructor(curve?: any, length?: number, tolerance?: number) {
            if (curve !== undefined) { this.curve = curve; }
            if (length !== undefined) { this.length = length; }
            if (tolerance !== undefined) { this.tolerance = tolerance; }
        }
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
        constructor(curve?: any, parameter?: number, numDerivatives?: number) {
            if (curve !== undefined) { this.curve = curve; }
            if (parameter !== undefined) { this.parameter = parameter; }
            if (numDerivatives !== undefined) { this.numDerivatives = numDerivatives; }
        }
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
        constructor(curve?: any, subdivision?: number) {
            if (curve !== undefined) { this.curve = curve; }
            if (subdivision !== undefined) { this.subdivision = subdivision; }
        }
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
        constructor(curves?: any[], subdivision?: number) {
            if (curves !== undefined) { this.curves = curves; }
            if (subdivision !== undefined) { this.subdivision = subdivision; }
        }
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
        constructor(curves?: any[], length?: number) {
            if (curves !== undefined) { this.curves = curves; }
            if (length !== undefined) { this.length = length; }
        }
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
        constructor(curve?: any, length?: number) {
            if (curve !== undefined) { this.curve = curve; }
            if (length !== undefined) { this.length = length; }
        }
        /**
         * Nurbs curve
         */
        curve: any;
        /**
         * Length of subdivisions
         */
        length: number;
    }
    export class DrawCurvesDto<T> {
        /**
         * Provide options without default values
         */
        constructor(curves?: any[], opacity?: number, colours?: string | string[], size?: number, updatable?: boolean, curvesMesh?: T) {
            if (curves !== undefined) { this.curves = curves; }
            if (opacity !== undefined) { this.opacity = opacity; }
            if (colours !== undefined) { this.colours = colours; }
            if (size !== undefined) { this.size = size; }
            if (updatable !== undefined) { this.updatable = updatable; }
            if (curvesMesh !== undefined) { this.curvesMesh = curvesMesh; }
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
        colours: string | string[] = "#444444";
        /**
         * Width of the polyline
         */
        size = 3;
        /**
         * Indicates wether the position of this polyline will change in time
         */
        updatable = false;
        /**
         * Curve mesh variable in case it already exists and needs updating
         */
        curvesMesh?: T;
    }
    export class CurveNurbsDataDto {
        constructor(degree?: number, weights?: number[], knots?: number[], points?: Base.Point3[]) {
            if (degree !== undefined) { this.degree = degree; }
            if (weights !== undefined) { this.weights = weights; }
            if (knots !== undefined) { this.knots = knots; }
            if (points !== undefined) { this.points = points; }
        }
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
        points: Base.Point3[];
    }
    export class CurvePathDataDto {
        constructor(degree?: number, points?: Base.Point3[]) {
            if (degree !== undefined) { this.degree = degree; }
            if (points !== undefined) { this.points = points; }
        }
        /**
         * Nurbs curve degree
         */
        degree: number;
        /**
         * Control points of the nurbs curve
         */
        points: Base.Point3[];
    }
    export class EllipseDto {
        constructor(ellipse?: any) {
            if (ellipse !== undefined) { this.ellipse = ellipse; }
        }
        /**
         * Nurbs ellipse
         */
        ellipse: any;
    }
    export class CircleDto {
        constructor(circle?: any) {
            if (circle !== undefined) { this.circle = circle; }
        }
        /**
         * Nurbs circle
         */
        circle: any;
    }
    export class ArcDto {
        constructor(arc?: any) {
            if (arc !== undefined) { this.arc = arc; }
        }
        /**
         * Nurbs arc
         */
        arc: any;
    }
    export class EllipseParametersDto {
        constructor(xAxis?: Base.Vector3, yAxis?: Base.Vector3, center?: Base.Point3) {
            if (xAxis !== undefined) { this.xAxis = xAxis; }
            if (yAxis !== undefined) { this.yAxis = yAxis; }
            if (center !== undefined) { this.center = center; }
        }
        /**
         * X axis of the circle
         */
        xAxis: Base.Vector3;
        /**
         * Y axis of the circle
         */
        yAxis: Base.Vector3;
        /**
         * Center of the circle
         */
        center: Base.Point3;
    }
    export class CircleParametersDto {
        constructor(xAxis?: Base.Vector3, yAxis?: Base.Vector3, radius?: number, center?: Base.Point3) {
            if (xAxis !== undefined) { this.xAxis = xAxis; }
            if (yAxis !== undefined) { this.yAxis = yAxis; }
            if (radius !== undefined) { this.radius = radius; }
            if (center !== undefined) { this.center = center; }
        }
        /**
         * X axis of the circle
         */
        xAxis: Base.Vector3;
        /**
         * Y axis of the circle
         */
        yAxis: Base.Vector3;
        /**
         * Radius of the circle
         */
        radius: number;
        /**
         * Center of the circle
         */
        center: Base.Point3;
    }
    export class ArcParametersDto {
        constructor(minAngle?: number, maxAngle?: number, xAxis?: Base.Vector3, yAxis?: Base.Vector3, radius?: number, center?: Base.Point3) {
            if (minAngle !== undefined) { this.minAngle = minAngle; }
            if (maxAngle !== undefined) { this.maxAngle = maxAngle; }
            if (xAxis !== undefined) { this.xAxis = xAxis; }
            if (yAxis !== undefined) { this.yAxis = yAxis; }
            if (radius !== undefined) { this.radius = radius; }
            if (center !== undefined) { this.center = center; }
        }
        /**
         * Minimum angle in degrees
         */
        minAngle: number;
        /**
         * Maximum angle in degrees
         */
        maxAngle: number;
        /**
         * X axis of the circle
         */
        xAxis: Base.Vector3;
        /**
         * Y axis of the circle
         */
        yAxis: Base.Vector3;
        /**
         * Radius of the circle
         */
        radius: number;
        /**
         * Center of the circle
         */
        center: Base.Point3;
    }
    export class EllipseArcParametersDto {
        constructor(minAngle?: number, maxAngle?: number, xAxis?: Base.Vector3, yAxis?: Base.Vector3, center?: Base.Point3) {
            if (minAngle !== undefined) { this.minAngle = minAngle; }
            if (maxAngle !== undefined) { this.maxAngle = maxAngle; }
            if (xAxis !== undefined) { this.xAxis = xAxis; }
            if (yAxis !== undefined) { this.yAxis = yAxis; }
            if (center !== undefined) { this.center = center; }
        }
        /**
         * Minimum angle in degrees
         */
        minAngle: number;
        /**
         * Maximum angle in degrees
         */
        maxAngle: number;
        /**
         * X axis of the circle
         */
        xAxis: Base.Vector3;
        /**
         * Y axis of the circle
         */
        yAxis: Base.Vector3;
        /**
         * Center of the circle
         */
        center: Base.Point3;
    }
    export class SurfaceDto {
        constructor(surface?: any) {
            if (surface !== undefined) { this.surface = surface; }
        }
        /**
         * Nurbs surface
         */
        surface: any;
    }
    export class SurfaceTransformDto {
        constructor(surface?: any, transformation?: Base.TransformMatrixes) {
            if (surface !== undefined) { this.surface = surface; }
            if (transformation !== undefined) { this.transformation = transformation; }
        }
        /**
         * Nurbs surface
         */
        surface: any;
        /**
         * Transformations
         */
        transformation: Base.TransformMatrixes;
    }
    export class SurfaceParameterDto {
        constructor(surface?: any, parameter?: number, useV?: boolean) {
            if (surface !== undefined) { this.surface = surface; }
            if (parameter !== undefined) { this.parameter = parameter; }
            if (useV !== undefined) { this.useV = useV; }
        }
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
        constructor(surface?: any, parameters?: number[], useV?: boolean) {
            if (surface !== undefined) { this.surface = surface; }
            if (parameters !== undefined) { this.parameters = parameters; }
            if (useV !== undefined) { this.useV = useV; }
        }
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
        constructor(surface?: any, useV?: boolean, includeLast?: boolean, includeFirst?: boolean, isocurveSegments?: number) {
            if (surface !== undefined) { this.surface = surface; }
            if (useV !== undefined) { this.useV = useV; }
            if (includeLast !== undefined) { this.includeLast = includeLast; }
            if (includeFirst !== undefined) { this.includeFirst = includeFirst; }
            if (isocurveSegments !== undefined) { this.isocurveSegments = isocurveSegments; }
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
        constructor(surface?: any, u?: number, v?: number, numDerivatives?: number) {
            if (surface !== undefined) { this.surface = surface; }
            if (u !== undefined) { this.u = u; }
            if (v !== undefined) { this.v = v; }
            if (numDerivatives !== undefined) { this.numDerivatives = numDerivatives; }
        }
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
        constructor(surface?: any, u?: number, v?: number) {
            if (surface !== undefined) { this.surface = surface; }
            if (u !== undefined) { this.u = u; }
            if (v !== undefined) { this.v = v; }
        }
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
        constructor(point1?: Base.Point3, point2?: Base.Point3, point3?: Base.Point3, point4?: Base.Point3) {
            if (point1 !== undefined) { this.point1 = point1; }
            if (point2 !== undefined) { this.point2 = point2; }
            if (point3 !== undefined) { this.point3 = point3; }
            if (point4 !== undefined) { this.point4 = point4; }
        }
        /**
         * Corner 1
         */
        point1: Base.Point3;
        /**
         * Corner 2
         */
        point2: Base.Point3;
        /**
         * Corner 3
         */
        point3: Base.Point3;
        /**
         * Corner 4
         */
        point4: Base.Point3;
    }
    export class SurfaceParamDto {
        constructor(surface?: any, point?: Base.Point3) {
            if (surface !== undefined) { this.surface = surface; }
            if (point !== undefined) { this.point = point; }
        }
        /**
         * Nurbs surface
         */
        surface: any;
        /**
         * Point
         */
        point: Base.Point3;
    }
    export class KnotsControlPointsWeightsDto {
        constructor(degreeU?: number, degreeV?: number, knotsU?: number[], knotsV?: number[], points?: Base.Point3[], weights?: number[]) {
            if (degreeU !== undefined) { this.degreeU = degreeU; }
            if (degreeV !== undefined) { this.degreeV = degreeV; }
            if (knotsU !== undefined) { this.knotsU = knotsU; }
            if (knotsV !== undefined) { this.knotsV = knotsV; }
            if (points !== undefined) { this.points = points; }
            if (weights !== undefined) { this.weights = weights; }
        }
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
        points: Base.Point3[];
        /**
         * Weights
         */
        weights: number[];
    }
    export class LoftCurvesDto {
        constructor(degreeV?: number, curves?: any[]) {
            if (degreeV !== undefined) { this.degreeV = degreeV; }
            if (curves !== undefined) { this.curves = curves; }
        }
        /**
         * V direction degree
         */
        degreeV: number;
        /**
         * Nurbs curves
         */
        curves: any[];
    }
    export class DrawSurfaceDto<T> {
        /**
         * Provide options without default values
         */
        constructor(surface?: any, opacity?: number, colours?: string | string[], updatable?: boolean, hidden?: boolean, surfaceMesh?: T, drawTwoSided?: boolean, backFaceColour?: string, backFaceOpacity?: number) {
            if (surface !== undefined) { this.surface = surface; }
            if (opacity !== undefined) { this.opacity = opacity; }
            if (colours !== undefined) { this.colours = colours; }
            if (updatable !== undefined) { this.updatable = updatable; }
            if (hidden !== undefined) { this.hidden = hidden; }
            if (surfaceMesh !== undefined) { this.surfaceMesh = surfaceMesh; }
            if (drawTwoSided !== undefined) { this.drawTwoSided = drawTwoSided; }
            if (backFaceColour !== undefined) { this.backFaceColour = backFaceColour; }
            if (backFaceOpacity !== undefined) { this.backFaceOpacity = backFaceOpacity; }
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
        colours: string | string[] = "#444444";
        /**
         * Indicates wether the position of this surface will change in time
         */
        updatable = false;
        /**
         * Should be hidden
         */
        hidden = false;
        /**
         * Surface mesh variable in case it already exists and needs updating
         */
        surfaceMesh?: T;
        /**
         * Draw two-sided faces with different colors for front and back. This helps visualize face orientation.
         * @default true
         */
        drawTwoSided = true;
        /**
         * Hex colour string for back face colour (negative side of the face). Only used when drawTwoSided is true.
         * @default #0000ff
         */
        backFaceColour = "#0000ff";
        /**
         * Back face opacity value between 0 and 1. Only used when drawTwoSided is true.
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        backFaceOpacity = 1;
    }
    export class DrawSurfacesDto<T> {
        /**
         * Provide options without default values
         */
        constructor(surfaces?: any[], opacity?: number, colours?: string | string[], updatable?: boolean, hidden?: boolean, surfacesMesh?: T, drawTwoSided?: boolean, backFaceColour?: string, backFaceOpacity?: number) {
            if (surfaces !== undefined) { this.surfaces = surfaces; }
            if (opacity !== undefined) { this.opacity = opacity; }
            if (colours !== undefined) { this.colours = colours; }
            if (updatable !== undefined) { this.updatable = updatable; }
            if (hidden !== undefined) { this.hidden = hidden; }
            if (surfacesMesh !== undefined) { this.surfacesMesh = surfacesMesh; }
            if (drawTwoSided !== undefined) { this.drawTwoSided = drawTwoSided; }
            if (backFaceColour !== undefined) { this.backFaceColour = backFaceColour; }
            if (backFaceOpacity !== undefined) { this.backFaceOpacity = backFaceOpacity; }
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
        colours: string | string[] = "#444444";
        /**
         * Indicates wether the position of these surfaces will change in time
         */
        updatable = false;
        /**
         * Should be hidden
         */
        hidden = false;
        /**
         * Surfaces mesh variable in case it already exists and needs updating
         */
        surfacesMesh?: T;
        /**
         * Draw two-sided faces with different colors for front and back. This helps visualize face orientation.
         * @default true
         */
        drawTwoSided = true;
        /**
         * Hex colour string for back face colour (negative side of the face). Only used when drawTwoSided is true.
         * @default #0000ff
         */
        backFaceColour = "#0000ff";
        /**
         * Back face opacity value between 0 and 1. Only used when drawTwoSided is true.
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        backFaceOpacity = 1;
    }
    export class DrawSurfacesColoursDto<T> {
        /**
         * Provide options without default values
         */
        constructor(surfaces?: any[], colours?: string[], opacity?: number, updatable?: boolean, hidden?: boolean, surfacesMesh?: T, drawTwoSided?: boolean, backFaceColour?: string, backFaceOpacity?: number) {
            if (surfaces !== undefined) { this.surfaces = surfaces; }
            if (colours !== undefined) { this.colours = colours; }
            if (opacity !== undefined) { this.opacity = opacity; }
            if (updatable !== undefined) { this.updatable = updatable; }
            if (hidden !== undefined) { this.hidden = hidden; }
            if (surfacesMesh !== undefined) { this.surfacesMesh = surfacesMesh; }
            if (drawTwoSided !== undefined) { this.drawTwoSided = drawTwoSided; }
            if (backFaceColour !== undefined) { this.backFaceColour = backFaceColour; }
            if (backFaceOpacity !== undefined) { this.backFaceOpacity = backFaceOpacity; }
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
        colours: string | string[];
        /**
         * Indicates wether the position of these surfaces will change in time
         */
        updatable = false;
        /**
         * Indicates if surface should be hidden
         */
        hidden = false;
        /**
         * Surfaces mesh variable in case it already exists and needs updating
         */
        surfacesMesh?: T;
        /**
         * Draw two-sided faces with different colors for front and back. This helps visualize face orientation.
         * @default true
         */
        drawTwoSided = true;
        /**
         * Hex colour string for back face colour (negative side of the face). Only used when drawTwoSided is true.
         * @default #0000ff
         */
        backFaceColour = "#0000ff";
        /**
         * Back face opacity value between 0 and 1. Only used when drawTwoSided is true.
         * @default 1
         * @minimum 0
         * @maximum 1
         * @step 0.1
         */
        backFaceOpacity = 1;
    }
    export class ConeAndCylinderParametersDto {
        constructor(axis?: Base.Vector3, xAxis?: Base.Vector3, base?: Base.Point3, height?: number, radius?: number) {
            if (axis !== undefined) { this.axis = axis; }
            if (xAxis !== undefined) { this.xAxis = xAxis; }
            if (base !== undefined) { this.base = base; }
            if (height !== undefined) { this.height = height; }
            if (radius !== undefined) { this.radius = radius; }
        }
        /**
         * Defines main axis of the cone
         */
        axis: Base.Vector3 = [0, 1, 0];
        /**
         * X axis of the cone
         */
        xAxis: Base.Vector3 = [1, 0, 0];
        /**
         * Base point for the cone
         */
        base: Base.Point3 = [0, 0, 0];
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
        constructor(cone?: any) {
            if (cone !== undefined) { this.cone = cone; }
        }
        /**
         * Conical Nurbs surface
         */
        cone: any;
    }
    export class CylinderDto {
        constructor(cylinder?: any) {
            if (cylinder !== undefined) { this.cylinder = cylinder; }
        }
        /**
         * Cylindrical Nurbs surface
         */
        cylinder: any;
    }
    export class ExtrusionParametersDto {
        constructor(profile?: any, direction?: Base.Vector3) {
            if (profile !== undefined) { this.profile = profile; }
            if (direction !== undefined) { this.direction = direction; }
        }
        /**
         * Profile Nurbs curve
         */
        profile: any;
        /**
         * Direction vector
         */
        direction: Base.Vector3;
    }
    export class ExtrusionDto {
        constructor(extrusion?: any) {
            if (extrusion !== undefined) { this.extrusion = extrusion; }
        }
        /**
         * Nurbs surface created through extrusion
         */
        extrusion: any;
    }
    export class SphericalParametersDto {
        constructor(radius?: number, center?: number[]) {
            if (radius !== undefined) { this.radius = radius; }
            if (center !== undefined) { this.center = center; }
        }
        /**
         * Radius of the sphere
         */
        radius: number;
        /**
         * Center point
         */
        center: number[];
    }
    export class SphereDto {
        constructor(sphere?: any) {
            if (sphere !== undefined) { this.sphere = sphere; }
        }
        /**
         * Spherical Nurbs surface
         */
        sphere: any;
    }
    export class RevolutionParametersDto {
        constructor(profile?: any, center?: number[], axis?: number[], angle?: number) {
            if (profile !== undefined) { this.profile = profile; }
            if (center !== undefined) { this.center = center; }
            if (axis !== undefined) { this.axis = axis; }
            if (angle !== undefined) { this.angle = angle; }
        }
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
        constructor(revolution?: any) {
            if (revolution !== undefined) { this.revolution = revolution; }
        }
        /**
         * Revolved Nurbs surface
         */
        revolution: any;
    }
    export class SweepParametersDto {
        constructor(profile?: any, rail?: any) {
            if (profile !== undefined) { this.profile = profile; }
            if (rail !== undefined) { this.rail = rail; }
        }
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
        constructor(sweep?: any) {
            if (sweep !== undefined) { this.sweep = sweep; }
        }
        /**
         * Revolved Nurbs surface
         */
        sweep: any;
    }
    export class CurveCurveDto {
        constructor(firstCurve?: any, secondCurve?: any, tolerance?: number) {
            if (firstCurve !== undefined) { this.firstCurve = firstCurve; }
            if (secondCurve !== undefined) { this.secondCurve = secondCurve; }
            if (tolerance !== undefined) { this.tolerance = tolerance; }
        }
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
        constructor(curve?: any, surface?: any, tolerance?: number) {
            if (curve !== undefined) { this.curve = curve; }
            if (surface !== undefined) { this.surface = surface; }
            if (tolerance !== undefined) { this.tolerance = tolerance; }
        }
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
        constructor(firstSurface?: any, secondSurface?: any, tolerance?: number) {
            if (firstSurface !== undefined) { this.firstSurface = firstSurface; }
            if (secondSurface !== undefined) { this.secondSurface = secondSurface; }
            if (tolerance !== undefined) { this.tolerance = tolerance; }
        }
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
        constructor(intersections?: BaseTypes.CurveCurveIntersection[]) {
            if (intersections !== undefined) { this.intersections = intersections; }
        }
        /**
         * Curve curve intersections
         */
        intersections: BaseTypes.CurveCurveIntersection[];
    }
    export class CurveSurfaceIntersectionsDto {
        constructor(intersections?: BaseTypes.CurveSurfaceIntersection[]) {
            if (intersections !== undefined) { this.intersections = intersections; }
        }
        /**
         * Curve curve intersections
         */
        intersections: BaseTypes.CurveSurfaceIntersection[];
    }
}
