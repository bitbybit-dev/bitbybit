import { describe, expect, it } from "vitest";
import { errorThrownBy } from "../__test__/thrown";
import { StepSyntaxError } from "./errors";
import { decodeString, encodeString } from "./strings";

describe("encodeString", () => {
    it("should wrap printable ASCII in apostrophes as it is", () => {
        // Act
        const text = encodeString("Wall 01 - [A] {b} ~!#$%&()*+,./:;<=>?@^_`|\"");

        // Assert
        expect(text).toBe("'Wall 01 - [A] {b} ~!#$%&()*+,./:;<=>?@^_`|\"'");
    });

    it("should write an empty text as two apostrophes", () => {
        // Act
        const text = encodeString("");

        // Assert
        expect(text).toBe("''");
    });

    it("should double an apostrophe inside a text", () => {
        // Act
        const text = encodeString("it's");

        // Assert
        expect(text).toBe("'it''s'");
    });

    it("should double a backslash", () => {
        // Act
        const text = encodeString("C:\\models\\wall");

        // Assert
        expect(text).toBe("'C:\\\\models\\\\wall'");
    });

    it("should write a non-ASCII character of the basic plane as four hex digits inside X2 and X0", () => {
        // Act
        const text = encodeString("café");

        // Assert
        expect(text).toBe("'caf\\X2\\00E9\\X0\\'");
    });

    it("should write the hex digits in upper case", () => {
        // Act
        const text = encodeString("\u00ff\u0abc");

        // Assert
        expect(text).toBe("'\\X2\\00FF0ABC\\X0\\'");
    });

    it("should group neighbouring non-ASCII characters into one run", () => {
        // Act
        const text = encodeString("Grüße");

        // Assert
        expect(text).toBe("'Gr\\X2\\00FC00DF\\X0\\e'");
    });

    it("should close a run at each printable character and open a new one after it", () => {
        // Act
        const text = encodeString("é-ü");

        // Assert
        expect(text).toBe("'\\X2\\00E9\\X0\\-\\X2\\00FC\\X0\\'");
    });

    it("should write a code point beyond the basic plane as eight hex digits inside X4 and X0", () => {
        // Act
        const text = encodeString("😀");

        // Assert
        expect(text).toBe("'\\X4\\0001F600\\X0\\'");
    });

    it("should write a whole run as X4 when one of its characters lies beyond the basic plane", () => {
        // Act
        const text = encodeString("é😀");

        // Assert
        expect(text).toBe("'\\X4\\000000E90001F600\\X0\\'");
    });

    it("should escape control characters such as a newline and a tab", () => {
        // Act
        const text = encodeString("a\nb\tc");

        // Assert
        expect(text).toBe("'a\\X2\\000A\\X0\\b\\X2\\0009\\X0\\c'");
    });

    it("should escape the delete character, which is not printable", () => {
        // Act
        const text = encodeString("\u007f");

        // Assert
        expect(text).toBe("'\\X2\\007F\\X0\\'");
    });

    it("should write only printable ASCII whatever the text holds", () => {
        // Arrange
        const texts = ["日本語", "😀\n\u0000", "Ünïcödé 'quoted' \\ back"];

        // Act
        const encoded = texts.map(encodeString);

        // Assert
        expect(encoded.every((text) => /^[\x20-\x7e]*$/.test(text))).toBe(true);
    });
});

