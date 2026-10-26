import * as Inputs from "../../../inputs";
import type * as Resolved from "../../../resolved-inputs";
import { resolveDto } from "../../../kernel-calls";
import { ansiClearanceHoleDiameter, ansiHexBoltSizes, ansiHexNutSizes, ansiSetScrewSizes, ansiSocketHeadCapScrewSizes, ansiWasherSizes } from "../../../fasteners/ansi-fasteners";
import { HEX_BOLT_LENGTHS, HEX_NUT_LENGTHS, SCREW_HEAD_LENGTHS, SET_SCREW_LENGTHS, WASHER_LENGTHS } from "../../../fasteners/iso-fasteners.constants";
import type { HexBoltSizes, HexNutSizes, SetScrewSizes, SocketHeadCapScrewSizes, WasherSizes } from "../../../fasteners/fastener-types";
import { checkedUnitOfLength, lengthsConverted, snappedLength, tableLength } from "../../helpers/geometry/lengths";

/**
 * The sizes of ASME inch fasteners from #0 to 1 inch, with no CAD kernel needed: clearance holes
 * (B18.2.8), cap screws with a hexagon recess and set screws (B18.3), hex cap screws (B18.2.1), hex nuts (B18.2.2
 * and B18.6.3) and plain washers (B18.22.1), in the unit asked for. `occt.parts.mechanical.fasteners.ansi`
 * builds them as solids.
 * @beta
 */
export class EngineeringFastenersAnsi {

    /**
     * Gives the diameter of an ASME B18.2.8 clearance hole for a screw: close, normal or loose.
     *
     * Example: 1/4, normal -> 0.281 inches, a 9/32 drill
     * @param inputs - The size, the fit and the unit
     * @returns The hole's diameter in `unit`
     * @group holes
     * @shortname ansi clearance hole
     * @drawable false
     * @example
     * ```typescript
     * const hole = bitbybit.engineering.mechanical.fasteners.ansi.clearanceHole({ size: Bit.Inputs.Engineering.ansiThreadSizeEnum.in1_4, fit: Bit.Inputs.Engineering.clearanceFitEnum.normal });
     * ```
     */
    clearanceHole(inputs: Inputs.Engineering.AnsiClearanceHoleDto): number {
        const resolved = resolveDto(Inputs.Engineering.AnsiClearanceHoleDto, inputs) as Resolved.Engineering.AnsiClearanceHoleDto;
        return snappedLength(ansiClearanceHoleDiameter(resolved.size, resolved.fit), "in", checkedUnitOfLength(resolved.unit, "unit"));
    }

    /**
     * Gives the head of an ASME B18.3 cap screw: its diameter and height, its hexagon recess, the
     * threaded length and the counterbore that sinks it.
     *
     * The counterbore is as deep as the head is high, so the head sits flush. Example: 1/4 -> head
     * 0.375 across and 0.25 high, a 3/16 recess, counterbore 7/16 across
     * @param inputs - The size and the unit
     * @returns The head's sizes in `unit`
     * @group screws
     * @shortname ansi cap screw sizes
     * @drawable false
     * @example
     * ```typescript
     * const head = bitbybit.engineering.mechanical.fasteners.ansi.socketHeadCapScrewSizes({ size: Bit.Inputs.Engineering.ansiThreadSizeEnum.n10 });
     * ```
     */
    socketHeadCapScrewSizes(inputs: Inputs.Engineering.AnsiSizeDto): SocketHeadCapScrewSizes {
        const resolved = resolveDto(Inputs.Engineering.AnsiSizeDto, inputs) as Resolved.Engineering.AnsiSizeDto;
        return lengthsConverted(ansiSocketHeadCapScrewSizes(resolved.size), SCREW_HEAD_LENGTHS, "in", checkedUnitOfLength(resolved.unit, "unit"));
    }

    /**
     * Gives an ASME B18.2.1 hex cap screw's width across flats, head height and threaded length.
     *
     * A screw up to 6 inches long is threaded twice its diameter and a quarter of an inch, a longer
     * one half an inch more. Example: 1/4, 1 inch long -> 7/16 across flats, 0.75 threaded
     * @param inputs - The size, the length and the unit
     * @returns The screw's sizes in `unit`
     * @group screws
     * @shortname ansi hex bolt sizes
     * @drawable false
     * @example
     * ```typescript
     * const bolt = bitbybit.engineering.mechanical.fasteners.ansi.hexBoltSizes({ size: Bit.Inputs.Engineering.ansiThreadSizeEnum.in3_8, length: 1.5 });
     * ```
     */
    hexBoltSizes(inputs: Inputs.Engineering.AnsiHexBoltSizesDto): HexBoltSizes {
        const resolved = resolveDto(Inputs.Engineering.AnsiHexBoltSizesDto, inputs) as Resolved.Engineering.AnsiHexBoltSizesDto;
        const unit = checkedUnitOfLength(resolved.unit, "unit");
        return lengthsConverted(ansiHexBoltSizes(resolved.size, tableLength(resolved.length, unit, "in")), HEX_BOLT_LENGTHS, "in", unit);
    }

