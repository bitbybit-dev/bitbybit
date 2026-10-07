import type { Base } from "../base-inputs";

/**
 * A recipe for `recipes.build`, which builds each of its roots as a solid, with how finely circles
 * are divided and whether Z turns into Y. Experimental: the recipe format may still change.
 * @beta
 */
export class BuildRecipeDto {
    constructor(recipe?: Base.Recipe, circularSegments?: number, adjustZtoY?: boolean, emptyWhenFailed?: boolean) {
        if (recipe !== undefined) { this.recipe = recipe; }
        if (circularSegments !== undefined) { this.circularSegments = circularSegments; }
        if (adjustZtoY !== undefined) { this.adjustZtoY = adjustZtoY; }
        if (emptyWhenFailed !== undefined) { this.emptyWhenFailed = emptyWhenFailed; }
    }
    /**
     * The recipe: steps such as polygons, extrusions and cuts, and the roots to build from them, as
     * a package that describes geometry as data writes it.
     * @default undefined
     */
    recipe!: Base.Recipe;
    /**
     * How many flat sides each circle of the recipe is divided into; more is rounder. The recipe
     * leaves this to the kernel, so it is chosen here.
     * @default 32
     * @minimum 3
     * @maximum Infinity
     * @step 1
     */
    circularSegments?: number | undefined = 32;
    /**
     * When true, each solid turns a quarter turn about X so the recipe's Z points along Y, which is
     * up when drawn: `(x, y, z)` becomes `(x, z, -y)`.
     * @default false
     */
    adjustZtoY?: boolean | undefined = false;
    /**
     * When true, a root that cannot be built, such as an open triangle mesh, comes back empty and
     * the others are still built; when false, it stops the build.
     * @default false
     */
    emptyWhenFailed?: boolean | undefined = false;
}

/**
 * A recipe for `recipes.surfaceMeshes`, which gives the roots made of triangle meshes alone as
 * meshes, with which roots to read and whether Z turns into Y. Experimental: the recipe format may
 * still change.
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
     * from them, as a package that describes geometry as data writes it.
     * @default undefined
     */
    recipe!: Base.Recipe;
    /**
     * The positions of the roots to read, such as the ones `recipes.build` gave back empty; every
     * root when left out.
     * @default undefined
     * @optional true
     */
    roots?: number[] | undefined;
    /**
     * When true, each mesh turns a quarter turn about X so the recipe's Z points along Y, as
     * `recipes.build` turns its solids: `(x, y, z)` becomes `(x, z, -y)`.
     * @default false
     */
    adjustZtoY?: boolean | undefined = false;
}
