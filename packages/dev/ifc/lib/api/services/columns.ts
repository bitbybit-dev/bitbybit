import { resolveDto } from "@bitbybit-dev/base";
import { createMember } from "../../build/slabs-columns-beams";
import type { IfcModel } from "../../model/model-types";
import * as Inputs from "../inputs";
import type * as Resolved from "../resolved-inputs";
import { requireFinite, requirePoint, requirePositive } from "../../build/checks";
import { POINT2_SIZE } from "../../build/constants";
import { DEFAULT_MILLIMETRES } from "./defaults.constants";
import { editModel, lengthIn, modelOf, resolveId } from "./service-support";
import { finiteRotation, memberMaterial, profileOf } from "./member-support";

/**
 * Columns: sections standing upright on a storey, each a rectangle, a circle or an I section
 * extruded up by the column's height.
 * @beta
 */
export class IFCColumns {

    /**
     * Adds a column standing on `position` in a storey's plan, its section centred on that point and
     * extruded `height` up from `baseOffset` above the floor.
     *
     * `profile` picks the section: a rectangle reads `width` and `depth`, a circle `radius`, an I
     * section also `webThickness` and `flangeThickness`. `rotation` turns it about the axis.
     * @param inputs - The model, the storey, the position, the height and the section
     * @returns A new model with the column
     * @group create
     * @shortname add column
     * @drawable false
     * @example
     * ```typescript
     * model = await bitbybit.ifc.columns.add({ model, storey: "ground", position: [5000, 4000], height: 2700, width: 300, depth: 300 });
     * ```
     */
    add(inputs: Inputs.IFC.AddColumnDto<IfcModel>): IfcModel {
        const resolved = resolveDto(Inputs.IFC.AddColumnDto, inputs) as Resolved.IFC.AddColumnDto<IfcModel>;
        const model = modelOf(resolved.model);
        const position = resolved.position;
        requirePoint(position, POINT2_SIZE, "position");
        const height = lengthIn(model, resolved.height, DEFAULT_MILLIMETRES.columnHeight);
        requirePositive(height, "column's height");
        requireFinite(resolved.baseOffset, "column's base offset");
        finiteRotation(resolved.rotation);
        const profile = profileOf(model, resolved);
        const storey = resolveId(model, resolved.storey, "IfcBuildingStorey", "storey");
        return editModel(model, (tx, writer) => {
            createMember(tx, writer, "IfcColumn", {
                storey,
                id: resolved.id,
                name: resolved.name,
                start: [position[0], position[1], resolved.baseOffset],
                end: [position[0], position[1], resolved.baseOffset + height],
                profile,
                rotation: resolved.rotation,
                material: memberMaterial(tx, resolved.material),
                predefinedType: "COLUMN",
            });
        });
    }
}
