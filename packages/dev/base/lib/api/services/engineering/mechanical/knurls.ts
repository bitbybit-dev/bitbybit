import * as Inputs from "../../../inputs";
import type * as Resolved from "../../../resolved-inputs";
import { resolveDto } from "../../../kernel-calls";
import { knurlSizes } from "../../../shafts/shafts";
import type { KnurlSizes } from "../../../shafts/shaft-types";

/**
 * The grooves of DIN 82 knurls on a cylinder, in millimetres, with no CAD kernel needed.
 * `occt.parts.mechanical.machining` cuts them into a body.
 * @beta
 */
export class EngineeringKnurls {

    /**
     * Works out a knurl's grooves on a cylinder: how many fit at the pitch, the diameter that
     * makes them divide it evenly, their depth and their angle to the axis.
     *
     * Turn the cylinder to the corrected diameter before knurling. Example: 19.6 at pitch 0.8 -> 77
     * grooves on 19.608
     * @param inputs - The diameter, the pitch and the pattern
     * @returns The grooves, the corrected diameter, the depth and the helix angle
     * @group knurls
     * @shortname knurl sizes
     * @drawable false
     * @example
     * ```typescript
     * const knurl = bitbybit.engineering.mechanical.knurls.knurlSizes({ diameter: 19.6, pitch: 0.8, pattern: Bit.Inputs.Engineering.knurlPatternEnum.diamond });
     * ```
     */
    knurlSizes(inputs: Inputs.Engineering.KnurlSizesDto): KnurlSizes {
        const resolved = resolveDto(Inputs.Engineering.KnurlSizesDto, inputs) as Resolved.Engineering.KnurlSizesDto;
        return knurlSizes(resolved.diameter, resolved.pitch, resolved.pattern);
    }
}
