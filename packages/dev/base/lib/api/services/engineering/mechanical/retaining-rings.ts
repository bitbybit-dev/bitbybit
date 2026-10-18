import * as Inputs from "../../../inputs";
import type * as Resolved from "../../../resolved-inputs";
import { resolveDto } from "../../../kernel-calls";
import { retainingRingSizes } from "../../../machine-elements/machine-elements";
import type { RetainingRingSizes } from "../../../machine-elements/machine-element-types";

/**
 * The sizes of DIN 471 retaining rings for shafts and DIN 472 rings for bores, with their grooves,
 * in millimetres, with no CAD kernel needed. `occt.parts.mechanical.retainingRings` builds the rings as solids.
 * @beta
 */
export class EngineeringRetainingRings {

    /**
     * Gives the DIN 471 ring for a shaft or the DIN 472 ring for a bore, with its groove: the
     * ring's thickness, free diameter, lugs and lug holes, and the groove's diameter, width and
     * least distance from the end.
     *
     * Example: a 20 mm shaft -> a 1.2 thick ring in a groove 19 across and 1.3 wide
     * @param inputs - Shaft or bore, and its diameter
     * @returns The ring's and the groove's sizes in millimetres
     * @group circlips
     * @shortname retaining ring sizes
     * @drawable false
     * @example
     * ```typescript
     * const clip = bitbybit.engineering.mechanical.retainingRings.retainingRingSizes({ kind: Bit.Inputs.Engineering.retainingRingKindEnum.shaft, diameter: 20 });
     * const groove = clip.grooveDiameter;
     * ```
     */
    retainingRingSizes(inputs: Inputs.Engineering.RetainingRingSizesDto): RetainingRingSizes {
        const resolved = resolveDto(Inputs.Engineering.RetainingRingSizesDto, inputs) as Resolved.Engineering.RetainingRingSizesDto;
        return retainingRingSizes(resolved.kind, resolved.diameter);
    }
}
