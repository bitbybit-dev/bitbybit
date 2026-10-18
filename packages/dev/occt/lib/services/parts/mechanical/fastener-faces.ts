import * as Inputs from "../../../api/inputs";
import { near } from "../face-spots";
import type { FaceRule, FaceSpot, ScrewShape } from "../parts-types";

const PLANE = Inputs.OCCT.surfaceTypeEnum.plane;
const CYLINDER = Inputs.OCCT.surfaceTypeEnum.cylinder;
const CONE = Inputs.OCCT.surfaceTypeEnum.cone;

const shankRole = (spot: FaceSpot, screw: ScrewShape, tolerance: number): string => {
    const threadTop = screw.threaded - screw.length;
    if (spot.kind === CYLINDER && near(spot.reach, screw.diameter / 2, tolerance)) {
        return spot.zMax <= threadTop + tolerance ? "thread" : "shank";
    }
    if ((spot.kind === PLANE || spot.kind === CONE) && spot.zMax <= screw.tip - screw.length + tolerance) {
        return "end";
    }
    return spot.zMin >= threadTop + tolerance ? "shank" : "thread";
};

const isSocket = (spot: FaceSpot, screw: ScrewShape, tolerance: number): boolean =>
    spot.zMin >= screw.socketBottom - tolerance && spot.reach <= screw.socketReach + tolerance;

export function socketScrewRule(screw: ScrewShape, tolerance: number): FaceRule {
    return spot => {
        if (spot.z < -tolerance) {
            return shankRole(spot, screw, tolerance);
        }
        if (spot.kind === PLANE && near(spot.zMax, 0, tolerance)) {
            return "seat";
        }
        return isSocket(spot, screw, tolerance) ? "recess" : "head";
    };
}

export function hexBoltRule(screw: ScrewShape, tolerance: number): FaceRule {
    return spot => {
        if (spot.z < -tolerance) {
            return shankRole(spot, screw, tolerance);
        }
        return spot.kind === PLANE && near(spot.zMax, 0, tolerance) ? "seat" : "head";
    };
}

export function hexNutRule(threadRadius: number, height: number, tolerance: number): FaceRule {
    return spot => {
        if (spot.kind === CYLINDER && near(spot.reach, threadRadius, tolerance)) {
            return "thread";
        }
        if (spot.kind === PLANE && near(spot.zMax, 0, tolerance)) {
            return "seat";
        }
        return spot.kind === PLANE && near(spot.zMin, height, tolerance) ? "top" : "side";
    };
}

export function washerRule(innerRadius: number, thickness: number, tolerance: number): FaceRule {
    return spot => {
        if (spot.kind === CYLINDER) {
            return near(spot.reach, innerRadius, tolerance) ? "bore" : "rim";
        }
        return near(spot.zMax, 0, tolerance) ? "seat" : near(spot.zMin, thickness, tolerance) ? "top" : "rim";
    };
}

export function setScrewRule(screw: ScrewShape, tolerance: number): FaceRule {
    return spot => {
        if (isSocket(spot, screw, tolerance) && !(spot.kind === PLANE && near(spot.zMin, 0, tolerance))) {
            return "recess";
        }
        if (spot.kind === CYLINDER && near(spot.reach, screw.diameter / 2, tolerance)) {
            return "thread";
        }
        return spot.z > -screw.length / 2 ? "top" : "end";
    };
}

export function dowelPinRule(): FaceRule {
    return spot => spot.kind === CYLINDER ? "side" : "end";
}
