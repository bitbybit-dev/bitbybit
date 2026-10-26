import { describe, expect, it } from "vitest";
import type { IsoBallBearingDesignation } from "./bearing-types";
import { isoBallBearingDesignations, isoBallBearingSizes } from "./iso-bearings";

describe("iso bearings", () => {
    describe("ball bearings", () => {
        it("should size a 6204 and a 608 by their designations, and refuse one it does not know", () => {
            // Act & Assert
            expect(isoBallBearingSizes("6204", "mm")).toEqual({ bore: 20, outside: 47, width: 14 });
            expect(isoBallBearingSizes("608", "mm")).toEqual({ bore: 8, outside: 22, width: 7 });
            expect(isoBallBearingDesignations()).toHaveLength(28);
            expect(() => isoBallBearingSizes("6300" as IsoBallBearingDesignation, "mm")).toThrow("`designation`");
        });

        it("should give a 608's sizes in inches, an 8 mm bore being 0.31496063 of an inch", () => {
            // Act
            const inches = isoBallBearingSizes("608", "in");

            // Assert
            expect(inches).toEqual({ bore: 0.31496063, outside: 0.866141732, width: 0.275590551 });
        });
    });
});
