import type * as Inputs from "../inputs";
import { InputError } from "../kernel-calls/errors";
import type { BevelGearSizes, BevelGearSpec, FlankPiece, GearOutline, ToothCircles } from "./gear-types";
import { HALF_TURN_DEGREES, HERMITE_STEP, TIP_CONE_SLACK } from "./gears.constants";
import { degreesOf, radiansOf } from "../services/helpers/geometry/scalars";
import { spurFlankPieces, spurSizesOf } from "./gears";
import { checkedTeeth, checkedThickness, checkedToothCount } from "./gear-checks";
import { angleOf, mappedPiece, toothedOutline } from "./involute-flank";
import { add2, length2, polar2, scale2, subtract2 } from "../services/helpers/geometry/vectors";

type Point2 = Inputs.Base.Point2;
type PlaneMap = (point: Point2) => Point2;

const backConeProjection = (pitchRadius: number, cone: number): PlaneMap => {
    const height = pitchRadius / Math.tan(cone);
    const depth = pitchRadius * Math.tan(cone);
    return point => {
        const slant = length2(point);
        return polar2(slant * Math.cos(cone) * height / (height + depth - slant * Math.sin(cone)), angleOf(point) / Math.cos(cone));
    };
};

const pushed = (map: PlaneMap, at: Point2, toward: Point2): Point2 => {
    const delta = scale2(subtract2(toward, at), HERMITE_STEP);
    const ahead = map(add2(at, delta));
    const behind = map(subtract2(at, delta));
    return add2(map(at), scale2(subtract2(ahead, behind), 1 / (2 * HERMITE_STEP)));
};

const projected = (piece: FlankPiece, map: PlaneMap): FlankPiece => piece.kind === "cubic"
    ? { kind: "cubic", from: map(piece.from), control1: pushed(map, piece.from, piece.control1), control2: pushed(map, piece.to, piece.control2), to: map(piece.to), part: piece.part }
    : mappedPiece(piece, map);

export function bevelGearSizes(spec: BevelGearSpec): BevelGearSizes {
    checkedTeeth(spec);
    checkedToothCount(spec.mateTeeth, "mateTeeth");
    checkedThickness(spec.module * Math.PI / 2, spec.backlash);
    if (!(spec.shaftAngle > 0 && spec.shaftAngle < HALF_TURN_DEGREES)) {
        throw new InputError(`\`shaftAngle\` is not between 0 and ${String(HALF_TURN_DEGREES)} degrees.`, "shaftAngle");
    }
    const shaft = radiansOf(spec.shaftAngle);
    if (!(spec.mateTeeth / spec.teeth + Math.cos(shaft) > 0)) {
        throw new InputError("The pitch cone opens flat or wider, a crown or internal bevel gear: lower the `shaftAngle` or give the mate more teeth.", "shaftAngle");
    }
    const cone = Math.atan2(Math.sin(shaft), spec.mateTeeth / spec.teeth + Math.cos(shaft));
    const pitchRadius = spec.module * spec.teeth / 2;
    const coneDistance = pitchRadius / Math.sin(cone);
    const tip = spec.module * spec.addendum;
    const root = spec.module * spec.dedendum;
    const rootCone = cone - Math.atan(root / coneDistance);
    if (!(rootCone > 0)) {
        throw new InputError("The gaps reach past the axis: give the gear more `teeth` or a smaller `dedendum`.", "dedendum");
    }
    const tipCone = cone + Math.atan(tip / coneDistance);
    if (!(tipCone < Math.PI / 2 - TIP_CONE_SLACK)) {
        throw new InputError("The tips of the teeth reach the plane square to the axis, where the back cone seen from the apex has no outline to draw: lower the `shaftAngle`, or give the gear more `teeth` or a smaller `addendum`.", "shaftAngle");
    }
    return {
        pitchRadius,
        tipRadius: pitchRadius + tip * Math.cos(cone),
        rootRadius: pitchRadius - root * Math.cos(cone),
        pitchConeAngle: degreesOf(cone),
        tipConeAngle: degreesOf(tipCone),
        rootConeAngle: degreesOf(rootCone),
        coneDistance,
        apexDistance: coneDistance * Math.cos(cone),
        virtualTeeth: spec.teeth / Math.cos(cone),
    };
}

export function bevelGearOutline(spec: BevelGearSpec, centre: Point2 = [0, 0], rotation = 0): GearOutline {
    const sizes = bevelGearSizes(spec);
    const virtual = { ...spec, teeth: sizes.virtualTeeth, profileShift: 0 };
    const virtualSizes = spurSizesOf(virtual);
    const map = backConeProjection(sizes.pitchRadius, radiansOf(sizes.pitchConeAngle));
    const upper = spurFlankPieces(virtual, virtualSizes).map(piece => projected(piece, map));
    const circles: ToothCircles = { top: map([virtualSizes.tipRadius, 0])[0], topPart: "tip", gap: map([virtualSizes.rootRadius, 0])[0], gapPart: "root" };
    return toothedOutline(upper, circles, spec.teeth, centre, radiansOf(rotation));
}
