import type { TopoDS_Shape } from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { resolveDto } from "@bitbybit-dev/base";
import type { InvoluteSplineSizes } from "@bitbybit-dev/base";
import * as Inputs from "../../../api/inputs";
import type * as Resolved from "../../../api/resolved-inputs";
import { checkedFlag, checkedShape, checkedWithin } from "../../base/input-checks";
import type { MachiningShapes } from "./machining-shapes";

/**
 * Machining on round shafts and bores sized from the metric DIN tables, in the unit asked for: DIN
 * 6885 keyways milled into a shaft or cut through a hub, the grooves DIN 471 and DIN 472 retaining
 * rings sit in, DIN 82 knurls, and DIN 5480 involute splines on a shaft and through a hub. Each comes
 * as a tool for a design's boolean and as a method that cuts it from a body.
 */
export class OCCTMachiningDin {

    constructor(private readonly shapes: MachiningShapes) { }

    /**
     * Makes the solid a DIN 6885 keyway removes: the round-ended pocket milled into a shaft, or the
     * straight keyway cut through a hub's bore, sized for the diameter.
     *
     * It starts at the frame's origin on the axis, runs `length` along the normal and faces the
     * frame's direction.
     * @param inputs - The diameter, the length, shaft or hub, the unit and the frame
     * @returns The tool as a solid
     * @group keyways
     * @shortname din keyway tool
     * @drawable true
     * @example
     * ```typescript
     * const cutter = await bitbybit.occt.parts.mechanical.machining.din.keywayTool({ diameter: 20, length: 25 });
     * ```
     */
    keywayTool(inputs: Inputs.OCCT.DinKeywayToolDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.DinKeywayToolDto, inputs) as Resolved.OCCT.DinKeywayToolDto;
        return this.keywayCutter(resolved);
    }

    /**
     * Cuts a DIN 6885 keyway into a shaft or through a hub, as `keywayTool` places it.
     *
     * The body given is kept; a new solid comes back.
     * @param inputs - The body, the diameter, the length, shaft or hub, the unit and the frame
     * @returns The body with the keyway cut
     * @group keyways
     * @shortname din keyway
     * @drawable true
     * @example
     * ```typescript
     * const shaft = await bitbybit.occt.shapes.solid.createCylinder({ radius: 10, height: 40, center: [0, 0, 0], direction: [0, 1, 0] });
     * const keyed = await bitbybit.occt.parts.mechanical.machining.din.keyway({ shape: shaft, diameter: 20, length: 25, frame: { origin: [0, 5, 0], normal: [0, 1, 0], direction: [1, 0, 0] } });
     * ```
     */
    keyway(inputs: Inputs.OCCT.DinKeywayDto<TopoDS_Shape>): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.DinKeywayDto, inputs) as Resolved.OCCT.DinKeywayDto<TopoDS_Shape>;
        return this.shapes.cutFrom(checkedShape(resolved.shape), this.keywayCutter(resolved));
    }

    /**
     * Makes the solid the groove of a DIN 471 or DIN 472 retaining ring removes from a shaft or a
     * bore: as wide as the groove, down to its diameter.
     *
     * It starts at the frame's origin on the axis and runs the groove's width along the normal.
     * @param inputs - Shaft or bore, its diameter, the unit and the frame
     * @returns The tool as a solid
     * @group grooves
     * @shortname din ring groove tool
     * @drawable true
     * @example
     * ```typescript
     * const cutter = await bitbybit.occt.parts.mechanical.machining.din.ringGrooveTool({ kind: Bit.Inputs.Engineering.retainingRingKindEnum.shaft, diameter: 20 });
     * ```
     */
    ringGrooveTool(inputs: Inputs.OCCT.DinRingGrooveToolDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.DinRingGrooveToolDto, inputs) as Resolved.OCCT.DinRingGrooveToolDto;
        return this.grooveCutter(resolved);
    }

    /**
     * Cuts the groove of a DIN 471 or DIN 472 retaining ring into a shaft or a bore, as
     * `ringGrooveTool` places it; `parts.mechanical.retainingRings.din.retainingRing` at the same frame sits in it.
     *
     * The body given is kept; a new solid comes back.
     * @param inputs - The body, shaft or bore, its diameter, the unit and the frame
     * @returns The body with the groove cut
     * @group grooves
     * @shortname din ring groove
     * @drawable true
     * @example
     * ```typescript
     * const shaft = await bitbybit.occt.shapes.solid.createCylinder({ radius: 10, height: 40, center: [0, 0, 0], direction: [0, 1, 0] });
     * const grooved = await bitbybit.occt.parts.mechanical.machining.din.ringGroove({ shape: shaft, diameter: 20, frame: { origin: [0, 30, 0], normal: [0, 1, 0], direction: [1, 0, 0] } });
     * ```
     */
    ringGroove(inputs: Inputs.OCCT.DinRingGrooveDto<TopoDS_Shape>): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.DinRingGrooveDto, inputs) as Resolved.OCCT.DinRingGrooveDto<TopoDS_Shape>;
        return this.shapes.cutFrom(checkedShape(resolved.shape), this.grooveCutter(resolved));
    }

    /**
     * Makes the solid a DIN 82 knurl removes from a round shaft: 90 degree grooves half the pitch
     * deep, straight, helical at 30 degrees or crossing in a raised diamond.
     *
     * Its crests sit on the diameter the pitch divides evenly, nearest the one given; it starts at the
     * frame's origin and runs `length` along the normal.
     * @param inputs - The diameter, the length, the pitch, the pattern, the unit and the frame
     * @returns The tool as a solid
     * @group knurls
     * @shortname din knurl tool
     * @drawable true
     * @example
     * ```typescript
     * const cutter = await bitbybit.occt.parts.mechanical.machining.din.knurlTool({ diameter: 10, length: 10, pitch: 1, pattern: Bit.Inputs.Engineering.knurlPatternEnum.diamond });
     * ```
     */
    knurlTool(inputs: Inputs.OCCT.DinKnurlToolDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.DinKnurlToolDto, inputs) as Resolved.OCCT.DinKnurlToolDto;
        return this.knurlCutter(resolved);
    }

    /**
     * Knurls a round shaft, as `knurlTool` places the knurl.
     *
     * A diamond on a long knurl is heavy to build, its grooves crossing on every pitch. The body given
     * is kept; a new solid comes back.
     * @param inputs - The shaft, the diameter, the length, the pitch, the pattern, the unit and the frame
     * @returns The knurled shaft
     * @group knurls
     * @shortname din knurl
     * @drawable true
     * @example
     * ```typescript
     * const knob = await bitbybit.occt.shapes.solid.createCylinder({ radius: 5, height: 12, center: [0, 0, 0], direction: [0, 1, 0] });
     * const knurled = await bitbybit.occt.parts.mechanical.machining.din.knurl({ shape: knob, diameter: 10, length: 10, pitch: 1 });
     * ```
     */
    knurl(inputs: Inputs.OCCT.DinKnurlDto<TopoDS_Shape>): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.DinKnurlDto, inputs) as Resolved.OCCT.DinKnurlDto<TopoDS_Shape>;
        return this.shapes.cutFrom(checkedShape(resolved.shape), this.knurlCutter(resolved));
    }

    /**
     * Makes a DIN 5480 involute splined shaft: its teeth at 30 degrees, sized from the reference
     * diameter and the module, `length` long.
     *
     * It starts at the frame's origin, runs along the normal, and a tooth points along the frame's
     * direction.
     * @param inputs - The reference diameter, the module, the length, the unit and the frame
     * @returns A new solid
     * @group splines
     * @shortname din splined shaft
     * @drawable true
     * @example
     * ```typescript
     * const shaft = await bitbybit.occt.parts.mechanical.machining.din.splinedShaft({ referenceDiameter: 25, module: 1.25, length: 30 });
     * ```
     */
    splinedShaft(inputs: Inputs.OCCT.DinSplineDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.DinSplineDto, inputs) as Resolved.OCCT.DinSplineDto;
        return this.shapes.splineShaft(this.splineOf(resolved), resolved.length, resolved.frame);
    }

    /**
     * Makes the solid a DIN 5480 hub spline removes: the shaft's flanks, with the hub's tip and root
     * diameters, so the shaft of the same size slides into the cut.
     *
     * It starts at the frame's origin, runs `length` along the normal, and a gap faces the frame's
     * direction, where `splinedShaft` at the same frame has a tooth.
     * @param inputs - The reference diameter, the module, the length, the unit and the frame
     * @returns The tool as a solid
     * @group splines
     * @shortname din splined hub tool
     * @drawable true
     * @example
     * ```typescript
     * const cutter = await bitbybit.occt.parts.mechanical.machining.din.splinedHubTool({ referenceDiameter: 25, module: 1.25, length: 15 });
     * ```
     */
    splinedHubTool(inputs: Inputs.OCCT.DinSplineDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.DinSplineDto, inputs) as Resolved.OCCT.DinSplineDto;
        return this.shapes.hubCutter(this.splineOf(resolved), resolved.length, resolved.frame);
    }

    /**
     * Cuts a DIN 5480 spline through a hub, as `splinedHubTool` places it.
     *
     * The body given is kept; a new solid comes back.
     * @param inputs - The hub, the reference diameter, the module, the length, the unit and the frame
     * @returns The hub with the spline cut
     * @group splines
     * @shortname din splined hub
     * @drawable true
     * @example
     * ```typescript
     * const blank = await bitbybit.occt.shapes.solid.createCylinder({ radius: 25, height: 15, center: [0, 0, 0], direction: [0, 1, 0] });
     * const hub = await bitbybit.occt.parts.mechanical.machining.din.splinedHub({ shape: blank, referenceDiameter: 25, module: 1.25, length: 15 });
     * ```
     */
    splinedHub(inputs: Inputs.OCCT.DinSplinedHubDto<TopoDS_Shape>): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.DinSplinedHubDto, inputs) as Resolved.OCCT.DinSplinedHubDto<TopoDS_Shape>;
        return this.shapes.cutFrom(checkedShape(resolved.shape), this.shapes.hubCutter(this.splineOf(resolved), resolved.length, resolved.frame));
    }

    private keywayCutter(resolved: Resolved.OCCT.DinKeywayToolDto): TopoDS_Shape {
        const key = this.shapes.build.base.engineering.mechanical.keys.din.parallelKeySizes({ shaftDiameter: resolved.diameter, unit: resolved.unit });
        return this.shapes.keywayCutter(key, resolved.diameter, checkedWithin(resolved.length, "length", { above: 0 }), checkedFlag(resolved.inHub, "inHub"), resolved.frame);
    }

    private grooveCutter(resolved: Resolved.OCCT.DinRingGrooveToolDto): TopoDS_Shape {
        const sizes = this.shapes.build.base.engineering.mechanical.retainingRings.din.retainingRingSizes({ kind: resolved.kind, diameter: resolved.diameter, unit: resolved.unit });
        return this.shapes.grooveCutter(sizes, resolved.kind === Inputs.Engineering.retainingRingKindEnum.shaft, resolved.frame);
    }

    private knurlCutter(resolved: Resolved.OCCT.DinKnurlToolDto): TopoDS_Shape {
        const diameter = checkedWithin(resolved.diameter, "diameter", { above: 0 });
        const knurl = this.shapes.build.base.engineering.mechanical.knurls.din.knurlSizes({ diameter, pitch: resolved.pitch, pattern: resolved.pattern, unit: resolved.unit });
        return this.shapes.knurlCutter(knurl, diameter, checkedWithin(resolved.length, "length", { above: 0 }), resolved.pattern, resolved.frame);
    }

    private splineOf(resolved: Resolved.OCCT.DinSplineDto): InvoluteSplineSizes {
        return this.shapes.build.base.engineering.mechanical.splines.din.involuteSplineSizes({ referenceDiameter: resolved.referenceDiameter, module: resolved.module, unit: resolved.unit });
    }
}
