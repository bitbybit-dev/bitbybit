import * as Inputs from "../../../inputs";
import type * as Resolved from "../../../resolved-inputs";
import { resolveDto } from "../../../kernel-calls";
import { ansiRetainingRingDiameters, ansiRetainingRingSizes } from "../../../retaining-rings/ansi-retaining-rings";
import type { RetainingRingSizes } from "../../../retaining-rings/retaining-ring-types";
import { checkedUnitOfLength } from "../../helpers/geometry/lengths";

/**
 * The sizes of inch tapered retaining rings, external for shafts and internal for bores, with their
 * grooves, with no CAD kernel needed, in the unit asked for: the series interchangeable with MS16624
 * and MS16625. `occt.parts.mechanical.retainingRings.ansi` builds the rings as solids.
 * @beta
 */
export class EngineeringRetainingRingsAnsi {

    /**
     * Gives the inch ring for a shaft or a bore, with its groove: the ring's thickness, free diameter,
     * lugs and lug holes, and the groove's diameter, width and least distance from the end.
     *
     * A diameter within a thousandth of an inch of a listed one takes it. Example: a 3/4 shaft -> a
     * groove 0.704 across
     * @param inputs - Shaft or bore, its diameter and the unit
     * @returns The ring's and the groove's sizes in `unit`
     * @group circlips
     * @shortname ansi retaining ring sizes
     * @drawable false
     * @example
     * ```typescript
     * const clip = bitbybit.engineering.mechanical.retainingRings.ansi.retainingRingSizes({ kind: Bit.Inputs.Engineering.retainingRingKindEnum.shaft, diameter: 0.75 });
     * const groove = clip.grooveDiameter;
     * ```
     */
    retainingRingSizes(inputs: Inputs.Engineering.AnsiRetainingRingSizesDto): RetainingRingSizes {
        const resolved = resolveDto(Inputs.Engineering.AnsiRetainingRingSizesDto, inputs) as Resolved.Engineering.AnsiRetainingRingSizesDto;
        return ansiRetainingRingSizes(resolved.kind, resolved.diameter, checkedUnitOfLength(resolved.unit, "unit"));
    }

    /**
     * Lists the shaft or bore diameters the inch rings come for.
     *
     * Example: shaft -> 0.125, 0.156, 0.188 and on up to 2, in inches
     * @param inputs - Shaft or bore, and the unit
     * @returns The diameters in `unit`, smallest first
     * @group circlips
     * @shortname ansi retaining ring diameters
     * @drawable false
     * @example
     * ```typescript
     * const sizes = bitbybit.engineering.mechanical.retainingRings.ansi.diameters({ kind: Bit.Inputs.Engineering.retainingRingKindEnum.bore });
     * ```
     */
    diameters(inputs: Inputs.Engineering.AnsiRetainingRingDiametersDto): number[] {
        const resolved = resolveDto(Inputs.Engineering.AnsiRetainingRingDiametersDto, inputs) as Resolved.Engineering.AnsiRetainingRingDiametersDto;
        return ansiRetainingRingDiameters(resolved.kind, checkedUnitOfLength(resolved.unit, "unit"));
    }
}
