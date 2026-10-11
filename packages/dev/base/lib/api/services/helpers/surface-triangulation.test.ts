import { describe, expect, it } from "vitest";
import type * as Inputs from "../../inputs";
import { refinedSurfaceMesh } from "./surface-triangulation";
import { cross3, dot3, length3, subtract3 } from "./vectors";

type Point2 = Inputs.Base.Point2;
type Point3 = Inputs.Base.Point3;

interface CylinderBoundary {
    readonly uv: Point2[];
    readonly loop: number[];
}

const SEGMENTS = 16;
const MAX_TURN = (2 * Math.PI) / 32;
const plane = (u: number, v: number): Point3 => [u, v, 0];
const cylinder = (u: number, v: number): Point3 => [Math.cos(u), Math.sin(u), v];

function areaOf(positions: readonly Point3[], triangles: readonly number[]): number {
    let area = 0;
    for (let at = 0; at < triangles.length; at += 3) {
        const [a, b, c] = [positions[triangles[at]!]!, positions[triangles[at + 1]!]!, positions[triangles[at + 2]!]!];
        area += length3(cross3(subtract3(b, a), subtract3(c, a))) / 2;
    }
    return area;
}

function halfCylinderBoundary(height = 1): CylinderBoundary {
    const bottom: Point2[] = Array.from({ length: SEGMENTS + 1 }, (_, at) => [(Math.PI * at) / SEGMENTS, 0]);
    const top: Point2[] = bottom.map(([u]) => [u, height] as Point2).reverse();
    const uv = [...bottom, ...top];
    return { uv, loop: uv.map((_, at) => at) };
}

