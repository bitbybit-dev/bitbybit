import { describe, expect, it } from "vitest";
import type { BallBearingDesignation, RetainingRingKind } from "./machine-element-types";
import { ballBearingDesignations, ballBearingSizes, compressionSpringPath, parallelKeySizes, retainingRingDiameters, retainingRingSizes } from "./machine-elements";

describe("machine elements", () => {
    describe("ball bearings", () => {
        it("should size a 6204 and a 608 by their designations, and refuse one it does not know", () => {
            // Act & Assert
            expect(ballBearingSizes("6204")).toEqual({ bore: 20, outside: 47, width: 14 });
            expect(ballBearingSizes("608")).toEqual({ bore: 8, outside: 22, width: 7 });
            expect(ballBearingDesignations()).toHaveLength(28);
            expect(() => ballBearingSizes("6300" as BallBearingDesignation)).toThrow("`designation`");
        });
    });

    describe("parallel keys", () => {
        it("should key a 25 shaft with an 8 by 7 key, 4 deep in the shaft and 3.3 in the hub, and refuse shafts outside the table", () => {
            // Act & Assert
            expect(parallelKeySizes(25)).toEqual({ width: 8, height: 7, shaftDepth: 4, hubDepth: 3.3 });
            expect(parallelKeySizes(22).width).toBe(6);
            expect(() => parallelKeySizes(6)).toThrow("`shaftDiameter`");
            expect(() => parallelKeySizes(70)).toThrow("`shaftDiameter`");
        });
    });

    describe("compression springs", () => {
        const spec = { wireDiameter: 2, diameter: 20, activeCoils: 6, length: 40 };

        it("should coil from 0 to the length at the mean radius, running on past both ends, its active coils sharing what the closed ends leave", () => {
            // Act
            const path = compressionSpringPath(spec);

            // Assert
            const heights = path.points.map(point => point[2]);
            expect(path.points).toContainEqual([9, 0, 0]);
            expect(Math.min(...heights)).toBeCloseTo(-0.75 * 2.1, 9);
            expect(Math.max(...heights)).toBeCloseTo(40 + 0.75 * 2.1, 9);
            expect(path.points.every(point => Math.abs(Math.hypot(point[0], point[1]) - 9) < 1e-9)).toBe(true);
            expect(path.pitch).toBeCloseTo((40 - 4.2) / 6, 12);
            expect(path.solidLength).toBeCloseTo(16.8, 12);
        });

        it("should close its end coils: the first coil rises by about the wire's diameter, an active one by the pitch", () => {
            // Act
            const path = compressionSpringPath(spec);

            // Assert
            const start = path.points.findIndex(point => point[2] === 0);
            const perCoil = 24;
            expect(path.points[start + perCoil]![2]).toBeLessThan(2.1 + 0.5);
            expect(path.points[start + 4 * perCoil]![2] - path.points[start + 3 * perCoil]![2]).toBeCloseTo((40 - 4.2) / 6, 6);
        });

        it("should refuse a spring shorter than solid, a wire too thick for its coils and no active coils", () => {
            // Act & Assert
            expect(() => compressionSpringPath({ ...spec, length: 16.5 })).toThrow("`length`");
            expect(() => compressionSpringPath({ ...spec, diameter: 6 })).toThrow("`diameter`");
            expect(() => compressionSpringPath({ ...spec, activeCoils: 0 })).toThrow("`activeCoils`");
            expect(() => compressionSpringPath({ ...spec, wireDiameter: 0 })).toThrow("`wireDiameter`");
            expect(() => compressionSpringPath({ ...spec, activeCoils: Infinity })).toThrow("`activeCoils` is Infinity; a spring is made of finite numbers.");
            expect(() => compressionSpringPath({ ...spec, length: Number.NaN })).toThrow("`length` is NaN; a spring is made of finite numbers.");
        });

        it("should say the wire check compares the outside diameter with three times the wire's", () => {
            // Act & Assert
            expect(() => compressionSpringPath({ ...spec, diameter: 6 })).toThrow("`diameter`, the outside diameter of the coils, is not more than three times `wireDiameter`.");
        });

        it("should refuse more active coils than a path is drawn for, and draw the most it takes", () => {
            // Act
            const longest = compressionSpringPath({ ...spec, activeCoils: 1000, length: 10000 });
            const tooMany = (): unknown => compressionSpringPath({ ...spec, activeCoils: 1e9, length: 1e10 });

            // Assert
            expect(longest.points).toHaveLength(24 * 1002 + 1 + 2 * 18);
            expect(tooMany).toThrow("`activeCoils` is more than 1000, the most a spring path is drawn for.");
        });
    });

    describe("a spring at its solid length", () => {
        it("should take the solid length as the tables print it, and name it so when a shorter one is refused", () => {
            // Act
            const solid = compressionSpringPath({ wireDiameter: 0.2, diameter: 2, activeCoils: 6, length: 1.68 });

            // Assert
            expect(solid.points.length).toBeGreaterThan(2);
            expect(() => compressionSpringPath({ wireDiameter: 0.2, diameter: 2, activeCoils: 6, length: 1.6 })).toThrow("solid length, 1.68,");
        });
    });

    describe("retaining rings", () => {
        it("should give a DIN 471 ring for a 20 mm shaft and a DIN 472 ring for a 47 mm bore with their grooves", () => {
            // Act
            const shaft = retainingRingSizes("shaft", 20);
            const bore = retainingRingSizes("bore", 47);

            // Assert
            expect(shaft).toEqual({ nominal: 20, thickness: 1.2, freeDiameter: 18.5, lugWidth: 4, sectionWidth: 2.6, lugHoleDiameter: 2, grooveDiameter: 19, grooveWidth: 1.3, edgeDistance: 1.5 });
            expect(bore).toEqual({ nominal: 47, thickness: 1.75, freeDiameter: 50.5, lugWidth: 6.4, sectionWidth: 4.4, lugHoleDiameter: 2.5, grooveDiameter: 49.5, grooveWidth: 1.85, edgeDistance: 3.8 });
        });

        it("should list the standard's sizes, the shaft ring free and grooved inside the shaft, the bore ring outside the bore", () => {
            // Act
            const shafts = retainingRingDiameters("shaft");
            const bores = retainingRingDiameters("bore");

            // Assert
            expect([shafts[0], shafts[shafts.length - 1], shafts.length]).toEqual([3, 100, 56]);
            expect([bores[0], bores[bores.length - 1], bores.length]).toEqual([8, 100, 55]);
            expect(shafts.every(diameter => { const ring = retainingRingSizes("shaft", diameter); return ring.freeDiameter < ring.grooveDiameter && ring.grooveDiameter < diameter; })).toBe(true);
            expect(bores.every(diameter => { const ring = retainingRingSizes("bore", diameter); return ring.freeDiameter > ring.grooveDiameter && ring.grooveDiameter > diameter; })).toBe(true);
        });

        it("should refuse a diameter the standard lists no ring for, naming the nearest", () => {
            // Act & Assert
            expect(() => retainingRingSizes("shaft", 21.5)).toThrow("`diameter` is 21.5, a size DIN 471 lists no ring for; the nearest is 21.");
            expect(() => retainingRingSizes("bore", 6)).toThrow("`diameter` is 6, a size DIN 472 lists no ring for; the nearest is 8.");
        });

        it("should refuse a kind other than a shaft or a bore rather than give it bore rings", () => {
            // Arrange
            const hub = "hub" as RetainingRingKind;

            // Act & Assert
            expect(() => retainingRingSizes(hub, 20)).toThrow("`kind` is not one of shaft, bore.");
            expect(() => retainingRingDiameters(hub)).toThrow("`kind` is not one of shaft, bore.");
        });
    });
});
