import { describe, expect, it } from "vitest";
import type { MetricSize, SetScrewPoint } from "./fastener-types";
import { chamferedWasherSizes, clearanceHoleDiameter, hexBoltSizes, hexNutSizes, metricSizes, metricThread, setScrewSizes, socketHeadCapScrewSizes, washerSizes } from "./fasteners";

describe("fasteners", () => {
    describe("metricThread", () => {
        it("should give an M8's coarse pitch, its diameters and the drill to tap it", () => {
            // Act
            const thread = metricThread("M8");

            // Assert
            expect([thread.diameter, thread.pitch, thread.tapDrill]).toEqual([8, 1.25, 6.8]);
            expect(thread.pitchDiameter).toBeCloseTo(7.188, 3);
            expect(thread.minorDiameter).toBeCloseTo(6.466, 3);
            expect(thread.internalMinorDiameter).toBeCloseTo(6.647, 3);
        });

        it("should take a fine pitch and drill for it, and refuse one coarser than the coarse pitch", () => {
            // Act
            const fine = metricThread("M8", 1);

            // Assert
            expect([fine.pitch, fine.tapDrill]).toEqual([1, 7]);
            expect(() => metricThread("M8", 1.5)).toThrow("`pitch`");
            expect(() => metricThread("M8", 0)).toThrow("`pitch`");
        });

        it("should know every size from M1.6 to M24, and no other", () => {
            // Act
            const sizes = metricSizes();

            // Assert
            expect(sizes[0]).toBe("M1.6");
            expect(sizes[sizes.length - 1]).toBe("M24");
            expect(sizes.every(size => metricThread(size).tapDrill < metricThread(size).diameter)).toBe(true);
            expect(() => metricThread("M7" as MetricSize)).toThrow("`size`");
        });
    });

    describe("holes and heads", () => {
        it("should give ISO 273's close, normal and loose clearance holes, normal when the fit is left out", () => {
            // Act & Assert
            expect([clearanceHoleDiameter("M6", "close"), clearanceHoleDiameter("M6"), clearanceHoleDiameter("M6", "loose")]).toEqual([6.4, 6.6, 7]);
            expect(() => clearanceHoleDiameter("M6", "snug" as "close")).toThrow("`fit`");
        });

        it("should size an M5 socket head cap screw's head, its socket, its thread and the counterbore for it", () => {
            // Act
            const screw = socketHeadCapScrewSizes("M5");

            // Assert
            expect(screw).toEqual({ headDiameter: 8.5, headHeight: 5, socketSize: 4, socketDepth: 2.5, counterboreDiameter: 10, threadLength: 22, counterboreDepth: 5.5 });
        });

        it("should thread more of a longer ISO 4014 bolt", () => {
            // Act
            const lengths = [100, 150, 250].map(length => hexBoltSizes("M10", length).threadLength);

            // Assert
            expect(lengths).toEqual([26, 32, 45]);
            expect(hexBoltSizes("M10", 50).acrossFlats).toBe(16);
            expect(() => hexBoltSizes("M10", 0)).toThrow("`length`");
        });

        it("should size an M12 nut and washer, and an M6 set screw's socket as deep as ISO gives a long screw and a short one", () => {
            // Act & Assert
            expect(hexNutSizes("M12")).toEqual({ acrossFlats: 18, height: 10.8 });
            expect(washerSizes("M12")).toEqual({ innerDiameter: 13, outerDiameter: 24, thickness: 2.5 });
            expect(setScrewSizes("M6").socketSize).toBe(3);
            expect(setScrewSizes("M6").socketDepth).toBe(3.5);
            expect(setScrewSizes("M6", "flat", 6).socketDepth).toBe(2);
        });
    });

    describe("set screw points", () => {
        it.each([
            ["flat", 10, { pointDiameter: 3.5, pointAngle: 90, shortUpTo: 5 }],
            ["cone", 10, { pointDiameter: 1.25, pointAngle: 90, shortUpTo: 6 }],
            ["cone", 5, { pointDiameter: 1.25, pointAngle: 120, shortUpTo: 6 }],
            ["dog", 10, { pointDiameter: 3.5, pointAngle: 90, shortUpTo: 6 }],
            ["cup", 10, { pointDiameter: 2.5, pointAngle: 120, shortUpTo: 5 }],
        ] as const)("should give an M5 set screw's %s point at length %i as ISO 4026 to 4029 have it", (point, length, expected) => {
            // Act
            const sizes = setScrewSizes("M5", point, length);

            // Assert
            expect(sizes).toMatchObject(expected);
            expect(sizes.pointLength).toBeGreaterThan(0);
        });

        it("should give a long dog its long length, a short one its short length, and a cup the depth its sharp rim gives", () => {
            // Arrange
            const root = metricThread("M5").minorDiameter;

            // Act
            const long = setScrewSizes("M5", "dog", 10);
            const short = setScrewSizes("M5", "dog", 6);
            const cup = setScrewSizes("M5", "cup", 10);

            // Assert
            expect(long.pointLength).toBeCloseTo((root - 3.5) / 2 + 2.5, 5);
            expect(short.pointLength).toBeCloseTo((root - 3.5) / 2 + 1.25, 5);
            expect(cup.pointLength).toBeCloseTo(2.5 / 2 / Math.tan(Math.PI / 3), 5);
        });

        it("should refuse an M14 set screw, which ISO does not list", () => {
            // Act & Assert
            expect(() => setScrewSizes("M14")).toThrow("`size` is M14, which ISO 4026 to 4029 give no set screw for.");
        });

        it("should refuse a point other than the four ISO gives", () => {
            // Act & Assert
            expect(() => setScrewSizes("M5", "foo" as SetScrewPoint)).toThrow("`point` is not one of flat, cone, dog, cup.");
        });
    });

    describe("chamfered washers", () => {
        it("should give an ISO 7090 washer the ISO 7089 sizes and a chamfer a quarter of its thickness high, and refuse one below M5", () => {
            // Act
            const washer = chamferedWasherSizes("M8");
            const small = (): unknown => chamferedWasherSizes("M4");

            // Assert
            expect(washer).toEqual({ innerDiameter: 8.4, outerDiameter: 16, thickness: 1.6, chamferHeight: 0.4, chamferWidth: 0.23094 });
            expect(small).toThrow("`size` is M4; ISO 7090 starts at M5.");
        });
    });

    describe("numbers as the tables print them", () => {
        it("should give fine-pitch tap drills and diameters without rounding noise, and the M1.6 cap screw's thread 15 long", () => {
            // Act & Assert
            expect(metricThread("M3", 0.35).tapDrill).toBe(2.65);
            expect(metricThread("M1.6").tapDrill).toBe(1.25);
            expect(socketHeadCapScrewSizes("M1.6").threadLength).toBe(15);
            expect(socketHeadCapScrewSizes("M8").threadLength).toBe(28);
        });
    });
});
