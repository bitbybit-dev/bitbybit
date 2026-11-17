import { describe, it, expect, beforeAll } from "vitest";
import { InputError } from "@bitbybit-dev/base";
import type { BitbybitOcctModule } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTService } from "../occ-service";
import type * as Inputs from "../api/inputs";
import { ledgerRun, namesOf } from "../__test__/kernel-ledger";

const dxf = (sections: string[][]): string => [...sections.flatMap(([name, ...body]) => ["0", "SECTION", "2", name!, ...body, "0", "ENDSEC"]), "0", "EOF"].join("\n");

const line = (layer = "0"): string[] => ["0", "LINE", "8", layer, "10", "0", "20", "0", "30", "0", "11", "1", "21", "1", "31", "0"];

const block = (name: string, body: string[]): string[] => ["0", "BLOCK", "2", name, "70", "0", "10", "0", "20", "0", "30", "0", ...body, "0", "ENDBLK"];

const insert = (name: string, layer = "0", columns = 1, rows = 1, step = 1): string[] =>
    ["0", "INSERT", "8", layer, "2", name, "10", "0", "20", "0", "30", "0", "70", String(columns), "71", String(rows), "44", String(step), "45", String(step)];

const doubling = (levels: number): string => {
    const blocks = [...block("B0", line())];
    for (let level = 1; level <= levels; level++) {
        blocks.push(...block(`B${String(level)}`, [...insert(`B${String(level - 1)}`, "0", 2, 1, 3 ** level), ...insert(`B${String(level - 1)}`, "0", 2, 1, 2 ** level)]));
    }
    return dxf([["BLOCKS", ...blocks], ["ENTITIES", ...insert(`B${String(levels)}`)]]);
};

const loose = <T>(value: unknown): T => value as T;

describe("OCCT io reading malformed and oversized DXF drawings", () => {
    let occ: BitbybitOcctModule;
    let occt: OCCTService;

    beforeAll(async () => {
        occ = await createBitbybitOcct();
        occt = new OCCTService(occ);
    }, 120_000);

    const loaded = (text: unknown, options: Partial<Inputs.OCCT.LoadDxfDto> = {}): { warnings: string[]; edges: number; layers: string[] } => {
        const result = occt.io.loadDxfStructured({ dxf: loose<string>(text), ...options });
        const summary = { warnings: result.warnings, edges: result.parts.reduce((sum, part) => sum + occ.CountEdges(part.shape), 0), layers: result.parts.map(part => part.layer) };
        result.parts.forEach(part => part.shape.delete());
        return summary;
    };

    it.each([
        ["inserts doubling 16 levels deep", doubling(16)],
        ["inserts doubling 30 levels deep", doubling(30)],
        ["an array of a billion by a billion copies", dxf([["BLOCKS", ...block("B", line())], ["ENTITIES", ...insert("B", "0", 1e9, 1e9)]])],
    ])("should leave out %s with one warning, before expanding them", { timeout: 5000 }, (_name, text) => {
        // Act
        const result = loaded(text);

        // Assert
        expect(result.edges).toBe(0);
        expect(result.warnings).toEqual([expect.stringMatching(/block insert/)]);
    });

    it("should stop a block that inserts itself at the nesting limit", { timeout: 5000 }, () => {
        // Act
        const result = loaded(dxf([["BLOCKS", ...block("S", [...line(), ...insert("S")])], ["ENTITIES", ...insert("S")]]));

        // Assert
        expect(result.edges).toBe(16);
        expect(result.warnings).toEqual(["Block inserts nested deeper than 16 were left out."]);
    });

    it.each([
        ["binary DXF", "AutoCAD Binary DXF\r\n\u001a\u0000", /binary DXF/],
        ["a group code that is not a number", "0\nSECTION\nxx\nENTITIES", /damaged/],
        ["NaN where a number belongs", dxf([["ENTITIES", "0", "LINE", "8", "0", "10", "NaN", "20", "0", "11", "1", "21", "1"]]), /damaged/],
        ["a million empty lines", "\n".repeat(1_000_000), /damaged/],
        ["no ENTITIES section", dxf([["HEADER"]]), /no ENTITIES section/],
        ["a number instead of text", 42, /must be the text of a DXF file or its bytes/],
        ["bytes that are no DXF", new Uint8Array([0xff, 0xfe, 0x00, 0x41]), /no ENTITIES section/],
    ])("should refuse %s as an input error before the kernel runs", { timeout: 5000 }, (_name, text, message) => {
        // Act
        const run = ledgerRun(occ, () => occt.io.loadDxf({ dxf: loose<string>(text) }));

        // Assert
        expect(run.thrown).toBeInstanceOf(InputError);
        expect((run.thrown as Error).message).toMatch(message);
        expect(namesOf(run.leaked)).toEqual([]);
    });

    it("should read blocks and layers named after the properties of every object as plain names, and change no object", () => {
        // Arrange
        const names = ["__proto__", "constructor", "hasOwnProperty"];
        const text = dxf([
            ["BLOCKS", ...names.flatMap(name => block(name, line(name)))],
            ["ENTITIES", ...names.flatMap(name => insert(name, name)), ...line("toString")],
        ]);

        // Act
        const result = loaded(text);

        // Assert
        expect(result.layers).toEqual(["__proto__", "constructor", "hasOwnProperty", "toString"]);
        expect(result.edges).toBe(4);
        expect(Object.keys(Object.prototype)).toEqual([]);
    });

    it("should draw an old polyline of 300000 vertices up to the edges a load builds, in time linear in the file", { timeout: 30_000 }, () => {
        // Arrange
        const vertices = Array.from({ length: 300_000 }, (_, k) => ["0", "VERTEX", "8", "0", "10", String(k), "20", String(k % 2)]).flat();

        // Act
        const result = loaded(dxf([["ENTITIES", "0", "POLYLINE", "8", "0", "70", "0", ...vertices, "0", "SEQEND"]]));

        // Assert
        expect(result.edges).toBe(200_000);
        expect(result.warnings).toEqual(["99999 segments on layer \"0\" could not be drawn: the file asks for more edges than one load of a file its size builds."]);
    });

    it.each([
        ["a join tolerance that is no number", { joinTolerance: Number.NaN }, "`joinTolerance` must be a finite number 0 or more; it is NaN."],
        ["a unit of length there is none of", { unit: loose<Inputs.Base.unitOfLengthEnum>("parsec") }, "`unit` is parsec, which is none of mm, cm, m, in."],
    ])("should refuse %s before reading the file, whether or not the file states a unit", (_name, options, message) => {
        // Act
        const refusals = [dxf([["ENTITIES", ...line()]]), dxf([["HEADER", "9", "$INSUNITS", "70", "4"], ["ENTITIES", ...line()]])].map(text => ledgerRun(occ, () => occt.io.loadDxf({ dxf: text, ...options })));

        // Assert
        refusals.forEach(run => {
            expect(run.thrown).toBeInstanceOf(InputError);
            expect((run.thrown as Error).message).toBe(message);
            expect(run.made).toBe(0);
        });
    });
});
