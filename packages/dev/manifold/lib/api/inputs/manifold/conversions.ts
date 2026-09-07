// A fragment of the Manifold inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../manifold-inputs.ts. Edit here, then regenerate.

export class ManifoldsDto<T> {
    constructor(manifolds?: T[]) {
        if (manifolds !== undefined) { this.manifolds = manifolds; }
    }
    /**
     * Manifolds
     */
    manifolds!: T[];
}

export class ManifoldToMeshDto<T> {
    constructor(manifold?: T, normalIdx?: number) {
        if (manifold !== undefined) { this.manifold = manifold; }
        if (normalIdx !== undefined) { this.normalIdx = normalIdx; }
    }
    /**
     * Manifold shape
     */
    manifold!: T;
    /**
     * Optional normal index
     */
    normalIdx?: number | undefined;
}
export class ManifoldsToMeshesDto<T> {
    constructor(manifolds?: T[], normalIdx?: number[]) {
        if (manifolds !== undefined) { this.manifolds = manifolds; }
        if (normalIdx !== undefined) { this.normalIdx = normalIdx; }
    }
    /**
     * Manifold shape
     */
    manifolds!: T[];
    /**
     * Optional normal indexes
     */
    normalIdx?: number[] | undefined;
}
export class DecomposeManifoldOrCrossSectionDto<T> {
    constructor(manifoldOrCrossSection?: T, normalIdx?: number) {
        if (manifoldOrCrossSection !== undefined) { this.manifoldOrCrossSection = manifoldOrCrossSection; }
        if (normalIdx !== undefined) { this.normalIdx = normalIdx; }
    }
    /**
     * Manifold shape
     */
    manifoldOrCrossSection!: T;
    /**
     * Optional normal index
     */
    normalIdx?: number | undefined;
}
export class ManifoldOrCrossSectionDto<T> {
    constructor(manifoldOrCrossSection?: T) {
        if (manifoldOrCrossSection !== undefined) { this.manifoldOrCrossSection = manifoldOrCrossSection; }
    }
    /**
     * Manifold or cross section
     */
    manifoldOrCrossSection!: T;
}
export class ManifoldsOrCrossSectionsDto<T> {
    constructor(manifoldsOrCrossSections?: T[]) {
        if (manifoldsOrCrossSections !== undefined) { this.manifoldsOrCrossSections = manifoldsOrCrossSections; }
    }
    /**
     * Manifolds or cross sections
     */
    manifoldsOrCrossSections!: T[];
}
export class DecomposeManifoldsOrCrossSectionsDto<T> {
    constructor(manifoldsOrCrossSections?: T[], normalIdx?: number[]) {
        if (manifoldsOrCrossSections !== undefined) { this.manifoldsOrCrossSections = manifoldsOrCrossSections; }
        if (normalIdx !== undefined) { this.normalIdx = normalIdx; }
    }
    /**
     * Manifold shape
     */
    manifoldsOrCrossSections!: T[];
    /**
     * Optional normal indexes
     */
    normalIdx?: number[] | undefined;
}
