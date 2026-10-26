import * as Inputs from "../../../inputs";
import type * as Resolved from "../../../resolved-inputs";
import { resolveDto } from "../../../kernel-calls";
import { isoChamferedWasherSizes, isoClearanceHoleDiameter, isoHexBoltSizes, isoHexNutSizes, isoSetScrewSizes, isoSocketHeadCapScrewSizes, isoWasherSizes } from "../../../fasteners/iso-fasteners";
import { CHAMFERED_WASHER_LENGTHS, HEX_BOLT_LENGTHS, HEX_NUT_LENGTHS, SCREW_HEAD_LENGTHS, SET_SCREW_LENGTHS, WASHER_LENGTHS } from "../../../fasteners/iso-fasteners.constants";
import type { ChamferedWasherSizes, HexBoltSizes, HexNutSizes, SetScrewSizes, SocketHeadCapScrewSizes, WasherSizes } from "../../../fasteners/fastener-types";
import { checkedUnitOfLength, lengthsConverted, snappedLength, tableLength } from "../../helpers/geometry/lengths";

/**
 * The sizes of ISO metric fasteners from M1.6 to M24, with no CAD kernel needed: clearance holes,
 * cap screws, hexagon bolts and nuts, plain washers and set screws, in the unit asked for; their
 * threads are in `threads.iso`. `occt.parts.mechanical.fasteners.iso` builds them as solids.
 * @beta
 */
export class EngineeringFastenersIso {

    /**
     * Gives the diameter of an ISO 273 clearance hole for a screw: close, normal or loose.
     *
     * Example: M6, normal -> 6.6 millimetres
     * @param inputs - The size, the fit and the unit
     * @returns The hole's diameter in `unit`
     * @group holes
     * @shortname iso clearance hole
     * @drawable false
     * @example
     * ```typescript
     * const hole = bitbybit.engineering.mechanical.fasteners.iso.clearanceHole({ size: Bit.Inputs.Engineering.isoThreadSizeEnum.m6, fit: Bit.Inputs.Engineering.clearanceFitEnum.normal });
     * ```
     */
    clearanceHole(inputs: Inputs.Engineering.IsoClearanceHoleDto): number {
        const resolved = resolveDto(Inputs.Engineering.IsoClearanceHoleDto, inputs) as Resolved.Engineering.IsoClearanceHoleDto;
        return snappedLength(isoClearanceHoleDiameter(resolved.size, resolved.fit), "mm", checkedUnitOfLength(resolved.unit, "unit"));
    }

    /**
     * Gives the head of an ISO 4762 cap screw: its diameter and height, its hexagon recess, the
     * threaded length and the DIN 974-1 counterbore that sinks it.
     *
     * The counterbore is the head's height and half a millimetre deep. Example: M5 -> head 8.5
     * across and 5 high, a 4 mm recess, counterbore 10 across and 5.5 deep
     * @param inputs - The size and the unit
     * @returns The head's sizes in `unit`
     * @group screws
     * @shortname iso cap screw sizes
     * @drawable false
     * @example
     * ```typescript
     * const head = bitbybit.engineering.mechanical.fasteners.iso.socketHeadCapScrewSizes({ size: Bit.Inputs.Engineering.isoThreadSizeEnum.m5 });
     * ```
     */
    socketHeadCapScrewSizes(inputs: Inputs.Engineering.IsoSizeDto): SocketHeadCapScrewSizes {
        const resolved = resolveDto(Inputs.Engineering.IsoSizeDto, inputs) as Resolved.Engineering.IsoSizeDto;
        return lengthsConverted(isoSocketHeadCapScrewSizes(resolved.size), SCREW_HEAD_LENGTHS, "mm", checkedUnitOfLength(resolved.unit, "unit"));
    }

    /**
     * Gives the head of an ISO 4014 or 4017 hexagon bolt and how much of its length ISO 4014
     * threads: the width across flats, the head's height and the threaded length.
     *
     * `length` is in `unit`. Example: M8, 40 millimetres long -> 13 across flats, a 5.3 high head, 22
     * threaded
     * @param inputs - The size, the length and the unit
     * @returns The bolt's sizes in `unit`
     * @group screws
     * @shortname iso hex bolt sizes
     * @drawable false
     * @example
     * ```typescript
     * const bolt = bitbybit.engineering.mechanical.fasteners.iso.hexBoltSizes({ size: Bit.Inputs.Engineering.isoThreadSizeEnum.m8, length: 40 });
     * ```
     */
    hexBoltSizes(inputs: Inputs.Engineering.IsoHexBoltSizesDto): HexBoltSizes {
        const resolved = resolveDto(Inputs.Engineering.IsoHexBoltSizesDto, inputs) as Resolved.Engineering.IsoHexBoltSizesDto;
        const unit = checkedUnitOfLength(resolved.unit, "unit");
        return lengthsConverted(isoHexBoltSizes(resolved.size, tableLength(resolved.length, unit, "mm")), HEX_BOLT_LENGTHS, "mm", unit);
    }

