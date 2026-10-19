export const FIRST_PRINTABLE = 0x20;

export const DELETE = 0x7f;

export const LAST_CONTROL = 0x9f;

export const LINE_SEPARATOR = 0x2028;

export const PARAGRAPH_SEPARATOR = 0x2029;



export const MACHINING_ENUMS: ReadonlyMap<string, "metricSizeEnum" | "retainingRingKindEnum" | "knurlPatternEnum"> = new Map([["size", "metricSizeEnum"], ["kind", "retainingRingKindEnum"], ["pattern", "knurlPatternEnum"]]);

export const FROM_FEATURE: readonly string[] = ["length", "depth", "pitch", "module"];
