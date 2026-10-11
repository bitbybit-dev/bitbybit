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
