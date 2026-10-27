import { describe, expect, it } from "vitest";
import type { AnsiBallBearingDesignation } from "./bearing-types";
import { ansiBallBearingDesignations, ansiBallBearingSizes } from "./ansi-bearings";

describe("ansi bearings", () => {
    it("should size an R8 and an R188 by their designations, shielded wider where the series is, and refuse one it does not know", () => {
        // Act & Assert
        expect(ansiBallBearingSizes("R8", false, "in")).toEqual({ bore: 0.5, outside: 1.125, width: 0.25 });
        expect(ansiBallBearingSizes("R8", true, "in").width).toBe(0.3125);
        expect(ansiBallBearingSizes("R188", true, "in")).toEqual({ bore: 0.25, outside: 0.5, width: 0.1875 });
        expect(ansiBallBearingDesignations()).toHaveLength(24);
        expect(() => ansiBallBearingSizes("R22" as AnsiBallBearingDesignation, false, "in")).toThrow("`designation`");
    });

    it("should give an R8 in millimetres, its half inch bore 12.7", () => {
        // Act
        const millimetres = ansiBallBearingSizes("R8", false, "mm");

        // Assert
        expect(millimetres).toEqual({ bore: 12.7, outside: 28.575, width: 6.35 });
    });

    it("should give every bearing a bore under its outside, and the R2 to R20 bores in sixteenths of an inch", () => {
        // Act
        const sized = ansiBallBearingDesignations().map(designation => ({ designation, sizes: ansiBallBearingSizes(designation, false, "in") }));
        const sixteenths = sized.filter(({ designation }) => /^R\d+$/.test(designation) && Number(designation.slice(1)) >= 2 && Number(designation.slice(1)) <= 20);

        // Assert
        expect(sized.every(({ sizes }) => sizes.bore < sizes.outside && sizes.width > 0)).toBe(true);
        expect(sixteenths.every(({ designation, sizes }) => sizes.bore === Number(designation.slice(1)) / 16)).toBe(true);
    });
});
