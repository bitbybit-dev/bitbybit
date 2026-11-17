import { describe, expect, it } from "vitest";
import { cssColorHex } from "./css-colors";
import { CSS_NAMED_COLORS } from "./css-colors.constants";

const LONG_DIGITS = 100_000;
const LARGE_INPUT_TIMEOUT = 2_000;

describe("cssColorHex", () => {
    it("should read the short and the long hex forms, in any case", () => {
        // Act
        const read = ["#f80", "#FF8800", " #aBc ", "#00ff7f"].map(cssColorHex);

        // Assert
        expect(read).toEqual(["#ff8800", "#ff8800", "#aabbcc", "#00ff7f"]);
    });

    it("should drop the alpha of the four and eight digit hex forms", () => {
        // Act
        const read = ["#f808", "#ff880080"].map(cssColorHex);

        // Assert
        expect(read).toEqual(["#ff8800", "#ff8800"]);
    });

    it("should refuse hex forms of other lengths and other digits", () => {
        // Act
        const read = ["#", "#ff", "#fffff", "#fffffff", "#fffffffff", "#ggg", "fff"].map(cssColorHex);

        // Assert
        expect(read).toEqual([undefined, undefined, undefined, undefined, undefined, undefined, undefined]);
    });

    it("should read rgb and rgba with numbers, with commas or spaces, alpha dropped", () => {
        // Act
        const read = ["rgb(255, 136, 0)", "RGBA(255,136,0,0.5)", "rgb(255 136 0)", "rgb(255 136 0 / 50%)", "rgba( 0 , 0 , 255 , 1 )"].map(cssColorHex);

        // Assert
        expect(read).toEqual(["#ff8800", "#ff8800", "#ff8800", "#ff8800", "#0000ff"]);
    });

    it("should read percentages of the full channel and round fractions to the nearest step", () => {
        // Act
        const read = ["rgb(100%, 50%, 0%)", "rgb(12.4 12.5 254.6)", "rgb(1e2, 0, 0)"].map(cssColorHex);

        // Assert
        expect(read).toEqual(["#ff8000", "#0c0dff", "#640000"]);
    });

    it("should refuse an rgb form with a channel too large to hold as a number", () => {
        // Act
        const read = ["rgb(1e999, 0, 0)", "rgb(0 0 1e400%)"].map(cssColorHex);

        // Assert
        expect(read).toEqual([undefined, undefined]);
    });

    it("should hold channels outside the range at its ends, as CSS does", () => {
        // Act
        const read = cssColorHex("rgb(300, -20, 128)");

        // Assert
        expect(read).toBe("#ff0080");
    });

    it("should refuse rgb forms with the wrong number of channels or values that are not numbers", () => {
        // Act
        const read = ["rgb(1, 2)", "rgb(1, 2, 3, 4, 5)", "rgb(1 2 3 4)", "rgb(1 2 / 3 / 4)", "rgb(a, b, c)", "rgb()", "rgb(1px, 2, 3)", "rgb(1, 2, 3"].map(cssColorHex);

        // Assert
        expect(read).toEqual([undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined]);
    });

    it("should read every CSS named color, in any case", () => {
        // Act
        const read = ["red", "RebeccaPurple", "darkgrey", "darkgray", "lightgoldenrodyellow"].map(cssColorHex);

        // Assert
        expect(read).toEqual(["#ff0000", "#663399", "#a9a9a9", "#a9a9a9", "#fafad2"]);
    });

    it("should hold all one hundred and forty-eight named colors of CSS Color 4", () => {
        // Act
        const names = [...CSS_NAMED_COLORS.keys()];

        // Assert
        expect(names).toHaveLength(148);
        expect(names.every(name => /^#[0-9a-f]{6}$/.test(CSS_NAMED_COLORS.get(name)!))).toBe(true);
    });

    it("should leave names CSS does not define, paint servers and other color functions unread", () => {
        // Act
        const read = ["reddish", "url(#gradient)", "hsl(0, 100%, 50%)", "currentColor", "constructor", ""].map(cssColorHex);

        // Assert
        expect(read).toEqual([undefined, undefined, undefined, undefined, undefined, undefined]);
    });

    it("should read a hundred thousand digits that never end in a number in one pass", () => {
        // Arrange
        const digits = `rgb(${"1".repeat(LONG_DIGITS)}x, 0, 0)`;

        // Act
        const read = cssColorHex(digits);

        // Assert
        expect(read).toBeUndefined();
    }, LARGE_INPUT_TIMEOUT);
});
