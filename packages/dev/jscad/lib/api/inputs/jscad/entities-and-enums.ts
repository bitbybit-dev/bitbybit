// A fragment of the JSCAD inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../jscad-inputs.ts. Edit here, then regenerate.
import { Base } from "../base-inputs";

/** A 2D point or vector, `[x, y]`. */
export type JSCADVec2 = [number, number];

/** A 3D point or vector, `[x, y, z]`. */
export type JSCADVec3 = [number, number, number];

/** A 4x4 transformation matrix, in column-major order. */
export type JSCADMat4 = [
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
];

/** A plane, `[normalX, normalY, normalZ, distanceFromOrigin]`. */
export type JSCADPlane = [number, number, number, number];

/** A colour, either `[r, g, b]` or `[r, g, b, a]`, each channel from 0 to 1. */
export type JSCADColor = [number, number, number] | [number, number, number, number];

/** A convex polygon in 3D - the face of a solid. */
export type JSCADPoly3 = {
    vertices: JSCADVec3[];
    color?: JSCADColor;
    plane?: JSCADPlane;
};

/** 2D geometry: a closed region, held as the edges that bound it. */
export type JSCADGeom2 = {
    sides: [JSCADVec2, JSCADVec2][];
    transforms: JSCADMat4;
    color?: JSCADColor;
};

/** 3D geometry: a solid, held as the polygons that enclose it. */
export type JSCADGeom3 = {
    polygons: JSCADPoly3[];
    transforms: JSCADMat4;
    color?: JSCADColor;
};

/** A 2D path: an open or closed sequence of points, with no enclosed area. */
export type JSCADPath2 = {
    points: JSCADVec2[];
    isClosed: boolean;
    transforms: JSCADMat4;
    color?: JSCADColor;
};

/**
 * Anything JSCAD hands back: a 2D region, a 3D solid, or a 2D path. The three share no members
 * beyond their transform, so narrow on the one you want - `"polygons" in entity` for a solid,
 * `"isClosed" in entity` for a path, `"sides" in entity` for a 2D region.
 *
 * These are structural mirrors of the library's own types rather than imports of them, so the
 * published declarations stay self-contained; jscad-entity.test.ts fails the build if the two
 * ever stop matching.
 */
export type JSCADEntity = JSCADGeom2 | JSCADGeom3 | JSCADPath2;

/** A geometry flattened for rendering: triangle positions, normals, indices and its transform. */
export type JSCADMeshData = {
    positions: number[];
    normals: number[];
    indices: number[];
    transforms: JSCADMat4;
};

export class PolylinePropertiesDto {
    /**
     * Provide options without default values
     */
    constructor(points?: Base.Point3[], isClosed?: boolean) {
        if (points !== undefined) { this.points = points; }
        if (isClosed !== undefined) { this.isClosed = isClosed; }
    }
    /**
     * Points of the polyline
     */
    points!: Base.Point3[];
    /**
     * Can contain is closed information
     */
    isClosed?: boolean | undefined = false;
    /**
     * Can contain color information
     */
    color?: string | number[] | undefined;
}
/**
 * How the corners of an expanded or rounded solid are formed.
 */
export enum solidCornerTypeEnum {
    /**
     * Edges will meet at a corner
     */
    edge = "edge",
    /**
     * Edges will be rounded on the corner
     */
    round = "round",
    /**
     * Edges will be chamfered on the corner
     */
    chamfer = "chamfer",
}
/**
 * Horizontal alignment of JSCAD text against its anchor point.
 */
export enum jscadTextAlignEnum {
    /**
     * Aligns text to the left
     */
    left = "left",
    /**
     * Aligns text to the center
     */
    center = "center",
    /**
     * Aligns text to the right
     */
    right = "right",
}
