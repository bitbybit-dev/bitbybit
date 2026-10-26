import * as Inputs from "../../../inputs";
import type * as Resolved from "../../../resolved-inputs";
import { resolveDto } from "../../../kernel-calls";
import { isoThread, isoThreadSizes } from "../../../threads/iso-threads";
import { THREAD_LENGTHS } from "../../../threads/thread-profile.constants";
import type { IsoThreadSize, IsoThreadSizes } from "../../../threads/thread-types";
import { checkedUnitOfLength, lengthsConverted } from "../../helpers/geometry/lengths";

/**
 * The sizes of ISO metric screw threads from M1.6 to M24, with no CAD kernel needed: diameters,
 * pitches and tap drills, coarse or fine, in the unit asked for. The fasteners of
 * `occt.parts.mechanical.fasteners.iso` carry them.
 * @beta
 */
export class EngineeringThreadsIso {

    /**
     * Gives an ISO metric thread by its size: the nominal, pitch and minor diameters, the pitch,
     * the internal thread's minor diameter and the drill for tapping it.
     *
     * The coarse pitch unless `pitch` gives a fine one, in millimetres as ISO names it; the sizes come
     * back in `unit`. Example: M8 -> pitch 1.25, tap drill 6.8
     * @param inputs - The size, an optional fine pitch and the unit
     * @returns The thread's diameters and pitch in `unit`
     * @group threads
     * @shortname iso thread
     * @drawable false
     * @example
     * ```typescript
     * const thread = bitbybit.engineering.mechanical.threads.iso.thread({ size: Bit.Inputs.Engineering.isoThreadSizeEnum.m8 });
     * const drill = thread.tapDrill;
     * ```
     */
    thread(inputs: Inputs.Engineering.IsoThreadDto): IsoThreadSizes {
        const resolved = resolveDto(Inputs.Engineering.IsoThreadDto, inputs) as Resolved.Engineering.IsoThreadDto;
        return lengthsConverted(isoThread(resolved.size, resolved.pitch), THREAD_LENGTHS, "mm", checkedUnitOfLength(resolved.unit, "unit"));
    }

    /**
     * Lists the ISO metric thread sizes the tables hold, from M1.6 to M24.
     * @returns The sizes, smallest first
     * @group threads
     * @shortname iso thread sizes
     * @drawable false
     * @example
     * ```typescript
     * const sizes = bitbybit.engineering.mechanical.threads.iso.sizes();
     * ```
     */
    sizes(): IsoThreadSize[] {
        return isoThreadSizes();
    }
}
