import { describe, expect, it } from "vitest";
import { involuteSplineSizes, knurlSizes } from "./shafts";
import type { KnurlPattern } from "./shaft-types";

describe("shafts", () => {
    describe("involute splines", () => {
        it("should size W 25x1.25x18 as the published example has it", () => {
            // Act
            const spline = involuteSplineSizes(25, 1.25);

            // Assert
            expect(spline).toEqual({ referenceDiameter: 25, module: 1.25, teeth: 18, pressureAngle: 30, profileShift: 0.45, shaftTipDiameter: 24.75, shaftRootDiameter: 22.25, hubTipDiameter: 22.5, hubRootDiameter: 25 });
        });

        it("should pick 24 teeth and a shift of -0.05 for W 50x2, the even count where two fit", () => {
            // Act
            const spline = involuteSplineSizes(50, 2);

            // Assert
            expect([spline.teeth, spline.profileShift]).toEqual([24, -0.05]);
        });

        it("should pick the one count that fits where the diameter is no whole number of modules", () => {
            // Act
            const spline = involuteSplineSizes(26, 1.25);

            // Assert
            expect(spline.teeth).toBe(19);
            expect(spline.profileShift).toBeGreaterThanOrEqual(-0.05);
            expect(spline.profileShift).toBeLessThanOrEqual(0.45);
        });

        it("should refuse a module DIN 5480 does not list and a spline too small for its module", () => {
            // Act & Assert
            expect(() => involuteSplineSizes(25, 1.3)).toThrow("`module` is 1.3, not one of DIN 5480's");
            expect(() => involuteSplineSizes(6, 1)).toThrow("has no tooth count DIN 5480 allows");
        });
    });

    describe("knurls", () => {
        it("should fit 77 grooves of pitch 0.8 round a 19.6 diameter, nudging it to 19.608 so they divide it evenly", () => {
            // Act
            const knurl = knurlSizes(19.6, 0.8, "straight");

            // Assert
            expect(knurl).toEqual({ grooves: 77, diameter: 19.607889, depth: 0.4, helixAngle: 0 });
        });

        it("should turn the grooves of a diamond and of a helical knurl by 30 degrees, and refuse a pitch DIN 82 does not list", () => {
            // Act & Assert
            expect(knurlSizes(20, 1, "diamond").helixAngle).toBe(30);
            expect(knurlSizes(20, 1, "left").helixAngle).toBe(30);
            expect(() => knurlSizes(20, 0.7, "straight")).toThrow("`pitch` is 0.7, not one of DIN 82's");
            expect(() => knurlSizes(1, 1, "straight")).toThrow("`diameter` is too small");
        });

        it("should refuse a pattern other than the four DIN 82 gives rather than turn it by 30 degrees", () => {
            // Act & Assert
            expect(() => knurlSizes(20, 1, "zigzag" as KnurlPattern)).toThrow("`pattern` is not one of straight, left, right, diamond.");
        });
    });
});
