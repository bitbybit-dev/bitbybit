// A fragment of the Manifold inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../manifold-inputs.ts. Edit here, then regenerate.

/**
 * Several solids for the methods that take a list, such as `manifold.booleans.union` or
 * `manifold.operations.compose`.
 */
export class ManifoldsDto<T> {
    constructor(manifolds?: T[]) {
        if (manifolds !== undefined) { this.manifolds = manifolds; }
    }
    /**
     * The solids, in the order the method uses them.
     */
    manifolds!: T[];
}

/**
 * A solid and an optional normal channel for `manifold.manifoldToMesh`.
 */
export class ManifoldToMeshDto<T> {
    constructor(manifold?: T, normalIdx?: number) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (normalIdx !== undefined) { this.normalIdx = normalIdx; }
    }
    /**
     * The solid to turn into mesh data.
     */
    manifold!: T;
    /**
     * The property channel holding the normals, when the solid carries them.
     */
    normalIdx?: number | undefined;
}
/**
 * Several solids and optional normal channels for `manifold.manifoldsToMeshes`.
 */
export class ManifoldsToMeshesDto<T> {
    constructor(manifolds?: T[], normalIdx?: number[]) {
        if (manifolds !== undefined) { this.manifolds = manifolds; }
        if (normalIdx !== undefined) { this.normalIdx = normalIdx; }
    }
    /**
     * The solids to turn into mesh data, one mesh each.
     */
    manifolds!: T[];
    /**
     * One normal channel per solid, when they carry normals.
     */
    normalIdx?: number[] | undefined;
}
/**
 * A solid or cross-section and an optional normal channel for `decomposeManifoldOrCrossSection`.
 */
export class DecomposeManifoldOrCrossSectionDto<T> {
    constructor(manifoldOrCrossSection?: T, normalIdx?: number) {
        if (manifoldOrCrossSection !== undefined) { this.manifoldOrCrossSection = manifoldOrCrossSection; }
        if (normalIdx !== undefined) { this.normalIdx = normalIdx; }
    }
    /**
     * The solid or cross-section to turn into plain data.
     */
    manifoldOrCrossSection!: T;
    /**
     * The property channel holding the normals of a solid, when it carries them.
     */
    normalIdx?: number | undefined;
}
/**
 * One solid or cross-section for the methods that accept either.
 */
export class ManifoldOrCrossSectionDto<T> {
    constructor(manifoldOrCrossSection?: T) {
        if (manifoldOrCrossSection !== undefined) { this.manifoldOrCrossSection = manifoldOrCrossSection; }
    }
    /**
     * The solid or cross-section to work on.
     */
    manifoldOrCrossSection!: T;
}
/**
 * Several solids or cross-sections for the methods that accept either kind in a list.
 */
export class ManifoldsOrCrossSectionsDto<T> {
    constructor(manifoldsOrCrossSections?: T[]) {
        if (manifoldsOrCrossSections !== undefined) { this.manifoldsOrCrossSections = manifoldsOrCrossSections; }
    }
    /**
     * The solids or cross-sections, in the order the method uses them.
     */
    manifoldsOrCrossSections!: T[];
}
/**
 * Several solids or cross-sections and optional normal channels for
 * `decomposeManifoldsOrCrossSections`.
 */
export class DecomposeManifoldsOrCrossSectionsDto<T> {
    constructor(manifoldsOrCrossSections?: T[], normalIdx?: number[]) {
        if (manifoldsOrCrossSections !== undefined) { this.manifoldsOrCrossSections = manifoldsOrCrossSections; }
        if (normalIdx !== undefined) { this.normalIdx = normalIdx; }
    }
    /**
     * The solids or cross-sections to turn into plain data, one result each.
     */
    manifoldsOrCrossSections!: T[];
    /**
     * One normal channel per shape, for the solids that carry normals.
     */
    normalIdx?: number[] | undefined;
}
