import { describe, expect, it } from "vitest";
import { errorThrownBy } from "../__test__/thrown";
import { StepSyntaxError } from "./errors";
import { indexStep } from "./file-index";
import { decodeArguments } from "./reader";
import { closingParenthesis } from "./scanner";
import type { StepIndex } from "./step-types";

function typeNamesOf(index: StepIndex): string[] {
    return Array.from(index.typeCodes, (code) => index.typeTable[code]!);
}

const bytesOf = (text: string): Uint8Array => new TextEncoder().encode(text);
const byteLengthOf = (text: string): number => bytesOf(text).length;
const spanText = (index: StepIndex, start: number, end: number): string => new TextDecoder().decode(index.bytes.subarray(start, end));
const rowText = (index: StepIndex, row: number): string => spanText(index, index.rowStart[row]!, index.rowEnd[row]!);
const argumentsOf = (index: StepIndex, row: number): unknown[] => decodeArguments(index.bytes, index.argStart[row]!, index.argEnd[row]!);
const syntaxErrorOf = (text: string): StepSyntaxError => errorThrownBy(StepSyntaxError, () => indexStep(bytesOf(text)));

const FILE_DESCRIPTION_LINE = "FILE_DESCRIPTION(('ViewDefinition [ReferenceView_V1.2]'),'2;1');";
const FILE_NAME_LINE = "FILE_NAME('O''Brien.ifc','2026-10-06T12:00:00',('Ada'),('Bit By Bit'),'bitbybit','tests','');";
const FILE_SCHEMA_LINE = "FILE_SCHEMA(('IFC4'));";
const POINT_ROW = "#1=IFCCARTESIANPOINT((0.,0.,0.));";
const TRICKY_STRING_ROW = "#2 = IfcPropertySingleValue ( 'Note' , 'ends with ); and it''s quoted' , IFCLABEL('x') , $ ) ;";
const SPREAD_ROW = "#10=IFCCARTESIANPOINT(\n    (1.,\n     2.,3.));";
const IRREGULAR_ROW = "#11\t=\tifcCartesianPoint((4.,5.,6.));";
const UTF8_ROW = "#12=IFCPROPERTYSINGLEVALUE('Grüße',$,IFCLABEL('é'),$);";

const SMALL_FILE = [
    "ISO-10303-21;",
    "HEADER;",
    FILE_DESCRIPTION_LINE,
    FILE_NAME_LINE,
    FILE_SCHEMA_LINE,
    "ENDSEC;",
    "",
    "DATA;",
    POINT_ROW,
    "/* a comment between entities */",
    TRICKY_STRING_ROW,
    `${SPREAD_ROW} /* a comment after an entity */`,
    `   ${IRREGULAR_ROW}\r`,
    UTF8_ROW,
    "ENDSEC;",
    "END-ISO-10303-21;",
    "",
].join("\n");

const DATA_PREFIX = ["ISO-10303-21;", "HEADER;", FILE_SCHEMA_LINE, "ENDSEC;", "DATA;", ""].join("\n");
const fileOfRows = (rows: string): string => `${DATA_PREFIX}${rows}`;

