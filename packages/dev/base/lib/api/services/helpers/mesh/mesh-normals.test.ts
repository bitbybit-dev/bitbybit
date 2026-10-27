import { describe, expect, it } from "vitest";
import { computeVertexNormals, creasedMesh } from "./mesh-normals";

describe("computeVertexNormals", () => {

    const unitTriangleInXY = {
        positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
        indices: [0, 1, 2],
    };

    it("should give one normal per position", () => {
        // Act
        const normals = computeVertexNormals(unitTriangleInXY.positions, unitTriangleInXY.indices);

        // Assert
        expect(normals).toHaveLength(unitTriangleInXY.positions.length);
    });

    it("should point a triangle's normal along the axis it faces", () => {
        // Act
        const normals = computeVertexNormals(unitTriangleInXY.positions, unitTriangleInXY.indices);

        // Assert
        expect(normals).toStrictEqual([0, 0, 1, 0, 0, 1, 0, 0, 1]);
    });

    it("should average the normals of the faces a vertex is shared by", () => {
        // Arrange
        const foldAlongTheYAxis = {
            positions: [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
            indices: [0, 1, 2, 0, 3, 1],
        };

        // Act
        const normals = computeVertexNormals(foldAlongTheYAxis.positions, foldAlongTheYAxis.indices);

        // Assert
        const shared = [normals[0]!, normals[1]!, normals[2]!];
        expect(shared[0]).toBeCloseTo(-Math.SQRT1_2);
        expect(shared[1]).toBeCloseTo(0);
        expect(shared[2]).toBeCloseTo(-Math.SQRT1_2);
    });

    it("should return unit length normals", () => {
        // Arrange
        const scaleneTriangle = {
            positions: [0, 0, 0, 7, 0, 0, 0, 3, 5],
            indices: [0, 1, 2],
        };

        // Act
        const normals = computeVertexNormals(scaleneTriangle.positions, scaleneTriangle.indices);

        // Assert
        for (let i = 0; i < normals.length; i += 3) {
            const x = normals[i]!, y = normals[i + 1]!, z = normals[i + 2]!;
            expect(Math.sqrt(x * x + y * y + z * z)).toBeCloseTo(1);
        }
    });

    it("should leave a degenerate triangle's normal at zero rather than dividing by nothing", () => {
        // Arrange
        const collapsedToALine = {
            positions: [0, 0, 0, 1, 0, 0, 2, 0, 0],
            indices: [0, 1, 2],
        };

        // Act
        const normals = computeVertexNormals(collapsedToALine.positions, collapsedToALine.indices);

        // Assert
        expect(normals).toStrictEqual([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    });

    it("should give no normals for a mesh with no positions", () => {
        // Act
        const normals = computeVertexNormals([], []);

        // Assert
        expect(normals).toStrictEqual([]);
    });
});

const CUBE_POSITIONS = [0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1];
const CUBE_TRIANGLES = [0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7, 0, 1, 5, 0, 5, 4, 2, 3, 7, 2, 7, 6, 0, 4, 7, 0, 7, 3, 1, 2, 6, 1, 6, 5];

function normalsAt(mesh: ReturnType<typeof creasedMesh>): number[][] {
    return Array.from({ length: mesh.normals.length / 3 }, (_, at) => Array.from(mesh.normals.slice(at * 3, at * 3 + 3)));
}

describe("creasedMesh", () => {
    it("should keep a cube's edges sharp, splitting every shared corner into one vertex per face", () => {
        // Act
        const mesh = creasedMesh(CUBE_POSITIONS, CUBE_TRIANGLES, 40);
        const normals = normalsAt(mesh);

        // Assert
        expect(mesh.positions.length / 3).toBe(24);
        expect(mesh.indices).toHaveLength(36);
        expect(normals.every((normal) => normal.filter((value) => Math.abs(value) > 1e-9).length === 1)).toBe(true);
        expect(new Set(normals.map((normal) => normal.join(","))).size).toBe(6);
    });

    it("should shade every face flat at an angle of 0, the two triangles of one face still sharing their corners", () => {
        // Act
        const mesh = creasedMesh(CUBE_POSITIONS, CUBE_TRIANGLES, 0);

        // Assert
        expect(mesh.positions.length / 3).toBe(24);
    });

    it("should smooth across an edge flatter than the angle and keep one sharper than it", () => {
        // Arrange
        const bend = (degrees: number): number[] => [0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1 + Math.cos(degrees * Math.PI / 180), Math.sin(degrees * Math.PI / 180), 1, 1 + Math.cos(degrees * Math.PI / 180), Math.sin(degrees * Math.PI / 180)];
        const strip = [0, 1, 3, 0, 3, 2, 2, 3, 5, 2, 5, 4];

        // Act
        const gentle = creasedMesh(bend(20), strip, 40);
        const sharp = creasedMesh(bend(60), strip, 40);

        // Assert
        expect(gentle.positions.length / 3).toBe(6);
        expect(sharp.positions.length / 3).toBe(8);
    });

    it("should weigh each face by its area where it smooths, so a sliver barely tilts a large face's normal", () => {
        // Arrange
        const tilt = 20 * Math.PI / 180;
        const positions = [0, 0, 0, 1, 0, 0, 0.5, -10, 0, 0.5, Math.cos(tilt), Math.sin(tilt)];
        const triangles = [0, 2, 1, 0, 1, 3];
        const along = Math.hypot(Math.sin(tilt), 10 + Math.cos(tilt));

        // Act
        const mesh = creasedMesh(positions, triangles, 40);
        const shared = mesh.indices[0]!;

        // Assert
        expect(mesh.normals[shared * 3 + 1]).toBeCloseTo(-Math.sin(tilt) / along, 6);
        expect(mesh.normals[shared * 3 + 2]).toBeCloseTo((10 + Math.cos(tilt)) / along, 6);
    });

    it("should give a degenerate triangle no normal and leave the others as they are", () => {
        // Arrange
        const positions = [0, 0, 0, 1, 0, 0, 0, 1, 0, 2, 0, 0];
        const triangles = [0, 1, 2, 0, 1, 3];

        // Act
        const mesh = creasedMesh(positions, triangles, 40);
        const normals = normalsAt(mesh);

        // Assert
        expect(normals[mesh.indices[0]!]).toEqual([0, 0, 1]);
        expect(normals[mesh.indices[3]!]).toEqual([0, 0, 0]);
    });

    it("should give nothing for a mesh with no triangles", () => {
        // Act
        const mesh = creasedMesh([0, 0, 0], [], 40);

        // Assert
        expect([mesh.positions.length, mesh.normals.length, mesh.indices.length]).toEqual([0, 0, 0]);
    });
});
