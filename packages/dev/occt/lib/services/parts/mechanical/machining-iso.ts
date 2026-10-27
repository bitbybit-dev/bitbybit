import type { TopoDS_Shape } from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { resolveDto } from "@bitbybit-dev/base";
import * as Inputs from "../../../api/inputs";
import type * as Resolved from "../../../api/resolved-inputs";
import { checkedFlag, checkedShape } from "../../base/input-checks";
import type { MachiningShapes } from "./machining-shapes";

/**
 * ISO metric threads modelled on shanks and in holes, in the unit asked for: the 60 degree groove
 * swept along a right-hand helix, at the size's coarse pitch or a fine one. Each comes as a tool for
 * a design's boolean and as a method that cuts it from a body.
 */
export class OCCTMachiningIso {

    constructor(private readonly shapes: MachiningShapes) { }

    /**
     * Makes the solid an ISO metric thread removes: the 60 degree groove swept along a right-hand
     * helix.
     *
     * It runs `length` from the frame's origin into the part, against the normal, stopping at the
     * origin's plane. Shanks sit to 6g and holes to 6H: on frames whole pitches apart, the two mesh
     * with play.
     * @param inputs - The size, the pitch, the length, inside or out, the unit and the frame
     * @returns The tool as a solid
     * @group threads
     * @shortname iso thread tool
     * @drawable true
     * @example
     * ```typescript
     * const cutter = await bitbybit.occt.parts.mechanical.machining.iso.threadTool({ size: Bit.Inputs.Engineering.isoThreadSizeEnum.m3, length: 10 });
     * ```
     */
    threadTool(inputs: Inputs.OCCT.IsoThreadToolDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.IsoThreadToolDto, inputs) as Resolved.OCCT.IsoThreadToolDto;
        return this.toolOf(resolved);
    }

    /**
     * Models an ISO metric thread on a shank or in a hole, as `threadTool` places it, instead of the
     * cosmetic thread `parts.mechanical.fasteners.iso` draws.
     *
     * Turn the shank to the nominal diameter, or drill the hole to the minor; a modelled thread is
     * heavy, so keep it to the parts that need it. Its defaults thread a default bolt.
     * @param inputs - The body, the size, the pitch, the length, inside or out, the unit and the frame
     * @returns The threaded body
     * @group threads
     * @shortname iso thread
     * @drawable true
     * @example
     * ```typescript
     * const rod = await bitbybit.occt.shapes.solid.createCylinder({ radius: 4, height: 20, center: [0, -20, 0], direction: [0, 1, 0] });
     * const threaded = await bitbybit.occt.parts.mechanical.machining.iso.thread({ shape: rod, size: Bit.Inputs.Engineering.isoThreadSizeEnum.m8, length: 16 });
     * ```
     */
    thread(inputs: Inputs.OCCT.IsoThreadCutDto<TopoDS_Shape>): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.IsoThreadCutDto, inputs) as Resolved.OCCT.IsoThreadCutDto<TopoDS_Shape>;
        return this.shapes.cutFrom(checkedShape(resolved.shape), this.toolOf(resolved));
    }

    private toolOf(resolved: Resolved.OCCT.IsoThreadToolDto): TopoDS_Shape {
        const thread = this.shapes.build.base.engineering.mechanical.threads.iso.thread({ size: resolved.size, pitch: resolved.pitch, unit: resolved.unit });
        return this.shapes.threads.tool(thread, { length: resolved.length, internal: checkedFlag(resolved.internal, "internal"), unit: resolved.unit, frame: resolved.frame });
    }
}
