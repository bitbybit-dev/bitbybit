import { describe, expect, it } from "vitest";
import * as Inputs from "../../inputs";
import { Dxf } from "./dxf";

type Pair = readonly [string, string];

const dxf = new Dxf();

const square: Inputs.IO.DrawingPolylineSegmentDto = { points: [[0, 0], [40, 0], [40, 30], [0, 30]], closed: true };
const hole: Inputs.IO.DrawingCircleSegmentDto = { center: [20, 15], radius: 6 };

const entitiesOf = (file: string, kind: string): Pair[][] => {
    const lines = file.split("\n");
    const from = lines.indexOf("ENTITIES");
    const found: Pair[][] = [];
    let open: Pair[] | undefined;
    for (let at = from + 1; at + 1 < lines.length; at += 2) {
        const pair: Pair = [lines[at]!.trim(), lines[at + 1]!];
        if (pair[0] === "0") {
            open = pair[1] === kind ? [] : undefined;
            if (open !== undefined) {
                found.push(open);
            }
            if (pair[1] === "ENDSEC") {
                break;
            }
            continue;
        }
        open?.push(pair);
    }
    return found;
};

const valuesOf = (entity: readonly Pair[], ...codes: string[]): string[] => entity.filter(([code]) => codes.includes(code)).map(([, value]) => value);

const numbersOf = (entity: readonly Pair[], ...codes: string[]): number[] => valuesOf(entity, ...codes).map(Number);

const rounded = (values: readonly number[]): number[] => values.map(value => Math.round(value * 1e9) / 1e9 + 0);

const textOf = (text: Partial<Inputs.IO.DrawingTextDto>, acadVersion: "AC1009" | "AC1015" = "AC1015"): Pair[] =>
    entitiesOf(dxf.dxfCreate({ dxfPathsParts: [{ layer: "notes", paths: [], texts: [{ text: "I", position: [10, 20], height: 21, ...text }] }], acadVersion }), "TEXT")[0]!;

const hatchOf = (hatch: Partial<Inputs.IO.DrawingHatchDto>): Pair[] =>
    entitiesOf(dxf.dxfCreate({ dxfPathsParts: [{ layer: "cut", paths: [], hatches: [{ boundaries: [{ segments: [square] }], ...hatch }] }] }), "HATCH")[0]!;

