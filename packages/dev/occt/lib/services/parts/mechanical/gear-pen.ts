import { InputError } from "@bitbybit-dev/base";
import type { GearMove, RackMove } from "@bitbybit-dev/base";
import type { GearOutline, RackOutline } from "@bitbybit-dev/base/lib/api/gears/gear-types";
import type * as Models from "../../../api/models";
import type { GearPen } from "../parts-types";
import { MOST_TEETH } from "../parts.constants";

const PART_SEPARATOR = ".";

const commandOf = (move: GearMove | RackMove, id: string): Models.OCCT.SketchCommand => {
    switch (move.kind) {
        case "line":
            return { type: "line", id, to: move.to, relative: false };
        case "arc":
            return { type: "threePointArc", id, through: move.through, to: move.to, relative: false };
        default:
            return { type: "cubic", id, control1: move.control1, control2: move.control2, to: move.to, relative: false };
    }
};

export function gearPen(outline: GearOutline | RackOutline): GearPen {
    return {
        start: outline.start,
        commands: outline.moves.map((move, index) => commandOf(move, `${move.part}${PART_SEPARATOR}${String(index)}`)),
    };
}

export function checkTeeth(teeth: number): void {
    if (teeth > MOST_TEETH) {
        throw new InputError(`\`teeth\` is ${String(teeth)}, and a gear is drawn with at most ${String(MOST_TEETH)} teeth.`, "teeth");
    }
}
