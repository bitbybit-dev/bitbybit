import { describe, expect, it } from "vitest";
import { add2, add3, between2, between3, cross2, cross3, distance2, distance3, dot2, dot3, leftOf2, length2, length3, polar2, rotated2, scale2, scale3, subtract2, subtract3, unit2Of } from "./vectors";
import { unitOf } from "./frame-axes";

const PLAN_REACH = 20;
const PLAN_SIDE = 2 * PLAN_REACH + 1;
const integerPlanVectors = (): [number, number][] =>
    Array.from({ length: PLAN_SIDE * PLAN_SIDE }, (_, at): [number, number] => [at % PLAN_SIDE - PLAN_REACH, Math.floor(at / PLAN_SIDE) - PLAN_REACH])
        .filter(([x, y]) => x !== 0 || y !== 0);

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

    it("should scale a plan direction to the same bits as the same direction in space", () => {
        // Arrange
        const plan = integerPlanVectors();

        // Act
        const flat = plan.map(vector => unit2Of(vector));
        const spatial = plan.map(([x, y]) => unitOf([x, y, 0])!.slice(0, 2));

        // Assert
        expect(plan).toHaveLength(1680);
        expect(flat).toEqual(spatial);
    });

    it("should scale a very long and a very short plan vector without overflowing or vanishing", () => {
        // Act
        const units = [unit2Of([3e300, 4e300]), unit2Of([3e-300, -4e-300])];

        // Assert
        expect(units).toEqual([[0.6, 0.8], [0.6, -0.8]]);
    });

    it("should measure a length as the square root of the sum of the squares, in space and in the plan", () => {
        // Act
        const lengths = [length3([1, 2, 3]), distance3([1, 1, 1], [2, 3, 4]), length2([1, 2]), distance2([1, 1], [2, 3])];

        // Assert
        expect(lengths).toEqual([Math.sqrt(14), Math.sqrt(14), Math.sqrt(5), Math.sqrt(5)]);
        expect(lengths[0]).toBe(3.7416573867739413);
    });

    it("should add, subtract, scale, multiply and measure vectors in space", () => {
        // Act
        const results = [add3([1, 2, 3], [4, 5, 6]), subtract3([1, 2, 3], [4, 6, 8]), scale3([1, -2, 3], 2), cross3([1, 0, 0], [0, 1, 0])];

        // Assert
        expect(results).toEqual([[5, 7, 9], [-3, -4, -5], [2, -4, 6], [0, 0, 1]]);
        expect(dot3([1, 2, 3], [4, 5, 6])).toBe(32);
        expect(length3([2, 3, 6])).toBe(7);
    });

    it("should place a plan point at a radius and angle, and turn a plan point about the origin", () => {
        // Act
        const placed = polar2(2, Math.PI / 2);
        const turned = rotated2([1, 2], Math.PI / 2);

        // Assert
        expect(placed.map(value => Number(value.toFixed(12)) + 0)).toEqual([0, 2]);
        expect(turned.map(value => Number(value.toFixed(12)) + 0)).toEqual([-2, 1]);
    });

    it("should find the point a share of the way from one point to another, in the plan and in space", () => {
        // Act
        const plan = between2([0, 0], [4, 8], 0.25);
        const space = between3([1, 1, 1], [3, 5, 9], 0.5);

        // Assert
        expect(plan).toEqual([1, 2]);
        expect(space).toEqual([2, 3, 5]);
    });

    it("should measure the distance between two points in the plan and in space", () => {
        // Act
        const plan = distance2([1, 1], [4, 5]);
        const space = distance3([1, 2, 3], [3, 5, 9]);

        // Assert
        expect(plan).toBe(5);
        expect(space).toBe(7);
    });
});
