import { describe, expect, it } from "vitest";
import { errorThrownBy } from "../__test__/thrown";
import { decodeArgumentText } from "../__test__/step-text";
import { StepSyntaxError } from "./errors";
import { decodeArguments } from "./reader";
import { endOfString, isDigit, isNameCharacter, skipSpace, textOf } from "./scanner";
import { DERIVED } from "./values";

const bytesOf = (text: string): Uint8Array => new TextEncoder().encode(text);
const codesOf = (characters: string): number[] => Array.from(characters, (character) => character.charCodeAt(0));
const syntaxErrorOf = (text: string): StepSyntaxError => errorThrownBy(StepSyntaxError, () => decodeArgumentText(text));

describe("StepSyntaxError", () => {
    it("should name the byte offset in its message and keep it as a field", () => {
        // Act
        const error = new StepSyntaxError("Something is wrong", 42);

        // Assert
        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe("StepSyntaxError");
        expect(error.message).toBe("Something is wrong at byte 42");
        expect(error.offset).toBe(42);
    });
});

describe("decodeArgumentText", () => {
    it("should read $ as an unset value", () => {
        // Act
        const values = decodeArgumentText("$");

        // Assert
        expect(values).toEqual([null]);
    });

    it("should read * as the shared derived marker", () => {
        // Act
        const values = decodeArgumentText("*");

        // Assert
        expect(values).toHaveLength(1);
        expect(values[0]).toBe(DERIVED);
    });

    it("should read #12 as a reference", () => {
        // Act
        const values = decodeArgumentText("#12");

        // Assert
        expect(values).toEqual([{ ref: 12 }]);
    });

    it("should read a string and undo its escapes", () => {
        // Act
        const values = decodeArgumentText("'it''s caf\\X2\\00E9\\X0\\'");

        // Assert
        expect(values).toEqual(["it's café"]);
    });

    it("should read two apostrophes in a row inside a string as one apostrophe, not as two strings", () => {
        // Act
        const values = decodeArgumentText("'a''b'");

        // Assert
        expect(values).toEqual(["a'b"]);
    });

    it("should read an empty string", () => {
        // Act
        const values = decodeArgumentText("''");

        // Assert
        expect(values).toEqual([""]);
    });

    it("should read UTF-8 text inside a string", () => {
        // Act
        const values = decodeArgumentText("'Grüße'");

        // Assert
        expect(values).toEqual(["Grüße"]);
    });

    it("should keep comment markers inside a string", () => {
        // Act
        const values = decodeArgumentText("'/* not a comment */'");

        // Assert
        expect(values).toEqual(["/* not a comment */"]);
    });

    it("should read a binary value as its digits", () => {
        // Act
        const values = decodeArgumentText("\"0FF\"");

        // Assert
        expect(values).toEqual([{ binary: "0FF" }]);
    });

    it("should read an enumeration value in upper case", () => {
        // Act
        const values = decodeArgumentText(".element.,.NOTDEFINED.");

        // Assert
        expect(values).toEqual([{ enum: "ELEMENT" }, { enum: "NOTDEFINED" }]);
    });

    it("should read .T. and .F. as booleans in either case", () => {
        // Act
        const values = decodeArgumentText(".T.,.F.,.t.,.f.");

        // Assert
        expect(values).toEqual([true, false, true, false]);
    });

    it("should read .U. as the unknown enumeration value", () => {
        // Act
        const values = decodeArgumentText(".U.,.u.");

        // Assert
        expect(values).toEqual([{ enum: "U" }, { enum: "U" }]);
    });

    it("should read integers with and without a sign", () => {
        // Act
        const values = decodeArgumentText("12,-3,+4,0");

        // Assert
        expect(values).toEqual([12, -3, 4, 0]);
    });

    it("should read reals with a trailing dot, a fraction, a sign and an exponent", () => {
        // Act
        const values = decodeArgumentText("1.,-0.25,1.E-05,+2.5E+3,3e2,-1.5E-2");

        // Assert
        expect(values).toEqual([1, -0.25, 0.00001, 2500, 300, -0.015]);
    });

    it("should read nested lists", () => {
        // Act
        const values = decodeArgumentText("((1,2),(3,(4.,'a')))");

        // Assert
        expect(values).toEqual([[[1, 2], [3, [4, "a"]]]]);
    });

    it("should read an empty list with or without space inside", () => {
        // Act
        const values = decodeArgumentText("(),( )");

        // Assert
        expect(values).toEqual([[], []]);
    });

    it("should read nothing from an empty or blank text", () => {
        // Act
        const values = [decodeArgumentText(""), decodeArgumentText(" \n\t ")];

        // Assert
        expect(values).toEqual([[], []]);
    });

    it("should read a typed value as its type name and its value", () => {
        // Act
        const values = decodeArgumentText("IFCLABEL('x')");

        // Assert
        expect(values).toEqual([{ type: "IFCLABEL", value: "x" }]);
    });

    it("should keep the type name of a typed value as the file spells it, space before the parenthesis allowed", () => {
        // Act
        const values = decodeArgumentText("IfcLabel ('x')");

        // Assert
        expect(values).toEqual([{ type: "IfcLabel", value: "x" }]);
    });

    it("should read a typed value that holds a list", () => {
        // Act
        const values = decodeArgumentText("IFCLINEINDEX((1,2,3,1))");

        // Assert
        expect(values).toEqual([{ type: "IFCLINEINDEX", value: [1, 2, 3, 1] }]);
    });

    it("should read a typed value nested in another typed value", () => {
        // Act
        const values = decodeArgumentText("IFCOUTER(IFCINNER(2.))");

        // Assert
        expect(values).toEqual([{ type: "IFCOUTER", value: { type: "IFCINNER", value: 2 } }]);
    });

    it("should read typed values inside a list", () => {
        // Act
        const values = decodeArgumentText("(IFCLABEL('a'),IFCREAL(1.5),IFCBOOLEAN(.T.))");

        // Assert
        expect(values).toEqual([[{ type: "IFCLABEL", value: "a" }, { type: "IFCREAL", value: 1.5 }, { type: "IFCBOOLEAN", value: true }]]);
    });

    it("should skip whitespace and comments between tokens", () => {
        // Act
        const values = decodeArgumentText("  #1 ,/* one */\t'a'\r\n, ( /* two */ 2 /* three */ ) /* four */ ");

        // Assert
        expect(values).toEqual([{ ref: 1 }, "a", [2]]);
    });

    it("should read the attribute list of a whole entity", () => {
        // Act
        const values = decodeArgumentText("'2O2Fr$t4X7Zf8NOew3FLOH',#2,'Wall',$,$,#5,#6,'A-1',.STANDARD.");

        // Assert
        expect(values).toEqual(["2O2Fr$t4X7Zf8NOew3FLOH", { ref: 2 }, "Wall", null, null, { ref: 5 }, { ref: 6 }, "A-1", { enum: "STANDARD" }]);
    });

    it("should accept values nested 64 deep", () => {
        // Arrange
        const deepest = `${"(".repeat(64)}${")".repeat(64)}`;

        // Act
        const values = decodeArgumentText(deepest);

        // Assert
        expect(JSON.stringify(values)).toBe(`${"[".repeat(65)}${"]".repeat(65)}`);
    });
});

