export const SAME_POINT = 1e-10;
export const PERPENDICULAR_COSINE = 1e-9;
export const FULL_TURN_DEGREES = 360;
export const QUARTER_TURN_DEGREES = 90;
export const ARBITRARY_AXIS_LIMIT = 1 / 64;
export const FORBIDDEN_LAYER_CHARACTERS = /[<>/\\":;?*|=`]/;
export const FIRST_PRINTABLE_CODE = 32;
export const DEFAULT_LAYER = "0";
export const POINT_SIZES = [2, 3];
export const DEFAULT_SPLINE_DEGREE = 3;
export const HIGHEST_SPLINE_DEGREE = 25;
export const LARGEST_NUMBER = 1e100;
export const LEAST_WEIGHT = 1e-100;
export const PATTERN_UNIT_SHARE = 1 / 200;
export const LEAST_TOLERANCE_SHARE = 1e-6;
export const PLAN_AXES = 2;
export const SPACE_AXES = 3;
export const WRITER_WORK_PER_NUMBER = 2 ** 14;
export const WRITER_WORK_FLOOR = 2 ** 20;
export const WRITER_WORK_CEILING = 2 ** 25;
export const NUMBERS_PER_PART = 1;
export const NUMBERS_PER_TEXT = 8;
export const NUMBERS_PER_CHARACTER = 64;
export const NUMBERS_PER_HATCH = 4;
export const LONGEST_TEXT = 2000;
export const CONTROL_CHARACTER = /\p{Cc}/u;
export const JOIN_DISTANCE = 1e-9;
export const MOST_HATCH_LINES = 200000;
export const LEAST_LOOP_CORNERS = 3;
export type HatchFamilyTurn = 0 | typeof QUARTER_TURN_DEGREES;
export const HATCH_FAMILIES: Readonly<Record<string, readonly (readonly [HatchFamilyTurn, number])[]>> = {
    solid: [],
    ansi31: [[0, 1 / 2]],
    ansi32: [[0, 1 / 2], [0, 5 / 6]],
    ansi37: [[0, 1 / 2], [QUARTER_TURN_DEGREES, 1 / 2]],
};
export const ANCHOR_SHARES: Readonly<Record<"start" | "middle" | "end", number>> = { start: 0, middle: 0.5, end: 1 };
export const TEXT_ANCHORS: ReadonlySet<string> = new Set(Object.keys(ANCHOR_SHARES));
export const NUMBERS_PER_VERTEX = 4;
export const NUMBERS_PER_CURVE: Readonly<Record<"line" | "circle" | "arc" | "ellipse", number>> = { line: 6, circle: 7, arc: 9, ellipse: 12 };

export interface LineTypePattern {
    readonly name: string;
    readonly description: string;
    readonly elements: readonly number[];
}

export const LINE_TYPE_PATTERNS: Readonly<Record<string, LineTypePattern>> = {
    continuous: { name: "CONTINUOUS", description: "Solid line", elements: [] },
    dashed: { name: "DASHED", description: "Dashed __ __ __ __", elements: [4, -2] },
    hidden: { name: "HIDDEN", description: "Hidden _ _ _ _ _ _", elements: [2, -1] },
    center: { name: "CENTER", description: "Center ____ _ ____ _", elements: [8, -1.5, 1.5, -1.5] },
    dotted: { name: "DOT", description: "Dot . . . . . . .", elements: [0, -1] },
};
