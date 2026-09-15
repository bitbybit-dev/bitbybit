// A fragment of the Manifold inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../manifold-inputs.ts. Edit here, then regenerate.
import { Base } from "../base-inputs";

/**
 * One solid for the methods that take nothing else, such as `manifold.evaluate.volume` or
 * `manifold.operations.hull`.
 */
export class ManifoldDto<T> {
    constructor(manifold?: T) {
        if (manifold !== undefined) { this.manifold = manifold; }
    }
    /**
     * The solid to work on; it is not changed.
     */
    manifold!: T;
}
/**
 * A solid, a channel and a sharp angle for `manifold.operations.calculateNormals`.
 */
export class CalculateNormalsDto<T> {
    constructor(manifold?: T, normalIdx?: number, minSharpAngle?: number) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (normalIdx !== undefined) { this.normalIdx = normalIdx; }
        if (minSharpAngle !== undefined) { this.minSharpAngle = minSharpAngle; }
    }
    /**
     * The solid to compute normals for.
     */
    manifold!: T;
    /**
     * The property channel that receives the X of each normal; Y and Z follow in the next two, and
     * channels are added as needed.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    normalIdx = 0;
    /**
     * Edges bent more than this, in degrees, get separate normals on each side and stay crisp; at 0
     * every triangle keeps its own normal.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    minSharpAngle = 0;
}
/**
 * A solid and two channels for `manifold.operations.calculateCurvature`.
 */
export class CalculateCurvatureDto<T> {
    constructor(manifold?: T) {
        if (manifold !== undefined) { this.manifold = manifold; }
    }
    /**
     * The solid to compute curvature for.
     */
    manifold!: T;
    /**
     * The property channel that receives the Gaussian curvature, the product of the two principal
     * curvatures; below 0 skips it.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    gaussianIdx: number = 0;
    /**
     * The property channel that receives the mean curvature, the sum of the two principal
     * curvatures; below 0 skips it.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    meanIdx: number = 1;
}
/**
 * A count for `manifold.operations.reserveIds`, which reserves that many mesh ids.
 */
export class CountDto {
    constructor(count?: number) {
        if (count !== undefined) { this.count = count; }
    }
    /**
     * How many ids to reserve.
     */
    count!: number;
}
/**
 * Two solids and a search distance for `manifold.evaluate.minGap`.
 */
export class ManifoldsMinGapDto<T> {
    constructor(manifold1?: T, manifold2?: T, searchLength?: number) {
        if (manifold1 !== undefined) { this.manifold1 = manifold1; }
        if (manifold2 !== undefined) { this.manifold2 = manifold2; }
        if (searchLength !== undefined) { this.searchLength = searchLength; }
    }
    /**
     * The first solid.
     */
    manifold1!: T;
    /**
     * The second solid.
     */
    manifold2!: T;
    /**
     * How far apart the solids may be before the search gives up, in model units.
     * @default 100
     * @minimum 0
     * @maximum Infinity
     * @step 10
     */
    searchLength = 100;
}
/**
 * A solid and a ray segment for `manifold.evaluate.rayCast`.
 */
export class RayCastDto<T> {
    constructor(manifold?: T, origin?: Base.Point3, endpoint?: Base.Point3) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (origin !== undefined) { this.origin = origin; }
        if (endpoint !== undefined) { this.endpoint = endpoint; }
    }
    /**
     * The solid to cast the ray at.
     */
    manifold!: T;
    /**
     * Where the ray segment starts.
     * @default [0,0,0]
     */
    origin: Base.Point3 = [0, 0, 0];
    /**
     * Where the ray segment ends; nothing beyond it is hit.
     * @default [0,0,10]
     */
    endpoint: Base.Point3 = [0, 0, 10];
}
/**
 * One place a ray segment crosses the surface of a solid, as `manifold.evaluate.rayCast` reports
 * it: the triangle's original face, how far along the segment it lies as a fraction of the
 * segment's length (0 at the origin, 1 at the endpoint), the point and the surface normal there.
 */
export type RayHit = {
    faceID: number;
    distance: number;
    position: Base.Point3;
    normal: Base.Vector3;
};
