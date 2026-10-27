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

export const RESERVED: ReadonlySet<string> = new Set([
    "break", "case", "catch", "class", "const", "continue", "debugger", "default", "delete", "do", "else", "enum", "export", "extends", "false", "finally",
    "for", "function", "if", "import", "in", "instanceof", "new", "null", "return", "super", "switch", "this", "throw", "true", "try", "typeof", "var",
    "void", "while", "with", "yield", "let", "static", "implements", "interface", "package", "private", "protected", "public", "await", "async",
    "occt", "bitbybit", "Bit", "Math", "Promise", "assets", "parts", "part", "configuration", "copy", "undefined", "NaN", "Infinity",
    "eval", "arguments", "String", "Number",
]);

export const IN_GROUPS = ", strategy: Bit.Inputs.OCCT.booleanStrategyEnum.inGroups";

export const CONSTANT_CODE: ReadonlyMap<string, string> = new Map<string, string>([["pi", "Math.PI"], ["tau", "(2 * Math.PI)"], ["e", "Math.E"], ["true", "1"], ["false", "0"]]);
