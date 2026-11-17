import { describe, expect, it } from "vitest";
import type * as Inputs from "../../../../inputs";
import { Dxf } from "../../../io/dxf";
import { blockDxf, dxfOf, elapsedMs, entitiesDxf, insertDxf, layerTableDxf, lightPolylineDxf, lineDxf } from "../__test__/dxf-builders";
import { readDxfDrawing } from "./dxf-reader";

const FLOOR = 500_000;
const CEILING = 1_000_000;
const PER_CHARACTER = 16;
const LINE_COPY_WORK = 5;
const TIME_LIMIT_MS = 5000;

const read = (text: string): Inputs.IO.DxfDrawingDto => new Dxf().dxfRead({ dxf: text });

const pathCount = (drawing: Inputs.IO.DxfDrawingDto): number => drawing.parts.reduce((total, part) => total + part.paths.length, 0);

const leftOut = (count: number, capacity: number, text: string): string => count === 1
    ? `1 block insert was left out: with the inserts read before it, it places more entities, points and copies than the ${capacity} a file of ${text.length} characters may expand to.`
    : `${count} block inserts were left out: with the inserts read before them, they place more entities, points and copies than the ${capacity} a file of ${text.length} characters may expand to.`;

const padded = (text: string, length: number): string => text.replace("0\nEOF", `999\n${"x".repeat(Math.max(0, length - text.length))}\n0\nEOF`);

const doubling = (levels: number): string => dxfOf([
    ["BLOCKS", ...blockDxf("B0", lineDxf(0, 0, 1, 1)), ...Array.from({ length: levels }, (_, at) => blockDxf(`B${at + 1}`, insertDxf(`B${at}`, 2), insertDxf(`B${at}`, 2))).flat()],
    ["ENTITIES", ...insertDxf(`B${levels}`)],
]);

describe("reading a large DXF: block inserts share one budget per file, linear in its size", () => {
    it("should leave out the 547,600 lines a 170-byte array insert asks for, drawing none of them", () => {
        // Arrange
        const text = dxfOf([["BLOCKS", ...blockDxf("L", lineDxf(0, 0, 0.5, 0))], ["ENTITIES", ...insertDxf("L", 740, 740)]]);

        // Act
        const reading = readDxfDrawing(text, false);

        // Assert
        expect([reading.entities.length, reading.warnings]).toEqual([0, [leftOut(1, FLOOR, text)]]);
    });

    it("should leave out 2,400 copies of a 1,000-point polyline that a 12 KB file asks for", () => {
        // Arrange
        const polyline = lightPolylineDxf(Array.from({ length: 1000 }, (_, at) => [at, (at * 7) % 13]));
        const text = dxfOf([["BLOCKS", ...blockDxf("P", polyline)], ["ENTITIES", ...insertDxf("P", 2400)]]);

        // Act
        const reading = readDxfDrawing(text, false);

        // Assert
        expect([reading.entities.length, reading.warnings]).toEqual([0, [leftOut(1, FLOOR, text)]]);
    });

    it("should let a larger file expand further, 16 a character between its floor and its ceiling, a line copy costing 5", () => {
        // Arrange
        const arrayOf = (copies: number): string => dxfOf([["BLOCKS", ...blockDxf("L", lineDxf(0, 0, 1, 0))], ["ENTITIES", ...insertDxf("L", copies)]]);
        const files = [padded(arrayOf(140_000), 0), padded(arrayOf(140_000), 50_000), padded(arrayOf(170_000), 50_000), padded(arrayOf(CEILING / LINE_COPY_WORK + 1), 1_000_000)];

        // Act
        const counts = files.map(text => readDxfDrawing(text, false)).map(reading => [reading.entities.length, reading.warnings.length]);

        // Assert
        expect([files.map(text => Math.min(CEILING, Math.max(FLOOR, PER_CHARACTER * text.length))), counts]).toEqual([
            [FLOOR, 800_080, 800_080, CEILING],
            [[0, 1], [140_000, 0], [0, 1], [0, 1]],
        ]);
    });

    it.each([
        ["lines", lineDxf(0, 0, 0, 10), 50_000],
        ["10-point polylines", lightPolylineDxf(Array.from({ length: 10 }, (_, at) => [at, at % 2])), 50_000],
    ])("should read every copy of 1,000 inserts of a block of 50 %s, an ordinary block-heavy drawing", (_kind, entity, expected) => {
        // Arrange
        const inserts = Array.from({ length: 1000 }, () => insertDxf("PART"));
        const text = dxfOf([["BLOCKS", ...blockDxf("PART", ...Array.from({ length: 50 }, () => entity))], ["ENTITIES", ...inserts.flat()]]);

        // Act
        const reading = readDxfDrawing(text, false);

        // Assert
        expect([reading.entities.length, reading.warnings]).toEqual([expected, []]);
    });

    it.each([[16], [30]])("should leave out a block doubled at each of %i levels before expanding it", levels => {
        // Arrange
        const text = doubling(levels);

        // Act
        const reading = readDxfDrawing(text, false);

        // Assert
        expect([reading.entities.length, reading.warnings]).toEqual([0, [leftOut(1, FLOOR, text)]]);
    });

    it("should leave out an array of a billion by a billion copies", () => {
        // Arrange
        const text = dxfOf([["BLOCKS", ...blockDxf("L", lineDxf(0, 0, 1, 1))], ["ENTITIES", ...insertDxf("L", 1e9, 1e9)]]);

        // Act
        const reading = readDxfDrawing(text, false);

        // Assert
        expect([reading.entities.length, reading.warnings]).toEqual([0, [leftOut(1, FLOOR, text)]]);
    });

    it("should place nothing for an empty block arrayed a billion by a billion times, at once and with nothing to say", () => {
        // Arrange
        const text = dxfOf([["BLOCKS", ...blockDxf("EMPTY")], ["ENTITIES", ...insertDxf("EMPTY", 1e9, 1e9), ...lineDxf(0, 0, 1, 0)]]);

        // Act
        const reading = readDxfDrawing(text, false);

        // Assert
        expect([reading.entities.length, reading.warnings]).toEqual([1, []]);
    });

    it("should stop a block that inserts itself at sixteen levels, saying so", () => {
        // Arrange
        const text = dxfOf([["BLOCKS", ...blockDxf("SELF", lineDxf(0, 0, 1, 0), insertDxf("SELF"))], ["ENTITIES", ...insertDxf("SELF")]]);

        // Act
        const reading = readDxfDrawing(text, false);

        // Assert
        expect([reading.entities.length, reading.warnings]).toEqual([16, ["Block inserts nested deeper than 16 were left out."]]);
    });
});

