// A fragment of the Manifold inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../manifold-inputs.ts. Edit here, then regenerate.
import { Base } from "../base-inputs";

export class MirrorDto<T> {
    constructor(manifold?: T, normal?: Base.Vector3) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (normal !== undefined) { this.normal = normal; }
    }
    /**
     * Manifold shape
     */
    manifold!: T;
    /**
     * The normal vector of the plane to be mirrored over
     * @default [1,0,0]
     */
    normal: Base.Vector3 = [1, 0, 0];
}
export class Scale3DDto<T> {
    constructor(manifold?: T, vector?: Base.Vector3) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (vector !== undefined) { this.vector = vector; }
    }
    /**
     * Manifold shape
     */
    manifold!: T;
    /**
     * The normal vector of the plane to be mirrored over
     * @default [2,2,2]
     */
    vector: Base.Vector3 = [2, 2, 2];
}
export class TranslateDto<T> {
    constructor(manifold?: T, vector?: Base.Vector3) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (vector !== undefined) { this.vector = vector; }
    }
    /**
     * Manifold shape
     */
    manifold!: T;
    /**
     * The translation vector
     * @default undefined
     */
    vector!: Base.Vector3;
}

export class TranslateByVectorsDto<T> {
    constructor(manifold?: T, vectors?: Base.Vector3[]) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (vectors !== undefined) { this.vectors = vectors; }
    }
    /**
     * Manifold shape
     */
    manifold!: T;
    /**
     * The translation vector
     * @default undefined
     */
    vectors!: Base.Vector3[];
}
export class RotateDto<T> {
    constructor(manifold?: T, vector?: Base.Vector3) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (vector !== undefined) { this.vector = vector; }
    }
    /**
     * Manifold shape
     */
    manifold!: T;
    /**
     * The rotation vector in eulers
     * @default undefined
     */
    vector!: Base.Vector3;
}
export class RotateXYZDto<T> {
    constructor(manifold?: T, x?: number, y?: number, z?: number) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (x !== undefined) { this.x = x; }
        if (y !== undefined) { this.y = y; }
        if (z !== undefined) { this.z = z; }
    }
    /**
     * Manifold shape
     */
    manifold!: T;
    /**
     * The rotation vector in eulers on X axis
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    x = 0;
    /**
     * The rotation vector in eulers on Y axis
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    y = 0;
    /**
     * The rotation vector in eulers on Z axis
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    z = 0;
}
export class ScaleDto<T> {
    constructor(manifold?: T, factor?: number) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (factor !== undefined) { this.factor = factor; }
    }
    /**
     * Manifold shape
     */
    manifold!: T;
    /**
     * The normal vector of the plane to be mirrored over
     * @default 2
     */
    factor = 2;
}
export class TranslateXYZDto<T> {
    constructor(manifold?: T, x?: number, y?: number, z?: number) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (x !== undefined) { this.x = x; }
        if (y !== undefined) { this.y = y; }
        if (z !== undefined) { this.z = z; }
    }
    /**
     * Manifold shape
     */
    manifold!: T;
    /**
     * The translation X axis
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    x = 0;
    /**
     * The translation Y axis
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    y = 0;
    /**
     * The translation Z axis
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    z = 0;
}
export class TransformDto<T> {
    constructor(manifold?: T, transform?: Base.TransformMatrix) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (transform !== undefined) { this.transform = transform; }
    }
    /**
     * Manifold shape
     */
    manifold!: T;
    /**
     * The transform matrix to apply
     * @default undefined
     */
    transform!: Base.TransformMatrix;
}
export class TransformsDto<T> {
    constructor(manifold?: T, transforms?: Base.TransformMatrixes) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (transforms !== undefined) { this.transforms = transforms; }
    }
    /**
     * Manifold shape
     */
    manifold!: T;
    /**
     * The transform matrixes to apply
     * @default undefined
     */
    transforms!: Base.TransformMatrixes;
}
export class ManifoldWarpDto<T> {
    constructor(manifold?: T, warpFunc?: (vert: Base.Vector3) => void) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (warpFunc !== undefined) { this.warpFunc = warpFunc; }
    }
    /**
     * Manifold shape
     */
    manifold!: T;
    /**
     * A function that modifies a given vertex position
     * @default undefined
     */
    warpFunc!: (vert: Base.Vector3) => void;
}
