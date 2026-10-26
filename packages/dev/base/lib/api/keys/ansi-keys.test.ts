import { describe, expect, it } from "vitest";
import { ansiParallelKeySizes } from "./ansi-keys";

describe("ansi keys", () => {
    it("should key a 1 inch shaft with a 1/4 square key, its keyseat and hub keyway at B17.1's S and T, which measure H/2 at the keyseat's side", () => {
        // Act
        const sizes = ansiParallelKeySizes(1, "in");

        // Assert
        expect([sizes.width, sizes.height]).toEqual([0.25, 0.25]);
        expect(1 - sizes.shaftDepth).toBeCloseTo(0.859, 3);
        expect(1 + sizes.hubDepth).toBeCloseTo(1.114, 3);
        expect(ansiParallelKeySizes(1.25, "in").width).toBe(0.25);
        expect(ansiParallelKeySizes(1.26, "in").width).toBe(0.3125);
    });

    it("should keep the key's side above the keyseat at half its height on every shaft of a size, the chord deeper on a thinner shaft", () => {
        // Act
        const [thin, thick] = [0.9, 1.25].map(diameter => ({ diameter, sizes: ansiParallelKeySizes(diameter, "in") }));
        const sideDepth = ({ diameter, sizes }: { diameter: number; sizes: { width: number; shaftDepth: number } }): number => sizes.shaftDepth - (diameter - Math.sqrt(diameter * diameter - sizes.width * sizes.width)) / 2;

        // Assert
        expect(sideDepth(thin!)).toBeCloseTo(0.125, 9);
        expect(sideDepth(thick!)).toBeCloseTo(0.125, 9);
        expect(thin!.sizes.shaftDepth).toBeGreaterThan(thick!.sizes.shaftDepth);
    });

    it("should refuse shafts outside the square keys' table, naming its ends in the unit asked for", () => {
        // Act & Assert
        expect(() => ansiParallelKeySizes(0.3125, "in")).toThrow("`shaftDiameter` is not more than 0.3125 and at most 6.5.");
        expect(() => ansiParallelKeySizes(200, "mm")).toThrow("`shaftDiameter` is not more than 7.9375 and at most 165.1.");
    });

    it("should never give a thicker shaft a smaller key", () => {
        // Act
        const widths = [0.4, 0.5, 0.75, 1, 1.3, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6].map(diameter => ansiParallelKeySizes(diameter, "in").width);

        // Assert
        expect(widths.every((width, index) => index === 0 || width >= widths[index - 1]!)).toBe(true);
    });
});
