import { describe, expect, it } from "vitest";
import { WorkBudget } from "./work-budget";

describe("WorkBudget", () => {
    it("should grow with the input between its floor and its ceiling", () => {
        // Act
        const capacities = [0, 10, 1000, 1e9].map(size => WorkBudget.forInput(size, 4, 100, 10_000).capacity);

        // Assert
        expect(capacities).toStrictEqual([100, 100, 4000, 10_000]);
    });

    it("should take an input size that is no number of units as the floor", () => {
        // Act
        const capacities = [Number.NaN, -5, Number.POSITIVE_INFINITY].map(size => WorkBudget.forInput(size, 4, 100, 10_000).capacity);

        // Assert
        expect(capacities).toStrictEqual([100, 100, 100]);
    });

    it("should allow spending up to its capacity and say when a spend goes past it", () => {
        // Arrange
        const budget = new WorkBudget(10);

        // Act
        const answers = [budget.spend(4), budget.spend(6), budget.spend(1)];

        // Assert
        expect(answers).toStrictEqual([true, true, false]);
        expect([budget.spent, budget.remaining, budget.exhausted]).toStrictEqual([11, 0, true]);
    });

    it("should tell whether a spend fits without spending it", () => {
        // Arrange
        const budget = new WorkBudget(10);
        budget.spend(7);

        // Act
        const answers = [budget.affords(3), budget.affords(4)];

        // Assert
        expect(answers).toStrictEqual([true, false]);
        expect(budget.spent).toBe(7);
    });

    it("should never give back units for a spend that is not a positive number", () => {
        // Arrange
        const budget = new WorkBudget(10);
        budget.spend(8);

        // Act
        [-100, Number.NaN, 0].forEach(units => budget.spend(units));

        // Assert
        expect([budget.spent, budget.affords(-100), budget.affords(3)]).toStrictEqual([8, true, false]);
    });
});
