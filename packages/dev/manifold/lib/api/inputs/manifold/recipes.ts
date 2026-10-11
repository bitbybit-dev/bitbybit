import type { Base } from "../base-inputs";
import type { DecomposedManifoldMeshDto } from "./pointers-and-enums";

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
     * When true, a root that cannot be built, such as an open mesh, comes back empty, and an
     * opening that cannot is left uncut; when false, both stop the build.
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

/**
 * A recipe for `recipes.meshes`, which gives the meshes its roots draw, with how finely circles are
 * divided, whether Z turns into Y, whether failures are skipped and where normals split.
 * Experimental: the recipe format may still change.
 * @beta
 */
export class BuildRecipeMeshesDto {
    constructor(recipe?: Base.Recipe, circularSegments?: number, adjustZtoY?: boolean, emptyWhenFailed?: boolean, minSharpAngle?: number) {
        if (recipe !== undefined) { this.recipe = recipe; }
        if (circularSegments !== undefined) { this.circularSegments = circularSegments; }
        if (adjustZtoY !== undefined) { this.adjustZtoY = adjustZtoY; }
        if (emptyWhenFailed !== undefined) { this.emptyWhenFailed = emptyWhenFailed; }
        if (minSharpAngle !== undefined) { this.minSharpAngle = minSharpAngle; }
    }
    /**
     * The recipe: steps such as polygons, extrusions and cuts, and the roots to draw from them, as
     * a package that describes geometry as data writes it.
     * @default undefined
     */
    recipe!: Base.Recipe;
    /**
     * How many flat sides each circle of the recipe is divided into; more is rounder.
     * @default 32
     * @minimum 3
     * @maximum Infinity
     * @step 1
     */
    circularSegments?: number | undefined = 32;
    /**
     * When true, every placement turns a quarter turn about X so the recipe's Z points along Y,
     * which is up when drawn: `(x, y, z)` becomes `(x, z, -y)`.
     * @default false
     */
    adjustZtoY?: boolean | undefined = false;
    /**
     * When true, a root that cannot be built draws as its surface if it is triangles alone, else
     * draws nothing; when false, it stops the build.
     * @default false
     */
    emptyWhenFailed?: boolean | undefined = false;
    /**
     * Edges sharper than this, in degrees, keep a normal on each side; 0 shades every face flat.
     * @default 40
     * @minimum 0
     * @maximum 180
     * @step 5
     */
    minSharpAngle?: number | undefined = 40;
}

/**
 * Where one recipe root draws: which mesh, placed by which matrix, with the root's tag and group.
 * Experimental: the recipe format may still change.
 * @beta
 */
export class RecipeMeshPlacementDto {
    /**
     * The index of the root's mesh among the meshes, or -1 when the root gives nothing to draw.
     */
    mesh!: number;
    /**
     * The column-major 4 x 4 matrix taking the mesh's coordinates to where the root draws it.
     */
    matrix!: Base.TransformMatrix;
    /**
     * The root's tag, as the recipe gives it.
     */
    tag!: Record<string, Base.RecipeTagValue>;
    /**
     * The root's group, a position in the recipe's groups.
     * @optional true
     */
    group?: number | undefined;
}

/**
 * The meshes a recipe draws, each shared one once, and one placement per root, in root order.
 * Experimental: the recipe format may still change.
 * @beta
 */
export class RecipeMeshesDto {
    /**
     * The meshes, positions and normals per vertex, each in its own coordinates.
     */
    meshes!: DecomposedManifoldMeshDto[];
    /**
     * Where each root draws, in root order.
     */
    placements!: RecipeMeshPlacementDto[];
}
