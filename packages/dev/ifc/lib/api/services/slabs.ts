import { resolveDto } from "@bitbybit-dev/base";
import { requireFinite, requireOutline } from "../../build/checks";
import { layerSetFor } from "../../build/materials";
import { createSlab } from "../../build/slabs-columns-beams";
import type { IfcModel } from "../../model/model-types";
import * as Inputs from "../inputs";
import type * as Resolved from "../resolved-inputs";
import { DEFAULT_MILLIMETRES } from "./defaults.constants";
import { editModel, lengthIn, lengthTolerance, modelOf, oneOf, resolveId } from "./service-support";

/**
 * Slabs: floors, roofs and landings, each an outline in a storey's plan with optional holes,
 * extruded down from its top by its thickness or by the layer set it is made of.
 * @beta
 */
export class IFCSlabs {

    /**
     * Adds a slab: an outline in a storey's plan, with optional holes, its top `topOffset` above the
     * storey's floor and its thickness below that.
     *
     * The slab is made of the named `layerSet`, first layer at the top, or of one layer `thickness`
     * thick. Outlines may wind either way.
     * @param inputs - The model, the storey, the outline and holes, the thickness or layer set, and the slab's kind
     * @returns A new model with the slab
     * @group create
     * @shortname add slab
     * @drawable false
     * @example
     * ```typescript
     * model = await bitbybit.ifc.slabs.add({
     *     model,
     *     storey: "ground",
     *     outline: [[0, 0], [10000, 0], [10000, 8000], [0, 8000]],
     *     thickness: 250,
     * });
     * ```
     */
    add(inputs: Inputs.IFC.AddSlabDto<IfcModel>): IfcModel {
        const resolved = resolveDto(Inputs.IFC.AddSlabDto, inputs) as Resolved.IFC.AddSlabDto<IfcModel>;
        const model = modelOf(resolved.model);
        requireOutline(resolved.outline, "outline");
        const holes = resolved.holes ?? [];
        holes.forEach((hole, index) => requireOutline(hole, `hole ${index}`));
        requireFinite(resolved.topOffset, "slab's top offset");
        const storey = resolveId(model, resolved.storey, "IfcBuildingStorey", "storey");
        const predefinedType = oneOf(resolved.predefinedType, Inputs.IFC.slabPredefinedTypeEnum, "predefined type");
        const thickness = lengthIn(model, resolved.thickness, DEFAULT_MILLIMETRES.slabThickness);
        return editModel(model, (tx, writer) => {
            createSlab(tx, writer, {
                storey,
                id: resolved.id,
                name: resolved.name,
                outline: resolved.outline,
                holes,
                layerSet: layerSetFor(tx, writer, resolved.layerSet, thickness, "Slab"),
                topOffset: resolved.topOffset,
                predefinedType,
            }, lengthTolerance(model));
        });
    }
}