    /**
     * Gives an ASME hex nut: a B18.6.3 machine screw nut from #0 to #12, a B18.2.2 hex nut from 1/4
     * up, as its width across flats and its height.
     *
     * Example: 1/4 -> 7/16 across flats, 7/32 high
     * @param inputs - The size and the unit
     * @returns The nut's sizes in `unit`
     * @group nuts and washers
     * @shortname ansi hex nut sizes
     * @drawable false
     * @example
     * ```typescript
     * const nut = bitbybit.engineering.mechanical.fasteners.ansi.hexNutSizes({ size: Bit.Inputs.Engineering.ansiThreadSizeEnum.in1_4 });
     * ```
     */
    hexNutSizes(inputs: Inputs.Engineering.AnsiSizeDto): HexNutSizes {
        const resolved = resolveDto(Inputs.Engineering.AnsiSizeDto, inputs) as Resolved.Engineering.AnsiSizeDto;
        return lengthsConverted(ansiHexNutSizes(resolved.size), HEX_NUT_LENGTHS, "in", checkedUnitOfLength(resolved.unit, "unit"));
    }

    /**
     * Gives an ASME B18.22.1 type A plain washer, narrow or wide: its inner and outer diameters and
     * its thickness.
     *
     * The table starts at #6, which takes one washer in both series. Example: 1/4 narrow -> 0.281
     * inside, 0.625 outside, 0.065 thick
     * @param inputs - The size, the series and the unit
     * @returns The washer's sizes in `unit`
     * @group nuts and washers
     * @shortname ansi washer sizes
     * @drawable false
     * @example
     * ```typescript
     * const washer = bitbybit.engineering.mechanical.fasteners.ansi.washerSizes({ size: Bit.Inputs.Engineering.ansiThreadSizeEnum.in1_4, series: Bit.Inputs.Engineering.ansiWasherSeriesEnum.wide });
     * ```
     */
    washerSizes(inputs: Inputs.Engineering.AnsiWasherSizesDto): WasherSizes {
        const resolved = resolveDto(Inputs.Engineering.AnsiWasherSizesDto, inputs) as Resolved.Engineering.AnsiWasherSizesDto;
        return lengthsConverted(ansiWasherSizes(resolved.size, resolved.series), WASHER_LENGTHS, "in", checkedUnitOfLength(resolved.unit, "unit"));
    }

    /**
     * Gives an ASME B18.3 set screw by its size and point: its hexagon recess's size and least depth,
     * and the point's diameter, length, angle and, for an oval point, radius.
     *
     * A screw shorter than its point's shortest long screw takes the shallower recess makers give it,
     * and a short cone is blunter, 118 degrees.
     * @param inputs - The size, the point, the thread series, the length and the unit
     * @returns The sizes in `unit` and the point's angle in degrees
     * @group screws
     * @shortname ansi set screw sizes
     * @drawable false
     * @example
     * ```typescript
     * const grub = bitbybit.engineering.mechanical.fasteners.ansi.setScrewSizes({ size: Bit.Inputs.Engineering.ansiThreadSizeEnum.in1_4, point: Bit.Inputs.Engineering.ansiSetScrewPointEnum.halfDog, length: 0.5 });
     * ```
     */
    setScrewSizes(inputs: Inputs.Engineering.AnsiSetScrewSizesDto): SetScrewSizes {
        const resolved = resolveDto(Inputs.Engineering.AnsiSetScrewSizesDto, inputs) as Resolved.Engineering.AnsiSetScrewSizesDto;
        const unit = checkedUnitOfLength(resolved.unit, "unit");
        const length = resolved.length === undefined ? undefined : tableLength(resolved.length, unit, "in");
        return lengthsConverted(ansiSetScrewSizes(resolved.size, resolved.point, resolved.series, length), SET_SCREW_LENGTHS, "in", unit);
    }
}
