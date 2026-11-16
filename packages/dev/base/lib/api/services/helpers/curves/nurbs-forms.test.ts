import { describe, expect, it } from "vitest";
import type * as Inputs from "../../../inputs";
import { nurbsCurvePoint } from "./nurbs";
import { bezierPiecesOf, clampedForm, clampedUniformKnots, insertKnot, isRationalPiece, periodicUniformForm } from "./nurbs-forms";
import type { NurbsCurveForm } from "./nurbs-forms";
import { bezierPoint } from "./bezier-pieces";

type Point3 = Inputs.Base.Point3;

const wavy: NurbsCurveForm = {
    degree: 3,
    points: [[0, 0, 0], [2, 6, 1], [5, -3, 2], [8, 4, 0], [11, 0, 1], [14, 5, 3]],
    weights: [1, 0.5, 2, 1, 3, 1],
    knots: [0, 0.5, 1, 2, 3, 3, 4, 5, 6, 7],
};

const at = (form: NurbsCurveForm, parameter: number): Point3 => nurbsCurvePoint(form.degree, form.points, form.weights, form.knots, parameter);

const expectSameCurve = (actual: NurbsCurveForm, expected: NurbsCurveForm, from: number, to: number): void => {
    for (let step = 0; step <= 40; step++) {
        const parameter = from + ((to - from) * step) / 40;
        at(actual, parameter).forEach((value, axis) => expect(value).toBeCloseTo(at(expected, parameter)[axis]!, 11));
    }
};

describe("NURBS curve forms", () => {
    it("should give clamped uniform knots that repeat each end once more than the degree", () => {
        // Act
        const cubic = clampedUniformKnots(6, 3);
        const line = clampedUniformKnots(2, 1);

        // Assert
        expect(cubic).toEqual([0, 0, 0, 0, 1, 2, 3, 3, 3, 3]);
        expect(line).toEqual([0, 0, 1, 1]);
    });

    it("should keep the curve when a knot is inserted, once or up to the degree", () => {
        // Act
        const once = insertKnot(wavy, 2.5);
        const thrice = insertKnot(wavy, 3.5, 3);
        const atExisting = insertKnot(wavy, 3);

        // Assert
        expect(once.points).toHaveLength(7);
        expect(once.knots).toEqual([0, 0.5, 1, 2, 2.5, 3, 3, 4, 5, 6, 7]);
        expect(thrice.knots.filter(knot => knot === 3.5)).toHaveLength(3);
        expect(atExisting.knots.filter(knot => knot === 3)).toHaveLength(3);
        for (const form of [once, thrice, atExisting]) {
            expectSameCurve(form, wavy, 3, 4);
        }
    });

    it("should clamp an unclamped curve over its domain without changing it, ending on its end points", () => {
        // Act
        const clamped = clampedForm(wavy);
        const already = clampedForm(clamped);

        // Assert
        expect(clamped.knots).toEqual([2, 2, 2, 2, 3, 3, 4, 4, 4, 4]);
        expectSameCurve(clamped, wavy, 2, 4);
        clamped.points[0]!.forEach((value, axis) => expect(value).toBeCloseTo(at(wavy, 2)[axis]!, 12));
        clamped.points[clamped.points.length - 1]!.forEach((value, axis) => expect(value).toBeCloseTo(at(wavy, 4)[axis]!, 12));
        expect(already).toEqual(clamped);
    });

    it("should wrap control points into a closed periodic form whose clamped curve ends where it starts", () => {
        // Arrange
        const square: Point3[] = [[0, 0, 0], [4, 0, 0], [4, 4, 0], [0, 4, 0]];

        // Act
        const loop = clampedForm(periodicUniformForm(square, [1, 1, 1, 1], 2));

        // Assert
        loop.points[0]!.forEach((value, axis) => expect(value).toBeCloseTo(loop.points[loop.points.length - 1]![axis]!, 12));
        expect(loop.points[0]).toEqual([2, 0, 0]);
    });

    it("should split a curve into one Bezier piece per knot span, each the curve over its span", () => {
        // Act
        const pieces = bezierPiecesOf(wavy);

        // Assert
        expect(pieces).toHaveLength(2);
        expect(pieces.every(piece => piece.points.length === 4)).toBe(true);
        expect(pieces.map(isRationalPiece)).toEqual([true, true]);
        pieces.forEach((piece, index) => {
            for (let step = 0; step <= 10; step++) {
                const local = step / 10;
                bezierPoint(piece, local).forEach((value, axis) => expect(value).toBeCloseTo(at(wavy, 2 + index + local)[axis]!, 11));
            }
        });
        expect(isRationalPiece({ points: [[0, 0, 0], [1, 1, 0]], weights: [2, 2] })).toBe(false);
    });

    it("should split a curve whose inner knots repeat into one piece per span, each the curve over its span", () => {
        // Arrange
        const repeated: NurbsCurveForm = {
            degree: 3,
            points: [[0, 0, 0], [1, 3, 0], [3, 4, 1], [4, 1, 2], [6, -2, 1], [8, 0, 0], [9, 3, 0]],
            weights: [1, 2, 0.5, 1, 1.5, 1, 1],
            knots: [0, 0, 0, 0, 1, 1, 2, 3, 3, 3, 3],
        };
        const spans = [[0, 1], [1, 2], [2, 3]];

        // Act
        const pieces = bezierPiecesOf(repeated);

        // Assert
        expect(pieces).toHaveLength(3);
        pieces.forEach((piece, index) => {
            const [from, to] = spans[index]!;
            for (let step = 0; step <= 10; step++) {
                const local = step / 10;
                bezierPoint(piece, local).forEach((value, axis) => expect(value).toBeCloseTo(at(repeated, from! + (to! - from!) * local)[axis]!, 11));
            }
        });
    });

    it("should split a curve already in Bezier form, every inner knot repeated to the degree, into its own pieces", () => {
        // Arrange
        const joined: NurbsCurveForm = { degree: 2, points: [[0, 0, 0], [1, 1, 0], [2, 0, 0], [3, -1, 0], [4, 0, 0]], weights: [1, 1, 1, 1, 1], knots: [0, 0, 0, 1, 1, 2, 2, 2] };

        // Act
        const pieces = bezierPiecesOf(joined);

        // Assert
        expect(pieces.map(piece => piece.points)).toEqual([[[0, 0, 0], [1, 1, 0], [2, 0, 0]], [[2, 0, 0], [3, -1, 0], [4, 0, 0]]]);
    });

    it("should split a curve of 20,000 control points in one pass, in well under a few seconds", () => {
        // Arrange
        const count = 20_000;
        const long: NurbsCurveForm = {
            degree: 3,
            points: Array.from({ length: count }, (_, index): Point3 => [index, Math.sin(index), 0]),
            weights: Array.from({ length: count }, () => 1),
            knots: clampedUniformKnots(count, 3),
        };
        const started = performance.now();

        // Act
        const pieces = bezierPiecesOf(long);

        // Assert
        expect(performance.now() - started).toBeLessThan(3000);
        expect(pieces).toHaveLength(count - 3);
        bezierPoint(pieces[12_345]!, 0.5).forEach((value, axis) => expect(value).toBeCloseTo(at(long, 12_345.5)[axis]!, 9));
    });
});
