import * as Inputs from "../inputs";
import type { ClearanceRow, HexRow, MetricSize, ScrewHeadRow, SetScrewRow, ThreadRow, WasherSizes } from "./fastener-types";

export const METRIC_SIZES: readonly MetricSize[] = Object.values(Inputs.Engineering.metricSizeEnum);

export const COARSE_THREADS: Readonly<Record<MetricSize, ThreadRow>> = {
    "M1.6": { diameter: 1.6, pitch: 0.35, tapDrill: 1.25 },
    "M2": { diameter: 2, pitch: 0.4, tapDrill: 1.6 },
    "M2.5": { diameter: 2.5, pitch: 0.45, tapDrill: 2.05 },
    "M3": { diameter: 3, pitch: 0.5, tapDrill: 2.5 },
    "M4": { diameter: 4, pitch: 0.7, tapDrill: 3.3 },
    "M5": { diameter: 5, pitch: 0.8, tapDrill: 4.2 },
    "M6": { diameter: 6, pitch: 1, tapDrill: 5 },
    "M8": { diameter: 8, pitch: 1.25, tapDrill: 6.8 },
    "M10": { diameter: 10, pitch: 1.5, tapDrill: 8.5 },
    "M12": { diameter: 12, pitch: 1.75, tapDrill: 10.2 },
    "M14": { diameter: 14, pitch: 2, tapDrill: 12 },
    "M16": { diameter: 16, pitch: 2, tapDrill: 14 },
    "M20": { diameter: 20, pitch: 2.5, tapDrill: 17.5 },
    "M24": { diameter: 24, pitch: 3, tapDrill: 21 },
};

export const CLEARANCE_HOLES: Readonly<Record<MetricSize, ClearanceRow>> = {
    "M1.6": { close: 1.7, normal: 1.8, loose: 2 },
    "M2": { close: 2.2, normal: 2.4, loose: 2.6 },
    "M2.5": { close: 2.7, normal: 2.9, loose: 3.1 },
    "M3": { close: 3.2, normal: 3.4, loose: 3.6 },
    "M4": { close: 4.3, normal: 4.5, loose: 4.8 },
    "M5": { close: 5.3, normal: 5.5, loose: 5.8 },
    "M6": { close: 6.4, normal: 6.6, loose: 7 },
    "M8": { close: 8.4, normal: 9, loose: 10 },
    "M10": { close: 10.5, normal: 11, loose: 12 },
    "M12": { close: 13, normal: 13.5, loose: 14.5 },
    "M14": { close: 15, normal: 15.5, loose: 16.5 },
    "M16": { close: 17, normal: 17.5, loose: 18.5 },
    "M20": { close: 21, normal: 22, loose: 24 },
    "M24": { close: 25, normal: 26, loose: 28 },
};

export const SOCKET_HEAD_CAP_SCREWS: Readonly<Record<MetricSize, ScrewHeadRow>> = {
    "M1.6": { headDiameter: 3, headHeight: 1.6, socketSize: 1.5, socketDepth: 0.7, counterboreDiameter: 3.5 },
    "M2": { headDiameter: 3.8, headHeight: 2, socketSize: 1.5, socketDepth: 1, counterboreDiameter: 4.4 },
    "M2.5": { headDiameter: 4.5, headHeight: 2.5, socketSize: 2, socketDepth: 1.1, counterboreDiameter: 5.5 },
    "M3": { headDiameter: 5.5, headHeight: 3, socketSize: 2.5, socketDepth: 1.3, counterboreDiameter: 6.5 },
    "M4": { headDiameter: 7, headHeight: 4, socketSize: 3, socketDepth: 2, counterboreDiameter: 8 },
    "M5": { headDiameter: 8.5, headHeight: 5, socketSize: 4, socketDepth: 2.5, counterboreDiameter: 10 },
    "M6": { headDiameter: 10, headHeight: 6, socketSize: 5, socketDepth: 3, counterboreDiameter: 11 },
    "M8": { headDiameter: 13, headHeight: 8, socketSize: 6, socketDepth: 4, counterboreDiameter: 15 },
    "M10": { headDiameter: 16, headHeight: 10, socketSize: 8, socketDepth: 5, counterboreDiameter: 18 },
    "M12": { headDiameter: 18, headHeight: 12, socketSize: 10, socketDepth: 6, counterboreDiameter: 20 },
    "M14": { headDiameter: 21, headHeight: 14, socketSize: 12, socketDepth: 7, counterboreDiameter: 24 },
    "M16": { headDiameter: 24, headHeight: 16, socketSize: 14, socketDepth: 8, counterboreDiameter: 26 },
    "M20": { headDiameter: 30, headHeight: 20, socketSize: 17, socketDepth: 10, counterboreDiameter: 33 },
    "M24": { headDiameter: 36, headHeight: 24, socketSize: 19, socketDepth: 12, counterboreDiameter: 40 },
};

