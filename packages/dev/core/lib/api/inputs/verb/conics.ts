// A fragment of the Verb inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../verb-inputs.ts. Edit here, then regenerate.
import { Base } from "../base-inputs";

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
    xAxis!: Base.Vector3;
    /**
     * Y axis of the circle
     */
    yAxis!: Base.Vector3;
    /**
     * Center of the circle
     */
    center!: Base.Point3;
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
    xAxis!: Base.Vector3;
    /**
     * Y axis of the circle
     */
    yAxis!: Base.Vector3;
    /**
     * Radius of the circle
     */
    radius!: number;
    /**
     * Center of the circle
     */
    center!: Base.Point3;
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
    minAngle!: number;
    /**
     * Maximum angle in degrees
     */
    maxAngle!: number;
    /**
     * X axis of the circle
     */
    xAxis!: Base.Vector3;
    /**
     * Y axis of the circle
     */
    yAxis!: Base.Vector3;
    /**
     * Radius of the circle
     */
    radius!: number;
    /**
     * Center of the circle
     */
    center!: Base.Point3;
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
    minAngle!: number;
    /**
     * Maximum angle in degrees
     */
    maxAngle!: number;
    /**
     * X axis of the circle
     */
    xAxis!: Base.Vector3;
    /**
     * Y axis of the circle
     */
    yAxis!: Base.Vector3;
    /**
     * Center of the circle
     */
    center!: Base.Point3;
}
