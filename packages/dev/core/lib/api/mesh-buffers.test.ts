import { describe, expect, it } from "vitest";
import { mergedMeshBuffers } from "./mesh-buffers";
import type { MeshPart } from "./draw-helper-types";

const triangle = (x: number, extra: Partial<MeshPart> = {}): MeshPart => ({
    positions: [x, 0, 0, x + 1, 0, 0, x, 1, 0],
    normals: [0, 0, 1, 0, 0, 1, 0, 0, 1],
    indices: [0, 1, 2],
    ...extra,
});

const plain = (values: ArrayLike<number> | undefined): number[] | undefined => values && Array.from(values, value => value + 0);

describe("mergedMeshBuffers", () => {
    it("should put every part's vertices one after another and move its triangles to them", () => {
        // Act
        const merged = mergedMeshBuffers([triangle(0), triangle(5)]);

        // Assert
        expect(merged.positions).toBeInstanceOf(Float32Array);
        expect(merged.indices).toBeInstanceOf(Uint32Array);
        expect(plain(merged.positions)).toEqual([0, 0, 0, 1, 0, 0, 0, 1, 0, 5, 0, 0, 6, 0, 0, 5, 1, 0]);
        expect(plain(merged.indices)).toEqual([0, 1, 2, 3, 4, 5]);
        expect(plain(merged.normals)).toEqual([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]);
    });

    it("should turn the normals round and wind the triangles the other way for a back face", () => {
        // Act
        const back = mergedMeshBuffers([triangle(0), triangle(5)], { flipNormals: true, reverseWinding: true });
        const flippedOnly = mergedMeshBuffers([triangle(0)], { flipNormals: true });

        // Assert
        expect(plain(back.indices)).toEqual([0, 2, 1, 3, 5, 4]);
        expect(plain(back.normals)).toEqual([0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1]);
        expect(plain(flippedOnly.indices)).toEqual([0, 1, 2]);
    });

    it("should work smooth normals out of the triangles of a part that has none", () => {
        // Act
        const merged = mergedMeshBuffers([triangle(0), triangle(5, { normals: [] })]);

        // Assert
        expect(plain(merged.normals)).toEqual([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]);
    });

    it("should keep uvs when any part has them, with zeros for a part that has none", () => {
        // Act
        const merged = mergedMeshBuffers([triangle(0, { uvs: [0, 0, 1, 0, 0, 1] }), triangle(5)]);
        const none = mergedMeshBuffers([triangle(0), triangle(5, { uvs: [] })]);

        // Assert
        expect(plain(merged.uvs)).toEqual([0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0]);
        expect(none.uvs).toBeUndefined();
    });

    it("should keep colors only when every part has one per vertex in the size asked for", () => {
        // Arrange
        const red = [1, 0, 0, 1, 0, 0, 1, 0, 0];

        // Act
        const colored = mergedMeshBuffers([triangle(0, { colors: red }), triangle(5, { colors: red })], { colorSize: 3 });
        const partly = mergedMeshBuffers([triangle(0, { colors: red }), triangle(5)], { colorSize: 3 });
        const wrongSize = mergedMeshBuffers([triangle(0, { colors: red })], { colorSize: 4 });

        // Assert
        expect(plain(colored.colors)).toEqual([...red, ...red]);
        expect(partly.colors).toBeUndefined();
        expect(wrongSize.colors).toBeUndefined();
    });

    it("should join a part far larger than a call can spread", () => {
        // Arrange
        const count = 200_001;
        const positions = new Float32Array(count * 3).map((_, at) => at % 7);
        const indices = new Uint32Array(count).map((_, at) => at % count);
        const normals = new Float32Array(count * 3).fill(1);

        // Act
        const merged = mergedMeshBuffers([{ positions, indices, normals }, triangle(0)]);

        // Assert
        expect(merged.positions).toHaveLength(count * 3 + 9);
        expect(merged.indices[count]).toBe(count);
        expect(merged.positions[count * 3 + 3]).toBe(1);
    });

    it("should flip the smooth normals it works out for a back face that has none", () => {
        // Act
        const back = mergedMeshBuffers([triangle(0, { normals: undefined })], { flipNormals: true, reverseWinding: true });

        // Assert
        expect(plain(back.indices)).toEqual([0, 2, 1]);
        expect(plain(back.normals)).toEqual([0, 0, -1, 0, 0, -1, 0, 0, -1]);
    });

    it("should copy every part, so changing the merged buffers leaves the parts as they were", () => {
        // Arrange
        const part = triangle(0, { positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), indices: new Uint32Array([0, 1, 2]) });

        // Act
        const merged = mergedMeshBuffers([part, part]);
        merged.positions[0] = 9;
        merged.indices[0] = 9;

        // Assert
        expect(plain(part.positions)).toEqual([0, 0, 0, 1, 0, 0, 0, 1, 0]);
        expect(plain(part.indices)).toEqual([0, 1, 2]);
        expect(plain(merged.indices)).toEqual([9, 1, 2, 3, 4, 5]);
    });

    it("should read a part that is a view into a shared buffer from where the view starts, not from the buffer's start", () => {
        // Arrange
        const sharedNumbers = new Float32Array([9, 9, 9, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, -1, 0, 0, -1, 0, 0, -1, 9]);
        const sharedIndexes = new Uint32Array([7, 7, 7, 2, 1, 0, 7]);
        const sharedUvs = new Float32Array([5, 5, 0, 0, 1, 0, 0, 1]);
        const view: MeshPart = { positions: sharedNumbers.subarray(3, 12), normals: sharedNumbers.subarray(12, 21), indices: sharedIndexes.subarray(3, 6), uvs: sharedUvs.subarray(2, 8) };
        const withoutUvs: MeshPart = { ...view, uvs: sharedUvs.subarray(0, 0) };

        // Act
        const merged = mergedMeshBuffers([triangle(5), view, withoutUvs]);

        // Assert
        expect(view.positions).toHaveProperty("byteOffset", 12);
        expect(plain(merged.positions)).toEqual([5, 0, 0, 6, 0, 0, 5, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0]);
        expect(plain(merged.normals)).toEqual([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1]);
        expect(plain(merged.indices)).toEqual([0, 1, 2, 5, 4, 3, 8, 7, 6]);
        expect(plain(merged.uvs)).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0]);
    });

    it("should refuse a part whose positions or indexes do not come in threes", () => {
        // Act
        const loosePositions = (): unknown => mergedMeshBuffers([triangle(0), triangle(5, { positions: [0, 0, 0, 1] })]);
        const looseIndexes = (): unknown => mergedMeshBuffers([triangle(0, { indices: [0, 1, 2, 0] })]);

        // Assert
        expect(loosePositions).toThrow("Mesh part 1 holds 4 position values and 3 indexes; both must be whole points and triangles, three values each.");
        expect(looseIndexes).toThrow("Mesh part 0 holds 9 position values and 4 indexes; both must be whole points and triangles, three values each.");
    });

    it("should give empty buffers for no parts", () => {
        // Act
        const merged = mergedMeshBuffers([]);

        // Assert
        expect(merged.positions).toHaveLength(0);
        expect(merged.indices).toHaveLength(0);
        expect(merged.uvs).toBeUndefined();
        expect(merged.colors).toBeUndefined();
    });
});
