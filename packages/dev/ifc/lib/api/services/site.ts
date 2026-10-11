import { resolveDto } from "@bitbybit-dev/base";
import { requireFinite, requireOutline } from "../../build/checks";
import { createTerrain, createTree } from "../../build/site";
import type { IfcModel } from "../../model/model-types";
import * as Inputs from "../inputs";
import type * as Resolved from "../resolved-inputs";
import { DEFAULT_MILLIMETRES } from "./defaults.constants";
import { editModel, lengthIn, lengthTolerance, modelOf } from "./service-support";

/**
 * The site around the building: its terrain and its trees, written as geographic elements of the
 * site, so the ground and planting travel with the building in the file.
 * @beta
 */
export class IFCSite {

    /**
     * Adds terrain to the site: the ground as an outline in the site's plan, with holes where the
     * building or paving meets it, its top at `elevation` and `depth` deep.
     * @param inputs - The model, the outline and its holes, the depth and elevation, and the ground's material
     * @returns A new model with the terrain
     * @group create
     * @shortname add terrain
     * @drawable false
     * @example
     * ```typescript
     * model = await bitbybit.ifc.site.addTerrain({ model, outline: [[-30000, -30000], [30000, -30000], [30000, 30000], [-30000, 30000]], holes: [[[0, 0], [10000, 0], [10000, 8000], [0, 8000]]], material: "Lawn" });
     * ```
     */
    addTerrain(inputs: Inputs.IFC.AddTerrainDto<IfcModel>): IfcModel {
        const resolved = resolveDto(Inputs.IFC.AddTerrainDto, inputs) as Resolved.IFC.AddTerrainDto<IfcModel>;
        const model = modelOf(resolved.model);
        requireOutline(resolved.outline, "outline");
        (resolved.holes ?? []).forEach((hole, index) => requireOutline(hole, `hole ${index}`));
        requireFinite(resolved.elevation, "elevation");
        return editModel(model, (tx, writer) => {
            createTerrain(tx, writer, {
                id: resolved.id,
                name: resolved.name,
                outline: resolved.outline,
                holes: resolved.holes ?? [],
                depth: lengthIn(model, resolved.depth, DEFAULT_MILLIMETRES.terrainDepth),
                elevation: resolved.elevation,
                material: resolved.material,
            }, lengthTolerance(model));
        });
    }

    /**
     * Adds a tree to the site: a tapering trunk and a rounded crown at `position`, `height` tall,
     * each part in its own material, with its species written as the element's object type.
     * @param inputs - The model, where the tree stands, its sizes, its species and its materials
     * @returns A new model with the tree
     * @group create
     * @shortname add tree
     * @drawable false
     * @example
     * ```typescript
     * model = await bitbybit.ifc.site.addTree({ model, species: "Silver birch", position: [-6000, -8000], height: 9000, crownRadius: 2200, crownMaterial: "Foliage", trunkMaterial: "Bark" });
     * ```
     */
    addTree(inputs: Inputs.IFC.AddTreeDto<IfcModel>): IfcModel {
        const resolved = resolveDto(Inputs.IFC.AddTreeDto, inputs) as Resolved.IFC.AddTreeDto<IfcModel>;
        const model = modelOf(resolved.model);
        requireFinite(resolved.position[0], "position's x");
        requireFinite(resolved.position[1], "position's y");
        requireFinite(resolved.elevation, "elevation");
        return editModel(model, (tx, writer) => {
            createTree(tx, writer, {
                id: resolved.id,
                name: resolved.name,
                species: resolved.species,
                position: resolved.position,
                elevation: resolved.elevation,
                height: lengthIn(model, resolved.height, DEFAULT_MILLIMETRES.treeHeight),
                crownRadius: lengthIn(model, resolved.crownRadius, DEFAULT_MILLIMETRES.crownRadius),
                trunkRadius: lengthIn(model, resolved.trunkRadius, DEFAULT_MILLIMETRES.trunkRadius),
                crownMaterial: resolved.crownMaterial,
                trunkMaterial: resolved.trunkMaterial,
            });
        });
    }
}
