import * as Inputs from "../../../inputs";
import type * as Resolved from "../../../resolved-inputs";
import { resolveDto } from "../../../kernel-calls";
import { chamferedWasherSizes, clearanceHoleDiameter, hexBoltSizes, hexNutSizes, setScrewSizes, socketHeadCapScrewSizes, washerSizes } from "../../../fasteners/fasteners";
import type { ChamferedWasherSizes, HexBoltSizes, HexNutSizes, SetScrewSizes, SocketHeadCapScrewSizes, WasherSizes } from "../../../fasteners/fastener-types";

/**
 * The sizes of ISO metric fasteners from M1.6 to M24, in millimetres, with no CAD kernel needed:
 * clearance holes, cap screws, hexagon bolts and nuts, plain washers and set screws; their threads
 * are in `threads`. `occt.parts.mechanical.fasteners` builds the same parts as solids.
 * @beta
 */
export class EngineeringFasteners {

    /**
     * Gives the diameter of an ISO 273 clearance hole for a screw: close, normal or loose.
     *
     * Example: M6, normal -> 6.6
     * @param inputs - The size and the fit
     * @returns The hole's diameter in millimetres
     * @group threads
     * @shortname clearance hole
     * @drawable false
     * @example
     * ```typescript
     * const hole = bitbybit.engineering.mechanical.fasteners.clearanceHole({ size: Bit.Inputs.Engineering.metricSizeEnum.m6, fit: Bit.Inputs.Engineering.clearanceFitEnum.normal });
     * ```
     */
    clearanceHole(inputs: Inputs.Engineering.ClearanceHoleDto): number {
        const resolved = resolveDto(Inputs.Engineering.ClearanceHoleDto, inputs) as Resolved.Engineering.ClearanceHoleDto;
        return clearanceHoleDiameter(resolved.size, resolved.fit);
    }

    /**
     * Gives the head of an ISO 4762 cap screw: its diameter and height, the size and depth of the
     * hexagon recess in it, the threaded length and the counterbore that sinks the head.
     *
     * Example: M5 -> head 8.5 across, 5 high, a 4 mm recess
     * @param inputs - The size
     * @returns The head's sizes in millimetres
     * @group screws
     * @shortname cap screw sizes
     * @drawable false
     * @example
     * ```typescript
     * const head = bitbybit.engineering.mechanical.fasteners.socketHeadCapScrewSizes({ size: Bit.Inputs.Engineering.metricSizeEnum.m5 });
     * ```
     */
    socketHeadCapScrewSizes(inputs: Inputs.Engineering.MetricSizeDto): SocketHeadCapScrewSizes {
        const resolved = resolveDto(Inputs.Engineering.MetricSizeDto, inputs) as Resolved.Engineering.MetricSizeDto;
        return socketHeadCapScrewSizes(resolved.size);
    }

    /**
     * Gives the head of an ISO 4014 or 4017 hexagon bolt and how much of its length ISO 4014
     * threads: the width across flats, the head's height and the threaded length.
     *
     * Example: M8, 40 long -> 13 across flats, a 5.3 high head, 22 threaded
     * @param inputs - The size and the length
     * @returns The bolt's sizes in millimetres
     * @group screws
     * @shortname hex bolt sizes
     * @drawable false
     * @example
     * ```typescript
     * const bolt = bitbybit.engineering.mechanical.fasteners.hexBoltSizes({ size: Bit.Inputs.Engineering.metricSizeEnum.m8, length: 40 });
     * ```
     */
    hexBoltSizes(inputs: Inputs.Engineering.HexBoltSizesDto): HexBoltSizes {
        const resolved = resolveDto(Inputs.Engineering.HexBoltSizesDto, inputs) as Resolved.Engineering.HexBoltSizesDto;
        return hexBoltSizes(resolved.size, resolved.length);
    }

    /**
     * Gives an ISO 4032 hexagon nut: its width across flats and its height.
     *
     * Example: M8 -> 13 across flats, 6.8 high
     * @param inputs - The size
     * @returns The nut's sizes in millimetres
     * @group nuts and washers
     * @shortname hex nut sizes
     * @drawable false
     * @example
     * ```typescript
     * const nut = bitbybit.engineering.mechanical.fasteners.hexNutSizes({ size: Bit.Inputs.Engineering.metricSizeEnum.m8 });
     * ```
     */
    hexNutSizes(inputs: Inputs.Engineering.MetricSizeDto): HexNutSizes {
        const resolved = resolveDto(Inputs.Engineering.MetricSizeDto, inputs) as Resolved.Engineering.MetricSizeDto;
        return hexNutSizes(resolved.size);
    }

    /**
     * Gives an ISO 7089 plain washer: its inner and outer diameters and its thickness.
     *
     * Example: M8 -> 8.4 inside, 16 outside, 1.6 thick
     * @param inputs - The size
     * @returns The washer's sizes in millimetres
     * @group nuts and washers
     * @shortname washer sizes
     * @drawable false
     * @example
     * ```typescript
     * const washer = bitbybit.engineering.mechanical.fasteners.washerSizes({ size: Bit.Inputs.Engineering.metricSizeEnum.m8 });
     * ```
     */
    washerSizes(inputs: Inputs.Engineering.MetricSizeDto): WasherSizes {
        const resolved = resolveDto(Inputs.Engineering.MetricSizeDto, inputs) as Resolved.Engineering.MetricSizeDto;
        return washerSizes(resolved.size);
    }

    /**
     * Gives a set screw with a hexagon recess by its size and point: the recess's size and least depth,
     * and the point's diameter, length and angle, as ISO 4026 to 4029 give them.
     *
     * A short screw gets a shallower recess, a short dog and a blunter cone. Example: M5 dog -> a
     * 2.5 mm recess and a 3.5 mm dog
     * @param inputs - The size, the point and the length
     * @returns The sizes in millimetres and the point's angle in degrees
     * @group screws
     * @shortname set screw sizes
     * @drawable false
     * @example
     * ```typescript
     * const grub = bitbybit.engineering.mechanical.fasteners.setScrewSizes({ size: Bit.Inputs.Engineering.metricSizeEnum.m5, point: Bit.Inputs.Engineering.setScrewPointEnum.dog, length: 10 });
     * ```
     */
    setScrewSizes(inputs: Inputs.Engineering.SetScrewSizesDto): SetScrewSizes {
        const resolved = resolveDto(Inputs.Engineering.SetScrewSizesDto, inputs) as Resolved.Engineering.SetScrewSizesDto;
        return setScrewSizes(resolved.size, resolved.point, resolved.length);
    }

    /**
     * Gives an ISO 7090 washer, chamfered on the outside of one face: its inner and outer diameters,
     * its thickness and its chamfer's height and width.
     *
     * It shares the ISO 7089 washer's sizes and starts at M5. Example: M8 -> 8.4 inside, 16 outside,
     * 1.6 thick
     * @param inputs - The size
     * @returns The washer's sizes in millimetres
     * @group nuts and washers
     * @shortname chamfered washer sizes
     * @drawable false
     * @example
     * ```typescript
     * const washer = bitbybit.engineering.mechanical.fasteners.chamferedWasherSizes({ size: Bit.Inputs.Engineering.metricSizeEnum.m8 });
     * ```
     */
    chamferedWasherSizes(inputs: Inputs.Engineering.MetricSizeDto): ChamferedWasherSizes {
        const resolved = resolveDto(Inputs.Engineering.MetricSizeDto, inputs) as Resolved.Engineering.MetricSizeDto;
        return chamferedWasherSizes(resolved.size);
    }
}
