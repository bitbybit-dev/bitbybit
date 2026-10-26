import { InputError } from "../kernel-calls/errors";
import { roundedToMillionths } from "../services/helpers/geometry/scalars";
import { lengthsConverted } from "../services/helpers/geometry/lengths";
import type { Base } from "../inputs/base-inputs";
import type { AnsiSplinePitch, InvoluteSplineSizes } from "./spline-types";
import {
    ANSI_SPLINE_FLAT_ROOT_SHARE, ANSI_SPLINE_LEAST_TEETH, ANSI_SPLINE_MAJOR_SHARE, ANSI_SPLINE_MINOR_SHARE, ANSI_SPLINE_MOST_TEETH, ANSI_SPLINE_PITCHES,
    ANSI_SPLINE_PRESSURE_ANGLE, ANSI_SPLINE_ROOT_FILLET,
} from "./ansi-splines.constants";
import { SPLINE_LENGTHS } from "./din-splines.constants";

export function ansiInvoluteSplineSizes(teeth: number, pitch: AnsiSplinePitch, unit: `${Base.unitOfLengthEnum}`): InvoluteSplineSizes {
    if (!ANSI_SPLINE_PITCHES.includes(pitch)) {
        throw new InputError(`\`pitch\` is ${String(pitch)}, not one ANSI B92.1 gives its 30 degree flat root side fit: ${ANSI_SPLINE_PITCHES.join(", ")}.`, "pitch");
    }
    if (!Number.isInteger(teeth) || teeth < ANSI_SPLINE_LEAST_TEETH || teeth > ANSI_SPLINE_MOST_TEETH) {
        throw new InputError(`\`teeth\` is ${String(teeth)}, and a 30 degree ANSI B92.1 spline has a whole number from ${String(ANSI_SPLINE_LEAST_TEETH)} to ${String(ANSI_SPLINE_MOST_TEETH)}.`, "teeth");
    }
    const diametral = Number(pitch.split("/")[0]);
    const across = (share: number): number => roundedToMillionths((teeth + share) / diametral);
    const sizes: InvoluteSplineSizes = {
        referenceDiameter: across(0),
        module: roundedToMillionths(1 / diametral),
        teeth,
        pressureAngle: ANSI_SPLINE_PRESSURE_ANGLE,
        profileShift: 0,
        rootFillet: ANSI_SPLINE_ROOT_FILLET,
        shaftTipDiameter: across(ANSI_SPLINE_MAJOR_SHARE),
        shaftRootDiameter: across(-ANSI_SPLINE_FLAT_ROOT_SHARE),
        hubTipDiameter: across(-ANSI_SPLINE_MINOR_SHARE),
        hubRootDiameter: across(ANSI_SPLINE_FLAT_ROOT_SHARE),
    };
    return lengthsConverted(sizes, SPLINE_LENGTHS, "in", unit);
}
