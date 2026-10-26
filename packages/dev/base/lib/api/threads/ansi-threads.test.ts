import { describe, expect, it } from "vitest";
import type { AnsiThreadSize } from "./thread-types";
import { ansiThread, ansiThreadSizes } from "./ansi-threads";

describe("ansi threads", () => {
    it("should give a 1/4-20 UNC thread its pitch, diameters and the #7 drill the charts tap it with", () => {
        // Act
        const thread = ansiThread("1/4", "UNC");

        // Assert
        expect([thread.designation, thread.series, thread.threadsPerInch, thread.diameter, thread.pitch, thread.tapDrill]).toEqual(["1/4-20 UNC", "UNC", 20, 0.25, 0.05, 0.201]);
        expect(thread.pitchDiameter).toBeCloseTo(0.2175, 4);
        expect(thread.internalMinorDiameter).toBeCloseTo(0.1959, 4);
        expect(thread.minorDiameter).toBeCloseTo(0.25 - 1.19078 * 0.05, 9);
    });

    it.each([
        ["#4", "UNC", 40, 0.112, 0.089],
        ["#6", "UNC", 32, 0.138, 0.1065],
        ["#8", "UNC", 32, 0.164, 0.136],
        ["#10", "UNC", 24, 0.19, 0.1495],
        ["#10", "UNF", 32, 0.19, 0.159],
        ["5/16", "UNC", 18, 0.3125, 0.257],
        ["3/8", "UNC", 16, 0.375, 0.3125],
        ["1/2", "UNC", 13, 0.5, 0.421875],
        ["1/2", "UNF", 20, 0.5, 0.453125],
        ["1", "UNC", 8, 1, 0.875],
    ] as const)("should give %s %s its %i threads per inch, its %f diameter and its %f tap drill", (size, series, perInch, diameter, drill) => {
        // Act
        const thread = ansiThread(size, series);

        // Assert
        expect([thread.threadsPerInch, thread.diameter, thread.tapDrill]).toEqual([perInch, diameter, drill]);
    });

    it("should refuse a coarse #0, which is cut fine only, and a series or size it does not know", () => {
        // Act & Assert
        expect(ansiThread("#0", "UNF").designation).toBe("#0-80 UNF");
        expect(() => ansiThread("#0", "UNC")).toThrow("`series` is UNC, and #0 has no coarse thread; it is cut UNF.");
        expect(() => ansiThread("1/4", "UNEF" as "UNC")).toThrow("`series`");
        expect(() => ansiThread("11/16" as AnsiThreadSize, "UNC")).toThrow("`size`");
    });

    it("should take a pitch of its own as a UN thread, or as its series when it is the series' pitch, and refuse one coarser than coarse", () => {
        // Act
        const special = ansiThread("1", "UNC", 14);
        const fine = ansiThread("1/4", "UNC", 28);

        // Assert
        expect([special.designation, special.series, special.tapDrill]).toEqual(["1-14 UN", "UN", 0.93]);
        expect([fine.designation, fine.tapDrill]).toEqual(["1/4-28 UNF", 0.213]);
        expect(() => ansiThread("1/4", "UNC", 16)).toThrow("`threadsPerInch` is not a finite number of at least 20, the coarsest 1/4 thread.");
    });

    it("should list the twenty sizes from #0 to 1 inch, every one tapped below its diameter and growing with the size", () => {
        // Act
        const sizes = ansiThreadSizes();
        const threads = sizes.map(size => ansiThread(size, "UNF"));

        // Assert
        expect([sizes[0], sizes[sizes.length - 1], sizes.length]).toEqual(["#0", "1", 20]);
        expect(threads.every(thread => thread.internalMinorDiameter < thread.tapDrill && thread.tapDrill < thread.diameter && thread.minorDiameter < thread.pitchDiameter)).toBe(true);
        expect(threads.every((thread, index) => index === 0 || thread.diameter > threads[index - 1]!.diameter)).toBe(true);
    });
});
