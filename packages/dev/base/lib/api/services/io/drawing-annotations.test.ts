import { describe, expect, it } from "vitest";
import * as Inputs from "../../inputs";
import { IoBitByBit } from "./io";

const io = new IoBitByBit();

describe("drawing texts and hatches as data", () => {

    it("should make a text with its defaults: 3.5 tall, placed by its start, level, at its natural width", () => {
        // Act
        const text = io.drawing.text({ text: "BRACKET", position: [20, 10] });

        // Assert
        expect(text).toEqual({ text: "BRACKET", position: [20, 10], height: 3.5, anchor: "start", rotation: 0, widthFactor: 1 });
    });

    it("should make a hatch with its defaults: single lines at 45 degrees, 3 apart", () => {
        // Arrange
        const boundaries = [{ segments: [{ center: [0, 0], radius: 5 }] }] as Inputs.IO.DrawingPathDto[];

        // Act
        const hatch = io.drawing.hatch({ boundaries });

        // Assert
        expect(hatch).toEqual({ boundaries, pattern: "ansi31", angle: 45, spacing: 3 });
    });

    it("should measure a text by its letters' advances, scaled by the height and the width factor, with the font's reach above and below", () => {
        // Act
        const letter = io.drawing.textSize({ text: "I", position: [0, 0], height: 21 });
        const word = io.drawing.textSize({ text: "IT I", position: [5, 5], height: 2.1, widthFactor: 0.5, rotation: 30, anchor: "end" });
        const space = io.drawing.textSize({ text: " ", position: [0, 0], height: 21 });

        // Assert
        expect(letter).toEqual({ width: 8, above: 25, below: 7 });
        expect(word.width).toBeCloseTo((8 + 16 + 16 + 8) * 0.1 * 0.5, 12);
        expect(word.above).toBeCloseTo(2.5, 12);
        expect(word.below).toBeCloseTo(0.7, 12);
        expect(space.width).toBe(16);
    });

    it("should measure an accented text as wide as the same text without accents", () => {
        // Act
        const accented = io.drawing.textSize({ text: "Ąžuolas Čiurlionytė", position: [0, 0] });
        const plain = io.drawing.textSize({ text: "Azuolas Ciurlionyte", position: [0, 0] });

        // Assert
        expect(accented.width).toBe(plain.width);
        expect(accented.width).toBeGreaterThan(0);
    });

    it("should give a text's strokes in the drawing's coordinates, placed, turned and narrowed", () => {
        // Act
        const upright = io.drawing.textStrokes({ text: "I", position: [10, 20], height: 21 });
        const raised = io.drawing.textStrokes({ text: "I", position: [10, 20, 7], height: 21, anchor: "middle" });
        const turned = io.drawing.textStrokes({ text: "I", position: [10, 20], height: 21, rotation: 90, widthFactor: 0.5 });

        // Assert
        expect(upright).toEqual([[[14, 41, 0], [14, 20, 0]]]);
        expect(raised).toEqual([[[10, 41, 7], [10, 20, 7]]]);
        expect(turned[0]![0]![0]).toBeCloseTo(-11, 12);
        expect(turned[0]![0]![1]).toBeCloseTo(22, 12);
        expect(turned[0]![1]![0]).toBeCloseTo(10, 12);
        expect(turned[0]![1]![1]).toBeCloseTo(22, 12);
    });

    it("should give a hatch's lines at its angle, its spacing apart, from side to side of the box around the region", () => {
        // Arrange
        const boundaries: Inputs.IO.DrawingPathDto[] = [{ segments: [{ points: [[0, 0], [10, 0], [10, 10], [0, 10]], closed: true }] }];

        // Act
        const level = io.drawing.hatchLines({ boundaries, angle: 0, spacing: 4 });
        const paired = io.drawing.hatchLines({ boundaries, angle: 0, spacing: 4, pattern: Inputs.IO.hatchPatternEnum.ansi32 });
        const crossed = io.drawing.hatchLines({ boundaries, angle: 0, spacing: 4, pattern: Inputs.IO.hatchPatternEnum.ansi37 });
        const solid = io.drawing.hatchLines({ boundaries, pattern: Inputs.IO.hatchPatternEnum.solid });
        const rounded = (lines: Inputs.Base.Segment2[]): number[][] => lines.map(line => line.flat().map(value => Math.round(value * 1e9) / 1e9 + 0));

        // Assert
        expect(rounded(level)).toEqual([[0, 2, 10, 2], [0, 6, 10, 6], [0, 10, 10, 10]]);
        expect(rounded(paired)).toEqual([[0, 2, 10, 2], [0, 6, 10, 6], [0, 10, 10, 10], [0, 0.666666667, 10, 0.666666667], [0, 4.666666667, 10, 4.666666667], [0, 8.666666667, 10, 8.666666667]]);
        expect(rounded(crossed)).toEqual([[0, 2, 10, 2], [0, 6, 10, 6], [0, 10, 10, 10], [10, 0, 10, 10], [6, 0, 6, 10], [2, 0, 2, 10]]);
        expect(solid).toEqual([]);
    });

    it("should lean a hatch's lines over the whole box, each line reaching past the region it will be clipped to", () => {
        // Arrange
        const boundaries: Inputs.IO.DrawingPathDto[] = [{ segments: [{ center: [0, 0], radius: 5 }] }];
        const lean = Math.SQRT1_2;

        // Act
        const lines = io.drawing.hatchLines({ boundaries, angle: 45, spacing: 3 });
        const offsets = lines.map(line => (line[0][1] - line[0][0]) * lean);
        const lengths = lines.map(line => Math.hypot(line[1][0] - line[0][0], line[1][1] - line[0][1]));

        // Assert
        expect(offsets.map(offset => Math.round(offset * 1e9) / 1e9)).toEqual([-4.5, -1.5, 1.5, 4.5]);
        expect(lengths.every(length => Math.abs(length - 10 * Math.SQRT2) < 1e-9)).toBe(true);
        expect(lines.every(line => Math.abs((line[1][1] - line[0][1]) - (line[1][0] - line[0][0])) < 1e-9)).toBe(true);
    });

    it("should refuse a hatch whose spacing would take more lines than a drawing holds, and one without a region", () => {
        // Arrange
        const boundaries: Inputs.IO.DrawingPathDto[] = [{ segments: [{ points: [[0, 0], [1000, 0], [1000, 1000], [0, 1000]], closed: true }] }];

        // Act
        const fine = (): Inputs.Base.Segment2[] => io.drawing.hatchLines({ boundaries, spacing: 0.001 });
        const empty = (): Inputs.Base.Segment2[] => io.drawing.hatchLines({ boundaries: [] });

        // Assert
        expect(fine).toThrow("`spacing` is 0.001 for a region that would take more than 200000 lines: widen the spacing.");
        expect(empty).toThrow("`boundaries` must be a list of at least one path.");
    });

    it("should refuse to measure or draw a text that is not one line, naming the property", () => {
        // Act
        const measured = (): Inputs.IO.DrawingTextSizeDto => io.drawing.textSize({ text: "A\nB", position: [0, 0] });
        const drawn = (): Inputs.Base.Point3[][] => io.drawing.textStrokes({ text: "A", position: [0, 0], height: -1 });

        // Assert
        expect(measured).toThrow("`text` holds a line break or another control character; a text is one line.");
        expect(drawn).toThrow("`height` must be above 0; it is -1.");
    });

    it("should refuse a control character of either range, and draw a line separator as one question mark and a character beyond the font's plane as two", () => {
        // Arrange
        const sizeOf = (text: string): number => io.drawing.textSize({ text, position: [0, 0], height: 21 }).width;

        // Act
        const refusals = ["A\u0085B", "A\u0080", "A\u009F", "\u0000"].map(text => (): number => sizeOf(text));

        // Assert
        refusals.forEach(refusal => expect(refusal).toThrow("`text` holds a line break or another control character; a text is one line."));
        expect(sizeOf("\u{1F600}")).toBe(2 * sizeOf("?"));
        expect(io.drawing.textStrokes({ text: " ", position: [0, 0], height: 21 })).toEqual(io.drawing.textStrokes({ text: "?", position: [0, 0], height: 21 }));
    });

    it("should refuse an anchor named after what every JavaScript object carries, as any anchor it does not know", () => {
        // Arrange
        const anchors = ["constructor", "__proto__", "toString", "valueOf", "bogus"];

        // Act
        const refusals = anchors.map(anchor => (): Inputs.Base.Point3[][] => io.drawing.textStrokes({ text: "I", position: [0, 0], height: 21, anchor: anchor as Inputs.IO.DrawingTextDto["anchor"] }));

        // Assert
        refusals.forEach(refusal => expect(refusal).toThrow("`anchor` must be one of start, middle, end."));
    });

    it("should build a part with its texts and hatches through the constructor, and measure a text without a position", () => {
        // Arrange
        const text = new Inputs.IO.DrawingTextDto("I", [0, 0], 21);
        const hatch = new Inputs.IO.DrawingHatchDto([{ segments: [{ center: [0, 0], radius: 5 }] }]);

        // Act
        const part = new Inputs.IO.DrawingPartDto("notes", "#ff0000", [], Inputs.IO.lineTypeEnum.continuous, 0.35, [text], [hatch]);
        const size = io.drawing.textSize({ text: "I", height: 21 } as Inputs.IO.DrawingTextDto);

        // Assert
        expect([part.layer, part.lineWeight, part.texts, part.hatches]).toEqual(["notes", 0.35, [text], [hatch]]);
        expect(size).toEqual({ width: 8, above: 25, below: 7 });
    });

    it("should put every pattern's lines at the same offsets in its lines, in the DXF definition lines and in the SVG pattern", () => {
        // Arrange
        const spacing = 4;
        const angle = 30;
        const boundaries: Inputs.IO.DrawingPathDto[] = [{ segments: [{ points: [[0, 0], [20, 0], [20, 20], [0, 20]], closed: true }] }];
        const within = (value: number, turn: number): number => Math.round((((value % turn) + turn) % turn) * 1e6) % Math.round(turn * 1e6) / 1e6;
        const family = (lineAngle: number, offset: number): string => `${within(lineAngle, 360)} ${within(offset, spacing)}`;
        const acrossOf = (degrees: number): Inputs.Base.Point2 => [-Math.sin(degrees * Math.PI / 180), Math.cos(degrees * Math.PI / 180)];
        const offsetOf = (point: Inputs.Base.Point2, degrees: number): number => point[0] * acrossOf(degrees)[0] + point[1] * acrossOf(degrees)[1];
        const patterns = [Inputs.IO.hatchPatternEnum.ansi31, Inputs.IO.hatchPatternEnum.ansi32, Inputs.IO.hatchPatternEnum.ansi37];

        // Act
        const found = patterns.map(pattern => {
            const hatch: Inputs.IO.DrawingHatchDto = { boundaries, pattern, angle, spacing };
            const lines = io.drawing.hatchLines(hatch).map(([start, end]) => {
                const degrees = Math.atan2(end[1] - start[1], end[0] - start[0]) * 180 / Math.PI;
                return family(degrees, offsetOf(start, degrees));
            });
            const dxfLines = io.dxf.dxfCreate({ dxfPathsParts: [{ paths: [], hatches: [hatch] }] }).split("\n").map(line => line.trim());
            const definitions = dxfLines.flatMap((code, at) => code === "53" && at % 2 === 0 ? [[Number(dxfLines[at + 1]), Number(dxfLines[at + 3]), Number(dxfLines[at + 5])]] : [])
                .map(([lineAngle, x, y]) => family(lineAngle!, offsetOf([x!, y!], lineAngle!)));
            const svgLines = [...io.svg.svgCreate({ parts: [{ paths: [], hatches: [hatch] }] }).matchAll(/<line x1="([^"]*)" y1="([^"]*)" x2="([^"]*)" y2="([^"]*)"/g)]
                .map(([, x1, y1, x2]) => x1 === x2 ? family(angle + 90, -Number(x1)) : family(angle, -Number(y1)));
            return [[...new Set(lines)].sort(), [...new Set(definitions)].sort(), [...new Set(svgLines)].sort()];
        });

        // Assert
        found.forEach(([lines, definitions, svgLines]) => {
            expect(definitions).toEqual(lines);
            expect(svgLines).toEqual(lines);
        });
        expect(found.map(([lines]) => lines!.length)).toEqual([1, 2, 2]);
    });
});
