import { describe, it, expect } from "vitest";
import { atLeastOne, custom, defineRules, distinct, lessThan, notZeroVector, sameLength, when } from "./input-rules";

type Box = { width: number; length: number; height: number; roundRadius: number };
type Lists = { indexes?: number[]; radiusList?: number[] };
type Line = { start: number[]; end: number[] };
type Direction = { direction: number[] };
type Steps = { steps: number[] };

const BOX: Box = { width: 2, length: 4, height: 6, roundRadius: 0.5 };

describe("custom", () => {
    it("should pass inputs its test holds for and report the property otherwise", () => {
        // Arrange
        const rule = custom<Box>("roundRadius", (inputs) => inputs.roundRadius < Math.min(inputs.width, inputs.length, inputs.height) / 2, "must be less than half of the smallest side", ["roundRadius", "width", "length", "height"]);

        // Act
        const fine = rule.check(BOX);
        const wrong = rule.check({ ...BOX, roundRadius: 1 });

        // Assert
        expect(fine).toBeUndefined();
        expect(wrong).toEqual({ property: "roundRadius", code: "custom", message: "must be less than half of the smallest side" });
        expect(rule.reads).toEqual(["roundRadius", "width", "length", "height"]);
    });

    it("should read only its property when told nothing else", () => {
        // Act
        const rule = custom<Box>("width", () => true, "never");

        // Assert
        expect(rule.reads).toEqual(["width"]);
    });
});

describe("lessThan", () => {
    it("should compare with another property and name it", () => {
        // Arrange
        const rule = lessThan<Box>("width", "length");

        // Act
        const fine = rule.check(BOX);
        const equal = rule.check({ ...BOX, width: 4 });

        // Assert
        expect(fine).toBeUndefined();
        expect(equal).toEqual({ property: "width", code: "less-than", params: { limit: 4 }, message: "must be less than length" });
        expect(rule.reads).toEqual(["width", "length"]);
    });

    it("should compare with a limit worked out from the inputs", () => {
        // Arrange
        const rule = lessThan<Box>("roundRadius", (inputs) => inputs.height / 2, undefined, ["height"]);

        // Act
        const wrong = rule.check({ ...BOX, roundRadius: 3 });

        // Assert
        expect(wrong?.message).toBe("must be less than 3");
        expect(rule.reads).toEqual(["roundRadius", "height"]);
    });

    it("should use the message it is given and read nothing more by default", () => {
        // Act
        const rule = lessThan<Box>("roundRadius", () => 0.1, "is too round");

        // Assert
        expect(rule.check(BOX)?.message).toBe("is too round");
        expect(rule.reads).toEqual(["roundRadius"]);
    });

    it("should pass when a side is not a number", () => {
        // Arrange
        const rule = lessThan<Lists>("indexes", "radiusList");

        // Act
        const result = rule.check({ indexes: [1], radiusList: [0] });

        // Assert
        expect(result).toBeUndefined();
    });
});

describe("sameLength", () => {
    const rule = sameLength<Lists>("radiusList", "indexes");

    it("should report lists of different lengths on the first", () => {
        // Act
        const wrong = rule.check({ radiusList: [1, 2], indexes: [1, 2, 3] });

        // Assert
        expect(wrong).toEqual({ property: "radiusList", code: "same-length", params: { expected: 3, actual: 2 }, message: "must have as many items as indexes (3), not 2" });
    });

    it("should pass lists of one length and a list left out", () => {
        // Act
        const equal = rule.check({ radiusList: [1, 2], indexes: [3, 4] });
        const leftOut = rule.check({ indexes: [1] });

        // Assert
        expect([equal, leftOut]).toEqual([undefined, undefined]);
    });
});

describe("distinct", () => {
    const rule = distinct<Line>("end", "start");

    it("should report two equal points", () => {
        // Act
        const wrong = rule.check({ start: [1, 2, 3], end: [1, 2, 3] });

        // Assert
        expect(wrong).toEqual({ property: "end", code: "distinct", message: "must differ from start" });
    });

    it("should pass points that differ, in a coordinate or in how many they have", () => {
        // Act
        const coordinate = rule.check({ start: [1, 2, 3], end: [1, 2, 4] });
        const count = rule.check({ start: [1, 2], end: [1, 2, 3] });
        const missing = rule.check({ start: [1, 2, 3] } as Line);

        // Assert
        expect([coordinate, count, missing]).toEqual([undefined, undefined, undefined]);
    });
});

describe("notZeroVector", () => {
    const rule = notZeroVector<Direction>("direction");

    it("should report a vector of zeros and pass any other", () => {
        // Act
        const zero = rule.check({ direction: [0, 0, 0] });
        const up = rule.check({ direction: [0, 1, 0] });
        const missing = rule.check({} as Direction);

        // Assert
        expect(zero?.code).toBe("zero-vector");
        expect([up, missing]).toEqual([undefined, undefined]);
    });
});

describe("atLeastOne", () => {
    const rule = atLeastOne<Steps>("steps", (step) => typeof step === "number" && step > 0, "needs at least one positive step");

    it("should report a list where no item passes and pass one where one does", () => {
        // Act
        const none = rule.check({ steps: [0, -1] });
        const some = rule.check({ steps: [0, 2] });
        const missing = rule.check({} as Steps);

        // Assert
        expect(none).toEqual({ property: "steps", code: "at-least-one", message: "needs at least one positive step" });
        expect([some, missing]).toEqual([undefined, undefined]);
    });
});

describe("when", () => {
    const rule = when<Lists>((inputs) => inputs.radiusList !== undefined, sameLength("radiusList", "indexes"));

    it("should apply its rule only when the condition holds", () => {
        // Act
        const applied = rule.check({ radiusList: [1], indexes: [1, 2] });
        const skipped = rule.check({ indexes: [1, 2] });

        // Assert
        expect(applied?.code).toBe("same-length");
        expect(skipped).toBeUndefined();
        expect(rule.reads).toEqual(["radiusList", "indexes"]);
    });
});

describe("defineRules", () => {
    it("should keep what each rule reads and run it on the inputs it is given", () => {
        // Arrange
        class BoxDto { width = 1; }

        // Act
        const entry = defineRules<Box>(BoxDto, [lessThan("width", "length")]);

        // Assert
        expect(entry.dto).toBe(BoxDto);
        expect(entry.rules[0]?.reads).toEqual(["width", "length"]);
        expect(entry.rules[0]?.check({ ...BOX, width: 9 })?.code).toBe("less-than");
    });
});
