import { resolveDto } from "@bitbybit-dev/base";
import { requireFinite, requireOutline } from "../../build/checks";
import { layerSetFor } from "../../build/materials";
import { createRoof } from "../../build/roofs";
import type { IfcModel } from "../../model/model-types";
import * as Inputs from "../inputs";
import type * as Resolved from "../resolved-inputs";
import { DEFAULT_MILLIMETRES } from "./defaults.constants";
import { editModel, lengthIn, lengthTolerance, modelOf, oneOf, resolveId } from "./service-support";

/**
 * Roofs: flat, mono-pitch, gable and hip roofs over a rectangle, each an `IfcRoof` whose parts are the
 * sloping slabs of its planes. Walls are clipped under a roof with `walls.clipByRoof`.
 * @beta
 */
export class IFCRoofs {

    /**
     * Adds a roof over a rectangle of a storey: flat, sloping one way, gabled, or hipped on all four
     * sides. Every slope has the same `pitch`; its underside meets the outline at `baseOffset` above
     * the storey's floor and reaches `overhang` past it on every side.
     * @param inputs - The model, the storey, the rectangle, the roof's shape, pitch, thickness and overhang
     * @returns A new model with the roof
     * @group create
     * @shortname add roof
     * @drawable false
     * @example
     * ```typescript
     * model = await bitbybit.ifc.roofs.add({ model, storey: "first", id: "roof", outline: [[0, 0], [10000, 0], [10000, 8000], [0, 8000]], kind: Bit.Inputs.IFC.roofKindEnum.gable, pitch: 35, baseOffset: 3000, overhang: 400 });
     * ```
     */
    add(inputs: Inputs.IFC.AddRoofDto<IfcModel>): IfcModel {
        const resolved = resolveDto(Inputs.IFC.AddRoofDto, inputs) as Resolved.IFC.AddRoofDto<IfcModel>;
        const model = modelOf(resolved.model);
        requireOutline(resolved.outline, "outline");
        requireFinite(resolved.pitch, "pitch");
        requireFinite(resolved.overhang, "overhang");
        requireFinite(resolved.baseOffset, "base offset");
        const storey = resolveId(model, resolved.storey, "IfcBuildingStorey", "storey");
        const kind = oneOf(resolved.kind, Inputs.IFC.roofKindEnum, "roof kind");
        const thickness = lengthIn(model, resolved.thickness, DEFAULT_MILLIMETRES.slabThickness);
        return editModel(model, (tx, writer) => {
            createRoof(tx, writer, {
                storey,
                id: resolved.id,
                name: resolved.name,
                outline: resolved.outline,
                kind,
                pitch: resolved.pitch,
                layerSet: layerSetFor(tx, writer, resolved.layerSet, thickness, "Roof"),
                overhang: resolved.overhang,
                baseOffset: resolved.baseOffset,
            }, lengthTolerance(model));
        });
    }
}
