import type { TopoDS_Shape } from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { resolveDto } from "@bitbybit-dev/base";
import * as Inputs from "../../../api/inputs";
import type * as Models from "../../../api/models";
import type * as Resolved from "../../../api/resolved-inputs";
import { checkedFlag, checkedWithin } from "../../base/input-checks";
import type { FastenerShapes } from "./fastener-shapes";

/**
 * ASME inch fasteners made from their sizes, in the unit asked for: cap screws and set
 * screws (B18.3), hex cap screws (B18.2.1), hex nuts (B18.2.2, and machine screw nuts to #12 after
 * B18.6.3) and type A plain washers (B18.22.1). Threads are cosmetic, a face of their own named
 * `thread`, unless a cap screw or hex cap screw models them; each part has a twin that names its faces.
 */
export class OCCTFastenersAnsi {

    constructor(private readonly shapes: FastenerShapes) { }

    /**
     * Makes an ASME B18.3 cap screw: a round head with a hexagon recess for a key, and a shank
     * threaded from the tip for the length the standard gives, or to the head on a shorter screw.
     *
     * The head sits on the frame's origin and rises along its normal; the shank runs the other way.
     * `modelledThread` models the thread.
     * @param inputs - The size, the series, the length under the head, whether the thread is modelled, the unit and the frame
     * @returns A new solid
     * @group fasteners
     * @shortname ansi socket head cap screw
     * @drawable true
     * @example
     * ```typescript
     * const screw = await bitbybit.occt.parts.mechanical.fasteners.ansi.socketHeadCapScrew({ size: Bit.Inputs.Engineering.ansiThreadSizeEnum.in1_4, length: 1 });
     * ```
     */
    socketHeadCapScrew(inputs: Inputs.OCCT.AnsiSocketHeadCapScrewDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.AnsiSocketHeadCapScrewDto, inputs) as Resolved.OCCT.AnsiSocketHeadCapScrewDto;
        return this.socketScrew(resolved).shape;
    }

    /**
     * Makes a cap screw as `socketHeadCapScrew` does and names the role each face plays.
     *
     * The roles `head`, `recess`, `seat` (under the head), `shank`, `thread` and `end` (the tip) list
     * face indexes as `shapes.face.getFaces` numbers them; a screw threaded to its head has no
     * `shank`. The `seat` frame is the input frame.
     * @param inputs - The size, the series, the length under the head, whether the thread is modelled, the unit and the frame
     * @returns The screw, the faces each role names and its seat
     * @group fasteners
     * @shortname ansi socket head cap screw with roles
     * @drawable false
     * @example
     * ```typescript
     * const { shape, roles } = await bitbybit.occt.parts.mechanical.fasteners.ansi.socketHeadCapScrewWithRoles({ size: Bit.Inputs.Engineering.ansiThreadSizeEnum.n10, length: 0.75 });
     * ```
     */
    socketHeadCapScrewWithRoles(inputs: Inputs.OCCT.AnsiSocketHeadCapScrewDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.AnsiSocketHeadCapScrewDto, inputs) as Resolved.OCCT.AnsiSocketHeadCapScrewDto;
        return this.socketScrew(resolved);
    }

    /**
     * Makes an ASME B18.2.1 hex cap screw with chamfered top corners, threaded for the length the
     * standard gives, or to the head when `fullyThreaded` is true.
     *
     * The head sits on the frame's origin and rises along its normal, a flat facing the frame's
     * direction; the shank runs the other way. `modelledThread` cuts the thread.
     * @param inputs - The size, the series, the length under the head, how far it is threaded, whether the thread is modelled, the unit and the frame
     * @returns A new solid
     * @group fasteners
     * @shortname ansi hex bolt
     * @drawable true
     * @example
     * ```typescript
     * const bolt = await bitbybit.occt.parts.mechanical.fasteners.ansi.hexBolt({ size: Bit.Inputs.Engineering.ansiThreadSizeEnum.in3_8, length: 1.5, modelledThread: true });
     * ```
     */
    hexBolt(inputs: Inputs.OCCT.AnsiHexBoltDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.AnsiHexBoltDto, inputs) as Resolved.OCCT.AnsiHexBoltDto;
        return this.bolt(resolved).shape;
    }

    /**
     * Makes a hex cap screw as `hexBolt` does and names the role each face plays.
     *
     * The roles `head`, `seat` (under the head), `shank`, `thread` and `end` (the tip) list face
     * indexes as `shapes.face.getFaces` numbers them; a screw threaded to its head has no `shank`. The
     * `seat` frame is the input frame.
     * @param inputs - The size, the series, the length under the head, how far it is threaded, the unit and the frame
     * @returns The screw, the faces each role names and its seat
     * @group fasteners
     * @shortname ansi hex bolt with roles
     * @drawable false
     * @example
     * ```typescript
     * const { shape, roles } = await bitbybit.occt.parts.mechanical.fasteners.ansi.hexBoltWithRoles({ size: Bit.Inputs.Engineering.ansiThreadSizeEnum.in3_8, length: 1.5 });
     * ```
     */
    hexBoltWithRoles(inputs: Inputs.OCCT.AnsiHexBoltDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.AnsiHexBoltDto, inputs) as Resolved.OCCT.AnsiHexBoltDto;
        return this.bolt(resolved);
    }

    /**
     * Makes an ASME hex nut, a machine screw nut to #12 and a hex nut from 1/4, its corners chamfered
     * on both sides and its hole at the thread's nominal diameter.
     *
     * Its bearing face lies on the frame's origin and it rises along the normal, a flat facing the
     * frame's direction.
     * @param inputs - The size, the unit and the frame
     * @returns A new solid
     * @group fasteners
     * @shortname ansi hex nut
     * @drawable true
     * @example
     * ```typescript
     * const nut = await bitbybit.occt.parts.mechanical.fasteners.ansi.hexNut({ size: Bit.Inputs.Engineering.ansiThreadSizeEnum.in1_4 });
     * ```
     */
    hexNut(inputs: Inputs.OCCT.AnsiHexNutDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.AnsiHexNutDto, inputs) as Resolved.OCCT.AnsiHexNutDto;
        return this.nut(resolved).shape;
    }

    /**
     * Makes a hex nut as `hexNut` does and names the role each face plays.
     *
     * The roles `seat` (the bearing face), `top`, `side` and `thread` (the hole) list face indexes as
     * `shapes.face.getFaces` numbers them. The `seat` frame is the input frame.
     * @param inputs - The size, the unit and the frame
     * @returns The nut, the faces each role names and its seat
     * @group fasteners
     * @shortname ansi hex nut with roles
     * @drawable false
     * @example
     * ```typescript
     * const { shape, roles } = await bitbybit.occt.parts.mechanical.fasteners.ansi.hexNutWithRoles({ size: Bit.Inputs.Engineering.ansiThreadSizeEnum.in1_4 });
     * ```
     */
    hexNutWithRoles(inputs: Inputs.OCCT.AnsiHexNutDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.AnsiHexNutDto, inputs) as Resolved.OCCT.AnsiHexNutDto;
        return this.nut(resolved);
    }

    /**
     * Makes an ASME B18.22.1 type A plain washer, narrow or wide.
     *
     * Its bearing face lies on the frame's origin and it rises along the normal. The table starts at
     * #6.
     * @param inputs - The size of the screw it goes under, the series, the unit and the frame
     * @returns A new solid
     * @group fasteners
     * @shortname ansi washer
     * @drawable true
     * @example
     * ```typescript
     * const washer = await bitbybit.occt.parts.mechanical.fasteners.ansi.washer({ size: Bit.Inputs.Engineering.ansiThreadSizeEnum.in1_4, series: Bit.Inputs.Engineering.ansiWasherSeriesEnum.wide });
     * ```
     */
    washer(inputs: Inputs.OCCT.AnsiWasherDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.AnsiWasherDto, inputs) as Resolved.OCCT.AnsiWasherDto;
        return this.plainWasher(resolved).shape;
    }

    /**
     * Makes a plain washer as `washer` does and names the role each face plays.
     *
     * The roles `seat` (the bearing face), `top`, `bore` and `rim` list face indexes as
     * `shapes.face.getFaces` numbers them. The `seat` frame is the input frame.
     * @param inputs - The size of the screw it goes under, the series, the unit and the frame
     * @returns The washer, the faces each role names and its seat
     * @group fasteners
     * @shortname ansi washer with roles
     * @drawable false
     * @example
     * ```typescript
     * const { shape, roles } = await bitbybit.occt.parts.mechanical.fasteners.ansi.washerWithRoles({ size: Bit.Inputs.Engineering.ansiThreadSizeEnum.in1_4 });
     * ```
     */
    washerWithRoles(inputs: Inputs.OCCT.AnsiWasherDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.AnsiWasherDto, inputs) as Resolved.OCCT.AnsiWasherDto;
        return this.plainWasher(resolved);
    }

    /**
     * Makes an ASME B18.3 set screw with a hexagon recess, threaded its whole length, its point a
     * cup, flat, cone, oval or half dog, the recess as deep as the standard asks of its length.
     *
     * Its recessed end lies on the frame's origin and it runs against the normal.
     * @param inputs - The size, the series, the length, the point, the unit and the frame
     * @returns A new solid
     * @group fasteners
     * @shortname ansi set screw
     * @drawable true
     * @example
     * ```typescript
     * const grub = await bitbybit.occt.parts.mechanical.fasteners.ansi.setScrew({ size: Bit.Inputs.Engineering.ansiThreadSizeEnum.n10, length: 0.25, point: Bit.Inputs.Engineering.ansiSetScrewPointEnum.oval });
     * ```
     */
    setScrew(inputs: Inputs.OCCT.AnsiSetScrewDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.AnsiSetScrewDto, inputs) as Resolved.OCCT.AnsiSetScrewDto;
        return this.grub(resolved).shape;
    }

    /**
     * Makes a set screw as `setScrew` does and names the role each face plays.
     *
     * The roles `top` (the recessed end), `recess`, `thread` and `end` (the point) list face indexes as
     * `shapes.face.getFaces` numbers them. The `top` frame is the input frame.
     * @param inputs - The size, the series, the length, the point, the unit and the frame
     * @returns The set screw, the faces each role names and its top
     * @group fasteners
     * @shortname ansi set screw with roles
     * @drawable false
     * @example
     * ```typescript
     * const { shape, roles } = await bitbybit.occt.parts.mechanical.fasteners.ansi.setScrewWithRoles({ size: Bit.Inputs.Engineering.ansiThreadSizeEnum.n10, length: 0.25 });
     * ```
     */
    setScrewWithRoles(inputs: Inputs.OCCT.AnsiSetScrewDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.AnsiSetScrewDto, inputs) as Resolved.OCCT.AnsiSetScrewDto;
        return this.grub(resolved);
    }

    private socketScrew(resolved: Resolved.OCCT.AnsiSocketHeadCapScrewDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const { size, series, unit } = resolved;
        const modelled = checkedFlag(resolved.modelledThread, "modelledThread");
        const thread = this.shapes.build.base.engineering.mechanical.threads.ansi.thread({ size, series, unit });
        const head = this.shapes.build.base.engineering.mechanical.fasteners.ansi.socketHeadCapScrewSizes({ size, unit });
        return this.shapes.socketScrew(thread, head, resolved.length, modelled, unit, resolved.frame);
    }

    private bolt(resolved: Resolved.OCCT.AnsiHexBoltDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const { size, series, unit } = resolved;
        const modelled = checkedFlag(resolved.modelledThread, "modelledThread");
        const thread = this.shapes.build.base.engineering.mechanical.threads.ansi.thread({ size, series, unit });
        const length = checkedWithin(resolved.length, "length", { above: 0 });
        const sizes = this.shapes.build.base.engineering.mechanical.fasteners.ansi.hexBoltSizes({ size, length, unit });
        return this.shapes.bolt(thread, sizes, length, checkedFlag(resolved.fullyThreaded, "fullyThreaded"), modelled, unit, resolved.frame);
    }

    private nut(resolved: Resolved.OCCT.AnsiHexNutDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const { size, unit } = resolved;
        const thread = this.shapes.build.base.engineering.mechanical.threads.ansi.thread({ size, series: Inputs.Engineering.ansiThreadSeriesEnum.unf, unit });
        return this.shapes.nut(thread, this.shapes.build.base.engineering.mechanical.fasteners.ansi.hexNutSizes({ size, unit }), resolved.frame);
    }

    private plainWasher(resolved: Resolved.OCCT.AnsiWasherDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const { size, series, unit } = resolved;
        return this.shapes.washer(this.shapes.build.base.engineering.mechanical.fasteners.ansi.washerSizes({ size, series, unit }), 0, 0, resolved.frame);
    }

    private grub(resolved: Resolved.OCCT.AnsiSetScrewDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const { size, series, unit, point } = resolved;
        const thread = this.shapes.build.base.engineering.mechanical.threads.ansi.thread({ size, series, unit });
        const length = checkedWithin(resolved.length, "length", { above: 0 });
        const sizes = this.shapes.build.base.engineering.mechanical.fasteners.ansi.setScrewSizes({ size, point, series, length, unit });
        return this.shapes.setScrew(thread, sizes, point === Inputs.Engineering.ansiSetScrewPointEnum.halfDog ? "dog" : point, length, thread.designation, resolved.frame);
    }
}
