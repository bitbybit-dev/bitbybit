import { describe, it, expect } from "vitest";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { batchedLineShader, matricesTexture, writeMatrices } from "./batched-lines";

describe("lines batched by a matrix per segment", () => {
    it("should move both ends of each segment by its matrix in the shader this three.js version compiles", () => {
        // Arrange
        const source = new LineMaterial().vertexShader;

        // Act
        const batched = batchedLineShader(source);

        // Assert
        expect(batched).toContain("attribute float instanceBatch;");
        expect(batched).toContain("mat4 batchMatrix = batchMatrixOf( instanceBatch );");
        expect(batched).toContain("vec4 start = modelViewMatrix * batchMatrix * vec4( instanceStart, 1.0 );");
        expect(batched).toContain("vec4 end = modelViewMatrix * batchMatrix * vec4( instanceEnd, 1.0 );");
        expect(batched).not.toContain("vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );");
        expect(batched.indexOf("mat4 batchMatrixOf")).toBeLessThan(batched.indexOf("void main() {"));
    });

    it("should refuse a shader whose segment steps are not where they were", () => {
        // Act
        const batching = () => batchedLineShader("void main() { gl_Position = vec4( 0.0 ); }");

        // Assert
        expect(batching).toThrow("cannot be batched");
    });

    it("should make a square texture a multiple of four texels wide, so no matrix crosses a row", () => {
        // Act
        const small = matricesTexture(1);
        const larger = matricesTexture(30);

        // Assert
        expect([small.image.width, small.image.height]).toEqual([4, 4]);
        expect(larger.image.width % 4).toBe(0);
        expect(larger.image.width * larger.image.height).toBeGreaterThanOrEqual(30 * 4);
    });

    it("should write each matrix at sixteen numbers apart and mark the texture for upload", () => {
        // Arrange
        const texture = matricesTexture(2);
        const version = texture.version;
        const second = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 7, 8, 9, 1];

        // Act
        writeMatrices(texture, [[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], second]);

        // Assert
        const data = texture.image.data as Float32Array;
        expect(Array.from(data.slice(16, 32))).toEqual(second);
        expect(texture.version).toBeGreaterThan(version);
    });
});
