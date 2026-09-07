// A fragment of the Verb inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../verb-inputs.ts. Edit here, then regenerate.
import { Base } from "../base-inputs";

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
    direction!: Base.Vector3;
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
    radius!: number;
    /**
     * Center point
     */
    center!: number[];
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
    center!: number[];
    /**
     * Axis around which rotation will happen
     */
    axis!: number[];
    /**
     * Angle at which to rotate in degrees
     */
    angle!: number;
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
