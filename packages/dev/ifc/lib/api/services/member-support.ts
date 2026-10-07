import type { ProfileSpec } from "../../build/build-types";
import { requireFinite } from "../../build/checks";
import { requireMaterial } from "../../build/materials";
import type { ModelSnapshot } from "../../model/snapshot";
import type { IfcTransaction } from "../../model/transaction";
import * as Inputs from "../inputs";
import type * as Resolved from "../resolved-inputs";
import { DEFAULT_MILLIMETRES } from "./defaults.constants";
import { lengthIn, oneOf } from "./service-support";

export function profileOf(model: ModelSnapshot, resolved: Resolved.IFC.AddColumnDto<unknown> | Resolved.IFC.AddBeamDto<unknown> | Resolved.IFC.AddMemberDto<unknown>): ProfileSpec {
    const width = lengthIn(model, resolved.width, DEFAULT_MILLIMETRES.sectionWidth);
    const depth = lengthIn(model, resolved.depth, DEFAULT_MILLIMETRES.sectionDepth);
    switch (oneOf(resolved.profile, Inputs.IFC.profileKindEnum, "profile")) {
        case Inputs.IFC.profileKindEnum.circle:
            return { kind: Inputs.IFC.profileKindEnum.circle, radius: lengthIn(model, resolved.radius, DEFAULT_MILLIMETRES.sectionRadius) };
        case Inputs.IFC.profileKindEnum.iShape:
            return {
                kind: Inputs.IFC.profileKindEnum.iShape,
                width,
                depth,
                webThickness: lengthIn(model, resolved.webThickness, DEFAULT_MILLIMETRES.webThickness),
                flangeThickness: lengthIn(model, resolved.flangeThickness, DEFAULT_MILLIMETRES.flangeThickness),
            };
        default:
            return { kind: Inputs.IFC.profileKindEnum.rectangle, width, depth };
    }
}

export function memberMaterial(tx: IfcTransaction, name: string | undefined): number | undefined {
    return name === undefined ? undefined : requireMaterial(tx, name);
}

export function finiteRotation(rotation: number): void {
    requireFinite(rotation, "rotation in degrees");
}
