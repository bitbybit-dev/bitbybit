import { resolveDto } from "@bitbybit-dev/base";
import { createDoorType, createFilling } from "../../build/fillings";
import type { IfcModel } from "../../model/model-types";
import * as Inputs from "../inputs";
import type * as Resolved from "../resolved-inputs";
import type { HandleSizes } from "../../build/build-types";
import type { ModelSnapshot } from "../../model/snapshot";
import { DEFAULT_MILLIMETRES, HANDLE_MILLIMETRES } from "./defaults.constants";
import { editModel, lengthIn, lengthTolerance, modelOf, oneOf, resolveId } from "./service-support";

function handleSizesIn(model: ModelSnapshot): HandleSizes {
    const size = (millimetres: number): number => lengthIn(model, undefined, millimetres);
    return {
        inset: size(HANDLE_MILLIMETRES.inset),
        leverHeight: size(HANDLE_MILLIMETRES.leverHeight),
        leverStandoff: size(HANDLE_MILLIMETRES.leverStandoff),
        leverSection: size(HANDLE_MILLIMETRES.leverSection),
        leverLength: size(HANDLE_MILLIMETRES.leverLength),
        pullBarLength: size(HANDLE_MILLIMETRES.pullBarLength),
        pullBarMiddle: size(HANDLE_MILLIMETRES.pullBarMiddle),
        pullBarStandoff: size(HANDLE_MILLIMETRES.pullBarStandoff),
        pullBarSection: size(HANDLE_MILLIMETRES.pullBarSection),
        pullBarPost: size(HANDLE_MILLIMETRES.pullBarPost),
        pullBarPostInset: size(HANDLE_MILLIMETRES.pullBarPostInset),
    };
}

/**
 * Doors: door types, each a lining around one panel, and doors of those types placed in walls. A
 * door cuts its own opening and shares its type's geometry, so a type placed many times is written
 * once.
 * @beta
 */
export class IFCDoors {

    /**
     * Adds a door type: a lining around one panel, `width` by `height`, which doors are then placed
     * from.
     *
     * The lining's sides and head are `liningThickness` wide and `liningDepth` deep; the panel sits
     * in the middle of the depth. A `handle` goes on both faces, away from the hinges. Materials give
     * the lining, panel and handle their colours.
     * @param inputs - The model, the type's id and name, its sizes and how it opens
     * @returns A new model with the door type
     * @group types
     * @shortname add door type
     * @drawable false
     * @example
     * ```typescript
     * model = await bitbybit.ifc.doors.addType({ model, id: "door-90", name: "Door 900", width: 900, height: 2100 });
     * ```
     */
    addType(inputs: Inputs.IFC.AddDoorTypeDto<IfcModel>): IfcModel {
        const resolved = resolveDto(Inputs.IFC.AddDoorTypeDto, inputs) as Resolved.IFC.AddDoorTypeDto<IfcModel>;
        const model = modelOf(resolved.model);
        const spec = {
            id: resolved.id,
            name: resolved.name,
            width: lengthIn(model, resolved.width, DEFAULT_MILLIMETRES.doorWidth),
            height: lengthIn(model, resolved.height, DEFAULT_MILLIMETRES.doorHeight),
            liningThickness: lengthIn(model, resolved.liningThickness, DEFAULT_MILLIMETRES.liningThickness),
            liningDepth: lengthIn(model, resolved.liningDepth, DEFAULT_MILLIMETRES.liningDepth),
            panelThickness: lengthIn(model, resolved.panelThickness, DEFAULT_MILLIMETRES.panelThickness),
            operation: oneOf(resolved.operation, Inputs.IFC.doorOperationEnum, "door operation"),
            liningMaterial: resolved.liningMaterial,
            panelMaterial: resolved.panelMaterial,
            handle: oneOf(resolved.handle, Inputs.IFC.doorHandleEnum, "door handle"),
            handleMaterial: resolved.handleMaterial,
            hardware: handleSizesIn(model),
        };
        return editModel(model, (tx, writer) => {
            createDoorType(tx, writer, spec);
        });
    }

    /**
     * Places a door of a door type in a wall, `offset` along the wall's axis from its start, cutting
     * an opening as wide and high as the type.
     *
     * The door is centred in the wall's thickness and belongs to the wall's storey. It must fit
     * along the wall.
     * @param inputs - The model, the wall, the door type, and where the door goes
     * @returns A new model with the door
     * @group create
     * @shortname add door
     * @drawable false
     * @example
     * ```typescript
     * model = await bitbybit.ifc.doors.add({ model, wall: "south", doorType: "door-90", id: "front-door", offset: 2000 });
     * ```
     */
    add(inputs: Inputs.IFC.AddDoorDto<IfcModel>): IfcModel {
        const resolved = resolveDto(Inputs.IFC.AddDoorDto, inputs) as Resolved.IFC.AddDoorDto<IfcModel>;
        const model = modelOf(resolved.model);
        const wall = resolveId(model, resolved.wall, "IfcWall", "wall");
        const type = resolveId(model, resolved.doorType, "IfcDoorType", "door type");
        return editModel(model, (tx, writer) => {
            const offset = lengthIn(model, resolved.offset, DEFAULT_MILLIMETRES.openingOffset);
            createFilling(tx, writer, "IfcDoor", { wall, type, id: resolved.id, name: resolved.name, offset, sill: resolved.sill }, lengthTolerance(model));
        });
    }
}
