import { describe, expect, it } from "vitest";
import type { IsoSetScrewPoint } from "./fastener-types";
import { isoChamferedWasherSizes, isoClearanceHoleDiameter, isoHexBoltSizes, isoHexNutSizes, isoSetScrewSizes, isoSocketHeadCapScrewSizes, isoWasherSizes } from "./iso-fasteners";
import { isoThread } from "../threads/iso-threads";

describe("iso fasteners", () => {
    describe("holes and heads", () => {
        it("should give ISO 273's close, normal and loose clearance holes", () => {
            // Act & Assert
            expect([isoClearanceHoleDiameter("M6", "close"), isoClearanceHoleDiameter("M6", "normal"), isoClearanceHoleDiameter("M6", "loose")]).toEqual([6.4, 6.6, 7]);
            expect(() => isoClearanceHoleDiameter("M6", "snug" as "close")).toThrow("`fit`");
        });

        it("should size an M5 socket head cap screw's head, its socket, its thread and the counterbore for it", () => {
            // Act
            const screw = isoSocketHeadCapScrewSizes("M5");

            // Assert
            expect(screw).toEqual({ headDiameter: 8.5, headHeight: 5, socketSize: 4, socketDepth: 2.5, counterboreDiameter: 10, threadLength: 22, counterboreDepth: 5.5 });
        });

        it("should thread more of a longer ISO 4014 bolt", () => {
            // Act
            const lengths = [100, 150, 250].map(length => isoHexBoltSizes("M10", length).threadLength);

            // Assert
            expect(lengths).toEqual([26, 32, 45]);
            expect(isoHexBoltSizes("M10", 50).acrossFlats).toBe(16);
            expect(() => isoHexBoltSizes("M10", 0)).toThrow("`length`");
        });

        it("should size an M12 nut and washer, and an M6 set screw's socket as deep as ISO gives a long screw and a short one", () => {
            // Act & Assert
            expect(isoHexNutSizes("M12")).toEqual({ acrossFlats: 18, height: 10.8 });
            expect(isoWasherSizes("M12")).toEqual({ innerDiameter: 13, outerDiameter: 24, thickness: 2.5 });
            expect(isoSetScrewSizes("M6", "flat").socketSize).toBe(3);
            expect(isoSetScrewSizes("M6", "flat").socketDepth).toBe(3.5);
            expect(isoSetScrewSizes("M6", "flat", 6).socketDepth).toBe(2);
        });

        it("should thread the M1.6 cap screw 15 long and the M8 28", () => {
            // Act & Assert
            expect(isoSocketHeadCapScrewSizes("M1.6").threadLength).toBe(15);
            expect(isoSocketHeadCapScrewSizes("M8").threadLength).toBe(28);
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
            const sizes = isoSetScrewSizes("M5", point, length);

            // Assert
            expect(sizes).toMatchObject(expected);
            expect(sizes.pointLength).toBeGreaterThan(0);
        });

        it("should give a long dog its long length, a short one its short length, and a cup the depth its sharp rim gives", () => {
            // Arrange
            const root = isoThread("M5").minorDiameter;

            // Act
            const long = isoSetScrewSizes("M5", "dog", 10);
            const short = isoSetScrewSizes("M5", "dog", 6);
            const cup = isoSetScrewSizes("M5", "cup", 10);

            // Assert
            expect(long.pointLength).toBeCloseTo((root - 3.5) / 2 + 2.5, 5);
            expect(short.pointLength).toBeCloseTo((root - 3.5) / 2 + 1.25, 5);
            expect(cup.pointLength).toBeCloseTo(2.5 / 2 / Math.tan(Math.PI / 3), 5);
        });

        it("should refuse an M14 set screw, which ISO does not list", () => {
            // Act & Assert
            expect(() => isoSetScrewSizes("M14", "flat")).toThrow("`size` is M14, which ISO 4026 to 4029 give no set screw for.");
        });

        it("should refuse a point other than the four ISO gives", () => {
            // Act & Assert
            expect(() => isoSetScrewSizes("M5", "foo" as IsoSetScrewPoint)).toThrow("`point` is not one of flat, cone, dog, cup.");
        });
    });

    describe("chamfered washers", () => {
        it("should give an ISO 7090 washer the ISO 7089 sizes and a chamfer a quarter of its thickness high, and refuse one below M5", () => {
            // Act
            const washer = isoChamferedWasherSizes("M8");
            const small = (): unknown => isoChamferedWasherSizes("M4");

            // Assert
            expect(washer).toEqual({ innerDiameter: 8.4, outerDiameter: 16, thickness: 1.6, chamferHeight: 0.4, chamferWidth: 0.23094 });
            expect(small).toThrow("`size` is M4; ISO 7090 starts at M5.");
        });
    });
});
