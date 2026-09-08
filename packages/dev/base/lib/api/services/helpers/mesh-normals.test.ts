import { describe, expect, it } from "vitest";
import { computeVertexNormals } from "./mesh-normals";

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
