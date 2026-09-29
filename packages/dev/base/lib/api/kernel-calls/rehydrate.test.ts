import { describe, it, expect } from "vitest";
import { rehydrateReferences } from "./rehydrate";

type Reference = { type: "shape"; hash: number };

const store = new Map<string | number, unknown>([[0, { solid: "zero" }], [1, { solid: "one" }], [2, { solid: "two" }]]);
const isReference = (value: object): value is Reference => "type" in value && value.type === "shape";
const hashOf = (value: object): number | undefined => (isReference(value) ? value.hash : undefined);
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

    it("should hand back the very object the lookup returns", () => {
        // Act
        const rehydrated = rehydrateReferences({ shape: ref(2) }, hashOf, lookup) as { shape: unknown };

        // Assert
        expect(rehydrated.shape).toBe(store.get(2));
    });

    it("should replace a reference whose hash is 0", () => {
        // Act
        const rehydrated = rehydrateReferences({ shape: ref(0) }, hashOf, lookup);

        // Assert
        expect(rehydrated).toEqual({ shape: { solid: "zero" } });
    });

    it("should leave the inputs it was given unchanged", () => {
        // Arrange
        const inputs = { shape: ref(1) };

        // Act
        rehydrateReferences(inputs, hashOf, lookup);

        // Assert
        expect(inputs).toEqual({ shape: ref(1) });
    });

    it("should build new lists and objects at every depth and leave the nested ones it was given unchanged", () => {
        // Arrange
        const shapes = [ref(1), [ref(2)]];
        const nested = { shape: ref(2), plain: { size: 1 } };
        const inputs = { shapes, nested };

        // Act
        const rehydrated = rehydrateReferences(inputs, hashOf, lookup) as { shapes: unknown[]; nested: { plain: object } };

        // Assert
        expect(shapes).toStrictEqual([ref(1), [ref(2)]]);
        expect(nested).toStrictEqual({ shape: ref(2), plain: { size: 1 } });
        expect(rehydrated).not.toBe(inputs);
        expect(rehydrated.shapes).not.toBe(shapes);
        expect(rehydrated.nested.plain).not.toBe(nested.plain);
        expect(rehydrated.nested.plain).toStrictEqual({ size: 1 });
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

    it("should never ask for the hash of binary data", () => {
        // Arrange
        const asked: object[] = [];
        const recordingHashOf = (value: object): number | undefined => {
            asked.push(value);
            return hashOf(value);
        };
        const inputs = { bytes: new Uint8Array([1, 2, 3]), view: new DataView(new ArrayBuffer(2)), buffer: new ArrayBuffer(4) };

        // Act
        rehydrateReferences(inputs, recordingHashOf, lookup);

        // Assert
        expect(asked).toEqual([inputs]);
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

    it("should not walk into an object the caller marks opaque when a list holds it", () => {
        // Arrange
        const geometry = { polygons: [ref(1)] };

        // Act
        const rehydrated = rehydrateReferences({ geometries: [geometry] }, hashOf, lookup, (value) => "polygons" in value) as { geometries: object[] };

        // Assert
        expect(rehydrated.geometries[0]).toBe(geometry);
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
