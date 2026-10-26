import { InputError } from "../kernel-calls/errors";
import { lengthsConverted } from "../services/helpers/geometry/lengths";
import type { Base } from "../inputs/base-inputs";
import type { AnsiBallBearingDesignation, BallBearingSizes } from "./bearing-types";
import { ANSI_BALL_BEARINGS } from "./ansi-bearings.constants";
import { BEARING_LENGTHS } from "./bearings.constants";

export function ansiBallBearingDesignations(): AnsiBallBearingDesignation[] {
    return Object.keys(ANSI_BALL_BEARINGS) as AnsiBallBearingDesignation[];
}

export function ansiBallBearingSizes(designation: AnsiBallBearingDesignation, shields: boolean, unit: `${Base.unitOfLengthEnum}`): BallBearingSizes {
    const row = ANSI_BALL_BEARINGS[designation] as (typeof ANSI_BALL_BEARINGS)[AnsiBallBearingDesignation] | undefined;
    if (row === undefined) {
        throw new InputError(`\`designation\` is not one of ${ansiBallBearingDesignations().join(", ")}.`, "designation");
    }
    return lengthsConverted({ bore: row.bore, outside: row.outside, width: shields ? row.shieldedWidth : row.width }, BEARING_LENGTHS, "in", unit);
}
