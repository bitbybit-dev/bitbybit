// A fragment of the Verb inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../verb-inputs.ts. Edit here, then regenerate.
import { Base } from "../base-inputs";


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
    line!: Base.Line3;
}
export class LinesDto {
    constructor(lines?: Base.Line3[]) {
        if (lines !== undefined) { this.lines = lines; }
    }
    /**
     * Basic lines
     */
    lines!: Base.Line3[];
}
export class PolylineDto {
    constructor(polyline?: Base.Polyline3) {
        if (polyline !== undefined) { this.polyline = polyline; }
    }
    /**
     * Basic polyline
     */
    polyline!: Base.Polyline3;
}
export class PolylinesDto {
    constructor(polylines?: Base.Polyline3[]) {
        if (polylines !== undefined) { this.polylines = polylines; }
    }
    /**
     * Basic polyline
     */
    polylines!: Base.Polyline3[];
}
export class CurvesDto {
    constructor(curves?: any[]) {
        if (curves !== undefined) { this.curves = curves; }
    }
    /**
     * Nurbs curves
     */
    curves!: any[];
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
    point!: Base.Point3;
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
    points!: Base.Point3[];
}
export class BezierCurveDto {
    constructor(points?: Base.Point3[], weights?: number[]) {
        if (points !== undefined) { this.points = points; }
        if (weights !== undefined) { this.weights = weights; }
    }
    /**
     * Control points
     */
    points!: Base.Point3[];
    /**
     * Weights
     */
    weights!: number[];
}
