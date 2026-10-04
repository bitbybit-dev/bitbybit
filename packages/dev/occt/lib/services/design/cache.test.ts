import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { DesignCache, DesignOutcome, hashText, release, stableJson } from "./cache";

describe("design cache", () => {
    let kernel: BitbybitOcctModule;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
    }, 120_000);

    const outcome = (): DesignOutcome & { shape: TopoDS_Shape } => ({ kind: "body", shape: new kernel.TopoDS_Shape(), names: [] });

    it("should hand back what it keeps and count it", () => {
        // Arrange
        const cache = new DesignCache(4);
        const kept = outcome();
        cache.keep("a", kept);

        // Act
        const found = cache.take("a");
        const missing = cache.take("b");

        // Assert
        expect(found).toBe(kept);
        expect(missing).toBeUndefined();
        expect(cache.size).toBe(1);
    });

    it("should free the least recently used outcomes beyond its capacity, never one in use", () => {
        // Arrange
        const cache = new DesignCache(2);
        const [a, b, c, d] = [outcome(), outcome(), outcome(), outcome()];
        cache.keep("a", a);
        cache.keep("b", b);
        cache.keep("c", c);
        cache.keep("d", d);
        cache.take("a");

        // Act
        cache.trim(new Set(["b"]));

        // Assert
        expect(cache.size).toBe(2);
        expect(cache.take("c")).toBeUndefined();
        expect(cache.take("d")).toBeUndefined();
        expect([a.shape.isDeleted(), b.shape.isDeleted(), c.shape.isDeleted(), d.shape.isDeleted()]).toEqual([false, false, true, true]);
    });

    it("should keep more than its capacity when a build used them all", () => {
        // Arrange
        const cache = new DesignCache(1);
        cache.keep("a", outcome());
        cache.keep("b", outcome());

        // Act
        cache.trim(new Set(["a", "b"]));

        // Assert
        expect(cache.size).toBe(2);
    });

    it("should free every shape on clear, and free a shape only once", () => {
        // Arrange
        const cache = new DesignCache(4);
        const kept = outcome();
        cache.keep("a", kept);

        // Act
        cache.clear();
        release(kept.shape);

        // Assert
        expect(cache.size).toBe(0);
        expect(kept.shape.isDeleted()).toBe(true);
    });

    it("should write equal values the same way whatever their key order, leaving out undefined properties", () => {
        // Act
        const first = stableJson({ b: [1, { d: 2, c: undefined }], a: "x" });
        const second = stableJson({ a: "x", b: [1, { d: 2 }] });

        // Assert
        expect(first).toBe("{\"a\":\"x\",\"b\":[1,{\"d\":2}]}");
        expect(second).toBe(first);
        expect(stableJson(undefined)).toBe("null");
    });

    it("should hash the same text the same way and different text differently", () => {
        // Act
        const hashes = [hashText("plate"), hashText("plate"), hashText("plates"), hashText("")];

        // Assert
        expect(hashes[0]).toBe(hashes[1]);
        expect(new Set(hashes).size).toBe(3);
        hashes.forEach(hash => expect(hash).toMatch(/^[0-9a-z]+$/));
    });
});