describe("decodeArguments", () => {
    it("should read only the span it is given", () => {
        // Arrange
        const bytes = bytesOf("#1=IFCX(1,'a');");

        // Act
        const values = decodeArguments(bytes, 8, 13);

        // Assert
        expect(values).toEqual([1, "a"]);
    });
});

describe("decodeArgumentText syntax errors", () => {
    it("should report a string that is never closed at its opening apostrophe", () => {
        // Act
        const error = syntaxErrorOf("1,'abc");

        // Assert
        expect(error.message).toBe("A string is never closed at byte 2");
        expect(error.offset).toBe(2);
    });

    it("should report a comment that is never closed at its opening slash", () => {
        // Act
        const error = syntaxErrorOf("1 /* never");

        // Assert
        expect(error.message).toBe("A comment is never closed at byte 2");
        expect(error.offset).toBe(2);
    });

    it("should report a parenthesis that is never closed at the end of the text", () => {
        // Act
        const error = syntaxErrorOf("(1,(2)");

        // Assert
        expect(error.message).toBe("A parenthesis is never closed at byte 6");
        expect(error.offset).toBe(6);
    });

    it("should report a closing parenthesis without an opening one", () => {
        // Act
        const error = syntaxErrorOf("1,2)");

        // Assert
        expect(error.message).toBe("A closing parenthesis without an opening one at byte 3");
        expect(error.offset).toBe(3);
    });

    it("should report two values side by side without a comma", () => {
        // Act
        const error = syntaxErrorOf("1 2");

        // Assert
        expect(error.message).toBe("Two values without a comma between them at byte 2");
        expect(error.offset).toBe(2);
    });

    it("should report two lists side by side without a comma", () => {
        // Act
        const error = syntaxErrorOf("(1)(2)");

        // Assert
        expect(error.message).toBe("Two values without a comma between them at byte 3");
    });

    it("should report a number followed by letters as two values", () => {
        // Act
        const error = syntaxErrorOf("12abc");

        // Assert
        expect(error.message).toBe("Two values without a comma between them at byte 2");
    });

    it("should report a missing value between two commas", () => {
        // Act
        const error = syntaxErrorOf("1,,2");

        // Assert
        expect(error.message).toBe("A value is missing before a comma at byte 2");
        expect(error.offset).toBe(2);
    });

    it("should report a comma with nothing before it", () => {
        // Act
        const errors = [syntaxErrorOf(",1"), syntaxErrorOf("(,1)")];

        // Assert
        expect(errors.map((error) => error.offset)).toEqual([0, 1]);
        expect(errors[0]!.message).toBe("A value is missing before a comma at byte 0");
    });

    it("should report a missing value before a closing parenthesis", () => {
        // Act
        const error = syntaxErrorOf("(1,)");

        // Assert
        expect(error.message).toBe("A value is missing before a closing parenthesis at byte 3");
        expect(error.offset).toBe(3);
    });

    it("should report a missing value after a trailing comma", () => {
        // Act
        const error = syntaxErrorOf("1,");

        // Assert
        expect(error.message).toBe("A value is missing at the end at byte 2");
        expect(error.offset).toBe(2);
    });

    it("should report a typed value that holds two values", () => {
        // Act
        const error = syntaxErrorOf("IFCLABEL('a','b')");

        // Assert
        expect(error.message).toBe("The typed value IFCLABEL holds 2 values instead of one at byte 16");
        expect(error.offset).toBe(16);
    });

    it("should report a typed value that holds nothing", () => {
        // Act
        const error = syntaxErrorOf("IFCLABEL()");

        // Assert
        expect(error.message).toBe("The typed value IFCLABEL holds 0 values instead of one at byte 9");
    });

    it("should report a type name without parentheses", () => {
        // Act
        const error = syntaxErrorOf("IFCLABEL 'x'");

        // Assert
        expect(error.message).toBe("The typed value IFCLABEL has no parentheses at byte 0");
        expect(error.offset).toBe(0);
    });

    it("should report values nested deeper than 64 at the parenthesis that goes too deep", () => {
        // Arrange
        const tooDeep = `${"(".repeat(65)}${")".repeat(65)}`;

        // Act
        const error = syntaxErrorOf(tooDeep);

        // Assert
        expect(error.message).toBe("Values nested more than 64 deep at byte 64");
        expect(error.offset).toBe(64);
    });

    it("should count typed values towards the nesting depth", () => {
        // Arrange
        const tooDeep = `${"T(".repeat(65)}1${")".repeat(65)}`;

        // Act
        const error = syntaxErrorOf(tooDeep);

        // Assert
        expect(error.message).toBe("Values nested more than 64 deep at byte 128");
    });

    it("should report an unexpected character", () => {
        // Act
        const error = syntaxErrorOf("1,@");

        // Assert
        expect(error.message).toBe("An unexpected character '@' at byte 2");
        expect(error.offset).toBe(2);
    });

    it("should report a reference without an id", () => {
        // Act
        const errors = [syntaxErrorOf("#"), syntaxErrorOf("1,# 2"), syntaxErrorOf("#x1")];

        // Assert
        expect(errors.map((error) => error.message)).toEqual([
            "A reference that is not '#' followed by digits at byte 0",
            "A reference that is not '#' followed by digits at byte 2",
            "A reference that is not '#' followed by digits at byte 0",
        ]);
    });

    it("should report an enumeration value that is never closed", () => {
        // Act
        const errors = [syntaxErrorOf(".ABC"), syntaxErrorOf("1,.A B.")];

        // Assert
        expect(errors.map((error) => error.message)).toEqual([
            "An enumeration value is never closed at byte 0",
            "An enumeration value is never closed at byte 2",
        ]);
    });

    it("should report a binary value that is never closed", () => {
        // Act
        const error = syntaxErrorOf("\"0FF");

        // Assert
        expect(error.message).toBe("A binary value is never closed at byte 0");
    });

    it("should report a number too large to be finite and one that is malformed", () => {
        // Act
        const errors = [syntaxErrorOf("1E999"), syntaxErrorOf("1,-")];

        // Assert
        expect(errors.map((error) => error.message)).toEqual([
            "A number too large to be finite at byte 0",
            "A malformed number at byte 2",
        ]);
    });

    it("should read an entity of more than a million values, which large point lists hold", () => {
        // Arrange
        const many = `(${"1.,".repeat(1_000_000)}1.)`;

        // Act
        const [points] = decodeArgumentText(many);

        // Assert
        expect(points).toHaveLength(1_000_001);
    });

    it("should refuse a reference with letters after its digits", () => {
        // Act
        const errors = [syntaxErrorOf("#1E5"), syntaxErrorOf("#0x10")];

        // Assert
        expect(errors.map((error) => error.offset)).toEqual([0, 0]);
    });
});

