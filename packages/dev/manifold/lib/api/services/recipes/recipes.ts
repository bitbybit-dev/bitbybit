import type * as Manifold3D from "manifold-3d";
import { recipeSurfaceMeshes, resolveDto, toRecipe } from "@bitbybit-dev/base";
import * as Inputs from "../../inputs/manifold-inputs";
import type * as Resolved from "../../resolved-inputs";
import { executeRecipe } from "./recipe-executor";
import { recipeMeshes } from "./recipe-meshes";

const MIN_CIRCLE_SIDES = 3;
const MAX_SHARP_ANGLE = 180;
const POSITION_PROPERTIES = 3;

/**
 * Building recipes: solids described as data - polygons, circles, extrusions, turns and lofts, cuts,
 * unions, openings, transforms and triangle meshes - by a package that does not build geometry
 * itself, such as one that reads building models. Every result is a watertight mesh solid, so walls with their
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
        const recipe = toRecipe(resolved.recipe);
        if (!Number.isSafeInteger(resolved.circularSegments) || resolved.circularSegments < MIN_CIRCLE_SIDES) {
            throw new RangeError(`A circle needs at least ${MIN_CIRCLE_SIDES} sides, got ${resolved.circularSegments}`);
        }
        return executeRecipe(this.manifold, recipe, resolved.circularSegments, resolved.adjustZtoY, resolved.emptyWhenFailed);
    }

    /**
     * Builds a recipe into the meshes its roots draw, each step several roots place meshed once in
     * its own coordinates, and gives every root a placement: its mesh, its matrix and its tag.
     *
     * Turns and moves fold into the placements, so a door type placed a hundred times is one mesh;
     * normals split at edges sharper than `minSharpAngle`.
     * @param inputs - The recipe, how finely circles are divided, whether Z turns into Y, whether failures are skipped, and where normals split
     * @returns The meshes and one placement per root, in root order
     * @group build
     * @shortname recipe meshes
     * @drawable false
     * @example
     * ```typescript
     * const recipe = await bitbybit.ifc.geometry.recipe({ model });
     * const { meshes, placements } = await bitbybit.manifold.recipes.meshes({ recipe, adjustZtoY: true, emptyWhenFailed: true });
     * ```
     */
    meshes(inputs: Inputs.Manifold.BuildRecipeMeshesDto): Inputs.Manifold.RecipeMeshesDto {
        const resolved = resolveDto(Inputs.Manifold.BuildRecipeMeshesDto, inputs) as Resolved.Manifold.BuildRecipeMeshesDto;
        const recipe = toRecipe(resolved.recipe);
        if (!Number.isSafeInteger(resolved.circularSegments) || resolved.circularSegments < MIN_CIRCLE_SIDES) {
            throw new RangeError(`A circle needs at least ${MIN_CIRCLE_SIDES} sides, got ${resolved.circularSegments}`);
        }
        if (!(resolved.minSharpAngle >= 0 && resolved.minSharpAngle <= MAX_SHARP_ANGLE)) {
            throw new RangeError(`minSharpAngle must be an angle from 0 to ${MAX_SHARP_ANGLE} degrees, got ${resolved.minSharpAngle}`);
        }
        return recipeMeshes(this.manifold, recipe, resolved);
    }

    /**
     * Gives the roots of a recipe made of triangle meshes alone as meshes, placed as `build` places
     * its solids, without building anything.
     *
     * `build` gives an open mesh back empty, since it cannot be a solid; this gives it as the surface
     * it is, its openings left uncut. A root holding any other step comes back as an empty mesh.
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
