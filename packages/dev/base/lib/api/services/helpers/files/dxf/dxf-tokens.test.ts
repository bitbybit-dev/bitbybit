import { describe, expect, it } from "vitest";
import { decodedText } from "./dxf-tokens";

describe("DXF text escapes", () => {
    it.each([
        ["Ma\\U+00DFe", "Maße"],
        ["Fl\\U+00E4che", "Fläche"],
        ["\\U+00C4cad", "Äcad"],
        ["\\U+00D8rken", "Ørken"],
        ["Pj\\U+016Bvis", "Pjūvis"],
    ])("should read %s as exactly four hex digits, whatever follows them: %s", (written, read) => {
        // Act
        const decoded = decodedText(written);

        // Assert
        expect(decoded).toBe(read);
    });

    it("should rejoin a character outside the basic plane written as two escapes", () => {
        // Act
        const decoded = decodedText("a\\U+D83D\\U+DE00b");

        // Assert
        expect(decoded).toBe("a😀b");
    });

    it("should read six hex digits as one escape of four followed by two characters, never as a code point out of range", () => {
        // Act
        const decoded = decodedText("\\U+FFFFFF");

        // Assert
        expect(decoded).toBe("￿FF");
    });

    it.each(["\\U+12", "\\U+00G1", "\\u+00e4", "\\U00E4"])("should leave %s, which is not a whole escape, as written", written => {
        // Act
        const decoded = decodedText(written);

        // Assert
        expect(decoded).toBe(written);
    });
});
