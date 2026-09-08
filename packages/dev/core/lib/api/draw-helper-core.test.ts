import { describe, expect, it, vi, afterEach } from "vitest";
import { GeometryHelper, MathBitByBit, Vector } from "@bitbybit-dev/base";
import { DrawHelperCore } from "./draw-helper-core";

class ColourReader extends DrawHelperCore {
    readColour(colour: number[] | string | undefined, fallback: string): string {
        return this.normalizeColor(colour, fallback);
    }
}

const reader = (): ColourReader =>
    new ColourReader(new Vector(new MathBitByBit(), new GeometryHelper()));

describe("DrawHelperCore colour normalization", () => {

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should read a normalized triple as the hex the engines take", () => {
        // Act
        const hex = reader().readColour([1, 0, 0], "#000000");

        // Assert
        expect(hex).toBe("#ff0000");
    });

    it("should fall back when the array is too short to be a colour", () => {
        // Arrange
        const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

        // Act
        const hex = reader().readColour([1, 0], "#123456");

        // Assert
        expect(hex).toBe("#123456");
        expect(warn).toHaveBeenCalledOnce();
    });

    it("should say so when handed byte values rather than normalized ones", () => {
        // Arrange
        const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

        // Act
        const hex = reader().readColour([255, 128, 0], "#000000");

        // Assert
        expect(warn.mock.calls[0]![0]).toContain("normalized to 0-1");
        expect(hex).toBe("#ffff00");
    });

    it("should clamp rather than emit a hex string of the wrong length", () => {
        // Arrange
        vi.spyOn(console, "warn").mockImplementation(() => undefined);

        // Act
        const tooHigh = reader().readColour([2, 1, 1], "#000000");
        const belowZero = reader().readColour([-1, 0, 0], "#000000");

        // Assert
        expect(tooHigh).toBe("#ffffff");
        expect(belowZero).toBe("#000000");
        expect(tooHigh).toHaveLength(7);
        expect(belowZero).toHaveLength(7);
    });

    it("should take a hex string unchanged", () => {
        // Act & Assert
        expect(reader().readColour("#00ff00", "#000000")).toBe("#00ff00");
    });
});
