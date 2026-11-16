import { length2 } from "../../geometry/vectors";
import { millimetresPerUnitOf } from "../../geometry/lengths";
import { svgNumberAt } from "./svg-path-data";
import { EX_PER_EM, FONT_SIZE_PIXELS, PERCENT, PICAS_PER_INCH, PIXELS_PER_INCH, POINTS_PER_INCH } from "./svg-reader.constants";

export interface ViewportSize {
    width: number;
    height: number;
}

export type LengthAxis = "x" | "y" | "other";

export interface SvgLength {
    value: number;
    unit: string;
}

const UNIT = /[a-zA-Z%]*/y;
const SPACE = /\s/;

const PIXELS_PER_MILLIMETRE = PIXELS_PER_INCH / millimetresPerUnitOf("in");

const PIXELS_PER_UNIT: ReadonlyMap<string, number> = new Map([
    ["", 1],
    ["px", 1],
    ["in", PIXELS_PER_INCH],
    ["mm", PIXELS_PER_MILLIMETRE],
    ["cm", PIXELS_PER_MILLIMETRE * millimetresPerUnitOf("cm")],
    ["pt", PIXELS_PER_INCH / POINTS_PER_INCH],
    ["pc", PIXELS_PER_INCH / PICAS_PER_INCH],
    ["em", FONT_SIZE_PIXELS],
    ["rem", FONT_SIZE_PIXELS],
    ["ex", FONT_SIZE_PIXELS * EX_PER_EM],
]);

export const NO_VIEWPORT: ViewportSize = { width: 0, height: 0 };

export function millimetresPerPixel(): number {
    return 1 / PIXELS_PER_MILLIMETRE;
}

export function percentReference(viewport: ViewportSize, axis: LengthAxis): number {
    if (axis === "x") { return viewport.width; }
    if (axis === "y") { return viewport.height; }
    return length2([viewport.width, viewport.height]) / Math.SQRT2;
}

function skipSpace(text: string, from: number): number {
    let at = from;
    while (at < text.length && SPACE.test(text[at]!)) { at++; }
    return at;
}

export function readLength(text: string): SvgLength | undefined {
    const read = svgNumberAt(text, skipSpace(text, 0));
    if (!read) { return undefined; }
    UNIT.lastIndex = skipSpace(text, read[1]);
    const unit = UNIT.exec(text)![0].toLowerCase();
    if (skipSpace(text, UNIT.lastIndex) !== text.length) { return undefined; }
    return unit === "%" || PIXELS_PER_UNIT.has(unit) ? { value: read[0], unit } : undefined;
}

export function pixelsOf(length: SvgLength, viewport: ViewportSize, axis: LengthAxis): number {
    if (length.unit === "%") { return length.value / PERCENT * percentReference(viewport, axis); }
    return length.value * PIXELS_PER_UNIT.get(length.unit)!;
}

export function lengthInPixels(text: string | undefined, viewport: ViewportSize, axis: LengthAxis): number | undefined {
    const length = text === undefined ? undefined : readLength(text);
    return length === undefined ? undefined : pixelsOf(length, viewport, axis);
}
