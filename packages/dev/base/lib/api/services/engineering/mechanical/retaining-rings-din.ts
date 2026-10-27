import * as Inputs from "../../../inputs";
import type * as Resolved from "../../../resolved-inputs";
import { resolveDto } from "../../../kernel-calls";
import { dinRetainingRingDiameters, dinRetainingRingSizes } from "../../../retaining-rings/din-retaining-rings";
import type { RetainingRingSizes } from "../../../retaining-rings/retaining-ring-types";
import { checkedUnitOfLength } from "../../helpers/geometry/lengths";

/**
 * The sizes of DIN 471 retaining rings for shafts and DIN 472 rings for bores, with their grooves,
 * with no CAD kernel needed, in the unit asked for. `occt.parts.mechanical.retainingRings.din`
 * builds the rings as solids.
 * @beta
 */
export class EngineeringRetainingRingsDin {

    /**
     * Gives the DIN 471 ring for a shaft or the DIN 472 ring for a bore, with its groove: the
     * ring's thickness, free diameter, lugs and lug holes, and the groove's diameter, width and
     * least distance from the end.
     *
     * Example: a 20 mm shaft -> a 1.2 thick ring in a groove 19 across and 1.3 wide
     * @param inputs - Shaft or bore, its diameter and the unit
     * @returns The ring's and the groove's sizes in `unit`
     * @group circlips
     * @shortname din retaining ring sizes
     * @drawable false
     * @example
     * ```typescript
     * const clip = bitbybit.engineering.mechanical.retainingRings.din.retainingRingSizes({ kind: Bit.Inputs.Engineering.retainingRingKindEnum.shaft, diameter: 20 });
     * const groove = clip.grooveDiameter;
     * ```
     */
    retainingRingSizes(inputs: Inputs.Engineering.DinRetainingRingSizesDto): RetainingRingSizes {
        const resolved = resolveDto(Inputs.Engineering.DinRetainingRingSizesDto, inputs) as Resolved.Engineering.DinRetainingRingSizesDto;
        return dinRetainingRingSizes(resolved.kind, resolved.diameter, checkedUnitOfLength(resolved.unit, "unit"));
    }

    /**
     * Lists the shaft or bore diameters DIN 471 or DIN 472 gives a ring for.
     *
     * Example: shaft -> 3, 4, 5 and on up to 100, in millimetres
     * @param inputs - Shaft or bore, and the unit
     * @returns The diameters in `unit`, smallest first
     * @group circlips
     * @shortname din retaining ring diameters
     * @drawable false
     * @example
     * ```typescript
     * const sizes = bitbybit.engineering.mechanical.retainingRings.din.diameters({ kind: Bit.Inputs.Engineering.retainingRingKindEnum.bore });
     * ```
     */
    diameters(inputs: Inputs.Engineering.DinRetainingRingDiametersDto): number[] {
        const resolved = resolveDto(Inputs.Engineering.DinRetainingRingDiametersDto, inputs) as Resolved.Engineering.DinRetainingRingDiametersDto;
        return dinRetainingRingDiameters(resolved.kind, checkedUnitOfLength(resolved.unit, "unit"));
    }
}
