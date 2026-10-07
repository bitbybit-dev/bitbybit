import type * as Manifold3D from "manifold-3d";
import { assertRecipe, recipeSurfaceMeshes, resolveDto } from "@bitbybit-dev/base";
import * as Inputs from "../../inputs/manifold-inputs";
import type * as Resolved from "../../resolved-inputs";
import { executeRecipe } from "./recipe-executor";

const MIN_CIRCLE_SIDES = 3;
const POSITION_PROPERTIES = 3;

/**
 * Building recipes: solids described as data - polygons, circles, extrusions, cuts by planes,
 * openings, transforms and triangle meshes - by a package that does not build geometry itself, such
 * as one that reads building models. Every result is a watertight mesh solid, so walls with their
 * openings cut and roofs clipped come back ready to draw or to combine further.
 *
 * Experimental: the recipe format may still change before it is declared stable.
 * @beta
 */
export class ManifoldRecipes {

    private manifold: Manifold3D.ManifoldToplevel;

    constructor(wasm: Manifold3D.ManifoldToplevel) {
        this.manifold = wasm;
    }

    /**
     * Builds each root of a recipe as a solid placed by its matrix, in root order.
     *
     * Shared nodes are built once. An invalid recipe throws before anything is built; a root the
     * kernel cannot build, such as an open mesh, throws naming its node unless `emptyWhenFailed` is
     * set. Circles get `circularSegments` sides; `tolerance` and `millimetresPerUnit` are not applied.
     * @param inputs - The recipe, how finely circles are divided, and whether Z turns into Y
     * @returns One solid per root, in root order
     * @group build
     * @shortname build recipe
     * @drawable true
     * @example
     * ```typescript
     * const recipe = await bitbybit.ifc.geometry.recipe({ model });
     * const solids = await bitbybit.manifold.recipes.build({ recipe, adjustZtoY: true, emptyWhenFailed: true });
     * ```
     */
    build(inputs: Inputs.Manifold.BuildRecipeDto): Manifold3D.Manifold[] {
        const resolved = resolveDto(Inputs.Manifold.BuildRecipeDto, inputs) as Resolved.Manifold.BuildRecipeDto;
        assertRecipe(resolved.recipe);
        if (!Number.isSafeInteger(resolved.circularSegments) || resolved.circularSegments < MIN_CIRCLE_SIDES) {
            throw new RangeError(`A circle needs at least ${MIN_CIRCLE_SIDES} sides, got ${resolved.circularSegments}`);
        }
        return executeRecipe(this.manifold, resolved.recipe, resolved.circularSegments, resolved.adjustZtoY, resolved.emptyWhenFailed);
    }

    /**
     * Gives the roots of a recipe made of triangle meshes alone as meshes, placed as `build` places
     * its solids, without building anything.
     *
     * `build` gives an open mesh back empty, since it cannot be a solid; this gives it as the surface
     * it is, to draw. A root holding any other step comes back as an empty mesh.
     * @param inputs - The recipe, which roots to read, and whether Z turns into Y
     * @returns One mesh per asked root, in the order asked, ready to draw
     * @group build
     * @shortname surface meshes
     * @drawable true
     * @example
     * ```typescript
     * const solids = await bitbybit.manifold.recipes.build({ recipe, adjustZtoY: true, emptyWhenFailed: true });
     * const meshes = await bitbybit.manifold.manifold.manifoldsToMeshes({ manifolds: solids });
     * const open = meshes.flatMap((mesh, index) => mesh.triVerts.length === 0 ? [index] : []);
     * const surfaces = await bitbybit.manifold.recipes.surfaceMeshes({ recipe, roots: open, adjustZtoY: true });
     * ```
     */
    surfaceMeshes(inputs: Inputs.Manifold.RecipeSurfaceMeshesDto): Inputs.Manifold.DecomposedManifoldMeshDto[] {
        const resolved = resolveDto(Inputs.Manifold.RecipeSurfaceMeshesDto, inputs) as Resolved.Manifold.RecipeSurfaceMeshesDto;
        return recipeSurfaceMeshes(resolved.recipe, resolved.roots, resolved.adjustZtoY).map((mesh) => ({
            numProp: POSITION_PROPERTIES,
            vertProperties: mesh?.positions ?? new Float32Array(0),
            triVerts: mesh?.indices ?? new Uint32Array(0),
        }));
    }
}
