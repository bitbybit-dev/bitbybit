import type { AnsiThreadSize } from "../threads/thread-types";
import type { AnsiScrewHeadRow, AnsiSetScrewRow, AnsiWasherRow, ClearanceRow, HexRow } from "./fastener-types";

export const ANSI_CLEARANCE_HOLES: Readonly<Partial<Record<AnsiThreadSize, ClearanceRow>>> = {
    "#0": { close: 0.067, normal: 0.076, loose: 0.094 },
    "#1": { close: 0.081, normal: 0.089, loose: 0.104 },
    "#2": { close: 0.094, normal: 0.102, loose: 0.116 },
    "#3": { close: 0.106, normal: 0.116, loose: 0.128 },
    "#4": { close: 0.12, normal: 0.128, loose: 0.144 },
    "#5": { close: 0.141, normal: 0.156, loose: 0.172 },
    "#6": { close: 0.154, normal: 0.17, loose: 0.185 },
    "#8": { close: 0.18, normal: 0.196, loose: 0.213 },
    "#10": { close: 0.206, normal: 0.221, loose: 0.238 },
    "1/4": { close: 0.266, normal: 0.281, loose: 0.297 },
    "5/16": { close: 0.328, normal: 0.344, loose: 0.359 },
    "3/8": { close: 0.391, normal: 0.406, loose: 0.422 },
    "7/16": { close: 0.453, normal: 0.469, loose: 0.484 },
    "1/2": { close: 0.531, normal: 0.562, loose: 0.609 },
    "5/8": { close: 0.656, normal: 0.688, loose: 0.734 },
    "3/4": { close: 0.781, normal: 0.812, loose: 0.906 },
    "7/8": { close: 0.906, normal: 0.938, loose: 1.031 },
    "1": { close: 1.031, normal: 1.094, loose: 1.156 },
};

export const ANSI_SOCKET_HEAD_CAP_SCREWS: Readonly<Partial<Record<AnsiThreadSize, AnsiScrewHeadRow>>> = {
    "#0": { headDiameter: 0.096, headHeight: 0.06, socketSize: 0.05, socketDepth: 0.025, threadLength: 0.5, counterboreDiameter: 0.125, counterboreDepth: 0.06 },
    "#1": { headDiameter: 0.118, headHeight: 0.073, socketSize: 0.0625, socketDepth: 0.031, threadLength: 0.625, counterboreDiameter: 0.15625, counterboreDepth: 0.073 },
    "#2": { headDiameter: 0.14, headHeight: 0.086, socketSize: 0.078125, socketDepth: 0.038, threadLength: 0.625, counterboreDiameter: 0.1875, counterboreDepth: 0.086 },
    "#3": { headDiameter: 0.161, headHeight: 0.099, socketSize: 0.078125, socketDepth: 0.044, threadLength: 0.625, counterboreDiameter: 0.21875, counterboreDepth: 0.099 },
    "#4": { headDiameter: 0.183, headHeight: 0.112, socketSize: 0.09375, socketDepth: 0.051, threadLength: 0.75, counterboreDiameter: 0.21875, counterboreDepth: 0.112 },
    "#5": { headDiameter: 0.205, headHeight: 0.125, socketSize: 0.09375, socketDepth: 0.057, threadLength: 0.75, counterboreDiameter: 0.25, counterboreDepth: 0.125 },
    "#6": { headDiameter: 0.226, headHeight: 0.138, socketSize: 0.109375, socketDepth: 0.064, threadLength: 0.75, counterboreDiameter: 0.28125, counterboreDepth: 0.138 },
    "#8": { headDiameter: 0.27, headHeight: 0.164, socketSize: 0.140625, socketDepth: 0.077, threadLength: 0.875, counterboreDiameter: 0.3125, counterboreDepth: 0.164 },
    "#10": { headDiameter: 0.312, headHeight: 0.19, socketSize: 0.15625, socketDepth: 0.09, threadLength: 0.875, counterboreDiameter: 0.375, counterboreDepth: 0.19 },
    "1/4": { headDiameter: 0.375, headHeight: 0.25, socketSize: 0.1875, socketDepth: 0.12, threadLength: 1, counterboreDiameter: 0.4375, counterboreDepth: 0.25 },
    "5/16": { headDiameter: 0.469, headHeight: 0.312, socketSize: 0.25, socketDepth: 0.151, threadLength: 1.125, counterboreDiameter: 0.53125, counterboreDepth: 0.312 },
    "3/8": { headDiameter: 0.562, headHeight: 0.375, socketSize: 0.3125, socketDepth: 0.182, threadLength: 1.25, counterboreDiameter: 0.625, counterboreDepth: 0.375 },
    "7/16": { headDiameter: 0.656, headHeight: 0.438, socketSize: 0.375, socketDepth: 0.213, threadLength: 1.375, counterboreDiameter: 0.71875, counterboreDepth: 0.438 },
    "1/2": { headDiameter: 0.75, headHeight: 0.5, socketSize: 0.375, socketDepth: 0.245, threadLength: 1.5, counterboreDiameter: 0.8125, counterboreDepth: 0.5 },
    "5/8": { headDiameter: 0.938, headHeight: 0.625, socketSize: 0.5, socketDepth: 0.307, threadLength: 1.75, counterboreDiameter: 1, counterboreDepth: 0.625 },
    "3/4": { headDiameter: 1.125, headHeight: 0.75, socketSize: 0.625, socketDepth: 0.37, threadLength: 2, counterboreDiameter: 1.1875, counterboreDepth: 0.75 },
    "7/8": { headDiameter: 1.312, headHeight: 0.875, socketSize: 0.75, socketDepth: 0.432, threadLength: 2.25, counterboreDiameter: 1.375, counterboreDepth: 0.875 },
    "1": { headDiameter: 1.5, headHeight: 1, socketSize: 0.75, socketDepth: 0.495, threadLength: 2.5, counterboreDiameter: 1.625, counterboreDepth: 1 },
};

