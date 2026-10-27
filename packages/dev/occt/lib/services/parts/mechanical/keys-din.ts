import type { TopoDS_Shape } from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { resolveDto } from "@bitbybit-dev/base";
import * as Inputs from "../../../api/inputs";
import type * as Models from "../../../api/models";
import type * as Resolved from "../../../api/resolved-inputs";
import type { ParallelKeyShapes } from "./parallel-key-shapes";

/**
 * DIN 6885 form A parallel keys made for their shaft, in the unit asked for: bars with round ends,
 * as wide and high as the standard gives for the shaft's diameter. Sunk the shaft's keyway depth below
 * its surface, a key also serves as the tool that cuts its keyway.
 */
export class OCCTKeysDin {

    constructor(private readonly shapes: ParallelKeyShapes) { }

    /**
     * Makes a DIN 6885 form A parallel key: a bar with round ends, as wide and high as the standard
     * gives for a shaft of `shaftDiameter`, lying along the frame's direction on its origin.
     *
     * Sunk the shaft's keyway depth below the shaft's surface, the key also serves as the tool that
     * cuts that keyway.
     * @param inputs - The shaft's diameter, the key's length, the unit and the frame
     * @returns A new solid
     * @group keys
     * @shortname din parallel key
     * @drawable true
     * @example
     * ```typescript
     * const key = await bitbybit.occt.parts.mechanical.keys.din.parallelKey({ shaftDiameter: 25, length: 28 });
     * ```
     */
    parallelKey(inputs: Inputs.OCCT.DinParallelKeyDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.DinParallelKeyDto, inputs) as Resolved.OCCT.DinParallelKeyDto;
        return this.made(resolved).shape;
    }

    /**
     * Makes a parallel key as `parallelKey` does and names the role each face plays.
     *
     * The roles `bottom`, `top`, `side` and `end` (the round ends) list face indexes as
     * `shapes.face.getFaces` numbers them. The `bottom` frame is the input frame.
     * @param inputs - The shaft's diameter, the key's length, the unit and the frame
     * @returns The key, the faces each role names and its bottom
     * @group keys
     * @shortname din parallel key with roles
     * @drawable false
     * @example
     * ```typescript
     * const { shape, roles } = await bitbybit.occt.parts.mechanical.keys.din.parallelKeyWithRoles({ shaftDiameter: 25, length: 28 });
     * ```
     */
    parallelKeyWithRoles(inputs: Inputs.OCCT.DinParallelKeyDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.DinParallelKeyDto, inputs) as Resolved.OCCT.DinParallelKeyDto;
        return this.made(resolved);
    }

    private made(resolved: Resolved.OCCT.DinParallelKeyDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const sizes = this.shapes.build.base.engineering.mechanical.keys.din.parallelKeySizes({ shaftDiameter: resolved.shaftDiameter, unit: resolved.unit });
        return this.shapes.key(sizes, resolved.length, resolved.frame);
    }
}
