import type { DxfMeasurement } from "./dxf-tables";

export const DXF_FIRST_HANDLE = 0x20;
export const DXF_INSUNITS: Readonly<Record<string, string>> = { in: "1", mm: "4", cm: "5", m: "6" };
export const DXF_IMPERIAL_MEASUREMENT = "0";
export const DXF_METRIC_MEASUREMENT = "1";
export const DXF_HIGHEST_ASCII = 126;
export const DXF_HEX_WIDTH = 4;
export const DXF_VIEW_MARGIN = 1.1;
export const DXF_VIEW_ASPECT = 1.5;
export const DXF_KNOT_TOLERANCE = "0.0000001";
export const DXF_FIXED_COLORS: readonly (readonly [number, number, number])[] = [
    [255, 0, 0], [255, 255, 0], [0, 255, 0], [0, 255, 255], [0, 0, 255], [255, 0, 255], [255, 255, 255], [65, 65, 65], [128, 128, 128],
];
export const DXF_SHADES = [255, 189, 129, 104, 79];
export const DXF_GRAYS = [51, 80, 105, 130, 190, 255];
export const DXF_HUE_STEP_DEGREES = 15;
export const DXF_PURE_HUE_LIGHTNESS = 0.5;
export const DXF_HUES = 24;
export const DXF_PASTEL_SHARE = 2 / 3;
export const DXF_WHITE_OR_BLACK = 7;
export const DXF_TRUE_COLOR_RED = 65536;
export const DXF_TRUE_COLOR_GREEN = 256;
export const DXF_LENS_LENGTH = 50;
export const DXF_HEX_RADIX = 16;
export const DXF_TURN_SLACK = 1e-9;
export const DXF_POINT_CODES = [10, 20, 30] as const;
export const DXF_OTHER_POINT_CODES = [11, 21, 31] as const;
export const DXF_EXTRUSION_CODES = [210, 220, 230] as const;
export const DXF_VIEW_CENTER_CODES = [12, 22, 32] as const;
export const DXF_SNAP_BASE_CODES = [13, 23, 33] as const;
export const DXF_SNAP_SPACING_CODES = [14, 24, 34] as const;
export const DXF_GRID_SPACING_CODES = [15, 25, 35] as const;
export const DXF_VIEW_DIRECTION_CODES = [16, 26, 36] as const;
export const DXF_VIEW_TARGET_CODES = [17, 27, 37] as const;
export const DXF_CLOSED_FLAG = 1;
export const DXF_RATIONAL_FLAG = 4;
export const DXF_POLYLINE_3D_FLAG = 8;
export const DXF_MAX_NAME_LENGTH = 255;
export const DXF_LINE_WEIGHTS = [0, 5, 9, 13, 15, 18, 20, 25, 30, 35, 40, 50, 53, 60, 70, 80, 90, 100, 106, 120, 140, 158, 200, 211];
export const DXF_LINE_WEIGHTS_PER_MILLIMETRE = 100;
export const DXF_TEXT_STYLE = "Standard";
export const DXF_CODED_BACKSLASH = "\\U+005C";
export const DXF_CHARACTER_CODE_START = /\\(?=[UM]\+)/g;
export const DXF_FIT_JUSTIFICATION = "5";
export const DXF_POLYLINE_BOUNDARY = "3";
export const DXF_HATCH_NAMES: Readonly<Record<string, string>> = { solid: "SOLID", ansi31: "ANSI31", ansi32: "ANSI32", ansi37: "ANSI37" };
export const DXF_HATCH_NATIVE_ANGLE = 45;
export const DXF_HATCH_NATIVE_SPACING: Readonly<Record<DxfMeasurement, Readonly<Record<string, number>>>> = {
    imperial: { solid: 1, ansi31: 0.125, ansi32: 0.375, ansi37: 0.125 },
    metric: { solid: 1, ansi31: 3.175, ansi32: 9.525, ansi37: 3.175 },
};
