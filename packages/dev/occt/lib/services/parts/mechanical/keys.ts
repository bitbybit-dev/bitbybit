import type { TopoDS_Shape } from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { InputError, resolveDto } from "@bitbybit-dev/base";
import * as Inputs from "../../../api/inputs";
import type * as Models from "../../../api/models";
import type * as Resolved from "../../../api/resolved-inputs";
import { checkedWithin } from "../../base/input-checks";
import { keyRule } from "./machine-element-faces";
import type { PartBuilder } from "../part-builder";
import { FACE_TOLERANCE_SHARE } from "../parts.constants";

/**
 * Keys that lock a hub to its shaft: DIN 6885 form A parallel keys with round ends, sized by the
 * shaft they sit in. `parallelKeySizes` in base gives the depths of the keyways for them, and the
 * key itself, sunk that deep, cuts the shaft's keyway.
 */
export class OCCTKeys {

    constructor(private readonly build: PartBuilder) { }

    /**
     * Makes a DIN 6885 form A parallel key: a bar with round ends, as wide and high as the standard
     * gives for a shaft of `shaftDiameter`, lying along the frame's direction on its origin.
     *
     * Sunk the shaft's keyway depth below the shaft's surface, the key also serves as the tool that
     * cuts that keyway.
     * @param inputs - The shaft's diameter, the key's length and the frame
     * @returns A new solid
     * @group keys
     * @shortname parallel key
     * @drawable true
     * @example
     * ```typescript
     * const key = await bitbybit.occt.parts.mechanical.keys.parallelKey({ shaftDiameter: 25, length: 28 });
     * ```
     */
    parallelKey(inputs: Inputs.OCCT.ParallelKeyDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.ParallelKeyDto, inputs) as Resolved.OCCT.ParallelKeyDto;
        return this.key(resolved).shape;
    }

    /**
     * Makes a parallel key as `parallelKey` does and names the role each face plays.
     *
     * The roles `bottom`, `top`, `side` and `end` (the round ends) list face indexes as
     * `shapes.face.getFaces` numbers them. The `bottom` frame is the input frame.
     * @param inputs - The shaft's diameter, the key's length and the frame
     * @returns The key, the faces each role names and its bottom
     * @group keys
     * @shortname parallel key with roles
     * @drawable false
     * @example
     * ```typescript
     * const { shape, roles } = await bitbybit.occt.parts.mechanical.keys.parallelKeyWithRoles({ shaftDiameter: 25, length: 28 });
     * ```
     */
    parallelKeyWithRoles(inputs: Inputs.OCCT.ParallelKeyDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.ParallelKeyDto, inputs) as Resolved.OCCT.ParallelKeyDto;
        return this.key(resolved);
    }

    private key(resolved: Resolved.OCCT.ParallelKeyDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const sizes = this.build.base.engineering.mechanical.keys.parallelKeySizes({ shaftDiameter: resolved.shaftDiameter });
        const length = checkedWithin(resolved.length, "length", { above: 0 });
        if (!(length > sizes.width)) {
            throw new InputError(`\`length\` is not more than the key's width, ${String(sizes.width)}, so it has no straight sides.`, "length");
        }
        const half = (length - sizes.width) / 2;
        const radius = sizes.width / 2;
        const shape = this.build.extrudedProfile([
            { type: "line", to: [half, -radius], relative: false },
            { type: "threePointArc", through: [half + radius, 0], to: [half, radius], relative: false },
            { type: "line", to: [-half, radius], relative: false },
            { type: "threePointArc", through: [-half - radius, 0], to: [-half, -radius], relative: false },
        ], [-half, -radius], sizes.height);
        return this.build.named(shape, keyRule(sizes.height, sizes.width * FACE_TOLERANCE_SHARE), resolved.frame, "bottom");
    }
}
