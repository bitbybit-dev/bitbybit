// A fragment of the Verb inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../verb-inputs.ts. Edit here, then regenerate.
import { BaseTypes } from "../../bitbybit/base-types";

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
    secondCurve!: number[];
    /**
     * Optional tolerance parameter
     */
    tolerance?: number | undefined;
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
    tolerance?: number | undefined;
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
    tolerance?: number | undefined;
}
export class CurveCurveIntersectionsDto {
    constructor(intersections?: BaseTypes.CurveCurveIntersection[]) {
        if (intersections !== undefined) { this.intersections = intersections; }
    }
    /**
     * Curve curve intersections
     */
    intersections!: BaseTypes.CurveCurveIntersection[];
}
export class CurveSurfaceIntersectionsDto {
    constructor(intersections?: BaseTypes.CurveSurfaceIntersection[]) {
        if (intersections !== undefined) { this.intersections = intersections; }
    }
    /**
     * Curve curve intersections
     */
    intersections!: BaseTypes.CurveSurfaceIntersection[];
}
