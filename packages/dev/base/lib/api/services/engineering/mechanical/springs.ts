import * as Inputs from "../../../inputs";
import type * as Resolved from "../../../resolved-inputs";
import { resolveDto } from "../../../kernel-calls";
import { compressionSpringPath } from "../../../springs/springs";
import type { CompressionSpringPath } from "../../../springs/spring-types";

/**
 * Compression springs with closed and ground ends, with no CAD kernel needed: the path of the wire's
 * centre, its pitch and its solid length. `occt.parts.mechanical.springs` sweeps the wire into a solid.
 * @beta
 */
export class EngineeringSprings {

    /**
     * Works out the centre line of a compression spring's wire up +Z, with a closed coil at each
     * end, the active coils' pitch and the solid length, where every coil touches the next.
     *
     * The wire runs three quarters of a coil past 0 and `length`: sweep it along the points, then
     * cut it flat at both.
     * @param inputs - The wire, the coils and the length
     * @returns The centre line's points, the pitch and the solid length
     * @group compression
     * @shortname compression spring path
     * @drawable false
     * @example
     * ```typescript
     * const spring = bitbybit.engineering.mechanical.springs.compressionSpringPath({ wireDiameter: 0.2, diameter: 2, activeCoils: 6, length: 4 });
     * const wire = spring.points;
     * ```
     */
    compressionSpringPath(inputs: Inputs.Engineering.CompressionSpringPathDto): CompressionSpringPath {
        const resolved = resolveDto(Inputs.Engineering.CompressionSpringPathDto, inputs) as Resolved.Engineering.CompressionSpringPathDto;
        return compressionSpringPath(resolved);
    }
}
