import * as Inputs from "../../../inputs";
import type * as Resolved from "../../../resolved-inputs";
import { resolveDto } from "../../../kernel-calls";
import { dinInvoluteSplineSizes } from "../../../splines/din-splines";
import type { InvoluteSplineSizes } from "../../../splines/spline-types";
import { checkedUnitOfLength } from "../../helpers/geometry/lengths";

/**
 * The sizes of DIN 5480 involute splines, with no CAD kernel needed, in the unit asked for.
 * `occt.parts.mechanical.machining.din` builds a splined shaft and cuts the hub to fit it.
 * @beta
 */
export class EngineeringSplinesDin {

    /**
     * Works out a DIN 5480 involute spline from its reference diameter and module: its teeth,
     * profile shift, and the shaft's and the hub's tip and root diameters.
     *
     * Both inputs are in millimetres, as the standard names them; the sizes come back in `unit`.
     * Example: 25 by 1.25 -> 18 teeth, shaft tips 24.75 across, hub tips 22.5
     * @param inputs - The reference diameter, the module and the unit
     * @returns The spline's sizes in `unit`
     * @group involute
     * @shortname din involute spline sizes
     * @drawable false
     * @example
     * ```typescript
     * const spline = bitbybit.engineering.mechanical.splines.din.involuteSplineSizes({ referenceDiameter: 25, module: 1.25 });
     * ```
     */
    involuteSplineSizes(inputs: Inputs.Engineering.DinInvoluteSplineSizesDto): InvoluteSplineSizes {
        const resolved = resolveDto(Inputs.Engineering.DinInvoluteSplineSizesDto, inputs) as Resolved.Engineering.DinInvoluteSplineSizesDto;
        return dinInvoluteSplineSizes(resolved.referenceDiameter, resolved.module, checkedUnitOfLength(resolved.unit, "unit"));
    }
}
