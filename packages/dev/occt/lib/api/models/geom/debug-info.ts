import { Base } from "../../inputs";

/**
 * The name of a curve's underlying type - line, circle, ellipse, hyperbola, parabola, Bezier,
 * B-spline and the rest - as it appears in a geometry report.
 */
export type CurveTypeName =
    "line" | "circle" | "ellipse" | "hyperbola" | "parabola" | "bezier" | "bspline" | "offset" | "other";

/**
 * The name of a surface's underlying type - plane, cylinder, cone, sphere, torus, Bezier,
 * B-spline and the rest - as it appears in a geometry report. Recognising a run of cylindrical
 * faces of equal radius is how a hole pattern is found.
 */
export type SurfaceTypeName =
    "plane" | "cylinder" | "cone" | "sphere" | "torus" | "bezier" | "bspline" | "revolution" | "extrusion" | "offset" | "other";

/** Introspection of an edge's underlying curve (degree, poles, periodicity, range, length, ...). */
export interface EdgeDebugInfo {
    valid: boolean;
    type?: CurveTypeName | undefined;
    firstParameter?: number | undefined;
    lastParameter?: number | undefined;
    closed?: boolean | undefined;
    periodic?: boolean | undefined;
    period?: number | undefined;
    length?: number | undefined;
    isLinear?: boolean | undefined;
    isCircular?: boolean | undefined;
    degree?: number | undefined;
    nbPoles?: number | undefined;
    nbKnots?: number | undefined;
    rational?: boolean | undefined;
    start?: Base.Point3 | undefined;
    end?: Base.Point3 | undefined;
}

/** Introspection of a wire: edge count, closed flag, total length, plus per-edge debug info. */
export interface WireDebugInfo {
    valid: boolean;
    nbEdges: number;
    closed: boolean;
    totalLength: number;
    edges: EdgeDebugInfo[];
}

/** Introspection of a shell: face/edge counts, total surface area, plus per-face debug info (flat). */
export interface ShellDebugInfo {
    valid: boolean;
    nbFaces: number;
    nbEdges: number;
    area: number;
    faces: FaceDebugInfo[];
}

/** Introspection of a solid: face/edge counts, surface area, volume, plus per-face debug info (flat). */
export interface SolidDebugInfo {
    valid: boolean;
    nbFaces: number;
    nbEdges: number;
    area: number;
    volume: number;
    faces: FaceDebugInfo[];
}

/** Introspection of a face's underlying surface (U/V degree, poles, periodicity, bounds, area, ...). */
export interface FaceDebugInfo {
    valid: boolean;
    type?: SurfaceTypeName | undefined;
    uMin?: number | undefined;
    uMax?: number | undefined;
    vMin?: number | undefined;
    vMax?: number | undefined;
    uClosed?: boolean | undefined;
    vClosed?: boolean | undefined;
    uPeriodic?: boolean | undefined;
    vPeriodic?: boolean | undefined;
    isPlanar?: boolean | undefined;
    uDegree?: number | undefined;
    vDegree?: number | undefined;
    nbUPoles?: number | undefined;
    nbVPoles?: number | undefined;
    nbUKnots?: number | undefined;
    nbVKnots?: number | undefined;
    uRational?: boolean | undefined;
    vRational?: boolean | undefined;
    area?: number | undefined;
    reversed?: boolean | undefined;
    nbWires?: number | undefined;
    nbEdges?: number | undefined;
}
