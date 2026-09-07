// A fragment of the Manifold inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../manifold-inputs.ts. Edit here, then regenerate.

export class HullPointsDto<T> {
    constructor(points?: T) {
        if (points !== undefined) { this.points = points; }
    }
    /**
     * Points to hull
     */
    points!: T;
}
export class SliceDto<T> {
    constructor(manifold?: T) {
        if (manifold !== undefined) { this.manifold = manifold; }
    }
    /**
     * Manifold shape
     */
    manifold!: T;
    /**
     * Height of the slice
     * @default 0.5
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    height = 0.5;
}
export class MeshDto<T> {
    constructor(mesh?: T) {
        if (mesh !== undefined) { this.mesh = mesh; }
    }
    /**
     * Mesh
     */
    mesh!: T;
}

export class MeshVertexIndexDto<T> {
    constructor(mesh?: T, vertexIndex?: number) {
        if (mesh !== undefined) { this.mesh = mesh; }
        if (vertexIndex !== undefined) { this.vertexIndex = vertexIndex; }
    }
    /**
     * Mesh
     */
    mesh!: T;
    /**
     * Vertex index
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    vertexIndex: number = 0;
}
export class MeshTriangleRunIndexDto<T> {
    constructor(mesh?: T, triangleRunIndex?: number) {
        if (mesh !== undefined) { this.mesh = mesh; }
        if (triangleRunIndex !== undefined) { this.triangleRunIndex = triangleRunIndex; }
    }
    /**
     * Mesh
     */
    mesh!: T;
    /**
     * Triangle run index
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    triangleRunIndex: number = 0;
}
export class MeshHalfEdgeIndexDto<T> {
    constructor(mesh?: T, halfEdgeIndex?: number) {
        if (mesh !== undefined) { this.mesh = mesh; }
        if (halfEdgeIndex !== undefined) { this.halfEdgeIndex = halfEdgeIndex; }
    }
    /**
     * Mesh
     */
    mesh!: T;
    /**
     * Half edge index
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    halfEdgeIndex: number = 0;
}
export class MeshTriangleIndexDto<T> {
    constructor(mesh?: T, triangleIndex?: number) {
        if (mesh !== undefined) { this.mesh = mesh; }
        if (triangleIndex !== undefined) { this.triangleIndex = triangleIndex; }
    }
    /**
     * Mesh
     */
    mesh!: T;
    /**
     * Triangle index
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    triangleIndex: number = 0;
}
