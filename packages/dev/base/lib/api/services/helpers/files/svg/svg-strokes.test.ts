import { describe, expect, it } from "vitest";
import type { DrawingSpline } from "../drawing/drawing-types";
import { WorkBudget } from "../work-budget";
import { reversedStroke, strokeEnd, strokeOf } from "./svg-strokes";

const TOLERANCE = 1e-6;
const archOfOneCubic: DrawingSpline = {
    kind: "spline",
    curve: { degree: 3, points: [[1, 2, 0], [3, 4, 0], [5, 4, 0], [7, 2, 0]], weights: [1, 1, 1, 1], knots: [0, 0, 0, 0, 1, 1, 1, 1] },
};

describe("svg strokes of splines", () => {
    it("should draw a cubic spline as one cubic move that ends where the spline ends, and reverse it end for end", () => {
        // Act
        const stroke = strokeOf(archOfOneCubic, TOLERANCE, new WorkBudget(Number.POSITIVE_INFINITY));

        // Assert
        expect(stroke).toEqual({ start: [1, 2], moves: [{ kind: "C", control1: [3, 4], control2: [5, 4], to: [7, 2] }], closed: false });
        expect(strokeEnd(stroke)).toEqual([7, 2]);
        expect(reversedStroke(stroke)).toEqual({ start: [7, 2], moves: [{ kind: "C", control1: [5, 4], control2: [3, 4], to: [1, 2] }], closed: false });
    });

    it("should give a spline no moves once the budget is spent, and end and reverse such a stroke where it starts", () => {
        // Act
        const stroke = strokeOf(archOfOneCubic, TOLERANCE, new WorkBudget(0));

        // Assert
        expect(stroke).toEqual({ start: [1, 2], moves: [], closed: false });
        expect(strokeEnd(stroke)).toEqual([1, 2]);
        expect(reversedStroke(stroke)).toEqual(stroke);
    });
});
