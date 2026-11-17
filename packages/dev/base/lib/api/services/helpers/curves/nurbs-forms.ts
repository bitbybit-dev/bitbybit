import type * as Inputs from "../../../inputs";
import { blendedPoint, knotDomain, liftedPoint, projectedPoint } from "./nurbs";
import type { Homogeneous } from "./nurbs";
import type { WorkBudget } from "../files/work-budget";

type Point3 = Inputs.Base.Point3;

export interface NurbsCurveForm {
    readonly degree: number;
    readonly points: readonly Point3[];
    readonly weights: readonly number[];
    readonly knots: readonly number[];
}

export interface BezierPiece {
    readonly points: readonly Point3[];
    readonly weights: readonly number[];
}

const homogeneousOf = (form: NurbsCurveForm): Homogeneous[] => form.points.map((point, at) => liftedPoint(point, form.weights[at] ?? 1));

const pieceOf = (homogeneous: readonly Homogeneous[]): BezierPiece => ({ points: homogeneous.map(projectedPoint), weights: homogeneous.map(point => point[3]) });

export const clampedUniformKnots = (pointCount: number, degree: number): number[] => {
    const spans = pointCount - degree;
    return Array.from({ length: pointCount + degree + 1 }, (_, at) => Math.min(Math.max(at - degree, 0), spans));
};

export const periodicUniformForm = (points: readonly Point3[], weights: readonly number[], degree: number): NurbsCurveForm => {
    const wrapped = [...points, ...points.slice(0, degree)];
    const wrappedWeights = [...weights, ...weights.slice(0, degree)];
    return { degree, points: wrapped, weights: wrappedWeights, knots: Array.from({ length: wrapped.length + degree + 1 }, (_, at) => at) };
};

const insertionSpan = (degree: number, pointCount: number, knots: readonly number[], parameter: number): number => {
    let span = degree;
    while (span < pointCount - 1 && knots[span + 1]! <= parameter) {
        span++;
    }
    return span;
};

const knotAfterRounds = (knots: readonly number[], span: number, parameter: number, rounds: number, at: number): number => {
    if (at <= span) {
        return knots[at]!;
    }
    return at <= span + rounds ? parameter : knots[at - rounds]!;
};

export const insertKnot = (form: NurbsCurveForm, parameter: number, times = 1): NurbsCurveForm => {
    const { degree, knots, points, weights } = form;
    const span = insertionSpan(degree, points.length, knots, parameter);
    const base = span - degree;
    const window = points.slice(base, span + 1).map((point, at) => liftedPoint(point, weights[base + at] ?? 1));
    for (let round = 0; round < times; round++) {
        window.push(window[degree + round]!);
        for (let at = degree + round; at > round; at--) {
            const left = knotAfterRounds(knots, span, parameter, round, base + at);
            const reach = knotAfterRounds(knots, span, parameter, round, base + at + degree) - left;
            window[at] = blendedPoint(window[at - 1]!, window[at]!, reach > 0 ? (parameter - left) / reach : 0);
        }
    }
    const inserted = Array.from({ length: Math.max(times, 0) }, () => parameter);
    return {
        degree,
        points: [...points.slice(0, base), ...window.map(projectedPoint), ...points.slice(span + 1)],
        weights: [...weights.slice(0, base), ...window.map(point => point[3]), ...weights.slice(span + 1)],
        knots: [...knots.slice(0, span + 1), ...inserted, ...knots.slice(span + 1)],
    };
};

const multiplicityOf = (knots: readonly number[], value: number): number => knots.filter(knot => knot === value).length;

export const clampedForm = (form: NurbsCurveForm): NurbsCurveForm => {
    const [first, last] = knotDomain(form.degree, form.knots);
    let clamped = form;
    for (const end of [first, last]) {
        const missing = form.degree - multiplicityOf(clamped.knots, end);
        if (missing > 0) {
            clamped = insertKnot(clamped, end, missing);
        }
    }
    const lastAtStart = clamped.knots.lastIndexOf(first);
    const firstAtEnd = clamped.knots.indexOf(last);
    const from = lastAtStart - form.degree;
    const interior = clamped.knots.slice(lastAtStart + 1, firstAtEnd);
    const ends = Array.from({ length: form.degree + 1 });
    return {
        degree: form.degree,
        points: clamped.points.slice(from, firstAtEnd),
        weights: clamped.weights.slice(from, firstAtEnd),
        knots: [...ends.map(() => first), ...interior, ...ends.map(() => last)],
    };
};

export const bezierPiecesOf = (form: NurbsCurveForm, budget?: WorkBudget): BezierPiece[] => {
    const clamped = clampedForm(form);
    const { degree, knots } = clamped;
    if (budget !== undefined && !budget.spend(((clamped.points.length - degree) * (degree + 1) * (degree + 2)) / 2)) {
        return [];
    }
    const lastKnot = knots.length - 1;
    const control = homogeneousOf(clamped);
    const pieces: BezierPiece[] = [];
    let piece = control.slice(0, degree + 1);
    let spanStart = degree;
    let spanEnd = degree + 1;
    while (spanEnd < lastKnot) {
        const groupStart = spanEnd;
        while (spanEnd < lastKnot && knots[spanEnd + 1] === knots[spanEnd]) {
            spanEnd++;
        }
        const multiplicity = spanEnd - groupStart + 1;
        const next: Homogeneous[] = [];
        if (multiplicity < degree) {
            const reach = knots[spanEnd]! - knots[spanStart]!;
            const shares = Array.from({ length: degree - multiplicity }, (_, at) => reach / (knots[spanStart + multiplicity + 1 + at]! - knots[spanStart]!));
            const insertions = degree - multiplicity;
            for (let round = 1; round <= insertions; round++) {
                const from = multiplicity + round;
                for (let at = degree; at >= from; at--) {
                    piece[at] = blendedPoint(piece[at - 1]!, piece[at]!, shares[at - from]!);
                }
                next[insertions - round] = piece[degree]!;
            }
        }
        pieces.push(pieceOf(piece));
        if (spanEnd < lastKnot) {
            for (let at = degree - multiplicity; at <= degree; at++) {
                next[at] = control[spanEnd - degree + at]!;
            }
            piece = next;
            spanStart = spanEnd;
            spanEnd++;
        }
    }
    return pieces;
};

export const isRationalPiece = (piece: BezierPiece): boolean => piece.weights.some(weight => weight !== piece.weights[0]);
