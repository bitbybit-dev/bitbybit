import { describe, expect, it } from "vitest";
import type * as Inputs from "../../../../inputs";
import { WorkBudget } from "../work-budget";
import { drawingLoopsOf } from "./drawing-loops";
import { drawingPathOf } from "./drawing-model";

describe("hatch boundaries joined into closed loops", () => {
    it("should join a polyline of 300,000 points after a line into one loop, past the engine's limit on call arguments", () => {
        // Arrange
        const points = Array.from({ length: 300_000 }, (_, at): Inputs.Base.Point2 => [10 + at, at % 2]);
        const path = drawingPathOf({ segments: [{ start: [0, 0], end: [10, 0] }, { points }] }, "path");

        // Act
        const loops = drawingLoopsOf([path], 0.01);

        // Assert
        expect(loops.map(loop => [loop.points.length, loop.bulges.length])).toEqual([[300_001, 300_001]]);
    });

    it("should charge the budget for every point an ellipse or a tilted circle is sampled into", () => {
        // Arrange
        const ellipse = drawingPathOf({ segments: [{ center: [0, 0], majorAxis: [50, 0], ratio: 0.5 }] }, "ellipse");
        const tilted = drawingPathOf({ segments: [{ center: [0, 0], radius: 50, normal: [0.6, 0, 0.8] }] }, "circle");
        const budgets = [new WorkBudget(1_000_000), new WorkBudget(1_000_000)];

        // Act
        const loops = [drawingLoopsOf([ellipse], 1e-4, budgets[0]), drawingLoopsOf([tilted], 1e-4, budgets[1])];

        // Assert
        expect(loops.map(found => found[0]!.points.length)).toEqual([1571, 1571]);
        expect(budgets.map(budget => budget.spent)).toEqual([1572, 1572]);
    });

    it("should stop sampling once the budget is spent, holding no more than a chord for each ellipse after", () => {
        // Arrange
        const ellipse = drawingPathOf({ segments: [{ center: [0, 0], majorAxis: [50, 0], ratio: 0.5 }] }, "ellipse");
        const budget = new WorkBudget(100);

        // Act
        const loops = drawingLoopsOf(Array.from({ length: 1000 }, () => ellipse), 1e-4, budget);

        // Assert
        expect(budget.exhausted).toBe(true);
        expect(loops).toEqual([]);
    });
});
