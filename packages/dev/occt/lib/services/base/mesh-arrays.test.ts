import { describe, it, expect } from "vitest";
import { decodeMeshArrays, type MeshArrays } from "./mesh-arrays";

function consistent(overrides: Partial<MeshArrays>): MeshArrays {
    return arrays({
        positions: new Float64Array(18),
        normals: new Float64Array(18),
        uvs: new Float64Array(6),
        triangles: new Int32Array(6),
        faces: new Int32Array([0, 3, 1, 1, 1, 3, 1, 0]),
        faceCentres: new Float64Array(14),
        edgePoints: new Float64Array(15),
        edges: new Int32Array([0, 2, 1, 3]),
        edgeMiddles: new Float64Array(6),
        vertices: new Float64Array(6),
        ...overrides,
    });
}

function arrays(overrides: Partial<MeshArrays>): MeshArrays {
    return {
        positions: new Float64Array(0),
        normals: new Float64Array(0),
        uvs: new Float64Array(0),
        triangles: new Int32Array(0),
        faces: new Int32Array(0),
        faceCentres: new Float64Array(0),
        edgePoints: new Float64Array(0),
        edges: new Int32Array(0),
        edgeMiddles: new Float64Array(0),
        vertices: new Float64Array(0),
        ...overrides,
    };
}