describe("isDigit", () => {
    it("should accept the ten decimal digits", () => {
        // Act
        const results = codesOf("0123456789").map(isDigit);

        // Assert
        expect(results.every((result) => result)).toBe(true);
    });

    it("should refuse the characters on either side of the digits and letters", () => {
        // Act
        const results = codesOf("/:aA.-").map(isDigit);

        // Assert
        expect(results).toEqual([false, false, false, false, false, false]);
    });
});

describe("isNameCharacter", () => {
    it("should accept letters of either case, digits and the underscore", () => {
        // Act
        const results = codesOf("AZaz09_").map(isNameCharacter);

        // Assert
        expect(results).toEqual([true, true, true, true, true, true, true]);
    });

    it("should refuse punctuation, space and the characters next to the letter ranges", () => {
        // Act
        const results = codesOf("-.@[`{ ('").map(isNameCharacter);

        // Assert
        expect(results).toEqual([false, false, false, false, false, false, false, false, false]);
    });
});

describe("textOf", () => {
    it("should read an ASCII span", () => {
        // Arrange
        const bytes = bytesOf("#12=IFCWALL(");

        // Act
        const text = textOf(bytes, 4, 11);

        // Assert
        expect(text).toBe("IFCWALL");
    });

    it("should read a span holding UTF-8 bytes as UTF-8", () => {
        // Arrange
        const bytes = bytesOf("'Grüße'");

        // Act
        const text = textOf(bytes, 1, bytes.length - 1);

        // Assert
        expect(text).toBe("Grüße");
    });

    it("should read an ASCII span of a file that holds UTF-8 elsewhere", () => {
        // Arrange
        const bytes = bytesOf("abc'ü'");

        // Act
        const text = textOf(bytes, 0, 3);

        // Assert
        expect(text).toBe("abc");
    });

    it("should read an empty span as an empty text", () => {
        // Act
        const text = textOf(bytesOf("abc"), 2, 2);

        // Assert
        expect(text).toBe("");
    });
});

