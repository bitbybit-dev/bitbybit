import { IFCService } from "@bitbybit-dev/ifc";
import { describe, expect, it } from "vitest";
import { ModelCache, isModelReference } from "./model-cache";

describe("ModelCache", () => {
    it("should key the same call the same way and a different call differently", () => {
        // Arrange
        const cache = new ModelCache();

        // Act
        const first = cache.keyOf("model.create", { name: "A" });
        const again = cache.keyOf("model.create", { name: "A" });
        const other = cache.keyOf("model.create", { name: "B" });

        // Assert
        expect(again).toBe(first);
        expect(other).not.toBe(first);
    });

    it("should key binary inputs by their bytes and their kind, wherever the view sits in its buffer", () => {
        // Arrange
        const cache = new ModelCache();
        const bytes = new Uint8Array([1, 2, 3, 4]);

        // Act
        const view = cache.keyOf("model.read", { data: bytes });
        const inside = cache.keyOf("model.read", { data: new Uint8Array([9, 1, 2, 3, 4]).subarray(1) });
        const buffer = cache.keyOf("model.read", { data: bytes.buffer });
        const otherKind = cache.keyOf("model.read", { data: new Int8Array([1, 2, 3, 4]) });
        const changed = cache.keyOf("model.read", { data: new Uint8Array([1, 2, 3, 5]) });

        // Assert
        expect(inside).toBe(view);
        expect(new Set([view, buffer, otherKind, changed]).size).toBe(4);
    });

    it("should answer a model with its handle and any other value as it is", () => {
        // Arrange
        const cache = new ModelCache();
        const model = new IFCService().model.create({ seed: "cache" });

        // Act
        const handle = cache.answer(7, cache.store(7, model));
        const text = cache.answer(8, cache.store(8, "text"));

        // Assert
        expect(handle).toEqual({ hash: 7, type: "ifc-model" });
        expect(text).toBe("text");
        expect(cache.model(7)).toBe(model);
        expect(cache.size).toBe(2);
    });

    it("should refuse a handle to something that is not a model", () => {
        // Arrange
        const cache = new ModelCache();
        cache.store(8, "text");

        // Act & Assert
        expect(() => cache.model(8)).toThrow("The IFC model with handle 8 is not held by the worker");
    });

    it("should hold nothing after it is cleared", () => {
        // Arrange
        const cache = new ModelCache();
        cache.store(1, "a");

        // Act
        cache.clear();

        // Assert
        expect(cache.get(1)).toBeUndefined();
    });

    it("should recognise only a model handle as one", () => {
        // Act
        const results = [{ hash: 1, type: "ifc-model" }, { hash: "1", type: "ifc-model" }, { hash: 1, type: "manifold-shape" }].map(isModelReference);

        // Assert
        expect(results).toEqual([true, false, false]);
    });
});
