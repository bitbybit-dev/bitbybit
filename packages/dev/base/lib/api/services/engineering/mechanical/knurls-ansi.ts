import * as Inputs from "../../../inputs";
import type * as Resolved from "../../../resolved-inputs";
import { resolveDto } from "../../../kernel-calls";
import { ansiKnurlSizes } from "../../../knurls/ansi-knurls";
import type { KnurlSizes } from "../../../knurls/knurl-types";
import { checkedUnitOfLength } from "../../helpers/geometry/lengths";

/**
 * The grooves of ASME B94.6 diametral pitch knurls on a cylinder, with no CAD kernel needed, in the
 * unit asked for. `occt.parts.mechanical.machining.ansi` cuts them into a body.
 * @beta
 */
export class EngineeringKnurlsAnsi {

    /**
     * Works out a diametral pitch knurl's grooves on a cylinder: how many, the diameter they track on,
     * how deep B94.6 presses them and their angle to the axis.
     *
     * A blank needs 24 teeth round it at 64 and 96 DP, 18 at 128 and 15 at 160. Example: 0.5 at 96 DP
     * -> 48 grooves, 0.016 deep
     * @param inputs - The diameter, the diametral pitch, the pattern and the unit
     * @returns The grooves, the diameter that tracks and the depth in `unit`, and the helix angle
     * @group knurls
     * @shortname ansi knurl sizes
     * @drawable false
     * @example
     * ```typescript
     * const knurl = bitbybit.engineering.mechanical.knurls.ansi.knurlSizes({ diameter: 0.5, diametralPitch: 96, pattern: Bit.Inputs.Engineering.knurlPatternEnum.diamond });
     * ```
     */
    knurlSizes(inputs: Inputs.Engineering.AnsiKnurlSizesDto): KnurlSizes {
        const resolved = resolveDto(Inputs.Engineering.AnsiKnurlSizesDto, inputs) as Resolved.Engineering.AnsiKnurlSizesDto;
        return ansiKnurlSizes(resolved.diameter, resolved.diametralPitch, resolved.pattern, checkedUnitOfLength(resolved.unit, "unit"));
    }
}
