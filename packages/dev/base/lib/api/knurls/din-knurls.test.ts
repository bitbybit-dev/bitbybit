import { describe, expect, it } from "vitest";
import { dinKnurlSizes } from "./din-knurls";
import type { KnurlPattern } from "./knurl-types";

describe("din knurls", () => {
    it("should fit 77 grooves of pitch 0.8 round a 19.6 diameter, nudging it to 19.608 so they divide it evenly", () => {
        // Act
        const knurl = dinKnurlSizes(19.6, 0.8, "straight", "mm");

        // Assert
        expect(knurl).toEqual({ grooves: 77, diameter: 19.607889, depth: 0.4, helixAngle: 0 });
    });

    it("should turn the grooves of a diamond and of a helical knurl by 30 degrees, and refuse a pitch DIN 82 does not list", () => {
        // Act & Assert
        expect(dinKnurlSizes(20, 1, "diamond", "mm").helixAngle).toBe(30);
        expect(dinKnurlSizes(20, 1, "left", "mm").helixAngle).toBe(30);
        expect(() => dinKnurlSizes(20, 0.7, "straight", "mm")).toThrow("`pitch` is 0.7, not one of DIN 82's");
        expect(() => dinKnurlSizes(1, 1, "straight", "mm")).toThrow("`diameter` is too small");
    });

    it("should refuse a pattern other than the four DIN 82 gives rather than turn it by 30 degrees", () => {
        // Act & Assert
        expect(() => dinKnurlSizes(20, 1, "zigzag" as KnurlPattern, "mm")).toThrow("`pattern` is not one of straight, left, right, diamond.");
    });

    it("should read the diameter in inches and give the corrected diameter and the depth in inches, the pitch staying DIN's", () => {
        // Act
        const knurl = dinKnurlSizes(19.6 / 25.4, 0.8, "straight", "in");

        // Assert
        expect(knurl).toEqual({ grooves: 77, diameter: 0.771964134, depth: 0.015748031, helixAngle: 0 });
        expect(() => dinKnurlSizes(0.05, 1, "straight", "in")).toThrow("`diameter` is too small for a knurl of pitch 1: make it more than 0.078740157.");
    });
});
