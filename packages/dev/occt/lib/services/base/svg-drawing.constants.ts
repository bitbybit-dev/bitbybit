import type * as Inputs from "../../api/inputs";
import type { SvgLength } from "./svg-drawing-types";

export const STROKE_SHARE = 1 / 400;
export const MARGIN_SHARE = 1 / 40;
export const DASH_STROKES = 6;
export const GAP_STROKES = 3;
export const SIGNIFICANT_DIGITS = 9;

export const SVG_LENGTHS: Readonly<Record<`${Inputs.Base.unitOfLengthEnum}`, SvgLength>> = {
    mm: { unit: "mm", factor: 1 },
    cm: { unit: "cm", factor: 1 },
    m: { unit: "cm", factor: 100 },
    in: { unit: "in", factor: 1 },
};
