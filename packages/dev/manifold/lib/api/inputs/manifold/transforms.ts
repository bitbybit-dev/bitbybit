// A fragment of the Manifold inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../manifold-inputs.ts. Edit here, then regenerate.
import { Base } from "../base-inputs";

/**
 * A solid and a plane normal for `manifold.transforms.mirror`.
 */
export class MirrorDto<T> {
    constructor(manifold?: T, normal?: Base.Vector3) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (normal !== undefined) { this.normal = normal; }
    }
    /**
     * The solid to mirror.
     */
    manifold!: T;
    /**
     * The normal of the mirror plane through the origin; a zero vector gives an empty solid.
     * @default [1,0,0]
     */
    normal: Base.Vector3 = [1, 0, 0];
}
/**
 * A solid and three factors for `manifold.transforms.scale3D` and `manifold.transforms.scale`.
 */
export class Scale3DDto<T> {
    constructor(manifold?: T, vector?: Base.Vector3) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (vector !== undefined) { this.vector = vector; }
    }
    /**
     * The solid to scale.
     */
    manifold!: T;
    /**
     * The factors along X, Y and Z, about the origin; 1 keeps an axis as it is, 2 doubles it.
     * @default [2,2,2]
     */
    vector: Base.Vector3 = [2, 2, 2];
}
/**
 * A solid and a vector for `manifold.transforms.translate`.
 */
export class TranslateDto<T> {
    constructor(manifold?: T, vector?: Base.Vector3) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (vector !== undefined) { this.vector = vector; }
    }
    /**
     * The solid to move.
     */
    manifold!: T;
    /**
     * The vector the solid moves by, in model units.
     * @default undefined
     */
    vector!: Base.Vector3;
}

/**
 * A solid and several vectors for `manifold.transforms.translateByVectors`, one moved copy per
 * vector.
 */
export class TranslateByVectorsDto<T> {
    constructor(manifold?: T, vectors?: Base.Vector3[]) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (vectors !== undefined) { this.vectors = vectors; }
    }
    /**
     * The solid to copy and move.
     */
    manifold!: T;
    /**
     * One vector per copy, in model units.
     * @default undefined
     */
    vectors!: Base.Vector3[];
}
/**
 * A solid and three angles for `manifold.transforms.rotate`.
 */
export class RotateDto<T> {
    constructor(manifold?: T, vector?: Base.Vector3) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (vector !== undefined) { this.vector = vector; }
    }
    /**
     * The solid to rotate.
     */
    manifold!: T;
    /**
     * The Euler angles about X, Y and Z in degrees, applied in that order about the origin.
     * @default undefined
     */
    vector!: Base.Vector3;
}
/**
 * A solid and three separate angles for `manifold.transforms.rotateXYZ`.
 */
export class RotateXYZDto<T> {
    constructor(manifold?: T, x?: number, y?: number, z?: number) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (x !== undefined) { this.x = x; }
        if (y !== undefined) { this.y = y; }
        if (z !== undefined) { this.z = z; }
    }
    /**
     * The solid to rotate.
     */
    manifold!: T;
    /**
     * The rotation about the X axis in degrees, applied first.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    x = 0;
    /**
     * The rotation about the Y axis in degrees, applied second.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    y = 0;
    /**
     * The rotation about the Z axis in degrees, applied last.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    z = 0;
}
/**
 * A solid and a factor for uniform scaling; currently unused by the library, which scales through
 * `Scale3DDto`.
 */
export class ScaleDto<T> {
    constructor(manifold?: T, factor?: number) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (factor !== undefined) { this.factor = factor; }
    }
    /**
     * The solid to scale.
     */
    manifold!: T;
    /**
     * The uniform scale about the origin; 2 doubles every size.
     * @default 2
     */
    factor = 2;
}
/**
 * A solid and three distances for `manifold.transforms.translateXYZ`.
 */
export class TranslateXYZDto<T> {
    constructor(manifold?: T, x?: number, y?: number, z?: number) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (x !== undefined) { this.x = x; }
        if (y !== undefined) { this.y = y; }
        if (z !== undefined) { this.z = z; }
    }
    /**
     * The solid to move.
     */
    manifold!: T;
    /**
     * How far to move along X, in model units.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    x = 0;
    /**
     * How far to move along Y, in model units.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    y = 0;
    /**
     * How far to move along Z, in model units.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 1
     */
    z = 0;
}
/**
 * A solid and a 4x4 matrix for `manifold.transforms.transform`.
 */
export class TransformDto<T> {
    constructor(manifold?: T, transform?: Base.TransformMatrix) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (transform !== undefined) { this.transform = transform; }
    }
    /**
     * The solid to transform.
     */
    manifold!: T;
    /**
     * The column-major 4x4 matrix of 16 numbers; the translation sits at indexes 12 to 14.
     * @default undefined
     */
    transform!: Base.TransformMatrix;
}
/**
 * A solid and several 4x4 matrices for `manifold.transforms.transforms`, applied first to last.
 */
export class TransformsDto<T> {
    constructor(manifold?: T, transforms?: Base.TransformMatrixes) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (transforms !== undefined) { this.transforms = transforms; }
    }
    /**
     * The solid to transform.
     */
    manifold!: T;
    /**
     * The column-major matrices, applied one after another; the list must not be empty.
     * @default undefined
     */
    transforms!: Base.TransformMatrixes;
}
/**
 * A solid and a function for `manifold.transforms.warp`.
 */
export class ManifoldWarpDto<T> {
    constructor(manifold?: T, warpFunc?: (vert: Base.Vector3) => void) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (warpFunc !== undefined) { this.warpFunc = warpFunc; }
    }
    /**
     * The solid to warp.
     */
    manifold!: T;
    /**
     * A function that receives each vertex position and changes it in place.
     * @default undefined
     */
    warpFunc!: (vert: Base.Vector3) => void;
}
