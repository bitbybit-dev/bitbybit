import type { Base } from "@bitbybit-dev/base";
import { resolveDto } from "@bitbybit-dev/base";
import { WORLD_AXES, pointToLocal, pointToWorld } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import { requireOutline } from "../../build/checks";
import { createWallOpening, editWallOpening } from "../../build/openings";
import { absoluteFrame, objectPlacementOf } from "../../build/placement";
import { createSlabOpening } from "../../build/slab-openings";
import { containerOf, storeyFrame } from "../../build/spatial";
import type { IfcModel } from "../../model/model-types";
import * as Inputs from "../inputs";
import type * as Resolved from "../resolved-inputs";
import { DEFAULT_MILLIMETRES } from "./defaults.constants";
import { editModel, lengthIn, lengthTolerance, modelOf, resolveId } from "./service-support";

/**
 * Openings: voids cut through walls and slabs, the holes doors and windows sit in. Doors and windows
 * cut their own openings, so this is for an opening that stays empty, such as a pass-through or a
 * stairwell, and for moving an opening along its wall.
 * @beta
 */
export class IFCOpenings {

    /**
     * Cuts a rectangular opening through a wall, `offset` along its axis from its start and `sill`
     * above its base.
     *
     * The opening goes through the wall's whole thickness and stays with the wall when its joins
     * change. It must fit along the wall.
     * @param inputs - The model, the wall, and the opening's position and size
     * @returns A new model with the wall cut
     * @group create
     * @shortname add opening in wall
     * @drawable false
     * @example
     * ```typescript
     * model = await bitbybit.ifc.openings.add({ model, wall: "inner", offset: 1500, width: 1200, height: 2200 });
     * ```
     */
    add(inputs: Inputs.IFC.AddOpeningDto<IfcModel>): IfcModel {
        const resolved = resolveDto(Inputs.IFC.AddOpeningDto, inputs) as Resolved.IFC.AddOpeningDto<IfcModel>;
        const model = modelOf(resolved.model);
        const wall = resolveId(model, resolved.wall, "IfcWall", "wall");
        return editModel(model, (tx, writer) => {
            createWallOpening(tx, writer, {
                wall,
                id: resolved.id,
                name: resolved.name,
                offset: lengthIn(model, resolved.offset, DEFAULT_MILLIMETRES.openingOffset),
                sill: resolved.sill,
                width: lengthIn(model, resolved.width, DEFAULT_MILLIMETRES.openingWidth),
                height: lengthIn(model, resolved.height, DEFAULT_MILLIMETRES.openingHeight),
            }, lengthTolerance(model));
        });
    }

    /**
     * Moves an opening along its wall or up and down it, or resizes it. Given a door or window, it
     * moves it with the opening it is in, which keeps its size. A door or window placed elsewhere than
     * on its opening or wall is refused, as it would stay behind.
     * @param inputs - The model, the opening or the door or window in it, and its new position or size
     * @returns A new model with the opening moved or resized
     * @group edit
     * @shortname edit opening
     * @drawable false
     * @example
     * ```typescript
     * model = await bitbybit.ifc.openings.edit({ model, opening: "front-door", offset: 2500 });
     * ```
     */
    edit(inputs: Inputs.IFC.EditOpeningDto<IfcModel>): IfcModel {
        const resolved = resolveDto(Inputs.IFC.EditOpeningDto, inputs) as Resolved.IFC.EditOpeningDto<IfcModel>;
        const model = modelOf(resolved.model);
        const element = resolveId(model, resolved.opening, "IfcElement", "opening");
        return editModel(model, (tx, writer) => {
            editWallOpening(tx, writer, element, { offset: resolved.offset, sill: resolved.sill, width: resolved.width, height: resolved.height }, lengthTolerance(model));
        });
    }

    /**
     * Cuts an opening of any outline, such as a stairwell or a shaft, through a slab's whole thickness.
     * The outline is given in the plan of the slab's storey and must lie inside the slab's outline or on
     * its edge, which is checked when that outline is a polyline, as in the slabs this library adds.
     * @param inputs - The model, the slab and the opening's outline
     * @returns A new model with the slab cut
     * @group create
     * @shortname add opening in slab
     * @drawable false
     * @example
     * ```typescript
     * model = await bitbybit.ifc.openings.addInSlab({ model, slab: "first-floor", outline: [[1000, 1000], [3500, 1000], [3500, 2200], [1000, 2200]] });
     * ```
     */
    addInSlab(inputs: Inputs.IFC.AddSlabOpeningDto<IfcModel>): IfcModel {
        const resolved = resolveDto(Inputs.IFC.AddSlabOpeningDto, inputs) as Resolved.IFC.AddSlabOpeningDto<IfcModel>;
        const model = modelOf(resolved.model);
        requireOutline(resolved.outline, "outline");
        const slab = resolveId(model, resolved.slab, "IfcSlab", "slab");
        const storey = containerOf(model, slab);
        const plan = storey === undefined ? WORLD_AXES : storeyFrame(model, storey);
        const slabFrame = absoluteFrame(model, objectPlacementOf(model, slab));
        const outline = resolved.outline.map((point): Base.Point2 => {
            const local = pointToLocal(slabFrame, pointToWorld(plan, [point[0], point[1], 0]));
            return [local[0], local[1]];
        });
        return editModel(model, (tx, writer) => {
            createSlabOpening(tx, writer, { slab, id: resolved.id, name: resolved.name, outline }, lengthTolerance(model));
        });
    }
}