describe("decodeMeshArrays", () => {
    it("splits the concatenated nodes, UVs and triangles back into their faces", () => {
        // Arrange
        const input = arrays({
            positions: new Float64Array([0, 0, 0, 1, 0, 0, 0, 1, 0, 5, 5, 5, 6, 5, 5, 5, 6, 5, 6, 6, 5]),
            normals: new Float64Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1]),
            uvs: new Float64Array([0, 0, 1, 0, 0, 1]),
            triangles: new Int32Array([0, 1, 2, 0, 2, 1, 1, 3, 2]),
            faces: new Int32Array([0, 3, 1, 1, 2, 4, 2, 0]),
            faceCentres: new Float64Array([1, 0.3, 0.3, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1]),
        });

        // Act
        const mesh = decodeMeshArrays(input);

        // Assert
        expect(mesh.faceList).toEqual([
            {
                faceIndex: 0,
                vertexCoord: [0, 0, 0, 1, 0, 0, 0, 1, 0],
                vertexCoordVec: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
                uvs: [0, 0, 1, 0, 0, 1],
                normalCoord: [0, 0, 1, 0, 0, 1, 0, 0, 1],
                triIndexes: [0, 1, 2],
                numberOfTriangles: 1,
                centerPoint: [0.3, 0.3, 0],
                centerNormal: [0, 0, 1],
            },
            {
                faceIndex: 2,
                vertexCoord: [5, 5, 5, 6, 5, 5, 5, 6, 5, 6, 6, 5],
                vertexCoordVec: [[5, 5, 5], [6, 5, 5], [5, 6, 5], [6, 6, 5]],
                uvs: [],
                normalCoord: [0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1],
                triIndexes: [0, 2, 1, 1, 3, 2],
                numberOfTriangles: 2,
                centerPoint: null,
                centerNormal: null,
            },
        ]);
    });

    it("writes each face's keys in the order the kernel's JSON does", () => {
        // Arrange
        const input = arrays({
            positions: new Float64Array([0, 0, 0]),
            normals: new Float64Array([0, 0, 1]),
            faces: new Int32Array([0, 1, 0, 0]),
            faceCentres: new Float64Array([0, 0, 0, 0, 0, 0, 1]),
        });

        // Act
        const mesh = decodeMeshArrays(input);

        // Assert
        expect(Object.keys(mesh)).toEqual(["faceList", "edgeList", "pointsList"]);
        expect(Object.keys(mesh.faceList[0]!)).toEqual(["faceIndex", "vertexCoord", "vertexCoordVec", "uvs", "normalCoord", "triIndexes", "numberOfTriangles", "centerPoint", "centerNormal"]);
    });

    it("gives every edge its own samples and middle point, and lists the vertices", () => {
        // Arrange
        const input = arrays({
            edgePoints: new Float64Array([0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 2, 0]),
            edges: new Int32Array([0, 2, 1, 3]),
            edgeMiddles: new Float64Array([0.5, 0, 0, 1, 1, 0]),
            vertices: new Float64Array([0, 0, 0, 1, 0, 0]),
        });

        // Act
        const mesh = decodeMeshArrays(input);

        // Assert
        expect(mesh.edgeList).toEqual([
            { edgeIndex: 0, middlePoint: [0.5, 0, 0], vertexCoord: [[0, 0, 0], [1, 0, 0]] },
            { edgeIndex: 1, middlePoint: [1, 1, 0], vertexCoord: [[1, 0, 0], [1, 1, 0], [1, 2, 0]] },
        ]);
        expect(mesh.pointsList).toEqual([[0, 0, 0], [1, 0, 0]]);
        expect(Object.keys(mesh.edgeList[0]!)).toEqual(["edgeIndex", "middlePoint", "vertexCoord"]);
    });

    it("returns empty lists for an empty mesh", () => {
        // Arrange
        const input = arrays({});

        // Act
        const mesh = decodeMeshArrays(input);

        // Assert
        expect(mesh).toEqual({ faceList: [], edgeList: [], pointsList: [] });
    });
    it("keeps each face's UVs in step when a face without UVs comes first", () => {
        // Arrange
        const input = arrays({
            positions: new Float64Array([0, 0, 0, 1, 0, 0, 0, 1, 0, 5, 5, 5, 6, 5, 5, 5, 6, 5]),
            normals: new Float64Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]),
            uvs: new Float64Array([0.1, 0.2, 0.3, 0.4, 0.5, 0.6]),
            triangles: new Int32Array([0, 1, 2, 0, 1, 2]),
            faces: new Int32Array([0, 3, 1, 0, 1, 3, 1, 1]),
            faceCentres: new Float64Array(14),
        });

        // Act
        const mesh = decodeMeshArrays(input);

        // Assert
        expect(mesh.faceList.map(face => face.uvs)).toEqual([[], [0.1, 0.2, 0.3, 0.4, 0.5, 0.6]]);
        expect(mesh.faceList.map(face => face.vertexCoord)).toEqual([[0, 0, 0, 1, 0, 0, 0, 1, 0], [5, 5, 5, 6, 5, 5, 5, 6, 5]]);
    });

    it("accepts arrays that hold exactly what their records describe", () => {
        // Arrange
        const input = consistent({});

        // Act
        const mesh = decodeMeshArrays(input);

        // Assert
        expect(mesh.faceList).toHaveLength(2);
        expect(mesh.edgeList).toHaveLength(2);
        expect(mesh.pointsList).toHaveLength(2);
    });

    it.each([
        ["positions short of a node", { positions: new Float64Array(15) }, "positions"],
        ["normals past the last node", { normals: new Float64Array(21) }, "normals"],
        ["uvs short of a node", { uvs: new Float64Array(4) }, "uvs"],
        ["triangles short of a triangle", { triangles: new Int32Array(3) }, "triangles"],
        ["a face centre missing", { faceCentres: new Float64Array(7) }, "faceCentres"],
        ["an edge sample missing", { edgePoints: new Float64Array(12) }, "edgePoints"],
        ["an edge middle missing", { edgeMiddles: new Float64Array(3) }, "edgeMiddles"],
        ["a face record cut short", { faces: new Int32Array([0, 3, 1, 1, 1]) }, "faces"],
        ["an edge record cut short", { edges: new Int32Array([0, 2, 1, 3, 2]) }, "edges"],
        ["a vertex cut short", { vertices: new Float64Array(4) }, "vertices"],
    ] as [string, Partial<MeshArrays>, string][])("refuses arrays that disagree with their records, naming the array: %s", (_name, broken, array) => {
        // Arrange
        const input = consistent(broken);

        // Act
        const decode = (): unknown => decodeMeshArrays(input);

        // Assert
        expect(decode).toThrow(`the kernel's mesh buffers disagree with their records: ${array} holds`);
    });
});
