import { describe, expect, it } from "vitest";
import * as Inputs from "../../../../inputs";
import { headerVariable, numberOf, readDxf, recordsOf, tablesOf, valueOf, valuesOf } from "../__test__/dxf-reader";
import { writeBlocks, writeHeader, writeTables } from "./dxf-tables";
import type { DxfLayout } from "./dxf-tables";
import { DxfText } from "./dxf-text";

const layout = (changes: Partial<DxfLayout> = {}): DxfLayout => ({
    version: "AC1015",
    colorFormat: "aci",
    unit: undefined,
    bounds: undefined,
    layers: [{ name: "0", color: "#ffffff", lineType: Inputs.IO.lineTypeEnum.continuous }],
    lineTypes: [],
    patternUnit: 1,
    ...changes,
});

const tablesText = (written: DxfLayout): string => {
    const text = new DxfText(0x20);
    writeTables(text, written);
    return text.joined();
};

describe("DXF header", () => {
    it("should state the unit and the metric measurement system in AutoCAD 2000", () => {
        // Arrange
        const text = new DxfText(0x20);

        // Act
        writeHeader(text, layout({ unit: "mm" }));

        // Assert
        const file = readDxf(text.joined());
        expect([headerVariable(file, "$INSUNITS")[0]?.value, headerVariable(file, "$MEASUREMENT")[0]?.value]).toEqual(["4", "1"]);
    });

    it("should leave a place for the handle seed in AutoCAD 2000 and none in R12", () => {
        // Act
        const seeds = [writeHeader(new DxfText(0x20), layout()), writeHeader(new DxfText(0x20), layout({ version: "AC1009" }))];

        // Assert
        expect([typeof seeds[0], seeds[1]]).toEqual(["number", undefined]);
    });
});

describe("DXF tables", () => {
    it("should write a dashed line type's elements and its whole length in the pattern unit", () => {
        // Act
        const file = readDxf(tablesText(layout({ lineTypes: [Inputs.IO.lineTypeEnum.dashed], patternUnit: 2 })));

        // Assert
        const dashed = tablesOf(file).find(table => table.name === "LTYPE")!.records.find(record => valueOf(record, 2) === "DASHED")!;
        expect([valuesOf(dashed, 49).map(Number), numberOf(dashed, 40), numberOf(dashed, 73), valuesOf(dashed, 74)]).toEqual([[8, -4], 12, 2, ["0", "0"]]);
    });

    it("should write each layer row with its index color and line type, and its exact color on request", () => {
        // Act
        const file = readDxf(tablesText(layout({ colorFormat: "truecolor", layers: [{ name: "cut", color: "#ff8000", lineType: Inputs.IO.lineTypeEnum.hidden }] })));

        // Assert
        const [cut] = tablesOf(file).find(table => table.name === "LAYER")!.records;
        expect([valueOf(cut!, 2), valueOf(cut!, 62), valueOf(cut!, 420), valueOf(cut!, 6)]).toEqual(["cut", "30", String(0xff8000), "HIDDEN"]);
    });
});

describe("DXF blocks", () => {
    it("should give the paper space block the paper space flag and the model space block none", () => {
        // Arrange
        const text = new DxfText(0x20);
        const owners = writeTables(text, layout());

        // Act
        writeBlocks(text, layout(), owners);

        // Assert
        const blocks = recordsOf(readDxf(text.joined()).sections.get("BLOCKS") ?? []);
        expect(blocks.map(block => [block.kind, valueOf(block, 2) ?? "", valueOf(block, 67) ?? ""])).toEqual([
            ["BLOCK", "*Model_Space", ""], ["ENDBLK", "", ""], ["BLOCK", "*Paper_Space", "1"], ["ENDBLK", "", "1"],
        ]);
    });

    it("should write no blocks in R12, which needs none for its spaces", () => {
        // Arrange
        const text = new DxfText(0x20);

        // Act
        writeBlocks(text, layout({ version: "AC1009" }), { modelSpace: "", paperSpace: "" });

        // Assert
        expect(recordsOf(readDxf(text.joined()).sections.get("BLOCKS") ?? [])).toEqual([]);
    });
});
