import * as Inputs from "../../../inputs";
import type * as Resolved from "../../../resolved-inputs";
import { resolveDto } from "../../../kernel-calls";
import { ansiThread, ansiThreadSizes } from "../../../threads/ansi-threads";
import { THREAD_LENGTHS } from "../../../threads/thread-profile.constants";
import type { AnsiThreadSize, AnsiThreadSizes } from "../../../threads/thread-types";
import { checkedUnitOfLength, lengthsConverted } from "../../helpers/geometry/lengths";

/**
 * The sizes of Unified inch screw threads after ASME B1.1, from #0 to 1 inch, with no CAD kernel
 * needed: diameters, pitches and tap drills, coarse (UNC), fine (UNF) or of a pitch of their own, in
 * the unit asked for. The fasteners of `occt.parts.mechanical.fasteners.ansi` carry them.
 * @beta
 */
export class EngineeringThreadsAnsi {

    /**
     * Gives a Unified inch thread by its size and series: the nominal, pitch and minor diameters, the
     * pitch, the internal thread's minor diameter and the drill for tapping it.
     *
     * The minor diameter is the rounded UNR root's; `threadsPerInch` names a pitch of its own, a UN
     * thread. Example: 1/4 UNC -> 20 threads per inch, tap drill 0.201 inches
     * @param inputs - The size, the series, an optional pitch of its own and the unit
     * @returns The thread's diameters and pitch in `unit`
     * @group threads
     * @shortname ansi thread
     * @drawable false
     * @example
     * ```typescript
     * const thread = bitbybit.engineering.mechanical.threads.ansi.thread({ size: Bit.Inputs.Engineering.ansiThreadSizeEnum.in1_4, series: Bit.Inputs.Engineering.ansiThreadSeriesEnum.unc });
     * const drill = thread.tapDrill;
     * ```
     */
    thread(inputs: Inputs.Engineering.AnsiThreadDto): AnsiThreadSizes {
        const resolved = resolveDto(Inputs.Engineering.AnsiThreadDto, inputs) as Resolved.Engineering.AnsiThreadDto;
        return lengthsConverted(ansiThread(resolved.size, resolved.series, resolved.threadsPerInch), THREAD_LENGTHS, "in", checkedUnitOfLength(resolved.unit, "unit"));
    }

    /**
     * Lists the Unified inch thread sizes the tables hold, from #0 to 1 inch.
     * @returns The sizes, smallest first
     * @group threads
     * @shortname ansi thread sizes
     * @drawable false
     * @example
     * ```typescript
     * const sizes = bitbybit.engineering.mechanical.threads.ansi.sizes();
     * ```
     */
    sizes(): AnsiThreadSize[] {
        return ansiThreadSizes();
    }
}
