import { describe, it, expect } from "vitest";
import type * as Inputs from "../../../inputs";
import {
    boxOf2, boxesOverlap2, filledRegions2, interiorPoint2, nestedOutlines2, nestingOutlineOf2, outlinesCross2, overlappingBoxPairs2, segmentsCross2,
} from "./polygon-nesting";
import type { Box2, NestingOutline2 } from "./polygon-nesting";
import { WorkBudget } from "../files/work-budget";

type Point2 = Inputs.Base.Point2;

const outlinesOf = (...polygons: Point2[][]): NestingOutline2[] => polygons.map((points) => nestingOutlineOf2(points));
const square = (x: number, y: number, size: number, clockwise = false): Point2[] => {
    const points: Point2[] = [[x, y], [x + size, y], [x + size, y + size], [x, y + size]];
    return clockwise ? points.reverse() : points;
};
const circle = (radius: number, count: number): Point2[] =>
    Array.from({ length: count }, (_, k): Point2 => [radius * Math.cos((2 * Math.PI * k) / count), radius * Math.sin((2 * Math.PI * k) / count)]);
const stackedStrips = (count: number): Box2[] => Array.from({ length: count }, (_, i): Box2 => ({ min: [0, 3 * i], max: [100, 3 * i + 1] }));
const sideBySideStrips = (count: number): Box2[] => Array.from({ length: count }, (_, i): Box2 => ({ min: [200 + 3 * i, -100], max: [201 + 3 * i, -1] }));
const ordered = (pairs: readonly [number, number][]): [number, number][] =>
    pairs.map(([i, j]): [number, number] => [Math.min(i, j), Math.max(i, j)]).sort((p, q) => p[0] - q[0] || p[1] - q[1]);
const pairsWithFrame = (count: number): [number, number][] => Array.from({ length: count }, (_, k): [number, number] => [0, k + 1]);
const insideByCrossings = (p: Point2, polygon: Point2[]): boolean => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i]!;
        const [xj, yj] = polygon[j]!;
        if ((yi > p[1]) !== (yj > p[1]) && p[0] < (xj - xi) * (p[1] - yi) / (yj - yi) + xi) { inside = !inside; }
    }
    return inside;
};
const regionsOf = (outlines: NestingOutline2[], rule: "nonzero" | "evenOdd"): ReturnType<typeof filledRegions2> =>
    filledRegions2(outlines, nestedOutlines2(outlines, overlappingBoxPairs2(outlines.map((o) => o.box))), rule);

const U_OUTER: Point2[] = [[0, 0], [10, 0], [10, 20], [20, 20], [20, 0], [30, 0], [30, 30], [0, 30]];
const U_INNER: Point2[] = [[3, 3], [7, 3], [7, 23], [23, 23], [23, 3], [27, 3], [27, 27], [3, 27]];

