import * as Inputs from "../inputs";
import type { AnsiSplinePitch } from "./spline-types";

export const ANSI_SPLINE_PITCHES: readonly AnsiSplinePitch[] = Object.values(Inputs.Engineering.ansiSplinePitchEnum);
export const ANSI_SPLINE_PRESSURE_ANGLE = 30;
export const ANSI_SPLINE_ROOT_FILLET = 0.1;
export const ANSI_SPLINE_MAJOR_SHARE = 1;
export const ANSI_SPLINE_MINOR_SHARE = 1;
export const ANSI_SPLINE_FLAT_ROOT_SHARE = 1.35;
export const ANSI_SPLINE_LEAST_TEETH = 6;
export const ANSI_SPLINE_MOST_TEETH = 60;
