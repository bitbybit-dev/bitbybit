import * as Inputs from "../../../inputs";
import type * as Resolved from "../../../resolved-inputs";
import { resolveDto } from "../../../kernel-calls";
import { dinParallelKeySizes } from "../../../keys/din-keys";
import type { ParallelKeySizes } from "../../../keys/key-types";
import { checkedUnitOfLength } from "../../helpers/geometry/lengths";

/**
 * The sizes of DIN 6885 form A parallel keys and their keyways, with no CAD kernel needed, in the
 * unit asked for. `occt.parts.mechanical.keys.din` builds the keys as solids and
 * `occt.parts.mechanical.machining.din` cuts their keyways.
 * @beta
 */
export class EngineeringKeysDin {

    /**
     * Gives the DIN 6885 parallel key for a shaft: the key's width and height, and how deep its
     * keyway goes into the shaft and into the hub.
     *
     * Example: a 20 mm shaft -> a 6 by 6 key, 3.5 deep in the shaft, 2.8 in the hub
     * @param inputs - The shaft's diameter and the unit
     * @returns The key's and keyway's sizes in `unit`
     * @group parallel keys
     * @shortname din parallel key sizes
     * @drawable false
     * @example
     * ```typescript
     * const key = bitbybit.engineering.mechanical.keys.din.parallelKeySizes({ shaftDiameter: 20 });
     * ```
     */
    parallelKeySizes(inputs: Inputs.Engineering.DinParallelKeySizesDto): ParallelKeySizes {
        const resolved = resolveDto(Inputs.Engineering.DinParallelKeySizesDto, inputs) as Resolved.Engineering.DinParallelKeySizesDto;
        return dinParallelKeySizes(resolved.shaftDiameter, checkedUnitOfLength(resolved.unit, "unit"));
    }
}
