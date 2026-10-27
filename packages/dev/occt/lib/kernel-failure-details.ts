/** The edges of a shape a fillet could not round, counted from 0 as `shapes.edge.getEdges` counts them. */
export type EdgeFailureDetails = {
    readonly edges: readonly number[];
};

/** The corners a fillet or a bend could not round, counted from 1. */
export type CornerFailureDetails = {
    readonly corners: readonly number[];
};

/** The trihedron a sweep was made with, as `geomFillTrihedronEnum` names it. */
export type TrihedronFailureDetails = {
    readonly trihedron: string;
};

/**
 * The feature a design build was making when the kernel crashed: its id, and the JSON pointer of it
 * in the document, such as `/features/3`.
 */
export type DesignCrashDetails = {
    readonly feature: string;
    readonly path: string;
};

/**
 * The step of a recipe that could not be built: its position among the recipe's nodes, the first
 * root built on it, and the kernel's reason.
 */
export type RecipeFailureDetails = {
    readonly node: number;
    readonly root: number;
    readonly reason: string;
};
