import { describe, expect, it, vi } from "vitest";
import { readDxfDrawing } from "./dxf-reader";

vi.mock("./dxf-reader.constants", async importOriginal => ({ ...await importOriginal<typeof import("./dxf-reader.constants")>(), INSERT_WORK_FLOOR: 100, INSERT_WORK_CEILING: 100 }));

const line = ["0", "LINE", "8", "0", "10", "0", "20", "0", "11", "1", "21", "0"];

const insert = (columns: number): string[] => ["0", "INSERT", "8", "0", "2", "DOT", "10", "0", "20", "0", "70", String(columns), "44", "1"];

const dxf = (...inserts: string[][]): string =>
    ["0", "SECTION", "2", "BLOCKS", "0", "BLOCK", "2", "DOT", "10", "0", "20", "0", ...line, "0", "ENDBLK", "0", "ENDSEC",
        "0", "SECTION", "2", "ENTITIES", ...inserts.flat(), ...line, "0", "ENDSEC", "0", "EOF"].join("\n");

describe("reading DXF against an insert budget lowered to 100, since a file must be large to reach the real one", () => {
    it("should place every copy of inserts whose work reaches the budget, a line costing 4 and a copy 1", () => {
        // Act
        const reading = readDxfDrawing(dxf(insert(15), insert(5)), false);

        // Assert
        expect([reading.entities.length, reading.warnings]).toEqual([21, []]);
    });

    it("should leave out an insert that goes past the budget whole, and read the inserts that fit after it and every entity written out", () => {
        // Arrange
        const text = dxf(insert(15), insert(6), insert(5));

        // Act
        const reading = readDxfDrawing(text, false);

        // Assert
        expect([reading.entities.length, reading.warnings]).toEqual([21, [
            `1 block insert was left out: with the inserts read before it, it places more entities, points and copies than the 100 a file of ${text.length} characters may expand to.`,
        ]]);
    });
});
