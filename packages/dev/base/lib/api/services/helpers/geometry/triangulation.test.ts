import { describe, expect, it } from "vitest";
import { triangulateFace } from "./triangulation";

function corner(positions: readonly number[], vertex: number): [number, number, number] {
    return [positions[vertex * 3]!, positions[vertex * 3 + 1]!, positions[vertex * 3 + 2]!];
}

function triangleNormals(positions: readonly number[], triangles: readonly number[]): [number, number, number][] {
    const normals: [number, number, number][] = [];
    for (let at = 0; at < triangles.length; at += 3) {
        const [ax, ay, az] = corner(positions, triangles[at]!);
        const [bx, by, bz] = corner(positions, triangles[at + 1]!);
        const [cx, cy, cz] = corner(positions, triangles[at + 2]!);
        const u = [bx - ax, by - ay, bz - az];
        const v = [cx - ax, cy - ay, cz - az];
        normals.push([u[1]! * v[2]! - u[2]! * v[1]!, u[2]! * v[0]! - u[0]! * v[2]!, u[0]! * v[1]! - u[1]! * v[0]!]);
    }
    return normals;
}

function area(positions: readonly number[], triangles: readonly number[]): number {
    return triangleNormals(positions, triangles).reduce((sum, [x, y, z]) => sum + Math.hypot(x, y, z) / 2, 0);
}

function facing(positions: readonly number[], triangles: readonly number[], normal: readonly number[]): boolean {
    return triangleNormals(positions, triangles).every(([x, y, z]) => x * normal[0]! + y * normal[1]! + z * normal[2]! >= 0);
}

function edges(triangles: readonly number[]): string[] {
    const all: string[] = [];
    for (let at = 0; at < triangles.length; at += 3) {
        const [a, b, c] = [triangles[at]!, triangles[at + 1]!, triangles[at + 2]!];
        all.push(`${a}>${b}`, `${b}>${c}`, `${c}>${a}`);
    }
    return all;
}

function repeatedCorners(triangles: readonly number[]): number[][] {
    const found: number[][] = [];
    for (let at = 0; at < triangles.length; at += 3) {
        const [a, b, c] = [triangles[at]!, triangles[at + 1]!, triangles[at + 2]!];
        if (a === b || b === c || c === a) {
            found.push([a, b, c]);
        }
    }
    return found;
}

function loopEdges(loop: readonly number[]): string[] {
    return loop.map((vertex, at) => `${vertex}>${loop[(at + 1) % loop.length]!}`);
}

function boundaryOf(triangles: readonly number[]): string[] {
    const all = edges(triangles);
    const set = new Set(all);
    return all.filter((edge) => {
        const [a, b] = edge.split(">");
        return !set.has(`${b}>${a}`);
    }).sort();
}

const SQUARE = [0, 0, 0, 4, 0, 0, 4, 4, 0, 0, 4, 0];

function seeded(seed: number): () => number {
    let state = seed;
    return () => {
        state = (state * 1664525 + 1013904223) % 4294967296;
        return state / 4294967296;
    };
}

function starFace(random: () => number, corners: number, tilt: number): { positions: number[]; outer: number[]; hole: number[]; area: number } {
    const flat: [number, number][] = [];
    for (let at = 0; at < corners; at++) {
        const angle = (at / corners) * 2 * Math.PI;
        const radius = 2 + random() * 8;
        flat.push([radius * Math.cos(angle), radius * Math.sin(angle)]);
    }
    const holeFlat: [number, number][] = [[-1, -1], [-1, 1], [1, 1], [1, -1]];
    const positions = [...flat, ...holeFlat].flatMap(([x, y]) => [x, y * Math.cos(tilt), y * Math.sin(tilt)]);
    let twice = 0;
    flat.forEach(([x, y], at) => {
        const [nx, ny] = flat[(at + 1) % corners]!;
        twice += x * ny - nx * y;
    });
    const outer = flat.map((_, at) => at);
    return { positions, outer, hole: [corners, corners + 1, corners + 2, corners + 3], area: twice / 2 - 4 };
}

