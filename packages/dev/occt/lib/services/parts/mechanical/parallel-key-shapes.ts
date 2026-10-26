import type { TopoDS_Shape } from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { InputError } from "@bitbybit-dev/base";
import type * as Inputs from "../../../api/inputs";
import type { ParallelKeySizes } from "@bitbybit-dev/base";
import type * as Models from "../../../api/models";
import { checkedWithin } from "../../base/input-checks";
import { keyRule } from "./machine-element-faces";
import type { PartBuilder } from "../part-builder";
import { FACE_TOLERANCE_SHARE } from "../parts.constants";

export class ParallelKeyShapes {

    constructor(readonly build: PartBuilder) { }

    key(sizes: ParallelKeySizes, along: number, placed: Inputs.Base.Frame | undefined): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const length = checkedWithin(along, "length", { above: 0 });
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
        return this.build.named(shape, keyRule(sizes.height, sizes.width * FACE_TOLERANCE_SHARE), placed, "bottom");
    }
}
