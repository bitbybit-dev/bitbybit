import { resolveDto } from "@bitbybit-dev/base";
import { POINT3_SIZE } from "../../build/constants";
import { createMember } from "../../build/slabs-columns-beams";
import type { IfcModel } from "../../model/model-types";
import * as Inputs from "../inputs";
import type * as Resolved from "../resolved-inputs";
import { requirePoint } from "../../build/checks";
import { editModel, modelOf, resolveId } from "./service-support";
import { finiteRotation, memberMaterial, profileOf } from "./member-support";

/**
 * Beams: sections swept straight between two points of a storey, each a rectangle, a circle or an I
 * section centred on the line between them.
 * @beta
 */
export class IFCBeams {

    /**
     * Adds a beam from `start` to `end` in a storey, its section centred on the line between them.
     *
     * The section's Y points up, so an I section stands upright on a level beam; `rotation` turns it
     * about the beam's axis. The section is chosen by `profile` as for columns.
     * @param inputs - The model, the storey, the two ends and the section
     * @returns A new model with the beam
     * @group create
     * @shortname add beam
     * @drawable false
     * @example
     * ```typescript
     * model = await bitbybit.ifc.beams.add({
     *     model,
     *     storey: "first",
     *     start: [0, 4000, 2850],
     *     end: [10000, 4000, 2850],
     *     profile: Bit.Inputs.IFC.profileKindEnum.iShape,
     *     width: 150,
     *     depth: 300,
     * });
     * ```
     */
    add(inputs: Inputs.IFC.AddBeamDto<IfcModel>): IfcModel {
        const resolved = resolveDto(Inputs.IFC.AddBeamDto, inputs) as Resolved.IFC.AddBeamDto<IfcModel>;
        const model = modelOf(resolved.model);
        requirePoint(resolved.start, POINT3_SIZE, "start");
        requirePoint(resolved.end, POINT3_SIZE, "end");
        finiteRotation(resolved.rotation);
        const profile = profileOf(model, resolved);
        const storey = resolveId(model, resolved.storey, "IfcBuildingStorey", "storey");
        return editModel(model, (tx, writer) => {
            createMember(tx, writer, "IfcBeam", {
                storey,
                id: resolved.id,
                name: resolved.name,
                start: resolved.start,
                end: resolved.end,
                profile,
                rotation: resolved.rotation,
                material: memberMaterial(tx, resolved.material),
                predefinedType: "BEAM",
            });
        });
    }
}
