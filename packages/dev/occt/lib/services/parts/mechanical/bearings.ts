import type { TopoDS_Shape } from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { resolveDto } from "@bitbybit-dev/base";
import * as Inputs from "../../../api/inputs";
import type * as Models from "../../../api/models";
import type * as Resolved from "../../../api/resolved-inputs";
import { checkedFlag } from "../../base/input-checks";
import { kernelObjects } from "../../base/release";
import { angleOfCosine } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/scalars";
import { polar2 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";
import { ringRule, wholeRule } from "./machine-element-faces";
import type { PartBuilder } from "../part-builder";
import type { CageWall, NamedSolid } from "../parts-types";
import {
    BALL_SHARE, BALL_SPACING, CAGE_HEIGHT_SHARE, CAGE_POCKET_SHARE, CAGE_THICKNESS_SHARE, FACE_TOLERANCE_SHARE, LAND_SHARE, POCKET_LOOP_POINTS, RACE_SHARE, RING_CHAMFER_SHARE, SHIELD_GAP_SHARE,
} from "../parts.constants";

/**
 * Rolling bearings made from their designation: deep groove ball bearings of the 60 and 62 series
 * and the small 62x and 60x sizes, with their rings, balls and cage as separate solids in one
 * compound, and shields if asked for. The balls and the raceways are drawn to typical proportions;
 * a catalogue gives a particular maker's.
 */
export class OCCTBearings {

    constructor(private readonly build: PartBuilder) { }

    /**
     * Makes a deep groove ball bearing as a compound of its inner and outer rings with their
     * raceways, its balls, its cage and, when `shields` is true, a shield on each side.
     *
     * One side lies on the frame's origin and the axis runs along the normal.
     * @param inputs - The designation, whether it has shields and the frame
     * @returns A compound of the bearing's solids
     * @group bearings
     * @shortname ball bearing
     * @drawable true
     * @example
     * ```typescript
     * const bearing = await bitbybit.occt.parts.mechanical.bearings.ballBearing({ designation: Bit.Inputs.Engineering.ballBearingEnum.b6204, shields: true });
     * ```
     */
    ballBearing(inputs: Inputs.OCCT.BallBearingDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.BallBearingDto, inputs) as Resolved.OCCT.BallBearingDto;
        return this.bearing(resolved).shape;
    }

    /**
     * Makes a ball bearing as `ballBearing` does and names the role each face plays.
     *
     * The roles `bore`, `outside`, the rings' sides `innerStart`, `innerEnd`, `outerStart` and
     * `outerEnd`, `innerRing`, `outerRing`, `race`, `ball`, `cage` and `shield` list face indexes as
     * `shapes.face.getFaces` numbers them across the compound. The `axis` frame is the input frame.
     * @param inputs - The designation, whether it has shields and the frame
     * @returns The bearing, the faces each role names and its axis
     * @group bearings
     * @shortname ball bearing with roles
     * @drawable false
     * @example
     * ```typescript
     * const { shape, roles } = await bitbybit.occt.parts.mechanical.bearings.ballBearingWithRoles({ designation: Bit.Inputs.Engineering.ballBearingEnum.b608 });
     * ```
     */
    ballBearingWithRoles(inputs: Inputs.OCCT.BallBearingDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.BallBearingDto, inputs) as Resolved.OCCT.BallBearingDto;
        return this.bearing(resolved);
    }

    private bearing(resolved: Resolved.OCCT.BallBearingDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const { bore, outside, width } = this.build.base.engineering.mechanical.bearings.ballBearingSizes({ designation: resolved.designation });
        const shields = checkedFlag(resolved.shields, "shields");
        const frame = this.build.frameOf(resolved.frame);
        const pitchDiameter = (bore + outside) / 2;
        const pitch = pitchDiameter / 2;
        const ball = BALL_SHARE * (outside - bore);
        const middle = width / 2;
        const chamfer = RING_CHAMFER_SHARE * (outside - bore);
        const tolerance = bore * FACE_TOLERANCE_SHARE;
        const innerLand = pitch - LAND_SHARE * ball;
        const outerLand = pitch + LAND_SHARE * ball;
        const race = RACE_SHARE * ball;
        const reach = Math.sqrt(race * race - (LAND_SHARE * ball) ** 2);
        const line = (to: Inputs.Base.Point2): Models.OCCT.SketchCommand => ({ type: "line", to, relative: false });
        const groove = (through: Inputs.Base.Point2, to: Inputs.Base.Point2): Models.OCCT.SketchCommand => ({ type: "threePointArc", through, to, relative: false });
        const { own: keep, releaseAll } = kernelObjects();
        let parts: NamedSolid[];
        try {
            const inner = keep(this.build.revolvedProfile([
                line([innerLand, 0]), line([innerLand, middle - reach]), groove([pitch - race, middle], [innerLand, middle + reach]), line([innerLand, width]),
                line([bore / 2 + chamfer, width]), line([bore / 2, width - chamfer]), line([bore / 2, chamfer]), { type: "close" },
            ], [bore / 2 + chamfer, 0]));
            const outer = keep(this.build.revolvedProfile([
                line([outside / 2 - chamfer, 0]), line([outside / 2, chamfer]), line([outside / 2, width - chamfer]), line([outside / 2 - chamfer, width]),
                line([outerLand, width]), line([outerLand, middle + reach]), groove([pitch + race, middle], [outerLand, middle - reach]), { type: "close" },
            ], [outerLand, 0]));
            const shieldInside = chamfer + SHIELD_GAP_SHARE * (outside - bore);
            const cageHalf = Math.min(CAGE_HEIGHT_SHARE * ball, middle - shieldInside - SHIELD_GAP_SHARE * ball);
            const count = Math.floor(Math.PI * 2 * pitch / (BALL_SPACING * ball));
            const turns = Array.from({ length: count }, (_, index) => 2 * Math.PI * index / count);
            const centres = turns.map((turn): Inputs.Base.Point3 => [...polar2(pitch, turn), middle]);
            const balls = centres.map(center => keep(this.build.shapes.solid.createSphere({ radius: ball / 2, center })));
            parts = [
                { shape: inner, rule: ringRule(bore / 2, width, { seat: "bore", ring: "innerRing", start: "innerStart", end: "innerEnd" }, tolerance) },
                { shape: outer, rule: ringRule(outside / 2, width, { seat: "outside", ring: "outerRing", start: "outerStart", end: "outerEnd" }, tolerance) },
                ...balls.map(shape => ({ shape, rule: wholeRule("ball") })),
                { shape: keep(this.cage(pitch, middle, ball, cageHalf, centres, turns)), rule: wholeRule("cage") },
                ...(shields ? [chamfer, width - chamfer - SHIELD_GAP_SHARE * (outside - bore)].map(from => ({ shape: keep(this.shield(innerLand, outerLand, from, SHIELD_GAP_SHARE * (outside - bore), ball)), rule: wholeRule("shield") })) : []),
            ];
        } catch (error) {
            releaseAll();
            throw error;
        }
        return this.build.placed(parts, frame, { axis: frame });
    }

    private cage(pitch: number, middle: number, ball: number, height: number, centres: Inputs.Base.Point3[], angles: readonly number[]): TopoDS_Shape {
        const half = CAGE_THICKNESS_SHARE * ball;
        const pocket = CAGE_POCKET_SHARE * ball;
        const { own, releaseAll } = kernelObjects();
        const shapes = this.build.shapes;
        const circle = (radius: number, z: number): TopoDS_Shape => own(shapes.wire.createCircleWire({ radius, center: [0, 0, z], direction: [0, 0, 1] }));
        const loop = (radius: number, angle: number): TopoDS_Shape => {
            const rise = Math.sqrt(pocket * pocket - (radius - pitch) ** 2);
            const points = Array.from({ length: POCKET_LOOP_POINTS }, (_, index): Inputs.Base.Point3 => {
                const t = 2 * Math.PI * index / POCKET_LOOP_POINTS;
                const lift = rise * Math.sin(t);
                const turn = angle + Math.sign(Math.cos(t)) * angleOfCosine((radius * radius + pitch * pitch + lift * lift - pocket * pocket) / (2 * radius * pitch));
                return [...polar2(radius, turn), middle + lift];
            });
            return own(shapes.wire.interpolatePoints({ points, periodic: true }));
        };
        const outer: CageWall = { low: circle(pitch + half, middle - height), high: circle(pitch + half, middle + height), loops: angles.map(angle => loop(pitch + half, angle)) };
        const inner: CageWall = { low: circle(pitch - half, middle - height), high: circle(pitch - half, middle + height), loops: angles.map(angle => loop(pitch - half, angle)) };
        const wall = (radius: number, edges: CageWall): TopoDS_Shape => {
            const side = own(shapes.edge.line({ start: [radius, 0, middle - height], end: [radius, 0, middle + height] }));
            const guide = own(this.build.operations.revolve({ shape: side, angle: 360, direction: [0, 0, 1] }));
            return shapes.face.createFaceBoundedByWiresOnFace({ face: guide, wires: [edges.low, edges.high, ...edges.loops] });
        };
        const zone = (angle: number, index: number): TopoDS_Shape => {
            const across: Inputs.Base.Vector3 = [...polar2(1, angle), 0];
            const sphere = own(this.build.sphereAbout(centres[index]!, across, [0, 0, 1], pocket));
            return shapes.face.createFaceBoundedByWiresOnFace({ face: sphere, wires: [outer.loops[index]!, inner.loops[index]!] });
        };
        try {
            return this.build.solidOfFaces([
                () => wall(pitch + half, outer),
                () => wall(pitch - half, inner),
                () => this.build.faceWithHoles(outer.low, [inner.low]),
                () => this.build.faceWithHoles(outer.high, [inner.high]),
                ...angles.map((angle, index) => (): TopoDS_Shape => zone(angle, index)),
            ], ball);
        } finally {
            releaseAll();
        }
    }

    private shield(innerLand: number, outerLand: number, from: number, thickness: number, ball: number): TopoDS_Shape {
        const gap = SHIELD_GAP_SHARE * ball;
        return this.build.revolved([[innerLand + gap, from], [outerLand - gap, from], [outerLand - gap, from + thickness], [innerLand + gap, from + thickness]]);
    }
}
