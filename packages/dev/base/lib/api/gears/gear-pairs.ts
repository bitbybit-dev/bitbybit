import type * as Inputs from "../inputs";
import { InputError } from "../kernel-calls/errors";
import type { GearMesh, GearPairSizes, GearPairSpec, InternalGearPairSizes, InternalGearPairSpec, PlanetarySet, PlanetarySetSpec } from "./gear-types";
import { involute } from "./involute-flank";
import { checkedDedendum, checkedRingTips, checkedShared, checkedToothCount } from "./gear-checks";
import { FULL_TURN_DEGREES, HALF_TURN_DEGREES, INVOLUTE_SERIES_DIVISOR, MAX_PRESSURE_ANGLE, NEWTON_STEPS, PHASE_TOLERANCE } from "./gears.constants";
import { polar2 } from "../services/helpers/geometry/vectors";
import { degreesOf, fractionOf, radiansOf } from "../services/helpers/geometry/scalars";

const inverseInvolute = (value: number): number => {
    let low = 0;
    let high = Math.PI / 2;
    let angle = Math.min(Math.cbrt(INVOLUTE_SERIES_DIVISOR * value), high / 2);
    for (let step = 0; step < NEWTON_STEPS; step++) {
        const error = involute(angle) - value;
        if (error > 0) {
            high = angle;
        } else {
            low = angle;
        }
        const next = angle - error / Math.tan(angle) ** 2;
        angle = next > low && next < high ? next : (low + high) / 2;
    }
    return angle;
};

const rollOf = (tipRadius: number, baseRadius: number): number => Math.sqrt(tipRadius * tipRadius - baseRadius * baseRadius);

const checkedTip = (tipRadius: number, baseRadius: number, gear: string, teeth: string, shift: string): void => {
    if (!(tipRadius >= baseRadius)) {
        throw new InputError(`The tips of the ${gear} gear's teeth reach inside its base circle, where no involute runs: give it more \`${teeth}\` or a larger \`${shift}\`.`, shift);
    }
};

const externalMesh = (module: number, teethA: number, teethB: number, alpha: number, working: number, tipA: number, tipB: number): GearMesh => {
    const centreDistance = module * (teethA + teethB) / 2 * (Math.cos(alpha) / Math.cos(working));
    const line = centreDistance * Math.sin(working);
    const rollA = rollOf(tipA, module * teethA / 2 * Math.cos(alpha));
    const rollB = rollOf(tipB, module * teethB / 2 * Math.cos(alpha));
    const contact = Math.min(rollA, line) + Math.min(rollB, line) - line;
    return { centreDistance, contactRatio: Math.max(0, contact) / (Math.PI * module * Math.cos(alpha)), interferes: rollA > line || rollB > line };
};

const internalMesh = (module: number, pinionTeeth: number, ringTeeth: number, alpha: number, addendum: number): GearMesh => {
    const centreDistance = module * (ringTeeth - pinionTeeth) / 2;
    const pinionTip = module * (pinionTeeth / 2 + addendum);
    const ringTip = module * (ringTeeth / 2 - addendum);
    const pinionBase = module * pinionTeeth / 2 * Math.cos(alpha);
    const ringBase = module * ringTeeth / 2 * Math.cos(alpha);
    const line = centreDistance * Math.sin(alpha);
    const ringRoll = rollOf(ringTip, ringBase);
    const contact = rollOf(pinionTip, pinionBase) - Math.max(ringRoll, line) + line;
    const pinionTipAngle = Math.acos(pinionBase / pinionTip);
    const ringTipAngle = Math.acos(ringBase / ringTip);
    const pinionTurn = Math.acos((ringTip * ringTip - pinionTip * pinionTip - centreDistance * centreDistance) / (2 * centreDistance * pinionTip)) + involute(pinionTipAngle) - involute(alpha);
    const ringTurn = Math.acos((centreDistance * centreDistance + ringTip * ringTip - pinionTip * pinionTip) / (2 * centreDistance * ringTip));
    const tipsClear = pinionTurn * pinionTeeth / ringTeeth + involute(alpha) - involute(ringTipAngle) >= ringTurn;
    return { centreDistance, contactRatio: Math.max(0, contact) / (Math.PI * module * Math.cos(alpha)), interferes: ringRoll < line || !tipsClear };
};

