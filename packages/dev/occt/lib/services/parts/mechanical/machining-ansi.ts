import type { TopoDS_Shape } from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { resolveDto } from "@bitbybit-dev/base";
import type { InvoluteSplineSizes } from "@bitbybit-dev/base";
import * as Inputs from "../../../api/inputs";
import type * as Resolved from "../../../api/resolved-inputs";
import { checkedFlag, checkedShape, checkedWithin } from "../../base/input-checks";
import type { MachiningShapes } from "./machining-shapes";

/**
 * Machining on round shafts and bores sized from the inch tables, in the unit asked for: Unified
 * threads modelled on shanks and in holes, ANSI B17.1 keyseats milled into a shaft or cut through a
 * hub, the grooves inch tapered retaining rings sit in, ASME B94.6 knurls, and ANSI B92.1 involute
 * splines on a shaft and through a hub. Each comes as a tool for a design's boolean and as a method
 * that cuts it from a body.
 */
export class OCCTMachiningAnsi {

    constructor(private readonly shapes: MachiningShapes) { }

    /**
     * Makes the solid a Unified inch thread removes: the 60 degree groove swept along a right-hand
     * helix.
     *
     * It runs `length` from the frame's origin into the part, against the normal, stopping at the
     * origin's plane. Shanks sit to class 2A and holes to 2B: on frames whole pitches apart, the two
     * mesh with play.
     * @param inputs - The size, the series or pitch, the length, inside or out, the unit and the frame
     * @returns The tool as a solid
     * @group threads
     * @shortname ansi thread tool
     * @drawable true
     * @example
     * ```typescript
     * const cutter = await bitbybit.occt.parts.mechanical.machining.ansi.threadTool({ size: Bit.Inputs.Engineering.ansiThreadSizeEnum.n10, length: 0.5 });
     * ```
     */
    threadTool(inputs: Inputs.OCCT.AnsiThreadToolDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.AnsiThreadToolDto, inputs) as Resolved.OCCT.AnsiThreadToolDto;
        return this.toolOf(resolved);
    }

    /**
     * Models a Unified inch thread on a shank or in a hole, as `threadTool` places it, instead of the
     * cosmetic thread `parts.mechanical.fasteners.ansi` draws.
     *
     * Turn the shank to the nominal diameter, or drill the hole to the minor; a modelled thread is
     * heavy, so keep it to the parts that need it. Its defaults thread a 1/4-20 shank half an inch.
     * @param inputs - The body, the size, the series or pitch, the length, inside or out, the unit and the frame
     * @returns The threaded body
     * @group threads
     * @shortname ansi thread
     * @drawable true
     * @example
     * ```typescript
     * const rod = await bitbybit.occt.shapes.solid.createCylinder({ radius: 0.125, height: 1, center: [0, -1, 0], direction: [0, 1, 0] });
     * const threaded = await bitbybit.occt.parts.mechanical.machining.ansi.thread({ shape: rod, size: Bit.Inputs.Engineering.ansiThreadSizeEnum.in1_4, length: 0.75 });
     * ```
     */
    thread(inputs: Inputs.OCCT.AnsiThreadCutDto<TopoDS_Shape>): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.AnsiThreadCutDto, inputs) as Resolved.OCCT.AnsiThreadCutDto<TopoDS_Shape>;
        return this.shapes.cutFrom(checkedShape(resolved.shape), this.toolOf(resolved));
    }

    /**
     * Makes the solid an ANSI B17.1 keyseat removes: the round-ended pocket milled into a shaft, or
     * the straight keyseat cut through a hub's bore, sized for the diameter.
     *
     * It starts at the frame's origin on the axis, runs `length` along the normal and faces the
     * frame's direction.
     * @param inputs - The diameter, the length, shaft or hub, the unit and the frame
     * @returns The tool as a solid
     * @group keyways
     * @shortname ansi keyway tool
     * @drawable true
     * @example
     * ```typescript
     * const cutter = await bitbybit.occt.parts.mechanical.machining.ansi.keywayTool({ diameter: 1, length: 1.25 });
     * ```
     */
    keywayTool(inputs: Inputs.OCCT.AnsiKeywayToolDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.AnsiKeywayToolDto, inputs) as Resolved.OCCT.AnsiKeywayToolDto;
        return this.keywayCutter(resolved);
    }

    /**
     * Cuts an ANSI B17.1 keyseat into a shaft or through a hub, as `keywayTool` places it.
     *
     * The body given is kept; a new solid comes back.
     * @param inputs - The body, the diameter, the length, shaft or hub, the unit and the frame
     * @returns The body with the keyseat cut
     * @group keyways
     * @shortname ansi keyway
     * @drawable true
     * @example
     * ```typescript
     * const shaft = await bitbybit.occt.shapes.solid.createCylinder({ radius: 0.5, height: 2, center: [0, 0, 0], direction: [0, 1, 0] });
     * const keyed = await bitbybit.occt.parts.mechanical.machining.ansi.keyway({ shape: shaft, diameter: 1, length: 1.25, frame: { origin: [0, 0.25, 0], normal: [0, 1, 0], direction: [1, 0, 0] } });
     * ```
     */
    keyway(inputs: Inputs.OCCT.AnsiKeywayDto<TopoDS_Shape>): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.AnsiKeywayDto, inputs) as Resolved.OCCT.AnsiKeywayDto<TopoDS_Shape>;
        return this.shapes.cutFrom(checkedShape(resolved.shape), this.keywayCutter(resolved));
    }

    /**
     * Makes the solid the groove of an inch tapered retaining ring removes from a shaft or a bore: as
     * wide as the groove, down to its diameter.
     *
     * It starts at the frame's origin on the axis and runs the groove's width along the normal.
     * @param inputs - Shaft or bore, its diameter, the unit and the frame
     * @returns The tool as a solid
     * @group grooves
     * @shortname ansi ring groove tool
     * @drawable true
     * @example
     * ```typescript
     * const cutter = await bitbybit.occt.parts.mechanical.machining.ansi.ringGrooveTool({ kind: Bit.Inputs.Engineering.retainingRingKindEnum.shaft, diameter: 0.75 });
     * ```
     */
    ringGrooveTool(inputs: Inputs.OCCT.AnsiRingGrooveToolDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.AnsiRingGrooveToolDto, inputs) as Resolved.OCCT.AnsiRingGrooveToolDto;
        return this.grooveCutter(resolved);
    }

    /**
     * Cuts the groove of an inch tapered retaining ring into a shaft or a bore, as `ringGrooveTool`
     * places it; `parts.mechanical.retainingRings.ansi.retainingRing` at the same frame sits in it.
     *
     * The body given is kept; a new solid comes back.
     * @param inputs - The body, shaft or bore, its diameter, the unit and the frame
     * @returns The body with the groove cut
     * @group grooves
     * @shortname ansi ring groove
     * @drawable true
     * @example
     * ```typescript
     * const shaft = await bitbybit.occt.shapes.solid.createCylinder({ radius: 0.375, height: 2, center: [0, 0, 0], direction: [0, 1, 0] });
     * const grooved = await bitbybit.occt.parts.mechanical.machining.ansi.ringGroove({ shape: shaft, diameter: 0.75, frame: { origin: [0, 1.5, 0], normal: [0, 1, 0], direction: [1, 0, 0] } });
     * ```
     */
    ringGroove(inputs: Inputs.OCCT.AnsiRingGrooveDto<TopoDS_Shape>): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.AnsiRingGrooveDto, inputs) as Resolved.OCCT.AnsiRingGrooveDto<TopoDS_Shape>;
        return this.shapes.cutFrom(checkedShape(resolved.shape), this.grooveCutter(resolved));
    }

    /**
     * Makes the solid an ASME B94.6 knurl removes from a round shaft: diametral pitch teeth at the
     * standard's depth, straight, diagonal at 30 degrees or crossing in a raised diamond.
     *
     * Its crests sit on the diameter the pitch divides into whole teeth, nearest the one given; it
     * starts at the frame's origin and runs `length` along the normal.
     * @param inputs - The diameter, the length, the diametral pitch, the pattern, the unit and the frame
     * @returns The tool as a solid
     * @group knurls
     * @shortname ansi knurl tool
     * @drawable true
     * @example
     * ```typescript
     * const cutter = await bitbybit.occt.parts.mechanical.machining.ansi.knurlTool({ diameter: 0.5, length: 0.5, diametralPitch: 96, pattern: Bit.Inputs.Engineering.knurlPatternEnum.diamond });
     * ```
     */
    knurlTool(inputs: Inputs.OCCT.AnsiKnurlToolDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.AnsiKnurlToolDto, inputs) as Resolved.OCCT.AnsiKnurlToolDto;
        return this.knurlCutter(resolved);
    }

    /**
     * Knurls a round shaft, as `knurlTool` places the knurl.
     *
     * A diamond on a long knurl is heavy to build, its grooves crossing on every tooth. The body given
     * is kept; a new solid comes back.
     * @param inputs - The shaft, the diameter, the length, the diametral pitch, the pattern, the unit and the frame
     * @returns The knurled shaft
     * @group knurls
     * @shortname ansi knurl
     * @drawable true
     * @example
     * ```typescript
     * const knob = await bitbybit.occt.shapes.solid.createCylinder({ radius: 0.25, height: 0.625, center: [0, 0, 0], direction: [0, 1, 0] });
     * const knurled = await bitbybit.occt.parts.mechanical.machining.ansi.knurl({ shape: knob, diameter: 0.5, length: 0.5, diametralPitch: 96 });
     * ```
     */
    knurl(inputs: Inputs.OCCT.AnsiKnurlDto<TopoDS_Shape>): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.AnsiKnurlDto, inputs) as Resolved.OCCT.AnsiKnurlDto<TopoDS_Shape>;
        return this.shapes.cutFrom(checkedShape(resolved.shape), this.knurlCutter(resolved));
    }

    /**
     * Makes an ANSI B92.1 involute splined shaft: its teeth at 30 degrees with a flat root, sized from
     * the number of teeth and the pitch, `length` long.
     *
     * It starts at the frame's origin, runs along the normal, and a tooth points along the frame's
     * direction.
     * @param inputs - The teeth, the pitch, the length, the unit and the frame
     * @returns A new solid
     * @group splines
     * @shortname ansi splined shaft
     * @drawable true
     * @example
     * ```typescript
     * const shaft = await bitbybit.occt.parts.mechanical.machining.ansi.splinedShaft({ teeth: 24, pitch: Bit.Inputs.Engineering.ansiSplinePitchEnum.p16_32, length: 1 });
     * ```
     */
    splinedShaft(inputs: Inputs.OCCT.AnsiSplineDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.AnsiSplineDto, inputs) as Resolved.OCCT.AnsiSplineDto;
        return this.shapes.splineShaft(this.splineOf(resolved), resolved.length, resolved.frame);
    }

    /**
     * Makes the solid an ANSI B92.1 hub spline removes: the shaft's flanks, with the hub's tip and
     * root diameters, so the shaft of the same size slides into the cut.
     *
     * It starts at the frame's origin, runs `length` along the normal, and a gap faces the frame's
     * direction, where `splinedShaft` at the same frame has a tooth.
     * @param inputs - The teeth, the pitch, the length, the unit and the frame
     * @returns The tool as a solid
     * @group splines
     * @shortname ansi splined hub tool
     * @drawable true
     * @example
     * ```typescript
     * const cutter = await bitbybit.occt.parts.mechanical.machining.ansi.splinedHubTool({ teeth: 24, pitch: Bit.Inputs.Engineering.ansiSplinePitchEnum.p16_32, length: 0.5 });
     * ```
     */
    splinedHubTool(inputs: Inputs.OCCT.AnsiSplineDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.AnsiSplineDto, inputs) as Resolved.OCCT.AnsiSplineDto;
        return this.shapes.hubCutter(this.splineOf(resolved), resolved.length, resolved.frame);
    }

    /**
     * Cuts an ANSI B92.1 spline through a hub, as `splinedHubTool` places it.
     *
     * The body given is kept; a new solid comes back.
     * @param inputs - The hub, the teeth, the pitch, the length, the unit and the frame
     * @returns The hub with the spline cut
     * @group splines
     * @shortname ansi splined hub
     * @drawable true
     * @example
     * ```typescript
     * const blank = await bitbybit.occt.shapes.solid.createCylinder({ radius: 1, height: 0.5, center: [0, 0, 0], direction: [0, 1, 0] });
     * const hub = await bitbybit.occt.parts.mechanical.machining.ansi.splinedHub({ shape: blank, teeth: 24, pitch: Bit.Inputs.Engineering.ansiSplinePitchEnum.p16_32, length: 0.5 });
     * ```
     */
    splinedHub(inputs: Inputs.OCCT.AnsiSplinedHubDto<TopoDS_Shape>): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.AnsiSplinedHubDto, inputs) as Resolved.OCCT.AnsiSplinedHubDto<TopoDS_Shape>;
        return this.shapes.cutFrom(checkedShape(resolved.shape), this.shapes.hubCutter(this.splineOf(resolved), resolved.length, resolved.frame));
    }

    private toolOf(resolved: Resolved.OCCT.AnsiThreadToolDto): TopoDS_Shape {
        const thread = this.shapes.build.base.engineering.mechanical.threads.ansi.thread({ size: resolved.size, series: resolved.series, threadsPerInch: resolved.threadsPerInch, unit: resolved.unit });
        return this.shapes.threads.tool(thread, { length: resolved.length, internal: checkedFlag(resolved.internal, "internal"), unit: resolved.unit, frame: resolved.frame });
    }

    private keywayCutter(resolved: Resolved.OCCT.AnsiKeywayToolDto): TopoDS_Shape {
        const key = this.shapes.build.base.engineering.mechanical.keys.ansi.parallelKeySizes({ shaftDiameter: resolved.diameter, unit: resolved.unit });
        return this.shapes.keywayCutter(key, resolved.diameter, checkedWithin(resolved.length, "length", { above: 0 }), checkedFlag(resolved.inHub, "inHub"), resolved.frame);
    }

    private grooveCutter(resolved: Resolved.OCCT.AnsiRingGrooveToolDto): TopoDS_Shape {
        const sizes = this.shapes.build.base.engineering.mechanical.retainingRings.ansi.retainingRingSizes({ kind: resolved.kind, diameter: resolved.diameter, unit: resolved.unit });
        return this.shapes.grooveCutter(sizes, resolved.kind === Inputs.Engineering.retainingRingKindEnum.shaft, resolved.frame);
    }

    private knurlCutter(resolved: Resolved.OCCT.AnsiKnurlToolDto): TopoDS_Shape {
        const diameter = checkedWithin(resolved.diameter, "diameter", { above: 0 });
        const knurl = this.shapes.build.base.engineering.mechanical.knurls.ansi.knurlSizes({ diameter, diametralPitch: resolved.diametralPitch, pattern: resolved.pattern, unit: resolved.unit });
        return this.shapes.knurlCutter(knurl, diameter, checkedWithin(resolved.length, "length", { above: 0 }), resolved.pattern, resolved.frame);
    }

    private splineOf(resolved: Resolved.OCCT.AnsiSplineDto): InvoluteSplineSizes {
        return this.shapes.build.base.engineering.mechanical.splines.ansi.involuteSplineSizes({ teeth: resolved.teeth, pitch: resolved.pitch, unit: resolved.unit });
    }
}