export const HEX_BOLT_HEADS: Readonly<Record<MetricSize, HexRow>> = {
    "M1.6": { acrossFlats: 3.2, height: 1.1 },
    "M2": { acrossFlats: 4, height: 1.4 },
    "M2.5": { acrossFlats: 5, height: 1.7 },
    "M3": { acrossFlats: 5.5, height: 2 },
    "M4": { acrossFlats: 7, height: 2.8 },
    "M5": { acrossFlats: 8, height: 3.5 },
    "M6": { acrossFlats: 10, height: 4 },
    "M8": { acrossFlats: 13, height: 5.3 },
    "M10": { acrossFlats: 16, height: 6.4 },
    "M12": { acrossFlats: 18, height: 7.5 },
    "M14": { acrossFlats: 21, height: 8.8 },
    "M16": { acrossFlats: 24, height: 10 },
    "M20": { acrossFlats: 30, height: 12.5 },
    "M24": { acrossFlats: 36, height: 15 },
};

export const HEX_NUTS: Readonly<Record<MetricSize, HexRow>> = {
    "M1.6": { acrossFlats: 3.2, height: 1.3 },
    "M2": { acrossFlats: 4, height: 1.6 },
    "M2.5": { acrossFlats: 5, height: 2 },
    "M3": { acrossFlats: 5.5, height: 2.4 },
    "M4": { acrossFlats: 7, height: 3.2 },
    "M5": { acrossFlats: 8, height: 4.7 },
    "M6": { acrossFlats: 10, height: 5.2 },
    "M8": { acrossFlats: 13, height: 6.8 },
    "M10": { acrossFlats: 16, height: 8.4 },
    "M12": { acrossFlats: 18, height: 10.8 },
    "M14": { acrossFlats: 21, height: 12.8 },
    "M16": { acrossFlats: 24, height: 14.8 },
    "M20": { acrossFlats: 30, height: 18 },
    "M24": { acrossFlats: 36, height: 21.5 },
};

export const PLAIN_WASHERS: Readonly<Record<MetricSize, WasherSizes>> = {
    "M1.6": { innerDiameter: 1.7, outerDiameter: 4, thickness: 0.3 },
    "M2": { innerDiameter: 2.2, outerDiameter: 5, thickness: 0.3 },
    "M2.5": { innerDiameter: 2.7, outerDiameter: 6, thickness: 0.5 },
    "M3": { innerDiameter: 3.2, outerDiameter: 7, thickness: 0.5 },
    "M4": { innerDiameter: 4.3, outerDiameter: 9, thickness: 0.8 },
    "M5": { innerDiameter: 5.3, outerDiameter: 10, thickness: 1 },
    "M6": { innerDiameter: 6.4, outerDiameter: 12, thickness: 1.6 },
    "M8": { innerDiameter: 8.4, outerDiameter: 16, thickness: 1.6 },
    "M10": { innerDiameter: 10.5, outerDiameter: 20, thickness: 2 },
    "M12": { innerDiameter: 13, outerDiameter: 24, thickness: 2.5 },
    "M14": { innerDiameter: 15, outerDiameter: 28, thickness: 2.5 },
    "M16": { innerDiameter: 17, outerDiameter: 30, thickness: 3 },
    "M20": { innerDiameter: 21, outerDiameter: 37, thickness: 3 },
    "M24": { innerDiameter: 25, outerDiameter: 44, thickness: 4 },
};

