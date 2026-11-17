import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { levelsByHeight } from "./dxf-loader";

const SEED = 20261116;

const levelsOneByOne = (heights: readonly number[], tolerance: number): number[][] => {
    const levels: number[][] = [];
    heights.forEach((height, at) => {
        const level = levels.find(candidate => Math.abs(heights[candidate[0]!]! - height) <= tolerance);
        if (level === undefined) {
            levels.push([at]);
        } else {
            level.push(at);
        }
    });
    return levels;
};

describe("the heights a DXF file's flat outlines are faced at", () => {
    it("should group any heights as comparing each with the first height of every level before it would", () => {
        // Arrange
        const tolerances = fc.constantFrom(1e-6, 0.001, 0.25, 1, 7.5);
        const heights = (tolerance: number): fc.Arbitrary<number[]> =>
            fc.array(fc.tuple(fc.integer({ min: -40, max: 40 }), fc.double({ min: -1, max: 1, noNaN: true })).map(([step, jitter]) => step * tolerance * 0.5 + jitter * tolerance), { maxLength: 60 });

        // Act & Assert
        fc.assert(fc.property(tolerances.chain(tolerance => fc.tuple(fc.constant(tolerance), heights(tolerance))), ([tolerance, given]) => {
            expect(levelsByHeight(given, tolerance)).toEqual(levelsOneByOne(given, tolerance));
        }), { seed: SEED, numRuns: 400 });
    });

    it.each([
        ["one apart", [0, 0.8, 1.6, 1.2, 5, 0.3, 1], 1, [[0, 1, 5, 6], [2, 3], [4]]],
        ["either side of zero", [0.1, 0.35, 0.36, -0.15, -0.16], 0.25, [[0, 1, 3], [2], [4]]],
    ])("should join each height to the first level whose first height lies within the tolerance, heights %s", (_name, heights, tolerance, levels) => {
        // Act
        const grouped = levelsByHeight(heights, tolerance);

        // Assert
        expect(grouped).toEqual(levels);
    });

    it("should put each of very many heights further apart than the tolerance on a level of its own without comparing every pair", { timeout: 2000 }, () => {
        // Arrange
        const heights = Array.from({ length: 200_000 }, (_, at) => (at % 2 === 0 ? at : -at));

        // Act
        const grouped = levelsByHeight(heights, 1e-3);

        // Assert
        expect(grouped).toHaveLength(heights.length);
        expect(grouped.every((level, at) => level.length === 1 && level[0] === at)).toBe(true);
    });
});
