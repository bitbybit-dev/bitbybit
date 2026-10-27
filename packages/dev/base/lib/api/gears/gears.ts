import type * as Inputs from "../inputs";
import { InputError } from "../kernel-calls/errors";
import type { FlankPiece, GearMove, GearOutline, GearSizes, RackMove, RackOutline, RingGearSpec, SpurGearSpec } from "./gear-types";
import { FILLET_GAP_SHARE, FIT_TOLERANCE, GAP_MARGIN, SHARP_FILLET } from "./gears.constants";
import { radiansOf } from "../services/helpers/geometry/scalars";
import { arcThroughThreePoints, pointOnCubic3, pointsOnArc } from "../services/helpers/geometry/arcs";
import { checkedTeeth, checkedThickness } from "./gear-checks";
import { angleOf, filletArc, largestFitting, reversedPiece, rootFilletPlace, toothedOutline, topRoundPlace, UpperFlank } from "./involute-flank";
import { polar2 } from "../services/helpers/geometry/vectors";

export function spurGearSizes(spec: SpurGearSpec): GearSizes {
    checkedTeeth(spec);
    if (!Number.isFinite(spec.profileShift)) {
        throw new InputError("`profileShift` is not a number.", "profileShift");
    }
    checkedThickness(spec.module * (Math.PI / 2 + 2 * spec.profileShift * Math.tan(radiansOf(spec.pressureAngle))), spec.backlash);
    return spurSizesOf(spec);
}

export function spurSizesOf(spec: SpurGearSpec): GearSizes {
    const alpha = radiansOf(spec.pressureAngle);
    const pitchRadius = spec.module * spec.teeth / 2;
    const thickness = spec.module * (Math.PI / 2 + 2 * spec.profileShift * Math.tan(alpha)) - spec.backlash;
    return {
        pitchRadius,
        baseRadius: pitchRadius * Math.cos(alpha),
        tipRadius: pitchRadius + spec.module * (spec.addendum + spec.profileShift),
        rootRadius: pitchRadius - spec.module * (spec.dedendum - spec.profileShift),
        halfToothAngle: thickness / (2 * pitchRadius),
    };
}

export const spurFlankPieces = (spec: SpurGearSpec, sizes: GearSizes): FlankPiece[] => {
    const { baseRadius, tipRadius, rootRadius } = sizes;
    if (!(rootRadius > 0)) {
        throw new InputError("The root circle has no size: give more `teeth`, a smaller `dedendum` or a larger `profileShift`.", "teeth");
    }
    if (!(sizes.halfToothAngle > 0)) {
        throw new InputError("`backlash` takes the whole tooth away.", "backlash");
    }
    const flank = new UpperFlank(baseRadius, sizes.halfToothAngle, radiansOf(spec.pressureAngle));
    const tipRoll = flank.rollAt(tipRadius);
    if (!(angleOf(flank.pointAt(tipRoll)) > GAP_MARGIN)) {
        throw new InputError("The teeth come to a point below the tip circle: lower the `profileShift` or the `addendum`.", "profileShift");
    }
    const gapAngle = Math.PI / spec.teeth;
    const sharpRoot = baseRadius > rootRadius ? polar2(rootRadius, flank.baseAngle) : flank.pointAt(flank.rollAt(rootRadius));
    if (!(angleOf(sharpRoot) <= gapAngle - GAP_MARGIN)) {
        throw new InputError("The teeth are too thick to leave a gap at the root: lower the `profileShift` or add `backlash`.", "profileShift");
    }
    const fitted = largestFitting(spec.rootFillet * spec.module, candidate => angleOf(rootFilletPlace(flank, baseRadius, rootRadius, candidate).circlePoint) <= gapAngle * (1 - FILLET_GAP_SHARE));
    const radius = fitted < SHARP_FILLET * spec.module ? 0 : fitted;
    const pieces: FlankPiece[] = [];
    let involuteStart = flank.rollAt(rootRadius);
    if (radius > 0) {
        const place = rootFilletPlace(flank, baseRadius, rootRadius, radius);
        if (!(place.roll < tipRoll)) {
            throw new InputError("`rootFillet` reaches above the tip of the teeth.", "rootFillet");
        }
        pieces.push(filletArc(place, radius, "root"));
        if (place.onLine) {
            pieces.push({ kind: "line", from: place.flankPoint, to: polar2(baseRadius, flank.baseAngle), part: "flank" });
        }
        involuteStart = place.roll;
    } else if (baseRadius > rootRadius) {
        pieces.push({ kind: "line", from: sharpRoot, to: polar2(baseRadius, flank.baseAngle), part: "flank" });
    }
    if (!(tipRadius >= baseRadius)) {
        throw new InputError("The tips of the teeth reach only inside the base circle, where no involute runs: give the gear more `teeth`, a larger `profileShift` or a larger `addendum`.", "profileShift");
    }
    pieces.push(...flank.fitted(involuteStart, tipRoll, FIT_TOLERANCE * spec.module));
    return pieces;
};

