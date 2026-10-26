import * as Inputs from "../inputs";
import type { IsoThreadRow, IsoThreadSize } from "./thread-types";

export const ISO_THREAD_SIZES: readonly IsoThreadSize[] = Object.values(Inputs.Engineering.isoThreadSizeEnum);

export const COARSE_THREADS: Readonly<Record<IsoThreadSize, IsoThreadRow>> = {
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

export const ISO_EXTERNAL_ROOT_FACTOR = 1.226869;
export const ISO_DRILL_STEP = 0.05;
