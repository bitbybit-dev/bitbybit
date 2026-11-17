import type * as Inputs from "../../../inputs";
import { blendedPoint, liftedPoint, projectedPoint } from "./nurbs";
import type { Homogeneous } from "./nurbs";
import type { BezierPiece } from "./nurbs-forms";
import { pointOnCubic3 } from "../geometry/arcs";
import { add3, distance3, distanceToSegment3, scale3, subtract3 } from "../geometry/vectors";
import type { WorkBudget } from "../files/work-budget";
import { DEEPEST_SPLIT, FIT_SAMPLES, FLATNESS_SHARES, HALF, HERMITE_THIRD } from "./bezier-pieces.constants";
import { LEAST_RELATIVE_TOLERANCE } from "./conic-arcs.constants";

type Point3 = Inputs.Base.Point3;

export interface CubicPiece {
    readonly start: Point3;
    readonly control1: Point3;
    readonly control2: Point3;
    readonly end: Point3;
}

export interface PointAndTangent {
    readonly point: Point3;
    readonly tangent: Point3;
}

export interface PiecesBounds {
    readonly min: Point3;
    readonly max: Point3;
}

interface ParameterSpan {
    readonly from: number;
    readonly to: number;
    readonly depth: number;
}

interface PendingPiece {
    readonly points: readonly Homogeneous[];
    readonly depth: number;
}

const homogeneousOf = (piece: BezierPiece): Homogeneous[] => piece.points.map((point, at) => liftedPoint(point, piece.weights[at] ?? 1));

const blendsOf = (points: readonly unknown[]): number => (points.length * (points.length + 1)) / 2;

const isFinitePoint = (point: readonly number[]): boolean => point.every(Number.isFinite);

const paidFor = (budget: WorkBudget | undefined, work: number): boolean => budget === undefined || budget.spend(work);

export const bezierPointAndTangent = (piece: BezierPiece, parameter: number): PointAndTangent => {
    let level = homogeneousOf(piece);
    const degree = level.length - 1;
    while (level.length > 2) {
        level = level.slice(1).map((point, at) => blendedPoint(level[at]!, point, parameter));
    }
    const [left, right] = [level[0]!, level[1]!];
    const value = blendedPoint(left, right, parameter);
    const point = projectedPoint(value);
    const change: Homogeneous = [degree * (right[0] - left[0]), degree * (right[1] - left[1]), degree * (right[2] - left[2]), degree * (right[3] - left[3])];
    const tangent: Point3 = [
        (change[0] - change[3] * point[0]) / value[3],
        (change[1] - change[3] * point[1]) / value[3],
        (change[2] - change[3] * point[2]) / value[3],
    ];
    return { point, tangent };
};

export const bezierPoint = (piece: BezierPiece, parameter: number): Point3 => bezierPointAndTangent(piece, parameter).point;

const boundsOf = (points: readonly Point3[]): PiecesBounds => {
    const min: Point3 = [Infinity, Infinity, Infinity];
    const max: Point3 = [-Infinity, -Infinity, -Infinity];
    for (const point of points) {
        for (let axis = 0; axis < min.length; axis++) {
            min[axis] = Math.min(min[axis]!, point[axis]!);
            max[axis] = Math.max(max[axis]!, point[axis]!);
        }
    }
    return { min, max };
};

const flooredTolerance = (points: readonly Point3[], tolerance: number): number => {
    const { min, max } = boundsOf(points);
    return Math.max(tolerance, LEAST_RELATIVE_TOLERANCE * Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]));
};

const hermiteOver = (piece: BezierPiece, span: ParameterSpan): CubicPiece => {
    const length = span.to - span.from;
    const start = bezierPointAndTangent(piece, span.from);
    const end = bezierPointAndTangent(piece, span.to);
    return {
        start: start.point,
        control1: add3(start.point, scale3(start.tangent, length * HERMITE_THIRD)),
        control2: subtract3(end.point, scale3(end.tangent, length * HERMITE_THIRD)),
        end: end.point,
    };
};

const fitsWithin = (piece: BezierPiece, span: ParameterSpan, cubic: CubicPiece, tolerance: number): boolean => {
    for (let sample = 1; sample < FIT_SAMPLES; sample++) {
        const share = sample / FIT_SAMPLES;
        if (distance3(pointOnCubic3(cubic.start, cubic.control1, cubic.control2, cubic.end, share), bezierPoint(piece, span.from + share * (span.to - span.from))) > tolerance) {
            return false;
        }
    }
    return true;
};

const split = (span: ParameterSpan): [ParameterSpan, ParameterSpan] => {
    const middle = (span.from + span.to) / 2;
    return [{ from: span.from, to: middle, depth: span.depth + 1 }, { from: middle, to: span.to, depth: span.depth + 1 }];
};

