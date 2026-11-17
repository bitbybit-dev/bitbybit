import { describe, expect, it } from "vitest";
import { problemsOfR12, problemsOfR2000 } from "./dxf-structure";

const fileOf = (sections: [string, string[]][], end = "0\nEOF\n"): string =>
    `${sections.flatMap(([name, body]) => ["0", "SECTION", "2", name, ...body, "0", "ENDSEC"]).join("\n")}\n${end}`;

const r12 = (...entities: string[][]): string => fileOf([["HEADER", []], ["TABLES", []], ["BLOCKS", []], ["ENTITIES", entities.flat()]]);

const LINE = ["0", "LINE", "8", "0", "10", "0.0", "20", "0.0", "30", "0.0", "11", "1.0", "21", "0.0", "31", "0.0"];

describe("the R12 structure check", () => {
    it("should find nothing wrong with the four sections holding entities R12 defines", () => {
        // Act
        const problems = problemsOfR12(r12(LINE, ["0", "POLYLINE", "8", "0", "0", "VERTEX", "8", "0", "0", "SEQEND"]));

        // Assert
        expect(problems).toEqual([]);
    });

    it("should name an entity R12 does not define", () => {
        // Act
        const problems = problemsOfR12(r12(["0", "SPLINE", "8", "0"]));

        // Assert
        expect(problems).toEqual(["entity SPLINE"]);
    });

    it("should name a group code only AutoCAD 2000 has, such as a handle", () => {
        // Act
        const problems = problemsOfR12(r12(["0", "LINE", "5", "2A", "8", "0"]));

        // Assert
        expect(problems).toEqual(["R2000 codes"]);
    });

    it("should name a polyline its vertices do not follow and SEQEND does not close", () => {
        // Act
        const problems = problemsOfR12(r12(["0", "POLYLINE", "8", "0", "0", "VERTEX", "8", "0"], LINE));

        // Assert
        expect(problems).toEqual(["polyline sequence"]);
    });
});

describe("the AutoCAD 2000 structure check", () => {
    it("should name sections out of AutoCAD 2000's order and a file that does not end", () => {
        // Act
        const problems = problemsOfR2000(fileOf([["HEADER", []], ["ENTITIES", []]], ""));

        // Assert
        expect(problems).toEqual(expect.arrayContaining(["sections HEADER,ENTITIES", "no EOF", "tables ", "objects"]));
    });

    it("should name a table whose count disagrees with the records it holds", () => {
        // Arrange
        const tables = ["0", "TABLE", "2", "LAYER", "5", "2", "330", "0", "100", "AcDbSymbolTable", "70", "2",
            "0", "LAYER", "5", "3", "330", "2", "100", "AcDbSymbolTableRecord", "2", "0", "0", "ENDTAB"];

        // Act
        const problems = problemsOfR2000(fileOf([["HEADER", ["9", "$HANDSEED", "5", "10"]], ["TABLES", tables]]));

        // Assert
        expect(problems).toContain("LAYER counts 2 of 1");
    });
});