describe("indexStep", () => {
    it("should count the entities of the DATA section", () => {
        // Act
        const index = indexStep(bytesOf(SMALL_FILE));

        // Assert
        expect(index.count).toBe(5);
    });

    it("should keep the bytes it was given", () => {
        // Arrange
        const bytes = bytesOf(SMALL_FILE);

        // Act
        const index = indexStep(bytes);

        // Assert
        expect(index.bytes).toBe(bytes);
    });

    it("should list the express ids in file order", () => {
        // Act
        const index = indexStep(bytesOf(SMALL_FILE));

        // Assert
        expect(Array.from(index.ids)).toEqual([1, 2, 10, 11, 12]);
    });

    it("should give every per-entity array exactly one item per entity", () => {
        // Act
        const index = indexStep(bytesOf(SMALL_FILE));

        // Assert
        expect([index.ids.length, index.typeCodes.length, index.argStart.length, index.argEnd.length, index.rowStart.length, index.rowEnd.length]).toEqual([5, 5, 5, 5, 5, 5]);
    });

    it("should hold the type names in upper case", () => {
        // Act
        const index = indexStep(bytesOf(SMALL_FILE));

        // Assert
        expect(typeNamesOf(index)).toEqual(["IFCCARTESIANPOINT", "IFCPROPERTYSINGLEVALUE", "IFCCARTESIANPOINT", "IFCCARTESIANPOINT", "IFCPROPERTYSINGLEVALUE"]);
    });

    it("should give a type name that repeats one code, and keep each name once", () => {
        // Act
        const index = indexStep(bytesOf(SMALL_FILE));

        // Assert
        expect([index.typeCodes[3], index.typeCodes[4]]).toEqual([index.typeCodes[0], index.typeCodes[1]]);
        expect(index.typeTable).toEqual(["IFCCARTESIANPOINT", "IFCPROPERTYSINGLEVALUE"]);
    });

    it("should give a type name written in any case the code of its upper-case spelling", () => {
        // Act
        const index = indexStep(bytesOf(fileOfRows("#1=IFCWALL('a');\n#2=IfcWall('b');\n#3=ifcwall('c');\n#4=IfcWalls('d');\nENDSEC;\nEND-ISO-10303-21;\n")));

        // Assert
        expect([Array.from(index.typeCodes), index.typeTable]).toEqual([[0, 0, 0, 1], ["IFCWALL", "IFCWALLS"]]);
    });

    it("should span each entity from its # to just after its semicolon", () => {
        // Act
        const index = indexStep(bytesOf(SMALL_FILE));

        // Assert
        expect([0, 1, 2, 3, 4].map((row) => rowText(index, row))).toEqual([POINT_ROW, TRICKY_STRING_ROW, SPREAD_ROW, IRREGULAR_ROW, UTF8_ROW]);
    });

    it("should span the attribute list from just inside its opening parenthesis to its closing one", () => {
        // Act
        const index = indexStep(bytesOf(SMALL_FILE));

        // Assert
        expect(spanText(index, index.argStart[1]! - 1, index.argEnd[1]! + 1)).toBe("( 'Note' , 'ends with ); and it''s quoted' , IFCLABEL('x') , $ )");
    });

    it("should point each attribute span at values that decode to the entity's arguments", () => {
        // Act
        const index = indexStep(bytesOf(SMALL_FILE));

        // Assert
        expect([0, 1, 2, 3, 4].map((row) => argumentsOf(index, row))).toEqual([
            [[0, 0, 0]],
            ["Note", "ends with ); and it's quoted", { type: "IFCLABEL", value: "x" }, null],
            [[1, 2, 3]],
            [[4, 5, 6]],
            ["Grüße", null, { type: "IFCLABEL", value: "é" }, null],
        ]);
    });

    it("should count the spans in bytes, not in characters, after UTF-8 text", () => {
        // Act
        const index = indexStep(bytesOf(SMALL_FILE));

        // Assert
        expect(index.rowEnd[4]! - index.rowStart[4]!).toBe(byteLengthOf(UTF8_ROW));
        expect(index.rowEnd[4]! - index.rowStart[4]!).toBe(UTF8_ROW.length + 3);
    });

    it("should decode the HEADER section's entities", () => {
        // Act
        const index = indexStep(bytesOf(SMALL_FILE));

        // Assert
        expect(index.header.map(({ type, args }) => ({ type, args }))).toEqual([
            { type: "FILE_DESCRIPTION", args: [["ViewDefinition [ReferenceView_V1.2]"], "2;1"] },
            { type: "FILE_NAME", args: ["O'Brien.ifc", "2026-10-06T12:00:00", ["Ada"], ["Bit By Bit"], "bitbybit", "tests", ""] },
            { type: "FILE_SCHEMA", args: [["IFC4"]] },
        ]);
    });

    it("should upper-case the header entity names and accept keywords in any case", () => {
        // Arrange
        const text = "  iso-10303-21;\nheader;\nfile_schema(('IFC4'));\nendsec;\ndata;\n#1=ifcWall();\nendsec;\nend-iso-10303-21;\n";

        // Act
        const index = indexStep(bytesOf(text));

        // Assert
        expect(index.header).toEqual([{ type: "FILE_SCHEMA", args: [["IFC4"]], text: "file_schema(('IFC4'));", offset: text.indexOf("file_schema") }]);
        expect(typeNamesOf(index)).toEqual(["IFCWALL"]);
    });

    it("should read a DATA section that names its parameters", () => {
        // Arrange
        const text = "ISO-10303-21;\nHEADER;\nFILE_SCHEMA(('IFC4'));\nENDSEC;\nDATA('x',());\n#5=IFCWALL('a');\nENDSEC;\nEND-ISO-10303-21;\n";

        // Act
        const index = indexStep(bytesOf(text));

        // Assert
        expect(Array.from(index.ids)).toEqual([5]);
        expect(argumentsOf(index, 0)).toEqual(["a"]);
    });

    it("should read a DATA section with space before its semicolon", () => {
        // Act
        const index = indexStep(bytesOf(fileOfRows("ENDSEC;\nEND-ISO-10303-21;\n").replace("DATA;", "DATA ;")));

        // Assert
        expect(index.count).toBe(0);
    });

    it("should read an empty DATA section", () => {
        // Act
        const index = indexStep(bytesOf(fileOfRows("ENDSEC;\nEND-ISO-10303-21;\n")));

        // Assert
        expect(index.count).toBe(0);
        expect(Array.from(index.ids)).toEqual([]);
        expect(typeNamesOf(index)).toEqual([]);
    });

    it("should give a complex instance an empty type name", () => {
        // Arrange
        const complexRow = "#7=(IFCA(1)IFCB(2));";

        // Act
        const index = indexStep(bytesOf(fileOfRows(`${complexRow}\nENDSEC;\nEND-ISO-10303-21;\n`)));

        // Assert
        expect(typeNamesOf(index)).toEqual([""]);
        expect(rowText(index, 0)).toBe(complexRow);
        expect(spanText(index, index.argStart[0]!, index.argEnd[0]!)).toBe("IFCA(1)IFCB(2)");
    });

    it("should grow past its first thousand rows", () => {
        // Arrange
        const rows = Array.from({ length: 1500 }, (_, row) => `#${row + 1}=IFCX(${row});`).join("\n");

        // Act
        const index = indexStep(bytesOf(fileOfRows(`${rows}\nENDSEC;\nEND-ISO-10303-21;\n`)));

        // Assert
        expect(index.count).toBe(1500);
        expect(index.ids[1023]).toBe(1024);
        expect(index.ids[1499]).toBe(1500);
        expect(rowText(index, 1499)).toBe("#1500=IFCX(1499);");
        expect(argumentsOf(index, 1024)).toEqual([1024]);
    });

    it("should keep the largest 32-bit express id as the file writes it", () => {
        // Arrange
        const largeId = 2 ** 31 - 1;

        // Act
        const index = indexStep(bytesOf(fileOfRows(`#${largeId}=IFCX();\nENDSEC;\nEND-ISO-10303-21;\n`)));

        // Assert
        expect(index.ids[0]).toBe(largeId);
    });

    it("should refuse an express id beyond the 32-bit range rather than change it", () => {
        // Arrange
        const largeId = 2 ** 31;

        // Act & Assert
        expect(() => indexStep(bytesOf(fileOfRows(`#${largeId}=IFCX();\nENDSEC;\nEND-ISO-10303-21;\n`)))).toThrow(`Entity #${largeId} has an id above 2147483647`);
    });
});

