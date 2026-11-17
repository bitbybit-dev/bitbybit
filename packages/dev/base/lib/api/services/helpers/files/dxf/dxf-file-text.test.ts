import { describe, expect, it } from "vitest";
import { InputError } from "../../../../kernel-calls";
import { IoBitByBit } from "../../../io/io";
import { dxfTextOf } from "./dxf-file-text";

const CYRILLIC_BE_IN_1251 = 0xc1;
const CYRILLIC_BE = "Б";

const headerOf = (version: string, codePage?: string): string => [
    "0", "SECTION", "2", "HEADER",
    "9", "$ACADVER", "1", version,
    ...(codePage === undefined ? [] : ["9", "$DWGCODEPAGE", "3", codePage]),
    "0", "ENDSEC",
].join("\n");

const lineOnLayer = (layer: string): string => ["0", "SECTION", "2", "ENTITIES", "0", "LINE", "8", layer, "10", "0", "20", "0", "11", "1", "21", "0", "0", "ENDSEC", "0", "EOF"].join("\n");

const bytesWithOneByte = (before: string, byte: number, after: string): Uint8Array => {
    const head = new TextEncoder().encode(before);
    const tail = new TextEncoder().encode(after);
    const bytes = new Uint8Array(head.length + 1 + tail.length);
    bytes.set(head, 0);
    bytes[head.length] = byte;
    bytes.set(tail, head.length + 1);
    return bytes;
};

describe("dxfTextOf", () => {
    it("should hand back text as it is", () => {
        // Arrange
        const text = `${headerOf("AC1015")}\n${lineOnLayer("cut")}`;

        // Act
        const read = dxfTextOf(text, "dxf");

        // Assert
        expect(read).toBe(text);
    });

    it("should read bytes that are UTF-8 as UTF-8, whatever the version", () => {
        // Arrange
        const text = `${headerOf("AC1015", "ANSI_1251")}\n${lineOnLayer(`Ma${CYRILLIC_BE}e`)}`;

        // Act
        const read = dxfTextOf(new TextEncoder().encode(text), "dxf");

        // Assert
        expect(read).toBe(text);
    });

    it("should read older bytes in the code page the header names", () => {
        // Arrange
        const bytes = bytesWithOneByte(`${headerOf("AC1015", "ANSI_1251")}\n0\nSECTION\n2\nENTITIES\n0\nLINE\n8\n`, CYRILLIC_BE_IN_1251, "\n10\n0\n20\n0\n11\n1\n21\n0\n0\nENDSEC\n0\nEOF");

        // Act
        const read = dxfTextOf(bytes, "dxf");

        // Assert
        expect(read).toContain(`8\n${CYRILLIC_BE}\n10`);
    });

    it("should read older bytes as Windows-1252 when the header names no code page it knows", () => {
        // Arrange
        const bytes = bytesWithOneByte(`${headerOf("AC1015", "DOS437")}\n0\nSECTION\n2\nENTITIES\n0\nLINE\n8\n`, 0xe9, "\n10\n0\n20\n0\n11\n1\n21\n0\n0\nENDSEC\n0\nEOF");

        // Act
        const read = dxfTextOf(bytes, "dxf");

        // Assert
        expect(read).toContain("8\né\n10");
    });

    it("should read the bytes of a file from AutoCAD 2007 on as UTF-8 even when they are not", () => {
        // Arrange
        const bytes = bytesWithOneByte(`${headerOf("AC1021", "ANSI_1251")}\n0\nSECTION\n2\nENTITIES\n0\nLINE\n8\n`, CYRILLIC_BE_IN_1251, "\n10\n0\n20\n0\n11\n1\n21\n0\n0\nENDSEC\n0\nEOF");

        // Act
        const read = dxfTextOf(bytes, "dxf");

        // Assert
        expect(read).toContain("8\n�\n10");
    });

    it("should read the bytes of an ArrayBuffer and of any typed array", () => {
        // Arrange
        const text = `${headerOf("AC1015")}\n${lineOnLayer("cut")}`;
        const bytes = new TextEncoder().encode(text);

        // Act
        const read = [dxfTextOf(bytes.buffer, "dxf"), dxfTextOf(new DataView(bytes.buffer), "dxf")];

        // Assert
        expect(read).toStrictEqual([text, text]);
    });

    it("should refuse what is neither text nor bytes, naming the input", () => {
        // Act
        const refusals = [5, null, {}].map(data => () => dxfTextOf(data, "dxf"));

        // Assert
        expect(refusals[0]).toThrow(new InputError("`dxf` must be the text of a DXF file or its bytes; it is number.", "dxf"));
        expect(refusals[1]).toThrow(new InputError("`dxf` must be the text of a DXF file or its bytes; it is null.", "dxf"));
        expect(refusals[2]).toThrow(new InputError("`dxf` must be the text of a DXF file or its bytes; it is object.", "dxf"));
    });
});

describe("io.dxf.dxfRead and io.drawing.dxfToSvg on bytes", () => {
    const io = new IoBitByBit();

    it("should read a layer named in the file's code page", () => {
        // Arrange
        const bytes = bytesWithOneByte(`${headerOf("AC1015", "ANSI_1251")}\n0\nSECTION\n2\nENTITIES\n0\nLINE\n8\n`, CYRILLIC_BE_IN_1251, "\n10\n0\n20\n0\n11\n1\n21\n0\n0\nENDSEC\n0\nEOF");

        // Act
        const drawing = io.dxf.dxfRead({ dxf: bytes });

        // Assert
        expect(drawing.parts.map(part => part.layer)).toStrictEqual([CYRILLIC_BE]);
    });

    it("should write the same layer to SVG when it converts the bytes", () => {
        // Arrange
        const bytes = bytesWithOneByte(`${headerOf("AC1015", "ANSI_1251")}\n0\nSECTION\n2\nENTITIES\n0\nLINE\n8\n`, CYRILLIC_BE_IN_1251, "\n10\n0\n20\n0\n11\n1\n21\n0\n0\nENDSEC\n0\nEOF");

        // Act
        const converted = io.drawing.dxfToSvg({ dxf: bytes });

        // Assert
        expect(converted.svg).toContain(`inkscape:label="${CYRILLIC_BE}"`);
    });
});
