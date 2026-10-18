import type { TopoDS_Shape } from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { InputError, resolveDto } from "@bitbybit-dev/base";
import { gearMovePoints, ringGearOutline, spurGearOutline } from "@bitbybit-dev/base/lib/api/gears/gears";
import { rackOutline } from "@bitbybit-dev/base/lib/api/gears/racks";
import { helicalGearOutline } from "@bitbybit-dev/base/lib/api/gears/helical-gears";
import { bevelGearOutline } from "@bitbybit-dev/base/lib/api/gears/bevel-gears";
import type { GearMove, ParallelKeySizes } from "@bitbybit-dev/base";
import type { GearOutline, HelicalGearSpec, RackOutline } from "@bitbybit-dev/base/lib/api/gears/gear-types";
import * as Inputs from "../../../api/inputs";
import type * as Models from "../../../api/models";
import type * as Resolved from "../../../api/resolved-inputs";
import { checkedFlag, checkedWithin } from "../../base/input-checks";
import { kernelObjects, release, releasedOnError } from "../../base/release";
import type { OCCTOperations } from "../../operations";
import type { OCCTShapes } from "../../shapes/shapes";
import type { OCCTSketch } from "../../sketch/sketch";
import { checkTeeth, gearPen } from "./gear-pen";
import type { PartBuilder } from "../part-builder";
import type { ExtrudedGear, GearBody, GearSection, GearSides, PlainGearBody, RingFace, RoledWire, ToothedGearInputs, ToothedSizes } from "../parts-types";
import { BEVEL_CURVE_SAMPLES, BEVEL_FACE_SHARE, BEVEL_LAND, MIN_TWIST_STEPS, MOST_TWIST_SECTIONS, PART_SEW_SHARE, SAME_RADIUS_SHARE, TWIST_STEP } from "../parts.constants";
import { length2, rotated2, scale2, scale3 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";

const BORE_ROLE = "bore";
const RIM_ROLE = "rim";
const START_ROLE = "start";
const END_ROLE = "end";
const AXIS_FRAME = "axis";
const PITCH_FRAME = "pitch";
const HUB_ROLE = "hub";
const KEYWAY_ROLE = "keyway";
const BACK_ROLE = "back";
const FRONT_ROLE = "front";
const APEX_FRAME = "apex";
const BACK_FRAME = "back";

/**
 * Involute gears, made from their sizes rather than drawn: spur and helical gears with their teeth
 * outside, ring gears with their teeth inside, racks and straight bevel gears, as solids whose faces
 * can be named tips, flanks and roots. Gears sharing `module` and `pressureAngle` mesh: spur gears half the module
 * times their teeth together apart, a spur gear in a ring half the module times the difference. Flanks
 * are not undercut, so a pinion under 17 teeth at 20 degrees wants a `profileShift`, and a ring near its
 * pinion's count can touch at the tips: check a pair with `analysis.clashes` through a pitch.
 */
export class OCCTGears {

    constructor(
        private readonly sketch: OCCTSketch,
        private readonly operations: OCCTOperations,
        private readonly shapes: OCCTShapes,
        private readonly build: PartBuilder,
    ) { }

    /**
     * Draws the outline of an involute spur gear around a frame's origin, in the frame's plane.
     *
     * The flanks follow the involute of the base circle and the gaps are rounded at the root. At
     * `rotation` 0 a tooth points along the frame's direction. Teeth that come to a point, or leave no
     * gap at the root, are refused.
     * @param inputs - The teeth, the frame and whether to make a face
     * @returns The outline as a face, or as a closed wire when `makeFace` is false
     * @group gears
     * @shortname spur gear profile
     * @drawable true
     * @example
     * ```typescript
     * const profile = await bitbybit.occt.parts.mechanical.gears.spurGearProfile({ module: 0.2, teeth: 24, makeFace: true });
     * const gear = await bitbybit.occt.operations.extrude({ shape: profile, direction: [0, 0.8, 0] });
     * ```
     */
    spurGearProfile(inputs: Inputs.OCCT.SpurGearProfileDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.SpurGearProfileDto, inputs) as Resolved.OCCT.SpurGearProfileDto;
        checkTeeth(resolved.teeth);
        const makeFace = checkedFlag(resolved.makeFace, "makeFace");
        const pen = gearPen(spurGearOutline(resolved, [0, 0], checkedWithin(resolved.rotation, "rotation", {})));
        return this.sketch.pen({ commands: pen.commands, start: pen.start, frame: this.build.frameOf(resolved.frame), makeFace });
    }

    /**
     * Makes an involute spur gear as a solid: its outline swept `width` along the frame's normal, with
     * a `bore`, a hub standing out from its end face and a DIN 6885 keyway.
     *
     * The first face lies in the frame's plane. A `bore` of 0 leaves the gear whole; one that
     * reaches the root circle is refused.
     * @param inputs - The teeth, the width, the bore, the hub, the keyway and the frame
     * @returns A new solid
     * @group gears
     * @shortname spur gear
     * @drawable true
     * @example
     * ```typescript
     * const driver = await bitbybit.occt.parts.mechanical.gears.spurGear({ module: 0.2, teeth: 20, width: 1, bore: 0.8 });
     * const driven = await bitbybit.occt.parts.mechanical.gears.spurGear({ module: 0.2, teeth: 40, width: 1, bore: 1.2, rotation: 4.5, frame: { origin: [6, 0, 0], normal: [0, 1, 0], direction: [1, 0, 0] } });
     * ```
     */
    spurGear(inputs: Inputs.OCCT.SpurGearDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.SpurGearDto, inputs) as Resolved.OCCT.SpurGearDto;
        return this.madeSpur(resolved).shape;
    }

    /**
     * Makes a spur gear as `spurGear` does and names the role each face plays.
     *
     * The roles `tip`, `flank`, `root`, `bore`, `hub`, `keyway`, `start` (in the frame's plane) and
     * `end` list face indexes as `shapes.face.getFaces` numbers them. The `axis` frame sits at the
     * start face's centre, toward the first tooth.
     * @param inputs - The teeth, the width, the bore, the hub, the keyway and the frame
     * @returns The gear, the faces each role names and its axis
     * @group gears
     * @shortname spur gear with roles
     * @drawable false
     * @example
     * ```typescript
     * const { shape, roles, frames } = await bitbybit.occt.parts.mechanical.gears.spurGearWithRoles({ module: 0.2, teeth: 20, width: 1, bore: 0.8 });
     * console.log(roles["tip"]?.length, roles["bore"], frames["axis"]);
     * ```
     */
    spurGearWithRoles(inputs: Inputs.OCCT.SpurGearDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.SpurGearDto, inputs) as Resolved.OCCT.SpurGearDto;
        return this.madeSpur(resolved);
    }

    /**
     * Makes an involute helical gear as a solid: its section square to the axis turned steadily along
     * `width`, with a `bore`, a hub and a DIN 6885 keyway as `spurGear` has them.
     *
     * Two external helical gears of one module and angle in opposite hands mesh, the sum of their
     * pitch radii apart; `herringbone` makes two opposite halves.
     * @param inputs - The teeth and their lean, the width, the bore, the hub, the keyway and the frame
     * @returns A new solid
     * @group helical
     * @shortname helical gear
     * @drawable true
     * @example
     * ```typescript
     * const driver = await bitbybit.occt.parts.mechanical.gears.helicalGear({ module: 0.2, teeth: 20, helixAngle: 20, width: 1, bore: 0.8 });
     * const sizes = bitbybit.engineering.mechanical.gears.helicalGearSizes({ module: 0.2, teeth: 20, helixAngle: 20 });
     * ```
     */
    helicalGear(inputs: Inputs.OCCT.HelicalGearDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.HelicalGearDto, inputs) as Resolved.OCCT.HelicalGearDto;
        return this.madeHelical(resolved).shape;
    }

    /**
     * Makes a helical gear as `helicalGear` does and names the role each face plays.
     *
     * The roles `tip`, `flank`, `root`, `bore`, `hub`, `keyway`, `start` (in the frame's plane) and
     * `end` list face indexes as `shapes.face.getFaces` numbers them. The `axis` frame sits at the
     * start face's centre, toward the first tooth.
     * @param inputs - The teeth and their lean, the width, the bore, the hub, the keyway and the frame
     * @returns The gear, the faces each role names and its axis
     * @group helical
     * @shortname helical gear with roles
     * @drawable false
     * @example
     * ```typescript
     * const { shape, roles } = await bitbybit.occt.parts.mechanical.gears.helicalGearWithRoles({ module: 0.2, teeth: 20, helixAngle: 20, herringbone: true });
     * ```
     */
    helicalGearWithRoles(inputs: Inputs.OCCT.HelicalGearDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.HelicalGearDto, inputs) as Resolved.OCCT.HelicalGearDto;
        return this.madeHelical(resolved);
    }

    /**
     * Makes a straight bevel gear as a solid by Tredgold's approximation: teeth that run straight to
     * the apex, between a back cone and a front cone `faceWidth` nearer the apex, on a body with flat
     * ends.
     *
     * It meshes a bevel gear of the mate's teeth that shares its frame's origin, the two normals at
     * `shaftAngle`, turned half a tooth.
     * @param inputs - The teeth, the mate's teeth, the shaft angle, the face width, the bore and the frame
     * @returns A new solid
     * @group bevel
     * @shortname bevel gear
     * @drawable true
     * @example
     * ```typescript
     * const pinion = await bitbybit.occt.parts.mechanical.gears.bevelGear({ module: 0.2, teeth: 20, mateTeeth: 30, faceWidth: 0.8, frame: { origin: [0, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0] } });
     * const wheel = await bitbybit.occt.parts.mechanical.gears.bevelGear({ module: 0.2, teeth: 30, mateTeeth: 20, faceWidth: 0.8, rotation: 6, frame: { origin: [0, 0, 0], normal: [1, 0, 0], direction: [0, 0, 1] } });
     * ```
     */
    bevelGear(inputs: Inputs.OCCT.BevelGearDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.BevelGearDto, inputs) as Resolved.OCCT.BevelGearDto;
        return this.madeBevel(resolved).shape;
    }

    /**
     * Makes a bevel gear as `bevelGear` does and names the role each face plays.
     *
     * The roles `tip`, `flank`, `root`, `back` (the back cone and the flat back face), `front` and
     * `bore` list face indexes as `shapes.face.getFaces` numbers them. The `apex` frame is the input
     * frame turned to the first tooth; `back` sits at the back face's centre.
     * @param inputs - The teeth, the mate's teeth, the shaft angle, the face width, the bore and the frame
     * @returns The gear, the faces each role names and its apex and back
     * @group bevel
     * @shortname bevel gear with roles
     * @drawable false
     * @example
     * ```typescript
     * const { shape, roles, frames } = await bitbybit.occt.parts.mechanical.gears.bevelGearWithRoles({ module: 0.2, teeth: 20, mateTeeth: 30 });
     * console.log(roles["back"], frames["back"]);
     * ```
     */
    bevelGearWithRoles(inputs: Inputs.OCCT.BevelGearDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.BevelGearDto, inputs) as Resolved.OCCT.BevelGearDto;
        return this.madeBevel(resolved);
    }

    /**
     * Draws an involute ring gear in the frame's plane, its teeth pointing in toward the frame's
     * origin.
     *
     * As a face it is the ring between its outer circle and its teeth; as a wire, only the outline of
     * the teeth. At `rotation` 0 a tooth points along the frame's direction. Teeth whose tips reach
     * inside the base circle are refused.
     * @param inputs - The teeth, the rim, the frame and whether to make a face
     * @returns The ring as a face, or the outline of its teeth as a closed wire when `makeFace` is false
     * @group gears
     * @shortname ring gear profile
     * @drawable true
     * @example
     * ```typescript
     * const ring = await bitbybit.occt.parts.mechanical.gears.ringGearProfile({ module: 0.2, teeth: 60, rim: 0.6, makeFace: true });
     * const solid = await bitbybit.occt.operations.extrude({ shape: ring, direction: [0, 0.8, 0] });
     * ```
     */
    ringGearProfile(inputs: Inputs.OCCT.RingGearProfileDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.RingGearProfileDto, inputs) as Resolved.OCCT.RingGearProfileDto;
        checkTeeth(resolved.teeth);
        const makeFace = checkedFlag(resolved.makeFace, "makeFace");
        const spec = resolved;
        const outline = ringGearOutline(spec, [0, 0], checkedWithin(resolved.rotation, "rotation", {}));
        const frame = this.build.frameOf(resolved.frame);
        if (!makeFace) {
            const pen = gearPen(outline);
            return this.sketch.pen({ commands: pen.commands, start: pen.start, frame, makeFace: false });
        }
        const outer = this.build.base.engineering.mechanical.gears.ringGearSizes(spec).rootRadius + checkedWithin(resolved.rim, "rim", { above: 0 });
        return this.ringFace(outline, outer, frame).face;
    }

    /**
     * Makes an involute ring gear as a solid: the ring between its outer circle and its teeth, swept
     * `width` along the frame's normal.
     *
     * The first face lies in the frame's plane. A spur gear of the same module meshes inside it with
     * its centre half the module times the difference of their teeth from the ring's centre.
     * @param inputs - The teeth, the rim, the width and the frame
     * @returns A new solid
     * @group gears
     * @shortname ring gear
     * @drawable true
     * @example
     * ```typescript
     * const ring = await bitbybit.occt.parts.mechanical.gears.ringGear({ module: 0.2, teeth: 60, width: 1 });
     * const pinion = await bitbybit.occt.parts.mechanical.gears.spurGear({ module: 0.2, teeth: 20, width: 1, bore: 0.6, rotation: 9, frame: { origin: [4, 0, 0], normal: [0, 1, 0], direction: [1, 0, 0] } });
     * ```
     */
    ringGear(inputs: Inputs.OCCT.RingGearDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.RingGearDto, inputs) as Resolved.OCCT.RingGearDto;
        return this.madeRing(resolved).shape;
    }

    /**
     * Makes a ring gear as `ringGear` does and names the role each face plays.
     *
     * The roles `tip`, `flank`, `root`, `rim` (the outer face), `start` (in the frame's plane) and
     * `end` list face indexes as `shapes.face.getFaces` numbers them. The `axis` frame sits at the
     * start face's centre, toward the first tooth.
     * @param inputs - The teeth, the rim, the width and the frame
     * @returns The ring, the faces each role names and its axis
     * @group gears
     * @shortname ring gear with roles
     * @drawable false
     * @example
     * ```typescript
     * const { shape, roles, frames } = await bitbybit.occt.parts.mechanical.gears.ringGearWithRoles({ module: 0.2, teeth: 60, width: 1 });
     * console.log(roles["tip"]?.length, roles["rim"], frames["axis"]);
     * ```
     */
    ringGearWithRoles(inputs: Inputs.OCCT.RingGearDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.RingGearDto, inputs) as Resolved.OCCT.RingGearDto;
        return this.madeRing(resolved);
    }

    /**
     * Draws an involute rack in the frame's plane: its pitch line along the frame's direction, its
     * straight-flanked teeth pointing across it, the first tooth's middle on the origin.
     *
     * The rack ends halfway across a gap at each end. A spur gear of the same module meshes with its
     * centre its pitch radius from the pitch line.
     * @param inputs - The teeth, the height, the frame and whether to make a face
     * @returns The outline as a face, or as a closed wire when `makeFace` is false
     * @group racks
     * @shortname rack profile
     * @drawable true
     * @example
     * ```typescript
     * const profile = await bitbybit.occt.parts.mechanical.gears.rackProfile({ module: 0.2, teeth: 12, height: 0.6 });
     * ```
     */
    rackProfile(inputs: Inputs.OCCT.RackProfileDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.RackProfileDto, inputs) as Resolved.OCCT.RackProfileDto;
        checkTeeth(resolved.teeth);
        const makeFace = checkedFlag(resolved.makeFace, "makeFace");
        const pen = gearPen(rackOutline(resolved));
        return this.sketch.pen({ commands: pen.commands, start: pen.start, frame: this.build.frameOf(resolved.frame), makeFace });
    }

    /**
     * Makes an involute rack as a solid: its outline swept `width` along the frame's normal.
     *
     * A spur gear of the same module meshes with it with its centre its pitch radius from the pitch
     * line; turning the gear by an angle moves the rack its pitch radius times the angle in radians.
     * @param inputs - The teeth, the height, the width and the frame
     * @returns A new solid
     * @group racks
     * @shortname rack
     * @drawable true
     * @example
     * ```typescript
     * const rack = await bitbybit.occt.parts.mechanical.gears.rack({ module: 0.2, teeth: 12, height: 0.6, width: 1 });
     * ```
     */
    rack(inputs: Inputs.OCCT.RackDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.RackDto, inputs) as Resolved.OCCT.RackDto;
        return this.madeRack(resolved).shape;
    }

    /**
     * Makes a rack as `rack` does and names the role each face plays.
     *
     * The roles `tip`, `flank`, `root`, `back`, `side` (its two ends), `start` (in the frame's plane)
     * and `end` list face indexes as `shapes.face.getFaces` numbers them. The `pitch` frame sits on
     * the first tooth's middle on the pitch line, along the rack.
     * @param inputs - The teeth, the height, the width and the frame
     * @returns The rack, the faces each role names and its pitch frame
     * @group racks
     * @shortname rack with roles
     * @drawable false
     * @example
     * ```typescript
     * const { shape, roles, frames } = await bitbybit.occt.parts.mechanical.gears.rackWithRoles({ module: 0.2, teeth: 12 });
     * ```
     */
    rackWithRoles(inputs: Inputs.OCCT.RackDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.RackDto, inputs) as Resolved.OCCT.RackDto;
        return this.madeRack(resolved);
    }

    private extruded(face: TopoDS_Shape, edgeRoles: ReadonlyMap<number, string>, frame: Inputs.Base.Frame, width: number): ExtrudedGear {
        const normal = this.build.base.frame.normal({ frame });
        const made = this.operations.extrudeWithHistory({ shape: face, direction: scale3(normal, width) });
        const roles = new Map<number, string>();
        edgeRoles.forEach((role, edge) => made.history.facesFromEdges[edge]?.forEach(index => roles.set(index, role)));
        made.history.firstFaces.forEach(index => roles.set(index, START_ROLE));
        made.history.lastFaces.forEach(index => roles.set(index, END_ROLE));
        return { shape: made.shape, roles };
    }

    private madeSpur(resolved: Resolved.OCCT.SpurGearDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        checkTeeth(resolved.teeth);
        const spec = resolved;
        return this.madeToothed(resolved, () => this.build.base.engineering.mechanical.gears.spurGearSizes(spec).rootRadius, (frame, rotation, width) => {
            const outline = spurGearOutline(spec, [0, 0], rotation);
            const first = this.outlineWire(outline, frame);
            const last = releasedOnError([first.wire], () => this.outlineWire(outline, this.build.along(frame, width)));
            const side = releasedOnError([first.wire, last.wire], () => this.extrudedWire(first, frame, width));
            return { sides: [side], first: first.wire, last: last.wire };
        }, (frame, rotation, width) => {
            const profile = this.outlineDrawn(spurGearOutline(spec, [0, 0], rotation), frame, true);
            try {
                return this.extruded(profile.wire, profile.edgeRoles, frame, width);
            } finally {
                profile.wire.delete();
            }
        });
    }

    private madeHelical(resolved: Resolved.OCCT.HelicalGearDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        checkTeeth(resolved.teeth);
        const spec = resolved;
        const herringbone = checkedFlag(resolved.herringbone, "herringbone");
        const sizes = this.build.base.engineering.mechanical.gears.helicalGearSizes(spec);
        const runs = (frame: Inputs.Base.Frame, rotation: number, width: number): GearSection[][] => this.helicalRuns(spec, sizes.twist, herringbone, frame, rotation, width);
        return this.madeToothed(
            resolved,
            () => sizes.rootRadius,
            (frame, rotation, width) => this.loftedSides(runs(frame, rotation, width)),
            herringbone ? undefined : (frame, rotation, width) => this.loftedSolid(runs(frame, rotation, width)[0]!),
        );
    }

    private helicalRuns(spec: HelicalGearSpec, twist: number, herringbone: boolean, frame: Inputs.Base.Frame, rotation: number, width: number): GearSection[][] {
        const station = (along: number, turn: number): GearSection => ({ outline: helicalGearOutline(spec, [0, 0], rotation + turn), frame: this.build.along(frame, along) });
        const half = herringbone ? width / 2 : width;
        const turned = Math.abs(twist * half);
        const steps = Math.max(MIN_TWIST_STEPS, Math.ceil(turned / TWIST_STEP));
        if (steps > MOST_TWIST_SECTIONS) {
            throw new InputError(`\`width\` twists the teeth through ${String(Math.round(turned))} degrees, more than the ${String(MOST_TWIST_SECTIONS * TWIST_STEP)} a helical gear is lofted through: make it narrower or its \`helixAngle\` smaller.`, "width");
        }
        const shares = Array.from({ length: steps + 1 }, (_, index) => index / steps);
        const leading = shares.map(share => station(half * share, twist * half * share));
        return herringbone ? [leading, shares.map(share => station(half * (1 + share), twist * half * (1 - share)))] : [leading];
    }

    private drawnSections(sections: readonly GearSection[], made: TopoDS_Shape[]): RoledWire[] {
        return sections.map(section => {
            const drawn = this.outlineWire(section.outline, section.frame);
            made.push(drawn.wire);
            return drawn;
        });
    }

    private loftedSolid(sections: readonly GearSection[]): ExtrudedGear {
        const made: TopoDS_Shape[] = [];
        try {
            const drawn = this.drawnSections(sections, made);
            const lofted = this.operations.loftWithHistory({ shapes: drawn.map(each => each.wire), makeSolid: true });
            const roles = this.sectionRoles(lofted.histories[0]!, drawn[0]!);
            lofted.histories[0]!.firstFaces.forEach(face => roles.set(face, START_ROLE));
            lofted.histories[lofted.histories.length - 1]!.lastFaces.forEach(face => roles.set(face, END_ROLE));
            return { shape: lofted.shape, roles };
        } finally {
            made.forEach(release);
        }
    }

    private loftedSides(runs: readonly GearSection[][]): GearSides {
        const made: TopoDS_Shape[] = [];
        try {
            const lofted = runs.map(run => {
                const drawn = this.drawnSections(run, made);
                const side = this.operations.loftWithHistory({ shapes: drawn.map(each => each.wire), makeSolid: false });
                made.push(side.shape);
                return { side: { shape: side.shape, roles: this.sectionRoles(side.histories[0]!, drawn[0]!) }, first: drawn[0]!.wire, last: drawn[drawn.length - 1]!.wire };
            });
            const sides: GearSides = { sides: lofted.map(each => each.side), first: lofted[0]!.first, last: lofted[lofted.length - 1]!.last };
            const kept = new Set<TopoDS_Shape>([sides.first, sides.last, ...sides.sides.map(side => side.shape)]);
            made.filter(shape => !kept.has(shape)).forEach(release);
            return sides;
        } catch (error) {
            made.forEach(release);
            throw error;
        }
    }

    private sectionRoles(history: Models.OCCT.ShapeHistory, section: RoledWire): Map<number, string> {
        const roles = new Map<number, string>();
        section.edgeRoles.forEach((role, edge) => history.facesFromEdges[edge]?.forEach(face => roles.set(face, role)));
        return roles;
    }

    private outlineWire(outline: GearOutline, frame: Inputs.Base.Frame): RoledWire {
        return this.outlineDrawn(outline, frame, false);
    }

    private outlineDrawn(outline: GearOutline | RackOutline, frame: Inputs.Base.Frame, makeFace: boolean): RoledWire {
        const pen = gearPen(outline);
        const drawn = this.sketch.penWithSegments({ commands: pen.commands, start: pen.start, frame, makeFace });
        const edgeRoles = new Map<number, string>();
        drawn.segments.forEach(segment => segment.edges.forEach(edge => edgeRoles.set(edge, outline.moves[segment.command]!.part)));
        return { wire: drawn.shape, edgeRoles };
    }

    private extrudedWire(roled: RoledWire, frame: Inputs.Base.Frame, distance: number): ExtrudedGear {
        const normal = this.build.base.frame.normal({ frame });
        const made = this.operations.extrudeWithHistory({ shape: roled.wire, direction: scale3(normal, distance) });
        const roles = new Map<number, string>();
        roled.edgeRoles.forEach((role, edge) => made.history.facesFromEdges[edge]?.forEach(face => roles.set(face, role)));
        return { shape: made.shape, roles };
    }

    private cap(outer: TopoDS_Shape, hole: TopoDS_Shape | undefined, role: string): ExtrudedGear {
        return { shape: this.build.faceWithHoles(outer, hole === undefined ? [] : [hole]), roles: new Map([[0, role]]) };
    }

    private solidOf(parts: readonly ExtrudedGear[], module: number): ExtrudedGear {
        const made = this.shapes.solid.fromFacesWithHistory({ shapes: parts.map(part => part.shape), tolerance: module * PART_SEW_SHARE });
        const roles = new Map<number, string>();
        parts.forEach((part, index) => part.roles.forEach((role, face) => made.histories[index]?.faces[face]?.forEach(after => roles.set(after, role))));
        return { shape: made.shape, roles };
    }

    private boreWire(frame: Inputs.Base.Frame, rotation: number, bore: number, key: ParallelKeySizes | undefined): RoledWire {
        const radians = this.build.base.math.degToRad({ number: rotation });
        const at = (along: number, across: number): Inputs.Base.Point2 => rotated2([along, across], radians);
        const radius = bore / 2;
        if (key === undefined) {
            const normal = this.build.base.frame.normal({ frame });
            return { wire: this.shapes.wire.createCircleWire({ radius, center: frame.origin, direction: normal }), edgeRoles: new Map([[0, BORE_ROLE]]) };
        }
        const arc = (through: Inputs.Base.Point2, to: Inputs.Base.Point2): Models.OCCT.SketchCommand => ({ type: "threePointArc", through, to, relative: false });
        const line = (to: Inputs.Base.Point2): Models.OCCT.SketchCommand => ({ type: "line", to, relative: false });
        const half = key.width / 2;
        const inner = Math.sqrt(radius * radius - half * half);
        const reach = radius + key.hubDepth;
        const start = at(inner, -half);
        const commands = [line(at(reach, -half)), line(at(reach, half)), line(at(inner, half)), arc(at(-radius, 0), at(inner, -half))];
        const drawn = this.sketch.penWithSegments({ commands, start, frame, makeFace: false });
        const edgeRoles = new Map<number, string>();
        drawn.segments.forEach(segment => segment.edges.forEach(edge => edgeRoles.set(edge, commands[segment.command]!.type === "line" ? KEYWAY_ROLE : BORE_ROLE)));
        return { wire: drawn.shape, edgeRoles };
    }

    private madeToothed(resolved: ToothedGearInputs, rootRadius: () => number, sides: GearBody, plain: PlainGearBody | undefined): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const width = checkedWithin(resolved.width, "width", { above: 0 });
        const bore = checkedWithin(resolved.bore, "bore", { atLeast: 0 });
        const hub = checkedWithin(resolved.hub, "hub", { atLeast: 0 });
        const hubLength = checkedWithin(resolved.hubLength, "hubLength", { atLeast: 0 });
        const keyway = checkedFlag(resolved.keyway, "keyway");
        const rotation = checkedWithin(resolved.rotation, "rotation", {});
        const root = rootRadius();
        if (bore / 2 >= root) {
            throw new InputError("`bore` reaches the root circle of the teeth: make it smaller than the root diameter.", "bore");
        }
        if (hub > 0 && !(hub > bore && hub / 2 < root && hubLength > 0)) {
            throw new InputError("A hub's diameter lies between the bore and the root diameter, and it stands out by a `hubLength` above 0.", hub / 2 >= root || hub <= bore ? "hub" : "hubLength");
        }
        const key = keyway ? this.keyFor(bore) : undefined;
        if (key !== undefined && !(bore / 2 + key.hubDepth < (hub > 0 ? Math.min(root, hub / 2) : root))) {
            throw new InputError(`The keyway reaches ${String(bore / 2 + key.hubDepth)} from the axis, out to the ${hub > 0 ? "hub's outside" : "root circle"}: give the gear a larger ${hub > 0 ? "`hub`" : "root"} or a smaller \`bore\`.`, "keyway");
        }
        const frame = this.build.frameOf(resolved.frame);
        const frames = { [AXIS_FRAME]: this.build.base.frame.rotate({ frame, axis: Inputs.Frame.frameAxisEnum.z, angle: rotation }) };
        if (bore === 0 && hub === 0 && plain !== undefined) {
            const made = plain(frame, rotation, width);
            return { shape: made.shape, roles: this.grouped(made.roles), frames };
        }
        const made = this.assembled(sides(frame, rotation, width), frame, rotation, { width, bore, hub, hubLength, key, module: resolved.module });
        return { shape: made.shape, roles: this.grouped(made.roles), frames };
    }

    private assembled(sides: GearSides, frame: Inputs.Base.Frame, rotation: number, sizes: ToothedSizes): ExtrudedGear {
        const { width, bore, hub, hubLength, key } = sizes;
        const normal = this.build.base.frame.normal({ frame });
        const top = width + (hub > 0 ? hubLength : 0);
        const parts: ExtrudedGear[] = [...sides.sides];
        const wires: TopoDS_Shape[] = [sides.first, sides.last];
        const bored = (distance: number): RoledWire | undefined => {
            if (!(bore > 0)) {
                return undefined;
            }
            const made = this.boreWire(this.build.along(frame, distance), rotation, bore, key);
            wires.push(made.wire);
            return made;
        };
        const circle = (distance: number, radius: number): TopoDS_Shape => {
            const made = this.shapes.wire.createCircleWire({ radius, center: this.build.along(frame, distance).origin, direction: normal });
            wires.push(made);
            return made;
        };
        try {
            const start = bored(0);
            parts.push(this.cap(sides.first, start?.wire, START_ROLE));
            if (hub > 0) {
                const hubEnd = circle(width, hub / 2);
                parts.push(this.cap(sides.last, hubEnd, END_ROLE));
                parts.push(this.extrudedWire({ wire: hubEnd, edgeRoles: new Map([[0, HUB_ROLE]]) }, this.build.along(frame, width), hubLength));
                parts.push(this.cap(circle(top, hub / 2), bored(top)?.wire, HUB_ROLE));
            } else {
                parts.push(this.cap(sides.last, bored(width)?.wire, END_ROLE));
            }
            if (start !== undefined) {
                parts.push(this.extrudedWire(start, frame, top));
            }
            return this.solidOf(parts, sizes.module);
        } finally {
            parts.forEach(part => part.shape.delete());
            wires.forEach(wire => wire.delete());
        }
    }

    private madeBevel(resolved: Resolved.OCCT.BevelGearDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        checkTeeth(resolved.teeth);
        const spec = resolved;
        const sizes = this.build.base.engineering.mechanical.gears.bevelGearSizes(spec);
        const faceWidth = checkedWithin(resolved.faceWidth, "faceWidth", { above: 0 });
        const bore = checkedWithin(resolved.bore, "bore", { atLeast: 0 });
        const rotation = checkedWithin(resolved.rotation, "rotation", {});
        const frame = this.build.frameOf(resolved.frame);
        if (faceWidth > sizes.coneDistance * BEVEL_FACE_SHARE) {
            throw new InputError(`\`faceWidth\` is more than a third of the cone distance, ${String(sizes.coneDistance)}, where the teeth near the apex grow too small.`, "faceWidth");
        }
        const cone = this.build.base.math.degToRad({ number: sizes.pitchConeAngle });
        const height = sizes.apexDistance;
        const depth = sizes.pitchRadius * Math.tan(cone);
        const slant = sizes.pitchRadius / Math.cos(cone);
        const land = spec.module * BEVEL_LAND;
        const near = (sizes.coneDistance - faceWidth) / sizes.coneDistance;
        const onBack = (from: number): Inputs.Base.Point2 => [from * Math.cos(cone), height + depth - from * Math.sin(cone)];
        const backLand = onBack(slant - spec.module * spec.dedendum - land);
        const backTip = onBack(slant + spec.module * spec.addendum + land);
        if (!(backTip[1] > 0)) {
            throw new InputError("The teeth reach past the apex: give the gear more `teeth` or a smaller `addendum`.", "teeth");
        }
        if (!(bore / 2 < backLand[0] * near)) {
            throw new InputError("`bore` reaches the roots at the front: make it smaller or the `faceWidth` shorter.", "bore");
        }
        const { own, releaseAll } = kernelObjects();
        const parts: ExtrudedGear[] = [];
        try {
            const back = this.backConeWire(bevelGearOutline(spec, [0, 0], rotation), cone, height, sizes.pitchRadius);
            own(back.wire);
            const front = own(this.build.scaled(back.wire, near));
            const sides = this.operations.loftAdvancedWithHistory({ shapes: [back.wire, front], makeSolid: false, straight: true });
            parts.push({ shape: sides.shape, roles: this.sectionRoles(sides.histories[0]!, back) });
            const ends: [Inputs.Base.Point2, Inputs.Base.Point2, number, string, TopoDS_Shape][] = [[backLand, backTip, 1, BACK_ROLE, back.wire], [backLand, backTip, near, FRONT_ROLE, front]];
            ends.forEach(([inner, outer, scale, role, teeth]) => {
                const [landRadius, landZ] = scale2(inner, scale);
                const generatrix = own(this.shapes.edge.line({ start: [landRadius, 0, landZ], end: [outer[0] * scale, 0, outer[1] * scale] }));
                const coneFace = own(this.operations.revolve({ shape: generatrix, angle: 360, direction: [0, 0, 1], copy: false }));
                const landCircle = own(this.shapes.wire.createCircleWire({ radius: landRadius, center: [0, 0, landZ], direction: [0, 0, 1] }));
                parts.push({ shape: this.shapes.face.createFaceBoundedByWiresOnFace({ face: coneFace, wires: [teeth, landCircle] }), roles: new Map([[0, role]]) });
                parts.push(this.cap(landCircle, bore > 0 ? own(this.shapes.wire.createCircleWire({ radius: bore / 2, center: [0, 0, landZ], direction: [0, 0, 1] })) : undefined, role));
            });
            if (bore > 0) {
                const bottom = backLand[1] * near;
                const boreCircle = own(this.shapes.wire.createCircleWire({ radius: bore / 2, center: [0, 0, bottom], direction: [0, 0, 1] }));
                parts.push(this.extrudedWire({ wire: boreCircle, edgeRoles: new Map([[0, BORE_ROLE]]) }, { origin: [0, 0, bottom], normal: [0, 0, 1], direction: [1, 0, 0] }, backLand[1] - bottom));
            }
            const made = this.solidOf(parts, spec.module);
            const apex = this.build.base.frame.rotate({ frame, axis: Inputs.Frame.frameAxisEnum.z, angle: rotation });
            const backFrame = this.build.along(apex, backLand[1]);
            return { shape: this.build.oriented(made.shape, frame), roles: this.grouped(made.roles), frames: { [APEX_FRAME]: apex, [BACK_FRAME]: backFrame } };
        } finally {
            parts.forEach(part => part.shape.delete());
            releaseAll();
        }
    }

    private backConeWire(outline: GearOutline, cone: number, height: number, pitchRadius: number): RoledWire {
        const reach = pitchRadius * Math.sin(cone) + height * Math.cos(cone);
        const lift = (point: Inputs.Base.Point2): Inputs.Base.Point3 => {
            const scale = reach / (length2(point) * Math.sin(cone) + height * Math.cos(cone));
            return [...scale2(point, scale), height * scale];
        };
        const edges: TopoDS_Shape[] = [];
        const edgeRoles = new Map<number, string>();
        let from = outline.start;
        try {
            outline.moves.forEach((move, index) => {
                edges.push(this.backConeEdge(from, move, lift));
                edgeRoles.set(index, move.part);
                from = move.to;
            });
            return { wire: this.shapes.wire.combineEdgesAndWiresIntoAWire({ shapes: edges }), edgeRoles };
        } finally {
            edges.forEach(edge => edge.delete());
        }
    }

    private backConeEdge(from: Inputs.Base.Point2, move: GearMove, lift: (point: Inputs.Base.Point2) => Inputs.Base.Point3): TopoDS_Shape {
        if (move.kind === "line") {
            return this.shapes.edge.line({ start: lift(from), end: lift(move.to) });
        }
        if (move.kind === "arc" && Math.abs(length2(move.through) - length2(from)) <= length2(from) * SAME_RADIUS_SHARE && Math.abs(length2(move.to) - length2(from)) <= length2(from) * SAME_RADIUS_SHARE) {
            return this.shapes.edge.arcThroughThreePoints({ start: lift(from), middle: lift(move.through), end: lift(move.to) });
        }
        return this.shapes.wire.interpolatePoints({ points: gearMovePoints([from[0], from[1], 0], move, BEVEL_CURVE_SAMPLES).map(point => lift([point[0], point[1]])), periodic: false });
    }

    private keyFor(bore: number): ParallelKeySizes {
        if (!(bore > 0)) {
            throw new InputError("A keyway runs along the bore: give the gear a `bore` first.", "keyway");
        }
        try {
            return this.build.base.engineering.mechanical.keys.parallelKeySizes({ shaftDiameter: bore });
        } catch (error) {
            if (error instanceof InputError) {
                throw new InputError(`A keyway sized for the bore: ${error.message}`, "bore");
            }
            throw error;
        }
    }

    private madeRack(resolved: Resolved.OCCT.RackDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        checkTeeth(resolved.teeth);
        const width = checkedWithin(resolved.width, "width", { above: 0 });
        const outline = rackOutline(resolved);
        const frame = this.build.frameOf(resolved.frame);
        const profile = this.outlineDrawn(outline, frame, true);
        let extruded: ExtrudedGear;
        try {
            extruded = this.extruded(profile.wire, profile.edgeRoles, frame, width);
        } finally {
            profile.wire.delete();
        }
        return { shape: extruded.shape, roles: this.grouped(extruded.roles), frames: { [PITCH_FRAME]: this.build.base.frame.create(frame) } };
    }

    private ringFace(outline: GearOutline, outerRadius: number, frame: Inputs.Base.Frame): RingFace {
        const teeth = this.outlineDrawn(outline, frame, false);
        const rim = releasedOnError([teeth.wire], () => this.shapes.wire.createCircleWire({ radius: outerRadius, center: frame.origin, direction: this.build.base.frame.normal({ frame }) }));
        const owned: TopoDS_Shape[] = [teeth.wire, rim];
        try {
            const face = this.build.faceWithHoles(rim, [teeth.wire]);
            const faceEdges = this.shapes.edge.getEdges({ shape: face });
            const teethEdges = this.shapes.edge.getEdges({ shape: teeth.wire });
            owned.push(...faceEdges, ...teethEdges);
            const edgeRoles = new Map<number, string>(faceEdges.map((_, index) => [index, RIM_ROLE]));
            teethEdges.forEach((teethEdge, edge) => {
                const role = teeth.edgeRoles.get(edge);
                const found = faceEdges.findIndex(faceEdge => faceEdge.IsSame(teethEdge));
                if (role !== undefined && found >= 0) {
                    edgeRoles.set(found, role);
                }
            });
            return { face, edgeRoles };
        } finally {
            owned.forEach(shape => shape.delete());
        }
    }

    private madeRing(resolved: Resolved.OCCT.RingGearDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        checkTeeth(resolved.teeth);
        const width = checkedWithin(resolved.width, "width", { above: 0 });
        const rotation = checkedWithin(resolved.rotation, "rotation", {});
        const spec = resolved;
        const outline = ringGearOutline(spec, [0, 0], rotation);
        const outer = this.build.base.engineering.mechanical.gears.ringGearSizes(spec).rootRadius + checkedWithin(resolved.rim, "rim", { above: 0 });
        const frame = this.build.frameOf(resolved.frame);
        const profile = this.ringFace(outline, outer, frame);
        try {
            const extruded = this.extruded(profile.face, profile.edgeRoles, frame, width);
            return { shape: extruded.shape, roles: this.grouped(extruded.roles), frames: { [AXIS_FRAME]: this.build.base.frame.rotate({ frame, axis: Inputs.Frame.frameAxisEnum.z, angle: rotation }) } };
        } finally {
            profile.face.delete();
        }
    }

    private grouped(roles: ReadonlyMap<number, string>): Record<string, number[]> {
        const grouped: Record<string, number[]> = {};
        [...roles.keys()].sort((a, b) => a - b).forEach(face => {
            const role = roles.get(face)!;
            grouped[role] = [...(grouped[role] ?? []), face];
        });
        return grouped;
    }
}
