import * as Inputs from "../../../inputs";
import type * as Resolved from "../../../resolved-inputs";
import { resolveDto } from "../../../kernel-calls";
import { ansiInvoluteSplineSizes } from "../../../splines/ansi-splines";
import type { InvoluteSplineSizes } from "../../../splines/spline-types";
import { checkedUnitOfLength } from "../../helpers/geometry/lengths";

/**
 * The sizes of ANSI B92.1 involute splines, 30 degree flat root side fit, with no CAD kernel needed,
 * in the unit asked for. `occt.parts.mechanical.machining.ansi` builds a splined shaft and cuts the
 * hub to fit it.
 * @beta
 */
export class EngineeringSplinesAnsi {

    /**
     * Works out an ANSI B92.1 involute spline from its teeth and pitch: its pitch diameter and module,
     * and the major and minor diameters of the shaft and the hub.
     *
     * The teeth are unshifted, the pitch diameter the teeth over the pitch. Example: 24 teeth of 16/32
     * -> 1.5 pitch diameter, shaft 1.5625 across its tips, hub 1.4375 across its own
     * @param inputs - The teeth, the pitch and the unit
     * @returns The spline's sizes in `unit`
     * @group involute
     * @shortname ansi involute spline sizes
     * @drawable false
     * @example
     * ```typescript
     * const spline = bitbybit.engineering.mechanical.splines.ansi.involuteSplineSizes({ teeth: 24, pitch: Bit.Inputs.Engineering.ansiSplinePitchEnum.p16_32 });
     * ```
     */
    involuteSplineSizes(inputs: Inputs.Engineering.AnsiInvoluteSplineSizesDto): InvoluteSplineSizes {
        const resolved = resolveDto(Inputs.Engineering.AnsiInvoluteSplineSizesDto, inputs) as Resolved.Engineering.AnsiInvoluteSplineSizesDto;
        return ansiInvoluteSplineSizes(resolved.teeth, resolved.pitch, checkedUnitOfLength(resolved.unit, "unit"));
    }
}
