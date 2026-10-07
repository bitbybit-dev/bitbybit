import { describe, expect, it } from "vitest";
import { asciiText, firstStringIn, plainText, referenceCapacity, referenceList, referencesInto, textOf } from "./scanner";

const bytesOf = (text: string): Uint8Array => new TextEncoder().encode(text);

describe("textOf", () => {
    it("should decode UTF-8 as it is written", () => {
        // Arrange
        const bytes = bytesOf("Grüße");

        // Act
        const text = textOf(bytes, 0, bytes.length);

        // Assert
        expect(text).toBe("Grüße");
    });

    it("should read bytes that are not UTF-8 as ISO 8859-1, so an older file's text keeps its characters", () => {
        // Arrange
        const bytes = Uint8Array.of(0x57, 0x61, 0x6e, 0x64, 0x20, 0x41, 0x75, 0xdf, 0x65, 0x6e);

        // Act
        const text = textOf(bytes, 0, bytes.length);

        // Assert
        expect(text).toBe("Wand Außen");
    });
});

describe("plainText", () => {
    it("should give printable ASCII as it is", () => {
        // Arrange
        const bytes = bytesOf("'2O2Fr$t4X7Zf8NOew3FLOH'");

        // Act
        const text = plainText(bytes, 1, bytes.length - 1);

        // Assert
        expect(text).toBe("2O2Fr$t4X7Zf8NOew3FLOH");
    });

    it.each([
        ["an escape", "A\\X\\41"],
        ["a doubled apostrophe", "It''s"],
        ["a byte beyond ASCII", "Béton"],
        ["a control character", "A\tB"],
        ["more than a chunk of characters", "A".repeat(8193)],
    ])("should leave text holding %s to the string decoder", (_kind, raw) => {
        // Arrange
        const bytes = bytesOf(raw);

        // Act
        const text = plainText(bytes, 0, bytes.length);

        // Assert
        expect(text).toBeUndefined();
    });
});

function referencesIn(text: string): number[] {
    const bytes = bytesOf(text);
    const into = new Int32Array(referenceCapacity(0, bytes.length));
    return Array.from(into.subarray(0, referencesInto(bytes, 0, bytes.length, into)));
}

function listOf(text: string): number[] | undefined {
    const bytes = new TextEncoder().encode(text);
    return referenceList(bytes, 0, bytes.length);
}

describe("referenceList", () => {
    it("should read a list of references with space and comments between them", () => {
        // Act
        const lists = [listOf("(#1,#22,#333)"), listOf(" ( #1 , /* a comment */ #2 ) "), listOf("()"), listOf("( )")];

        // Assert
        expect(lists).toEqual([[1, 22, 333], [1, 2], [], []]);
    });

    it("should refuse anything but one list of references, so the full reader can say what is wrong", () => {
        // Act
        const lists = ["(#1,'a')", "(#1,(#2))", "(#1),#2", "#1", "(#1,)", "(,#1)", "(#1 #2)", "(#)", "(#1a)", "(#1", "(#3000000000)", "(#1,.T.)", "", "(#1))"].map(listOf);

        // Assert
        expect(lists).toEqual(lists.map(() => undefined));
    });

    it("should read only the span it is given", () => {
        // Arrange
        const bytes = new TextEncoder().encode("IFCPOLYLOOP((#1,#2,#3));");

        // Act
        const list = referenceList(bytes, 12, 22);

        // Assert
        expect(list).toEqual([1, 2, 3]);
    });
});

describe("asciiText", () => {
    it("should read a span of ASCII bytes", () => {
        // Arrange
        const bytes = new TextEncoder().encode("(IFCPARAMETERVALUE(1.5))");

        // Act
        const text = asciiText(bytes, 1, 18);

        // Assert
        expect(text).toBe("IFCPARAMETERVALUE");
    });
});

describe("referencesInto", () => {
    it("should skip comments, strings and binaries, an apostrophe inside a comment included", () => {
        // Act
        const references = referencesIn("(IFCA(/* #1 isn't */ #2) IFCB('#3', \"0F#4\", #5))");

        // Assert
        expect(references).toEqual([2, 5]);
    });

    it("should find the references in nested lists and typed values, in the order they are written", () => {
        // Act
        const references = referencesIn("IFCA(#12,'#99 in a text',\"0FF\",(#3,#4)),IFCB(#5)");

        // Assert
        expect(references).toEqual([12, 3, 4, 5]);
    });

    it("should pass over a '#' without digits and an id beyond the 32-bit range", () => {
        // Act
        const references = referencesIn("(#, #x, #2147483648, #12, #2147483647)");

        // Assert
        expect(references).toEqual([12, 2147483647]);
    });

    it("should have room for every reference a span can hold", () => {
        // Act
        const references = referencesIn("#1,#2,#3,#4");

        // Assert
        expect(references).toEqual([1, 2, 3, 4]);
    });
});

describe("firstStringIn", () => {
    it("should find the first attribute when it is a string and nothing otherwise", () => {
        // Arrange
        const named = bytesOf(" /* id */ 'abc',$");
        const unnamed = bytesOf("$,'abc'");

        // Act
        const span = firstStringIn(named, 0, named.length);

        // Assert
        expect(span && new TextDecoder().decode(named.subarray(span[0], span[1]))).toBe("abc");
        expect(firstStringIn(unnamed, 0, unnamed.length)).toBeUndefined();
    });
});
