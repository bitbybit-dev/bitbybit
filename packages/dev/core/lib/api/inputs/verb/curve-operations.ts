// A fragment of the Verb inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../verb-inputs.ts. Edit here, then regenerate.
import { Base } from "../base-inputs";

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
    parameter!: number;
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
    parameter!: number;
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
    transformation!: Base.TransformMatrixes;
}
export class CurvesTransformDto {
    constructor(curves?: any[], transformation?: Base.TransformMatrixes) {
        if (curves !== undefined) { this.curves = curves; }
        if (transformation !== undefined) { this.transformation = transformation; }
    }
    /**
     * Nurbs curve
     */
    curves!: any[];
    /**
     * Transformation matrixes
     */
    transformation!: Base.TransformMatrixes;
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
    tolerance!: number;
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
    length!: number;
    /**
     * Tolerance
     */
    tolerance!: number;
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
    numDerivatives!: number;
    /**
     * Parameter on the curve
     */
    parameter!: number;
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
    subdivision!: number;
}
export class CurvesSubdivisionsDto {
    constructor(curves?: any[], subdivision?: number) {
        if (curves !== undefined) { this.curves = curves; }
        if (subdivision !== undefined) { this.subdivision = subdivision; }
    }
    /**
     * Nurbs curves
     */
    curves!: any[];
    /**
     * Number of subdivisions
     */
    subdivision!: number;
}
export class CurvesDivideLengthDto {
    constructor(curves?: any[], length?: number) {
        if (curves !== undefined) { this.curves = curves; }
        if (length !== undefined) { this.length = length; }
    }
    /**
     * Nurbs curves
     */
    curves!: any[];
    /**
     * Length of subdivisions
     */
    length!: number;
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
    length!: number;
}
