import { describe, it, expect } from "vitest";
import { callByPath } from "./call-by-path";

class Solid {
    readonly scale = 2;

    createBox(inputs: { width: number }): number {
        return inputs.width * this.scale;
    }
}

const kernel = {
    shapes: { solid: new Solid() },
    identity: (inputs: unknown): unknown => inputs,
    count: 3,
};

describe("callByPath", () => {
    it("should call the method the dotted path names with the inputs, on its owner", () => {
        // Act
        const result = callByPath(kernel, "shapes.solid.createBox", { width: 5 });

        // Assert
        expect(result).toBe(10);
    });

    it("should call a method on the root itself", () => {
        // Arrange
        const inputs = { a: 1 };

        // Act
        const result = callByPath(kernel, "identity", inputs);

        // Assert
        expect(result).toBe(inputs);
    });

    it("should refuse a path through a member that is not an object", () => {
        expect(() => callByPath(kernel, "count.anything.createBox", {})).toThrow("\"count\" is not an object");
    });

    it("should refuse a path whose parent is missing, naming the path walked", () => {
        expect(() => callByPath(kernel, "shapes.missing.createBox", {})).toThrow("\"shapes.missing\" is not an object");
    });

    it("should refuse a path whose last segment is not a method", () => {
        expect(() => callByPath(kernel, "count", {})).toThrow("\"count\" is not a function");
    });

    it.each(["constructor", "shapes.__proto__.createBox", "shapes..createBox", "shapes.solid.prototype"])(
        "should refuse %s, which reaches past the operations",
        (path) => {
            expect(() => callByPath(kernel, path, {})).toThrow("is not a segment an operation path may contain");
        });
});
