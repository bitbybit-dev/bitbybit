import type * as Inputs from "../inputs";
import { InputError } from "../kernel-calls/errors";
import type { RackMove, RackOutline, RackSizes, RackSpec, ArcThrough } from "./gear-types";
import { FILLET_GAP_SHARE, SHARP_FILLET } from "./gears.constants";
import { add2, scale2, subtract2, unit2Of } from "../services/helpers/geometry/vectors";
import { checkedRack, checkedThickness } from "./gear-checks";
import { radiansOf } from "../services/helpers/geometry/scalars";

type Point2 = Inputs.Base.Point2;

export function rackSizes(spec: RackSpec): RackSizes {
    checkedRack(spec);
    const pitch = Math.PI * spec.module;
    checkedThickness(pitch / 2, spec.backlash);
    return { pitch, length: pitch * spec.teeth, tipHeight: spec.module * spec.addendum, rootDepth: spec.module * spec.dedendum, toothThickness: pitch / 2 - spec.backlash };
}

export function rackOutline(spec: RackSpec): RackOutline {
    const sizes = rackSizes(spec);
    const alpha = radiansOf(spec.pressureAngle);
    const half = sizes.toothThickness / 2;
    const tipHalf = half - sizes.tipHeight * Math.tan(alpha);
    const footHalf = half + sizes.rootDepth * Math.tan(alpha);
    if (!(tipHalf > 0)) {
        throw new InputError("The teeth come to a point below their tips: give a smaller `addendum` or `pressureAngle`, or less `backlash`.", "addendum");
    }
    const gapBottom = sizes.pitch - 2 * footHalf;
    if (!(gapBottom > 0)) {
        throw new InputError("The gaps close before their bottoms: give a smaller `dedendum` or `pressureAngle`.", "dedendum");
    }
    const corner = Math.PI / 2 + alpha;
    const wanted = spec.rootFillet * spec.module / Math.tan(corner / 2);
    const tangent = Math.min(wanted, gapBottom / 2 * (1 - FILLET_GAP_SHARE));
    const radius = tangent * Math.tan(corner / 2);
    const up: Point2 = [-Math.sin(alpha), Math.cos(alpha)];
    const fillet = (foot: Point2, along: Point2, flank: Point2): ArcThrough => {
        const bisector = unit2Of(add2(along, flank))!;
        const centre = add2(foot, scale2(bisector, radius / Math.sin(corner / 2)));
        return { from: add2(foot, scale2(along, tangent)), through: subtract2(centre, scale2(bisector, radius)), to: add2(foot, scale2(flank, tangent)) };
    };
    const bottom = -sizes.rootDepth;
    const back = -spec.height;
    const left = -sizes.pitch / 2;
    const right = left + sizes.length;
    const moves: RackMove[] = [
        { kind: "line", to: [right, back], part: "back" },
        { kind: "line", to: [right, bottom], part: "side" },
    ];
    const rounded = radius >= SHARP_FILLET * spec.module;
    for (let tooth = spec.teeth - 1; tooth >= 0; tooth--) {
        const centre = tooth * sizes.pitch;
        const rightFoot: Point2 = [centre + footHalf, bottom];
        const leftFoot: Point2 = [centre - footHalf, bottom];
        const rightRound = fillet(rightFoot, [1, 0], up);
        const leftRound = fillet(leftFoot, [-1, 0], [-up[0], up[1]]);
        moves.push({ kind: "line", to: rounded ? rightRound.from : rightFoot, part: "root" });
        if (rounded) {
            moves.push({ kind: "arc", through: rightRound.through, to: rightRound.to, part: "root" });
        }
        moves.push({ kind: "line", to: [centre + tipHalf, sizes.tipHeight], part: "flank" });
        moves.push({ kind: "line", to: [centre - tipHalf, sizes.tipHeight], part: "tip" });
        moves.push({ kind: "line", to: rounded ? leftRound.to : leftFoot, part: "flank" });
        if (rounded) {
            moves.push({ kind: "arc", through: leftRound.through, to: leftRound.from, part: "root" });
        }
    }
    moves.push({ kind: "line", to: [left, bottom], part: "root" });
    moves.push({ kind: "line", to: [left, back], part: "side" });
    return { start: [left, back], moves };
}