export const ANSI_HEX_CAP_SCREWS: Readonly<Partial<Record<AnsiThreadSize, HexRow>>> = {
    "1/4": { acrossFlats: 0.4375, height: 0.15625 },
    "5/16": { acrossFlats: 0.5, height: 0.203125 },
    "3/8": { acrossFlats: 0.5625, height: 0.234375 },
    "7/16": { acrossFlats: 0.625, height: 0.28125 },
    "1/2": { acrossFlats: 0.75, height: 0.3125 },
    "9/16": { acrossFlats: 0.8125, height: 0.359375 },
    "5/8": { acrossFlats: 0.9375, height: 0.390625 },
    "3/4": { acrossFlats: 1.125, height: 0.46875 },
    "7/8": { acrossFlats: 1.3125, height: 0.546875 },
    "1": { acrossFlats: 1.5, height: 0.609375 },
};

export const ANSI_HEX_NUTS: Readonly<Record<AnsiThreadSize, HexRow>> = {
    "#0": { acrossFlats: 0.15625, height: 0.046875 },
    "#1": { acrossFlats: 0.15625, height: 0.046875 },
    "#2": { acrossFlats: 0.1875, height: 0.0625 },
    "#3": { acrossFlats: 0.1875, height: 0.0625 },
    "#4": { acrossFlats: 0.25, height: 0.09375 },
    "#5": { acrossFlats: 0.3125, height: 0.109375 },
    "#6": { acrossFlats: 0.3125, height: 0.109375 },
    "#8": { acrossFlats: 0.34375, height: 0.125 },
    "#10": { acrossFlats: 0.375, height: 0.125 },
    "#12": { acrossFlats: 0.4375, height: 0.15625 },
    "1/4": { acrossFlats: 0.4375, height: 0.21875 },
    "5/16": { acrossFlats: 0.5, height: 0.265625 },
    "3/8": { acrossFlats: 0.5625, height: 0.328125 },
    "7/16": { acrossFlats: 0.6875, height: 0.375 },
    "1/2": { acrossFlats: 0.75, height: 0.4375 },
    "9/16": { acrossFlats: 0.875, height: 0.484375 },
    "5/8": { acrossFlats: 0.9375, height: 0.546875 },
    "3/4": { acrossFlats: 1.125, height: 0.640625 },
    "7/8": { acrossFlats: 1.3125, height: 0.75 },
    "1": { acrossFlats: 1.5, height: 0.859375 },
};

