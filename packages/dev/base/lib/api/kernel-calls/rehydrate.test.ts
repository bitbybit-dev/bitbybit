import { describe, it, expect } from "vitest";
import { rehydrateReferences } from "./rehydrate";

type Reference = { type: "shape"; hash: number };

const store = new Map<string | number, unknown>([[1, { solid: "one" }], [2, { solid: "two" }]]);
const hashOf = (value: object): number | undefined => ("type" in value && (value as Reference).type === "shape" ? (value as Reference).hash : undefined);
const lookup = (hash: string | number): unknown => {
    if (!store.has(hash)) {
        throw new Error(`hash ${hash} not found`);
    }
    return store.get(hash);
};
const ref = (hash: number): Reference => ({ type: "shape", hash });

class Kernel {
    readonly handle = ref(1);
}

describe("rehydrateReferences", () => {
    it("should replace a reference at the top level", () => {
        expect(rehydrateReferences(ref(1), hashOf, lookup)).toEqual({ solid: "one" });
    });

    it("should replace references at any depth of lists and objects", () => {
        // Arrange
        const inputs = { shape: ref(1), shapes: [ref(1), 5, ref(2)], nested: { deeper: [[ref(2)]] } };

        // Act
        const rehydrated = rehydrateReferences(inputs, hashOf, lookup);

        // Assert
        expect(rehydrated).toEqual({ shape: { solid: "one" }, shapes: [{ solid: "one" }, 5, { solid: "two" }], nested: { deeper: [[{ solid: "two" }]] } });
    });

    it("should leave the inputs it was given unchanged", () => {
        // Arrange
        const inputs = { shape: ref(1) };

        // Act
        rehydrateReferences(inputs, hashOf, lookup);

        // Assert
        expect(inputs).toEqual({ shape: ref(1) });
    });

    it("should hand binary data back as it is", () => {
        // Arrange
        const bytes = new Uint8Array([1, 2, 3]);
        const buffer = new ArrayBuffer(4);

        // Act
        const rehydrated = rehydrateReferences({ bytes, buffer }, hashOf, lookup) as { bytes: Uint8Array; buffer: ArrayBuffer };

        // Assert
        expect(rehydrated.bytes).toBe(bytes);
        expect(rehydrated.buffer).toBe(buffer);
    });

    it("should not walk into an object that is not a plain object", () => {
        // Arrange
        const kernelObject = new Kernel();

        // Act
        const rehydrated = rehydrateReferences({ kernelObject }, hashOf, lookup) as { kernelObject: Kernel };

        // Assert
        expect(rehydrated.kernelObject).toBe(kernelObject);
    });

    it("should not walk into an object the caller marks opaque", () => {
        // Arrange
        const geometry = { polygons: [ref(1)] };

        // Act
        const rehydrated = rehydrateReferences({ geometry }, hashOf, lookup, (value) => "polygons" in value) as { geometry: object };

        // Assert
        expect(rehydrated.geometry).toBe(geometry);
    });

    it("should walk an object created with no prototype", () => {
        // Arrange
        const bare = Object.assign(Object.create(null) as Record<string, unknown>, { shape: ref(2) });

        // Act
        const rehydrated = rehydrateReferences(bare, hashOf, lookup);

        // Assert
        expect(rehydrated).toEqual({ shape: { solid: "two" } });
    });

    it("should hand primitives and null back as they are", () => {
        expect([null, undefined, 3, "text", true].map((value) => rehydrateReferences(value, hashOf, lookup))).toEqual([null, undefined, 3, "text", true]);
    });

    it("should let the lookup's failure through for a reference it cannot find", () => {
        expect(() => rehydrateReferences({ shape: ref(9) }, hashOf, lookup)).toThrow("hash 9 not found");
    });
});
