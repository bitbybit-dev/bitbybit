// A fragment of the Verb inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../verb-inputs.ts. Edit here, then regenerate.
import { Base } from "../base-inputs";

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
    transformation!: Base.TransformMatrixes;
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
    parameter!: number;
    /**
     * Default parameter is on U direction, use V to switch
     */
    useV!: boolean;
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
    parameters!: number[];
    /**
     * Default parameter is on U direction, use V to switch
     */
    useV!: boolean;
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
    isocurveSegments!: number;
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
    u!: number;
    /**
     * V coordinate
     */
    v!: number;
    /**
     * Number of derivatives
     */
    numDerivatives!: number;
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
    u!: number;
    /**
     * V coordinate
     */
    v!: number;
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
    point1!: Base.Point3;
    /**
     * Corner 2
     */
    point2!: Base.Point3;
    /**
     * Corner 3
     */
    point3!: Base.Point3;
    /**
     * Corner 4
     */
    point4!: Base.Point3;
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
    point!: Base.Point3;
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
    degreeU!: number;
    /**
     * V direction degree
     */
    degreeV!: number;
    /**
     * U direction knots
     */
    knotsU!: number[];
    /**
     * V direction knots
     */
    knotsV!: number[];
    /**
     * Points
     */
    points!: Base.Point3[];
    /**
     * Weights
     */
    weights!: number[];
}
export class LoftCurvesDto {
    constructor(degreeV?: number, curves?: any[]) {
        if (degreeV !== undefined) { this.degreeV = degreeV; }
        if (curves !== undefined) { this.curves = curves; }
    }
    /**
     * V direction degree
     */
    degreeV!: number;
    /**
     * Nurbs curves
     */
    curves!: any[];
}
