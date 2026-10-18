import * as Inputs from "../../../inputs";
import type * as Resolved from "../../../resolved-inputs";
import { resolveDto } from "../../../kernel-calls";
import { involuteSplineSizes } from "../../../shafts/shafts";
import type { InvoluteSplineSizes } from "../../../shafts/shaft-types";

/**
 * The sizes of DIN 5480 involute splines, in millimetres, with no CAD kernel needed.
 * `occt.parts.mechanical.machining` builds a splined shaft and cuts the hub to fit it.
 * @beta
 */
export class EngineeringSplines {

    /**
     * Works out a DIN 5480 involute spline from its reference diameter and module: its teeth and
     * profile shift, and the tip and root diameters of the shaft and the hub.
     *
     * Example: 25 by 1.25 -> 18 teeth, shaft tips 24.75 across, hub tips 22.5
     * @param inputs - The reference diameter and the module
     * @returns The spline's sizes in millimetres
     * @group involute
     * @shortname involute spline sizes
     * @drawable false
     * @example
     * ```typescript
     * const spline = bitbybit.engineering.mechanical.splines.involuteSplineSizes({ referenceDiameter: 25, module: 1.25 });
     * ```
     */
    involuteSplineSizes(inputs: Inputs.Engineering.InvoluteSplineSizesDto): InvoluteSplineSizes {
        const resolved = resolveDto(Inputs.Engineering.InvoluteSplineSizesDto, inputs) as Resolved.Engineering.InvoluteSplineSizesDto;
        return involuteSplineSizes(resolved.referenceDiameter, resolved.module);
    }
}