describe("reading a large DXF: names are read once per entity and cut to the 255 characters AutoCAD allows", () => {
    it("should place 80,000 copies of an entity whose layer, line type and true colour each hold 260,000 characters within the time limit", () => {
        // Arrange
        const long = (letter: string): string => letter.repeat(260_000);
        const line = ["0", "LINE", "8", long("L"), "6", long("D"), "420", "1".repeat(260_000), "10", "0", "20", "0", "11", "1", "21", "1"];
        const text = dxfOf([["BLOCKS", ...blockDxf("B", line)], ["ENTITIES", ...insertDxf("B", 80_000)]]);
        let reading: Inputs.IO.DxfDrawingDto | undefined;

        // Act
        const took = elapsedMs(() => {
            reading = read(text);
        });

        // Assert
        expect([took < TIME_LIMIT_MS, pathCount(reading!), reading!.parts.map(part => part.layer?.length)]).toEqual([true, 80_000, [255]]);
    }, 120_000);

    it("should cut a layer, block and line type name past 255 characters to its first 255, once each, and keep a character whole", () => {
        // Arrange
        const name = (letter: string): string => letter.repeat(400);
        const emojiAtTheCut = `${"e".repeat(254)}\u{1F600}tail`;
        const text = dxfOf([
            layerTableDxf(["2", name("L"), "70", "0", "62", "1", "6", name("D")]),
            ["BLOCKS", ...blockDxf(name("B"), lineDxf(0, 0, 1, 0))],
            ["ENTITIES", "0", "INSERT", "8", name("L"), "2", name("B"), "10", "0", "20", "0", ...lineDxf(0, 0, 1, 1, emojiAtTheCut)],
        ]);

        // Act
        const drawing = read(text);
        const written = (): string => new Dxf().dxfCreate({ dxfPathsParts: drawing.parts });

        // Assert
        expect(drawing.parts.map(part => [part.layer, part.color])).toEqual([[name("L").slice(0, 255), "#ff0000"], ["e".repeat(254), "#000000"]]);
        expect(drawing.warnings).toEqual(["6 layer, block or line type names were longer than 255 characters, the most AutoCAD allows, and were cut to their first 255."]);
        expect(written).not.toThrow();
    });

    it("should leave out the copies of a block insert that names a missing block of 800,000 characters at once", () => {
        // Arrange
        const text = dxfOf([["BLOCKS", ...blockDxf("B", insertDxf("X".repeat(800_000)))], ["ENTITIES", ...insertDxf("B", 40_000)]]);

        // Act
        const drawing = read(text);

        // Assert
        expect(drawing.warnings).toEqual([
            `A block insert names the block "${"X".repeat(255)}", which the file does not define; it was left out.`,
            "1 layer, block or line type name was longer than 255 characters, the most AutoCAD allows, and was cut to its first 255.",
        ]);
    });
});

