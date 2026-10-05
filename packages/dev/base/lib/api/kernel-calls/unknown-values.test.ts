import { describe, it, expect } from "vitest";
import { isRecord, messageOf } from "./unknown-values";

describe("unknown values", () => {
    it("should take an object with string keys as a record, and not null, an array or a primitive", () => {
        // Act
        const verdicts = [{}, { a: 1 }, Object.create(null), null, [], [1], "text", 3, undefined].map(isRecord);

        // Assert
        expect(verdicts).toEqual([true, true, true, false, false, false, false, false, false]);
    });

    it("should give an error's message, and anything else thrown written as text", () => {
        // Act
        const messages = [new RangeError("too far"), "plain", 42, undefined, { toString: (): string => "described" }].map(messageOf);

        // Assert
        expect(messages).toEqual(["too far", "plain", "42", "undefined", "described"]);
    });
});