describe("indexStep syntax errors", () => {
    it("should report a file that does not start with ISO-10303-21;", () => {
        // Act
        const error = syntaxErrorOf("HEADER;\nENDSEC;\nDATA;\nENDSEC;\n");

        // Assert
        expect(error.message).toBe("Expected ISO-10303-21 at byte 0");
    });

    it("should report the wrong opening keyword where it starts, after leading space", () => {
        // Act
        const error = syntaxErrorOf("  ISO-10303-22;\n");

        // Assert
        expect(error.offset).toBe(2);
    });

    it("should report a missing HEADER section", () => {
        // Act
        const error = syntaxErrorOf("ISO-10303-21;\nDATA;\nENDSEC;\n");

        // Assert
        expect(error.message).toBe("Expected HEADER at byte 14");
    });

    it("should report a HEADER section that never reaches ENDSEC", () => {
        // Arrange
        const text = "ISO-10303-21;\nHEADER;\n#1=IFCX();\n";

        // Act
        const error = syntaxErrorOf(text);

        // Assert
        expect(error.message).toBe(`Expected a header entity or ENDSEC at byte ${text.indexOf("#")}`);
    });

    it("should report a header entity without an attribute list", () => {
        // Arrange
        const text = "ISO-10303-21;\nHEADER;\nFILE_SCHEMA;\nENDSEC;\n";

        // Act
        const error = syntaxErrorOf(text);

        // Assert
        expect(error.message).toBe(`The header entity FILE_SCHEMA has no attribute list at byte ${text.indexOf(";", text.indexOf("FILE_SCHEMA"))}`);
    });

    it("should report a missing DATA section", () => {
        // Arrange
        const text = "ISO-10303-21;\nHEADER;\nENDSEC;\nEND-ISO-10303-21;\n";

        // Act
        const error = syntaxErrorOf(text);

        // Assert
        expect(error.message).toBe(`Expected DATA at byte ${text.indexOf("END-ISO")}`);
    });

    it("should report a DATA section that never ends", () => {
        // Arrange
        const text = fileOfRows("#1=IFCX();\n");

        // Act
        const error = syntaxErrorOf(text);

        // Assert
        expect(error.message).toBe(`The DATA section never ends at byte ${text.length}`);
    });

    it("should report a DATA section closed without its semicolon", () => {
        // Arrange
        const text = fileOfRows("ENDSEC");

        // Act
        const error = syntaxErrorOf(text);

        // Assert
        expect(error.message).toBe(`Expected ';' after ENDSEC at byte ${text.length}`);
    });

    it("should report something other than an entity inside the DATA section", () => {
        // Act
        const error = syntaxErrorOf(fileOfRows("IFCX();\nENDSEC;\nEND-ISO-10303-21;\n"));

        // Assert
        expect(error.message).toBe(`Expected an entity or ENDSEC at byte ${DATA_PREFIX.length}`);
    });

    it("should report an entity without '='", () => {
        // Act
        const error = syntaxErrorOf(fileOfRows("#1 IFCX();\nENDSEC;\nEND-ISO-10303-21;\n"));

        // Assert
        expect(error.message).toBe(`Entity #1 has no '=' at byte ${DATA_PREFIX.length + 3}`);
    });

    it("should report an entity without ';' at whatever follows it", () => {
        // Act
        const error = syntaxErrorOf(fileOfRows("#1=IFCX()\n#2=IFCX();\nENDSEC;\nEND-ISO-10303-21;\n"));

        // Assert
        expect(error.message).toBe(`Entity #1 does not end with ';' at byte ${DATA_PREFIX.length + 10}`);
    });

    it("should report an entity without an id", () => {
        // Act
        const error = syntaxErrorOf(fileOfRows("#=IFCX();\nENDSEC;\nEND-ISO-10303-21;\n"));

        // Assert
        expect(error.message).toBe(`An entity without an id at byte ${DATA_PREFIX.length}`);
    });

    it("should report an entity without an attribute list", () => {
        // Act
        const error = syntaxErrorOf(fileOfRows("#1=IFCX;\nENDSEC;\nEND-ISO-10303-21;\n"));

        // Assert
        expect(error.message).toBe(`Entity #1 has no attribute list at byte ${DATA_PREFIX.length + 7}`);
    });

    it("should report an entity whose attribute list is never closed at its opening parenthesis", () => {
        // Act
        const error = syntaxErrorOf(fileOfRows("#1=IFCX((1);\nENDSEC;\nEND-ISO-10303-21;\n"));

        // Assert
        expect(error.message).toBe(`A parenthesis is never closed at byte ${DATA_PREFIX.length + 7}`);
    });
});

