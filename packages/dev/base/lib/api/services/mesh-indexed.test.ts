import { describe, expect, it } from "vitest";
import type * as Inputs from "../inputs";
import { InputError } from "../kernel-calls";
import { BaseBitByBit } from "./base-bitbybit";

const base = new BaseBitByBit();

const CORNERS: Record<string, Inputs.Base.Point3> = {
    p000: [0, 0, 0], p100: [1, 0, 0], p110: [1, 1, 0], p010: [0, 1, 0],
    p001: [0, 0, 1], p101: [1, 0, 1], p111: [1, 1, 1], p011: [0, 1, 1],
};

const FACES = [
    ["p000", "p010", "p110"], ["p000", "p110", "p100"],
    ["p001", "p101", "p111"], ["p001", "p111", "p011"],
    ["p000", "p100", "p101"], ["p000", "p101", "p001"],
    ["p010", "p011", "p111"], ["p010", "p111", "p110"],
    ["p000", "p001", "p011"], ["p000", "p011", "p010"],
    ["p100", "p110", "p111"], ["p100", "p111", "p101"],
];

const cube = (): Inputs.Base.Mesh3 => FACES.map(face => face.map(name => [...CORNERS[name]!]) as Inputs.Base.Triangle3);

const turnedOver = (mesh: Inputs.Base.Mesh3, triangles: number[]): Inputs.Base.Mesh3 =>
    mesh.map((triangle, at) => (triangles.includes(at) ? [triangle[0], triangle[2], triangle[1]] : triangle));

const pointsOf = (mesh: Inputs.Base.IndexedMesh): Inputs.Base.Point3[] =>
    Array.from({ length: mesh.positions.length / 3 }, (_, at) => mesh.positions.slice(at * 3, at * 3 + 3) as Inputs.Base.Point3);

