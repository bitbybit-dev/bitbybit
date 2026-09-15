// A fragment of the Manifold inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../manifold-inputs.ts. Edit here, then regenerate.

/**
 * Points and solids for `manifold.operations.hullPoints`, which wraps them all in one convex hull.
 */
export class HullPointsDto<T> {
    constructor(points?: T) {
        if (points !== undefined) { this.points = points; }
    }
    /**
     * The points and solids to wrap, in any mix.
     */
    points!: T;
}
/**
 * A solid and a height for `manifold.operations.slice`.
 */
export class SliceDto<T> {
    constructor(manifold?: T) {
        if (manifold !== undefined) { this.manifold = manifold; }
    }
    /**
     * The solid to cut.
     */
    manifold!: T;
    /**
     * The Z height of the cutting plane, which is parallel to the XY plane.
     * @default 0.5
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 0.5;
}
/**
 * Mesh data for the methods that read it whole, such as `mesh.evaluate.numTri` and
 * `mesh.operations.merge`.
 */
export class MeshDto<T> {
    constructor(mesh?: T) {
        if (mesh !== undefined) { this.mesh = mesh; }
    }
    /**
     * The mesh data, as `manifoldToMesh` hands it out.
     */
    mesh!: T;
}

/**
 * Mesh data and a vertex index for `mesh.evaluate.position` and `mesh.evaluate.extras`.
 */
export class MeshVertexIndexDto<T> {
    constructor(mesh?: T, vertexIndex?: number) {
        if (mesh !== undefined) { this.mesh = mesh; }
        if (vertexIndex !== undefined) { this.vertexIndex = vertexIndex; }
    }
    /**
     * The mesh data to read.
     */
    mesh!: T;
    /**
     * The position of the vertex, counting from 0.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    vertexIndex: number = 0;
}
/**
 * Mesh data and a run index for `mesh.evaluate.transform`.
 */
export class MeshTriangleRunIndexDto<T> {
    constructor(mesh?: T, triangleRunIndex?: number) {
        if (mesh !== undefined) { this.mesh = mesh; }
        if (triangleRunIndex !== undefined) { this.triangleRunIndex = triangleRunIndex; }
    }
    /**
     * The mesh data to read.
     */
    mesh!: T;
    /**
     * The position of the triangle run, counting from 0.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    triangleRunIndex: number = 0;
}
/**
 * Mesh data and a half-edge index for `mesh.evaluate.tangent`.
 */
export class MeshHalfEdgeIndexDto<T> {
    constructor(mesh?: T, halfEdgeIndex?: number) {
        if (mesh !== undefined) { this.mesh = mesh; }
        if (halfEdgeIndex !== undefined) { this.halfEdgeIndex = halfEdgeIndex; }
    }
    /**
     * The mesh data to read.
     */
    mesh!: T;
    /**
     * The position of the half-edge, counting from 0: three per triangle, in triangle order.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    halfEdgeIndex: number = 0;
}
/**
 * Mesh data and a triangle index for `mesh.evaluate.verts`.
 */
export class MeshTriangleIndexDto<T> {
    constructor(mesh?: T, triangleIndex?: number) {
        if (mesh !== undefined) { this.mesh = mesh; }
        if (triangleIndex !== undefined) { this.triangleIndex = triangleIndex; }
    }
    /**
     * The mesh data to read.
     */
    mesh!: T;
    /**
     * The position of the triangle, counting from 0.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    triangleIndex: number = 0;
}