export const ANSI_PLAIN_WASHERS: Readonly<Partial<Record<AnsiThreadSize, AnsiWasherRow>>> = {
    "#6": { narrow: { innerDiameter: 0.156, outerDiameter: 0.375, thickness: 0.049 }, wide: { innerDiameter: 0.156, outerDiameter: 0.375, thickness: 0.049 } },
    "#8": { narrow: { innerDiameter: 0.188, outerDiameter: 0.438, thickness: 0.049 }, wide: { innerDiameter: 0.188, outerDiameter: 0.438, thickness: 0.049 } },
    "#10": { narrow: { innerDiameter: 0.219, outerDiameter: 0.5, thickness: 0.049 }, wide: { innerDiameter: 0.219, outerDiameter: 0.5, thickness: 0.049 } },
    "#12": { narrow: { innerDiameter: 0.25, outerDiameter: 0.562, thickness: 0.065 }, wide: { innerDiameter: 0.25, outerDiameter: 0.562, thickness: 0.065 } },
    "1/4": { narrow: { innerDiameter: 0.281, outerDiameter: 0.625, thickness: 0.065 }, wide: { innerDiameter: 0.312, outerDiameter: 0.734, thickness: 0.065 } },
    "5/16": { narrow: { innerDiameter: 0.344, outerDiameter: 0.688, thickness: 0.065 }, wide: { innerDiameter: 0.375, outerDiameter: 0.875, thickness: 0.083 } },
    "3/8": { narrow: { innerDiameter: 0.406, outerDiameter: 0.812, thickness: 0.065 }, wide: { innerDiameter: 0.438, outerDiameter: 1, thickness: 0.083 } },
    "7/16": { narrow: { innerDiameter: 0.469, outerDiameter: 0.922, thickness: 0.065 }, wide: { innerDiameter: 0.5, outerDiameter: 1.25, thickness: 0.083 } },
    "1/2": { narrow: { innerDiameter: 0.531, outerDiameter: 1.062, thickness: 0.095 }, wide: { innerDiameter: 0.562, outerDiameter: 1.375, thickness: 0.109 } },
    "9/16": { narrow: { innerDiameter: 0.594, outerDiameter: 1.156, thickness: 0.095 }, wide: { innerDiameter: 0.625, outerDiameter: 1.469, thickness: 0.109 } },
    "5/8": { narrow: { innerDiameter: 0.656, outerDiameter: 1.312, thickness: 0.095 }, wide: { innerDiameter: 0.688, outerDiameter: 1.75, thickness: 0.134 } },
    "3/4": { narrow: { innerDiameter: 0.812, outerDiameter: 1.469, thickness: 0.134 }, wide: { innerDiameter: 0.812, outerDiameter: 2, thickness: 0.148 } },
    "7/8": { narrow: { innerDiameter: 0.938, outerDiameter: 1.75, thickness: 0.134 }, wide: { innerDiameter: 0.938, outerDiameter: 2.25, thickness: 0.165 } },
    "1": { narrow: { innerDiameter: 1.062, outerDiameter: 2, thickness: 0.134 }, wide: { innerDiameter: 1.062, outerDiameter: 2.5, thickness: 0.165 } },
};

