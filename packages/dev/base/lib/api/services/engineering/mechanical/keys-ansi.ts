import * as Inputs from "../../../inputs";
import type * as Resolved from "../../../resolved-inputs";
import { resolveDto } from "../../../kernel-calls";
import { ansiParallelKeySizes } from "../../../keys/ansi-keys";
import type { ParallelKeySizes } from "../../../keys/key-types";
import { checkedUnitOfLength } from "../../helpers/geometry/lengths";

/**
 * The sizes of ANSI B17.1 square parallel keys and their keyseats, with no CAD kernel needed, in the
 * unit asked for. `occt.parts.mechanical.keys.ansi` builds the keys as solids and
 * `occt.parts.mechanical.machining.ansi` cuts their keyseats.
 * @beta
 */
export class EngineeringKeysAnsi {

    /**
     * Gives the ANSI B17.1 square key for a shaft: the key's width and height, and how deep its
     * keyseat goes into the shaft and into the hub.
     *
     * Each keyseat holds half the key, the hub's five thousandths deeper for clearance. Example: a 1
     * inch shaft -> a 1/4 square key, 1/8 deep in the shaft
     * @param inputs - The shaft's diameter and the unit
     * @returns The key's and keyseat's sizes in `unit`
     * @group parallel keys
     * @shortname ansi parallel key sizes
     * @drawable false
     * @example
     * ```typescript
     * const key = bitbybit.engineering.mechanical.keys.ansi.parallelKeySizes({ shaftDiameter: 1 });
     * ```
     */
    parallelKeySizes(inputs: Inputs.Engineering.AnsiParallelKeySizesDto): ParallelKeySizes {
        const resolved = resolveDto(Inputs.Engineering.AnsiParallelKeySizesDto, inputs) as Resolved.Engineering.AnsiParallelKeySizesDto;
        return ansiParallelKeySizes(resolved.shaftDiameter, checkedUnitOfLength(resolved.unit, "unit"));
    }
}
