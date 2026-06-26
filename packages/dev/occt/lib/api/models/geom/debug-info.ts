import { Base } from "../../inputs";

export type CurveTypeName =
    "line" | "circle" | "ellipse" | "hyperbola" | "parabola" | "bezier" | "bspline" | "offset" | "other";

export type SurfaceTypeName =
    "plane" | "cylinder" | "cone" | "sphere" | "torus" | "bezier" | "bspline" | "revolution" | "extrusion" | "offset" | "other";

/** Introspection of an edge's underlying curve (degree, poles, periodicity, range, length, ...). */
export interface EdgeDebugInfo {
    valid: boolean;
    type?: CurveTypeName;
    firstParameter?: number;
    lastParameter?: number;
    closed?: boolean;
    periodic?: boolean;
    period?: number;
    length?: number;
    isLinear?: boolean;
    isCircular?: boolean;
    degree?: number;
    nbPoles?: number;
    nbKnots?: number;
    rational?: boolean;
    start?: Base.Point3;
    end?: Base.Point3;
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
    type?: SurfaceTypeName;
    uMin?: number;
    uMax?: number;
    vMin?: number;
    vMax?: number;
    uClosed?: boolean;
    vClosed?: boolean;
    uPeriodic?: boolean;
    vPeriodic?: boolean;
    isPlanar?: boolean;
    uDegree?: number;
    vDegree?: number;
    nbUPoles?: number;
    nbVPoles?: number;
    nbUKnots?: number;
    nbVKnots?: number;
    uRational?: boolean;
    vRational?: boolean;
    area?: number;
    reversed?: boolean;
    nbWires?: number;
    nbEdges?: number;
}
