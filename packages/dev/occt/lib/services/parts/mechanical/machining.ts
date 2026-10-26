import type { TopoDS_Shape } from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { resolveDto } from "@bitbybit-dev/base";
import * as Inputs from "../../../api/inputs";
import type * as Resolved from "../../../api/resolved-inputs";
import { checkedShape } from "../../base/input-checks";
import type { MachiningShapes } from "./machining-shapes";
import { OCCTMachiningAnsi } from "./machining-ansi";
import { OCCTMachiningDin } from "./machining-din";
import { OCCTMachiningIso } from "./machining-iso";

/**
 * Machining on round shafts and bores, by the standard that sizes it: `iso` models ISO metric
 * threads, `din` cuts DIN keyways, ring grooves, knurls and splines, and `ansi` cuts their inch
 * counterparts, Unified threads included, each in the unit asked for. Flats, sized by their own
 * depth in model units, sit here beside them; each feature comes as a tool for a design's boolean
 * and as a method that cuts it from a body.
 */
export class OCCTMachining {
    public readonly iso: OCCTMachiningIso;
    public readonly din: OCCTMachiningDin;
    public readonly ansi: OCCTMachiningAnsi;

    constructor(private readonly shapes: MachiningShapes) {
        this.iso = new OCCTMachiningIso(shapes);
        this.din = new OCCTMachiningDin(shapes);
        this.ansi = new OCCTMachiningAnsi(shapes);
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
        return this.shapes.flatCutter(resolved.diameter, resolved.depth, resolved.length, resolved.frame);
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
        return this.shapes.cutFrom(checkedShape(resolved.shape), this.shapes.flatCutter(resolved.diameter, resolved.depth, resolved.length, resolved.frame));
    }
}
