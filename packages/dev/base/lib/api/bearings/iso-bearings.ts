import { InputError } from "../kernel-calls/errors";
import { lengthsConverted } from "../services/helpers/geometry/lengths";
import type { Base } from "../inputs/base-inputs";
import type { BallBearingSizes, IsoBallBearingDesignation } from "./bearing-types";
import { BALL_BEARINGS } from "./iso-bearings.constants";
import { BEARING_LENGTHS } from "./bearings.constants";

export function isoBallBearingDesignations(): IsoBallBearingDesignation[] {
    return Object.keys(BALL_BEARINGS) as IsoBallBearingDesignation[];
}

export function isoBallBearingSizes(designation: IsoBallBearingDesignation, unit: `${Base.unitOfLengthEnum}`): BallBearingSizes {
    const row = BALL_BEARINGS[designation] as BallBearingSizes | undefined;
    if (row === undefined) {
        throw new InputError(`\`designation\` is not one of ${isoBallBearingDesignations().join(", ")}.`, "designation");
    }
    return lengthsConverted({ ...row }, BEARING_LENGTHS, "mm", unit);
}
