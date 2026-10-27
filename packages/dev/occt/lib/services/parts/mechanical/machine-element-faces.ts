import * as Inputs from "../../../api/inputs";
import { near } from "../face-spots";
import type { FaceRule, RingRoles } from "../parts-types";

const PLANE = Inputs.OCCT.surfaceTypeEnum.plane;
const CYLINDER = Inputs.OCCT.surfaceTypeEnum.cylinder;
const RACES: ReadonlySet<string> = new Set([Inputs.OCCT.surfaceTypeEnum.torus, Inputs.OCCT.surfaceTypeEnum.revolution]);

export function springRule(length: number, tolerance: number): FaceRule {
    return spot => {
        if (spot.kind === PLANE && near(spot.zMax, 0, tolerance)) {
            return "bottom";
        }
        return spot.kind === PLANE && near(spot.zMin, length, tolerance) ? "top" : "coil";
    };
}

export function ringRule(seatRadius: number, width: number, roles: RingRoles, tolerance: number): FaceRule {
    return spot => {
        if (spot.kind === CYLINDER && near(spot.reach, seatRadius, tolerance)) {
            return roles.seat;
        }
        if (spot.kind === PLANE && near(spot.zMax, 0, tolerance)) {
            return roles.start;
        }
        if (spot.kind === PLANE && near(spot.zMin, width, tolerance)) {
            return roles.end;
        }
        return RACES.has(spot.kind) ? "race" : roles.ring;
    };
}

export function wholeRule(role: string): FaceRule {
    return () => role;
}

export function keyRule(height: number, tolerance: number): FaceRule {
    return spot => {
        if (spot.kind === CYLINDER) {
            return "end";
        }
        if (near(spot.zMax, 0, tolerance)) {
            return "bottom";
        }
        return near(spot.zMin, height, tolerance) ? "top" : "side";
    };
}

export function retainingRingRule(seatRadius: number, thickness: number, holeDiameter: number, tolerance: number): FaceRule {
    return spot => {
        if (spot.kind === CYLINDER && spot.span <= holeDiameter + tolerance) {
            return "lug";
        }
        if (spot.kind === CYLINDER) {
            return near(spot.reach, seatRadius, tolerance) ? "seat" : "rim";
        }
        if (near(spot.zMax, 0, tolerance)) {
            return "start";
        }
        return near(spot.zMin, thickness, tolerance) ? "end" : "gap";
    };
}
