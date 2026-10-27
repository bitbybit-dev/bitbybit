/* eslint-disable @typescript-eslint/no-namespace */
import type { Base } from "./base-inputs";

/**
 * Parameters for working with recipes without a CAD kernel: the recipe to check or read, the roots
 * to draw as meshes, and the node to follow. Experimental: the recipe format may still change before
 * it is declared stable.
 * @beta
 */
export namespace Recipes {
    /**
     * A recipe for `recipes.check` and `recipes.read`, as it came from a file, another thread or a
     * caller.
     * @beta
     */
    export class RecipeDto {
        constructor(recipe?: Base.Recipe) {
            if (recipe !== undefined) { this.recipe = recipe; }
        }
        /**
         * The recipe: steps such as polygons, extrusions and cuts, and the roots to build from them;
         * its buffers may be typed arrays or, as JSON holds them, lists of numbers.
         * @default undefined
         */
        recipe!: Base.Recipe;
    }

    /**
     * A recipe for `recipes.surfaceMeshes`, which gives the roots made of triangle meshes alone as
     * meshes, with which roots to read and whether Z turns into Y.
     * @beta
     */
    export class RecipeSurfaceMeshesDto {
        constructor(recipe?: Base.Recipe, roots?: number[], adjustZtoY?: boolean) {
            if (recipe !== undefined) { this.recipe = recipe; }
            if (roots !== undefined) { this.roots = roots; }
            if (adjustZtoY !== undefined) { this.adjustZtoY = adjustZtoY; }
        }
        /**
         * The recipe: steps such as polygons, extrusions and triangle meshes, and the roots to build
         * from them.
         * @default undefined
         */
        recipe!: Base.Recipe;
        /**
         * The positions of the roots to read; every root when left out.
         * @default undefined
         * @optional true
         */
        roots?: number[] | undefined;
        /**
         * When true, each mesh turns a quarter turn about X, as a kernel's recipe build does with
         * this option: `(x, y, z)` becomes `(x, z, -y)`.
         * @default false
         */
        adjustZtoY?: boolean | undefined = false;
    }

    /**
     * A node of a recipe for `recipes.sourceOf`, which follows it through the transforms that only
     * turn and move to the step it places, with the matrix that places the node.
     * @beta
     */
    export class RecipeSourceDto {
        constructor(recipe?: Base.Recipe, node?: number, matrix?: Base.TransformMatrix) {
            if (recipe !== undefined) { this.recipe = recipe; }
            if (node !== undefined) { this.node = node; }
            if (matrix !== undefined) { this.matrix = matrix; }
        }
        /**
         * The recipe the node belongs to, as `recipes.read` gives it; one without `nodes` is refused.
         * @default undefined
         */
        recipe!: Base.Recipe;
        /**
         * The position of the node to follow in the recipe's nodes, such as a root's `node`.
         * @default 0
         * @minimum 0
         * @maximum Infinity
         * @step 1
         */
        node?: number | undefined = 0;
        /**
         * What places the node, as a column-major 4 x 4 matrix of 16 finite numbers, such as its
         * root's `matrix`; anything else is refused.
         * @default undefined
         */
        matrix!: Base.TransformMatrix;
    }
}
