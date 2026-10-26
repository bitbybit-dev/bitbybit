import type { TopoDS_Shape } from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { resolveDto } from "@bitbybit-dev/base";
import * as Inputs from "../../../api/inputs";
import type * as Models from "../../../api/models";
import type * as Resolved from "../../../api/resolved-inputs";
import { checkedFlag, checkedWithin } from "../../base/input-checks";
import type { FastenerShapes } from "./fastener-shapes";

/**
 * ISO metric fasteners made from their ISO sizes, in the unit asked for: cap screws with a hexagon
 * recess in a round head (ISO 4762), hexagon bolts (ISO 4017 and 4014), nuts (ISO 4032), plain washers
 * (ISO 7089 and 7090) and set screws (ISO 4026 to 4029). Threads are cosmetic, a face of their own
 * named `thread`, unless a cap screw or bolt models them; each part has a twin that names its faces.
 */
export class OCCTFastenersIso {

    constructor(private readonly shapes: FastenerShapes) { }


    /**
     * Makes an ISO 4762 cap screw: a round head with a hexagon recess for a key, and a shank threaded
     * from the tip for the length the standard gives, or to the head on a shorter screw.
     *
     * The head sits on the frame's origin and rises along its normal; the shank runs the other way.
     * `modelledThread` models the thread.
     * @param inputs - The size, the length under the head, whether the thread is modelled, the unit and the frame
     * @returns A new solid
     * @group fasteners
     * @shortname iso socket head cap screw
     * @drawable true
     * @example
     * ```typescript
     * const screw = await bitbybit.occt.parts.mechanical.fasteners.iso.socketHeadCapScrew({ size: Bit.Inputs.Engineering.isoThreadSizeEnum.m5, length: 20 });
     * ```
     */
    socketHeadCapScrew(inputs: Inputs.OCCT.IsoSocketHeadCapScrewDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.IsoSocketHeadCapScrewDto, inputs) as Resolved.OCCT.IsoSocketHeadCapScrewDto;
        return this.socketScrew(resolved).shape;
    }

    /**
     * Makes a cap screw as `socketHeadCapScrew` does and names the role each face plays.
     *
     * The roles `head`, `recess`, `seat` (under the head), `shank`, `thread` and `end` (the tip) list
     * face indexes as `shapes.face.getFaces` numbers them; a screw threaded to its head has no
     * `shank`. The `seat` frame is the input frame.
     * @param inputs - The size, the length under the head, whether the thread is modelled, the unit and the frame
     * @returns The screw, the faces each role names and its seat
     * @group fasteners
     * @shortname iso socket head cap screw with roles
     * @drawable false
     * @example
     * ```typescript
     * const { shape, roles, frames } = await bitbybit.occt.parts.mechanical.fasteners.iso.socketHeadCapScrewWithRoles({ size: Bit.Inputs.Engineering.isoThreadSizeEnum.m5, length: 20 });
     * ```
     */
    socketHeadCapScrewWithRoles(inputs: Inputs.OCCT.IsoSocketHeadCapScrewDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.IsoSocketHeadCapScrewDto, inputs) as Resolved.OCCT.IsoSocketHeadCapScrewDto;
        return this.socketScrew(resolved);
    }

    /**
     * Makes a hexagon head bolt with chamfered top corners: threaded to the head after ISO 4017, or
     * after ISO 4014 only for the length the standard gives when `fullyThreaded` is false.
     *
     * The head sits on the frame's origin and rises along its normal, a flat facing the frame's
     * direction; the shank runs the other way. `modelledThread` cuts the thread.
     * @param inputs - The size, the length under the head, how far it is threaded, whether the thread is modelled, the unit and the frame
     * @returns A new solid
     * @group fasteners
     * @shortname iso hex bolt
     * @drawable true
     * @example
     * ```typescript
     * const bolt = await bitbybit.occt.parts.mechanical.fasteners.iso.hexBolt({ size: Bit.Inputs.Engineering.isoThreadSizeEnum.m8, length: 40, fullyThreaded: false, modelledThread: true });
     * ```
     */
    hexBolt(inputs: Inputs.OCCT.IsoHexBoltDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.IsoHexBoltDto, inputs) as Resolved.OCCT.IsoHexBoltDto;
        return this.bolt(resolved).shape;
    }

    /**
     * Makes a hexagon head bolt as `hexBolt` does and names the role each face plays.
     *
     * The roles `head`, `seat` (under the head), `shank`, `thread` and `end` (the tip) list face
     * indexes as `shapes.face.getFaces` numbers them; a bolt threaded to its head has no `shank`. The
     * `seat` frame is the input frame.
     * @param inputs - The size, the length under the head, how far it is threaded, the unit and the frame
     * @returns The bolt, the faces each role names and its seat
     * @group fasteners
     * @shortname iso hex bolt with roles
     * @drawable false
     * @example
     * ```typescript
     * const { shape, roles } = await bitbybit.occt.parts.mechanical.fasteners.iso.hexBoltWithRoles({ size: Bit.Inputs.Engineering.isoThreadSizeEnum.m8, length: 40 });
     * ```
     */
    hexBoltWithRoles(inputs: Inputs.OCCT.IsoHexBoltDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.IsoHexBoltDto, inputs) as Resolved.OCCT.IsoHexBoltDto;
        return this.bolt(resolved);
    }

    /**
     * Makes an ISO 4032 hexagon nut, its corners chamfered on both sides and its hole at the thread's
     * nominal diameter, so a screw of its size passes through without overlapping it.
     *
     * Its bearing face lies on the frame's origin and it rises along the normal, a flat facing the
     * frame's direction.
     * @param inputs - The size, the unit and the frame
     * @returns A new solid
     * @group fasteners
     * @shortname iso hex nut
     * @drawable true
     * @example
     * ```typescript
     * const nut = await bitbybit.occt.parts.mechanical.fasteners.iso.hexNut({ size: Bit.Inputs.Engineering.isoThreadSizeEnum.m8 });
     * ```
     */
    hexNut(inputs: Inputs.OCCT.IsoHexNutDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.IsoHexNutDto, inputs) as Resolved.OCCT.IsoHexNutDto;
        return this.nut(resolved).shape;
    }

    /**
     * Makes a hexagon nut as `hexNut` does and names the role each face plays.
     *
     * The roles `seat` (the bearing face), `top`, `side` and `thread` (the hole) list face indexes as
     * `shapes.face.getFaces` numbers them. The `seat` frame is the input frame.
     * @param inputs - The size, the unit and the frame
     * @returns The nut, the faces each role names and its seat
     * @group fasteners
     * @shortname iso hex nut with roles
     * @drawable false
     * @example
     * ```typescript
     * const { shape, roles } = await bitbybit.occt.parts.mechanical.fasteners.iso.hexNutWithRoles({ size: Bit.Inputs.Engineering.isoThreadSizeEnum.m8 });
     * ```
     */
    hexNutWithRoles(inputs: Inputs.OCCT.IsoHexNutDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.IsoHexNutDto, inputs) as Resolved.OCCT.IsoHexNutDto;
        return this.nut(resolved);
    }

    /**
     * Makes a plain washer: flat after ISO 7089, or after ISO 7090 with its outside chamfered on the
     * face away from the seat.
     *
     * Its bearing face lies on the frame's origin and it rises along the normal.
     * @param inputs - The size of the screw it goes under, whether it is chamfered, the unit and the frame
     * @returns A new solid
     * @group fasteners
     * @shortname iso washer
     * @drawable true
     * @example
     * ```typescript
     * const washer = await bitbybit.occt.parts.mechanical.fasteners.iso.washer({ size: Bit.Inputs.Engineering.isoThreadSizeEnum.m8 });
     * ```
     */
    washer(inputs: Inputs.OCCT.IsoWasherDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.IsoWasherDto, inputs) as Resolved.OCCT.IsoWasherDto;
        return this.plainWasher(resolved).shape;
    }

    /**
     * Makes a plain washer as `washer` does and names the role each face plays.
     *
     * The roles `seat` (the bearing face), `top`, `bore` and `rim` (the chamfer too) list face
     * indexes as `shapes.face.getFaces` numbers them. The `seat` frame is the input frame.
     * @param inputs - The size of the screw it goes under, whether it is chamfered, the unit and the frame
     * @returns The washer, the faces each role names and its seat
     * @group fasteners
     * @shortname iso washer with roles
     * @drawable false
     * @example
     * ```typescript
     * const { shape, roles } = await bitbybit.occt.parts.mechanical.fasteners.iso.washerWithRoles({ size: Bit.Inputs.Engineering.isoThreadSizeEnum.m8 });
     * ```
     */
    washerWithRoles(inputs: Inputs.OCCT.IsoWasherDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.IsoWasherDto, inputs) as Resolved.OCCT.IsoWasherDto;
        return this.plainWasher(resolved);
    }

    /**
     * Makes a set screw with a hexagon recess, threaded its whole length, its point flat, cone, dog
     * or cup as ISO 4026 to 4029 give them, the recess as deep as they ask of its length.
     *
     * Its recessed end lies on the frame's origin and it runs against the normal.
     * @param inputs - The size, the length, the point, the unit and the frame
     * @returns A new solid
     * @group fasteners
     * @shortname iso set screw
     * @drawable true
     * @example
     * ```typescript
     * const grub = await bitbybit.occt.parts.mechanical.fasteners.iso.setScrew({ size: Bit.Inputs.Engineering.isoThreadSizeEnum.m4, length: 6, point: Bit.Inputs.Engineering.isoSetScrewPointEnum.cone });
     * ```
     */
    setScrew(inputs: Inputs.OCCT.IsoSetScrewDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.IsoSetScrewDto, inputs) as Resolved.OCCT.IsoSetScrewDto;
        return this.grub(resolved).shape;
    }

    /**
     * Makes a set screw as `setScrew` does and names the role each face plays.
     *
     * The roles `top` (the recessed end), `recess`, `thread` and `end` (the point) list face indexes as
     * `shapes.face.getFaces` numbers them. The `top` frame is the input frame.
     * @param inputs - The size, the length, the point, the unit and the frame
     * @returns The set screw, the faces each role names and its top
     * @group fasteners
     * @shortname iso set screw with roles
     * @drawable false
     * @example
     * ```typescript
     * const { shape, roles } = await bitbybit.occt.parts.mechanical.fasteners.iso.setScrewWithRoles({ size: Bit.Inputs.Engineering.isoThreadSizeEnum.m4, length: 6 });
     * ```
     */
    setScrewWithRoles(inputs: Inputs.OCCT.IsoSetScrewDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.IsoSetScrewDto, inputs) as Resolved.OCCT.IsoSetScrewDto;
        return this.grub(resolved);
    }

    private socketScrew(resolved: Resolved.OCCT.IsoSocketHeadCapScrewDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const { size, unit } = resolved;
        const modelled = checkedFlag(resolved.modelledThread, "modelledThread");
        const thread = this.shapes.build.base.engineering.mechanical.threads.iso.thread({ size, unit });
        const head = this.shapes.build.base.engineering.mechanical.fasteners.iso.socketHeadCapScrewSizes({ size, unit });
        return this.shapes.socketScrew(thread, head, resolved.length, modelled, unit, resolved.frame);
    }

    private bolt(resolved: Resolved.OCCT.IsoHexBoltDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const { size, unit } = resolved;
        const modelled = checkedFlag(resolved.modelledThread, "modelledThread");
        const thread = this.shapes.build.base.engineering.mechanical.threads.iso.thread({ size, unit });
        const length = checkedWithin(resolved.length, "length", { above: 0 });
        const sizes = this.shapes.build.base.engineering.mechanical.fasteners.iso.hexBoltSizes({ size, length, unit });
        return this.shapes.bolt(thread, sizes, length, checkedFlag(resolved.fullyThreaded, "fullyThreaded"), modelled, unit, resolved.frame);
    }

    private nut(resolved: Resolved.OCCT.IsoHexNutDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const { size, unit } = resolved;
        const thread = this.shapes.build.base.engineering.mechanical.threads.iso.thread({ size, unit });
        return this.shapes.nut(thread, this.shapes.build.base.engineering.mechanical.fasteners.iso.hexNutSizes({ size, unit }), resolved.frame);
    }

    private plainWasher(resolved: Resolved.OCCT.IsoWasherDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const { size, unit } = resolved;
        const fasteners = this.shapes.build.base.engineering.mechanical.fasteners.iso;
        if (checkedFlag(resolved.chamfered, "chamfered")) {
            const chamfered = fasteners.chamferedWasherSizes({ size, unit });
            return this.shapes.washer(chamfered, chamfered.chamferHeight, chamfered.chamferWidth, resolved.frame);
        }
        return this.shapes.washer(fasteners.washerSizes({ size, unit }), 0, 0, resolved.frame);
    }

    private grub(resolved: Resolved.OCCT.IsoSetScrewDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const { size, unit, point } = resolved;
        const thread = this.shapes.build.base.engineering.mechanical.threads.iso.thread({ size, unit });
        const length = checkedWithin(resolved.length, "length", { above: 0 });
        const sizes = this.shapes.build.base.engineering.mechanical.fasteners.iso.setScrewSizes({ size, point, length, unit });
        return this.shapes.setScrew(thread, sizes, point, length, thread.designation, resolved.frame);
    }
}
