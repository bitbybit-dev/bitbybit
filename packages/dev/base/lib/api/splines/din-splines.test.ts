import { describe, expect, it } from "vitest";
import { dinInvoluteSplineSizes } from "./din-splines";

describe("din splines", () => {
    it("should size W 25x1.25x18 as the published example has it", () => {
        // Act
        const spline = dinInvoluteSplineSizes(25, 1.25, "mm");

        // Assert
        expect(spline).toEqual({ referenceDiameter: 25, module: 1.25, teeth: 18, pressureAngle: 30, profileShift: 0.45, rootFillet: 0.16, shaftTipDiameter: 24.75, shaftRootDiameter: 22.25, hubTipDiameter: 22.5, hubRootDiameter: 25 });
    });

    it("should pick 24 teeth and a shift of -0.05 for W 50x2, the even count where two fit", () => {
        // Act
        const spline = dinInvoluteSplineSizes(50, 2, "mm");

        // Assert
        expect([spline.teeth, spline.profileShift]).toEqual([24, -0.05]);
    });

    it("should pick the one count that fits where the diameter is no whole number of modules", () => {
        // Act
        const spline = dinInvoluteSplineSizes(26, 1.25, "mm");

        // Assert
        expect(spline.teeth).toBe(19);
        expect(spline.profileShift).toBeGreaterThanOrEqual(-0.05);
        expect(spline.profileShift).toBeLessThanOrEqual(0.45);
    });

    it("should refuse a module DIN 5480 does not list and a spline too small for its module", () => {
        // Act & Assert
        expect(() => dinInvoluteSplineSizes(25, 1.3, "mm")).toThrow("`module` is 1.3, not one of DIN 5480's");
        expect(() => dinInvoluteSplineSizes(6, 1, "mm")).toThrow("has no tooth count DIN 5480 allows");
    });

    it("should give the lengths in inches and keep the teeth, the angle and the shares", () => {
        // Act
        const inches = dinInvoluteSplineSizes(25, 1.25, "in");

        // Assert
        expect(inches).toEqual({ referenceDiameter: 0.984251969, module: 0.049212598, teeth: 18, pressureAngle: 30, profileShift: 0.45, rootFillet: 0.16, shaftTipDiameter: 0.974409449, shaftRootDiameter: 0.875984252, hubTipDiameter: 0.885826772, hubRootDiameter: 0.984251969 });
    });
});
