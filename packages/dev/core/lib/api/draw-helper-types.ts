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
