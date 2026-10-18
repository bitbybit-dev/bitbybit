import type { TopoDS_Shape } from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { InputError, resolveDto } from "@bitbybit-dev/base";
import type { SpurGearSpec } from "@bitbybit-dev/base";
import { spurGearOutline } from "@bitbybit-dev/base/lib/api/gears/gears";
import * as Inputs from "../../../api/inputs";
import type * as Resolved from "../../../api/resolved-inputs";
import { checkedFlag, checkedShape, checkedWithin } from "../../base/input-checks";
import type { OCCTSketch } from "../../sketch/sketch";
import { gearPen } from "./gear-pen";
import { diamondKnurlMesh } from "./knurl-mesh";
import { WORLD_FRAME } from "../../base/frames";
import type { PartBuilder } from "../part-builder";
import type { ThreadCutter } from "./thread-cutter";
import { CUTTER_OVERSHOOT, FULL_TURN_DEGREES, MOST_TWIST_SECTIONS, SPLINE_ROOT_FILLET, TWIST_STEP } from "../parts.constants";
import { add3, polar2, scale3 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";

type Point3 = Inputs.Base.Point3;

/**
 * Machining on round shafts and bores: DIN 6885 keyways milled into a shaft or cut through a hub,
 * flats, the grooves DIN 471 and DIN 472 retaining rings sit in, DIN 82 knurls, and DIN 5480 involute
 * splines on a shaft and through a hub. Each comes as a tool, the solid the cut removes placed by a
 * frame on the axis, for a design's boolean, and as a method that cuts it from a body.
 */
export class OCCTMachining {

    constructor(
        private readonly sketch: OCCTSketch,
        private readonly build: PartBuilder,
        private readonly threads: ThreadCutter,
    ) { }

    /**
     * Makes the solid a DIN 6885 keyway removes: the round-ended pocket milled into a shaft, or the
     * straight keyway cut through a hub's bore, sized for the diameter.
     *
     * It starts at the frame's origin on the axis, runs `length` along the normal and faces the
     * frame's direction.
     * @param inputs - The diameter, the length, shaft or hub, and the frame
     * @returns The tool as a solid
     * @group keyways
     * @shortname keyway tool
     * @drawable true
     * @example
     * ```typescript
     * const cutter = await bitbybit.occt.parts.mechanical.machining.keywayTool({ diameter: 20, length: 25 });
     * ```
     */
    keywayTool(inputs: Inputs.OCCT.KeywayToolDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.KeywayToolDto, inputs) as Resolved.OCCT.KeywayToolDto;
        return this.keywayCutter(resolved);
    }

    /**
     * Cuts a DIN 6885 keyway into a shaft or through a hub, as `keywayTool` places it.
     *
     * The body given is kept; a new solid comes back.
     * @param inputs - The body, the diameter, the length, shaft or hub, and the frame
     * @returns The body with the keyway cut
     * @group keyways
     * @shortname keyway
     * @drawable true
     * @example
     * ```typescript
     * const shaft = await bitbybit.occt.shapes.solid.createCylinder({ radius: 10, height: 40, center: [0, 0, 0], direction: [0, 1, 0] });
     * const keyed = await bitbybit.occt.parts.mechanical.machining.keyway({ shape: shaft, diameter: 20, length: 25, frame: { origin: [0, 5, 0], normal: [0, 1, 0], direction: [1, 0, 0] } });
     * ```
     */
    keyway(inputs: Inputs.OCCT.KeywayDto<TopoDS_Shape>): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.KeywayDto, inputs) as Resolved.OCCT.KeywayDto<TopoDS_Shape>;
        return this.cutFrom(checkedShape(resolved.shape), this.keywayCutter(resolved));
    }

    /**
     * Makes the solid a flat on a round shaft removes: everything beyond a plane `depth` in from the
     * surface, along `length`.
     *
     * It starts at the frame's origin on the axis, runs along the normal and faces the frame's
     * direction.
     * @param inputs - The diameter, the depth, the length and the frame
     * @returns The tool as a solid
     * @group flats
     * @shortname flat tool
     * @drawable true
     * @example
     * ```typescript
     * const cutter = await bitbybit.occt.parts.mechanical.machining.flatTool({ diameter: 8, depth: 0.5, length: 12 });
     * ```
     */
    flatTool(inputs: Inputs.OCCT.FlatToolDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.FlatToolDto, inputs) as Resolved.OCCT.FlatToolDto;
        return this.flatCutter(resolved);
    }

    /**
     * Cuts a flat into a round shaft, as `flatTool` places it, such as the D flat a set screw bears on.
     *
     * The body given is kept; a new solid comes back.
     * @param inputs - The shaft, the diameter, the depth, the length and the frame
     * @returns The shaft with the flat cut
     * @group flats
     * @shortname flat
     * @drawable true
     * @example
     * ```typescript
     * const shaft = await bitbybit.occt.shapes.solid.createCylinder({ radius: 4, height: 30, center: [0, 0, 0], direction: [0, 1, 0] });
     * const flatted = await bitbybit.occt.parts.mechanical.machining.flat({ shape: shaft, diameter: 8, depth: 0.5, length: 12 });
     * ```
     */
    flat(inputs: Inputs.OCCT.FlatDto<TopoDS_Shape>): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.FlatDto, inputs) as Resolved.OCCT.FlatDto<TopoDS_Shape>;
        return this.cutFrom(checkedShape(resolved.shape), this.flatCutter(resolved));
    }

    /**
     * Makes the solid the groove of a DIN 471 or DIN 472 retaining ring removes from a shaft or a
     * bore: as wide as the groove, down to its diameter.
     *
     * It starts at the frame's origin on the axis and runs the groove's width along the normal.
     * @param inputs - Shaft or bore, its diameter and the frame
     * @returns The tool as a solid
     * @group grooves
     * @shortname ring groove tool
     * @drawable true
     * @example
     * ```typescript
     * const cutter = await bitbybit.occt.parts.mechanical.machining.ringGrooveTool({ kind: Bit.Inputs.Engineering.retainingRingKindEnum.shaft, diameter: 20 });
     * ```
     */
    ringGrooveTool(inputs: Inputs.OCCT.RingGrooveToolDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.RingGrooveToolDto, inputs) as Resolved.OCCT.RingGrooveToolDto;
        return this.grooveCutter(resolved);
    }

    /**
     * Cuts the groove of a DIN 471 or DIN 472 retaining ring into a shaft or a bore, as
     * `ringGrooveTool` places it; `parts.mechanical.retainingRings.retainingRing` at the same frame sits in it.
     *
     * The body given is kept; a new solid comes back.
     * @param inputs - The body, shaft or bore, its diameter and the frame
     * @returns The body with the groove cut
     * @group grooves
     * @shortname ring groove
     * @drawable true
     * @example
     * ```typescript
     * const shaft = await bitbybit.occt.shapes.solid.createCylinder({ radius: 10, height: 40, center: [0, 0, 0], direction: [0, 1, 0] });
     * const grooved = await bitbybit.occt.parts.mechanical.machining.ringGroove({ shape: shaft, diameter: 20, frame: { origin: [0, 30, 0], normal: [0, 1, 0], direction: [1, 0, 0] } });
     * ```
     */
    ringGroove(inputs: Inputs.OCCT.RingGrooveDto<TopoDS_Shape>): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.RingGrooveDto, inputs) as Resolved.OCCT.RingGrooveDto<TopoDS_Shape>;
        return this.cutFrom(checkedShape(resolved.shape), this.grooveCutter(resolved));
    }

    /**
     * Makes the solid a DIN 82 knurl removes from a round shaft: 90 degree grooves half the pitch
     * deep, straight, helical at 30 degrees or crossing in a raised diamond.
     *
     * Its crests sit on the diameter the pitch divides evenly, nearest the one given; it starts at the
     * frame's origin and runs `length` along the normal.
     * @param inputs - The diameter, the length, the pitch, the pattern and the frame
     * @returns The tool as a solid
     * @group knurls
     * @shortname knurl tool
     * @drawable true
     * @example
     * ```typescript
     * const cutter = await bitbybit.occt.parts.mechanical.machining.knurlTool({ diameter: 10, length: 10, pitch: 1, pattern: Bit.Inputs.Engineering.knurlPatternEnum.diamond });
     * ```
     */
    knurlTool(inputs: Inputs.OCCT.KnurlToolDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.KnurlToolDto, inputs) as Resolved.OCCT.KnurlToolDto;
        return this.knurlCutter(resolved);
    }

    /**
     * Knurls a round shaft, as `knurlTool` places the knurl.
     *
     * A diamond on a long knurl is heavy to build, its grooves crossing on every pitch. The body given
     * is kept; a new solid comes back.
     * @param inputs - The shaft, the diameter, the length, the pitch, the pattern and the frame
     * @returns The knurled shaft
     * @group knurls
     * @shortname knurl
     * @drawable true
     * @example
     * ```typescript
     * const knob = await bitbybit.occt.shapes.solid.createCylinder({ radius: 5, height: 12, center: [0, 0, 0], direction: [0, 1, 0] });
     * const knurled = await bitbybit.occt.parts.mechanical.machining.knurl({ shape: knob, diameter: 10, length: 10, pitch: 1 });
     * ```
     */
    knurl(inputs: Inputs.OCCT.KnurlDto<TopoDS_Shape>): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.KnurlDto, inputs) as Resolved.OCCT.KnurlDto<TopoDS_Shape>;
        return this.cutFrom(checkedShape(resolved.shape), this.knurlCutter(resolved));
    }

    /**
     * Makes a DIN 5480 involute splined shaft: its teeth at 30 degrees, sized from the reference
     * diameter and the module, `length` long.
     *
     * It starts at the frame's origin, runs along the normal, and a tooth points along the frame's
     * direction.
     * @param inputs - The reference diameter, the module, the length and the frame
     * @returns A new solid
     * @group splines
     * @shortname splined shaft
     * @drawable true
     * @example
     * ```typescript
     * const shaft = await bitbybit.occt.parts.mechanical.machining.splinedShaft({ referenceDiameter: 25, module: 1.25, length: 30 });
     * ```
     */
    splinedShaft(inputs: Inputs.OCCT.SplineDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.SplineDto, inputs) as Resolved.OCCT.SplineDto;
        const spline = this.build.base.engineering.mechanical.splines.involuteSplineSizes({ referenceDiameter: resolved.referenceDiameter, module: resolved.module });
        return this.splineSolid(this.splineSpec(spline.module, spline.teeth, spline.profileShift, spline.shaftTipDiameter, spline.shaftRootDiameter, SPLINE_ROOT_FILLET), 0, checkedWithin(resolved.length, "length", { above: 0 }), resolved.frame);
    }

    /**
     * Makes the solid a DIN 5480 hub spline removes: the shaft's flanks, with the hub's tip and root
     * diameters, so the shaft of the same size slides into the cut.
     *
     * It starts at the frame's origin, runs `length` along the normal, and a gap faces the frame's
     * direction, where `splinedShaft` at the same frame has a tooth.
     * @param inputs - The reference diameter, the module, the length and the frame
     * @returns The tool as a solid
     * @group splines
     * @shortname splined hub tool
     * @drawable true
     * @example
     * ```typescript
     * const cutter = await bitbybit.occt.parts.mechanical.machining.splinedHubTool({ referenceDiameter: 25, module: 1.25, length: 15 });
     * ```
     */
    splinedHubTool(inputs: Inputs.OCCT.SplineDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.SplineDto, inputs) as Resolved.OCCT.SplineDto;
        return this.hubCutter(resolved);
    }

    /**
     * Cuts a DIN 5480 spline through a hub, as `splinedHubTool` places it.
     *
     * The body given is kept; a new solid comes back.
     * @param inputs - The hub, the reference diameter, the module, the length and the frame
     * @returns The hub with the spline cut
     * @group splines
     * @shortname splined hub
     * @drawable true
     * @example
     * ```typescript
     * const blank = await bitbybit.occt.shapes.solid.createCylinder({ radius: 25, height: 15, center: [0, 0, 0], direction: [0, 1, 0] });
     * const hub = await bitbybit.occt.parts.mechanical.machining.splinedHub({ shape: blank, referenceDiameter: 25, module: 1.25, length: 15 });
     * ```
     */
    splinedHub(inputs: Inputs.OCCT.SplinedHubDto<TopoDS_Shape>): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.SplinedHubDto, inputs) as Resolved.OCCT.SplinedHubDto<TopoDS_Shape>;
        return this.cutFrom(checkedShape(resolved.shape), this.hubCutter(resolved));
    }

    /**
     * Makes the solid an ISO metric thread removes: the 60 degree groove swept along a right-hand
     * helix.
     *
     * It runs `length` from the frame's origin into the part, against the normal, stopping at the
     * origin's plane. Shanks sit to 6g and holes to 6H: on frames whole pitches apart, the two mesh
     * with play.
     * @param inputs - The size, the pitch, the length, inside or out, and the frame
     * @returns The tool as a solid
     * @group threads
     * @shortname thread tool
     * @drawable true
     * @example
     * ```typescript
     * const cutter = await bitbybit.occt.parts.mechanical.machining.threadTool({ size: Bit.Inputs.Engineering.metricSizeEnum.m3, length: 10 });
     * ```
     */
    threadTool(inputs: Inputs.OCCT.ThreadToolDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.ThreadToolDto, inputs) as Resolved.OCCT.ThreadToolDto;
        return this.threads.tool(resolved);
    }

    /**
     * Models an ISO metric thread on a shank or in a hole, as `threadTool` places it, instead of the
     * cosmetic thread `parts.mechanical.fasteners` draws.
     *
     * Turn the shank to the nominal diameter, or drill the hole to the minor; a modelled thread is
     * heavy, so keep it to the parts that need it. Its defaults thread a default bolt.
     * @param inputs - The body, the size, the pitch, the length, inside or out, and the frame
     * @returns The threaded body
     * @group threads
     * @shortname thread
     * @drawable true
     * @example
     * ```typescript
     * const rod = await bitbybit.occt.shapes.solid.createCylinder({ radius: 4, height: 20, center: [0, -20, 0], direction: [0, 1, 0] });
     * const threaded = await bitbybit.occt.parts.mechanical.machining.thread({ shape: rod, size: Bit.Inputs.Engineering.metricSizeEnum.m8, length: 16 });
     * ```
     */
    thread(inputs: Inputs.OCCT.ThreadDto<TopoDS_Shape>): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.ThreadDto, inputs) as Resolved.OCCT.ThreadDto<TopoDS_Shape>;
        return this.cutFrom(checkedShape(resolved.shape), this.threads.tool(resolved));
    }

    private cutFrom(shape: TopoDS_Shape, tool: TopoDS_Shape): TopoDS_Shape {
        let cut: TopoDS_Shape;
        try {
            cut = this.build.booleans.difference({ shape, shapes: [tool], keepEdges: false });
        } finally {
            tool.delete();
        }
        const solids = this.build.shapes.solid.getSolids({ shape: cut });
        solids.forEach(solid => solid.delete());
        if (solids.length === 0) {
            cut.delete();
            throw new InputError("`shape` lies wholly inside the cut, so nothing of it is left: size the cut to the shape, or move it with `frame`.", "shape");
        }
        return cut;
    }

    private box(from: Point3, to: Point3): TopoDS_Shape {
        return this.build.shapes.solid.createBox({ width: to[0] - from[0], length: to[2] - from[2], height: to[1] - from[1], center: scale3(add3(from, to), 1 / 2), originOnCenter: true });
    }

    private keywayCutter(resolved: Resolved.OCCT.KeywayToolDto): TopoDS_Shape {
        const key = this.build.base.engineering.mechanical.keys.parallelKeySizes({ shaftDiameter: resolved.diameter });
        const length = checkedWithin(resolved.length, "length", { above: 0 });
        const radius = resolved.diameter / 2;
        const over = resolved.diameter * CUTTER_OVERSHOOT;
        const half = key.width / 2;
        if (checkedFlag(resolved.inHub, "inHub")) {
            return this.build.oriented(this.box([0, -half, -over], [radius + key.hubDepth, half, length + over]), resolved.frame);
        }
        if (!(length > key.width)) {
            throw new InputError(`\`length\` is not more than the keyway's width, ${String(key.width)}, so it has no straight sides.`, "length");
        }
        const bottom = radius - key.shaftDepth;
        const face = this.sketch.pen({
            commands: [
                { type: "line", to: [length - half, -half], relative: false },
                { type: "threePointArc", through: [length, 0], to: [length - half, half], relative: false },
                { type: "line", to: [half, half], relative: false },
                { type: "threePointArc", through: [0, 0], to: [half, -half], relative: false },
            ],
            start: [half, -half],
            frame: { origin: [bottom, 0, 0], normal: [1, 0, 0], direction: [0, 0, 1] },
            makeFace: true,
        });
        try {
            return this.build.oriented(this.build.operations.extrude({ shape: face, direction: [key.shaftDepth + over, 0, 0] }), resolved.frame);
        } finally {
            face.delete();
        }
    }

    private flatCutter(resolved: Resolved.OCCT.FlatToolDto): TopoDS_Shape {
        const radius = checkedWithin(resolved.diameter, "diameter", { above: 0 }) / 2;
        const depth = checkedWithin(resolved.depth, "depth", { above: 0 });
        if (!(depth < 2 * radius)) {
            throw new InputError("`depth` cuts through the whole shaft: make it less than the diameter.", "depth");
        }
        const length = checkedWithin(resolved.length, "length", { above: 0 });
        const over = radius * CUTTER_OVERSHOOT;
        return this.build.oriented(this.box([radius - depth, -radius - over, 0], [radius + over, radius + over, length]), resolved.frame);
    }

    private grooveCutter(resolved: Resolved.OCCT.RingGrooveToolDto): TopoDS_Shape {
        const sizes = this.build.base.engineering.mechanical.retainingRings.retainingRingSizes({ kind: resolved.kind, diameter: resolved.diameter });
        const over = sizes.nominal * CUTTER_OVERSHOOT;
        const ring = (outer: number, inner: number): TopoDS_Shape => this.build.revolved([[inner, 0], [outer, 0], [outer, sizes.grooveWidth], [inner, sizes.grooveWidth]]);
        const cutter = resolved.kind === Inputs.Engineering.retainingRingKindEnum.shaft
            ? ring(sizes.nominal / 2 + over, sizes.grooveDiameter / 2)
            : ring(sizes.grooveDiameter / 2, sizes.nominal / 2 - over);
        return this.build.oriented(cutter, resolved.frame);
    }

    private knurlCutter(resolved: Resolved.OCCT.KnurlToolDto): TopoDS_Shape {
        const knurl = this.build.base.engineering.mechanical.knurls.knurlSizes({ diameter: checkedWithin(resolved.diameter, "diameter", { above: 0 }), pitch: resolved.pitch, pattern: resolved.pattern });
        const length = checkedWithin(resolved.length, "length", { above: 0 });
        const crest = knurl.diameter / 2;
        const star = (turn: number, z: number): Point3[] => {
            const start = this.build.base.math.degToRad({ number: turn });
            return Array.from({ length: 2 * knurl.grooves }, (_, index): Point3 => [...polar2(index % 2 === 0 ? crest : crest - knurl.depth, start + Math.PI * index / knurl.grooves), z]);
        };
        const helix = Math.tan(this.build.base.math.degToRad({ number: knurl.helixAngle }));
        const twist = FULL_TURN_DEGREES * length * helix / (Math.PI * knurl.diameter);
        if (Math.ceil(Math.abs(twist) / TWIST_STEP) > MOST_TWIST_SECTIONS) {
            throw new InputError(`\`length\` twists the grooves through ${String(Math.round(Math.abs(twist)))} degrees, more than the ${String(MOST_TWIST_SECTIONS * TWIST_STEP)} a knurl is modelled with: make it shorter.`, "length");
        }
        const outside = Math.max(crest, resolved.diameter / 2) * (1 + CUTTER_OVERSHOOT);
        const wire = this.build.shapes.wire;
        const grooves = (sense: number): TopoDS_Shape => {
            const steps = twist === 0 ? 1 : Math.max(1, Math.ceil(twist / TWIST_STEP));
            const sections = Array.from({ length: steps + 1 }, (_, index) => wire.createPolygonWire({ points: star(sense * twist * index / steps, length * index / steps) }));
            const rims = [0, length].map(z => wire.createCircleWire({ radius: outside, center: [0, 0, z], direction: [0, 0, 1] }));
            try {
                const flanks = twist === 0
                    ? this.build.operations.extrude({ shape: sections[0]!, direction: [0, 0, length] })
                    : this.build.operations.loft({ shapes: sections, makeSolid: false });
                return this.build.solidOfFaces([
                    () => flanks,
                    () => this.build.operations.extrude({ shape: rims[0]!, direction: [0, 0, length] }),
                    () => this.build.faceWithHoles(rims[0]!, [sections[0]!]),
                    () => this.build.faceWithHoles(rims[1]!, [sections[sections.length - 1]!]),
                ], knurl.diameter);
            } finally {
                [...sections, ...rims].forEach(shape => shape.delete());
            }
        };
        const pattern = resolved.pattern;
        const cutter = pattern === Inputs.Engineering.knurlPatternEnum.diamond
            ? this.build.facetedSolid(diamondKnurlMesh({ crest, root: crest - knurl.depth, grooves: knurl.grooves, twist: helix / crest, length, outside }), knurl.diameter)
            : grooves(pattern === Inputs.Engineering.knurlPatternEnum.left ? -1 : 1);
        return this.build.oriented(cutter, resolved.frame);
    }

    private splineSpec(module: number, teeth: number, profileShift: number, tipDiameter: number, rootDiameter: number, rootFillet: number): SpurGearSpec {
        const pitchRadius = module * teeth / 2;
        return {
            module,
            teeth,
            pressureAngle: 30,
            profileShift,
            backlash: 0,
            addendum: (tipDiameter / 2 - pitchRadius) / module - profileShift,
            dedendum: (pitchRadius - rootDiameter / 2) / module + profileShift,
            rootFillet,
        };
    }

    private splineSolid(spec: SpurGearSpec, from: number, length: number, frame: Inputs.Base.Frame | undefined): TopoDS_Shape {
        const pen = gearPen(spurGearOutline(spec, [0, 0], 0));
        const start = this.build.along(WORLD_FRAME, from);
        const face = this.sketch.pen({ commands: pen.commands, start: pen.start, frame: start, makeFace: true });
        try {
            return this.build.oriented(this.build.operations.extrude({ shape: face, direction: [0, 0, length] }), frame);
        } finally {
            face.delete();
        }
    }

    private hubCutter(resolved: Resolved.OCCT.SplineDto): TopoDS_Shape {
        const spline = this.build.base.engineering.mechanical.splines.involuteSplineSizes({ referenceDiameter: resolved.referenceDiameter, module: resolved.module });
        const length = checkedWithin(resolved.length, "length", { above: 0 });
        const over = spline.referenceDiameter * CUTTER_OVERSHOOT;
        return this.splineSolid(this.splineSpec(spline.module, spline.teeth, spline.profileShift, spline.hubRootDiameter, spline.hubTipDiameter, 0), -over, length + 2 * over, resolved.frame);
    }
}
