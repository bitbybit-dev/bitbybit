import { describe, expect, it } from "vitest";
import type { AnsiSplinePitch } from "./spline-types";
import { ansiInvoluteSplineSizes } from "./ansi-splines";

describe("ansi splines", () => {
    it("should size a 24 tooth 16/32 flat root side fit spline as the published example has it", () => {
        // Act
        const spline = ansiInvoluteSplineSizes(24, "16/32", "in");

        // Assert
        expect(spline).toEqual({ referenceDiameter: 1.5, module: 0.0625, teeth: 24, pressureAngle: 30, profileShift: 0, rootFillet: 0.1, shaftTipDiameter: 1.5625, shaftRootDiameter: 1.415625, hubTipDiameter: 1.4375, hubRootDiameter: 1.584375 });
    });

    it("should refuse a pitch B92.1 does not list and a tooth count outside 6 to 60", () => {
        // Act & Assert
        expect(() => ansiInvoluteSplineSizes(24, "7/14" as AnsiSplinePitch, "in")).toThrow("`pitch` is 7/14, not one ANSI B92.1 gives its 30 degree flat root side fit: 2.5/5, 3/6, 4/8, 5/10, 6/12, 8/16, 10/20, 12/24, 16/32, 20/40, 24/48, 32/64.");
        expect(() => ansiInvoluteSplineSizes(24, "64/128" as AnsiSplinePitch, "in")).toThrow("`pitch` is 64/128");
        expect(() => ansiInvoluteSplineSizes(5, "16/32", "in")).toThrow("`teeth` is 5");
        expect(() => ansiInvoluteSplineSizes(24.5, "16/32", "in")).toThrow("`teeth` is 24.5");
    });

    it("should give the spline in millimetres, its module 25.4 over the pitch", () => {
        // Act
        const millimetres = ansiInvoluteSplineSizes(24, "16/32", "mm");

        // Assert
        expect([millimetres.module, millimetres.referenceDiameter, millimetres.teeth]).toEqual([1.5875, 38.1, 24]);
    });
});
