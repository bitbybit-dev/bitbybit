import type * as Inputs from "./inputs";

/**
 * The two drawing options that decide how a Manifold solid is shaded.
 */
export interface ManifoldShadingOptions {
    /** When true, the solid shades smoothly across edges flatter than `minSharpAngle`. */
    readonly computeNormals: boolean;
    /** The angle between two faces, in degrees, above which their edge is drawn sharp. */
    readonly minSharpAngle: number;
}

/**
 * A Manifold mesh as the worker sends it: `numProp` numbers per vertex, the position first, and
 * three vertex indices per triangle.
 */
export interface ManifoldVertexData {
    /** How many numbers each vertex carries. */
    readonly numProp: number;
    /** The numbers of every vertex, one vertex after another. */
    readonly vertProperties: Float32Array;
    /** Three vertex indices per triangle. */
    readonly triVerts: Uint32Array;
}

/**
 * A mesh ready to draw: positions, normals and triangles.
 */
export interface ManifoldMeshAttributes {
    /** Three numbers per vertex. */
    readonly positions: Float32Array;
    /** Three numbers per vertex. */
    readonly normals: Float32Array;
    /** Three vertex indices per triangle. */
    readonly indices: Uint32Array;
}

/**
 * One piece of a surface to draw: three numbers per vertex in `positions` and, when given, in
 * `normals`, two in `uvs` and three or four in `colors`, and three vertex indices per triangle.
 */
export interface MeshPart {
    readonly positions: ArrayLike<number>;
    readonly indices: ArrayLike<number>;
    readonly normals?: ArrayLike<number> | undefined;
    readonly uvs?: ArrayLike<number> | undefined;
    readonly colors?: ArrayLike<number> | undefined;
}

/**
 * How `mergedMeshBuffers` joins the pieces: the number of color components per vertex, 3 or 4, and
 * whether the result is the back of the surface, its normals turned round and, unless the engine
 * turns the faces itself, its triangles wound the other way.
 */
export interface MeshMerge {
    readonly colorSize?: number;
    readonly flipNormals?: boolean;
    readonly reverseWinding?: boolean;
}

/**
 * Pieces of a surface joined into the typed buffers an engine uploads: every piece's vertices one
 * after another, its triangles moved to point at them. `uvs` is present when any piece has them,
 * zeros standing in for the pieces that have none; `colors` when every piece has them.
 */
export interface MergedMeshBuffers {
    readonly positions: Float32Array;
    readonly normals: Float32Array;
    readonly indices: Uint32Array;
    readonly uvs?: Float32Array | undefined;
    readonly colors?: Float32Array | undefined;
}

/**
 * A surface read triangle by triangle from a tessellation, its lists growing as each face is added.
 */
export interface GrowingMeshData {
    positions: number[];
    indices: number[];
    normals: number[];
}

/**
 * A shape's mesh as the drawers take it: lists, as `shapeToMesh` returns them, or the typed buffers
 * the worker's drawing commands hand over.
 */
export type DrawableShapeMesh = Inputs.OCCT.DecomposedMeshDto | Inputs.OCCT.DecomposedMeshBuffersDto;
