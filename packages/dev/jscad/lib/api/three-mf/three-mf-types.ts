import type * as JSCAD from "@jscad/modeling";

export type ThreeMfUnit = "micron" | "millimeter" | "centimeter" | "inch" | "foot" | "meter";

export interface ThreeMfSettings {
    unit: ThreeMfUnit;
    metadata: boolean;
    defaultColor: number[];
    compress: boolean;
}

export interface ThreeMfSolid {
    name: string;
    color: number[];
    polygons: number[][][];
}

export interface MaybeNamed {
    name?: unknown;
}

export interface ThreeMfMesh {
    vertices: number[][];
    triangles: number[][];
}

export interface ThreeMfGeneralizeOptions {
    snap: boolean;
    triangulate: boolean;
}

export type ThreeMfGeneralize = (options: ThreeMfGeneralizeOptions, geometries: JSCAD.geometries.geom3.Geom3[]) => unknown;