describe("reading a large DXF: warnings stay few however many kinds and names a file holds", () => {
    it("should name five kinds of entity it leaves out and count the rest in one warning", () => {
        // Arrange
        const text = entitiesDxf(Array.from({ length: 200_000 }, (_, at) => ["0", `T${at}`]).flat());

        // Act
        const drawing = read(text);

        // Assert
        expect(drawing.warnings).toEqual([
            ...[0, 1, 2, 3, 4].map(at => `1 T${at} entity was left out: only lines, arcs, circles, ellipses, polylines, splines and block inserts are drawn.`),
            "199995 more entities of 199995 other kinds were left out as well.",
        ]);
    });

    it("should name five blocks that inserts name and the file does not define, and count the rest in one warning", () => {
        // Arrange
        const text = entitiesDxf(Array.from({ length: 100_000 }, (_, at) => insertDxf(`U${at}`)).flat());

        // Act
        const drawing = read(text);

        // Assert
        expect(drawing.warnings).toEqual([
            ...[0, 1, 2, 3, 4].map(at => `A block insert names the block "U${at}", which the file does not define; it was left out.`),
            "Block inserts name 99995 more blocks the file does not define; they were left out.",
        ]);
    });

    it("should name five blocks that are external references and count the rest in one warning", () => {
        // Arrange
        const external = (name: string): string[] => ["0", "BLOCK", "2", name, "70", "4", "10", "0", "20", "0", "0", "ENDBLK"];
        const names = Array.from({ length: 7 }, (_, at) => `X${at}`);
        const text = dxfOf([["BLOCKS", ...names.flatMap(external)], ["ENTITIES", ...names.flatMap(name => insertDxf(name))]]);

        // Act
        const drawing = read(text);

        // Assert
        expect(drawing.warnings).toEqual([
            ...names.slice(0, 5).map(name => `The block "${name}" is an external reference to another file; it was left out.`),
            "2 more blocks are external references to another file; they were left out.",
        ]);
    });

    it("should read blocks, layers and line types named after what every JavaScript object carries, and change no object", () => {
        // Arrange
        const names = ["__proto__", "constructor", "hasOwnProperty"];
        const text = dxfOf([
            layerTableDxf(...names.map(name => ["2", name, "70", "0", "62", "5", "6", name])),
            ["BLOCKS", ...names.flatMap(name => blockDxf(name, lineDxf(0, 0, 1, 0, name), ["0", "LINE", "8", "0", "6", name, "10", "0", "20", "0", "11", "0", "21", "1"]))],
            ["ENTITIES", ...names.flatMap(name => insertDxf(name.toUpperCase())), ...insertDxf("toString")],
        ]);

        // Act
        const drawing = read(text);

        // Assert
        expect([pathCount(drawing), drawing.parts.map(part => part.layer), drawing.warnings]).toEqual([
            6,
            ["__proto__", "0", "constructor", "hasOwnProperty"],
            ["A block insert names the block \"toString\", which the file does not define; it was left out."],
        ]);
        expect([Object.getOwnPropertyNames(Object.prototype).sort(), Object.getPrototypeOf({}) === Object.prototype]).toEqual([
            ["__defineGetter__", "__defineSetter__", "__lookupGetter__", "__lookupSetter__", "__proto__", "constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf"],
            true,
        ]);
    });
});