export function spurGearOutline(spec: SpurGearSpec, centre: Inputs.Base.Point2 = [0, 0], rotation = 0): GearOutline {
    const sizes = spurGearSizes(spec);
    const upper = spurFlankPieces(spec, sizes);
    return toothedOutline(upper, { top: sizes.tipRadius, topPart: "tip", gap: sizes.rootRadius, gapPart: "root" }, spec.teeth, centre, radiansOf(rotation));
}

export function ringGearSizes(spec: RingGearSpec): GearSizes {
    checkedTeeth(spec);
    checkedThickness(spec.module * Math.PI / 2, spec.backlash);
    const pitchRadius = spec.module * spec.teeth / 2;
    return {
        pitchRadius,
        baseRadius: pitchRadius * Math.cos(radiansOf(spec.pressureAngle)),
        tipRadius: pitchRadius - spec.module * spec.addendum,
        rootRadius: pitchRadius + spec.module * spec.dedendum,
        halfToothAngle: (spec.module * Math.PI / 2 - spec.backlash) / (2 * pitchRadius),
    };
}

const ringGapFlankPieces = (spec: RingGearSpec, sizes: GearSizes): FlankPiece[] => {
    const { baseRadius, tipRadius, rootRadius } = sizes;
    if (!(sizes.halfToothAngle > 0)) {
        throw new InputError("`backlash` takes the whole tooth away.", "backlash");
    }
    if (!(tipRadius >= baseRadius)) {
        throw new InputError("The tips of the teeth reach inside the base circle, where no involute runs: give the ring more `teeth` or a smaller `addendum`.", "teeth");
    }
    const gapAngle = Math.PI / spec.teeth;
    const flank = new UpperFlank(baseRadius, gapAngle - sizes.halfToothAngle, radiansOf(spec.pressureAngle));
    const tipRoll = flank.rollAt(tipRadius);
    const rootRoll = flank.rollAt(rootRadius);
    if (!(angleOf(flank.pointAt(rootRoll)) > GAP_MARGIN)) {
        throw new InputError("The gaps come to a point inside the root circle: lower the `dedendum`.", "dedendum");
    }
    if (!(angleOf(flank.pointAt(tipRoll)) <= gapAngle - GAP_MARGIN)) {
        throw new InputError("The teeth come to a point before they reach the tip circle: lower the `addendum`.", "addendum");
    }
    const radius = largestFitting(spec.rootFillet * spec.module, candidate => {
        if (!(rootRadius - candidate > baseRadius)) {
            return false;
        }
        const place = topRoundPlace(flank, baseRadius, rootRadius, candidate);
        return place.roll > tipRoll && angleOf(place.centre) >= gapAngle * FILLET_GAP_SHARE;
    });
    if (radius < SHARP_FILLET * spec.module) {
        return flank.fitted(tipRoll, rootRoll, FIT_TOLERANCE * spec.module);
    }
    const place = topRoundPlace(flank, baseRadius, rootRadius, radius);
    return [...flank.fitted(tipRoll, place.roll, FIT_TOLERANCE * spec.module), reversedPiece(filletArc(place, radius, "root"))];
};

export function ringGearOutline(spec: RingGearSpec, centre: Inputs.Base.Point2 = [0, 0], rotation = 0): GearOutline {
    const sizes = ringGearSizes(spec);
    const upper = ringGapFlankPieces(spec, sizes);
    return toothedOutline(upper, { top: sizes.rootRadius, topPart: "root", gap: sizes.tipRadius, gapPart: "tip" }, spec.teeth, centre, radiansOf(rotation) + Math.PI / spec.teeth);
}

const lifted = (point: Inputs.Base.Point2): Inputs.Base.Point3 => [point[0], point[1], 0];

export function gearMovePoints(from: Inputs.Base.Point3, move: GearMove | RackMove, segments: number): Inputs.Base.Point3[] {
    const to = lifted(move.to);
    if (move.kind === "arc") {
        const arc = arcThroughThreePoints(from, lifted(move.through), to);
        return arc === undefined ? [from, to] : pointsOnArc(arc, from, to, segments);
    }
    if (move.kind === "cubic") {
        const control1 = lifted(move.control1);
        const control2 = lifted(move.control2);
        return Array.from({ length: segments + 1 }, (_, step): Inputs.Base.Point3 => step === 0 ? from : step === segments ? to : pointOnCubic3(from, control1, control2, to, step / segments));
    }
    return [from, to];
}

export function gearOutlinePoints(outline: GearOutline | RackOutline, segments: number): Inputs.Base.Point3[] {
    if (!Number.isInteger(segments) || segments < 1) {
        throw new InputError("`segments` is not a whole number of at least 1.", "segments");
    }
    const points: Inputs.Base.Point3[] = [];
    const sameAs = (point: Inputs.Base.Point3, other: Inputs.Base.Point3 | undefined): boolean => other !== undefined && point[0] === other[0] && point[1] === other[1] && point[2] === other[2];
    let from = lifted(outline.start);
    for (const move of outline.moves) {
        gearMovePoints(from, move, segments).slice(0, -1).forEach(point => {
            if (!sameAs(point, points[points.length - 1])) {
                points.push(point);
            }
        });
        from = lifted(move.to);
    }
    if (points.length > 1 && sameAs(points[points.length - 1]!, points[0])) {
        points.pop();
    }
    return points;
}
