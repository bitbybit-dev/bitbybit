import type * as Inputs from "../inputs";
import { InputError } from "../kernel-calls/errors";
import type { GearOutline, HelicalGearSizes, HelicalGearSpec, SpurGearSpec } from "./gear-types";
import { MAX_HELIX_ANGLE, MAX_PRESSURE_ANGLE, SHOWN_DIGITS } from "./gears.constants";
import { degreesOf, radiansOf } from "../services/helpers/geometry/scalars";
import { spurGearOutline, spurGearSizes } from "./gears";

export function helicalTransverseSpec(spec: HelicalGearSpec): SpurGearSpec {
    if (!(Math.abs(spec.helixAngle) < MAX_HELIX_ANGLE)) {
        throw new InputError(`\`helixAngle\` is not between -${String(MAX_HELIX_ANGLE)} and ${String(MAX_HELIX_ANGLE)} degrees.`, "helixAngle");
    }
    spurGearSizes(spec);
    const cos = Math.cos(radiansOf(spec.helixAngle));
    const pressureAngle = degreesOf(Math.atan(Math.tan(radiansOf(spec.pressureAngle)) / cos));
    if (!(pressureAngle < MAX_PRESSURE_ANGLE)) {
        throw new InputError(`\`pressureAngle\` ${String(spec.pressureAngle)} with \`helixAngle\` ${String(spec.helixAngle)} gives a transverse pressure angle of ${String(Number(pressureAngle.toPrecision(SHOWN_DIGITS)))} degrees, above ${String(MAX_PRESSURE_ANGLE)}: lower one of them.`, "pressureAngle");
    }
    return {
        module: spec.module / cos,
        teeth: spec.teeth,
        pressureAngle,
        profileShift: spec.profileShift * cos,
        backlash: spec.backlash,
        addendum: spec.addendum * cos,
        dedendum: spec.dedendum * cos,
        rootFillet: spec.rootFillet * cos,
    };
}

export function helicalGearSizes(spec: HelicalGearSpec): HelicalGearSizes {
    const transverse = helicalTransverseSpec(spec);
    const sizes = spurGearSizes(transverse);
    return {
        ...sizes,
        transverseModule: transverse.module,
        transversePressureAngle: transverse.pressureAngle,
        twist: degreesOf(Math.tan(radiansOf(spec.helixAngle)) / sizes.pitchRadius),
    };
}

export function helicalGearOutline(spec: HelicalGearSpec, centre: Inputs.Base.Point2 = [0, 0], rotation = 0): GearOutline {
    return spurGearOutline(helicalTransverseSpec(spec), centre, rotation);
}