describe("polygon boxes and crossings", () => {
    it("should bound a polygon by its extreme coordinates", () => {
        // Act
        const box = boxOf2([[3, -1], [-2, 4], [5, 2]]);

        // Assert
        expect(box).toEqual({ min: [-2, -1], max: [5, 4] });
    });

    it("should count boxes that only touch as overlapping", () => {
        // Act
        const touching = boxesOverlap2({ min: [0, 0], max: [1, 1] }, { min: [1, 0], max: [2, 1] });
        const apart = boxesOverlap2({ min: [0, 0], max: [1, 1] }, { min: [1.5, 0], max: [2, 1] });

        // Assert
        expect([touching, apart]).toEqual([true, false]);
    });

    it("should pair only boxes that overlap", () => {
        // Act
        const pairs = overlappingBoxPairs2([boxOf2(square(0, 0, 10)), boxOf2(square(20, 0, 10)), { min: [25, 5], max: [40, 8] }]);

        // Assert
        expect(pairs).toEqual([[1, 2]]);
    });

    it("should pair every overlap within the budget, and stop as soon as more boxes overlap than it allows", { timeout: 2000 }, () => {
        // Arrange
        const nested = Array.from({ length: 50000 }, (_, i) => boxOf2(square(-i, -i, 2 * i + 1)));

        // Act
        const within = overlappingBoxPairs2(nested.slice(0, 3), 3);
        const past = overlappingBoxPairs2(nested, 1000);

        // Assert
        expect(within).toEqual([[2, 1], [2, 0], [1, 0]]);
        expect(past).toBeUndefined();
    });

    it("should stop as soon as more boxes overlap than the budget allows, though examining them would fit within it", () => {
        // Arrange
        const nested = Array.from({ length: 100 }, (_, i) => boxOf2(square(-i, -i, 2 * i + 1)));

        // Act
        const pairs = overlappingBoxPairs2(nested, 10);

        // Assert
        expect(pairs).toBeUndefined();
    });

    it("should find no pairs among tens of thousands of stacked strips quickly, though every strip overlaps every other along x", { timeout: 2000 }, () => {
        // Act
        const pairs = overlappingBoxPairs2(stackedStrips(40000), 1000);

        // Assert
        expect(pairs).toEqual([]);
    });

    it("should pair a box with the stacked strips it overlaps when it sweeps along y", () => {
        // Arrange
        const boxes: Box2[] = [...stackedStrips(3000), { min: [50, 0.5], max: [60, 30] }];

        // Act
        const pairs = overlappingBoxPairs2(boxes, 1000);

        // Assert
        expect(ordered(pairs!)).toEqual(Array.from({ length: 11 }, (_, i) => [i, 3000]));
    });

    it("should charge a work budget for the boxes it orders and the candidates it examines, and give up with the budget spent when it cannot cover them", () => {
        // Arrange
        const nested = Array.from({ length: 3 }, (_, i) => boxOf2(square(-i, -i, 2 * i + 1)));

        // Act
        const found = [66, 65, 59].map((capacity) => {
            const budget = new WorkBudget(capacity);
            return [overlappingBoxPairs2(nested, 3, budget), budget.spent, budget.exhausted];
        });

        // Assert
        expect(found).toEqual([[[[2, 1], [2, 0], [1, 0]], 66, false], [undefined, 66, true], [undefined, 60, true]]);
    });

    it("should give up once the boxes it would have to examine along either axis pass the budget, though none of them overlap", { timeout: 2000 }, () => {
        // Act
        const pairs = overlappingBoxPairs2([...stackedStrips(20000), ...sideBySideStrips(20000)], 1000);

        // Assert
        expect(pairs).toBeUndefined();
    });

    it("should find segments that cross and not ones that touch, meet end to end or run along one another", () => {
        // Act
        const found = [
            segmentsCross2([0, 0], [10, 10], [0, 10], [10, 0]),
            segmentsCross2([0, 0], [10, 0], [5, 0], [5, 5]),
            segmentsCross2([0, 0], [10, 0], [10, 0], [20, 5]),
            segmentsCross2([0, 0], [10, 0], [5, 0], [15, 0]),
        ];

        // Assert
        expect(found).toEqual([true, false, false, false]);
    });

    it("should find outlines that cross one another", () => {
        // Act
        const found = [
            outlinesOf(square(0, 0, 20), [[15, 5], [35, 5], [35, 15], [15, 15]]),
            outlinesOf(square(0, 0, 20), square(5, 5, 10)),
            outlinesOf(square(0, 0, 10), square(10, 0, 10)),
        ].map((outlines) => outlinesCross2(outlines, [[0, 1]]));

        // Assert
        expect(found).toEqual([true, false, false]);
    });

    it("should find a crossing among several pairs of outlines, and none where no pair crosses", () => {
        // Arrange
        const outlines = outlinesOf(square(0, 0, 20), square(5, 5, 10), [[15, 5], [35, 5], [35, 15], [15, 15]]);

        // Act
        const found = [outlinesCross2(outlines, [[0, 1], [0, 2]]), outlinesCross2(outlines, [[0, 1]])];

        // Assert
        expect(found).toEqual([true, false]);
    });

    it("should decide within the budget what it decides without one", () => {
        // Arrange
        const crossing = outlinesOf(square(0, 0, 20), [[15, 5], [35, 5], [35, 15], [15, 15]]);
        const nested = outlinesOf(square(0, 0, 20), square(5, 5, 10));

        // Act
        const found = [outlinesCross2(crossing, [[0, 1]], new WorkBudget(100)), outlinesCross2(nested, [[0, 1]], new WorkBudget(100))];

        // Assert
        expect(found).toEqual([true, false]);
    });

    it("should give up before scanning either outline's edges or testing them against each other once the budget cannot cover it", () => {
        // Arrange
        const outlines = outlinesOf(square(0, 0, 10), square(5, 5, 10));

        // Act
        const found = [3, 5, 9, 12].map((most) => outlinesCross2(outlines, [[0, 1]], new WorkBudget(most)));

        // Assert
        expect(found).toEqual([undefined, undefined, undefined, true]);
    });

    it("should charge one budget across calls, so a second call gives up where a fresh budget would have answered", () => {
        // Arrange
        const outlines = outlinesOf(square(0, 0, 10), square(5, 5, 10));
        const budget = new WorkBudget(15);

        // Act
        const found = [outlinesCross2(outlines, [[0, 1]], budget), outlinesCross2(outlines, [[0, 1]], budget), outlinesCross2(outlines, [[0, 1]], new WorkBudget(15))];

        // Assert
        expect(found).toEqual([true, undefined, true]);
        expect(budget.exhausted).toBe(true);
    });

    it("should give up on two long outlines lying on one another once testing their edges would pass the budget", { timeout: 2000 }, () => {
        // Arrange
        const outlines = outlinesOf(circle(100, 100000), circle(100, 100000));

        // Act
        const found = outlinesCross2(outlines, [[0, 1]], new WorkBudget(1000000));

        // Assert
        expect(found).toBeUndefined();
    });
});

