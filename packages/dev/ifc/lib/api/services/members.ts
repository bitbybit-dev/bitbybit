import { resolveDto } from "@bitbybit-dev/base";
import { requirePoint } from "../../build/checks";
import { POINT3_SIZE } from "../../build/constants";
import { createMember } from "../../build/slabs-columns-beams";
import type { IfcModel } from "../../model/model-types";
import * as Inputs from "../inputs";
import type * as Resolved from "../resolved-inputs";
import { finiteRotation, memberMaterial, profileOf } from "./member-support";
import { editModel, modelOf, oneOf, resolveId } from "./service-support";

/**
 * Members: the linear parts of frames, roofs and facades that are neither columns nor beams, such as
 * braces, rafters, studs and mullions, each a section swept straight between two points.
 * @beta
 */
export class IFCMembers {

    /**
     * Adds a member from `start` to `end` in a storey, its section centred on the line between them,
     * as a brace, a rafter, a stud, a mullion or another kind. The section is chosen by `profile` and
     * turned by `rotation` as for beams.
     * @param inputs - The model, the storey, the two ends, the section and the kind of member
     * @returns A new model with the member
     * @group create
     * @shortname add member
     * @drawable false
     * @example
     * ```typescript
     * model = await bitbybit.ifc.members.add({ model, storey: "ground", start: [0, 0, 0], end: [4000, 0, 3000], predefinedType: Bit.Inputs.IFC.memberPredefinedTypeEnum.brace, width: 100, depth: 100 });
     * ```
     */
    add(inputs: Inputs.IFC.AddMemberDto<IfcModel>): IfcModel {
        const resolved = resolveDto(Inputs.IFC.AddMemberDto, inputs) as Resolved.IFC.AddMemberDto<IfcModel>;
        const model = modelOf(resolved.model);
        requirePoint(resolved.start, POINT3_SIZE, "start");
        requirePoint(resolved.end, POINT3_SIZE, "end");
        finiteRotation(resolved.rotation);
        const profile = profileOf(model, resolved);
        const storey = resolveId(model, resolved.storey, "IfcBuildingStorey", "storey");
        const predefinedType = oneOf(resolved.predefinedType, Inputs.IFC.memberPredefinedTypeEnum, "predefined type");
        return editModel(model, (tx, writer) => {
            createMember(tx, writer, "IfcMember", {
                storey,
                id: resolved.id,
                name: resolved.name,
                start: resolved.start,
                end: resolved.end,
                profile,
                rotation: resolved.rotation,
                material: memberMaterial(tx, resolved.material),
                predefinedType,
            });
        });
    }
}