describe("skipSpace", () => {
    it("should skip spaces, tabs and line breaks", () => {
        // Arrange
        const bytes = bytesOf(" \t\r\n x");

        // Act
        const at = skipSpace(bytes, 0, bytes.length);

        // Assert
        expect(at).toBe(5);
    });

    it("should skip comments and the space between them", () => {
        // Arrange
        const bytes = bytesOf("/* a */ /*b*/x");

        // Act
        const at = skipSpace(bytes, 0, bytes.length);

        // Assert
        expect(at).toBe(13);
    });

    it("should stop at a slash that does not open a comment", () => {
        // Act
        const at = skipSpace(bytesOf("/x"), 0, 2);

        // Assert
        expect(at).toBe(0);
    });

    it("should stay where it is when a token starts there", () => {
        // Act
        const at = skipSpace(bytesOf("ab"), 1, 2);

        // Assert
        expect(at).toBe(1);
    });

    it("should stop at the end it is given", () => {
        // Act
        const at = skipSpace(bytesOf("     x"), 0, 2);

        // Assert
        expect(at).toBe(2);
    });

    it("should report a comment that is never closed", () => {
        // Arrange
        const bytes = bytesOf("  /* open");

        // Act
        const error = errorThrownBy(StepSyntaxError, () => skipSpace(bytes, 0, bytes.length));

        // Assert
        expect(error.message).toBe("A comment is never closed at byte 2");
    });
});

describe("endOfString", () => {
    it("should find the closing apostrophe of a string", () => {
        // Arrange
        const bytes = bytesOf("'abc',1");

        // Act
        const close = endOfString(bytes, 0, bytes.length);

        // Assert
        expect(close).toBe(4);
    });

    it("should step over a doubled apostrophe", () => {
        // Arrange
        const bytes = bytesOf("'it''s'");

        // Act
        const close = endOfString(bytes, 0, bytes.length);

        // Assert
        expect(close).toBe(6);
    });

    it("should find the closing apostrophe right after a doubled one", () => {
        // Arrange
        const bytes = bytesOf("'a'''");

        // Act
        const close = endOfString(bytes, 0, bytes.length);

        // Assert
        expect(close).toBe(4);
    });

    it("should start from the opening apostrophe it is given", () => {
        // Arrange
        const bytes = bytesOf("x,'a'");

        // Act
        const close = endOfString(bytes, 2, bytes.length);

        // Assert
        expect(close).toBe(4);
    });

    it("should report a string whose last apostrophe is doubled as never closed", () => {
        // Arrange
        const bytes = bytesOf("'ab''");

        // Act
        const error = errorThrownBy(StepSyntaxError, () => endOfString(bytes, 0, bytes.length));

        // Assert
        expect(error.message).toBe("A string is never closed at byte 0");
        expect(error.offset).toBe(0);
    });
});
