import { describe, expect, it } from "vitest";
import type { AnsiSetScrewPoint } from "./fastener-types";
import { ansiClearanceHoleDiameter, ansiHexBoltSizes, ansiHexNutSizes, ansiSetScrewSizes, ansiSocketHeadCapScrewSizes, ansiWasherSizes } from "./ansi-fasteners";
import { ansiThread, ansiThreadSizes } from "../threads/ansi-threads";
import type { AnsiThreadSize } from "../threads/thread-types";

const listedOnly = <T>(sizes: readonly AnsiThreadSize[], make: (size: AnsiThreadSize) => T): T[] => sizes.flatMap(size => { try { return [make(size)]; } catch { return []; } });

describe("ansi fasteners", () => {
    it("should give B18.2.8's close, normal and loose holes for a 1/4 screw, the 17/64, 9/32 and 19/64 drills", () => {
        // Act & Assert
        expect((["close", "normal", "loose"] as const).map(fit => ansiClearanceHoleDiameter("1/4", fit))).toEqual([0.266, 0.281, 0.297]);
        expect(() => ansiClearanceHoleDiameter("#12", "normal")).toThrow("`size` is #12, which ASME B18.2.8 gives no size for.");
    });

    it("should size a 1/4 and a #10 socket head cap screw as B18.3 lists them, the counterbore sinking the head 0.02 below the face", () => {
        // Act
        const quarter = ansiSocketHeadCapScrewSizes("1/4");
        const ten = ansiSocketHeadCapScrewSizes("#10");

        // Assert
        expect(quarter).toEqual({ headDiameter: 0.375, headHeight: 0.25, socketSize: 0.1875, socketDepth: 0.12, threadLength: 1, counterboreDiameter: 0.4375, counterboreDepth: 0.27 });
        expect([ten.headDiameter, ten.socketSize, ten.threadLength, ten.counterboreDiameter]).toEqual([0.312, 0.15625, 0.875, 0.375]);
        expect(() => ansiSocketHeadCapScrewSizes("9/16")).toThrow("`size` is 9/16, which ASME B18.3 gives no size for.");
    });

    it("should thread a hex cap screw twice its diameter and a quarter inch up to 6 long, and half an inch more past 6", () => {
        // Act
        const short = ansiHexBoltSizes("1/2", 6);
        const long = ansiHexBoltSizes("1/2", 6.5);

        // Assert
        expect([short.acrossFlats, short.headHeight, short.threadLength, long.threadLength]).toEqual([0.75, 0.3125, 1.25, 1.5]);
        expect(() => ansiHexBoltSizes("#10", 1)).toThrow("`size` is #10, which ASME B18.2.1 gives no size for.");
        expect(() => ansiHexBoltSizes("1/2", 0)).toThrow("`length`");
    });

    it("should give machine screw nuts below 1/4 and hex nuts from 1/4, a 7/16 nut wider across flats than its cap screw", () => {
        // Act & Assert
        expect(ansiHexNutSizes("#4")).toEqual({ acrossFlats: 0.25, height: 0.09375 });
        expect(ansiHexNutSizes("1/4")).toEqual({ acrossFlats: 0.4375, height: 0.21875 });
        expect([ansiHexNutSizes("7/16").acrossFlats, ansiHexBoltSizes("7/16", 1).acrossFlats]).toEqual([0.6875, 0.625]);
    });

    it("should give narrow and wide washers, one size for both below 1/4, and none for #5 and below", () => {
        // Act & Assert
        expect(ansiWasherSizes("1/4", "narrow")).toEqual({ innerDiameter: 0.281, outerDiameter: 0.625, thickness: 0.065 });
        expect(ansiWasherSizes("1/4", "wide")).toEqual({ innerDiameter: 0.312, outerDiameter: 0.734, thickness: 0.065 });
        expect(ansiWasherSizes("#10", "narrow")).toEqual(ansiWasherSizes("#10", "wide"));
        expect(() => ansiWasherSizes("#5", "narrow")).toThrow("`size` is #5, which ASME B18.22.1 gives no size for.");
    });

    it("should give a 1/4 set screw's five points, a short screw a shallower socket and a blunter cone", () => {
        // Arrange
        const root = ansiThread("1/4", "UNC").minorDiameter / 2;

        // Act
        const [cup, flat, cone, oval, halfDog] = (["cup", "flat", "cone", "oval", "halfDog"] as const).map(point => ansiSetScrewSizes("1/4", point, "UNC", 0.5));
        const shortCone = ansiSetScrewSizes("1/4", "cone", "UNC", 0.25);

        // Assert
        expect([cup!.socketSize, cup!.socketDepth, cup!.pointDiameter, cup!.pointAngle]).toEqual([0.125, 0.125, 0.132, 118]);
        expect([flat!.pointDiameter, flat!.pointAngle]).toEqual([0.132, 90]);
        expect(flat!.pointLength).toBeCloseTo(root - 0.066, 5);
        expect([cone!.pointDiameter, cone!.pointAngle, shortCone.pointAngle, shortCone.socketDepth]).toEqual([0, 90, 118, 0.105]);
        expect([oval!.pointRadius, oval!.pointAngle]).toEqual([0.188, 0]);
        expect(oval!.pointLength).toBeCloseTo(0.188 - Math.sqrt(0.188 * 0.188 - root * root), 5);
        expect(halfDog!.pointDiameter).toBe(0.156);
        expect(halfDog!.pointLength).toBeCloseTo(root - 0.078 + 0.067, 5);
        expect(() => ansiSetScrewSizes("1/4", "dog" as AnsiSetScrewPoint, "UNC")).toThrow("`point` is not one of cup, flat, cone, oval, halfDog.");
    });

    it("should treat a set screw exactly as long as a threshold the standard writes to two decimals as long, and never sink a short one deeper", () => {
        // Act
        const atSocket = ansiSetScrewSizes("3/8", "cup", "UNC", 0.375);
        const cones = [ansiSetScrewSizes("#4", "cone", "UNC", 0.1875), ansiSetScrewSizes("1", "cone", "UNC", 1.125), ansiSetScrewSizes("1/2", "cone", "UNC", 0.5625)];
        const depths = (["#4", "#10"] as const).map(size => [ansiSetScrewSizes(size, "cup", "UNC", 0.0625).socketDepth, ansiSetScrewSizes(size, "cup", "UNC", 1).socketDepth]);

        // Assert
        expect([atSocket.socketDepth, atSocket.shortUpTo]).toEqual([0.188, 0.375]);
        expect(cones.map(cone => cone.pointAngle)).toEqual([90, 90, 118]);
        expect(depths).toEqual([[0.07, 0.07], [0.1, 0.1]]);
    });

    it("should grow every listed hole, head, nut and washer with the size, each hole wider than its thread and each counterbore than its head", () => {
        // Arrange
        const sizes = ansiThreadSizes();

        // Act
        const holes = listedOnly(sizes, size => ({ size, hole: ansiClearanceHoleDiameter(size, "close") }));
        const heads = listedOnly(sizes, size => ansiSocketHeadCapScrewSizes(size));
        const nuts = sizes.map(size => ansiHexNutSizes(size));
        const washers = listedOnly(sizes, size => ansiWasherSizes(size, "wide"));
        const rising = (values: number[]): boolean => values.every((value, index) => index === 0 || value >= values[index - 1]!);

        // Assert
        expect(holes.every(({ size, hole }) => hole > ansiThread(size, "UNF").diameter)).toBe(true);
        expect(rising(holes.map(({ hole }) => hole))).toBe(true);
        expect(heads.every(head => head.counterboreDiameter > head.headDiameter && head.socketSize < head.headDiameter)).toBe(true);
        expect(rising(heads.map(head => head.headDiameter))).toBe(true);
        expect(rising(nuts.map(nut => nut.acrossFlats))).toBe(true);
        expect(washers.every(washer => washer.innerDiameter < washer.outerDiameter)).toBe(true);
    });
});
