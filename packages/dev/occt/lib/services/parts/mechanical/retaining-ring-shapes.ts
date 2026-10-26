import type { TopoDS_Shape } from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type * as Inputs from "../../../api/inputs";
import type { RetainingRingSizes } from "@bitbybit-dev/base";
import type * as Models from "../../../api/models";
import { retainingRingRule } from "./machine-element-faces";
import { WORLD_FRAME } from "../../base/frames";
import type { PartBuilder } from "../part-builder";
import { FACE_TOLERANCE_SHARE, LUG_HOLE_MARGIN } from "../parts.constants";

export class RetainingRingShapes {

    constructor(readonly build: PartBuilder) { }

    ring(sizes: RetainingRingSizes, onShaft: boolean, placed: Inputs.Base.Frame | undefined): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
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
        return this.build.named(shape, retainingRingRule(seat, sizes.thickness, sizes.lugHoleDiameter, sizes.nominal * FACE_TOLERANCE_SHARE), placed, "centre");
    }
}