describe("closingParenthesis", () => {
    it("should find the parenthesis that closes the one it starts at", () => {
        // Arrange
        const bytes = bytesOf("(a,(b),c)x");

        // Act
        const close = closingParenthesis(bytes, 0, bytes.length);

        // Assert
        expect(close).toBe(8);
    });

    it("should start from the opening parenthesis it is given", () => {
        // Arrange
        const bytes = bytesOf("x=(1),(2)");

        // Act
        const close = closingParenthesis(bytes, 2, bytes.length);

        // Assert
        expect(close).toBe(4);
    });

    it("should skip parentheses inside strings, doubled apostrophes included", () => {
        // Arrange
        const bytes = bytesOf("('(',')','it'')s')");

        // Act
        const close = closingParenthesis(bytes, 0, bytes.length);

        // Assert
        expect(close).toBe(bytes.length - 1);
    });

    it("should skip parentheses inside binary values", () => {
        // Arrange
        const bytes = bytesOf("(\"0)\",x)");

        // Act
        const close = closingParenthesis(bytes, 0, bytes.length);

        // Assert
        expect(close).toBe(7);
    });

    it("should skip parentheses inside comments", () => {
        // Arrange
        const bytes = bytesOf("(/* ) */x)");

        // Act
        const close = closingParenthesis(bytes, 0, bytes.length);

        // Assert
        expect(close).toBe(9);
    });

    it("should report a parenthesis that is never closed at the opening one", () => {
        // Arrange
        const bytes = bytesOf("((a)");

        // Act
        const error = errorThrownBy(StepSyntaxError, () => closingParenthesis(bytes, 0, bytes.length));

        // Assert
        expect(error.message).toBe("A parenthesis is never closed at byte 0");
    });

    it("should report a binary value that is never closed", () => {
        // Arrange
        const bytes = bytesOf("(\"0F");

        // Act
        const error = errorThrownBy(StepSyntaxError, () => closingParenthesis(bytes, 0, bytes.length));

        // Assert
        expect(error.message).toBe("A binary value is never closed at byte 1");
    });

    it("should report a binary value whose closing quote lies past the end it is given", () => {
        // Arrange
        const bytes = bytesOf("(\"0F\")");

        // Act
        const error = errorThrownBy(StepSyntaxError, () => closingParenthesis(bytes, 0, 3));

        // Assert
        expect(error.message).toBe("A binary value is never closed at byte 1");
    });

    it("should report a string that is never closed", () => {
        // Arrange
        const bytes = bytesOf("('abc)");

        // Act
        const error = errorThrownBy(StepSyntaxError, () => closingParenthesis(bytes, 0, bytes.length));

        // Assert
        expect(error.message).toBe("A string is never closed at byte 1");
    });
});

