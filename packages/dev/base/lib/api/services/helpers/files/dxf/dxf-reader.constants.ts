import * as Inputs from "../../../../inputs";

export const BINARY_SENTINEL = "AutoCAD Binary DXF";
export const QUOTED_LENGTH = 40;
export const MAX_INSERT_DEPTH = 16;
export const INSERT_WORK_PER_CHARACTER = 16;
export const INSERT_WORK_FLOOR = 500_000;
export const INSERT_WORK_CEILING = 1_000_000;
export const ENTITY_WORK = 2;
export const COPY_WORK = 1;
export const LINE_WORK = 2;
export const CONIC_WORK = 2;
export const MAX_SPLINE_DEGREE = 25;
export const MAX_FIT_POINTS = 10_000;
export const MAX_LISTED_NAMES = 5;
export const PAPER_SPACE = "1";
export const FROZEN_FLAG = 1;
export const XREF_FLAGS = 4 | 8;
export const PERIODIC_FLAG = 2;
export const POLYFACE_FLAG = 64;
export const MESH_FLAG = 16;
export const SPLINE_FRAME_VERTEX_FLAG = 16;
export const BY_BLOCK = 0;
export const BY_LAYER = 256;
export const BLACK = "#000000";
export const BYTE = 255;
export const RED_SHIFT = 16;
export const GREEN_SHIFT = 8;
export const DEGREES_PER_TURN = 360;
export const SAME_SCALE = 1e-9;
export const UNIT_CODES: ReadonlyMap<number, Inputs.Base.unitOfLengthEnum> = new Map([
    [1, Inputs.Base.unitOfLengthEnum.inch],
    [4, Inputs.Base.unitOfLengthEnum.millimetre],
    [5, Inputs.Base.unitOfLengthEnum.centimetre],
    [6, Inputs.Base.unitOfLengthEnum.metre],
]);
export const UNIT_NAMES: ReadonlyMap<number, string> = new Map([
    [2, "feet"], [3, "miles"], [7, "kilometres"], [8, "microinches"], [9, "mils"], [10, "yards"], [11, "angstroms"], [12, "nanometres"], [13, "microns"], [14, "decimetres"],
]);
export const DRAWN_ENTITIES = new Set(["LINE", "ARC", "CIRCLE", "ELLIPSE", "LWPOLYLINE", "POLYLINE", "SPLINE", "INSERT"]);
export const Y_OFFSET = 10;
export const Z_OFFSET = 20;
export const GROUP = {
    name: 2,
    variable: 9,
    x: 10,
    y: 20,
    elevationZ: 30,
    otherX: 11,
    fitX: 11,
    startTangentX: 12,
    endTangentX: 13,
    controlX: 10,
    radius: 40,
    ratio: 40,
    knot: 40,
    weight: 41,
    startParameter: 41,
    endParameter: 42,
    bulge: 42,
    scaleX: 41,
    scaleY: 42,
    scaleZ: 43,
    columnStep: 44,
    rowStep: 45,
    startAngle: 50,
    rotation: 50,
    endAngle: 51,
    lineType: 6,
    layer: 8,
    color: 62,
    trueColor: 420,
    flags: 70,
    columns: 70,
    degree: 71,
    rows: 71,
    elevation: 38,
    space: 67,
} as const;
