import { describe, expect, it } from "vitest";
import type { IfcValue } from "./step-types";
import { DERIVED, enumValue, isBinary, isDerived, isEnumeration, isList, isReference, isTyped, ref, referencesIn, typed } from "./values";

const EVERY_KIND: readonly IfcValue[] = [
    null,
    true,
    3,
    "text",
    { ref: 1 },
    { enum: "A" },
    { type: "IfcLabel", value: "x" },
    { binary: "0F" },
    DERIVED,
    [{ ref: 1 }],
];

describe("ref", () => {
    it("should make a reference to the express id it is given", () => {
        // Act
        const value = ref(12);

        // Assert
        expect(value).toEqual({ ref: 12 });
    });
});

describe("enumValue", () => {
    it("should make an enumeration value in upper case", () => {
        // Act
        const value = enumValue("NotDefined");

        // Assert
        expect(value).toEqual({ enum: "NOTDEFINED" });
    });
});

describe("typed", () => {
    it("should pair a value with its defined type, keeping the type's spelling", () => {
        // Act
        const value = typed("IfcLabel", "Wall");

        // Assert
        expect(value).toEqual({ type: "IfcLabel", value: "Wall" });
    });

    it("should hold any value, lists included", () => {
        // Act
        const value = typed("IfcLineIndex", [1, 2]);

        // Assert
        expect(value).toEqual({ type: "IfcLineIndex", value: [1, 2] });
    });
});

describe("DERIVED", () => {
    it("should be a frozen derived marker", () => {
        // Assert
        expect(DERIVED).toEqual({ derived: true });
        expect(Object.isFrozen(DERIVED)).toBe(true);
    });
});

describe("value guards", () => {
    it("should tell a reference from every other kind of value", () => {
        // Act
        const results = EVERY_KIND.map((value) => isReference(value));

        // Assert
        expect(results).toEqual([false, false, false, false, true, false, false, false, false, false]);
    });

    it("should tell an enumeration value from every other kind of value", () => {
        // Act
        const results = EVERY_KIND.map((value) => isEnumeration(value));

        // Assert
        expect(results).toEqual([false, false, false, false, false, true, false, false, false, false]);
    });

    it("should tell a typed value from every other kind of value", () => {
        // Act
        const results = EVERY_KIND.map((value) => isTyped(value));

        // Assert
        expect(results).toEqual([false, false, false, false, false, false, true, false, false, false]);
    });

    it("should tell a binary value from every other kind of value", () => {
        // Act
        const results = EVERY_KIND.map((value) => isBinary(value));

        // Assert
        expect(results).toEqual([false, false, false, false, false, false, false, true, false, false]);
    });

    it("should tell the derived marker from every other kind of value", () => {
        // Act
        const results = EVERY_KIND.map((value) => isDerived(value));

        // Assert
        expect(results).toEqual([false, false, false, false, false, false, false, false, true, false]);
    });

    it("should tell a list from every other kind of value", () => {
        // Act
        const results = EVERY_KIND.map((value) => isList(value));

        // Assert
        expect(results).toEqual([false, false, false, false, false, false, false, false, false, true]);
    });

    it("should take an empty list for a list", () => {
        // Act
        const result = isList([]);

        // Assert
        expect(result).toBe(true);
    });

    it("should say no to an undefined value", () => {
        // Act
        const results = [isReference(undefined), isEnumeration(undefined), isTyped(undefined), isBinary(undefined), isDerived(undefined), isList(undefined)];

        // Assert
        expect(results).toEqual([false, false, false, false, false, false]);
    });

    it("should not take a typed value holding a reference for a reference", () => {
        // Act
        const result = isReference(typed("IfcLabel", ref(1)));

        // Assert
        expect(result).toBe(false);
    });
});

describe("referencesIn", () => {
    it("should collect the id of a single reference", () => {
        // Act
        const ids = referencesIn(ref(7));

        // Assert
        expect(ids).toEqual([7]);
    });

    it("should collect nothing from a value that holds no reference", () => {
        // Act
        const ids = [null, 4, "#5", enumValue("A"), { binary: "0F" }, DERIVED, typed("IfcLabel", "x")].map((value) => referencesIn(value));

        // Assert
        expect(ids).toEqual([[], [], [], [], [], [], []]);
    });

    it("should collect references from nested lists and typed values in order, repeats kept", () => {
        // Arrange
        const value: IfcValue = [ref(1), [ref(2), typed("IfcOuter", ref(3))], "text", null, enumValue("A"), typed("IfcList", [ref(4), [ref(1)]])];

        // Act
        const ids = referencesIn(value);

        // Assert
        expect(ids).toEqual([1, 2, 3, 4, 1]);
    });

    it("should add to the list it is given and hand that list back", () => {
        // Arrange
        const into = [9];

        // Act
        const ids = referencesIn([ref(1), ref(2)], into);

        // Assert
        expect(ids).toBe(into);
        expect(into).toEqual([9, 1, 2]);
    });
});
