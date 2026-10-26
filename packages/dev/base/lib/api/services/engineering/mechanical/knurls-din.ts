import * as Inputs from "../../../inputs";
import type * as Resolved from "../../../resolved-inputs";
import { resolveDto } from "../../../kernel-calls";
import { dinKnurlSizes } from "../../../knurls/din-knurls";
import type { KnurlSizes } from "../../../knurls/knurl-types";
import { checkedUnitOfLength } from "../../helpers/geometry/lengths";

/**
 * The grooves of DIN 82 knurls on a cylinder, with no CAD kernel needed, in the unit asked for.
 * `occt.parts.mechanical.machining.din` cuts them into a body.
 * @beta
 */
export class EngineeringKnurlsDin {

    /**
     * Works out a knurl's grooves on a cylinder: how many fit at the pitch, the diameter that
     * makes them divide it evenly, their depth and their angle to the axis.
     *
     * Turn the cylinder to the corrected diameter before knurling; the pitch is in millimetres as
     * DIN 82 names it. Example: 19.6 at pitch 0.8 -> 77 grooves on 19.608
     * @param inputs - The diameter, the pitch, the pattern and the unit
     * @returns The grooves, the corrected diameter and the depth in `unit`, and the helix angle
     * @group knurls
     * @shortname din knurl sizes
     * @drawable false
     * @example
     * ```typescript
     * const knurl = bitbybit.engineering.mechanical.knurls.din.knurlSizes({ diameter: 19.6, pitch: 0.8, pattern: Bit.Inputs.Engineering.knurlPatternEnum.diamond });
     * ```
     */
    knurlSizes(inputs: Inputs.Engineering.DinKnurlSizesDto): KnurlSizes {
        const resolved = resolveDto(Inputs.Engineering.DinKnurlSizesDto, inputs) as Resolved.Engineering.DinKnurlSizesDto;
        return dinKnurlSizes(resolved.diameter, resolved.pitch, resolved.pattern, checkedUnitOfLength(resolved.unit, "unit"));
    }
}
