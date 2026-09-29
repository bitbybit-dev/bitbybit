import { describe, it, expect } from "vitest";
import { englishList, fillFailureMessage } from "./failure-message";

describe("englishList", () => {
    it.each([
        [[], ""],
        [["3"], "3"],
        [["3", "7"], "3 and 7"],
        [["3", "7", "9"], "3, 7 and 9"],
        [["3", "7", "9", "12"], "3, 7, 9 and 12"],
    ])("should write %j as %s", (items, written) => {
        expect(englishList(items)).toBe(written);
    });
});

describe("fillFailureMessage", () => {
    it("should fill each placeholder with the detail of its name", () => {
        // Act
        const message = fillFailureMessage("The fillet failed at edges {edges} of the {kind} at radius {radius}.", { edges: [3, 7, 9], kind: "solid", radius: 20 });

        // Assert
        expect(message).toBe("The fillet failed at edges 3, 7 and 9 of the solid at radius 20.");
    });

    it("should write a list in the language it is given", () => {
        // Arrange
        const german = (items: readonly string[]): string => `${items.slice(0, -1).join(", ")} und ${items[items.length - 1]!}`;

        // Act
        const message = fillFailureMessage("Die Kanten {edges} sind fehlgeschlagen.", { edges: [3, 7] }, german);

        // Assert
        expect(message).toBe("Die Kanten 3 und 7 sind fehlgeschlagen.");
    });

    it("should write a boolean and a list of names", () => {
        // Act
        const message = fillFailureMessage("{partial}: {names}", { partial: false, names: ["a", "b"] });

        // Assert
        expect(message).toBe("false: a and b");
    });

    it("should leave a placeholder it has no detail for, so no text is lost", () => {
        // Act
        const message = fillFailureMessage("Edges {edges} at {radius}; {toString}.", { edges: [3] });

        // Assert
        expect(message).toBe("Edges 3 at {radius}; {toString}.");
    });

    it("should return the template as it is when the failure has no details", () => {
        expect(fillFailureMessage("The fillet failed at {edges}.", undefined)).toBe("The fillet failed at {edges}.");
    });

    it("should leave braces that do not name a placeholder, even when a detail has that key", () => {
        expect(fillFailureMessage("{ edges } {1st} {0} {}", { edges: [3], "1st": 5, "0": "zero", " edges ": "spaced", "": "empty" })).toBe("{ edges } {1st} {0} {}");
    });
});
