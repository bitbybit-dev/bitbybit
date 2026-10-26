import { describe, expect, it } from "vitest";
import { InputError } from "../../../kernel-calls/errors";
import { checkedUnitOfLength, lengthConverted, lengthsConverted, millimetresPerUnitOf, snappedLength, tableLength } from "./lengths";

describe("length helpers", () => {
    it("should hold an inch at exactly 25.4 millimetres, a centimetre at 10 and a metre at 1000", () => {
        // Act
        const perUnit = (["mm", "cm", "m", "in"] as const).map(millimetresPerUnitOf);

        // Assert
        expect(perUnit).toEqual([1, 10, 1000, 25.4]);
    });

    it("should convert a length between any two units and give it back unchanged in its own unit", () => {
        // Act
        const converted = [lengthConverted(1, "in", "mm"), lengthConverted(25.4, "mm", "in"), lengthConverted(250, "mm", "m"), lengthConverted(0.3, "in", "in")];

        // Assert
        expect(converted).toEqual([25.4, 1, 0.25, 0.3]);
    });

    it("should tell a unit from anything else and name the property a wrong one was given for", () => {
        // Act
        const told = ["mm", "in", "ft", 25.4, undefined].map((unit) => {
            try {
                return checkedUnitOfLength(unit, "unit") === unit;
            } catch {
                return false;
            }
        });
        const refusal = (() => { try { return checkedUnitOfLength("ft", "unit"); } catch (error) { return error; } })();

        // Assert
        expect(told).toEqual([true, true, false, false, false]);
        expect(checkedUnitOfLength("cm", "unit")).toBe("cm");
        expect(refusal).toEqual(new InputError("`unit` is ft, which is none of mm, cm, m, in.", "unit"));
    });

    it("should bring a caller's length into a table's unit at the table's resolution, so a size rounded in another unit finds its row", () => {
        // Act
        const found = [tableLength(0.787402, "in", "mm"), tableLength(11.1125, "mm", "in"), tableLength(0.011113, "m", "in"), tableLength(2.5, "cm", "mm"), tableLength(7, "mm", "mm")];

        // Assert
        expect(found).toEqual([20, 0.4375, 0.4375, 25, 7]);
    });

    it("should give a table's length in the caller's unit to nine places, and convert only the fields named", () => {
        // Act
        const snapped = [snappedLength(8, "mm", "in"), snappedLength(0.4375, "in", "mm"), snappedLength(3, "mm", "mm")];
        const converted = lengthsConverted({ width: 6, height: 6, teeth: 20 }, ["width", "height"], "mm", "cm");

        // Assert
        expect(snapped).toEqual([0.31496063, 11.1125, 3]);
        expect(converted).toEqual({ width: 0.6, height: 0.6, teeth: 20 });
    });
});
