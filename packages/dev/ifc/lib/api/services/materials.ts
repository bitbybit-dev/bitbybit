import { resolveDto } from "@bitbybit-dev/base";
import type { SurfaceColour } from "../../build/build-types";
import { createLayerSet, createMaterial } from "../../build/materials";
import type { IfcModel } from "../../model/model-types";
import * as Inputs from "../inputs";
import type * as Resolved from "../resolved-inputs";
import { DEFAULT_MILLIMETRES } from "./defaults.constants";
import { editModel, lengthIn, modelOf } from "./service-support";

const HEX_COLOUR = /^#?([0-9a-fA-F]{6})$/;
const HEX_RADIX = 16;
const CHANNEL_MAX = 255;
const GREEN_AT = 2;
const BLUE_AT = 4;

function parseHexColour(color: string, transparency: number): SurfaceColour {
    const match = HEX_COLOUR.exec(color);
    if (!match) {
        throw new Error(`A colour is written as hex such as #b5651d, got '${color}'`);
    }
    const hex = match[1]!;
    const channel = (at: number): number => Number.parseInt(hex.slice(at, at + 2), HEX_RADIX) / CHANNEL_MAX;
    return { red: channel(0), green: channel(GREEN_AT), blue: channel(BLUE_AT), transparency };
}

/**
 * The materials elements are made of: plain materials with an optional colour, and layer sets that
 * stack materials into the thickness of a wall or slab. Materials and layer sets are referred to by
 * their names, which are unique in a model.
 * @beta
 */
export class IFCMaterials {

    /**
     * Adds a material, which layer sets, columns and beams then refer to by its name.
     *
     * With a `color`, the material carries a surface style that viewers show it in.
     * @param inputs - The model, the material's name, category, colour and transparency
     * @returns A new model with the material
     * @group materials
     * @shortname add material
     * @drawable false
     * @example
     * ```typescript
     * model = await bitbybit.ifc.materials.add({ model, name: "Brick", category: "brick", color: "#b5651d" });
     * ```
     */
    add(inputs: Inputs.IFC.AddMaterialDto<IfcModel>): IfcModel {
        const resolved = resolveDto(Inputs.IFC.AddMaterialDto, inputs) as Resolved.IFC.AddMaterialDto<IfcModel>;
        const model = modelOf(resolved.model);
        if (!(resolved.transparency >= 0 && resolved.transparency <= 1)) {
            throw new RangeError(`Transparency goes from 0 to 1, got ${resolved.transparency}`);
        }
        const colour = resolved.color === undefined ? undefined : parseHexColour(resolved.color, resolved.transparency);
        return editModel(model, (tx, writer) => {
            createMaterial(tx, writer, resolved.name, resolved.category, colour);
        });
    }

    /**
     * Adds a layer set: materials stacked in order, each with its thickness, which walls, wall types
     * and slabs are then made of.
     *
     * A wall's first layer is on its right face, looking from its start to its end; a slab's first
     * layer is at its top. A layer's material must have been added before, by name.
     * @param inputs - The model, the layer set's name and its layers
     * @returns A new model with the layer set
     * @group materials
     * @shortname add layer set
     * @drawable false
     * @example
     * ```typescript
     * model = await bitbybit.ifc.materials.addLayerSet({
     *     model,
     *     name: "Exterior wall",
     *     layers: [{ material: "Brick", thickness: 115 }, { material: "Insulation", thickness: 100 }],
     * });
     * ```
     */
    addLayerSet(inputs: Inputs.IFC.AddLayerSetDto<IfcModel>): IfcModel {
        const resolved = resolveDto(Inputs.IFC.AddLayerSetDto, inputs) as Resolved.IFC.AddLayerSetDto<IfcModel>;
        const model = modelOf(resolved.model);
        if (!Array.isArray(resolved.layers)) {
            throw new TypeError("Expected the layers as a list");
        }
        const layers = resolved.layers.map((layer) => {
            const full: Resolved.IFC.MaterialLayerDto = resolveDto(Inputs.IFC.MaterialLayerDto, layer);
            return { material: full.material, thickness: lengthIn(model, full.thickness, DEFAULT_MILLIMETRES.layerThickness), name: full.name };
        });
        return editModel(model, (tx, writer) => {
            createLayerSet(tx, writer, resolved.name, layers);
        });
    }
}