export function gearPair(spec: GearPairSpec): GearPairSizes {
    checkedShared(spec);
    checkedDedendum(spec.dedendum);
    checkedToothCount(spec.teethA, "teethA");
    checkedToothCount(spec.teethB, "teethB");
    if (!Number.isFinite(spec.profileShiftA) || !Number.isFinite(spec.profileShiftB)) {
        throw new InputError("A profile shift is not a number.", Number.isFinite(spec.profileShiftA) ? "profileShiftB" : "profileShiftA");
    }
    const { module, teethA, teethB } = spec;
    const alpha = radiansOf(spec.pressureAngle);
    const shift = spec.profileShiftA + spec.profileShiftB;
    const workingInvolute = 2 * Math.tan(alpha) * shift / (teethA + teethB) + involute(alpha);
    if (!(workingInvolute > 0)) {
        throw new InputError(`The profile shifts add up to ${String(shift)}, which leaves the pair no working pressure angle: their sum must be more than ${String(-(teethA + teethB) * involute(alpha) / (2 * Math.tan(alpha)))}.`, "profileShiftA");
    }
    if (!(workingInvolute <= involute(radiansOf(MAX_PRESSURE_ANGLE)))) {
        throw new InputError(`The profile shifts add up to ${String(shift)}, which would have the pair work at a pressure angle above ${String(MAX_PRESSURE_ANGLE)} degrees: lower \`profileShiftA\` or \`profileShiftB\`.`, "profileShiftA");
    }
    const tipA = module * (teethA / 2 + spec.addendum + spec.profileShiftA);
    const tipB = module * (teethB / 2 + spec.addendum + spec.profileShiftB);
    checkedTip(tipA, module * teethA / 2 * Math.cos(alpha), "first", "teethA", "profileShiftA");
    checkedTip(tipB, module * teethB / 2 * Math.cos(alpha), "second", "teethB", "profileShiftB");
    const working = shift === 0 ? alpha : inverseInvolute(workingInvolute);
    const mesh = externalMesh(module, teethA, teethB, alpha, working, tipA, tipB);
    const shortening = shift - (mesh.centreDistance - module * (teethA + teethB) / 2) / module;
    return {
        centreDistance: mesh.centreDistance,
        workingPressureAngle: degreesOf(working),
        contactRatio: mesh.contactRatio,
        ratio: teethB / teethA,
        interferes: mesh.interferes,
        tipShortening: module * Math.max(0, shortening),
        clearance: mesh.centreDistance - tipA - module * (teethB / 2 - spec.dedendum + spec.profileShiftB),
    };
}

export function internalGearPair(spec: InternalGearPairSpec): InternalGearPairSizes {
    checkedShared(spec);
    checkedToothCount(spec.pinionTeeth, "pinionTeeth");
    checkedToothCount(spec.ringTeeth, "ringTeeth");
    if (!(spec.ringTeeth > spec.pinionTeeth)) {
        throw new InputError("`ringTeeth` is not more than `pinionTeeth`, so the gear cannot fit inside the ring.", "ringTeeth");
    }
    checkedRingTips(spec.ringTeeth, spec, "ringTeeth", "give the ring more `ringTeeth` or a smaller `addendum`");
    const mesh = internalMesh(spec.module, spec.pinionTeeth, spec.ringTeeth, radiansOf(spec.pressureAngle), spec.addendum);
    return { centreDistance: mesh.centreDistance, contactRatio: mesh.contactRatio, ratio: spec.ringTeeth / spec.pinionTeeth, interferes: mesh.interferes };
}

export function planetarySet(spec: PlanetarySetSpec): PlanetarySet {
    checkedShared(spec);
    checkedToothCount(spec.sunTeeth, "sunTeeth");
    checkedToothCount(spec.planetTeeth, "planetTeeth");
    if (!Number.isInteger(spec.planets) || spec.planets < 1) {
        throw new InputError("`planets` is not a whole number of at least 1.", "planets");
    }
    const { module, sunTeeth, planetTeeth, planets } = spec;
    const ringTeeth = sunTeeth + 2 * planetTeeth;
    checkedRingTips(ringTeeth, spec, "planetTeeth", "give the sun or the planets more teeth, or a smaller `addendum`");
    const centreDistance = module * (sunTeeth + planetTeeth) / 2;
    const angles = Array.from({ length: planets }, (_, index) => FULL_TURN_DEGREES * index / planets);
    const planetRotations = angles.map(angle => {
        const sunPhase = fractionOf(angle * sunTeeth / FULL_TURN_DEGREES);
        const turned = angle + HALF_TURN_DEGREES - FULL_TURN_DEGREES / planetTeeth * fractionOf(1 / 2 - sunPhase);
        return turned - FULL_TURN_DEGREES / planetTeeth * Math.floor(turned * planetTeeth / FULL_TURN_DEGREES);
    });
    const planetPhase = (index: number): number => fractionOf((angles[index]! - planetRotations[index]!) * planetTeeth / FULL_TURN_DEGREES);
    const ringRotation = FULL_TURN_DEGREES / ringTeeth * fractionOf(1 / 2 - planetPhase(0));
    const meshes = angles.every((angle, index) => {
        const ringPhase = fractionOf((angle - ringRotation) * ringTeeth / FULL_TURN_DEGREES);
        const offset = fractionOf(planetPhase(index) - ringPhase);
        return Math.abs(offset - 1 / 2) < PHASE_TOLERANCE;
    });
    const planetTip = module * (planetTeeth / 2 + spec.addendum);
    const alpha = radiansOf(spec.pressureAngle);
    const sunMesh = externalMesh(module, sunTeeth, planetTeeth, alpha, alpha, module * (sunTeeth / 2 + spec.addendum), planetTip);
    const ringMesh = internalMesh(module, planetTeeth, ringTeeth, alpha, spec.addendum);
    const planetCentres = angles.map((angle): Inputs.Base.Point3 => [...polar2(centreDistance, radiansOf(angle)), 0]);
    return {
        ringTeeth,
        centreDistance,
        ratio: 1 + ringTeeth / sunTeeth,
        assemblable: meshes,
        planetsClear: planets < 2 || 2 * centreDistance * Math.sin(Math.PI / planets) > 2 * planetTip,
        interferes: sunMesh.interferes || ringMesh.interferes,
        planetCentres,
        planetRotations,
        ringRotation,
    };
}
