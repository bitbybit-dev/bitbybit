import { describe, expect, it } from "vitest";
import type { IsoThreadSize } from "./thread-types";
import { isoThread, isoThreadSizes } from "./iso-threads";

describe("iso threads", () => {
    it("should give an M8's coarse pitch, its diameters and the drill to tap it", () => {
        // Act
        const thread = isoThread("M8");

        // Assert
        expect([thread.designation, thread.diameter, thread.pitch, thread.tapDrill]).toEqual(["M8", 8, 1.25, 6.8]);
        expect(thread.pitchDiameter).toBeCloseTo(7.188, 3);
        expect(thread.minorDiameter).toBeCloseTo(6.466, 3);
        expect(thread.internalMinorDiameter).toBeCloseTo(6.647, 3);
    });

    it("should take a fine pitch, name it and drill for it, and refuse one coarser than the coarse pitch", () => {
        // Act
        const fine = isoThread("M8", 1);

        // Assert
        expect([fine.designation, fine.pitch, fine.tapDrill]).toEqual(["M8x1", 1, 7]);
        expect(() => isoThread("M8", 1.5)).toThrow("`pitch`");
        expect(() => isoThread("M8", 0)).toThrow("`pitch`");
    });

    it("should know every size from M1.6 to M24, and no other", () => {
        // Act
        const sizes = isoThreadSizes();

        // Assert
        expect(sizes[0]).toBe("M1.6");
        expect(sizes[sizes.length - 1]).toBe("M24");
        expect(sizes.every(size => isoThread(size).tapDrill < isoThread(size).diameter)).toBe(true);
        expect(() => isoThread("M7" as IsoThreadSize)).toThrow("`size`");
    });

    it("should give fine-pitch tap drills and diameters without rounding noise", () => {
        // Act & Assert
        expect(isoThread("M3", 0.35).tapDrill).toBe(2.65);
        expect(isoThread("M1.6").tapDrill).toBe(1.25);
    });
});