export const ANSI_SET_SCREWS: Readonly<Partial<Record<AnsiThreadSize, AnsiSetScrewRow>>> = {
    "#0": { key: 0.028, depthShort: 0.035, depthLong: 0.05, cupAndFlatShortUpTo: 0.125, coneAndOvalShortUpTo: 0.125, halfDogShortUpTo: 0.125, pointDiameter: 0.033, coneSteepFrom: 0.09375, ovalRadius: 0.045, halfDogDiameter: 0.04, halfDogLength: 0.017 },
    "#1": { key: 0.035, depthShort: 0.035, depthLong: 0.06, cupAndFlatShortUpTo: 0.125, coneAndOvalShortUpTo: 0.1875, halfDogShortUpTo: 0.125, pointDiameter: 0.04, coneSteepFrom: 0.09375, ovalRadius: 0.055, halfDogDiameter: 0.049, halfDogLength: 0.021 },
    "#2": { key: 0.035, depthShort: 0.035, depthLong: 0.06, cupAndFlatShortUpTo: 0.125, coneAndOvalShortUpTo: 0.1875, halfDogShortUpTo: 0.1875, pointDiameter: 0.047, coneSteepFrom: 0.125, ovalRadius: 0.064, halfDogDiameter: 0.057, halfDogLength: 0.024 },
    "#3": { key: 0.05, depthShort: 0.06, depthLong: 0.07, cupAndFlatShortUpTo: 0.1875, coneAndOvalShortUpTo: 0.1875, halfDogShortUpTo: 0.1875, pointDiameter: 0.054, coneSteepFrom: 0.125, ovalRadius: 0.074, halfDogDiameter: 0.066, halfDogLength: 0.027 },
    "#4": { key: 0.05, depthShort: 0.075, depthLong: 0.07, cupAndFlatShortUpTo: 0.1875, coneAndOvalShortUpTo: 0.1875, halfDogShortUpTo: 0.1875, pointDiameter: 0.061, coneSteepFrom: 0.1875, ovalRadius: 0.084, halfDogDiameter: 0.075, halfDogLength: 0.03 },
    "#5": { key: 0.0625, depthShort: 0.075, depthLong: 0.08, cupAndFlatShortUpTo: 0.1875, coneAndOvalShortUpTo: 0.1875, halfDogShortUpTo: 0.1875, pointDiameter: 0.067, coneSteepFrom: 0.1875, ovalRadius: 0.094, halfDogDiameter: 0.083, halfDogLength: 0.033 },
    "#6": { key: 0.0625, depthShort: 0.075, depthLong: 0.08, cupAndFlatShortUpTo: 0.1875, coneAndOvalShortUpTo: 0.25, halfDogShortUpTo: 0.1875, pointDiameter: 0.074, coneSteepFrom: 0.1875, ovalRadius: 0.104, halfDogDiameter: 0.092, halfDogLength: 0.038 },
    "#8": { key: 0.078125, depthShort: 0.075, depthLong: 0.09, cupAndFlatShortUpTo: 0.1875, coneAndOvalShortUpTo: 0.25, halfDogShortUpTo: 0.25, pointDiameter: 0.087, coneSteepFrom: 0.25, ovalRadius: 0.123, halfDogDiameter: 0.109, halfDogLength: 0.043 },
    "#10": { key: 0.09375, depthShort: 0.105, depthLong: 0.1, cupAndFlatShortUpTo: 0.1875, coneAndOvalShortUpTo: 0.25, halfDogShortUpTo: 0.25, pointDiameter: 0.102, coneSteepFrom: 0.25, ovalRadius: 0.142, halfDogDiameter: 0.127, halfDogLength: 0.049 },
    "1/4": { key: 0.125, depthShort: 0.105, depthLong: 0.125, cupAndFlatShortUpTo: 0.25, coneAndOvalShortUpTo: 0.3125, halfDogShortUpTo: 0.3125, pointDiameter: 0.132, coneSteepFrom: 0.3125, ovalRadius: 0.188, halfDogDiameter: 0.156, halfDogLength: 0.067 },
    "5/16": { key: 0.15625, depthShort: 0.14, depthLong: 0.156, cupAndFlatShortUpTo: 0.3125, coneAndOvalShortUpTo: 0.4375, halfDogShortUpTo: 0.375, pointDiameter: 0.172, coneSteepFrom: 0.375, ovalRadius: 0.234, halfDogDiameter: 0.203, halfDogLength: 0.082 },
    "3/8": { key: 0.1875, depthShort: 0.14, depthLong: 0.188, cupAndFlatShortUpTo: 0.375, coneAndOvalShortUpTo: 0.4375, halfDogShortUpTo: 0.4375, pointDiameter: 0.212, coneSteepFrom: 0.4375, ovalRadius: 0.281, halfDogDiameter: 0.25, halfDogLength: 0.099 },
    "7/16": { key: 0.21875, depthShort: 0.19, depthLong: 0.219, cupAndFlatShortUpTo: 0.4375, coneAndOvalShortUpTo: 0.625, halfDogShortUpTo: 0.5, pointDiameter: 0.252, coneSteepFrom: 0.5, ovalRadius: 0.328, halfDogDiameter: 0.297, halfDogLength: 0.114 },
    "1/2": { key: 0.25, depthShort: 0.21, depthLong: 0.25, cupAndFlatShortUpTo: 0.5, coneAndOvalShortUpTo: 0.625, halfDogShortUpTo: 0.625, pointDiameter: 0.291, coneSteepFrom: 0.57, ovalRadius: 0.375, halfDogDiameter: 0.344, halfDogLength: 0.13 },
    "5/8": { key: 0.3125, depthShort: 0.265, depthLong: 0.312, cupAndFlatShortUpTo: 0.625, coneAndOvalShortUpTo: 0.875, halfDogShortUpTo: 0.875, pointDiameter: 0.371, coneSteepFrom: 0.75, ovalRadius: 0.469, halfDogDiameter: 0.469, halfDogLength: 0.164 },
    "3/4": { key: 0.375, depthShort: 0.33, depthLong: 0.375, cupAndFlatShortUpTo: 0.75, coneAndOvalShortUpTo: 1, halfDogShortUpTo: 1, pointDiameter: 0.45, coneSteepFrom: 0.875, ovalRadius: 0.562, halfDogDiameter: 0.562, halfDogLength: 0.196 },
    "7/8": { key: 0.5, depthShort: 0.45, depthLong: 0.5, cupAndFlatShortUpTo: 0.875, coneAndOvalShortUpTo: 1, halfDogShortUpTo: 1, pointDiameter: 0.53, coneSteepFrom: 1, ovalRadius: 0.656, halfDogDiameter: 0.656, halfDogLength: 0.227 },
    "1": { key: 0.5625, depthShort: 0.55, depthLong: 0.562, cupAndFlatShortUpTo: 1, coneAndOvalShortUpTo: 1.25, halfDogShortUpTo: 1.25, pointDiameter: 0.609, coneSteepFrom: 1.125, ovalRadius: 0.75, halfDogDiameter: 0.75, halfDogLength: 0.26 },
};

export const ANSI_COUNTERBORE_SINK = 0.02;
export const HEX_CAP_THREAD_EXTRA_SHORT = 0.25;
export const HEX_CAP_THREAD_EXTRA_LONG = 0.5;
export const HEX_CAP_LENGTH_BREAK = 6;
export const ANSI_CUP_ANGLE = 118;
export const ANSI_FLAT_ANGLE = 90;
export const ANSI_CONE_LONG_ANGLE = 90;
export const ANSI_CONE_SHORT_ANGLE = 118;
