import { describe, expect, it } from "vitest";
import { ansiRetainingRingDiameters, ansiRetainingRingSizes } from "./ansi-retaining-rings";

describe("ansi retaining rings", () => {
    it("should give the inch ring for a 3/4 shaft and a 1 inch bore with their grooves", () => {
        // Act
        const shaft = ansiRetainingRingSizes("shaft", 0.75, "in");
        const bore = ansiRetainingRingSizes("bore", 1, "in");

        // Assert
        expect([shaft.nominal, shaft.grooveDiameter, shaft.thickness, shaft.freeDiameter]).toEqual([0.75, 0.704, 0.042, 0.693]);
        expect([bore.nominal, bore.grooveDiameter, bore.freeDiameter]).toEqual([1, 1.066, 1.111]);
    });

    it("should find the 0.188 ring for a 3/16 shaft and refuse a diameter no ring is listed for, naming the nearest", () => {
        // Act & Assert
        expect(ansiRetainingRingSizes("shaft", 0.1875, "in").grooveDiameter).toBe(0.175);
        expect(() => ansiRetainingRingSizes("shaft", 0.9, "in")).toThrow("`diameter` is 0.9, a size the inch external rings list no ring for; the nearest is 0.875.");
    });

    it("should find the rings listed for millimetre shafts and bores from their millimetres, and fraction sizes from their exact fractions", () => {
        // Act
        const found = [ansiRetainingRingSizes("shaft", 26, "mm"), ansiRetainingRingSizes("bore", 37, "mm"), ansiRetainingRingSizes("bore", 0.4375, "in"), ansiRetainingRingSizes("shaft", 1.0625, "in")];

        // Assert
        expect(found.map(ring => ring.nominal)).toEqual([expect.closeTo(25.9842, 4), expect.closeTo(36.9824, 4), 0.438, 1.062]);
    });

    it("should be widest opposite its lugs, as a tapered section ring is, and grow its free diameter with its size", () => {
        // Act
        const shaft = ansiRetainingRingSizes("shaft", 1, "in");
        const bores = ansiRetainingRingDiameters("bore", "in").map(diameter => ansiRetainingRingSizes("bore", diameter, "in").freeDiameter);
        const shafts = ansiRetainingRingDiameters("shaft", "in").map(diameter => ansiRetainingRingSizes("shaft", diameter, "in").freeDiameter);

        // Assert
        expect(shaft.sectionWidth).toBe(0.116);
        expect(bores.every((free, index) => index === 0 || free > bores[index - 1]!)).toBe(true);
        expect(shafts.every((free, index) => index === 0 || free > shafts[index - 1]!)).toBe(true);
    });

    it("should seat every shaft ring in a groove under the shaft and every bore ring in one beyond the bore", () => {
        // Act
        const shafts = ansiRetainingRingDiameters("shaft", "in").map(diameter => ansiRetainingRingSizes("shaft", diameter, "in"));
        const bores = ansiRetainingRingDiameters("bore", "in").map(diameter => ansiRetainingRingSizes("bore", diameter, "in"));

        // Assert
        expect([shafts.length, bores.length]).toEqual([50, 38]);
        expect(shafts.every(ring => ring.freeDiameter < ring.grooveDiameter && ring.grooveDiameter < ring.nominal)).toBe(true);
        expect(bores.every(ring => ring.freeDiameter > ring.grooveDiameter && ring.grooveDiameter > ring.nominal)).toBe(true);
    });
});
