// A fragment of the Manifold inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../manifold-inputs.ts. Edit here, then regenerate.
import { Base } from "../base-inputs";

/**
 * Two cross-sections for the pairwise methods of `crossSection.booleans`.
 */
export class TwoCrossSectionsDto<T> {
    constructor(crossSection1?: T, crossSection2?: T) {
        if (crossSection1 !== undefined) { this.crossSection1 = crossSection1; }
        if (crossSection2 !== undefined) { this.crossSection2 = crossSection2; }
    }
    /**
     * The first cross-section; for a subtraction, the one cut from.
     */
    crossSection1!: T;
    /**
     * The second cross-section; for a subtraction, the one cut with.
     */
    crossSection2!: T;
}
/**
 * Two solids for the pairwise methods of `manifold.booleans`.
 */
export class TwoManifoldsDto<T> {
    constructor(manifold1?: T, manifold2?: T) {
        if (manifold1 !== undefined) { this.manifold1 = manifold1; }
        if (manifold2 !== undefined) { this.manifold2 = manifold2; }
    }
    /**
     * The first solid; for a subtraction, the one cut from.
     */
    manifold1!: T;
    /**
     * The second solid; for a subtraction, the one cut with.
     */
    manifold2!: T;
}
/**
 * A solid and a cutter for `manifold.booleans.split`.
 */
export class SplitManifoldsDto<T> {
    constructor(manifoldToSplit?: T, manifoldCutter?: T) {
        if (manifoldToSplit !== undefined) { this.manifoldToSplit = manifoldToSplit; }
        if (manifoldCutter !== undefined) { this.manifoldCutter = manifoldCutter; }
    }
    /**
     * The solid that is cut in two.
     */
    manifoldToSplit!: T;
    /**
     * The solid that does the cutting; the pieces are what lies inside it and outside it.
     */
    manifoldCutter!: T;
}
/**
 * A solid and a plane for `manifold.booleans.trimByPlane`, which keeps the part on the normal's
 * side.
 */
export class TrimByPlaneDto<T> {
    constructor(manifold?: T, normal?: Base.Vector3, originOffset?: number) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (normal !== undefined) { this.normal = normal; }
        if (originOffset !== undefined) { this.originOffset = originOffset; }
    }
    /**
     * The solid to trim.
     */
    manifold!: T;
    /**
     * The normal of the cutting plane; the kept part lies on the side it points to, and its length
     * does not matter.
     * @default [1,0,0]
     */
    normal: Base.Vector3 = [1, 0, 0];
    /**
     * How far the plane sits from the origin along the normal, in model units.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    originOffset = 0;
}
/**
 * A solid and a plane for `manifold.booleans.splitByPlane`, which keeps both pieces.
 */
export class SplitByPlaneDto<T> {
    constructor(manifold?: T, normal?: Base.Vector3, originOffset?: number) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (normal !== undefined) { this.normal = normal; }
        if (originOffset !== undefined) { this.originOffset = originOffset; }
    }
    /**
     * The solid to split.
     */
    manifold!: T;
    /**
     * The normal of the cutting plane; the first piece lies on the side it points to, and its
     * length does not matter.
     * @default [1,0,0]
     */
    normal: Base.Vector3 = [1, 0, 0];
    /**
     * How far the plane sits from the origin along the normal, in model units.
     * @default 0
     * @minimum -Infinity
     * @maximum Infinity
     * @step 0.1
     */
    originOffset = 0;
}
/**
 * A solid, a plane normal and several distances for `manifold.booleans.splitByPlaneOnOffsets`,
 * which cuts the solid into slabs.
 */
export class SplitByPlaneOnOffsetsDto<T> {
    constructor(manifold?: T, normal?: Base.Vector3, originOffsets?: number[]) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (normal !== undefined) { this.normal = normal; }
        if (originOffsets !== undefined) { this.originOffsets = originOffsets; }
    }
    /**
     * The solid to cut into slabs.
     */
    manifold!: T;
    /**
     * The normal shared by every cutting plane; its length does not matter.
     * @default [1,0,0]
     */
    normal: Base.Vector3 = [1, 0, 0];
    /**
     * How far each plane sits from the origin along the normal, in model units, in increasing
     * order.
     * @default [0]
     */
    originOffsets = [0];
}
