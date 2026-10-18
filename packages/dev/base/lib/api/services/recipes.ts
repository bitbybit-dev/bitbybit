import * as Inputs from "../inputs";
import type * as Resolved from "../resolved-inputs";
import { InputError, resolveDto } from "../kernel-calls";
import { checkRecipe, toRecipe } from "../recipes/validate";
import { recipeSurfaceMeshes } from "../recipes/surface-mesh";
import { recipeSourceOf } from "../recipes/sources";
import type { RecipeIssue, RecipeSource, RecipeSurfaceMesh } from "../recipes/recipe-types";
import { isIndexBelow } from "../recipes/checks";
import { isTransformMatrix } from "./helpers/geometry/matrices";

/**
 * Recipes with no CAD kernel needed: solids described as a list of steps that `occt.recipes` and
 * `manifold.recipes` build and the `ifc` package writes, so a pipeline can hand geometry to any
 * kernel as data. Check one before a kernel runs it, read one from JSON, draw its roots made of
 * triangles, and find what a root places. Experimental: the recipe format may still change.
 * @beta
 */
export class Recipes {

    /**
     * Checks a value against the recipe format and lists what is wrong with it: steps that refer
     * forward or out of range, ranges outside their buffers, coordinates that are not finite or
     * too large, matrices that flatten, lists past their limits.
     *
     * Run it on a recipe from a file, another thread or a caller before a kernel builds it.
     * @param inputs - The recipe
     * @returns What is wrong, at most a hundred issues, each a path such as `nodes[3].depth` and a sentence; empty when nothing is
     * @group check
     * @shortname check recipe
     * @drawable false
     * @example
     * ```typescript
     * const issues = bitbybit.recipes.check({ recipe });
     * const buildable = issues.length === 0;
     * ```
     */
    check(inputs: Inputs.Recipes.RecipeDto): RecipeIssue[] {
        const resolved = resolveDto(Inputs.Recipes.RecipeDto, inputs);
        return checkRecipe(resolved.recipe);
    }

    /**
     * Reads a recipe whose buffers may be lists of numbers, as JSON holds them, into the typed
     * arrays the format keeps, and refuses one `check` finds anything wrong with.
     *
     * The value given is left as it was.
     * @param inputs - The recipe
     * @returns The recipe with typed buffers
     * @group read
     * @shortname read recipe
     * @drawable false
     * @example
     * ```typescript
     * const recipe = bitbybit.recipes.read({ recipe: JSON.parse(text) });
     * ```
     */
    read(inputs: Inputs.Recipes.RecipeDto): Inputs.Base.Recipe {
        const resolved = resolveDto(Inputs.Recipes.RecipeDto, inputs);
        return toRecipe(resolved.recipe);
    }

    /**
     * Gives the triangle meshes of the roots built from triangle nodes alone, through transforms,
     * compounds and unions, placed by their matrices, so an open mesh no solid kernel accepts can
     * still be drawn.
     *
     * A root holding any other step, such as an extrusion, gives undefined.
     * @param inputs - The recipe, the roots to read and whether Z turns into Y
     * @returns One mesh per root asked for, in that order: positions three numbers a vertex, indices three a triangle
     * @group read
     * @shortname surface meshes
     * @drawable false
     * @example
     * ```typescript
     * const [mesh] = bitbybit.recipes.surfaceMeshes({ recipe, roots: [0] });
     * ```
     */
    surfaceMeshes(inputs: Inputs.Recipes.RecipeSurfaceMeshesDto): (RecipeSurfaceMesh | undefined)[] {
        const resolved = resolveDto(Inputs.Recipes.RecipeSurfaceMeshesDto, inputs) as Resolved.Recipes.RecipeSurfaceMeshesDto;
        return recipeSurfaceMeshes(resolved.recipe, resolved.roots, resolved.adjustZtoY);
    }

    /**
     * Follows a node through the transforms that only turn and move to the step it places, folding
     * them into the matrix, so roots that place one step through different moves share it, as an
     * instanced drawing or an assembly wants.
     *
     * A transform that mirrors, scales or stretches stays a step of its own.
     * @param inputs - The recipe, the node and what places it
     * @returns The step reached and the matrix placing it
     * @group read
     * @shortname source of node
     * @drawable false
     * @example
     * ```typescript
     * const root = recipe.roots[0];
     * const { node, matrix } = bitbybit.recipes.sourceOf({ recipe, node: root.node, matrix: root.matrix });
     * ```
     */
    sourceOf(inputs: Inputs.Recipes.RecipeSourceDto): RecipeSource {
        const resolved = resolveDto(Inputs.Recipes.RecipeSourceDto, inputs) as Resolved.Recipes.RecipeSourceDto;
        const recipe: unknown = resolved.recipe;
        if (typeof recipe !== "object" || recipe === null || !Array.isArray((recipe as Partial<Inputs.Base.Recipe>).nodes)) {
            throw new InputError("`recipe` is not a recipe with a list of `nodes`.", "recipe");
        }
        if (!isTransformMatrix(resolved.matrix)) {
            throw new InputError("`matrix` is not a matrix of 16 finite numbers.", "matrix");
        }
        if (!isIndexBelow(resolved.node, resolved.recipe.nodes.length)) {
            throw new InputError(`\`node\` is not one of the recipe's ${String(resolved.recipe.nodes.length)} nodes.`, "node");
        }
        return recipeSourceOf(resolved.recipe, resolved.node, resolved.matrix);
    }
}
