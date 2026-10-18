import { Recipes, resolveDto } from "@bitbybit-dev/base";
import { millimetresPerUnit } from "../../build/project";
import { requirePoint, requireTurn } from "../../build/checks";
import { createBodiedElement } from "../../build/bodied-elements";
import { requireMaterial } from "../../build/materials";
import type { IfcModel } from "../../model/model-types";
import * as Inputs from "../inputs";
import type * as Resolved from "../resolved-inputs";
import { POINT3_SIZE } from "../../build/constants";
import { editModel, modelOf, resolveId } from "./service-support";
import { radiansOf } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/scalars";

/**
 * Elements of any kind whose body is given as data: exact boundary representations, such as an
 * OpenCascade shape described with `occt.recipes.describe`, or triangle meshes.
 * @beta
 */
export class IFCElements {

    private readonly recipes = new Recipes();

    /**
     * Adds an element of any class to a storey, its body written from a recipe: brep steps as
     * advanced breps less their cavities, triangle steps as triangulated face sets.
     *
     * The body is scaled to the model's units; its roots may move and turn it, not scale or mirror
     * it. Describe shapes with `ifcSurfaces` set.
     * @param inputs - The model, the storey, the body, and the element's class, name, placement and material
     * @returns A new model with the element
     * @group create
     * @shortname add element
     * @drawable false
     * @example
     * ```typescript
     * const body = await bitbybit.occt.recipes.describe({ shape: bracket, ifcSurfaces: true });
     * model = await bitbybit.ifc.elements.add({ model, storey: "ground", body, type: "IfcFurniture", name: "Bracket", position: [2000, 1500, 0] });
     * ```
     */
    add(inputs: Inputs.IFC.AddElementDto<IfcModel>): IfcModel {
        const resolved = resolveDto(Inputs.IFC.AddElementDto, inputs) as Resolved.IFC.AddElementDto<IfcModel>;
        const model = modelOf(resolved.model);
        const body = this.recipes.read({ recipe: resolved.body });
        requirePoint(resolved.position, POINT3_SIZE, "position");
        requireTurn(resolved.rotation, "rotation");
        const storey = resolveId(model, resolved.storey, "IfcBuildingStorey", "storey");
        const angle = radiansOf(resolved.rotation);
        const [cos, sin] = [Math.cos(angle), Math.sin(angle)];
        return editModel(model, (tx, writer) => {
            createBodiedElement(tx, writer, {
                storey,
                id: resolved.id,
                name: resolved.name,
                type: resolved.type,
                predefinedType: resolved.predefinedType,
                objectType: resolved.objectType,
                body,
                scale: body.millimetresPerUnit / millimetresPerUnit(model),
                frame: { origin: [...resolved.position], x: [cos, sin, 0], y: [-sin, cos, 0], z: [0, 0, 1] },
                material: resolved.material === undefined ? undefined : requireMaterial(tx, resolved.material),
            });
        });
    }
}
