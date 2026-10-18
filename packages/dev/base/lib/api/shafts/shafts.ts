import * as Inputs from "../inputs";
import { roundedToMillionths } from "../services/helpers/geometry/scalars";
import { InputError } from "../kernel-calls/errors";
import type { InvoluteSplineSizes, KnurlPattern, KnurlSizes } from "./shaft-types";
import {
    KNURL_HELIX_ANGLE, KNURL_PITCHES, SHIFT_TOLERANCE, SPLINE_BASE_SHARE, SPLINE_DEDENDUM_SHARE, SPLINE_HUB_TIP_SHARE, SPLINE_LEAST_SHIFT, SPLINE_LEAST_TEETH,
    SPLINE_MODULES, SPLINE_MOST_SHIFT, SPLINE_MOST_TEETH, SPLINE_PRESSURE_ANGLE, SPLINE_TIP_SHARE,
} from "./shafts.constants";

const shiftOf = (diameter: number, module: number, teeth: number): number => (diameter - module * teeth - SPLINE_BASE_SHARE * module) / (2 * module);

export function involuteSplineSizes(referenceDiameter: number, module: number): InvoluteSplineSizes {
    if (!SPLINE_MODULES.includes(module)) {
        throw new InputError(`\`module\` is ${String(module)}, not one of DIN 5480's: ${SPLINE_MODULES.join(", ")}.`, "module");
    }
    if (!(referenceDiameter > 0)) {
        throw new InputError("`referenceDiameter` is not more than 0.", "referenceDiameter");
    }
    const ratio = referenceDiameter / module;
    const fits = [Math.floor(ratio - 2), Math.floor(ratio - 2) + 1, Math.floor(ratio - 2) + 2].filter(teeth => {
        const shift = shiftOf(referenceDiameter, module, teeth);
        return shift >= SPLINE_LEAST_SHIFT - SHIFT_TOLERANCE && shift <= SPLINE_MOST_SHIFT + SHIFT_TOLERANCE;
    });
    const teeth = fits.find(count => count % 2 === 0) ?? fits[0];
    if (teeth === undefined || teeth < SPLINE_LEAST_TEETH || teeth > SPLINE_MOST_TEETH) {
        throw new InputError(`A ${String(referenceDiameter)} spline of module ${String(module)} has no tooth count DIN 5480 allows: pick another module.`, "module");
    }
    const dedendum = SPLINE_DEDENDUM_SHARE * module;
    return {
        referenceDiameter,
        module,
        teeth,
        pressureAngle: SPLINE_PRESSURE_ANGLE,
        profileShift: roundedToMillionths(shiftOf(referenceDiameter, module, teeth)),
        shaftTipDiameter: roundedToMillionths(referenceDiameter - SPLINE_TIP_SHARE * module),
        shaftRootDiameter: roundedToMillionths(referenceDiameter - SPLINE_BASE_SHARE * module - 2 * dedendum),
        hubTipDiameter: roundedToMillionths(referenceDiameter - SPLINE_HUB_TIP_SHARE * module),
        hubRootDiameter: roundedToMillionths(referenceDiameter - SPLINE_BASE_SHARE * module + 2 * dedendum),
    };
}

const PATTERNS: readonly KnurlPattern[] = Object.values(Inputs.Engineering.knurlPatternEnum);

export function knurlSizes(diameter: number, pitch: number, pattern: KnurlPattern): KnurlSizes {
    if (!PATTERNS.includes(pattern)) {
        throw new InputError(`\`pattern\` is not one of ${PATTERNS.join(", ")}.`, "pattern");
    }
    if (!KNURL_PITCHES.includes(pitch)) {
        throw new InputError(`\`pitch\` is ${String(pitch)}, not one of DIN 82's: ${KNURL_PITCHES.join(", ")}.`, "pitch");
    }
    if (!(diameter > 2 * pitch)) {
        throw new InputError(`\`diameter\` is too small for a knurl of pitch ${String(pitch)}: make it more than ${String(2 * pitch)}.`, "diameter");
    }
    const grooves = Math.round(Math.PI * diameter / pitch);
    return { grooves, diameter: roundedToMillionths(grooves * pitch / Math.PI), depth: pitch / 2, helixAngle: pattern === "straight" ? 0 : KNURL_HELIX_ANGLE };
}
