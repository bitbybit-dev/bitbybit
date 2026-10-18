import { InputError } from "../kernel-calls/errors";
import type { GearSharedSpec, GearTeeth, RackSpec } from "./gear-types";
import { MAX_PRESSURE_ANGLE, MIN_TEETH } from "./gears.constants";
import { radiansOf } from "../services/helpers/geometry/scalars";

const checkedFinite = (value: number, name: string): void => {
    if (!Number.isFinite(value)) {
        throw new InputError(`\`${name}\` is not a finite number.`, name);
    }
};

const checkedPositive = (value: number, name: string): void => {
    if (!(value > 0)) {
        throw new InputError(`\`${name}\` is not more than 0.`, name);
    }
    checkedFinite(value, name);
};

const checkedPressureAngle = (pressureAngle: number): void => {
    if (!(pressureAngle > 0 && pressureAngle < MAX_PRESSURE_ANGLE)) {
        throw new InputError(`\`pressureAngle\` is not between 0 and ${String(MAX_PRESSURE_ANGLE)} degrees.`, "pressureAngle");
    }
};

const checkedToothForm = (spec: GearTeeth): void => {
    checkedDedendum(spec.dedendum);
    if (!(spec.rootFillet >= 0)) {
        throw new InputError("`rootFillet` is less than 0.", "rootFillet");
    }
    checkedFinite(spec.rootFillet, "rootFillet");
    if (!(spec.backlash >= 0)) {
        throw new InputError("`backlash` is less than 0.", "backlash");
    }
    checkedFinite(spec.backlash, "backlash");
};

export const checkedDedendum = (dedendum: number): void => checkedPositive(dedendum, "dedendum");

export const checkedToothCount = (teeth: number, name: string, least = MIN_TEETH): void => {
    if (!Number.isInteger(teeth) || teeth < least) {
        throw new InputError(`\`${name}\` is not a whole number of at least ${String(least)}.`, name);
    }
};

export const checkedShared = (spec: GearSharedSpec): void => {
    checkedPositive(spec.module, "module");
    checkedPressureAngle(spec.pressureAngle);
    checkedPositive(spec.addendum, "addendum");
};

export const checkedTeeth = (spec: GearTeeth, least = MIN_TEETH): void => {
    checkedPositive(spec.module, "module");
    checkedToothCount(spec.teeth, "teeth", least);
    checkedPressureAngle(spec.pressureAngle);
    checkedPositive(spec.addendum, "addendum");
    checkedToothForm(spec);
};

export const checkedThickness = (unloosened: number, backlash: number): void => {
    if (!(unloosened > 0)) {
        throw new InputError("`profileShift` thins the teeth to nothing at the pitch circle: make it larger.", "profileShift");
    }
    if (!(unloosened > backlash)) {
        throw new InputError("`backlash` takes the whole tooth away.", "backlash");
    }
};

export const checkedRack = (spec: RackSpec): void => {
    checkedTeeth(spec, 1);
    if (!(spec.height > spec.dedendum * spec.module)) {
        throw new InputError("`height` does not reach below the gaps: make it more than the dedendum times the module.", "height");
    }
    checkedFinite(spec.height, "height");
};

export const checkedRingTips = (ringTeeth: number, spec: GearSharedSpec, property: string, remedy: string): void => {
    const pitchRadius = spec.module * ringTeeth / 2;
    if (!(pitchRadius - spec.module * spec.addendum >= pitchRadius * Math.cos(radiansOf(spec.pressureAngle)))) {
        throw new InputError(`The tips of the ring's ${String(ringTeeth)} teeth reach inside its base circle, where no involute runs: ${remedy}.`, property);
    }
};
