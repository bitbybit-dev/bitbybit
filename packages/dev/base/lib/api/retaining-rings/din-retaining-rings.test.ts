import { describe, expect, it } from "vitest";
import type { RetainingRingKind } from "./retaining-ring-types";
import { dinRetainingRingDiameters, dinRetainingRingSizes } from "./din-retaining-rings";

describe("din retaining rings", () => {
    describe("retaining rings", () => {
        it("should find the ring for a millimetre size rounded in inches, to six places as a field shows it or nine as a measured radius keeps it", () => {
            // Act
            const rings = ([["shaft", 0.787402], ["shaft", 0.787401574], ["bore", 1.850394]] as const).map(([kind, diameter]) => dinRetainingRingSizes(kind, diameter, "in").nominal);

            // Assert
            expect(rings).toEqual([expect.closeTo(20 / 25.4, 9), expect.closeTo(20 / 25.4, 9), expect.closeTo(47 / 25.4, 9)]);
        });

        it("should give a DIN 471 ring for a 20 mm shaft and a DIN 472 ring for a 47 mm bore with their grooves", () => {
            // Act
            const shaft = dinRetainingRingSizes("shaft", 20, "mm");
            const bore = dinRetainingRingSizes("bore", 47, "mm");

            // Assert
            expect(shaft).toEqual({ nominal: 20, thickness: 1.2, freeDiameter: 18.5, lugWidth: 4, sectionWidth: 2.6, lugHoleDiameter: 2, grooveDiameter: 19, grooveWidth: 1.3, edgeDistance: 1.5 });
            expect(bore).toEqual({ nominal: 47, thickness: 1.75, freeDiameter: 50.5, lugWidth: 6.4, sectionWidth: 4.4, lugHoleDiameter: 2.5, grooveDiameter: 49.5, grooveWidth: 1.85, edgeDistance: 3.8 });
        });

        it("should list the standard's sizes, the shaft ring free and grooved inside the shaft, the bore ring outside the bore", () => {
            // Act
            const shafts = dinRetainingRingDiameters("shaft", "mm");
            const bores = dinRetainingRingDiameters("bore", "mm");

            // Assert
            expect([shafts[0], shafts[shafts.length - 1], shafts.length]).toEqual([3, 100, 56]);
            expect([bores[0], bores[bores.length - 1], bores.length]).toEqual([8, 100, 55]);
            expect(shafts.every(diameter => { const ring = dinRetainingRingSizes("shaft", diameter, "mm"); return ring.freeDiameter < ring.grooveDiameter && ring.grooveDiameter < diameter; })).toBe(true);
            expect(bores.every(diameter => { const ring = dinRetainingRingSizes("bore", diameter, "mm"); return ring.freeDiameter > ring.grooveDiameter && ring.grooveDiameter > diameter; })).toBe(true);
        });

        it("should refuse a diameter the standard lists no ring for, naming the nearest", () => {
            // Act & Assert
            expect(() => dinRetainingRingSizes("shaft", 21.5, "mm")).toThrow("`diameter` is 21.5, a size DIN 471 lists no ring for; the nearest is 21.");
            expect(() => dinRetainingRingSizes("bore", 6, "mm")).toThrow("`diameter` is 6, a size DIN 472 lists no ring for; the nearest is 8.");
        });

        it("should refuse a kind other than a shaft or a bore rather than give it bore rings", () => {
            // Arrange
            const hub = "hub" as RetainingRingKind;

            // Act & Assert
            expect(() => dinRetainingRingSizes(hub, 20, "mm")).toThrow("`kind` is not one of shaft, bore.");
            expect(() => dinRetainingRingDiameters(hub, "mm")).toThrow("`kind` is not one of shaft, bore.");
        });

        it("should find a 20 mm shaft's ring from its diameter in inches, give the ring in inches and name the nearest size in inches", () => {
            // Act
            const ring = dinRetainingRingSizes("shaft", 20 / 25.4, "in");

            // Assert
            expect([ring.nominal, ring.grooveDiameter, ring.thickness]).toEqual([0.787401575, 0.748031496, 0.047244094]);
            expect(dinRetainingRingDiameters("shaft", "in")[0]).toBe(0.118110236);
            expect(() => dinRetainingRingSizes("shaft", 0.85, "in")).toThrow("`diameter` is 0.85, a size DIN 471 lists no ring for; the nearest is 0.866141732.");
        });
    });
});