describe("polygon interior points", () => {
    it("should pick a point inside a U, whose centroid lies outside it", () => {
        // Act
        const inner = interiorPoint2(U_OUTER);

        // Assert
        expect(insideByCrossings(inner!, U_OUTER)).toBe(true);
    });

    it("should have no interior point for an outline that folds back on itself", () => {
        // Act
        const [flat] = outlinesOf([[0, 0], [10, 0]]);

        // Assert
        expect(flat!.area).toBe(0);
        expect(flat!.inner).toBeUndefined();
    });
});

describe("polygon nesting and fill rules", () => {
    it("should nest a U-shaped hole inside a U-shaped outline", () => {
        // Arrange
        const outlines = outlinesOf(U_OUTER, U_INNER);

        // Act
        const ancestors = nestedOutlines2(outlines, overlappingBoxPairs2(outlines.map((o) => o.box)));

        // Assert
        expect(ancestors).toEqual([[], [0]]);
    });

    it("should nest neither of two outlines whose boxes only overlap, nor one that encloses no area", () => {
        // Arrange
        const outlines = outlinesOf(square(0, 0, 20), [[15, 5], [35, 5], [35, 15], [15, 15]], [[2, 2], [8, 8]]);

        // Act
        const ancestors = nestedOutlines2(outlines, [[0, 1], [0, 2]]);

        // Assert
        expect(ancestors).toEqual([[], [], []]);
    });

    it("should not nest a ring's outline inside its hole", () => {
        // Arrange
        const outlines = outlinesOf(square(5, 5, 10), square(0, 0, 20));

        // Act
        const ancestors = nestedOutlines2(outlines, overlappingBoxPairs2(outlines.map((o) => o.box)));

        // Assert
        expect(ancestors).toEqual([[1], []]);
    });

    it("should make the U with its U-shaped hole one region under even-odd", () => {
        // Act
        const regions = regionsOf(outlinesOf(U_OUTER, U_INNER), "evenOdd");

        // Assert
        expect(regions).toEqual([{ outer: 0, holes: [1] }]);
    });

    it("should cut a nonzero hole that sits under two filled levels from the outermost outline", () => {
        // Act
        const regions = regionsOf(outlinesOf(square(0, 0, 40), square(5, 5, 30), square(10, 10, 20, true), square(15, 15, 10, true)), "nonzero");

        // Assert
        expect(regions).toEqual([{ outer: 0, holes: [3] }]);
    });

    it("should fill an island inside an even-odd hole as a region of its own", () => {
        // Act
        const regions = regionsOf(outlinesOf(square(0, 0, 20), square(5, 5, 10), square(8, 8, 4)), "evenOdd");

        // Assert
        expect(regions).toEqual([{ outer: 0, holes: [1] }, { outer: 2, holes: [] }]);
    });

    it("should nest the later of two outlines lying on one another inside the earlier", () => {
        // Arrange
        const outlines = outlinesOf(square(0, 0, 10), square(0, 0, 10, true), square(0, 0, 10));

        // Act
        const ancestors = nestedOutlines2(outlines, overlappingBoxPairs2(outlines.map((o) => o.box)));

        // Assert
        expect(ancestors).toEqual([[], [0], [0, 1]]);
    });

    it("should fill nothing where two outlines lie on one another wound opposite ways under nonzero, or either way under even-odd", () => {
        // Act
        const opposite = regionsOf(outlinesOf(square(0, 0, 10), square(0, 0, 10, true)), "nonzero");
        const evenOdd = regionsOf(outlinesOf(square(0, 0, 10), square(0, 0, 10)), "evenOdd");

        // Assert
        expect(opposite).toEqual([]);
        expect(evenOdd).toEqual([]);
    });

    it("should fill one region where two outlines lie on one another wound the same way under nonzero", () => {
        // Act
        const regions = regionsOf(outlinesOf(square(0, 0, 10), square(0, 0, 10)), "nonzero");

        // Assert
        expect(regions).toEqual([{ outer: 0, holes: [] }]);
    });

    it("should fill an island inside two outlines that cancel each other", () => {
        // Act
        const regions = regionsOf(outlinesOf(square(0, 0, 10), square(0, 0, 10, true), square(2, 2, 2)), "nonzero");

        // Assert
        expect(regions).toEqual([{ outer: 2, holes: [] }]);
    });

    it("should nest within the budget as it nests without one", () => {
        // Arrange
        const outlines = outlinesOf(circle(1000, 1000), ...Array.from({ length: 100 }, (_, k) => square(-500 + 10 * k, 0, 5)));

        // Act
        const ancestors = nestedOutlines2(outlines, pairsWithFrame(100), new WorkBudget(1000000));

        // Assert
        expect(ancestors).toEqual([[], ...Array.from({ length: 100 }, () => [0])]);
    });

    it("should give up nesting once testing which outline holds which would pass the budget", { timeout: 2000 }, () => {
        // Arrange
        const outlines = outlinesOf(circle(1000, 100000), ...Array.from({ length: 1000 }, (_, k) => square(-500 + (k % 100) * 10, 10 * Math.floor(k / 100), 5)));

        // Act
        const ancestors = nestedOutlines2(outlines, pairsWithFrame(1000), new WorkBudget(1000000));

        // Assert
        expect(ancestors).toBeUndefined();
    });

    it("should give up at once on a budget an earlier stage spent, and nest on a budget that covers the tests", () => {
        // Arrange
        const outlines = outlinesOf(square(0, 0, 20), square(5, 5, 10));
        const spent = new WorkBudget(4);
        spent.spend(5);
        const enough = new WorkBudget(4);

        // Act
        const ancestors = [nestedOutlines2(outlines, [[0, 1]], spent), nestedOutlines2(outlines, [[0, 1]], enough)];

        // Assert
        expect(ancestors).toEqual([undefined, [[], [0]]]);
        expect(enough.spent).toBe(4);
    });

    it("should nest thousands of side by side outlines without comparing every pair", () => {
        // Arrange
        const outlines = outlinesOf(...Array.from({ length: 5000 }, (_, k) => square((k % 70) * 10, Math.floor(k / 70) * 10, 5)));

        // Act
        const pairs = overlappingBoxPairs2(outlines.map((o) => o.box));
        const regions = filledRegions2(outlines, nestedOutlines2(outlines, pairs), "nonzero");

        // Assert
        expect(pairs).toHaveLength(0);
        expect(regions).toHaveLength(5000);
    });
});