describe("decodeString", () => {
    it("should return an empty text for an empty raw text", () => {
        // Act
        const text = decodeString("");

        // Assert
        expect(text).toBe("");
    });

    it("should keep printable ASCII as it is", () => {
        // Act
        const text = decodeString("Wall 01 - [A]");

        // Assert
        expect(text).toBe("Wall 01 - [A]");
    });

    it("should turn a doubled apostrophe back into one", () => {
        // Act
        const text = decodeString("it''s");

        // Assert
        expect(text).toBe("it's");
    });

    it("should turn a doubled backslash back into one", () => {
        // Act
        const text = decodeString("C:\\\\models");

        // Assert
        expect(text).toBe("C:\\models");
    });

    it("should read an X2 run as groups of four hex digits", () => {
        // Act
        const text = decodeString("Gr\\X2\\00FC00DF\\X0\\e");

        // Assert
        expect(text).toBe("Grüße");
    });

    it("should read lower case hex digits", () => {
        // Act
        const text = decodeString("\\X2\\00e9\\X0\\");

        // Assert
        expect(text).toBe("é");
    });

    it("should read a surrogate pair written in an X2 run as one character beyond the basic plane", () => {
        // Act
        const text = decodeString("\\X2\\D83DDE00\\X0\\");

        // Assert
        expect(text).toBe("😀");
    });

    it("should read an X4 run as groups of eight hex digits", () => {
        // Act
        const text = decodeString("\\X4\\000000E90001F600\\X0\\");

        // Assert
        expect(text).toBe("é😀");
    });

    it("should refuse an X2 run that is never closed", () => {
        // Act
        const error = errorThrownBy(StepSyntaxError, () => decodeString("\\X2\\00E900FC", 7));

        // Assert
        expect(error.message).toBe("A \\X2\\ or \\X4\\ run is never closed with \\X0\\ at byte 7");
    });

    it("should read X followed by two hex digits as one 8-bit character", () => {
        // Act
        const text = decodeString("caf\\X\\E9!");

        // Assert
        expect(text).toBe("café!");
    });

    it("should add 128 to the character that follows S", () => {
        // Act
        const text = decodeString("\\S\\a\\S\\D");

        // Assert
        expect(text).toBe("\u00e1\u00c4");
    });

    it("should skip a code page switch from PA to PI", () => {
        // Act
        const text = decodeString("\\PA\\x\\PI\\y");

        // Assert
        expect(text).toBe("xy");
    });

    it("should keep a page switch outside A to I as it is written", () => {
        // Act
        const text = decodeString("\\PJ\\");

        // Assert
        expect(text).toBe("\\PJ\\");
    });

    it("should keep a lone backslash inside a text", () => {
        // Act
        const text = decodeString("a\\b");

        // Assert
        expect(text).toBe("a\\b");
    });

    it("should keep a lone backslash at the end of a text", () => {
        // Act
        const text = decodeString("end\\");

        // Assert
        expect(text).toBe("end\\");
    });

    it("should keep X with fewer than two characters after it as it is written", () => {
        // Act
        const text = decodeString("\\X\\4");

        // Assert
        expect(text).toBe("\\X\\4");
    });

    it("should keep S at the very end as it is written", () => {
        // Act
        const text = decodeString("\\S\\");

        // Assert
        expect(text).toBe("\\S\\");
    });
});

describe("encodeString and decodeString together", () => {
    it("should read back every text it writes", () => {
        // Arrange
        const texts = [
            "",
            "plain",
            "it's",
            "''",
            "'",
            "back\\slash",
            "\\\\",
            "\\",
            "\\X2\\00E9\\X0\\",
            "\\X\\E9",
            "\\S\\a",
            "\\PA\\",
            "Grüße",
            "日本語",
            "😀 and é😀",
            "line\nbreak\ttab\r",
            "\u0000\u007f\u0080",
            "\ud800 lone surrogate",
            "\\é",
            "é\\X0\\",
            "mixed 'é' \\ 😀 end",
        ];

        // Act
        const back = texts.map((text) => decodeString(encodeString(text).slice(1, -1)));

        // Assert
        expect(back).toEqual(texts);
    });
});

describe("decodeString with a broken byte escape", () => {
    it("should keep an \\X\\ escape that is not followed by two hexadecimal digits as written", () => {
        // Act
        const text = decodeString("a\\X\\ZZb");

        // Assert
        expect(text).toBe("a\\X\\ZZb");
    });
});

describe("decodeString with the less common escapes", () => {
    it("should take an escaped apostrophe as the one character an S escape lifts", () => {
        // Act
        const text = decodeString("\\S\\''");

        // Assert
        expect(text).toBe("§");
    });

    it("should read S escapes in the ISO 8859 part a P directive selects", () => {
        // Act
        const texts = [decodeString("\\PE\\\\S\\a"), decodeString("\\S\\a")];

        // Assert
        expect(texts).toEqual(["с", "á"]);
    });

    it("should refuse a run of hexadecimal characters that holds something else", () => {
        // Act
        const error = errorThrownBy(StepSyntaxError, () => decodeString("\\X2\\00G1\\X0\\", 3));

        // Assert
        expect(error.message).toBe("A run of hexadecimal characters holds something other than groups of 4 digits at byte 3");
    });

    it("should refuse a code point beyond Unicode", () => {
        // Act
        const error = errorThrownBy(StepSyntaxError, () => decodeString("\\X4\\00110000\\X0\\", 5));

        // Assert
        expect(error.message).toBe("The code point 00110000 lies beyond Unicode at byte 5");
    });

    it("should read a run of hexadecimal characters far longer than a call can spread", () => {
        // Arrange
        const units = 200_000;

        // Act
        const text = decodeString(`\\X2\\${"00E9".repeat(units)}\\X0\\`);

        // Assert
        expect(text).toBe("é".repeat(units));
    });
});

describe("encodeString and decodeString at their edges", () => {
    it("should write the last character of the basic plane as two bytes and the first beyond it as four", () => {
        // Act
        const written = [encodeString("\uFFFF"), encodeString("\u{10000}")];

        // Assert
        expect(written).toEqual(["'\\X2\\FFFF\\X0\\'", "'\\X4\\00010000\\X0\\'"]);
    });

    it("should read a byte escape at the very end of a text", () => {
        // Act
        const read = decodeString("caf\\X\\E9");

        // Assert
        expect(read).toBe("café");
    });

    it("should read a character after an upper-half escape and then an escaped apostrophe", () => {
        // Act
        const read = decodeString("\\S\\A''B");

        // Assert
        expect(read).toBe("Á'B");
    });
});
