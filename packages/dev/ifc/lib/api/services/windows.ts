import { resolveDto } from "@bitbybit-dev/base";
import { createFilling, createWindowType } from "../../build/fillings";
import type { IfcModel } from "../../model/model-types";
import * as Inputs from "../inputs";
import type * as Resolved from "../resolved-inputs";
import { DEFAULT_MILLIMETRES } from "./defaults.constants";
import { editModel, lengthIn, lengthTolerance, modelOf, resolveId } from "./service-support";

/**
 * Windows: window types, each a frame around one pane of glass, and windows of those types placed
 * in walls. A window cuts its own opening and shares its type's geometry, so a type placed many
 * times is written once.
 * @beta
 */
export class IFCWindows {

    /**
     * Adds a window type: a frame around one pane, `width` by `height`, which windows are then
     * placed from.
     *
     * The frame's members are `frameThickness` wide and `frameDepth` deep; the glass sits in the
     * middle of the depth.
     * @param inputs - The model, the type's id and name, and its sizes
     * @returns A new model with the window type
     * @group types
     * @shortname add window type
     * @drawable false
     * @example
     * ```typescript
     * model = await bitbybit.ifc.windows.addType({ model, id: "window-120", name: "Window 1200", width: 1200, height: 1400 });
     * ```
     */
    addType(inputs: Inputs.IFC.AddWindowTypeDto<IfcModel>): IfcModel {
        const resolved = resolveDto(Inputs.IFC.AddWindowTypeDto, inputs) as Resolved.IFC.AddWindowTypeDto<IfcModel>;
        const model = modelOf(resolved.model);
        const spec = {
            id: resolved.id,
            name: resolved.name,
            width: lengthIn(model, resolved.width, DEFAULT_MILLIMETRES.windowWidth),
            height: lengthIn(model, resolved.height, DEFAULT_MILLIMETRES.windowHeight),
            frameThickness: lengthIn(model, resolved.frameThickness, DEFAULT_MILLIMETRES.frameThickness),
            frameDepth: lengthIn(model, resolved.frameDepth, DEFAULT_MILLIMETRES.frameDepth),
            glassThickness: lengthIn(model, resolved.glassThickness, DEFAULT_MILLIMETRES.glassThickness),
        };
        return editModel(model, (tx, writer) => {
            createWindowType(tx, writer, spec);
        });
    }

    /**
     * Places a window of a window type in a wall, `offset` along the wall's axis from its start and
     * `sill` above its base, cutting an opening as wide and high as the type.
     *
     * The window is centred in the wall's thickness and belongs to the wall's storey. It must fit
     * along the wall.
     * @param inputs - The model, the wall, the window type, and where the window goes
     * @returns A new model with the window
     * @group create
     * @shortname add window
     * @drawable false
     * @example
     * ```typescript
     * model = await bitbybit.ifc.windows.add({ model, wall: "south", windowType: "window-120", offset: 6000, sill: 900 });
     * ```
     */
    add(inputs: Inputs.IFC.AddWindowDto<IfcModel>): IfcModel {
        const resolved = resolveDto(Inputs.IFC.AddWindowDto, inputs) as Resolved.IFC.AddWindowDto<IfcModel>;
        const model = modelOf(resolved.model);
        const wall = resolveId(model, resolved.wall, "IfcWall", "wall");
        const type = resolveId(model, resolved.windowType, "IfcWindowType", "window type");
        return editModel(model, (tx, writer) => {
            const offset = lengthIn(model, resolved.offset, DEFAULT_MILLIMETRES.openingOffset);
            const sill = lengthIn(model, resolved.sill, DEFAULT_MILLIMETRES.windowSill);
            createFilling(tx, writer, "IfcWindow", { wall, type, id: resolved.id, name: resolved.name, offset, sill }, lengthTolerance(model));
        });
    }
}
