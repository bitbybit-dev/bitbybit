import * as Inputs from "../api/inputs";
import { enumValue, ref } from "../step/values";
import type { ProfileSpec } from "./build-types";
import { requirePositive } from "./checks";
import type { EntityWriter } from "./entity-writer";

export function checkProfile(profile: ProfileSpec): void {
    if (profile.kind === Inputs.IFC.profileKindEnum.rectangle) {
        requirePositive(profile.width, "profile's width");
        requirePositive(profile.depth, "profile's depth");
    } else if (profile.kind === Inputs.IFC.profileKindEnum.circle) {
        requirePositive(profile.radius, "profile's radius");
    } else {
        requirePositive(profile.width, "profile's width");
        requirePositive(profile.depth, "profile's depth");
        requirePositive(profile.webThickness, "profile's web thickness");
        requirePositive(profile.flangeThickness, "profile's flange thickness");
        if (profile.webThickness >= profile.width) {
            throw new Error("An I section's web must be thinner than its flanges are wide");
        }
        if (2 * profile.flangeThickness >= profile.depth) {
            throw new Error("An I section's two flanges must be thinner together than its depth");
        }
    }
}

export function writeProfile(writer: EntityWriter, profile: ProfileSpec, name: string | undefined): number {
    checkProfile(profile);
    const common = { ProfileType: enumValue("AREA"), ProfileName: name ?? null, Position: ref(writer.placement2([0, 0])) };
    if (profile.kind === Inputs.IFC.profileKindEnum.rectangle) {
        return writer.create("IfcRectangleProfileDef", { ...common, XDim: profile.width, YDim: profile.depth });
    }
    if (profile.kind === Inputs.IFC.profileKindEnum.circle) {
        return writer.create("IfcCircleProfileDef", { ...common, Radius: profile.radius });
    }
    return writer.create("IfcIShapeProfileDef", {
        ...common,
        OverallWidth: profile.width,
        OverallDepth: profile.depth,
        WebThickness: profile.webThickness,
        FlangeThickness: profile.flangeThickness,
    });
}