export const cubicsOfPiece = (piece: BezierPiece, tolerance: number, budget?: WorkBudget): CubicPiece[] => {
    const floored = flooredTolerance(piece.points, tolerance);
    const spanWork = (FIT_SAMPLES + 1) * blendsOf(piece.points);
    const cubics: CubicPiece[] = [];
    const pending: ParameterSpan[] = [{ from: 0, to: 1, depth: 0 }];
    while (pending.length > 0 && paidFor(budget, spanWork)) {
        const span = pending.pop()!;
        const cubic = hermiteOver(piece, span);
        const finite = [cubic.start, cubic.control1, cubic.control2, cubic.end].every(isFinitePoint);
        if (span.depth >= DEEPEST_SPLIT || !finite || fitsWithin(piece, span, cubic, floored)) {
            cubics.push(cubic);
        } else {
            const [first, second] = split(span);
            pending.push(second, first);
        }
    }
    return cubics;
};

const isFlat = (piece: BezierPiece, span: ParameterSpan, from: Point3, to: Point3, tolerance: number): boolean =>
    FLATNESS_SHARES.every(share => distanceToSegment3(bezierPoint(piece, span.from + share * (span.to - span.from)), from, to) <= tolerance);

export const samplesOfPiece = (piece: BezierPiece, tolerance: number, budget?: WorkBudget): Point3[] => {
    const floored = flooredTolerance(piece.points, tolerance);
    const spanWork = (FLATNESS_SHARES.length + 2) * blendsOf(piece.points);
    const samples: Point3[] = [bezierPoint(piece, 0)];
    const pending: ParameterSpan[] = [{ from: 0, to: 1, depth: 0 }];
    while (pending.length > 0 && paidFor(budget, spanWork)) {
        const span = pending.pop()!;
        const from = bezierPoint(piece, span.from);
        const to = bezierPoint(piece, span.to);
        const finite = isFinitePoint(from) && isFinitePoint(to);
        if (span.depth >= DEEPEST_SPLIT || !finite || (span.depth > 0 && isFlat(piece, span, from, to, floored))) {
            samples.push(to);
        } else {
            const [first, second] = split(span);
            pending.push(second, first);
        }
    }
    return samples;
};

const halvesOf = (points: readonly Homogeneous[]): [Homogeneous[], Homogeneous[]] => {
    const first: Homogeneous[] = [];
    const second: Homogeneous[] = [];
    let level = points;
    while (level.length > 0) {
        first.push(level[0]!);
        second.unshift(level[level.length - 1]!);
        level = level.slice(1).map((point, at) => blendedPoint(level[at]!, point, HALF));
    }
    return [first, second];
};

const widened = (bounds: PiecesBounds, by: PiecesBounds): PiecesBounds => ({
    min: bounds.min.map((value, axis) => Math.min(value, by.min[axis]!)) as Point3,
    max: bounds.max.map((value, axis) => Math.max(value, by.max[axis]!)) as Point3,
});

const liesWithin = (inner: PiecesBounds, outer: PiecesBounds, slack: number): boolean =>
    inner.min.every((value, axis) => value >= outer.min[axis]! - slack && inner.max[axis]! <= outer.max[axis]! + slack);

export const bezierPiecesBounds = (pieces: readonly BezierPiece[], tolerance: number, budget?: WorkBudget): PiecesBounds => {
    const slack = flooredTolerance(pieces.flatMap(piece => piece.points), tolerance);
    let reached = boundsOf(pieces.flatMap(piece => [piece.points[0]!, piece.points[piece.points.length - 1]!]));
    const pending: PendingPiece[] = [];
    for (let next = pieces.length - 1; next >= 0 && budget?.exhausted !== true; next--) {
        pending.push({ points: homogeneousOf(pieces[next]!), depth: 0 });
        while (pending.length > 0 && paidFor(budget, pending[pending.length - 1]!.points.length)) {
            const { points, depth } = pending.pop()!;
            const hull = boundsOf(points.map(projectedPoint));
            if (liesWithin(hull, reached, slack)) {
                continue;
            }
            if (depth >= DEEPEST_SPLIT || !isFinitePoint(hull.min) || !isFinitePoint(hull.max)) {
                reached = widened(reached, hull);
                continue;
            }
            if (!paidFor(budget, blendsOf(points))) {
                break;
            }
            const [first, second] = halvesOf(points);
            const middle = projectedPoint(second[0]!);
            reached = widened(reached, { min: middle, max: middle });
            pending.push({ points: second, depth: depth + 1 }, { points: first, depth: depth + 1 });
        }
    }
    return { min: reached.min.map(value => value - slack) as Point3, max: reached.max.map(value => value + slack) as Point3 };
};