describe("indexStep over whole files", () => {
    it("should read a file that starts with a UTF-8 byte order mark", () => {
        // Arrange
        const bytes = Uint8Array.of(0xef, 0xbb, 0xbf, ...bytesOf(SMALL_FILE));

        // Act
        const index = indexStep(bytes);

        // Assert
        expect(index.count).toBe(5);
    });

    it("should read every DATA section of a file and note where each later one starts", () => {
        // Arrange
        const text = fileOfRows("#1=IFCX();\nENDSEC;\nDATA;\n#2=IFCY();\n#3=IFCZ();\nENDSEC;\nEND-ISO-10303-21;\n");

        // Act
        const index = indexStep(bytesOf(text));

        // Assert
        expect(Array.from(index.ids)).toEqual([1, 2, 3]);
        expect(index.sectionStarts).toEqual([1]);
    });

    it("should refuse a file that goes on after its end", () => {
        // Arrange
        const text = `${fileOfRows("#1=IFCX();\nENDSEC;\nEND-ISO-10303-21;\n")}#2=IFCY();\n`;

        // Act
        const error = syntaxErrorOf(text);

        // Assert
        expect(error.message).toBe(`The file goes on after END-ISO-10303-21; at byte ${text.indexOf("#2")}`);
    });

    it("should accept space and comments after the end", () => {
        // Arrange
        const text = `${fileOfRows("#1=IFCX();\nENDSEC;\nEND-ISO-10303-21;\n")}\n/* written by a tool */\n\n`;

        // Act
        const index = indexStep(bytesOf(text));

        // Assert
        expect(index.count).toBe(1);
    });

    it("should refuse a file without its end", () => {
        // Arrange
        const text = fileOfRows("#1=IFCX();\nENDSEC;\n");

        // Act
        const error = syntaxErrorOf(text);

        // Assert
        expect(error.message).toBe(`Expected DATA or END-ISO-10303-21 at byte ${text.length}`);
    });
});
