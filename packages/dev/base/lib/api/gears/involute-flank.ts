import type * as Inputs from "../inputs";
import type { CubicFlankPiece, FilletPlace, FlankPiece, GearMove, GearOutline, GearPart, ToothCircles } from "./gear-types";
import { BEZIER_HANDLE, FILLET_STEPS, FIT_SAMPLES, MAX_FIT_DEPTH } from "./gears.constants";
import { pointOnCubic2 } from "../services/helpers/geometry/arcs";
import { add2, length2, polar2, rotated2, scale2, subtract2, unit2Of } from "../services/helpers/geometry/vectors";

type Point2 = Inputs.Base.Point2;

const mirrored = (point: Point2): Point2 => [point[0], -point[1]];

export const angleOf = (point: Point2): number => Math.atan2(point[1], point[0]);

const cubicAt = (piece: CubicFlankPiece, share: number): Point2 => pointOnCubic2(piece.from, piece.control1, piece.control2, piece.to, share);

export const involute = (angle: number): number => Math.tan(angle) - angle;

export class UpperFlank {
    readonly baseAngle: number;

    constructor(private readonly baseRadius: number, halfToothAngle: number, pressureAngle: number) {
        this.baseAngle = halfToothAngle + involute(pressureAngle);
    }

    pointAt(roll: number): Point2 {
        const radius = this.baseRadius;
        return rotated2([radius * (Math.cos(roll) + roll * Math.sin(roll)), -radius * (Math.sin(roll) - roll * Math.cos(roll))], this.baseAngle);
    }

    towardGapAt(roll: number): Point2 {
        return rotated2([Math.sin(roll), Math.cos(roll)], this.baseAngle);
    }

    rollAt(radius: number): number {
        return radius <= this.baseRadius ? 0 : Math.sqrt((radius / this.baseRadius) ** 2 - 1);
    }

    fitted(fromRoll: number, toRoll: number, tolerance: number, depth = 0): FlankPiece[] {
        const startLength = this.lengthAt(fromRoll);
        const span = this.lengthAt(toRoll) - startLength;
        const from = this.pointAt(fromRoll);
        const to = this.pointAt(toRoll);
        const startTangent = this.tangentAt(fromRoll);
        const endTangent = this.tangentAt(toRoll);
        const handle = span * BEZIER_HANDLE;
        const piece: CubicFlankPiece = {
            kind: "cubic",
            from,
            control1: add2(from, scale2(startTangent, handle)),
            control2: subtract2(to, scale2(endTangent, handle)),
            to,
            part: "flank",
        };
        if (depth >= MAX_FIT_DEPTH || this.fitError(piece, startLength, span) <= tolerance) {
            return [piece];
        }
        const middleRoll = this.rollOfLength(startLength + span / 2);
        return [...this.fitted(fromRoll, middleRoll, tolerance, depth + 1), ...this.fitted(middleRoll, toRoll, tolerance, depth + 1)];
    }

    private tangentAt(roll: number): Point2 {
        return rotated2([Math.cos(roll), -Math.sin(roll)], this.baseAngle);
    }

    private lengthAt(roll: number): number {
        return this.baseRadius * roll * roll / 2;
    }

    private rollOfLength(length: number): number {
        return Math.sqrt(2 * length / this.baseRadius);
    }

    private fitError(piece: CubicFlankPiece, startLength: number, span: number): number {
        let worst = 0;
        for (let sample = 1; sample < FIT_SAMPLES; sample++) {
            const share = sample / FIT_SAMPLES;
            const fitted = cubicAt(piece, share);
            const exact = this.pointAt(this.rollOfLength(startLength + share * span));
            worst = Math.max(worst, length2(subtract2(fitted, exact)));
        }
        return worst;
    }
}

export const rootFilletPlace = (flank: UpperFlank, baseRadius: number, rootRadius: number, radius: number): FilletPlace => {
    const lineTouch = Math.sqrt(rootRadius * rootRadius + 2 * rootRadius * radius);
    if (baseRadius > rootRadius && lineTouch <= baseRadius) {
        const centre = polar2(rootRadius + radius, flank.baseAngle + Math.asin(radius / (rootRadius + radius)));
        return { flankPoint: polar2(lineTouch, flank.baseAngle), circlePoint: polar2(rootRadius, angleOf(centre)), centre, onLine: true, roll: 0 };
    }
    const roll = (Math.sqrt((rootRadius + radius) ** 2 - baseRadius * baseRadius) - radius) / baseRadius;
    const flankPoint = flank.pointAt(roll);
    const toward = flank.towardGapAt(roll);
    const centre = add2(flankPoint, scale2(toward, radius));
    return { flankPoint, circlePoint: polar2(rootRadius, angleOf(centre)), centre, onLine: false, roll };
};

