import { resolveDto } from "@bitbybit-dev/base";
import { requireFinite, requireOutline } from "../../build/checks";
import { createSpace, spacesOf } from "../../build/spaces";
import type { IfcModel } from "../../model/model-types";
import * as Inputs from "../inputs";
import type * as Resolved from "../resolved-inputs";
import { DEFAULT_MILLIMETRES } from "./defaults.constants";
import { editModel, lengthIn, lengthTolerance, modelOf, oneOf, resolveId } from "./service-support";

/**
 * Spaces: the rooms and areas of a storey, each an outline in the storey's plan extruded up to its
 * height, with a number and a name. Tools schedule rooms and their areas from them.
 * @beta
 */
export class IFCSpaces {

    /**
     * Adds a space to a storey: a room or an area, from an outline in the storey's plan, `height`
     * high. A space is part of its storey, as IFC aggregates spaces, rather than an element on it.
     * @param inputs - The model, the storey, the outline, the height, and the space's number and name
     * @returns A new model with the space
     * @group create
     * @shortname add space
     * @drawable false
     * @example
     * ```typescript
     * model = await bitbybit.ifc.spaces.add({ model, storey: "ground", id: "kitchen", name: "0.01", longName: "Kitchen", outline: [[0, 0], [4000, 0], [4000, 3000], [0, 3000]], height: 2700 });
     * ```
     */
    add(inputs: Inputs.IFC.AddSpaceDto<IfcModel>): IfcModel {
        const resolved = resolveDto(Inputs.IFC.AddSpaceDto, inputs) as Resolved.IFC.AddSpaceDto<IfcModel>;
        const model = modelOf(resolved.model);
        requireOutline(resolved.outline, "outline");
        requireFinite(resolved.baseOffset, "base offset");
        const storey = resolveId(model, resolved.storey, "IfcBuildingStorey", "storey");
        const predefinedType = oneOf(resolved.predefinedType, Inputs.IFC.spacePredefinedTypeEnum, "predefined type");
        const height = lengthIn(model, resolved.height, DEFAULT_MILLIMETRES.spaceHeight);
        return editModel(model, (tx, writer) => {
            createSpace(tx, writer, {
                storey,
                id: resolved.id,
                name: resolved.name,
                longName: resolved.longName,
                outline: resolved.outline,
                height,
                baseOffset: resolved.baseOffset,
                predefinedType,
            }, lengthTolerance(model));
        });
    }

    /**
     * Lists the spaces of the model, or of one storey, with their numbers, names, areas and heights.
     * @param inputs - The model and, optionally, the storey
     * @returns The spaces
     * @group query
     * @shortname list spaces
     * @drawable false
     * @example
     * ```typescript
     * const rooms = await bitbybit.ifc.spaces.list({ model, storey: "ground" });
     * ```
     */
    list(inputs: Inputs.IFC.SpacesDto<IfcModel>): Inputs.IFC.SpaceInfoDto[] {
        const model = modelOf(inputs.model);
        const storey = inputs.storey === undefined ? undefined : resolveId(model, inputs.storey, "IfcBuildingStorey", "storey");
        return spacesOf(model, storey);
    }
}
