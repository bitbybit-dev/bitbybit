// A fragment of the Manifold inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../manifold-inputs.ts. Edit here, then regenerate.

export class ManifoldDto<T> {
    constructor(manifold?: T) {
        if (manifold !== undefined) { this.manifold = manifold; }
    }
    /**
     * Manifold shape
     */
    manifold!: T;
}
export class CalculateNormalsDto<T> {
    constructor(manifold?: T, normalIdx?: number, minSharpAngle?: number) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (normalIdx !== undefined) { this.normalIdx = normalIdx; }
        if (minSharpAngle !== undefined) { this.minSharpAngle = minSharpAngle; }
    }
    /**
     * Manifold shape
     */
    manifold!: T;
    /**
     * The property channel in which to store the X
    * values of the normals. The X, Y, and Z channels will be sequential. The
    * property set will be automatically expanded to include up through normalIdx
    * + 2.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    normalIdx = 0;
    /**
     * Any edges with angles greater than this value will
     * remain sharp, getting different normal vector properties on each side of
     * the edge. By default, no edges are sharp and all normals are shared. With a
     * value of zero, the model is faceted and all normals match their triangle
     * normals, but in this case it would be better not to calculate normals at
     * all. The value is in degrees.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    minSharpAngle = 0;
}
export class CalculateCurvatureDto<T> {
    constructor(manifold?: T) {
        if (manifold !== undefined) { this.manifold = manifold; }
    }
    /**
     * Manifold shape
     */
    manifold!: T;
    /**
     * The property channel index in which to store the
     * Gaussian curvature. An index < 0 will be ignored (stores nothing). The
     * property set will be automatically expanded to include the channel
     * index specified.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    gaussianIdx: number = 0;
    /**
     * The property channel index in which to store the mean
     * curvature. An index < 0 will be ignored (stores nothing). The property
     * set will be automatically expanded to include the channel index
     * specified. The mean curvature is a scalar value that describes the
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    meanIdx: number = 1;
}
export class CountDto {
    constructor(count?: number) {
        if (count !== undefined) { this.count = count; }
    }
    /**
     * Nr to count
     */
    count!: number;
}
export class ManifoldsMinGapDto<T> {
    constructor(manifold1?: T, manifold2?: T, searchLength?: number) {
        if (manifold1 !== undefined) { this.manifold1 = manifold1; }
        if (manifold2 !== undefined) { this.manifold2 = manifold2; }
        if (searchLength !== undefined) { this.searchLength = searchLength; }
    }
    /**
     * Manifold shape
     */
    manifold1!: T;
    /**
     * Manifold shape
     */
    manifold2!: T;
    /**
     * Length of the search gap
     * @default 100
     * @minimum 0
     * @maximum Infinity
     * @step 10
     */
    searchLength = 100;
}
