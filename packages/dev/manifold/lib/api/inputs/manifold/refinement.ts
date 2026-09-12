// A fragment of the Manifold inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../manifold-inputs.ts. Edit here, then regenerate.
import { Base } from "../base-inputs";

/**
 * A solid and a tolerance for `manifold.operations.refineToTolerance` and
 * `manifold.operations.setTolerance`.
 */
export class ManifoldRefineToleranceDto<T> {
    constructor(manifold?: T, tolerance?: number) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * The solid to work on.
     */
    manifold!: T;
    /**
     * The largest distance allowed between the triangles and the smooth surface they stand for, in
     * model units.
     * @default 1e-6
     * @minimum 0
     * @maximum Infinity
     * @step 1e-7
     */
    tolerance = 1e-6;
}
/**
 * A solid and an edge length for `manifold.operations.refineToLength`.
 */
export class ManifoldRefineLengthDto<T> {
    constructor(manifold?: T, length?: number) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (length !== undefined) { this.length = length; }
    }
    /**
     * The solid to refine.
     */
    manifold!: T;
    /**
     * The rough length every edge is split down to, in model units.
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    length = 0.1;
}
/**
 * A solid and a count for `manifold.operations.refine`.
 */
export class ManifoldRefineDto<T> {
    constructor(manifold?: T, number?: number) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (number !== undefined) { this.number = number; }
    }
    /**
     * The solid to refine.
     */
    manifold!: T;
    /**
     * How many pieces every edge is split into; must be more than 1 to change anything.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    number = 1;
}
/**
 * A solid and a normal channel for `manifold.operations.smoothByNormals`.
 */
export class ManifoldSmoothByNormalsDto<T> {
    constructor(manifold?: T, normalIdx?: number) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (normalIdx !== undefined) { this.normalIdx = normalIdx; }
    }
    /**
     * The solid to mark for smoothing.
     */
    manifold!: T;
    /**
     * The first of the three property channels holding the normals; the solid must have at least
     * that many plus three.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    normalIdx = 0;
}
/**
 * A solid and a tolerance for `manifold.operations.simplify`.
 */
export class ManifoldSimplifyDto<T> {
    constructor(manifold?: T, tolerance?: number) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * The solid to simplify.
     */
    manifold!: T;
    /**
     * How far surfaces may move while vertices are removed, in model units; left out or below the
     * solid's own tolerance, that tolerance is used.
     * @default undefined
     * @minimum 0
     * @maximum Infinity
     * @step 0.001
     */
    tolerance?: number | undefined;
}
/**
 * A solid, a property count and a fill function for `manifold.operations.setProperties`.
 */
export class ManifoldSetPropertiesDto<T> {
    constructor(manifold?: T, numProp?: number, propFunc?: (newProp: number[], position: Base.Vector3, oldProp: number[]) => void) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (numProp !== undefined) { this.numProp = numProp; }
        if (propFunc !== undefined) { this.propFunc = propFunc; }
    }
    /**
     * The solid whose vertex properties are rewritten.
     */
    manifold!: T;
    /**
     * How many properties each vertex has afterwards.
     * @default 3
     * @minimum 3
     * @maximum Infinity
     * @step 1
     */
    numProp = 3;
    /**
     * A function that receives the new property array, the vertex position and the old properties,
     * and fills the new array in place.
     * @default undefined
     */
    propFunc!: (newProp: number[], position: Base.Vector3, oldProp: number[]) => void;
}
/**
 * A solid and the smoothing settings for `manifold.operations.smoothOut`.
 */
export class ManifoldSmoothOutDto<T> {
    constructor(manifold?: T, minSharpAngle?: number, minSmoothness?: number) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (minSharpAngle !== undefined) { this.minSharpAngle = minSharpAngle; }
        if (minSmoothness !== undefined) { this.minSmoothness = minSmoothness; }
    }
    /**
     * The solid to mark for smoothing.
     */
    manifold!: T;
    /**
     * Edges bent more than this, in degrees, stay sharp; the rest are smoothed. At 0 nothing is
     * smoothed.
     * @default 60
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    minSharpAngle = 60;
    /**
     * How much the sharp edges are rounded, from 0 for a hard edge to 1 for fully smooth.
     * @default 0
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    minSmoothness = 0;
}
