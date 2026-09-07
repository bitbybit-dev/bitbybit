// A fragment of the Manifold inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../manifold-inputs.ts. Edit here, then regenerate.
import { Base } from "../base-inputs";

export class TwoCrossSectionsDto<T> {
    constructor(crossSection1?: T, crossSection2?: T) {
        if (crossSection1 !== undefined) { this.crossSection1 = crossSection1; }
        if (crossSection2 !== undefined) { this.crossSection2 = crossSection2; }
    }
    /**
     * Manifold shape
     */
    crossSection1!: T;
    /**
     * Manifold shape
     */
    crossSection2!: T;
}
export class TwoManifoldsDto<T> {
    constructor(manifold1?: T, manifold2?: T) {
        if (manifold1 !== undefined) { this.manifold1 = manifold1; }
        if (manifold2 !== undefined) { this.manifold2 = manifold2; }
    }
    /**
     * Manifold shape
     */
    manifold1!: T;
    /**
     * Manifold shape
     */
    manifold2!: T;
}
export class SplitManifoldsDto<T> {
    constructor(manifoldToSplit?: T, manifoldCutter?: T) {
        if (manifoldToSplit !== undefined) { this.manifoldToSplit = manifoldToSplit; }
        if (manifoldCutter !== undefined) { this.manifoldCutter = manifoldCutter; }
    }
    /**
     * Manifold that will be split
     */
    manifoldToSplit!: T;
    /**
     * Manifold cutter
     */
    manifoldCutter!: T;
}
export class TrimByPlaneDto<T> {
    constructor(manifold?: T, normal?: Base.Vector3, originOffset?: number) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (normal !== undefined) { this.normal = normal; }
        if (originOffset !== undefined) { this.originOffset = originOffset; }
    }
    /**
     * Manifold that will be trimmed
     */
    manifold!: T;
    /**
     * The normal vector of the plane to be mirrored over
     * @default [1,0,0]
     */
    normal: Base.Vector3 = [1, 0, 0];
    /**
     * The offset from the origin
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    originOffset = 0;
}
export class SplitByPlaneDto<T> {
    constructor(manifold?: T, normal?: Base.Vector3, originOffset?: number) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (normal !== undefined) { this.normal = normal; }
        if (originOffset !== undefined) { this.originOffset = originOffset; }
    }
    /**
     * Manifold that will be split
     */
    manifold!: T;
    /**
     * The normal vector of the plane to be mirrored over
     * @default [1,0,0]
     */
    normal: Base.Vector3 = [1, 0, 0];
    /**
     * The offset from the origin
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    originOffset = 0;
}
export class SplitByPlaneOnOffsetsDto<T> {
    constructor(manifold?: T, normal?: Base.Vector3, originOffsets?: number[]) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (normal !== undefined) { this.normal = normal; }
        if (originOffsets !== undefined) { this.originOffsets = originOffsets; }
    }
    /**
     * Manifold that will be split
     */
    manifold!: T;
    /**
     * The normal vector of the plane to be mirrored over
     * @default [1,0,0]
     */
    normal: Base.Vector3 = [1, 0, 0];
    /**
     * The offsets from the origin
     * @default [0]
     */
    originOffsets = [0];
}
