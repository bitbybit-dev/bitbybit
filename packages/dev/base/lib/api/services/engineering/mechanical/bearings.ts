import * as Inputs from "../../../inputs";
import type * as Resolved from "../../../resolved-inputs";
import { resolveDto } from "../../../kernel-calls";
import { ballBearingSizes } from "../../../machine-elements/machine-elements";
import type { BallBearingSizes } from "../../../machine-elements/machine-element-types";

/**
 * The sizes of deep groove ball bearings, from the 60 and 62 series and the small 62x and 60x sizes,
 * in millimetres, with no CAD kernel needed. `occt.parts.mechanical.bearings` builds them as solids.
 * @beta
 */
export class EngineeringBearings {

    /**
     * Gives a deep groove ball bearing by its designation: its bore, its outside diameter and its
     * width.
     *
     * Example: 608 -> 8 bore, 22 outside, 7 wide
     * @param inputs - The designation
     * @returns The bearing's sizes in millimetres
     * @group ball bearings
     * @shortname ball bearing sizes
     * @drawable false
     * @example
     * ```typescript
     * const bearing = bitbybit.engineering.mechanical.bearings.ballBearingSizes({ designation: Bit.Inputs.Engineering.ballBearingEnum.b6204 });
     * const housingBore = bearing.outside;
     * ```
     */
    ballBearingSizes(inputs: Inputs.Engineering.BallBearingSizesDto): BallBearingSizes {
        const resolved = resolveDto(Inputs.Engineering.BallBearingSizesDto, inputs) as Resolved.Engineering.BallBearingSizesDto;
        return ballBearingSizes(resolved.designation);
    }
}
