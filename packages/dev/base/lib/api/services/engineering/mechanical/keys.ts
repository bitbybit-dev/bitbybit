import * as Inputs from "../../../inputs";
import type * as Resolved from "../../../resolved-inputs";
import { resolveDto } from "../../../kernel-calls";
import { parallelKeySizes } from "../../../machine-elements/machine-elements";
import type { ParallelKeySizes } from "../../../machine-elements/machine-element-types";

/**
 * The sizes of DIN 6885 form A parallel keys and their keyways, in millimetres, with no CAD kernel
 * needed. `occt.parts.mechanical.keys` builds the keys as solids.
 * @beta
 */
export class EngineeringKeys {

    /**
     * Gives the DIN 6885 parallel key for a shaft: the key's width and height, and how deep its
     * keyway goes into the shaft and into the hub.
     *
     * Example: a 20 mm shaft -> a 6 by 6 key, 3.5 deep in the shaft, 2.8 in the hub
     * @param inputs - The shaft's diameter
     * @returns The key's and keyway's sizes in millimetres
     * @group parallel keys
     * @shortname parallel key sizes
     * @drawable false
     * @example
     * ```typescript
     * const key = bitbybit.engineering.mechanical.keys.parallelKeySizes({ shaftDiameter: 20 });
     * ```
     */
    parallelKeySizes(inputs: Inputs.Engineering.ParallelKeySizesDto): ParallelKeySizes {
        const resolved = resolveDto(Inputs.Engineering.ParallelKeySizesDto, inputs) as Resolved.Engineering.ParallelKeySizesDto;
        return parallelKeySizes(resolved.shaftDiameter);
    }
}
