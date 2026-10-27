import type { TopoDS_Shape } from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { resolveDto } from "@bitbybit-dev/base";
import * as Inputs from "../../../api/inputs";
import type * as Models from "../../../api/models";
import type * as Resolved from "../../../api/resolved-inputs";
import type { RetainingRingShapes } from "./retaining-ring-shapes";

/**
 * Inch tapered retaining rings, external for shafts and internal for bores, made from the shaft's or
 * the bore's diameter in the unit asked for: each ring at its free diameter, with its lugs and the holes
 * the pliers take. `parts.mechanical.machining.ansi.ringGroove` cuts the groove it sits in.
 */
export class OCCTRetainingRingsAnsi {

    constructor(private readonly shapes: RetainingRingShapes) { }

    /**
     * Makes an inch tapered retaining ring, external for a shaft or internal for a bore, fitted in its
     * groove.
     *
     * Its centre lies on the frame's origin, one side on the frame's plane, it rises along the normal
     * and its lugs point along the direction.
     * @param inputs - Shaft or bore, its diameter, the unit and the frame
     * @returns A new solid
     * @group circlips
     * @shortname ansi retaining ring
     * @drawable true
     * @example
     * ```typescript
     * const clip = await bitbybit.occt.parts.mechanical.retainingRings.ansi.retainingRing({ kind: Bit.Inputs.Engineering.retainingRingKindEnum.shaft, diameter: 0.75 });
     * ```
     */
    retainingRing(inputs: Inputs.OCCT.AnsiRetainingRingDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.AnsiRetainingRingDto, inputs) as Resolved.OCCT.AnsiRetainingRingDto;
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
     * @shortname ansi retaining ring with roles
     * @drawable false
     * @example
     * ```typescript
     * const { shape, roles } = await bitbybit.occt.parts.mechanical.retainingRings.ansi.retainingRingWithRoles({ kind: Bit.Inputs.Engineering.retainingRingKindEnum.bore, diameter: 1 });
     * ```
     */
    retainingRingWithRoles(inputs: Inputs.OCCT.AnsiRetainingRingDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.AnsiRetainingRingDto, inputs) as Resolved.OCCT.AnsiRetainingRingDto;
        return this.made(resolved);
    }

    private made(resolved: Resolved.OCCT.AnsiRetainingRingDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const sizes = this.shapes.build.base.engineering.mechanical.retainingRings.ansi.retainingRingSizes({ kind: resolved.kind, diameter: resolved.diameter, unit: resolved.unit });
        return this.shapes.ring(sizes, resolved.kind === Inputs.Engineering.retainingRingKindEnum.shaft, resolved.frame);
    }
}
