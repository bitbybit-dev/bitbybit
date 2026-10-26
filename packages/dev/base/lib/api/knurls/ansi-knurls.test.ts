import { describe, expect, it } from "vitest";
import { ansiKnurlSizes } from "./ansi-knurls";

describe("ansi knurls", () => {
    it("should fit 48 grooves of 96 DP round a half inch blank, as the makers' charts have it, as deep as B94.6 presses its teeth", () => {
        // Act
        const knurl = ansiKnurlSizes(0.5, 96, "straight", "in");
        const depths = [64, 128, 160].map(pitch => ansiKnurlSizes(1, pitch, "straight", "in").depth);

        // Assert
        expect(knurl).toEqual({ grooves: 48, diameter: 0.5, depth: 0.016, helixAngle: 0 });
        expect(depths).toEqual([0.024, 0.012, 0.009]);
    });

    it("should knurl no blank with fewer teeth round it than the pitch needs, naming the smallest blank in the unit asked for", () => {
        // Act & Assert
        expect(ansiKnurlSizes(0.375, 64, "straight", "in").grooves).toBe(24);
        expect(() => ansiKnurlSizes(0.36, 64, "straight", "in")).toThrow("`diameter` is too small for a 64 pitch knurl, which needs 24 teeth round the work: make it at least 0.375.");
        expect(() => ansiKnurlSizes(2, 160, "straight", "mm")).toThrow("make it at least 2.38125.");
    });

    it("should nudge a blank that does not track to the nearest that does, turn diagonal and diamond grooves 30 degrees, and refuse a pitch B94.6 does not list", () => {
        // Act & Assert
        expect(ansiKnurlSizes(0.51, 96, "straight", "in")).toMatchObject({ grooves: 49, diameter: 0.510417 });
        expect(ansiKnurlSizes(0.5, 128, "diamond", "in").helixAngle).toBe(30);
        expect(() => ansiKnurlSizes(0.5, 80, "straight", "in")).toThrow("`diametralPitch` is 80, not one of ASME B94.6's: 64, 96, 128, 160.");
        expect(() => ansiKnurlSizes(0.05, 64, "straight", "in")).toThrow("`diameter` is too small");
    });
});
