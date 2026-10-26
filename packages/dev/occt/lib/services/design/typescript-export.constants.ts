import * as Inputs from "../../api/inputs";
import type { MachiningEnum } from "./machining-types";

export const FIRST_PRINTABLE = 0x20;

export const DELETE = 0x7f;

export const LAST_CONTROL = 0x9f;

export const LINE_SEPARATOR = 0x2028;

export const PARAGRAPH_SEPARATOR = 0x2029;



export const MACHINING_ENUMS: ReadonlyMap<string, readonly MachiningEnum[]> = new Map<string, readonly MachiningEnum[]>([
    ["size", [
        { namespace: "Engineering", name: "isoThreadSizeEnum", members: Inputs.Engineering.isoThreadSizeEnum },
        { namespace: "Engineering", name: "ansiThreadSizeEnum", members: Inputs.Engineering.ansiThreadSizeEnum },
    ]],
    ["series", [{ namespace: "Engineering", name: "ansiThreadSeriesEnum", members: Inputs.Engineering.ansiThreadSeriesEnum }]],
    ["pitch", [{ namespace: "Engineering", name: "ansiSplinePitchEnum", members: Inputs.Engineering.ansiSplinePitchEnum }]],
    ["kind", [{ namespace: "Engineering", name: "retainingRingKindEnum", members: Inputs.Engineering.retainingRingKindEnum }]],
    ["pattern", [{ namespace: "Engineering", name: "knurlPatternEnum", members: Inputs.Engineering.knurlPatternEnum }]],
    ["unit", [{ namespace: "Base", name: "unitOfLengthEnum", members: Inputs.Base.unitOfLengthEnum }]],
]);

export const FROM_FEATURE: readonly string[] = ["length", "depth", "pitch", "module", "diametralPitch", "teeth", "threadsPerInch"];
