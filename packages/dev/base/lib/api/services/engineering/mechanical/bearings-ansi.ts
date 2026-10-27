import * as Inputs from "../../../inputs";
import type * as Resolved from "../../../resolved-inputs";
import { resolveDto } from "../../../kernel-calls";
import { ansiBallBearingDesignations, ansiBallBearingSizes } from "../../../bearings/ansi-bearings";
import type { AnsiBallBearingDesignation, BallBearingSizes } from "../../../bearings/bearing-types";
import { checkedUnitOfLength } from "../../helpers/geometry/lengths";

/**
 * The sizes of inch deep groove ball bearings of the R-series, from the miniature R1-4 to R20, with
 * no CAD kernel needed, in the unit asked for. `occt.parts.mechanical.bearings.ansi` builds them as
 * solids.
 * @beta
 */
export class EngineeringBearingsAnsi {

    /**
     * Gives an R-series ball bearing by its designation: its bore, its outside diameter and its width,
     * open or shielded.
     *
     * Several sizes are wider shielded than open. Example: R8 -> 1/2 bore, 1-1/8 outside, 1/4 wide
     * open, 5/16 shielded
     * @param inputs - The designation, whether it is shielded and the unit
     * @returns The bearing's sizes in `unit`
     * @group ball bearings
     * @shortname ansi ball bearing sizes
     * @drawable false
     * @example
     * ```typescript
     * const bearing = bitbybit.engineering.mechanical.bearings.ansi.ballBearingSizes({ designation: Bit.Inputs.Engineering.ansiBallBearingEnum.r8 });
     * const housingBore = bearing.outside;
     * ```
     */
    ballBearingSizes(inputs: Inputs.Engineering.AnsiBallBearingSizesDto): BallBearingSizes {
        const resolved = resolveDto(Inputs.Engineering.AnsiBallBearingSizesDto, inputs) as Resolved.Engineering.AnsiBallBearingSizesDto;
        return ansiBallBearingSizes(resolved.designation, resolved.shields === true, checkedUnitOfLength(resolved.unit, "unit"));
    }

    /**
     * Lists the designations of the R-series ball bearings the tables hold.
     * @returns The designations, the miniature series first
     * @group ball bearings
     * @shortname ansi ball bearing designations
     * @drawable false
     * @example
     * ```typescript
     * const designations = bitbybit.engineering.mechanical.bearings.ansi.designations();
     * ```
     */
    designations(): AnsiBallBearingDesignation[] {
        return ansiBallBearingDesignations();
    }
}
