import type { Base } from "../inputs/base-inputs";

/**
 * One thing wrong with a recipe: where it is, as a path such as `nodes[3].depth`, and what is wrong.
 * @beta
 */
export interface RecipeIssue {
    /**
     * Where in the recipe the problem is.
     */
    readonly path: string;
    /**
     * What is wrong, in a sentence.
     */
    readonly message: string;
}

/**
 * The triangles a recipe root describes, placed by its matrices: `x, y, z` per vertex and three
 * vertex indices per triangle, wound so that a mirroring matrix keeps the outside out.
 * @beta
 */
export interface RecipeSurfaceMesh {
    /**
     * The vertex positions, three numbers each.
     */
    readonly positions: Float32Array;
    /**
     * The triangles, three vertex indices each.
     */
    readonly indices: Uint32Array;
}

export interface SurfacePiece {
    readonly node: Base.RecipeTrianglesNode;
    readonly matrix: Base.TransformMatrix;
}
