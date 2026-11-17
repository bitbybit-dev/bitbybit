import { describe, it, expect } from "vitest";
import { lengthInPixels } from "./svg-numbers";

const VIEWPORT = { width: 300, height: 200 };

describe("svg lengths", () => {
    it("should convert absolute units to CSS pixels at 96 to the inch", () => {
        // Act
        const lengths = ["1in", "25.4mm", "2.54cm", "72pt", "6pc", "96px", "96"].map((t) => lengthInPixels(t, VIEWPORT, "x"));

        // Assert
        lengths.forEach((l) => expect(l).toBeCloseTo(96, 10));
    });

    it("should resolve font relative units against a 16 pixel font", () => {
        // Act
        const lengths = ["2em", "2ex"].map((t) => lengthInPixels(t, VIEWPORT, "x"));

        // Assert
        expect(lengths).toEqual([32, 16]);
    });

    it("should resolve percentages against the viewport width, height or normalized diagonal", () => {
        // Act
        const x = lengthInPixels("50%", VIEWPORT, "x");
        const y = lengthInPixels("50%", VIEWPORT, "y");
        const other = lengthInPixels("100%", VIEWPORT, "other");

        // Assert
        expect(x).toBe(150);
        expect(y).toBe(100);
        expect(other).toBeCloseTo(Math.sqrt((300 * 300 + 200 * 200) / 2), 10);
    });

    it("should not read a length with an unknown unit", () => {
        // Act
        const length = lengthInPixels("5furlongs", VIEWPORT, "x");

        // Assert
        expect(length).toBeUndefined();
    });
});

describe("svg lengths on large and malformed values", () => {
    const LARGE_INPUT_TIMEOUT = 2_000;

    it("should refuse a length whose long run of spaces ends in a stray character in time linear in its length", () => {
        // Act
        const lengths = [`5${" ".repeat(100_000)}!`, `${" ".repeat(100_000)}5mm${" ".repeat(100_000)}x`].map((t) => lengthInPixels(t, VIEWPORT, "x"));

        // Assert
        expect(lengths).toEqual([undefined, undefined]);
    }, LARGE_INPUT_TIMEOUT);

    it("should read a length with spaces around its number and unit", () => {
        // Act
        const lengths = [" 5 ", " 2.54 cm ", "\t1in\n"].map((t) => lengthInPixels(t, VIEWPORT, "x"));

        // Assert
        expect(lengths).toEqual([5, 96, 96].map((v) => expect.closeTo(v, 10)));
    });

    it("should not read a unit named after a name every object inherits", () => {
        // Act
        const lengths = ["10constructor", "10toString", "10__proto__"].map((t) => lengthInPixels(t, VIEWPORT, "x"));

        // Assert
        expect(lengths).toEqual([undefined, undefined, undefined]);
    });
});
