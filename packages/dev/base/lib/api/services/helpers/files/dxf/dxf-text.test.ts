import { describe, expect, it } from "vitest";
import { DxfText, encodedText, realText } from "./dxf-text";

describe("DXF numbers", () => {
    it.each([
        [0, "0.0"],
        [-0, "0.0"],
        [10, "10.0"],
        [-2.5, "-2.5"],
        [0.1 + 0.2, "0.30000000000000004"],
        [123456.789, "123456.789"],
    ])("should write %s shortest and exact, with a decimal point, as %s", (value, text) => {
        // Act
        const written = realText(value);

        // Assert
        expect(written).toBe(text);
    });

    it.each([
        [1e-7, "0.0000001"],
        [1.23456789e-7, "0.000000123456789"],
        [1e-13, "0.0000000000001"],
        [-3e-13, "-0.0000000000003"],
        [1e21, "1000000000000000000000.0"],
        [-1.5e22, "-15000000000000000000000.0"],
    ])("should write %s, which JavaScript prints with an exponent, as every one of its digits: %s", (value, text) => {
        // Act
        const written = realText(value);

        // Assert
        expect(written).toBe(text);
    });

    it.each([1e-13, -3e-13, 1.23456789e-7, 1e21, 5e-324, 1.7976931348623157e308])("should write %s so that it reads back as the same number", value => {
        // Act
        const written = realText(value);

        // Assert
        expect(Number(written)).toBe(value);
    });
});

describe("DXF text outside ASCII", () => {
    it("should write each character outside ASCII as a four digit escape of its code", () => {
        // Act
        const written = encodedText("Ø €");

        // Assert
        expect(written).toBe("\\U+00D8 \\U+20AC");
    });

    it("should write a character outside the basic plane as two escapes, one per UTF-16 code unit", () => {
        // Act
        const written = encodedText("a😀b");

        // Assert
        expect(written).toBe("a\\U+D83D\\U+DE00b");
    });

    it("should leave ASCII text as it is", () => {
        // Act
        const written = encodedText("Layer_1 (cut)");

        // Assert
        expect(written).toBe("Layer_1 (cut)");
    });
});

describe("DXF text building", () => {
    it("should join code and value pairs one per line, a name escaped and a number with its decimal point", () => {
        // Arrange
        const text = new DxfText(0x20);

        // Act
        text.pair("0", "LINE");
        text.name("8", "Größe");
        text.real("40", 2);

        // Assert
        expect(text.joined()).toBe("0\nLINE\n8\nGr\\U+00F6\\U+00DFe\n40\n2.0\n");
    });

    it("should hand out handles in upper case hexadecimal, one after another", () => {
        // Arrange
        const text = new DxfText(0x2e);

        // Act
        const handles = [text.nextHandle(), text.nextHandle(), text.peekHandle()];

        // Assert
        expect(handles).toEqual(["2E", "2F", "30"]);
    });
});
