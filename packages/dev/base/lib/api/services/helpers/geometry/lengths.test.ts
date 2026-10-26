import { describe, expect, it } from "vitest";
import { InputError } from "../../../kernel-calls/errors";
import { checkedUnitOfLength, isUnitOfLength, lengthConverted, millimetresPerUnitOf } from "./lengths";

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
        const told = ["mm", "in", "ft", 25.4, undefined].map(isUnitOfLength);
        const refusal = (() => { try { return checkedUnitOfLength("ft", "unit"); } catch (error) { return error; } })();

        // Assert
        expect(told).toEqual([true, true, false, false, false]);
        expect(checkedUnitOfLength("cm", "unit")).toBe("cm");
        expect(refusal).toEqual(new InputError("`unit` is ft, which is none of mm, cm, m, in.", "unit"));
    });
});