describe("texts, hatches and line weights in a DXF drawing", () => {

    it("should write a text as a text entity fitted between the ends of its baseline, at its height, in the standard style", () => {
        // Act
        const text = textOf({});

        // Assert
        expect(text.filter(([code]) => !["5", "330"].includes(code))).toEqual([
            ["100", "AcDbEntity"], ["8", "notes"], ["62", "7"], ["100", "AcDbText"],
            ["10", "10.0"], ["20", "20.0"], ["30", "0.0"], ["40", "21.0"], ["1", "I"], ["7", "Standard"], ["72", "5"],
            ["11", "18.0"], ["21", "20.0"], ["31", "0.0"], ["100", "AcDbText"], ["73", "0"],
        ]);
    });

    it("should fit a text by its anchor, its angle and its width factor", () => {
        // Act
        const end = textOf({ anchor: "end" });
        const turned = textOf({ rotation: 90 });
        const narrow = textOf({ widthFactor: 0.5, anchor: "middle" });
        const backwards = textOf({ rotation: -90 });

        // Assert
        expect(numbersOf(end, "10", "20", "11", "21")).toEqual([2, 20, 10, 20]);
        expect(numbersOf(turned, "10", "20", "50")).toEqual([10, 20, 90]);
        expect(numbersOf(turned, "11")[0]).toBeCloseTo(10, 12);
        expect(numbersOf(turned, "21")[0]).toBeCloseTo(28, 12);
        expect(numbersOf(narrow, "10", "41", "11")).toEqual([8, 0.5, 12]);
        expect(valuesOf(backwards, "50")).toEqual(["270.0"]);
        expect(valuesOf(end, "50", "41")).toEqual([]);
    });

    it("should write a text's letters beyond ASCII as their codes and keep a caret and a doubled percent sign as themselves", () => {
        // Act
        const text = textOf({ text: "Ø 20° Č ^ 5%% 10%" });

        // Assert
        expect(valuesOf(text, "1")).toEqual(["\\U+00D8 20\\U+00B0 \\U+010C ^  5%%%%%% 10%"]);
    });

    it("should write a backslash that starts a code AutoCAD reads as a character as its own code, keep every other one, and read the text back as it was", () => {
        // Arrange
        const value = "C:\\U+0041\\x \\M+1 \\";

        // Act
        const text = textOf({ text: value });
        const back = dxf.dxfRead({ dxf: dxf.dxfCreate({ dxfPathsParts: [{ paths: [], texts: [{ text: value, position: [0, 0] }] }] }) });

        // Assert
        expect(valuesOf(text, "1")).toEqual(["C:\\U+005CU+0041\\x \\U+005CM+1 \\"]);
        expect(back.parts[0]!.texts!.map(read => read.text)).toEqual([value]);
    });

    it("should leave out a text that draws nothing, keeping the file's extents to what it draws", () => {
        // Arrange
        const part: Inputs.IO.DrawingPartDto = { paths: [{ segments: [hole] }] };

        // Act
        const blank = dxf.dxfCreate({ dxfPathsParts: [{ ...part, texts: [{ text: "   ", position: [500, 500] }, { text: "", position: [-500, -500] }] }] });

        // Assert
        expect(blank).toBe(dxf.dxfCreate({ dxfPathsParts: [part] }));
    });

    it("should write a text in an R12 file without the markers and handles R12 lacks, and leave an empty text out", () => {
        // Act
        const text = textOf({}, "AC1009");
        const none = entitiesOf(dxf.dxfCreate({ dxfPathsParts: [{ paths: [{ segments: [hole] }], texts: [{ text: "", position: [0, 0] }] }] }), "TEXT");

        // Assert
        expect(text.map(([code]) => code)).toEqual(["8", "62", "10", "20", "30", "40", "1", "7", "72", "11", "21", "31"]);
        expect(none).toEqual([]);
    });

    it("should write a hatch as one region of closed boundaries, a circle as two half turns, filled with lines at its angle and spacing", () => {
        // Arrange
        const lean = Math.SQRT1_2 * 3;

        // Act
        const hatch = hatchOf({ boundaries: [{ segments: [square] }, { segments: [hole] }] });

        // Assert
        expect(valuesOf(hatch, "2", "70", "71", "91", "75", "76", "77", "78", "98")).toEqual(["ANSI31", "0", "0", "2", "0", "1", "0", "1", "1"]);
        expect(valuesOf(hatch, "92", "72", "73", "93", "97")).toEqual(["3", "0", "1", "4", "0", "3", "1", "1", "2", "0"]);
        expect(numbersOf(hatch, "10").slice(1, 7)).toEqual([0, 40, 40, 0, 26, 14]);
        expect(numbersOf(hatch, "20").slice(1, 7)).toEqual([0, 0, 30, 30, 15, 15]);
        expect(numbersOf(hatch, "42").map(bulge => Math.round(bulge * 1e12) / 1e12)).toEqual([1, 1]);
        expect(numbersOf(hatch, "52", "53")).toEqual([0, 45]);
        expect(numbersOf(hatch, "41")[0]).toBeCloseTo(3 / 3.175, 12);
        expect(rounded(numbersOf(hatch, "45", "46"))).toEqual(rounded([-lean, lean]));
        expect(rounded(numbersOf(hatch, "43", "44"))).toEqual(rounded([-lean / 2, lean / 2]));
    });

    it("should fill a hatch with solid ink, with paired lines or with crossed lines", () => {
        // Act
        const solid = hatchOf({ pattern: Inputs.IO.hatchPatternEnum.solid });
        const paired = hatchOf({ pattern: Inputs.IO.hatchPatternEnum.ansi32, angle: 0, spacing: 4 });
        const crossed = hatchOf({ pattern: Inputs.IO.hatchPatternEnum.ansi37, angle: 0, spacing: 2 });

        // Assert
        expect(valuesOf(solid, "2", "70", "52", "78", "53")).toEqual(["SOLID", "1"]);
        expect(valuesOf(paired, "2", "70", "78")).toEqual(["ANSI32", "0", "2"]);
        expect(rounded(numbersOf(paired, "52", "53", "43", "44", "45", "46"))).toEqual([315, 0, 0, 2, 0, 4, 0, 0, 0.666666667, 0, 4]);
        expect(numbersOf(paired, "41")[0]).toBeCloseTo(4 / 9.525, 12);
        expect(valuesOf(crossed, "2", "78")).toEqual(["ANSI37", "2"]);
        expect(numbersOf(crossed, "53")).toEqual([0, 90]);
        expect(rounded(numbersOf(crossed, "45", "46"))).toEqual([0, 2, -2, 0]);
    });

    it("should scale a named pattern against acad.pat in an inch drawing and against acadiso.pat in any other, so its name and scale rebuild the lines it holds", () => {
        // Arrange
        const boundaries = [{ segments: [square] }];
        const hatches: Inputs.IO.DrawingHatchDto[] = [
            { boundaries, spacing: 3 },
            { boundaries, pattern: Inputs.IO.hatchPatternEnum.ansi32, spacing: 4 },
            { boundaries, pattern: Inputs.IO.hatchPatternEnum.ansi37, spacing: 2 },
        ];
        const written = (unit?: Inputs.Base.unitOfLengthEnum): Pair[][] => entitiesOf(dxf.dxfCreate({ dxfPathsParts: [{ paths: [], hatches }], unit }), "HATCH");
        const scales = (unit?: Inputs.Base.unitOfLengthEnum): number[] => written(unit).map(hatch => numbersOf(hatch, "41")[0]!);
        const offsetOfFirstLine = (unit?: Inputs.Base.unitOfLengthEnum): number => Math.hypot(...numbersOf(written(unit)[0]!, "45", "46"));
        const units = Inputs.Base.unitOfLengthEnum;

        // Act
        const inches = scales(units.inch);
        const metric = [units.millimetre, units.centimetre, units.metre, undefined].map(scales);

        // Assert
        expect(inches).toEqual([3 / 0.125, 4 / 0.375, 2 / 0.125]);
        expect(metric).toEqual(Array.from({ length: 4 }, () => [3 / 3.175, 4 / 9.525, 2 / 3.175]));
        expect(inches[0]! * 0.125).toBeCloseTo(offsetOfFirstLine(units.inch), 12);
        expect(metric[0]![0]! * 3.175).toBeCloseTo(offsetOfFirstLine(units.millimetre), 12);
    });

    it("should join the segments of a boundary into one loop, turning the ones drawn the other way, an arc as a bulge", () => {
        // Arrange
        const segments: Inputs.IO.DrawingPathDto["segments"] = [
            { start: [0, 0], end: [10, 0] },
            { center: [10, 5], radius: 5, startAngle: -90, endAngle: 90 },
            { start: [0, 10], end: [10, 10] },
            { start: [0, 10], end: [0, 0] },
        ];

        // Act
        const hatch = hatchOf({ boundaries: [{ segments }] });

        // Assert
        expect(valuesOf(hatch, "91", "93", "72")).toEqual(["1", "1", "4"]);
        expect(numbersOf(hatch, "10").slice(1, 5).map(Math.round)).toEqual([0, 10, 10, 0]);
        expect(numbersOf(hatch, "20").slice(1, 5).map(Math.round)).toEqual([0, 0, 10, 10]);
        expect(numbersOf(hatch, "42").map(bulge => Math.round(bulge * 1e12) / 1e12)).toEqual([0, 1, 0, 0]);
    });

    it("should close a boundary whose ends do not meet with a straight side, and bound an ellipse by points within the tolerance", () => {
        // Arrange
        const open: Inputs.IO.DrawingPathDto = { segments: [{ points: [[0, 0], [10, 0], [10, 10]] }] };
        const oval: Inputs.IO.DrawingPathDto = { segments: [{ center: [0, 0], majorAxis: [10, 0], ratio: 0.5 }] };

        // Act
        const triangle = hatchOf({ boundaries: [open] });
        const ellipse = hatchOf({ boundaries: [oval] });
        const xs = numbersOf(ellipse, "10").slice(1, -1);
        const ys = numbersOf(ellipse, "20").slice(1, -1);

        // Assert
        expect(valuesOf(triangle, "93", "73")).toEqual(["1", "3"]);
        expect(xs.length).toBeGreaterThan(16);
        expect(Math.max(...xs.map((x, at) => Math.abs((x / 10) ** 2 + (ys[at]! / 5) ** 2 - 1)))).toBeLessThan(1e-9);
    });

    it("should refuse a hatch in an R12 file, which has no entity for one", () => {
        // Act
        const write = (): string => dxf.dxfCreate({ dxfPathsParts: [{ paths: [], hatches: [{ boundaries: [{ segments: [square] }] }] }], acadVersion: "AC1009" });

        // Assert
        expect(write).toThrow("`dxfPathsParts[0].hatches` holds a hatch, which an AC1009 (R12) file has no entity for: write AC1015.");
    });

    it("should give a part's entities the nearest standard lineweight to its line width in millimetres, and none in an R12 file", () => {
        // Arrange
        const parts = (lineWeight: number): Inputs.IO.DrawingPartDto[] => [{ paths: [{ segments: [hole] }], texts: [{ text: "I", position: [0, 0] }], lineWeight }];

        // Act
        const half = dxf.dxfCreate({ dxfPathsParts: parts(0.5) });
        const third = dxf.dxfCreate({ dxfPathsParts: parts(0.33) });
        const inches = dxf.dxfCreate({ dxfPathsParts: parts(0.01), unit: Inputs.Base.unitOfLengthEnum.inch });
        const widest = dxf.dxfCreate({ dxfPathsParts: parts(9) });
        const old = dxf.dxfCreate({ dxfPathsParts: parts(0.5), acadVersion: "AC1009" });
        const plain = dxf.dxfCreate({ dxfPathsParts: [{ paths: [{ segments: [hole] }] }] });

        // Assert
        expect([half, third, inches, widest].map(file => [...valuesOf(entitiesOf(file, "CIRCLE")[0]!, "370"), ...valuesOf(entitiesOf(file, "TEXT")[0]!, "370")])).toEqual([["50", "50"], ["35", "35"], ["25", "25"], ["211", "211"]]);
        expect(valuesOf(entitiesOf(old, "CIRCLE")[0]!, "370")).toEqual([]);
        expect(valuesOf(entitiesOf(plain, "CIRCLE")[0]!, "370")).toEqual([]);
    });

    it("should take the length of a dash from the scale given", () => {
        // Act
        const file = dxf.dxfCreate({ dxfPathsParts: [{ lineType: Inputs.IO.lineTypeEnum.hidden, paths: [{ segments: [square] }] }], lineTypeScale: 1.5 });
        const lines = file.split("\n");
        const record = lines.slice(lines.indexOf("HIDDEN") + 1, lines.indexOf("HIDDEN") + 25);

        // Assert
        expect(record.filter((_, at) => at % 2 === 1 && ["40", "49"].includes(record[at - 1]!.trim()))).toEqual(["4.5", "3.0", "-1.5"]);
        expect(() => dxf.dxfCreate({ dxfPathsParts: [], lineTypeScale: 0 })).toThrow("lineTypeScale");
    });
});
