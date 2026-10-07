import { textValue } from "../../step/values";
import type { Base } from "@bitbybit-dev/base";
import { millimetresPerUnit } from "../../build/project";
import { modelRecipe } from "../../geometry/elements";
import type { DescribedModel, ModelRecipe } from "../../geometry/geometry-types";
import type { IfcModel } from "../../model/model-types";
import type { ModelSnapshot } from "../../model/snapshot";
import type * as Inputs from "../inputs";
import { lengthTolerance, modelOf, resolveId } from "./service-support";

function described(memo: WeakMap<ModelSnapshot, DescribedModel>, inputs: Inputs.IFC.GeometryDto<IfcModel>): ModelRecipe {
    const model = modelOf(inputs.model);
    const elements: unknown = inputs.elements;
    if (elements !== undefined && !Array.isArray(elements)) {
        throw new TypeError("Expected the elements as a list of GlobalIds or ids");
    }
    const key = JSON.stringify(elements ?? null);
    const last = memo.get(model);
    if (last?.key === key) {
        return last.described;
    }
    const globalIds = inputs.elements?.map((element) => textValue(model.attribute(resolveId(model, element, "IfcProduct", "element"), "GlobalId")) ?? "");
    const result = modelRecipe(model, globalIds, millimetresPerUnit(model), lengthTolerance(model));
    memo.set(model, { key, described: result });
    return result;
}

/**
 * Describes a model's geometry as a recipe: data that a geometry kernel builds into solids or
 * meshes, one result per element, with the openings of walls and slabs cut through them and each
 * door or window type described once however many times it is placed.
 *
 * The recipe stays in the model's units and its Z up; each result is tagged with its element's
 * `globalId`, `type`, `name` and, when its material has a colour, `rgba`.
 * @beta
 */
export class IFCGeometry {
    private readonly lastDescribed = new WeakMap<ModelSnapshot, DescribedModel>();

    /**
     * Describes the geometry of a model's elements as a recipe, ready for a kernel to build.
     *
     * Each element with a body becomes one root, placed by its matrix and tagged with its GlobalId;
     * openings are cut from their hosts rather than becoming roots. An element that cannot be
     * described is left out, and `geometry.unsupported` lists it with the reason.
     * @param inputs - The model and, optionally, the elements to describe
     * @returns A recipe with one root per element
     * @group recipes
     * @shortname geometry recipe
     * @drawable false
     * @example
     * ```typescript
     * const recipe = await bitbybit.ifc.geometry.recipe({ model });
     * console.log(recipe.roots.length, recipe.millimetresPerUnit);
     * ```
     */
    recipe(inputs: Inputs.IFC.GeometryDto<IfcModel>): Base.Recipe {
        return described(this.lastDescribed, inputs).recipe;
    }

    /**
     * Lists the elements whose geometry `geometry.recipe` leaves out, each with what it could not
     * describe, such as a profile type that is not supported yet.
     *
     * An element asked for in `elements` is listed too when it has no body to describe, such as an
     * opening, a storey or an element without a 'Body' representation.
     * @param inputs - The model and, optionally, the elements to check
     * @returns The elements left out, empty when every one is described
     * @group recipes
     * @shortname unsupported geometry
     * @drawable false
     * @example
     * ```typescript
     * const problems = await bitbybit.ifc.geometry.unsupported({ model });
     * problems.forEach((problem) => console.log(problem.type, problem.message));
     * ```
     */
    unsupported(inputs: Inputs.IFC.GeometryDto<IfcModel>): Inputs.IFC.GeometryProblemDto[] {
        return described(this.lastDescribed, inputs).problems;
    }
}
