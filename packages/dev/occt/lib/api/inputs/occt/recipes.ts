import type { Base } from "@bitbybit-dev/base";

/**
 * A recipe for `recipes.build`, with whether Z turns into Y, whether a root that cannot be built
 * stops the build, and how large a triangle mesh is built. Experimental: the recipe format may still
 * change.
 * @beta
 */
export class BuildRecipeDto {
    constructor(recipe?: Base.Recipe, adjustZtoY?: boolean, emptyWhenFailed?: boolean, facetedMeshes?: boolean, maxTriangles?: number) {
        if (recipe !== undefined) { this.recipe = recipe; }
        if (adjustZtoY !== undefined) { this.adjustZtoY = adjustZtoY; }
        if (emptyWhenFailed !== undefined) { this.emptyWhenFailed = emptyWhenFailed; }
        if (facetedMeshes !== undefined) { this.facetedMeshes = facetedMeshes; }
        if (maxTriangles !== undefined) { this.maxTriangles = maxTriangles; }
    }
    /**
     * The recipe: steps such as polygons, extrusions and cuts, and the roots to build from them, as
     * a package that describes geometry as data writes it.
     * @default undefined
     */
    recipe!: Base.Recipe;
    /**
     * When true, each shape turns a quarter turn about X so the recipe's Z points along Y, which is
     * up when drawn: `(x, y, z)` becomes `(x, z, -y)`.
     * @default false
     */
    adjustZtoY?: boolean | undefined = false;
    /**
     * When true, a root that cannot be built comes back as an empty compound and an opening that
     * cannot is left uncut; when false, either stops the build.
     * @default false
     */
    emptyWhenFailed?: boolean | undefined = false;
    /**
     * When true, triangle meshes become faceted solids, flat faces that cut and fillet like any
     * shape; when false they keep their triangles, which draw, measure and export to STEP faster.
     * @default false
     */
    facetedMeshes?: boolean | undefined = false;
    /**
     * The most triangles a mesh built as a faceted solid may hold; a larger one is not built and
     * counts as a step that failed.
     * @default 100000
     * @minimum 0
     * @maximum Infinity
     * @step 10000
     */
    maxTriangles?: number | undefined = 100000;
}

/**
 * A recipe for `recipes.buildDocument`, with the name of the top assembly, the tag that groups roots
 * into products, whether a failed root stops the build, and how large a mesh is built. Experimental:
 * the recipe format may still change.
 * @beta
 */
export class BuildRecipeDocumentDto {
    constructor(recipe?: Base.Recipe, name?: string, groupBy?: string, emptyWhenFailed?: boolean, facetedMeshes?: boolean, maxTriangles?: number) {
        if (recipe !== undefined) { this.recipe = recipe; }
        if (name !== undefined) { this.name = name; }
        if (groupBy !== undefined) { this.groupBy = groupBy; }
        if (emptyWhenFailed !== undefined) { this.emptyWhenFailed = emptyWhenFailed; }
        if (facetedMeshes !== undefined) { this.facetedMeshes = facetedMeshes; }
        if (maxTriangles !== undefined) { this.maxTriangles = maxTriangles; }
    }
    /**
     * The recipe: steps such as polygons, extrusions and cuts, and the roots to build from them, as
     * a package that describes geometry as data writes it.
     * @default undefined
     */
    recipe!: Base.Recipe;
    /**
     * The name of the assembly at the top of the document, which holds every product.
     * @default Recipe
     */
    name?: string | undefined = "Recipe";
    /**
     * The tag whose value gathers roots into one product, such as the pieces of one element in
     * different colours. Roots without it are each a product of their own.
     * @default globalId
     */
    groupBy?: string | undefined = "globalId";
    /**
     * When true, a root that cannot be built is left out of the document and an opening that cannot
     * is left uncut; when false, either stops the build.
     * @default false
     */
    emptyWhenFailed?: boolean | undefined = false;
    /**
     * When true, triangle meshes become faceted solids, flat faces that cut and fillet like any
     * shape; when false they keep their triangles, which draw, measure and export to STEP faster.
     * @default false
     */
    facetedMeshes?: boolean | undefined = false;
    /**
     * The most triangles a mesh built as a faceted solid may hold; a larger one is not built and
     * counts as a step that failed.
     * @default 100000
     * @minimum 0
     * @maximum Infinity
     * @step 10000
     */
    maxTriangles?: number | undefined = 100000;
}
