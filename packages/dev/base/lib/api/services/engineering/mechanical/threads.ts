import * as Inputs from "../../../inputs";
import type * as Resolved from "../../../resolved-inputs";
import { resolveDto } from "../../../kernel-calls";
import { metricThread } from "../../../fasteners/fasteners";
import type { MetricThread } from "../../../fasteners/fastener-types";

/**
 * The sizes of ISO metric screw threads from M1.6 to M24, in millimetres, with no CAD kernel needed:
 * diameters, pitches and tap drills, coarse or fine. `occt.parts.mechanical.machining` cuts them
 * into a body, and the fasteners of `occt.parts.mechanical.fasteners` carry them.
 * @beta
 */
export class EngineeringThreads {

    /**
     * Gives an ISO metric thread by its size: the nominal, pitch and minor diameters, the pitch,
     * the internal thread's minor diameter and the drill for tapping it.
     *
     * The coarse pitch unless `pitch` gives a fine one. Example: M8 -> pitch 1.25, tap drill 6.8
     * @param inputs - The size and an optional fine pitch
     * @returns The thread's diameters and pitch in millimetres
     * @group threads
     * @shortname metric thread
     * @drawable false
     * @example
     * ```typescript
     * const thread = bitbybit.engineering.mechanical.threads.metricThread({ size: Bit.Inputs.Engineering.metricSizeEnum.m8 });
     * const drill = thread.tapDrill;
     * ```
     */
    metricThread(inputs: Inputs.Engineering.MetricThreadDto): MetricThread {
        const resolved = resolveDto(Inputs.Engineering.MetricThreadDto, inputs) as Resolved.Engineering.MetricThreadDto;
        return metricThread(resolved.size, resolved.pitch);
    }
}
