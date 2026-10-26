import * as Inputs from "../inputs";
import type { AnsiThreadRow, AnsiThreadSize } from "./thread-types";

export const ANSI_THREAD_SIZES: readonly AnsiThreadSize[] = Object.values(Inputs.Engineering.ansiThreadSizeEnum);

export const UNIFIED_THREADS: Readonly<Record<AnsiThreadSize, AnsiThreadRow>> = {
    "#0": { diameter: 0.06, unc: undefined, unf: { threadsPerInch: 80, tapDrill: 0.046875 } },
    "#1": { diameter: 0.073, unc: { threadsPerInch: 64, tapDrill: 0.0595 }, unf: { threadsPerInch: 72, tapDrill: 0.0595 } },
    "#2": { diameter: 0.086, unc: { threadsPerInch: 56, tapDrill: 0.07 }, unf: { threadsPerInch: 64, tapDrill: 0.07 } },
    "#3": { diameter: 0.099, unc: { threadsPerInch: 48, tapDrill: 0.0785 }, unf: { threadsPerInch: 56, tapDrill: 0.082 } },
    "#4": { diameter: 0.112, unc: { threadsPerInch: 40, tapDrill: 0.089 }, unf: { threadsPerInch: 48, tapDrill: 0.0935 } },
    "#5": { diameter: 0.125, unc: { threadsPerInch: 40, tapDrill: 0.1015 }, unf: { threadsPerInch: 44, tapDrill: 0.104 } },
    "#6": { diameter: 0.138, unc: { threadsPerInch: 32, tapDrill: 0.1065 }, unf: { threadsPerInch: 40, tapDrill: 0.113 } },
    "#8": { diameter: 0.164, unc: { threadsPerInch: 32, tapDrill: 0.136 }, unf: { threadsPerInch: 36, tapDrill: 0.136 } },
    "#10": { diameter: 0.19, unc: { threadsPerInch: 24, tapDrill: 0.1495 }, unf: { threadsPerInch: 32, tapDrill: 0.159 } },
    "#12": { diameter: 0.216, unc: { threadsPerInch: 24, tapDrill: 0.177 }, unf: { threadsPerInch: 28, tapDrill: 0.182 } },
    "1/4": { diameter: 0.25, unc: { threadsPerInch: 20, tapDrill: 0.201 }, unf: { threadsPerInch: 28, tapDrill: 0.213 } },
    "5/16": { diameter: 0.3125, unc: { threadsPerInch: 18, tapDrill: 0.257 }, unf: { threadsPerInch: 24, tapDrill: 0.272 } },
    "3/8": { diameter: 0.375, unc: { threadsPerInch: 16, tapDrill: 0.3125 }, unf: { threadsPerInch: 24, tapDrill: 0.332 } },
    "7/16": { diameter: 0.4375, unc: { threadsPerInch: 14, tapDrill: 0.368 }, unf: { threadsPerInch: 20, tapDrill: 0.390625 } },
    "1/2": { diameter: 0.5, unc: { threadsPerInch: 13, tapDrill: 0.421875 }, unf: { threadsPerInch: 20, tapDrill: 0.453125 } },
    "9/16": { diameter: 0.5625, unc: { threadsPerInch: 12, tapDrill: 0.484375 }, unf: { threadsPerInch: 18, tapDrill: 0.515625 } },
    "5/8": { diameter: 0.625, unc: { threadsPerInch: 11, tapDrill: 0.53125 }, unf: { threadsPerInch: 18, tapDrill: 0.578125 } },
    "3/4": { diameter: 0.75, unc: { threadsPerInch: 10, tapDrill: 0.65625 }, unf: { threadsPerInch: 16, tapDrill: 0.6875 } },
    "7/8": { diameter: 0.875, unc: { threadsPerInch: 9, tapDrill: 0.765625 }, unf: { threadsPerInch: 14, tapDrill: 0.8125 } },
    "1": { diameter: 1, unc: { threadsPerInch: 8, tapDrill: 0.875 }, unf: { threadsPerInch: 12, tapDrill: 0.921875 } },
};

export const UNR_EXTERNAL_ROOT_FACTOR = 1.19078;
export const TAPPING_DEPTH_FACTOR = 0.974279;
export const ANSI_DRILL_STEP = 0.001;
