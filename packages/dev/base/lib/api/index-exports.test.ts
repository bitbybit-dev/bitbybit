import { describe, expect, it } from "vitest";
import * as api from "./index";
import * as kernelCalls from "./kernel-calls";

const SHIPPED_AS_FUNCTIONS: Record<string, string> = {
    srgbToLinear: "shipped in 1.5.0, deprecated for color.srgbToLinear; leaves the index in the next major",
    linearToSrgb: "shipped in 1.5.0, deprecated for color.linearToSrgb; leaves the index in the next major",
};

const isClass = (value: unknown): boolean => typeof value === "function" && /^class\b/.test(Function.prototype.toString.call(value));

describe("the index", () => {
    it("should export no function but a class, the kernel-call infrastructure and what shipped as a function", () => {
        // Arrange
        const infrastructure = new Set(Object.keys(kernelCalls));

        // Act
        const loose = Object.entries(api)
            .filter(([name, value]) => typeof value === "function" && !isClass(value) && !infrastructure.has(name))
            .map(([name]) => name)
            .sort();

        // Assert
        expect(loose).toEqual(Object.keys(SHIPPED_AS_FUNCTIONS).sort());
    });
});
