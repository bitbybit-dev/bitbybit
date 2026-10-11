import { describe, expect, it } from "vitest";
import { add2, add3, cross2, cross3, dot2, dot3, leftOf2, length2, length3, scale2, scale3, subtract2, subtract3, unit2Of } from "./vectors";

describe("vectors", () => {
    it("should add, subtract and scale plan vectors and measure them", () => {
        // Act
        const results = [add2([1, 2], [3, 4]), subtract2([1, 2], [3, 5]), scale2([1, -2], 3)];

        // Assert
        expect(results).toEqual([[4, 6], [-2, -3], [3, -6]]);
        expect(dot2([1, 2], [3, 4])).toBe(11);
        expect(length2([3, 4])).toBe(5);
    });

    it("should give a positive plan cross product when the second vector turns left of the first", () => {
        // Act
        const left = cross2([1, 0], [0, 1]);
        const right = cross2([1, 0], [0, -1]);

        // Assert
        expect(left).toBe(1);
        expect(right).toBe(-1);
    });

    it("should turn a plan direction a quarter turn counterclockwise to find its left", () => {
        // Act
        const lefts = [leftOf2([1, 0]), leftOf2([0, 1]), leftOf2([2, 3])];

        // Assert
        expect(lefts).toEqual([[-0, 1], [-1, 0], [-3, 2]]);
    });

    it("should scale a plan vector to length one, and give nothing for one of no or endless length", () => {
        // Act
        const units = [unit2Of([3, 4]), unit2Of([0, 0]), unit2Of([Infinity, 0])];

        // Assert
        expect(units).toEqual([[0.6, 0.8], undefined, undefined]);
    });

    it("should add, subtract, scale, multiply and measure vectors in space", () => {
        // Act
        const results = [add3([1, 2, 3], [4, 5, 6]), subtract3([1, 2, 3], [4, 6, 8]), scale3([1, -2, 3], 2), cross3([1, 0, 0], [0, 1, 0])];

        // Assert
        expect(results).toEqual([[5, 7, 9], [-3, -4, -5], [2, -4, 6], [0, 0, 1]]);
        expect(dot3([1, 2, 3], [4, 5, 6])).toBe(32);
        expect(length3([2, 3, 6])).toBe(7);
    });
});
