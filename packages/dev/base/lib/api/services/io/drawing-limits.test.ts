import { describe, expect, it } from "vitest";
import { InputError } from "../../kernel-calls";
import { blockDxf, dxfOf, insertDxf, lineDxf } from "../helpers/files/__test__/dxf-builders";
import { segmentsOfParts } from "../helpers/files/__test__/drawing-samples";
import { IoBitByBit } from "./io";
import { Svg } from "./svg";

const LARGE_INPUT_TIMEOUT = 30_000;
const NS = "xmlns=\"http://www.w3.org/2000/svg\"";
const drawing = new IoBitByBit().drawing;
const svg = new Svg();

const placedAMillionTimes = (target: string): string => {
    const levels = Array.from({ length: 6 }, (_, k) => `<g id="l${k + 1}">${`<use href="#l${k}"/>`.repeat(10)}</g>`);
    return `<svg ${NS}><defs><g id="l0">${target}</g>${levels.join("")}</defs><use href="#l6"/></svg>`;
};

const SEGMENTS_WARNING = "The SVG holds more than 25000 path segments once its <use> references are expanded, more than the importer builds from a file of its size; the rest is not imported.";

describe("svgRead, svgToDxf and dxfToSvg on large files", () => {
    it("should read a path placed a million times only up to the segments a file of its size may build, and say so", () => {
        // Act
        const read = svg.svgRead({ svg: placedAMillionTimes("<path d=\"M0 0 L1 1\"/>") });

        // Assert
        expect(segmentsOfParts(read.parts)).toHaveLength(25_000);
        expect(read.warnings).toEqual([SEGMENTS_WARNING]);
    }, LARGE_INPUT_TIMEOUT);

    it("should convert such a file into the DXF of what was read, with the same warning", () => {
        // Act
        const converted = drawing.svgToDxf({ svg: placedAMillionTimes("<circle r=\"1\"/>") });

        // Assert
        expect(converted.warnings).toEqual([SEGMENTS_WARNING]);
        expect(converted.dxf.split("\nCIRCLE\n")).toHaveLength(12_501);
    }, LARGE_INPUT_TIMEOUT);

    it("should convert a DXF whose inserts expand past the reader's limit into the SVG of what was read, saying what was left out", () => {
        // Arrange
        const file = dxfOf([["BLOCKS", ...blockDxf("DOT", lineDxf(0, 0, 1, 0))], ["ENTITIES", ...insertDxf("DOT", 1000, 1000), ...lineDxf(0, 5, 10, 5)]]);

        // Act
        const converted = drawing.dxfToSvg({ dxf: file });

        // Assert
        expect(converted.warnings).toEqual([expect.stringMatching(/^1 block insert was left out: /)]);
        expect(segmentsOfParts(svg.svgRead({ svg: converted.svg }).parts)).toEqual([{ start: [0, 5, 0], end: [10, 5, 0] }]);
    }, LARGE_INPUT_TIMEOUT);

    it("should read a hundred thousand line path in one pass", () => {
        // Arrange
        const file = `<svg ${NS}><path d="M0 0${" l1 0".repeat(100_000)}"/></svg>`;

        // Act
        const read = svg.svgRead({ svg: file });

        // Assert
        expect(segmentsOfParts(read.parts)).toHaveLength(100_000);
        expect(read.warnings).toEqual([]);
    }, LARGE_INPUT_TIMEOUT);
});

describe("svgRead, svgToDxf and dxfToSvg on malformed files", () => {
    it("should refuse an SVG nested deeper than the reader reads, and its entities that expand past the limit, as input errors", () => {
        // Arrange
        const deep = `<svg ${NS}>${"<g>".repeat(300)}<path d="M0 0 L1 0"/>${"</g>".repeat(300)}</svg>`;
        const expanding = `<!DOCTYPE svg [<!ENTITY a "${"l1 1 1 -1 ".repeat(10)}"><!ENTITY b "${"&a;".repeat(10)}"><!ENTITY c "${"&b;".repeat(10)}">]><svg ${NS}><path d="M0 0 ${"&c;".repeat(10)}"/></svg>`;

        // Act & Assert
        expect(() => svg.svgRead({ svg: deep })).toThrow(InputError);
        expect(() => drawing.svgToDxf({ svg: expanding })).toThrow(InputError);
    });

    it("should read what it can of broken markup and path data without throwing", () => {
        // Arrange
        const broken = `<svg ${NS}><path d="M0 0 L10 0 L x"/><path d="M0 1 L1 1" stroke="rgb(1,2)"/><g transform="rotate(oops)"><path d="M0 2 L1 2"/></g><path d="M0 3 L1`;

        // Act
        const read = svg.svgRead({ svg: broken });

        // Assert
        expect(segmentsOfParts(read.parts)).toEqual([
            { start: [0, 0, 0], end: [10, 0, 0] },
            { start: [0, -1, 0], end: [1, -1, 0] },
            { start: [0, -2, 0], end: [1, -2, 0] },
        ]);
        expect(read.warnings).toEqual([
            "A transform could not be read (`rotate(oops)`) and is ignored, as a browser ignores it.",
            "1 element is painted with a gradient, a pattern or a color other than a hex, rgb() or named color; it was read as black.",
        ]);
    });

    it("should refuse a DXF that is not one, naming its input", () => {
        // Act & Assert
        expect(() => drawing.dxfToSvg({ dxf: "not a drawing" })).toThrow(InputError);
        expect(() => drawing.dxfToSvg({ dxf: dxfOf([["HEADER"]]) })).toThrow(new InputError("`dxf` has no ENTITIES section, so it is not a DXF drawing.", "dxf"));
    });
});