export const topRoundPlace = (flank: UpperFlank, baseRadius: number, topRadius: number, radius: number): FilletPlace => {
    const roll = (Math.sqrt((topRadius - radius) ** 2 - baseRadius * baseRadius) + radius) / baseRadius;
    const flankPoint = flank.pointAt(roll);
    const toward = flank.towardGapAt(roll);
    const centre = subtract2(flankPoint, scale2(toward, radius));
    return { flankPoint, circlePoint: polar2(topRadius, angleOf(centre)), centre, onLine: false, roll };
};

export const largestFitting = (wanted: number, fits: (radius: number) => boolean): number => {
    if (fits(wanted)) {
        return wanted;
    }
    let low = 0;
    let high = wanted;
    for (let step = 0; step < FILLET_STEPS; step++) {
        const middle = (low + high) / 2;
        if (fits(middle)) {
            low = middle;
        } else {
            high = middle;
        }
    }
    return low;
};

export const filletArc = (place: FilletPlace, radius: number, part: GearPart): FlankPiece => {
    const halfway = add2(subtract2(place.flankPoint, place.centre), subtract2(place.circlePoint, place.centre));
    const through = add2(place.centre, scale2(unit2Of(halfway)!, radius));
    return { kind: "arc", from: place.circlePoint, through, to: place.flankPoint, part };
};

export const reversedPiece = (piece: FlankPiece): FlankPiece => {
    switch (piece.kind) {
        case "line":
            return { kind: "line", from: piece.to, to: piece.from, part: piece.part };
        case "arc":
            return { kind: "arc", from: piece.to, through: piece.through, to: piece.from, part: piece.part };
        default:
            return { kind: "cubic", from: piece.to, control1: piece.control2, control2: piece.control1, to: piece.from, part: piece.part };
    }
};

export const mappedPiece = (piece: FlankPiece, map: (point: Point2) => Point2): FlankPiece => {
    switch (piece.kind) {
        case "line":
            return { kind: "line", from: map(piece.from), to: map(piece.to), part: piece.part };
        case "arc":
            return { kind: "arc", from: map(piece.from), through: map(piece.through), to: map(piece.to), part: piece.part };
        default:
            return { kind: "cubic", from: map(piece.from), control1: map(piece.control1), control2: map(piece.control2), to: map(piece.to), part: piece.part };
    }
};

const moveOf = (piece: FlankPiece): GearMove => {
    switch (piece.kind) {
        case "line":
            return { kind: "line", to: piece.to, part: piece.part };
        case "arc":
            return { kind: "arc", through: piece.through, to: piece.to, part: piece.part };
        default:
            return { kind: "cubic", control1: piece.control1, control2: piece.control2, to: piece.to, part: piece.part };
    }
};

export const toothedOutline = (upper: readonly FlankPiece[], circles: ToothCircles, teeth: number, centre: Point2, turn: number): GearOutline => {
    const lowerOutward = upper.map(piece => mappedPiece(piece, mirrored));
    const upperInward = [...upper].reverse().map(reversedPiece);
    const tooth: FlankPiece[] = [
        ...lowerOutward,
        { kind: "arc", from: lowerOutward[lowerOutward.length - 1]!.to, through: [circles.top, 0], to: upperInward[0]!.from, part: circles.topPart },
        ...upperInward,
    ];
    const pitch = 2 * Math.PI / teeth;
    const placed = (point: Point2, toothIndex: number): Point2 => {
        return add2(rotated2(point, turn + toothIndex * pitch), centre);
    };
    const firstPoint = tooth[0]!.from;
    const gapMiddle = polar2(circles.gap, pitch / 2);
    const start = placed(firstPoint, 0);
    const moves: GearMove[] = [];
    for (let index = 0; index < teeth; index++) {
        tooth.forEach(piece => moves.push(moveOf(mappedPiece(piece, point => placed(point, index)))));
        const isLast = index === teeth - 1;
        moves.push({ kind: "arc", through: placed(gapMiddle, index), to: isLast ? start : placed(firstPoint, index + 1), part: circles.gapPart });
    }
    return { start, moves };
};
