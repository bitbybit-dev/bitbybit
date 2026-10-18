import { describe, expect, it } from "vitest";
import { pointInTree, pointOnTree, pointsOnTree, treeBox, treesNested, treesWithin, triangleTree } from "./mesh-proximity";

const cube = (x: number, y: number, z: number, size: number): { positions: number[]; indices: number[] } => {
    const corners = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]];
    return {
        positions: corners.flatMap(([cx, cy, cz]) => [x + cx! * size, y + cy! * size, z + cz! * size]),
        indices: [0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7, 0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5, 2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7],
    };
};

const treeOf = (mesh: { positions: number[]; indices: number[] }): ReturnType<typeof triangleTree> => triangleTree(mesh.positions, mesh.indices);

const together = (first: { positions: number[]; indices: number[] }, second: { positions: number[]; indices: number[] }): { positions: number[]; indices: number[] } =>
    ({ positions: [...first.positions, ...second.positions], indices: [...first.indices, ...second.indices.map(index => index + first.positions.length / 3)] });

describe("mesh proximity", () => {
    it("should tell two cubes half a unit apart are within 0.6 and not within 0.4", () => {
        // Arrange
        const first = treeOf(cube(0, 0, 0, 1));
        const second = treeOf(cube(1.5, 0.2, 0.3, 1));

        // Act & Assert
        expect(treesWithin(first, second, 0.6)).toBe(true);
        expect(treesWithin(first, second, 0.4)).toBe(false);
        expect(treesWithin(second, first, 0.4)).toBe(false);
    });

    it("should find cubes that pass through each other within any distance, and a cube near another's corner by its edges", () => {
        // Arrange
        const first = treeOf(cube(0, 0, 0, 1));
        const crossing = treeOf(cube(0.5, 0.5, 0.5, 1));
        const diagonal = treeOf(cube(1.3, 1.3, 1.3, 1));

        // Act & Assert
        expect(treesWithin(first, crossing, 0)).toBe(true);
        expect(treesWithin(first, diagonal, Math.sqrt(3) * 0.3 + 1e-9)).toBe(true);
        expect(treesWithin(first, diagonal, Math.sqrt(3) * 0.3 - 1e-6)).toBe(false);
    });

    it("should tell a point inside a closed mesh from one outside, and a small cube nested in a big one from a near one", () => {
        // Arrange
        const big = treeOf(cube(0, 0, 0, 10));
        const nested = treeOf(cube(4, 4, 4, 1));

        // Act & Assert
        expect(pointInTree(big, [5, 5, 5])).toBe(true);
        expect(pointInTree(big, [11, 5, 5])).toBe(false);
        expect(pointInTree(big, [5, -0.5, 5])).toBe(false);
        expect(treesWithin(big, nested, 2)).toBe(false);
        expect(pointInTree(big, pointOnTree(nested)!)).toBe(true);
        expect(pointInTree(nested, pointOnTree(big)!)).toBe(false);
        expect([treesNested(big, nested), treesNested(nested, big), treesNested(nested, treeOf(cube(20, 0, 0, 1)))]).toEqual([true, true, false]);
        expect(treesNested(triangleTree([], []), big)).toBe(false);
    });

    it("should find a cube nested in a big one though the nested mesh has a second piece far outside, whichever is given first", () => {
        // Arrange
        const big = treeOf(cube(0, 0, 0, 10));
        const innerAndOuter = treeOf(together(cube(4, 4, 4, 2), cube(-22, -22, -22, 2)));

        // Act & Assert
        expect(treesWithin(big, innerAndOuter, 0)).toBe(false);
        expect(treesNested(big, innerAndOuter)).toBe(true);
        expect(treesNested(innerAndOuter, big)).toBe(true);
    });

    it("should find a big cube around a mesh of two pieces when the piece it holds is the second", () => {
        // Arrange
        const outerFirst = treeOf(together(cube(-22, -22, -22, 2), cube(30, 30, 30, 2)));
        const aroundSecond = treeOf(cube(25, 25, 25, 10));

        // Act & Assert
        expect(treesNested(aroundSecond, outerFirst)).toBe(true);
        expect(treesNested(treeOf(cube(100, 100, 100, 1)), outerFirst)).toBe(false);
    });

    it("should give an empty mesh no box, no point and nothing near or inside it", () => {
        // Arrange
        const empty = triangleTree([], []);
        const first = treeOf(cube(0, 0, 0, 1));

        // Act & Assert
        expect(treeBox(empty)).toBeUndefined();
        expect(pointOnTree(empty)).toBeUndefined();
        expect(treesWithin(empty, first, 100)).toBe(false);
        expect(pointInTree(empty, [0, 0, 0])).toBe(false);
        expect(treeBox(first)).toEqual({ min: [0, 0, 0], max: [1, 1, 1] });
    });

    it("should take points of a mesh's corners spread through its triangles, never more than it has", () => {
        // Arrange
        const box = treeOf(cube(0, 0, 0, 2));
        const corners = new Set(cube(0, 0, 0, 2).positions.reduce<string[]>((found, _, index, all) => index % 3 === 0 ? [...found, all.slice(index, index + 3).join(",")] : found, []));

        // Act
        const four = pointsOnTree(box, 4);
        const all = pointsOnTree(box, 100);
        const none = [pointsOnTree(box, 0), pointsOnTree(treeOf({ positions: [], indices: [] }), 4)];

        // Assert
        expect(four).toHaveLength(4);
        expect(new Set(four.map(point => point.join(","))).size).toBe(4);
        expect(all).toHaveLength(12);
        all.forEach(point => expect(corners.has(point.join(","))).toBe(true));
        expect(none).toEqual([[], []]);
    });

    it("should build a tree deeper than one leaf over a finely split mesh and still find the nearest pair", () => {
        // Arrange
        const strips = Array.from({ length: 40 }, (_, index) => cube(index * 2, 0, 0, 1));
        const positions = strips.flatMap(strip => strip.positions);
        const indices = strips.flatMap((strip, index) => strip.indices.map(vertex => vertex + index * 8));
        const row = triangleTree(positions, indices);
        const probe = treeOf(cube(60.5, 2.25, 0, 1));

        // Act & Assert
        expect(row.lefts.some(left => left >= 0)).toBe(true);
        expect(treesWithin(row, probe, 1.3)).toBe(true);
        expect(treesWithin(row, probe, 1.2)).toBe(false);
    });

    describe("between single triangles", () => {
        it("should find a triangle piercing a sliver whose sharp corner is a ten-millionth wide, through the sliver's face", () => {
            // Arrange
            const sliver = triangleTree([0, 0, 0, 1, 0, 0, 0.5, 1e-7, 0], [0, 1, 2]);
            const spike = triangleTree([0.5, 0.3e-7, -1, 0.5, 0.7e-7, -1, 0.5, 0.5e-7, 1], [0, 1, 2]);

            // Act & Assert
            expect(treesWithin(sliver, spike, 0)).toBe(true);
            expect(treesWithin(spike, sliver, 0)).toBe(true);
        });

        const triangle = (...corners: [number, number, number][]): ReturnType<typeof triangleTree> => triangleTree(corners.flat(), [0, 1, 2]);
        const point = (x: number, y: number, z: number): ReturnType<typeof triangleTree> => triangle([x, y, z], [x, y, z], [x, y, z]);
        const floor = triangle([0, 0, 0], [4, 0, 0], [0, 4, 0]);
        const distances: [string, [number, number, number], number][] = [
            ["over the inside", [1, 1, 1], 1],
            ["beyond the first corner", [-1, -1, 1], Math.sqrt(3)],
            ["beyond the second corner", [5, -1, 1], Math.sqrt(3)],
            ["beyond the third corner", [-1, 5, 1], Math.sqrt(3)],
            ["beside the first edge", [2, -1, 1], Math.sqrt(2)],
            ["beside the second edge", [-1, 2, 1], Math.sqrt(2)],
            ["beside the slanted edge", [3, 3, 1], Math.sqrt(3)],
        ];

        it.each(distances)("should measure a point %s from the triangle", (_, at, distance) => {
            // Act & Assert
            expect(treesWithin(point(...at), floor, distance + 1e-6)).toBe(true);
            expect(treesWithin(point(...at), floor, distance - 1e-6)).toBe(false);
            expect(treesWithin(floor, point(...at), distance - 1e-6)).toBe(false);
        });

        it("should measure two triangles whose nearest points lie inside an edge of each", () => {
            // Arrange
            const lower = triangle([-1, 0, 0], [1, 0, 0], [0, -2, -1]);
            const upper = triangle([0, -1, 1], [0, 1, 1], [0, 0, 3]);

            // Act & Assert
            expect(treesWithin(lower, upper, 1 + 1e-6)).toBe(true);
            expect(treesWithin(lower, upper, 1 - 1e-6)).toBe(false);
        });

        it.each([1e-7, 1, 2e4])("should measure, cross and enclose the same at a scale of %s", scale => {
            // Arrange
            const scaled = (...corners: [number, number, number][]): ReturnType<typeof triangleTree> => triangle(...corners.map(([x, y, z]): [number, number, number] => [x * scale, y * scale, z * scale]));
            const lower = scaled([-1, 0, 0], [1, 0, 0], [0, -2, -1]);
            const upper = scaled([0, -1, 1], [0, 1, 1], [0, 0, 3]);
            const flat = scaled([0, 0, 0], [2, 0, 0], [0, 2, 0]);
            const through = scaled([0.5, 0.5, -1], [0.6, 0.5, 1], [0.5, 0.7, 1]);
            const box = treeOf(cube(0, 0, 0, scale));

            // Act & Assert
            expect(treesWithin(lower, upper, (1 + 1e-6) * scale)).toBe(true);
            expect(treesWithin(lower, upper, (1 - 1e-6) * scale)).toBe(false);
            expect(treesWithin(flat, through, 0)).toBe(true);
            expect(treesWithin(through, flat, 0)).toBe(true);
            expect(pointInTree(box, [scale / 2, scale / 3, scale / 4])).toBe(true);
            expect(pointInTree(box, [scale * 1.5, scale / 3, scale / 4])).toBe(false);
        });

        it("should measure triangles with parallel edges and ones that are only a line", () => {
            // Arrange
            const below = triangle([0, 0, 0], [1, 0, 0], [0.5, -1, 0]);
            const above = triangle([0.2, 0, 1], [1.2, 0, 1], [0.7, 1, 1]);
            const line = triangle([0, 0, 2], [0, 0, 2], [1, 0, 2]);
            const dot = point(0.5, 0, 2.5);

            // Act & Assert
            expect(treesWithin(below, above, 1 + 1e-6)).toBe(true);
            expect(treesWithin(below, above, 1 - 1e-6)).toBe(false);
            expect(treesWithin(line, dot, 0.5 + 1e-6)).toBe(true);
            expect(treesWithin(dot, line, 0.5 - 1e-6)).toBe(false);
            expect(treesWithin(line, above, 1 + 1e-6)).toBe(true);
        });

        it("should walk a deep tree against a single triangle on either side", () => {
            // Arrange
            const strips = Array.from({ length: 30 }, (_, index) => cube(index * 2, 0, 0, 1));
            const row = triangleTree(strips.flatMap(strip => strip.positions), strips.flatMap((strip, index) => strip.indices.map(vertex => vertex + index * 8)));
            const near = triangle([40.5, 2.5, 0], [41.5, 2.5, 0], [41, 3.5, 0]);

            // Act & Assert
            expect(treesWithin(row, near, 1.6)).toBe(true);
            expect(treesWithin(near, row, 1.6)).toBe(true);
            expect(treesWithin(row, near, 1.4)).toBe(false);
        });

        it("should walk a smaller tree against a bigger one, and find no point inside a mesh that is only a point", () => {
            // Arrange
            const rowOf = (count: number, y: number): ReturnType<typeof triangleTree> => {
                const strips = Array.from({ length: count }, (_, index) => cube(index * 2, y, 0, 1));
                return triangleTree(strips.flatMap(strip => strip.positions), strips.flatMap((strip, index) => strip.indices.map(vertex => vertex + index * 8)));
            };

            // Act & Assert
            expect(treesWithin(rowOf(4, 3), rowOf(30, 0), 2.1)).toBe(true);
            expect(treesWithin(rowOf(4, 3), rowOf(30, 0), 1.9)).toBe(false);
            expect(pointInTree(point(0, 0, 0), [0, 0, 0])).toBe(false);
        });
    });
});