export const SET_SCREWS: Readonly<Partial<Record<MetricSize, SetScrewRow>>> = {
    "M1.6": { key: 0.7, depthShort: 0.7, depthLong: 1.5, flat: { diameter: 0.8, shortUpTo: 2 }, cone: { diameter: 0.4, shortUpTo: 2.5 }, dog: { diameter: 0.8, shortUpTo: 2.5, lengthShort: 0.4, lengthLong: 0.8 }, cup: { diameter: 0.8, shortUpTo: 2 } },
    "M2": { key: 0.9, depthShort: 0.8, depthLong: 1.7, flat: { diameter: 1, shortUpTo: 3 }, cone: { diameter: 0.5, shortUpTo: 3 }, dog: { diameter: 1, shortUpTo: 3, lengthShort: 0.5, lengthLong: 1 }, cup: { diameter: 1, shortUpTo: 2.5 } },
    "M2.5": { key: 1.3, depthShort: 1.2, depthLong: 2, flat: { diameter: 1.5, shortUpTo: 3 }, cone: { diameter: 0.65, shortUpTo: 3 }, dog: { diameter: 1.5, shortUpTo: 4, lengthShort: 0.63, lengthLong: 1.25 }, cup: { diameter: 1.2, shortUpTo: 3 } },
    "M3": { key: 1.5, depthShort: 1.2, depthLong: 2, flat: { diameter: 2, shortUpTo: 3 }, cone: { diameter: 0.75, shortUpTo: 4 }, dog: { diameter: 2, shortUpTo: 5, lengthShort: 0.75, lengthLong: 1.5 }, cup: { diameter: 1.4, shortUpTo: 4 } },
    "M4": { key: 2, depthShort: 1.5, depthLong: 2.5, flat: { diameter: 2.5, shortUpTo: 4 }, cone: { diameter: 1, shortUpTo: 5 }, dog: { diameter: 2.5, shortUpTo: 6, lengthShort: 1, lengthLong: 2 }, cup: { diameter: 2, shortUpTo: 5 } },
    "M5": { key: 2.5, depthShort: 2, depthLong: 3, flat: { diameter: 3.5, shortUpTo: 5 }, cone: { diameter: 1.25, shortUpTo: 6 }, dog: { diameter: 3.5, shortUpTo: 6, lengthShort: 1.25, lengthLong: 2.5 }, cup: { diameter: 2.5, shortUpTo: 5 } },
    "M6": { key: 3, depthShort: 2, depthLong: 3.5, flat: { diameter: 4, shortUpTo: 6 }, cone: { diameter: 1.5, shortUpTo: 6 }, dog: { diameter: 4, shortUpTo: 8, lengthShort: 1.5, lengthLong: 3 }, cup: { diameter: 3, shortUpTo: 6 } },
    "M8": { key: 4, depthShort: 3, depthLong: 5, flat: { diameter: 5.5, shortUpTo: 8 }, cone: { diameter: 2, shortUpTo: 8 }, dog: { diameter: 5.5, shortUpTo: 10, lengthShort: 2, lengthLong: 4 }, cup: { diameter: 5, shortUpTo: 8 } },
    "M10": { key: 5, depthShort: 4, depthLong: 6, flat: { diameter: 7, shortUpTo: 10 }, cone: { diameter: 2.5, shortUpTo: 10 }, dog: { diameter: 7, shortUpTo: 12, lengthShort: 2.5, lengthLong: 5 }, cup: { diameter: 6, shortUpTo: 10 } },
    "M12": { key: 6, depthShort: 4.8, depthLong: 8, flat: { diameter: 8.5, shortUpTo: 12 }, cone: { diameter: 3, shortUpTo: 12 }, dog: { diameter: 8.5, shortUpTo: 16, lengthShort: 3, lengthLong: 6 }, cup: { diameter: 8, shortUpTo: 12 } },
    "M16": { key: 8, depthShort: 6.4, depthLong: 10, flat: { diameter: 12, shortUpTo: 16 }, cone: { diameter: 4, shortUpTo: 16 }, dog: { diameter: 12, shortUpTo: 20, lengthShort: 4, lengthLong: 8 }, cup: { diameter: 10, shortUpTo: 16 } },
    "M20": { key: 10, depthShort: 8, depthLong: 12, flat: { diameter: 15, shortUpTo: 20 }, cone: { diameter: 5, shortUpTo: 20 }, dog: { diameter: 15, shortUpTo: 25, lengthShort: 5, lengthLong: 10 }, cup: { diameter: 14, shortUpTo: 20 } },
    "M24": { key: 12, depthShort: 10, depthLong: 15, flat: { diameter: 18, shortUpTo: 25 }, cone: { diameter: 6, shortUpTo: 25 }, dog: { diameter: 18, shortUpTo: 30, lengthShort: 6, lengthLong: 12 }, cup: { diameter: 16, shortUpTo: 25 } },
};

export const SCREW_THREAD_EXTRA = 12;
export const COUNTERBORE_SINK = 0.5;
export const BOLT_THREAD_EXTRA_SHORT = 6;
export const BOLT_THREAD_EXTRA_MEDIUM = 12;
export const BOLT_THREAD_EXTRA_LONG = 25;
export const BOLT_LENGTH_SHORT = 125;
export const BOLT_LENGTH_MEDIUM = 200;
export const THREAD_DEPTH_FACTOR = 1.226869;
export const INTERNAL_DEPTH_FACTOR = 1.082532;
export const PITCH_DEPTH_FACTOR = 0.649519;
export const POINT_CHAMFER_ANGLE = 90;
export const CONE_SHORT_ANGLE = 120;
export const CONE_LONG_ANGLE = 90;
export const CUP_ANGLE = 120;
export const WASHER_CHAMFER_SHARE = 0.25;
export const WASHER_CHAMFER_ANGLE = 30;
export const SMALLEST_CHAMFERED_WASHER = 5;