describe("refinedSurfaceMesh", () => {
    it("should leave a flat face as the triangles that fill its outline", () => {
        // Arrange
        const uv: Point2[] = [[0, 0], [2, 0], [2, 1], [0, 1]];

        // Act
        const mesh = refinedSurfaceMesh(uv, uv.map(([u, v]) => plane(u, v)), [[0, 1, 2, 3]], plane);

        // Assert
        expect(mesh.positions).toHaveLength(4);
        expect(mesh.triangles).toHaveLength(6);
        expect(areaOf(mesh.positions, mesh.triangles)).toBeCloseTo(2, 12);
    });

    it("should leave a hole in a flat face open", () => {
        // Arrange
        const uv: Point2[] = [[0, 0], [4, 0], [4, 4], [0, 4], [1, 1], [1, 3], [3, 3], [3, 1]];

        // Act
        const mesh = refinedSurfaceMesh(uv, uv.map(([u, v]) => plane(u, v)), [[0, 1, 2, 3], [4, 5, 6, 7]], plane);

        // Assert
        expect(areaOf(mesh.positions, mesh.triangles)).toBeCloseTo(12, 12);
    });

    it("should fill a curved face without overlapping or flat triangles, bending no more than a curve's segments, keeping its boundary edges whole", () => {
        // Arrange
        const { uv, loop } = halfCylinderBoundary();
        const positions = uv.map(([u, v]) => cylinder(u, v));

        // Act
        const mesh = refinedSurfaceMesh(uv, positions, [loop], cylinder);
        const triangles = Array.from({ length: mesh.triangles.length / 3 }, (_, at) => mesh.triangles.slice(at * 3, at * 3 + 3));
        const bend = Math.max(...triangles.flatMap((corners) => corners.map((vertex, at) => {
            const [a, b] = [mesh.positions[vertex]!, mesh.positions[corners[(at + 1) % 3]!]!];
            const cosine = dot3([a[0], a[1], 0], [b[0], b[1], 0]);
            return Math.acos(Math.max(-1, Math.min(1, cosine)));
        })));
        const flat = triangles.filter(([a, b, c]) => length3(cross3(subtract3(mesh.positions[b!]!, mesh.positions[a!]!), subtract3(mesh.positions[c!]!, mesh.positions[a!]!))) < 1e-12);
        const boundaryUses = loop.map((vertex, at) => {
            const next = loop[(at + 1) % loop.length]!;
            return triangles.filter((corners) => corners.includes(vertex) && corners.includes(next)).length;
        });

        // Assert
        expect(mesh.positions.every(([x, y]) => Math.abs(Math.hypot(x, y) - 1) < 1e-12)).toBe(true);
        expect(bend).toBeLessThanOrEqual(MAX_TURN + 1e-9);
        expect(boundaryUses.every((count) => count === 1)).toBe(true);
        expect(flat).toEqual([]);
        expect(areaOf(mesh.positions, mesh.triangles)).toBeGreaterThanOrEqual(SEGMENTS * 2 * Math.sin(Math.PI / (2 * SEGMENTS)) - 1e-9);
        expect(areaOf(mesh.positions, mesh.triangles)).toBeLessThanOrEqual(Math.PI);
    });

    it("should fill a long thin pipe's face with straight strips along it and no points inside", () => {
        // Arrange
        const { uv, loop } = halfCylinderBoundary(2000);
        const thin = (u: number, v: number): Point3 => [0.0075 * Math.cos(u), 0.0075 * Math.sin(u), v];

        // Act
        const mesh = refinedSurfaceMesh(uv, uv.map(([u, v]) => thin(u, v)), [loop], thin);

        // Assert
        expect(mesh.positions).toHaveLength(uv.length);
        expect(mesh.triangles).toHaveLength((uv.length - 2) * 3);
    });

    it("should add points inside a face curved both ways, all on the surface, until no triangle bends more than a curve's segment", () => {
        // Arrange
        const sphere = (u: number, v: number): Point3 => [Math.cos(v) * Math.cos(u), Math.cos(v) * Math.sin(u), Math.sin(v)];
        const equator: Point2[] = Array.from({ length: 2 * SEGMENTS + 1 }, (_, at) => [(Math.PI * at) / SEGMENTS, 0]);
        const up: Point2[] = Array.from({ length: SEGMENTS / 2 - 1 }, (_, at) => [2 * Math.PI, (Math.PI * (at + 1)) / SEGMENTS]);
        const down: Point2[] = up.map(([, v]) => [0, v] as Point2).reverse();
        const uv: Point2[] = [...equator, ...up, [2 * Math.PI, Math.PI / 2], [0, Math.PI / 2], ...down];
        const positions = uv.map(([u, v]) => sphere(u, v));

        // Act
        const mesh = refinedSurfaceMesh(uv, positions, [uv.map((_, at) => at)], sphere);

        // Assert
        expect(mesh.positions.length).toBeGreaterThan(uv.length);
        expect(mesh.positions.every((point) => Math.abs(length3(point) - 1) < 1e-12)).toBe(true);
        expect(areaOf(mesh.positions, mesh.triangles)).toBeGreaterThan(0.97 * 2 * Math.PI);
        expect(areaOf(mesh.positions, mesh.triangles)).toBeLessThanOrEqual(2 * Math.PI);
    });

    it("should fill a curved triangle given by its corners alone from its middle", () => {
        // Arrange
        const sphere = (u: number, v: number): Point3 => [Math.cos(v) * Math.cos(u), Math.cos(v) * Math.sin(u), Math.sin(v)];
        const uv: Point2[] = [[0, 0], [Math.PI / 2, 0], [Math.PI / 4, Math.PI / 3]];

        // Act
        const mesh = refinedSurfaceMesh(uv, uv.map(([u, v]) => sphere(u, v)), [[0, 1, 2]], sphere);

        // Assert
        expect(mesh.positions.length).toBeGreaterThan(3);
        expect(mesh.positions.every((point) => Math.abs(length3(point) - 1) < 1e-12)).toBe(true);
    });

    it("should mesh a face that meets its surface's apex, where the surface has no normal, and keep a face without area as its flat triangle", () => {
        // Arrange
        const cone = (u: number, v: number): Point3 => [v * Math.cos(u), v * Math.sin(u), v];
        const uv: Point2[] = [[0, 0], [0, 1], [Math.PI / 4, 1], [Math.PI / 2, 1], [Math.PI / 2, 0]];
        const flat: Point2[] = [[0, 0], [1, 0], [2, 0]];

        // Act
        const apex = refinedSurfaceMesh(uv, uv.map(([u, v]) => cone(u, v)), [[0, 1, 2, 3, 4]], cone);
        const none = refinedSurfaceMesh(flat, flat.map(([u, v]) => plane(u, v)), [[0, 1, 2]], plane);

        // Assert
        expect(apex.triangles.length).toBeGreaterThan(0);
        expect(apex.positions.every(([x, y, z]) => Math.abs(Math.hypot(x, y) - z) < 1e-12)).toBe(true);
        expect([none.positions.length, none.triangles]).toEqual([3, [0, 1, 2]]);
    });
});