describe("mesh: indexed meshes", () => {
    describe("toIndexed", () => {
        it("should store a corner two triangles share once, and point both triangles at it", () => {
            // Arrange
            const mesh: Inputs.Base.Mesh3 = [[[0, 0, 0], [1, 0, 0], [0, 1, 0]], [[1, 0, 0], [1, 1, 0], [0, 1, 0]]];

            // Act
            const indexed = base.mesh.toIndexed({ mesh });

            // Assert
            expect(indexed).toEqual({ positions: [0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0], indices: [0, 1, 2, 1, 3, 2] });
        });

        it("should join corners within the tolerance, keeping the first, and join none at a tolerance of 0", () => {
            // Arrange
            const mesh: Inputs.Base.Mesh3 = [[[0, 0, 0], [1, 0, 0], [0, 1, 0]], [[1 + 1e-9, 0, 0], [1, 1, 0], [0, 1, 0]]];

            // Act
            const welded = base.mesh.toIndexed({ mesh });
            const apart = base.mesh.toIndexed({ mesh, tolerance: 0 });

            // Assert
            expect(welded.positions).toEqual([0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0]);
            expect(welded.indices).toEqual([0, 1, 2, 1, 3, 2]);
            expect(apart.indices).toEqual([0, 1, 2, 3, 4, 5]);
        });

        it("should weld a cube's 36 corners into its 8 points", () => {
            // Act
            const indexed = base.mesh.toIndexed({ mesh: cube() });

            // Assert
            expect(indexed.positions).toHaveLength(24);
            expect(indexed.indices).toHaveLength(36);
            expect(new Set(indexed.indices).size).toBe(8);
        });

        it("should refuse a mesh that is not a list of triangles of three points", () => {
            // Arrange
            const broken: unknown = [[[0, 0, 0], [1, 0, 0]]];
            const notFinite: unknown = [[[0, 0, 0], [1, 0, 0], [0, Number.NaN, 0]]];

            // Act
            const short = (): unknown => base.mesh.toIndexed({ mesh: broken as Inputs.Base.Mesh3 });
            const nan = (): unknown => base.mesh.toIndexed({ mesh: notFinite as Inputs.Base.Mesh3 });

            // Assert
            expect(short).toThrow(InputError);
            expect(nan).toThrow("`mesh` is not a list of triangles of three points each, every point three finite numbers.");
        });

        it("should refuse a tolerance below 0 or not a number, rather than join nothing", () => {
            // Act
            const negative = (): unknown => base.mesh.toIndexed({ mesh: cube(), tolerance: -1 });
            const notANumber = (): unknown => base.mesh.toIndexed({ mesh: cube(), tolerance: Number.NaN });

            // Assert
            expect(negative).toThrow(InputError);
            expect(negative).toThrow("`tolerance` is not a number of 0 or more.");
            expect(notANumber).toThrow("`tolerance` is not a number of 0 or more.");
        });
    });

    describe("fromIndexed", () => {
        it("should give back the triangles an indexed mesh was made from", () => {
            // Arrange
            const sphere = base.mesh.icosphere({ radius: 2, detail: 1 });

            // Act
            const back = base.mesh.fromIndexed({ mesh: base.mesh.toIndexed({ mesh: sphere }) });

            // Assert
            expect(back).toEqual(sphere);
        });

        it("should refuse positions that are not whole points and indices outside them", () => {
            // Act
            const ragged = (): unknown => base.mesh.fromIndexed({ mesh: { positions: [0, 0, 0, 1], indices: [0, 0, 0] } });
            const outside = (): unknown => base.mesh.fromIndexed({ mesh: { positions: [0, 0, 0, 1, 0, 0, 0, 1, 0], indices: [0, 1, 3] } });
            const fractional = (): unknown => base.mesh.fromIndexed({ mesh: { positions: [0, 0, 0, 1, 0, 0, 0, 1, 0], indices: [0, 1, 1.5] } });
            const nothing: unknown = undefined;
            const missing = (): unknown => base.mesh.fromIndexed({ mesh: nothing as Inputs.Base.IndexedMesh });

            // Assert
            expect(ragged).toThrow("`mesh` does not hold `positions` as finite numbers, three for each point.");
            expect(outside).toThrow("`mesh` does not hold `indices` as point numbers from 0 to one less than its point count, three for each triangle.");
            expect(fractional).toThrow(InputError);
            expect(missing).toThrow(InputError);
        });
    });

    describe("smoothNormals", () => {
        it("should point each normal of a welded sphere out close to its point, leaving the points and triangles as they were", () => {
            // Arrange
            const indexed = base.mesh.toIndexed({ mesh: base.mesh.icosphere({ radius: 1, detail: 3 }) });

            // Act
            const smooth = base.mesh.smoothNormals({ mesh: indexed });

            // Assert
            const normals = pointsOf({ positions: smooth.normals!, indices: [] });
            expect(smooth.positions).toEqual(indexed.positions);
            expect(smooth.indices).toEqual(indexed.indices);
            expect(smooth.positions).not.toBe(indexed.positions);
            expect(normals.every((normal, at) => base.point.distance({ startPoint: normal, endPoint: pointsOf(indexed)[at]! }) < 0.02)).toBe(true);
            expect(normals.every(normal => Math.abs(base.vector.length({ vector: normal }) - 1) < 1e-12)).toBe(true);
        });

        it("should point two of a welded cube's corner normals along its diagonals and tip six 19.47 degrees toward the face with both its triangles there", () => {
            // Arrange
            const indexed = base.mesh.toIndexed({ mesh: cube() });
            const tipped = Math.acos(4 / Math.sqrt(18)) * 180 / Math.PI;

            // Act
            const smooth = base.mesh.smoothNormals({ mesh: indexed });

            // Assert
            const normals = pointsOf({ positions: smooth.normals!, indices: [] });
            const offDiagonal = normals.map((normal, at) => {
                const outward = base.vector.normalized({ vector: base.vector.sub({ first: pointsOf(indexed)[at]!, second: [0.5, 0.5, 0.5] }) })!;
                return base.vector.angleBetween({ first: normal, second: outward });
            });
            expect([...offDiagonal].sort((a, b) => a - b)).toEqual([0, 0, tipped, tipped, tipped, tipped, tipped, tipped].map(angle => expect.closeTo(angle, 9)));
        });
    });

    describe("creasedNormals", () => {
        it("should split a welded cube's corners into one point per face at 30 degrees, each normal square to its face", () => {
            // Arrange
            const indexed = base.mesh.toIndexed({ mesh: cube() });

            // Act
            const creased = base.mesh.creasedNormals({ mesh: indexed, angle: 30 });

            // Assert
            const normals = pointsOf({ positions: creased.normals!, indices: [] });
            expect(creased.positions).toHaveLength(24 * 3);
            expect(normals.every(normal => normal.filter(value => Math.abs(value) === 1).length === 1 && normal.filter(value => value === 0).length === 2)).toBe(true);
            expect(base.mesh.signedVolume({ mesh: base.mesh.fromIndexed({ mesh: creased }) })).toBeCloseTo(1, 12);
        });

        it("should keep the cube's 8 points and smooth across every edge at 180 degrees", () => {
            // Arrange
            const indexed = base.mesh.toIndexed({ mesh: cube() });

            // Act
            const creased = base.mesh.creasedNormals({ mesh: indexed, angle: 180 });

            // Assert
            expect(creased.positions).toHaveLength(8 * 3);
            expect(creased.normals).toHaveLength(8 * 3);
        });

        it("should keep positions in full precision, not rounded for a GPU", () => {
            // Arrange
            const fine = 0.1 + 1e-12;
            const mesh: Inputs.Base.IndexedMesh = { positions: [0, 0, 0, fine, 0, 0, 0, fine, 0], indices: [0, 1, 2] };

            // Act
            const creased = base.mesh.creasedNormals({ mesh });

            // Assert
            expect(creased.positions).toEqual([0, 0, 0, fine, 0, 0, 0, fine, 0]);
            expect(creased.normals).toEqual([0, 0, 1, 0, 0, 1, 0, 0, 1]);
        });

        it("should refuse an angle outside 0 to 180 degrees", () => {
            // Arrange
            const indexed = base.mesh.toIndexed({ mesh: cube() });

            // Act
            const wide = (): unknown => base.mesh.creasedNormals({ mesh: indexed, angle: 200 });

            // Assert
            expect(wide).toThrow("`angle` is not a number of degrees from 0 to 180.");
        });
    });

    describe("windingPieces", () => {
        it("should count separate triangles as separate pieces with nothing to turn over", () => {
            // Arrange
            const mesh: Inputs.Base.IndexedMesh = { positions: [0, 0, 0, 1, 0, 0, 0, 1, 0, 5, 0, 0, 6, 0, 0, 5, 1, 0], indices: [0, 1, 2, 3, 4, 5] };

            // Act
            const pieces = base.mesh.windingPieces({ mesh });

            // Assert
            expect(pieces).toEqual({ turnOver: [false, false], pieces: [0, 1], count: 2 });
        });

        it("should name the one triangle of a cube that winds against the first", () => {
            // Arrange
            const indexed = base.mesh.toIndexed({ mesh: turnedOver(cube(), [7]) });

            // Act
            const pieces = base.mesh.windingPieces({ mesh: indexed });

            // Assert
            expect(pieces.count).toBe(1);
            expect(pieces.pieces.every(piece => piece === 0)).toBe(true);
            expect(pieces.turnOver.map((turn, at) => (turn ? at : -1)).filter(at => at >= 0)).toEqual([7]);
        });
    });

    describe("orientConsistently", () => {
        it("should turn back the triangles of a cube written inside out, leaving its points as they were", () => {
            // Arrange
            const indexed = base.mesh.toIndexed({ mesh: turnedOver(cube(), [0, 7, 11]) });

            // Act
            const mended = base.mesh.orientConsistently({ mesh: indexed });

            // Assert
            expect(mended.positions).toEqual(indexed.positions);
            expect(mended.normals).toBeUndefined();
            expect(base.mesh.fromIndexed({ mesh: mended })).toEqual(base.mesh.fromIndexed({ mesh: base.mesh.toIndexed({ mesh: cube() }) }));
        });

        it("should follow the area, not the count: one large triangle outweighs three slivers wound against it", () => {
            // Arrange
            const fan: Inputs.Base.IndexedMesh = {
                positions: [0, 0, 0, 10, 0, 0, 0, 10, 0, -0.1, 1, 0, -0.2, 0.5, 0, -0.3, 0.2, 0],
                indices: [0, 3, 2, 0, 4, 3, 0, 5, 4, 0, 1, 2],
            };

            // Act
            const mended = base.mesh.orientConsistently({ mesh: fan });

            // Assert
            expect(base.mesh.windingPieces({ mesh: fan }).turnOver).toEqual([false, false, false, true]);
            expect(mended.indices).toEqual([0, 2, 3, 0, 3, 4, 0, 4, 5, 0, 1, 2]);
        });

        it("should keep a piece wound inward on purpose as it is", () => {
            // Arrange
            const inward = base.mesh.toIndexed({ mesh: turnedOver(cube(), FACES.map((_, at) => at)) });

            // Act
            const kept = base.mesh.orientConsistently({ mesh: inward });

            // Assert
            expect(kept.indices).toEqual(inward.indices);
            expect(base.mesh.signedVolume({ mesh: base.mesh.fromIndexed({ mesh: kept }) })).toBeCloseTo(-1, 12);
        });

        it("should not change the mesh it was given", () => {
            // Arrange
            const indexed = base.mesh.toIndexed({ mesh: turnedOver(cube(), [3]) });
            const before = structuredClone(indexed);

            // Act
            base.mesh.orientConsistently({ mesh: indexed });

            // Assert
            expect(indexed).toEqual(before);
        });
    });
});
