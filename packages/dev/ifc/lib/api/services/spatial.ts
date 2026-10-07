import { resolveDto } from "@bitbybit-dev/base";
import { requireFinite } from "../../build/checks";
import { addStorey, onlyBuilding, setStoreyElevation, storeysOf } from "../../build/spatial";
import type { IfcModel } from "../../model/model-types";
import * as Inputs from "../inputs";
import type * as Resolved from "../resolved-inputs";
import { editModel, modelOf, resolveId } from "./service-support";

/**
 * The spatial structure of a model: the storeys of its building, which every wall, slab, column and
 * beam is added to. A storey has an elevation; what stands on it is placed in its plan, with Z up
 * from its floor.
 * @beta
 */
export class IFCSpatial {

    /**
     * Adds a storey to the model's building at an elevation above the building's origin.
     *
     * Give it an `id` such as `ground` to refer to it when adding walls and slabs. The model must
     * have exactly one building, as `model.create` makes.
     * @param inputs - The model, the storey's id, name and elevation
     * @returns A new model with the storey
     * @group storeys
     * @shortname add storey
     * @drawable false
     * @example
     * ```typescript
     * model = await bitbybit.ifc.spatial.addStorey({ model, id: "first", name: "First floor", elevation: 3000 });
     * ```
     */
    addStorey(inputs: Inputs.IFC.AddStoreyDto<IfcModel>): IfcModel {
        const resolved = resolveDto(Inputs.IFC.AddStoreyDto, inputs) as Resolved.IFC.AddStoreyDto<IfcModel>;
        const model = modelOf(resolved.model);
        requireFinite(resolved.elevation, "storey's elevation");
        const building = onlyBuilding(model);
        return editModel(model, (tx, writer) => {
            addStorey(tx, writer, building, resolved.id, resolved.name, resolved.elevation);
        });
    }

    /**
     * Raises or lowers a storey to a new elevation. Everything placed on the storey moves with it;
     * the other storeys stay where they are.
     * @param inputs - The model, the storey and its new elevation
     * @returns A new model with the storey moved
     * @group storeys
     * @shortname set storey elevation
     * @drawable false
     * @example
     * ```typescript
     * model = await bitbybit.ifc.spatial.setElevation({ model, storey: "first", elevation: 3200 });
     * ```
     */
    setElevation(inputs: Inputs.IFC.SetStoreyElevationDto<IfcModel>): IfcModel {
        const resolved = resolveDto(Inputs.IFC.SetStoreyElevationDto, inputs) as Resolved.IFC.SetStoreyElevationDto<IfcModel>;
        const model = modelOf(resolved.model);
        requireFinite(resolved.elevation, "storey's elevation");
        const storey = resolveId(model, resolved.storey, "IfcBuildingStorey", "storey");
        return editModel(model, (tx, writer) => {
            setStoreyElevation(tx, writer, storey, resolved.elevation);
        });
    }

    /**
     * Lists the storeys of the model's buildings, lowest first, with their GlobalIds, names and
     * elevations.
     * @param inputs - The model
     * @returns The storeys, lowest first
     * @group storeys
     * @shortname storeys
     * @drawable false
     * @example
     * ```typescript
     * const storeys = await bitbybit.ifc.spatial.storeys({ model });
     * ```
     */
    storeys(inputs: Inputs.IFC.ModelDto<IfcModel>): Inputs.IFC.StoreyInfoDto[] {
        return storeysOf(modelOf(inputs.model));
    }
}
