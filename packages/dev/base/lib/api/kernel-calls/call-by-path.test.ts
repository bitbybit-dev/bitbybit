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
    nothing: null,
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
        expect(() => callByPath(kernel, "count.anything.createBox", {})).toThrow(new Error("Cannot resolve \"count.anything.createBox\": \"count\" is not an object"));
    });

    it("should refuse a path whose parent is missing, naming the path walked", () => {
        expect(() => callByPath(kernel, "shapes.missing.createBox", {})).toThrow(new Error("Cannot resolve \"shapes.missing.createBox\": \"shapes.missing\" is not an object"));
    });

    it("should refuse a path through a member that is null, on the way and as the owner", () => {
        expect(() => callByPath(kernel, "nothing.deeper.createBox", {})).toThrow(new Error("Cannot resolve \"nothing.deeper.createBox\": \"nothing\" is not an object"));
        expect(() => callByPath(kernel, "nothing.createBox", {})).toThrow(new Error("Cannot resolve \"nothing.createBox\": \"nothing\" is not an object"));
    });

    it("should refuse a path into the members of a function, on the way and as the owner", () => {
        expect(() => callByPath(kernel, "identity.bind.call", {})).toThrow(new Error("Cannot resolve \"identity.bind.call\": \"identity\" is not an object"));
        expect(() => callByPath(kernel, "identity.call", {})).toThrow(new Error("Cannot resolve \"identity.call\": \"identity\" is not an object"));
    });

    it("should refuse a path whose last segment is not a method", () => {
        expect(() => callByPath(kernel, "count", {})).toThrow(new Error("\"count\" is not a function"));
    });

    it.each([
        ["constructor", "constructor"],
        ["shapes.__proto__.createBox", "__proto__"],
        ["shapes..createBox", ""],
        ["shapes.solid.prototype", "prototype"],
    ])("should refuse %s, which reaches past the operations, naming the segment", (path, segment) => {
        expect(() => callByPath(kernel, path, {})).toThrow(new Error(`Cannot resolve "${path}": "${segment}" is not a segment an operation path may contain`));
    });
});
