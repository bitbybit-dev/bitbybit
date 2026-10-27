import type { TopoDS_Shape } from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { resolveDto } from "@bitbybit-dev/base";
import * as Inputs from "../../../api/inputs";
import type * as Models from "../../../api/models";
import type * as Resolved from "../../../api/resolved-inputs";
import { releasedOnError } from "../../base/release";
import { springRule } from "./machine-element-faces";
import type { PartBuilder } from "../part-builder";
import { FACE_TOLERANCE_SHARE } from "../parts.constants";

/**
 * Springs made from their wire and coils: compression springs with closed and ground ends, at any
 * length from free to solid, so a spring between two moving parts can be rebuilt at the length the
 * parts leave it.
 */
export class OCCTSprings {

    constructor(private readonly build: PartBuilder) { }

    /**
     * Makes a compression spring with closed and ground ends: a round wire coiled about the frame's
     * normal, its end coils closed onto the next and ground flat, standing on the frame's origin.
     *
     * The active coils share the length the end coils leave, so a shorter `length` compresses the
     * spring; one shorter than solid, every coil touching, is refused.
     * @param inputs - The wire, the coils, the length and the frame
     * @returns A new solid
     * @group springs
     * @shortname compression spring
     * @drawable true
     * @example
     * ```typescript
     * const free = await bitbybit.occt.parts.mechanical.springs.compressionSpring({ wireDiameter: 0.2, diameter: 2, activeCoils: 6, length: 4 });
     * const pressed = await bitbybit.occt.parts.mechanical.springs.compressionSpring({ wireDiameter: 0.2, diameter: 2, activeCoils: 6, length: 2.5 });
     * ```
     */
    compressionSpring(inputs: Inputs.OCCT.CompressionSpringDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.CompressionSpringDto, inputs) as Resolved.OCCT.CompressionSpringDto;
        return this.spring(resolved).shape;
    }

    /**
     * Makes a compression spring as `compressionSpring` does and names the role each face plays.
     *
     * The roles `bottom` and `top` (the ground ends) and `coil` list face indexes as
     * `shapes.face.getFaces` numbers them. The `bottom` frame is the input frame and the `top` frame
     * lies `length` along its normal.
     * @param inputs - The wire, the coils, the length and the frame
     * @returns The spring, the faces each role names and its two ends
     * @group springs
     * @shortname compression spring with roles
     * @drawable false
     * @example
     * ```typescript
     * const { shape, frames } = await bitbybit.occt.parts.mechanical.springs.compressionSpringWithRoles({ length: 3 });
     * console.log(frames["top"]);
     * ```
     */
    compressionSpringWithRoles(inputs: Inputs.OCCT.CompressionSpringDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.CompressionSpringDto, inputs) as Resolved.OCCT.CompressionSpringDto;
        return this.spring(resolved);
    }

    /**
     * Makes the centre line of a compression spring's wire, coiled about the frame's normal as
     * `compressionSpring` coils it, to sweep a wire of another section along.
     *
     * It runs three quarters of a coil past the frame's origin and past `length`: cut the swept solid
     * flat at both to grind its ends.
     * @param inputs - The wire, the coils, the length and the frame
     * @returns A new wire
     * @group springs
     * @shortname compression spring path
     * @drawable true
     * @example
     * ```typescript
     * const path = await bitbybit.occt.parts.mechanical.springs.compressionSpringPath({ wireDiameter: 0.2, diameter: 2, activeCoils: 6, length: 4 });
     * ```
     */
    compressionSpringPath(inputs: Inputs.OCCT.CompressionSpringDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.CompressionSpringDto, inputs) as Resolved.OCCT.CompressionSpringDto;
        const { wireDiameter, diameter, activeCoils, length } = resolved;
        const path = this.build.base.engineering.mechanical.springs.compressionSpringPath({ wireDiameter, diameter, activeCoils, length });
        return this.build.oriented(this.build.shapes.wire.interpolatePoints({ points: path.points }), resolved.frame);
    }

    private spring(resolved: Resolved.OCCT.CompressionSpringDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const { wireDiameter, diameter, activeCoils, length } = resolved;
        const path = this.build.base.engineering.mechanical.springs.compressionSpringPath({ wireDiameter, diameter, activeCoils, length });
        const frame = this.build.frameOf(resolved.frame);
        const shapes = this.build.shapes;
        const wire = shapes.wire.interpolatePoints({ points: path.points });
        try {
            const coiled = this.build.operations.pipeWireCylindrical({ shape: wire, radius: wireDiameter / 2, makeSolid: true, trihedronEnum: Inputs.OCCT.geomFillTrihedronEnum.isFrenet });
            const grinder = releasedOnError([coiled], () => shapes.solid.createCylinder({ radius: diameter, height: length, center: [0, 0, 0], direction: [0, 0, 1] }));
            const ground = this.build.common([coiled, grinder]);
            return this.build.placed([{ shape: ground, rule: springRule(length, wireDiameter * FACE_TOLERANCE_SHARE) }], frame, { bottom: frame, top: this.build.along(frame, length) });
        } finally {
            wire.delete();
        }
    }
}
