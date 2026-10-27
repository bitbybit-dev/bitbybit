import { InputError } from "../kernel-calls/errors";
import { roundedToMillionths } from "../services/helpers/geometry/scalars";
import { lengthsConverted } from "../services/helpers/geometry/lengths";
import type { Base } from "../inputs/base-inputs";
import type { InvoluteSplineSizes } from "./spline-types";
import {
    SHIFT_TOLERANCE, SPLINE_BASE_SHARE, SPLINE_DEDENDUM_SHARE, SPLINE_HUB_TIP_SHARE, SPLINE_LEAST_SHIFT, SPLINE_LEAST_TEETH, SPLINE_MODULES, SPLINE_MOST_SHIFT, SPLINE_MOST_TEETH, SPLINE_PRESSURE_ANGLE, SPLINE_ROOT_FILLET, SPLINE_TIP_SHARE,
} from "./din-splines.constants";
import { SPLINE_LENGTHS } from "./splines.constants";

const shiftOf = (diameter: number, module: number, teeth: number): number => (diameter - module * teeth - SPLINE_BASE_SHARE * module) / (2 * module);

export function dinInvoluteSplineSizes(referenceDiameter: number, module: number, unit: `${Base.unitOfLengthEnum}`): InvoluteSplineSizes {
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
    const sizes: InvoluteSplineSizes = {
        referenceDiameter,
        module,
        teeth,
        pressureAngle: SPLINE_PRESSURE_ANGLE,
        profileShift: roundedToMillionths(shiftOf(referenceDiameter, module, teeth)),
        rootFillet: SPLINE_ROOT_FILLET,
        shaftTipDiameter: roundedToMillionths(referenceDiameter - SPLINE_TIP_SHARE * module),
        shaftRootDiameter: roundedToMillionths(referenceDiameter - SPLINE_BASE_SHARE * module - 2 * dedendum),
        hubTipDiameter: roundedToMillionths(referenceDiameter - SPLINE_HUB_TIP_SHARE * module),
        hubRootDiameter: roundedToMillionths(referenceDiameter - SPLINE_BASE_SHARE * module + 2 * dedendum),
    };
    return lengthsConverted(sizes, SPLINE_LENGTHS, "mm", unit);
}
