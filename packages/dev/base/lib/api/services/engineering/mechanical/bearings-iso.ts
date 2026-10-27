import * as Inputs from "../../../inputs";
import type * as Resolved from "../../../resolved-inputs";
import { resolveDto } from "../../../kernel-calls";
import { isoBallBearingDesignations, isoBallBearingSizes } from "../../../bearings/iso-bearings";
import type { BallBearingSizes, IsoBallBearingDesignation } from "../../../bearings/bearing-types";
import { checkedUnitOfLength } from "../../helpers/geometry/lengths";

/**
 * The sizes of metric deep groove ball bearings, from the 60 and 62 series and the small 62x and 60x
 * sizes, with no CAD kernel needed, in the unit asked for. `occt.parts.mechanical.bearings.iso`
 * builds them as solids.
 * @beta
 */
export class EngineeringBearingsIso {

    /**
     * Gives a deep groove ball bearing by its designation: its bore, its outside diameter and its
     * width.
     *
     * Example: 608 -> 8 bore, 22 outside, 7 wide, in millimetres
     * @param inputs - The designation and the unit
     * @returns The bearing's sizes in `unit`
     * @group ball bearings
     * @shortname iso ball bearing sizes
     * @drawable false
     * @example
     * ```typescript
     * const bearing = bitbybit.engineering.mechanical.bearings.iso.ballBearingSizes({ designation: Bit.Inputs.Engineering.isoBallBearingEnum.b6204 });
     * const housingBore = bearing.outside;
     * ```
     */
    ballBearingSizes(inputs: Inputs.Engineering.IsoBallBearingSizesDto): BallBearingSizes {
        const resolved = resolveDto(Inputs.Engineering.IsoBallBearingSizesDto, inputs) as Resolved.Engineering.IsoBallBearingSizesDto;
        return isoBallBearingSizes(resolved.designation, checkedUnitOfLength(resolved.unit, "unit"));
    }

    /**
     * Lists the designations of the metric ball bearings the tables hold.
     * @returns The designations, small series first
     * @group ball bearings
     * @shortname iso ball bearing designations
     * @drawable false
     * @example
     * ```typescript
     * const designations = bitbybit.engineering.mechanical.bearings.iso.designations();
     * ```
     */
    designations(): IsoBallBearingDesignation[] {
        return isoBallBearingDesignations();
    }
}
