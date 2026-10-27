import type { TopoDS_Shape } from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { resolveDto } from "@bitbybit-dev/base";
import * as Inputs from "../../../api/inputs";
import type * as Models from "../../../api/models";
import type * as Resolved from "../../../api/resolved-inputs";
import type { RetainingRingShapes } from "./retaining-ring-shapes";

/**
 * DIN 471 retaining rings for shafts and DIN 472 rings for bores, made from the shaft's or the bore's
 * diameter in the unit asked for: each ring at its free diameter, with its lugs and the holes the
 * pliers take. `parts.mechanical.machining.din.ringGroove` cuts the groove it sits in.
 */
export class OCCTRetainingRingsDin {

    constructor(private readonly shapes: RetainingRingShapes) { }

    /**
     * Makes a DIN 471 retaining ring for a shaft or a DIN 472 ring for a bore, fitted in its groove.
     *
     * Its centre lies on the frame's origin, one side on the frame's plane, it rises along the normal
     * and its lugs point along the direction.
     * @param inputs - Shaft or bore, its diameter, the unit and the frame
     * @returns A new solid
     * @group circlips
     * @shortname din retaining ring
     * @drawable true
     * @example
     * ```typescript
     * const clip = await bitbybit.occt.parts.mechanical.retainingRings.din.retainingRing({ kind: Bit.Inputs.Engineering.retainingRingKindEnum.shaft, diameter: 20 });
     * ```
     */
    retainingRing(inputs: Inputs.OCCT.DinRetainingRingDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.DinRetainingRingDto, inputs) as Resolved.OCCT.DinRetainingRingDto;
        return this.made(resolved).shape;
    }

    /**
     * Makes a retaining ring as `retainingRing` does and names the role each face plays.
     *
     * The roles `seat` (the face in the groove), `rim`, `start`, `end`, `gap` and `lug` (the plier
     * holes) list face indexes as `shapes.face.getFaces` numbers them. The `centre` frame is the
     * input frame.
     * @param inputs - Shaft or bore, its diameter, the unit and the frame
     * @returns The ring, the faces each role names and its centre
     * @group circlips
     * @shortname din retaining ring with roles
     * @drawable false
     * @example
     * ```typescript
     * const { shape, roles } = await bitbybit.occt.parts.mechanical.retainingRings.din.retainingRingWithRoles({ kind: Bit.Inputs.Engineering.retainingRingKindEnum.bore, diameter: 47 });
     * ```
     */
    retainingRingWithRoles(inputs: Inputs.OCCT.DinRetainingRingDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.DinRetainingRingDto, inputs) as Resolved.OCCT.DinRetainingRingDto;
        return this.made(resolved);
    }

    private made(resolved: Resolved.OCCT.DinRetainingRingDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const sizes = this.shapes.build.base.engineering.mechanical.retainingRings.din.retainingRingSizes({ kind: resolved.kind, diameter: resolved.diameter, unit: resolved.unit });
        return this.shapes.ring(sizes, resolved.kind === Inputs.Engineering.retainingRingKindEnum.shaft, resolved.frame);
    }
}
