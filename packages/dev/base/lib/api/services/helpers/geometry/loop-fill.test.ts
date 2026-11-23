import { describe, expect, it } from "vitest";
import { filledLoopTriangles } from "./loop-fill";

type Corner = [number, number, number];

const square = (half: number, centre: Corner = [0, 0, 0]): Corner[] =>
    [[-half, -half, 0], [half, -half, 0], [half, half, 0], [-half, half, 0]].map(([x, y, z]): Corner => [x! + centre[0], y! + centre[1], z! + centre[2]]);

const reversed = (loop: readonly Corner[]): Corner[] => [...loop].reverse();

const indexed = (loops: readonly (readonly Corner[])[]): { positions: number[]; loops: number[][] } => {
    let next = 0;
    return { positions: loops.flat(2), loops: loops.map((loop) => loop.map(() => next++)) };
};

const corner = (positions: readonly number[], vertex: number): Corner => [positions[vertex * 3]!, positions[vertex * 3 + 1]!, positions[vertex * 3 + 2]!];

const normalsOf = (positions: readonly number[], triangles: readonly number[]): Corner[] => {
    const normals: Corner[] = [];
    for (let at = 0; at < triangles.length; at += 3) {
        const [ax, ay, az] = corner(positions, triangles[at]!);
        const [bx, by, bz] = corner(positions, triangles[at + 1]!);
        const [cx, cy, cz] = corner(positions, triangles[at + 2]!);
        const u = [bx - ax, by - ay, bz - az];
        const v = [cx - ax, cy - ay, cz - az];
        normals.push([u[1]! * v[2]! - u[2]! * v[1]!, u[2]! * v[0]! - u[0]! * v[2]!, u[0]! * v[1]! - u[1]! * v[0]!]);
    }
    return normals;
};

const areaAlong = (positions: readonly number[], triangles: readonly number[], normal: Corner): number =>
    normalsOf(positions, triangles).reduce((sum, [x, y, z]) => sum + (x * normal[0] + y * normal[1] + z * normal[2]) / 2, 0);

const centresOf = (positions: readonly number[], triangles: readonly number[]): Corner[] => {
    const centres: Corner[] = [];
    for (let at = 0; at < triangles.length; at += 3) {
        const [a, b, c] = [corner(positions, triangles[at]!), corner(positions, triangles[at + 1]!), corner(positions, triangles[at + 2]!)];
        centres.push([(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3]);
    }
    return centres;
};

describe("filledLoopTriangles", () => {
    it("should fill a square with a square hole under the even-odd rule, leaving the hole open", () => {
        // Arrange
        const { positions, loops } = indexed([square(2), square(1)]);

        // Act
        const triangles = filledLoopTriangles(positions, loops, "evenOdd");

        // Assert
        expect(areaAlong(positions, triangles, [0, 0, 1])).toBeCloseTo(16 - 4, 12);
        expect(centresOf(positions, triangles).every(([x, y]) => Math.abs(x) > 1 || Math.abs(y) > 1)).toBe(true);
    });

    it("should leave the hole open whichever way the inner loop runs, the even-odd rule reading no direction", () => {
        // Arrange
        const same = indexed([square(2), square(1)]);
        const opposite = indexed([square(2), reversed(square(1))]);

        // Act
        const ofSame = filledLoopTriangles(same.positions, same.loops, "evenOdd");
        const ofOpposite = filledLoopTriangles(opposite.positions, opposite.loops, "evenOdd");

        // Assert
        expect(areaAlong(same.positions, ofSame, [0, 0, 1])).toBeCloseTo(12, 12);
        expect(areaAlong(opposite.positions, ofOpposite, [0, 0, 1])).toBeCloseTo(12, 12);
    });

    it("should fill an island inside a hole, as the middle of a ring inside a ring", () => {
        // Arrange
        const { positions, loops } = indexed([square(3), square(2), square(1)]);

        // Act
        const triangles = filledLoopTriangles(positions, loops, "evenOdd");

        // Assert
        expect(areaAlong(positions, triangles, [0, 0, 1])).toBeCloseTo(36 - 16 + 4, 12);
    });

    it("should fill nested loops running the same way solid under the nonzero rule", () => {
        // Arrange
        const { positions, loops } = indexed([square(2), square(1)]);

        // Act
        const triangles = filledLoopTriangles(positions, loops, "nonzero");

        // Assert
        expect(areaAlong(positions, triangles, [0, 0, 1])).toBeCloseTo(16, 12);
    });

    it("should face every triangle the way the largest loop faces, a smaller letter wound the other way included", () => {
        // Arrange
        const { positions, loops } = indexed([reversed(square(2)), square(0.5, [10, 0, 0])]);

        // Act
        const triangles = filledLoopTriangles(positions, loops, "evenOdd");

        // Assert
        expect(normalsOf(positions, triangles).every(([, , z]) => z < 0)).toBe(true);
        expect(areaAlong(positions, triangles, [0, 0, -1])).toBeCloseTo(16 + 1, 12);
    });

    it("should fill loops lying in a tilted plane by their true area", () => {
        // Arrange
        const tilt = (loop: readonly Corner[]): Corner[] => loop.map(([x, y]): Corner => [x, y * 0.6, y * 0.8]);
        const { positions, loops } = indexed([tilt(square(2)), tilt(square(1))]);

        // Act
        const triangles = filledLoopTriangles(positions, loops, "evenOdd");

        // Assert
        expect(areaAlong(positions, triangles, [0, -0.8, 0.6])).toBeCloseTo(12, 12);
    });

    it("should read a loop whose last corner repeats its first as the closed loop it is", () => {
        // Arrange
        const outline = square(2);
        const { positions, loops } = indexed([[...outline, outline[0]!]]);

        // Act
        const triangles = filledLoopTriangles(positions, loops, "evenOdd");

        // Assert
        expect(areaAlong(positions, triangles, [0, 0, 1])).toBeCloseTo(16, 12);
    });

    it("should skip loops of fewer than three distinct corners and give nothing without a loop", () => {
        // Arrange
        const { positions, loops } = indexed([[[0, 0, 0], [1, 0, 0]], [[5, 5, 0], [5, 5, 0], [5, 5, 0]]]);

        // Act
        const triangles = filledLoopTriangles(positions, loops, "evenOdd");
        const nothing = filledLoopTriangles([], [], "evenOdd");

        // Assert
        expect(triangles).toEqual([]);
        expect(nothing).toEqual([]);
    });

    it("should give nothing for loops whose corners lie on one line", () => {
        // Arrange
        const { positions, loops } = indexed([[[0, 0, 0], [1, 0, 0], [2, 0, 0]]]);

        // Act
        const triangles = filledLoopTriangles(positions, loops, "evenOdd");

        // Assert
        expect(triangles).toEqual([]);
    });

    it("should leave the positions and the loops it was given as they were", () => {
        // Arrange
        const { positions, loops } = indexed([square(2), square(1)]);
        const before = JSON.stringify({ positions, loops });

        // Act
        filledLoopTriangles(positions, loops, "evenOdd");

        // Assert
        expect(JSON.stringify({ positions, loops })).toBe(before);
    });
});
