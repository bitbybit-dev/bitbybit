import { describe, it, expect } from "vitest";
import { checkDrawableMesh, checkKeptDesignMesh } from "./mesh-checks";
import type { DrawableShapeMesh } from "./draw-helper-types";
import type { KeptDesignMesh } from "./draw-appearance";

const triangleFace = (faceIndex: number): DrawableShapeMesh["faceList"][number] => ({
    faceIndex,
    vertexCoord: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
    normalCoord: new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]),
    triIndexes: new Uint32Array([0, 1, 2]),
    numberOfTriangles: 1,
    uvs: new Float32Array(0),
    centerPoint: null,
    centerNormal: null,
});

const meshOfFaces = (faceList: unknown[]): DrawableShapeMesh => ({ faceList, edgeList: [], pointsList: [] }) as DrawableShapeMesh;

const keptOf = (mesh: DrawableShapeMesh): KeptDesignMesh<DrawableShapeMesh> => ({ shapeHash: "box-shape", mesh });

describe("a mesh a drawer is about to draw", () => {
    it("should let a mesh through whose faces hold whole points and triangles, as lists or typed arrays", () => {
        // Arrange
        const lists = { faceIndex: 4, vertexCoord: [0, 0, 0, 1, 0, 0, 0, 1, 0], normalCoord: [], triIndexes: [0, 1, 2] };

        // Act
        const check = (): void => checkDrawableMesh(meshOfFaces([triangleFace(0), lists]));

        // Assert
        expect(check).not.toThrow();
    });

    it("should name the face by its index, not its place in the list, when its positions do not come in threes", () => {
        // Arrange
        const tenCoordinates = { ...triangleFace(7), vertexCoord: [0, 0, 0, 1, 0, 0, 0, 1, 0, 5] };

        // Act
        const check = (): void => checkDrawableMesh(meshOfFaces([triangleFace(0), tenCoordinates]));

        // Assert
        expect(check).toThrow("Face 7 cannot be drawn: it holds 10 position values and 3 indexes; both must be whole points and triangles, three values each.");
    });

    it("should refuse a face whose indexes do not come in threes", () => {
        // Arrange
        const fourIndexes = { ...triangleFace(2), triIndexes: [0, 1, 2, 0] };

        // Act
        const check = (): void => checkDrawableMesh(meshOfFaces([fourIndexes]));

        // Assert
        expect(check).toThrow("Face 2 cannot be drawn: it holds 9 position values and 4 indexes; both must be whole points and triangles, three values each.");
    });

    it("should refuse a face whose positions or indexes are not a list of numbers", () => {
        // Arrange
        const positionsAsRecord = { ...triangleFace(3), vertexCoord: { 0: 0, 1: 0, 2: 0 } };
        const noIndexes = { ...triangleFace(5), triIndexes: null };

        // Act
        const record = (): void => checkDrawableMesh(meshOfFaces([positionsAsRecord]));
        const missing = (): void => checkDrawableMesh(meshOfFaces([noIndexes]));

        // Assert
        expect(record).toThrow("Face 3 cannot be drawn: its positions and its triangle indexes must each be a list of numbers.");
        expect(missing).toThrow("Face 5 cannot be drawn: its positions and its triangle indexes must each be a list of numbers.");
    });

    it("should name a face without an index by its place in the list", () => {
        // Arrange
        const unnamed = { vertexCoord: [0, 0], triIndexes: [] };

        // Act
        const check = (): void => checkDrawableMesh(meshOfFaces([triangleFace(0), unnamed]));

        // Assert
        expect(check).toThrow("The face at 1 cannot be drawn: it holds 2 position values and 0 indexes; both must be whole points and triangles, three values each.");
    });

    it("should let a mesh without a list of faces through, since it has none to draw", () => {
        // Arrange
        const edgesOnly: unknown = { edgeList: [], pointsList: [] };

        // Act
        const check = (): void => checkDrawableMesh(edgesOnly as DrawableShapeMesh);

        // Assert
        expect(check).not.toThrow();
    });

    it("should let a missing mesh through, which has no faces to draw", () => {
        // Arrange
        const missing: unknown = undefined;

        // Act
        const check = (): void => checkDrawableMesh(missing as DrawableShapeMesh);

        // Assert
        expect(check).not.toThrow();
    });
});

describe("a mesh a caller hands back to keep for a design part", () => {
    it("should let through the meshes a drawer handed out, and a structured clone of them", () => {
        // Arrange
        const kept = keptOf(meshOfFaces([triangleFace(0), triangleFace(1)]));

        // Act
        const handedOut = (): void => checkKeptDesignMesh(kept);
        const cloned = (): void => checkKeptDesignMesh(structuredClone(kept));

        // Assert
        expect(handedOut).not.toThrow();
        expect(cloned).not.toThrow();
    });

    it("should refuse a mesh whose buffers were handed away to another thread, which leaves them empty", () => {
        // Arrange
        const kept = keptOf(meshOfFaces([triangleFace(0), triangleFace(1)]));
        const buffers = kept.mesh.faceList.flatMap(face => [face.vertexCoord, face.normalCoord, face.triIndexes].map(values => (values as Float32Array | Uint32Array).buffer as ArrayBuffer));
        structuredClone(kept, { transfer: buffers });

        // Act
        const check = (): void => checkKeptDesignMesh(kept);

        // Assert
        expect(kept.mesh.faceList[0]!.triIndexes).toHaveLength(0);
        expect(check).toThrow("The mesh kept for box-shape cannot be drawn: face 0 counts 1 triangles but holds no indexes, as a mesh does once its buffers were handed away to another thread. Post the meshes keptDesignMeshes hands out without transferring their buffers.");
    });

    it("should refuse a mesh stored as JSON, whose typed arrays come back as plain records", () => {
        // Arrange
        const kept = keptOf(meshOfFaces([triangleFace(0)]));
        const restored = JSON.parse(JSON.stringify(kept)) as KeptDesignMesh<DrawableShapeMesh>;

        // Act
        const check = (): void => checkKeptDesignMesh(restored);

        // Assert
        expect(check).toThrow("The mesh kept for box-shape cannot be drawn: face 0 holds its positions, normals or indexes as something other than a list of numbers, as typed arrays stored as JSON come back. Keep the meshes in a store that keeps typed arrays, such as IndexedDB.");
    });

    it("should refuse a kept face whose numbers do not come in threes", () => {
        // Arrange
        const kept = keptOf(meshOfFaces([{ ...triangleFace(3), normalCoord: new Float32Array(4) }]));

        // Act
        const check = (): void => checkKeptDesignMesh(kept);

        // Assert
        expect(check).toThrow("The mesh kept for box-shape cannot be drawn: face 3 holds 9 position values, 4 normal values and 3 indexes; each must come in threes.");
    });

    it("should let through a kept face that has no triangles to draw", () => {
        // Arrange
        const kept = keptOf(meshOfFaces([{ ...triangleFace(0), vertexCoord: new Float32Array(0), normalCoord: new Float32Array(0), triIndexes: new Uint32Array(0), numberOfTriangles: 0 }]));

        // Act
        const check = (): void => checkKeptDesignMesh(kept);

        // Assert
        expect(check).not.toThrow();
    });
});
