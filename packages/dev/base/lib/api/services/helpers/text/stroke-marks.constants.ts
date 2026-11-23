import type { StrokeFontMarks } from "../helper-types";

export const UNKNOWN_GLYPH = 63;
export const FIRST_COMPOSED = 0x80;
export const LAST_UNIT = 0xFFFF;
export const MOST_UNITS = 3;
export const SOFT_DOTTED: ReadonlySet<number> = new Set([105, 106]);
export const SOFT_DOT_FLOOR = 15;
export const MARK_GAP = 1.25;
export const MARK_RISE = 4;
export const LEAST_RISE_SHARE = 0.25;
export const FULL_MARK_ADVANCE = 10;
export const BASELINE_REACH = 1;
export const OGONEK = 808;

export const STROKE_MARKS: StrokeFontMarks = {
    height: 21,
    above: {
        768: [-2.5, 4, 1, 0],
        769: [-1, 0, 2.5, 4],
        770: [-3, 0, 0, 4, 3, 0],
        771: [-4, 1, -3, 3, -1.5, 3.5, 1.5, 0.5, 3, 1, 4, 3],
        772: [-3.5, 2, 3.5, 2],
        774: [-3, 4, -2.5, 1.5, -1, 0, 1, 0, 2.5, 1.5, 3, 4],
        775: [0, 3, -1, 2, 0, 1, 1, 2, 0, 3],
        776: [-3, 3, -4, 2, -3, 1, -2, 2, -3, 3, undefined, 3, 3, 2, 2, 3, 1, 4, 2, 3, 3],
        778: [-1, 4, -2, 3, -2, 1, -1, 0, 1, 0, 2, 1, 2, 3, 1, 4, -1, 4],
        779: [-3, 0, -0.5, 4, undefined, 0.5, 0, 3, 4],
        780: [-3, 4, 0, 0, 3, 4],
    },
    below: {
        803: [0, -2, -1, -3, 0, -4, 1, -3, 0, -2],
        806: [0, -2, 0.5, -3.5, -1, -5.5],
        807: [0, 0, 0, -2, 1.5, -2.5, 1.5, -4.5, 0, -5.5, -2, -5],
        808: [0, 0, -2, -2, -2.5, -3.5, -1.5, -5, 0.5, -5.5, 2, -5],
    },
};
