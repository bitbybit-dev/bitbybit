// A fragment of the Verb inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../verb-inputs.ts. Edit here, then regenerate.
import { Base } from "../base-inputs";

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
    curves!: any[];
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
    curvesMesh?: T | undefined;
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
    degree!: number;
    /**
     * Weights that identify strength that attracts curve to control points
     */
    weights!: number[];
    /**
     * Knots of the Nurbs curve
     */
    knots!: number[];
    /**
     * Control points of the nurbs curve
     */
    points!: Base.Point3[];
}
export class CurvePathDataDto {
    constructor(degree?: number, points?: Base.Point3[]) {
        if (degree !== undefined) { this.degree = degree; }
        if (points !== undefined) { this.points = points; }
    }
    /**
     * Nurbs curve degree
     */
    degree!: number;
    /**
     * Control points of the nurbs curve
     */
    points!: Base.Point3[];
}
