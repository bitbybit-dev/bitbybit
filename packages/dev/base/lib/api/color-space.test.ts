import { describe, it, expect } from "vitest";
import { linearToSrgb, srgbToLinear } from "./color-space";

describe("color space", () => {
    it("should decode an sRGB channel to linear light, straight below the knee and on the power curve above it", () => {
        // Act
        const linear = [0, 0.04, 0.045, 0.5, 1].map(srgbToLinear);

        // Assert
        expect(linear[0]).toBe(0);
        expect(linear[1]).toBeCloseTo(0.04 / 12.92, 12);
        expect(linear[2]).toBeCloseTo(0.0035010160107980036, 12);
        expect(linear[3]).toBeCloseTo(0.214041140482232, 12);
        expect(linear[4]).toBeCloseTo(1, 12);
    });

    it("should encode linear light back to sRGB, so a channel survives the round trip", () => {
        // Act
        const encoded = [0, 0.003, 0.214041140482232, 1].map(linearToSrgb);
        const roundTrips = [0.02, 0.2, 0.73].map(channel => linearToSrgb(srgbToLinear(channel)));

        // Assert
        expect(encoded[0]).toBe(0);
        expect(encoded[1]).toBeCloseTo(0.003 * 12.92, 12);
        expect(encoded[2]).toBeCloseTo(0.5, 12);
        expect(encoded[3]).toBeCloseTo(1, 12);
        roundTrips.forEach((channel, index) => expect(channel).toBeCloseTo([0.02, 0.2, 0.73][index]!, 12));
    });
});