describe("triangulateFace", () => {
    it("should return a triangle as it is", () => {
        // Act
        const triangles = triangulateFace(SQUARE, [[0, 1, 2]]);

        // Assert
        expect(triangles).toEqual([0, 1, 2]);
    });

    it("should split a convex face into a fan that keeps the loop's direction", () => {
        // Act
        const triangles = triangulateFace(SQUARE, [[0, 1, 2, 3]]);

        // Assert
        expect(triangles).toEqual([0, 1, 2, 0, 2, 3]);
        expect(facing(SQUARE, triangles, [0, 0, 1])).toBe(true);
    });

    it("should keep a face that looks down facing down", () => {
        // Act
        const triangles = triangulateFace(SQUARE, [[3, 2, 1, 0]]);

        // Assert
        expect(facing(SQUARE, triangles, [0, 0, -1])).toBe(true);
        expect(area(SQUARE, triangles)).toBeCloseTo(16, 12);
    });

    it("should cut an L-shaped face into triangles that cover it once and use every edge of its loop", () => {
        // Arrange
        const positions = [0, 0, 0, 4, 0, 0, 4, 1, 0, 1, 1, 0, 1, 4, 0, 0, 4, 0];
        const loop = [0, 1, 2, 3, 4, 5];

        // Act
        const triangles = triangulateFace(positions, [loop]);

        // Assert
        expect(triangles).toHaveLength(12);
        expect(area(positions, triangles)).toBeCloseTo(7, 12);
        expect(facing(positions, triangles, [0, 0, 1])).toBe(true);
        expect(boundaryOf(triangles)).toEqual(loopEdges(loop).sort());
    });

    it("should do the same for an L-shaped face standing in a wall, facing either way", () => {
        // Arrange
        const positions = [0, 0, 0, 0, 4, 0, 0, 4, 1, 0, 1, 1, 0, 1, 4, 0, 0, 4];
        const loop = [0, 1, 2, 3, 4, 5];
        const reversed = [...loop].reverse();

        // Act
        const forward = triangulateFace(positions, [loop]);
        const backward = triangulateFace(positions, [reversed]);

        // Assert
        expect(facing(positions, forward, [1, 0, 0])).toBe(true);
        expect(facing(positions, backward, [-1, 0, 0])).toBe(true);
        expect(boundaryOf(forward)).toEqual(loopEdges(loop).sort());
        expect(boundaryOf(backward)).toEqual(loopEdges(reversed).sort());
    });

    it("should leave a hole open, bridged to the outline, whichever way the hole was given", () => {
        // Arrange
        const positions = [...SQUARE, 1, 1, 0, 3, 1, 0, 3, 3, 0, 1, 3, 0];
        const outer = [0, 1, 2, 3];
        const hole = [7, 6, 5, 4];

        // Act
        const clockwiseHole = triangulateFace(positions, [outer, hole]);
        const sameWayHole = triangulateFace(positions, [outer, [...hole].reverse()]);

        // Assert
        for (const triangles of [clockwiseHole, sameWayHole]) {
            expect(area(positions, triangles)).toBeCloseTo(12, 12);
            expect(facing(positions, triangles, [0, 0, 1])).toBe(true);
            expect(boundaryOf(triangles)).toEqual([...loopEdges(outer), ...loopEdges(hole)].sort());
        }
    });

    it("should bridge several holes", () => {
        // Arrange
        const positions = [0, 0, 0, 10, 0, 0, 10, 4, 0, 0, 4, 0, 1, 1, 0, 3, 1, 0, 3, 3, 0, 1, 3, 0, 6, 1, 0, 8, 1, 0, 8, 3, 0, 6, 3, 0];

        // Act
        const triangles = triangulateFace(positions, [[0, 1, 2, 3], [7, 6, 5, 4], [11, 10, 9, 8]]);

        // Assert
        expect(area(positions, triangles)).toBeCloseTo(32, 12);
        expect(boundaryOf(triangles)).toEqual([...loopEdges([0, 1, 2, 3]), ...loopEdges([7, 6, 5, 4]), ...loopEdges([11, 10, 9, 8])].sort());
    });

    it("should bridge holes stacked one above another, the later ones past the bridges of the earlier", () => {
        // Arrange
        const holes = [1, 4, 7].map((y, at) => {
            const first = 4 + at * 4;
            return { loop: [first + 3, first + 2, first + 1, first], corners: [4, y, 0, 6, y, 0, 6, y + 2, 0, 4, y + 2, 0] };
        });
        const positions = [0, 0, 0, 10, 0, 0, 10, 10, 0, 0, 10, 0, ...holes.flatMap((hole) => hole.corners)];

        // Act
        const triangles = triangulateFace(positions, [[0, 1, 2, 3], ...holes.map((hole) => hole.loop)]);

        // Assert
        expect(area(positions, triangles)).toBeCloseTo(88, 12);
        expect(boundaryOf(triangles)).toEqual([...loopEdges([0, 1, 2, 3]), ...holes.flatMap((hole) => loopEdges(hole.loop))].sort());
    });

    it("should bridge two holes whose leftmost corners sit at the same place", () => {
        // Arrange
        const positions = [0, 0, 0, 10, 0, 0, 10, 10, 0, 0, 10, 0, 2, 5, 0, 4, 3, 0, 4, 4, 0, 2, 5, 0, 4, 6, 0, 4, 7, 0];

        // Act
        const triangles = triangulateFace(positions, [[0, 1, 2, 3], [4, 6, 5], [7, 9, 8]]);

        // Assert
        expect(area(positions, triangles)).toBeCloseTo(98, 12);
        for (const edge of [...loopEdges([0, 1, 2, 3]), ...loopEdges([4, 6, 5]), ...loopEdges([7, 9, 8])]) {
            expect(edges(triangles)).toContain(edge);
        }
    });

    it("should bridge a hole in line with a slit in the outline to the side of the slit that faces it", () => {
        // Arrange
        const positions = [0, 0, 0, 10, 0, 0, 10, 10, 0, 0, 10, 0, 0, 5, 0, 5, 5, 0, 0, 5, 0, 7, 5, 0, 9, 4, 0, 9, 6, 0];
        const outer = [0, 1, 2, 3, 4, 5, 6];

        // Act
        const triangles = triangulateFace(positions, [outer, [7, 9, 8]]);

        // Assert
        expect(area(positions, triangles)).toBeCloseTo(98, 12);
        for (const edge of [...loopEdges(outer), ...loopEdges([7, 9, 8])]) {
            expect(edges(triangles)).toContain(edge);
        }
    });

    it("should bridge a hole whose corner lies on the line another hole was bridged along", () => {
        // Arrange
        const positions = [0, 0, 0, 10, 0, 0, 10, 10, 0, 0, 10, 0, 2, 2, 0, 4, 1, 0, 4, 2, 0, 5, 5, 0, 7, 4, 0, 7, 5, 0];
        const holes = [[4, 6, 5], [7, 9, 8]];

        // Act
        const triangles = triangulateFace(positions, [[0, 1, 2, 3], ...holes]);

        // Assert
        expect(area(positions, triangles)).toBeCloseTo(98, 12);
        expect(facing(positions, triangles, [0, 0, 1])).toBe(true);
        expect(boundaryOf(triangles)).toEqual([...loopEdges([0, 1, 2, 3]), ...holes.flatMap(loopEdges)].sort());
    });

    it("should bridge a hole that touches the outline straight to the side it touches", () => {
        // Arrange
        const positions = [0, 0, 0, 10, 0, 0, 10, 10, 0, 0, 10, 0, 0, 5, 0, 2, 4, 0, 2, 6, 0];

        // Act
        const triangles = triangulateFace(positions, [[0, 1, 2, 3], [4, 6, 5]]);

        // Assert
        expect(area(positions, triangles)).toBeCloseTo(98, 12);
        expect(repeatedCorners(triangles)).toEqual([]);
        for (const edge of [...loopEdges([0, 1, 2, 3]), ...loopEdges([4, 6, 5])]) {
            expect(edges(triangles)).toContain(edge);
        }
    });

    it("should keep a point lying on an edge, so the face still meets a neighbour split there", () => {
        // Arrange
        const positions = [...SQUARE, 2, 0, 0, 0, 2, 0];
        const loop = [0, 4, 1, 2, 3, 5];

        // Act
        const triangles = triangulateFace(positions, [loop]);

        // Assert
        expect(boundaryOf(triangles)).toEqual(loopEdges(loop).sort());
        expect(area(positions, triangles)).toBeCloseTo(16, 12);
    });

    it("should keep a point on an edge of a face that is not convex", () => {
        // Arrange
        const positions = [0, 0, 0, 2, 0, 0, 4, 0, 0, 4, 1, 0, 1, 1, 0, 1, 4, 0, 0, 4, 0];
        const loop = [0, 1, 2, 3, 4, 5, 6];

        // Act
        const triangles = triangulateFace(positions, [loop]);

        // Assert
        expect(boundaryOf(triangles)).toEqual(loopEdges(loop).sort());
        expect(area(positions, triangles)).toBeCloseTo(7, 12);
    });

    it("should fan a face with no area so its edges are still used", () => {
        // Arrange
        const positions = [0, 0, 0, 1, 0, 0, 2, 0, 0, 3, 0, 0];

        // Act
        const triangles = triangulateFace(positions, [[0, 1, 2, 3]]);

        // Assert
        expect(triangles).toEqual([0, 1, 2, 0, 2, 3]);
    });

    it("should drop repeated vertices and return nothing for a loop of fewer than three", () => {
        // Act
        const repeated = triangulateFace(SQUARE, [[0, 0, 1, 2, 2, 0]]);
        const tooFew = triangulateFace(SQUARE, [[0, 1, 1, 0]]);
        const onePoint = triangulateFace(SQUARE, [[2, 2, 2]]);
        const none = triangulateFace(SQUARE, []);

        // Assert
        expect(repeated).toEqual([1, 2, 0]);
        expect(tooFew).toEqual([]);
        expect(onePoint).toEqual([]);
        expect(none).toEqual([]);
    });

    it("should still use every edge of a loop that crosses itself", () => {
        // Arrange
        const positions = [0, 0, 0, 4, 4, 0, 4, 0, 0, 0, 4, 0, 2, 6, 0];
        const loop = [0, 1, 2, 3, 4];

        // Act
        const triangles = triangulateFace(positions, [loop]);

        // Assert
        expect(triangles).toHaveLength(9);
        for (const edge of loopEdges(loop)) {
            expect(edges(triangles)).toContain(edge);
        }
    });

    it("should fall back to the nearest outline vertex when no ray from a hole meets the outline", () => {
        // Arrange
        const positions = [...SQUARE, -2, 1, 0, -1, 1, 0, -1, 2, 0];

        // Act
        const triangles = triangulateFace(positions, [[0, 1, 2, 3], [6, 5, 4]]);

        // Assert
        expect(triangles.length % 3).toBe(0);
        expect(repeatedCorners(triangles)).toEqual([]);
        for (const edge of [...loopEdges([0, 1, 2, 3]), ...loopEdges([6, 5, 4])]) {
            expect(edges(triangles)).toContain(edge);
        }
    });

    it("should cover random star-shaped faces with a hole exactly once, using every edge, at any tilt", () => {
        // Arrange
        const random = seeded(7);
        const faces = Array.from({ length: 60 }, (_, at) => starFace(random, 5 + Math.floor(random() * 60), at * 0.37));

        // Act
        const results = faces.map((face) => triangulateFace(face.positions, [face.outer, face.hole]));

        // Assert
        results.forEach((triangles, at) => {
            const face = faces[at]!;
            expect(area(face.positions, triangles)).toBeCloseTo(face.area, 9);
            expect(boundaryOf(triangles)).toEqual([...loopEdges(face.outer), ...loopEdges(face.hole)].sort());
        });
    });
});