    /**
     * Gives an ISO 4032 hexagon nut: its width across flats and its height.
     *
     * Example: M8 -> 13 across flats, 6.8 high, in millimetres
     * @param inputs - The size and the unit
     * @returns The nut's sizes in `unit`
     * @group nuts and washers
     * @shortname iso hex nut sizes
     * @drawable false
     * @example
     * ```typescript
     * const nut = bitbybit.engineering.mechanical.fasteners.iso.hexNutSizes({ size: Bit.Inputs.Engineering.isoThreadSizeEnum.m8 });
     * ```
     */
    hexNutSizes(inputs: Inputs.Engineering.IsoSizeDto): HexNutSizes {
        const resolved = resolveDto(Inputs.Engineering.IsoSizeDto, inputs) as Resolved.Engineering.IsoSizeDto;
        return lengthsConverted(isoHexNutSizes(resolved.size), HEX_NUT_LENGTHS, "mm", checkedUnitOfLength(resolved.unit, "unit"));
    }

    /**
     * Gives an ISO 7089 plain washer: its inner and outer diameters and its thickness.
     *
     * Example: M8 -> 8.4 inside, 16 outside, 1.6 thick, in millimetres
     * @param inputs - The size and the unit
     * @returns The washer's sizes in `unit`
     * @group nuts and washers
     * @shortname iso washer sizes
     * @drawable false
     * @example
     * ```typescript
     * const washer = bitbybit.engineering.mechanical.fasteners.iso.washerSizes({ size: Bit.Inputs.Engineering.isoThreadSizeEnum.m8 });
     * ```
     */
    washerSizes(inputs: Inputs.Engineering.IsoSizeDto): WasherSizes {
        const resolved = resolveDto(Inputs.Engineering.IsoSizeDto, inputs) as Resolved.Engineering.IsoSizeDto;
        return lengthsConverted(isoWasherSizes(resolved.size), WASHER_LENGTHS, "mm", checkedUnitOfLength(resolved.unit, "unit"));
    }

    /**
     * Gives a set screw with a hexagon recess by its size and point: the recess's size and least depth,
     * and the point's diameter, length and angle, as ISO 4026 to 4029 give them.
     *
     * A short screw gets a shallower recess, a short dog and a blunter cone. Example: M5 dog -> a
     * 2.5 mm recess and a 3.5 mm dog
     * @param inputs - The size, the point, the length and the unit
     * @returns The sizes in `unit` and the point's angle in degrees
     * @group screws
     * @shortname iso set screw sizes
     * @drawable false
     * @example
     * ```typescript
     * const grub = bitbybit.engineering.mechanical.fasteners.iso.setScrewSizes({ size: Bit.Inputs.Engineering.isoThreadSizeEnum.m5, point: Bit.Inputs.Engineering.isoSetScrewPointEnum.dog, length: 10 });
     * ```
     */
    setScrewSizes(inputs: Inputs.Engineering.IsoSetScrewSizesDto): SetScrewSizes {
        const resolved = resolveDto(Inputs.Engineering.IsoSetScrewSizesDto, inputs) as Resolved.Engineering.IsoSetScrewSizesDto;
        const unit = checkedUnitOfLength(resolved.unit, "unit");
        const length = resolved.length === undefined ? undefined : tableLength(resolved.length, unit, "mm");
        return lengthsConverted(isoSetScrewSizes(resolved.size, resolved.point, length), SET_SCREW_LENGTHS, "mm", unit);
    }

    /**
     * Gives an ISO 7090 washer, chamfered on the outside of one face: its inner and outer diameters,
     * its thickness and its chamfer's height and width.
     *
     * It shares the ISO 7089 washer's sizes and starts at M5. Example: M8 -> 8.4 inside, 16 outside,
     * 1.6 thick, in millimetres
     * @param inputs - The size and the unit
     * @returns The washer's sizes in `unit`
     * @group nuts and washers
     * @shortname iso chamfered washer sizes
     * @drawable false
     * @example
     * ```typescript
     * const washer = bitbybit.engineering.mechanical.fasteners.iso.chamferedWasherSizes({ size: Bit.Inputs.Engineering.isoThreadSizeEnum.m8 });
     * ```
     */
    chamferedWasherSizes(inputs: Inputs.Engineering.IsoSizeDto): ChamferedWasherSizes {
        const resolved = resolveDto(Inputs.Engineering.IsoSizeDto, inputs) as Resolved.Engineering.IsoSizeDto;
        return lengthsConverted(isoChamferedWasherSizes(resolved.size), CHAMFERED_WASHER_LENGTHS, "mm", checkedUnitOfLength(resolved.unit, "unit"));
    }
}
