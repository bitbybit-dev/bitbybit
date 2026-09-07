// A fragment of the Manifold inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../manifold-inputs.ts. Edit here, then regenerate.
import { Base } from "../base-inputs";

export class ManifoldRefineToleranceDto<T> {
    constructor(manifold?: T, tolerance?: number) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * Manifold shape
     */
    manifold!: T;
    /**
     * The desired maximum distance between the faceted mesh
     * produced and the exact smoothly curving surface. All vertices are exactly
     * on the surface, within rounding error.
     * @default 1e-6
     * @minimum 0
     * @maximum Infinity
     * @step 1e-7
     */
    tolerance = 1e-6;
}
export class ManifoldRefineLengthDto<T> {
    constructor(manifold?: T, length?: number) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (length !== undefined) { this.length = length; }
    }
    /**
     * Manifold shape
     */
    manifold!: T;
    /**
     * Length of the manifold
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.1
     */
    length = 0.1;
}
export class ManifoldRefineDto<T> {
    constructor(manifold?: T, number?: number) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (number !== undefined) { this.number = number; }
    }
    /**
     * Manifold shape
     */
    manifold!: T;
    /**
     * The number of pieces to split every edge into. Must be > 1.
     * @default 1
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    number = 1;
}
export class ManifoldSmoothByNormalsDto<T> {
    constructor(manifold?: T, normalIdx?: number) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (normalIdx !== undefined) { this.normalIdx = normalIdx; }
    }
    /**
     * Manifold shape
     */
    manifold!: T;
    /**
     * The first property channel of the normals. NumProp must be
     * at least normalIdx + 3. Any vertex where multiple normals exist and don't
     * agree will result in a sharp edge.
     * @default 0
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    normalIdx = 0;
}
export class ManifoldSimplifyDto<T> {
    constructor(manifold?: T, tolerance?: number) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
    }
    /**
     * Manifold shape
     */
    manifold!: T;
    /**
     * The maximum distance between the original and simplified meshes. 
     * If not given or is less than the current tolerance, the current tolerance is used.
     * The result will contain a subset of the original verts and all surfaces will have moved by less than tolerance.
     * @default undefined
     * @minimum 0
     * @maximum Infinity
     * @step 0.001
     */
    tolerance?: number | undefined;
}
export class ManifoldSetPropertiesDto<T> {
    constructor(manifold?: T, numProp?: number, propFunc?: (newProp: number[], position: Base.Vector3, oldProp: number[]) => void) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (numProp !== undefined) { this.numProp = numProp; }
        if (propFunc !== undefined) { this.propFunc = propFunc; }
    }
    /**
     * Manifold shape
     */
    manifold!: T;
    /**
     * The new number of properties per vertex
     * @default 3
     * @minimum 3
     * @maximum Infinity
     * @step 1
     */
    numProp = 3;
    /**
     * A function that modifies the properties of a given vertex.
     * Note: undefined behavior will result if you read past the number of input properties or write past the number of output properties.
     * @default undefined
     */
    propFunc!: (newProp: number[], position: Base.Vector3, oldProp: number[]) => void;
}
export class ManifoldSmoothOutDto<T> {
    constructor(manifold?: T, minSharpAngle?: number, minSmoothness?: number) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (minSharpAngle !== undefined) { this.minSharpAngle = minSharpAngle; }
        if (minSmoothness !== undefined) { this.minSmoothness = minSmoothness; }
    }
    /**
     * Manifold shape
     */
    manifold!: T;
    /**
     * Any edges with angles greater
     * than this value will remain sharp. The rest will be smoothed to G1
     * continuity, with the caveat that flat faces of three or more triangles will
     * always remain flat. With a value of zero, the model is faceted, but in this
     * case there is no point in smoothing.
     * @default 60
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    minSharpAngle = 60;
    /**
     * The smoothness applied to
     * sharp angles. The default gives a hard edge, while values > 0 will give a
     * small fillet on these sharp edges. A value of 1 is equivalent to a
     * minSharpAngle of 180 - all edges will be smooth.
     * @default 0
     * @minimum 0
     * @maximum 1
     * @step 0.1
     */
    minSmoothness = 0;
}
