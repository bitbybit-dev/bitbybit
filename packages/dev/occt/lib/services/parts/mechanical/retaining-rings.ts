import type { TopoDS_Shape } from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { resolveDto } from "@bitbybit-dev/base";
import * as Inputs from "../../../api/inputs";
import type * as Models from "../../../api/models";
import type * as Resolved from "../../../api/resolved-inputs";
import { retainingRingRule } from "./machine-element-faces";
import { WORLD_FRAME } from "../../base/frames";
import type { PartBuilder } from "../part-builder";
import { FACE_TOLERANCE_SHARE, LUG_HOLE_MARGIN } from "../parts.constants";

/**
 * DIN 471 retaining rings for shafts and DIN 472 rings for bores, made from their sizes in
 * millimetres and drawn as they sit fitted in their groove, so a ring touches the groove's bottom
 * instead of overlapping it. The lugs and their holes follow a maker's usual shape, which the
 * standards leave open. Each has a twin that names its faces and gives its `centre` frame.
 */
export class OCCTRetainingRings {

    constructor(private readonly build: PartBuilder) { }

    /**
     * Makes a DIN 471 retaining ring for a shaft or a DIN 472 ring for a bore, fitted in its groove.
     *
     * Its centre lies on the frame's origin, one side on the frame's plane, it rises along the normal
     * and its lugs point along the direction.
     * @param inputs - Shaft or bore, its diameter and the frame
     * @returns A new solid
     * @group circlips
     * @shortname retaining ring
     * @drawable true
     * @example
     * ```typescript
     * const clip = await bitbybit.occt.parts.mechanical.retainingRings.retainingRing({ kind: Bit.Inputs.Engineering.retainingRingKindEnum.shaft, diameter: 20 });
     * ```
     */
    retainingRing(inputs: Inputs.OCCT.RetainingRingDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.RetainingRingDto, inputs) as Resolved.OCCT.RetainingRingDto;
        return this.ring(resolved).shape;
    }

    /**
     * Makes a retaining ring as `retainingRing` does and names the role each face plays.
     *
     * The roles `seat` (the face in the groove), `rim`, `start`, `end`, `gap` and `lug` (the plier
     * holes) list face indexes as `shapes.face.getFaces` numbers them. The `centre` frame is the
     * input frame.
     * @param inputs - Shaft or bore, its diameter and the frame
     * @returns The ring, the faces each role names and its centre
     * @group circlips
     * @shortname retaining ring with roles
     * @drawable false
     * @example
     * ```typescript
     * const { shape, roles } = await bitbybit.occt.parts.mechanical.retainingRings.retainingRingWithRoles({ kind: Bit.Inputs.Engineering.retainingRingKindEnum.bore, diameter: 47 });
     * ```
     */
    retainingRingWithRoles(inputs: Inputs.OCCT.RetainingRingDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.RetainingRingDto, inputs) as Resolved.OCCT.RetainingRingDto;
        return this.ring(resolved);
    }

    private ring(resolved: Resolved.OCCT.RetainingRingDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const sizes = this.build.base.engineering.mechanical.retainingRings.retainingRingSizes({ kind: resolved.kind, diameter: resolved.diameter });
        const onShaft = resolved.kind === Inputs.Engineering.retainingRingKindEnum.shaft;
        const seat = sizes.grooveDiameter / 2;
        const middle = (sizes.lugWidth + sizes.sectionWidth) / 2;
        const offset = (sizes.lugWidth - sizes.sectionWidth) / 2;
        const [outerCentre, outerRadius] = onShaft ? [offset, seat + middle] : [0, seat];
        const [innerCentre, innerRadius] = onShaft ? [0, seat] : [-offset, seat - middle];
        const holeRadius = sizes.lugHoleDiameter / 2;
        const gap = holeRadius;
        const outerTop = outerCentre + Math.sqrt(outerRadius * outerRadius - gap * gap);
        const innerTop = innerCentre + Math.sqrt(innerRadius * innerRadius - gap * gap);
        const lugCentre = onShaft ? seat + sizes.lugWidth / 2 : seat - sizes.lugWidth / 2;
        const across = gap + holeRadius + LUG_HOLE_MARGIN * sizes.lugHoleDiameter;
        const along = Math.sqrt(lugCentre * lugCentre - across * across);
        const outline = this.build.sketch.pen({
            commands: [
                { type: "threePointArc", through: [outerCentre - outerRadius, 0], to: [outerTop, -gap], relative: false },
                { type: "line", to: [innerTop, -gap], relative: false },
                { type: "threePointArc", through: [innerCentre - innerRadius, 0], to: [innerTop, gap], relative: false },
                { type: "close" },
            ],
            start: [outerTop, gap],
            frame: WORLD_FRAME,
            makeFace: false,
        });
        const wires: TopoDS_Shape[] = [outline];
        let face: TopoDS_Shape;
        try {
            [-across, across].forEach(y => wires.push(this.build.shapes.wire.createCircleWire({ radius: holeRadius, center: [along, y, 0], direction: [0, 0, 1] })));
            face = this.build.faceWithHoles(outline, wires.slice(1));
        } finally {
            wires.forEach(wire => wire.delete());
        }
        let shape: TopoDS_Shape;
        try {
            shape = this.build.operations.extrude({ shape: face, direction: [0, 0, sizes.thickness] });
        } finally {
            face.delete();
        }
        return this.build.named(shape, retainingRingRule(seat, sizes.thickness, sizes.lugHoleDiameter, sizes.nominal * FACE_TOLERANCE_SHARE), resolved.frame, "centre");
    }
}
