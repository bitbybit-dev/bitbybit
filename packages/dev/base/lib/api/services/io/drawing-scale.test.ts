import { describe, expect, it } from "vitest";
import * as Inputs from "../../inputs";
import { InputError } from "../../kernel-calls";
import { farthestApart, pointsAlong, segmentsOfParts } from "../helpers/files/__test__/drawing-samples";
import { IoBitByBit } from "./io";

const io = new IoBitByBit();
const INCH = 25.4;
const ROUNDING = 1e-9;

const DRAWING: Inputs.IO.DrawingPartDto[] = [
    {
        layer: "cut",
        color: "#ff0000",
        lineWeight: 0.5,
        paths: [
            { segments: [{ start: [0, 0], end: [80, 0] }, { center: [80, 10], radius: 10, startAngle: 270, endAngle: 360 }] },
            { segments: [{ center: [40, 30], radius: 12 }] },
            { segments: [{ points: [[0, 40], [10, 40], [10, 50]], bulges: [0.5, 0, 0], closed: false }] },
            { segments: [{ controlPoints: [[0, 60], [10, 70], [20, 55], [30, 65]], degree: 3, knots: [0, 0, 0, 0, 1, 1, 1, 1], weights: [1, 2, 1, 1] }] },
            { segments: [{ center: [60, 50], majorAxis: [10, 6], ratio: 0.5, startParameter: 1, endParameter: 4 }] },
            { segments: [{ center: [90, 40, 5], radius: 4, normal: [0, 1, 0] }] },
        ],
        texts: [{ text: "PLATE", position: [10, 20], height: 5, rotation: 30, widthFactor: 0.8, anchor: "start" }],
        hatches: [{ boundaries: [{ segments: [{ center: [40, 30], radius: 12 }] }], pattern: Inputs.IO.hatchPatternEnum.ansi37, angle: 30, spacing: 2 }],
    },
    { layer: "notes", paths: [], texts: [{ text: "R12", position: [40, 30] }], hatches: [{ boundaries: [{ segments: [{ points: [[0, 0], [5, 0], [5, 5]] }] }] }] },
];

const BY_HAND_IN_INCHES: Inputs.IO.DrawingPartDto[] = [
    {
        layer: "cut",
        color: "#ff0000",
        paths: [
            { segments: [{ start: [0, 0], end: [80 / INCH, 0] }, { center: [80 / INCH, 10 / INCH], radius: 10 / INCH, startAngle: 270, endAngle: 360 }] },
            { segments: [{ center: [40 / INCH, 30 / INCH], radius: 12 / INCH }] },
            { segments: [{ points: [[0, 40 / INCH], [10 / INCH, 40 / INCH], [10 / INCH, 50 / INCH]], bulges: [0.5, 0, 0], closed: false }] },
            { segments: [{ controlPoints: [[0, 60 / INCH], [10 / INCH, 70 / INCH], [20 / INCH, 55 / INCH], [30 / INCH, 65 / INCH]], degree: 3, knots: [0, 0, 0, 0, 1, 1, 1, 1], weights: [1, 2, 1, 1] }] },
            { segments: [{ center: [60 / INCH, 50 / INCH], majorAxis: [10 / INCH, 6 / INCH], ratio: 0.5, startParameter: 1, endParameter: 4 }] },
            { segments: [{ center: [90 / INCH, 40 / INCH, 5 / INCH], radius: 4 / INCH, normal: [0, 1, 0] }] },
        ],
    },
];

const rounded = (value: unknown): unknown => {
    if (typeof value === "number") {
        return Math.round(value / ROUNDING) * ROUNDING + 0;
    }
    if (Array.isArray(value)) {
        return value.map(rounded);
    }
    if (typeof value === "object" && value !== null) {
        return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, rounded(entry)]));
    }
    return value;
};

const frozen = <T>(value: T): T => {
    if (typeof value === "object" && value !== null) {
        Object.values(value).forEach(frozen);
        Object.freeze(value);
    }
    return value;
};

const pairsOf = (file: string, kind: string): string[][] => {
    const lines = file.split("\n");
    const found: string[][] = [];
    let open: string[] | undefined;
    for (let at = lines.indexOf("ENTITIES") + 1; at + 1 < lines.length; at += 2) {
        if (lines[at] === "0") {
            open = lines[at + 1] === kind ? [] : undefined;
            found.push(...(open === undefined ? [] : [open]));
        } else {
            open?.push(`${lines[at]!} ${lines[at + 1]!}`);
        }
    }
    return found;
};

describe("io.drawing.scaleParts", () => {

    it("should give back the drawing it was given, within rounding, when scaled by 25.4 and then by 1/25.4", () => {
        // Act
        const there = io.drawing.scaleParts({ parts: DRAWING, factor: INCH });
        const back = io.drawing.scaleParts({ parts: there, factor: 1 / INCH });

        // Assert
        const defaultsFilledIn = { ...DRAWING[1]!, texts: [{ text: "R12", position: [40, 30], height: 3.5 }], hatches: [{ ...DRAWING[1]!.hatches![0]!, spacing: 3 }] };
        expect(rounded(back)).toEqual(rounded([DRAWING[0], defaultsFilledIn]));
        expect(rounded(there[0]!.paths[0]!.segments[0])).toEqual(rounded({ start: [0, 0], end: [80 * INCH, 0] }));
    });

    it("should scale every point, radius and axis of every kind of segment, each text's position and height, each hatch's boundaries and spacing and each part's line weight, and nothing else", () => {
        // Act
        const [cut, notes] = io.drawing.scaleParts({ parts: DRAWING, factor: 2 });

        // Assert
        expect(cut!.paths.map(path => path.segments)).toEqual([
            [{ start: [0, 0], end: [160, 0] }, { center: [160, 20], radius: 20, startAngle: 270, endAngle: 360 }],
            [{ center: [80, 60], radius: 24 }],
            [{ points: [[0, 80], [20, 80], [20, 100]], bulges: [0.5, 0, 0], closed: false }],
            [{ controlPoints: [[0, 120], [20, 140], [40, 110], [60, 130]], degree: 3, knots: [0, 0, 0, 0, 1, 1, 1, 1], weights: [1, 2, 1, 1] }],
            [{ center: [120, 100], majorAxis: [20, 12], ratio: 0.5, startParameter: 1, endParameter: 4 }],
            [{ center: [180, 80, 10], radius: 8, normal: [0, 1, 0] }],
        ]);
        expect([cut!.layer, cut!.color, cut!.lineWeight]).toEqual(["cut", "#ff0000", 1]);
        expect(cut!.texts).toEqual([{ text: "PLATE", position: [20, 40], height: 10, rotation: 30, widthFactor: 0.8, anchor: "start" }]);
        expect(cut!.hatches).toEqual([{ boundaries: [{ segments: [{ center: [80, 60], radius: 24 }] }], pattern: "ansi37", angle: 30, spacing: 4 }]);
        expect(notes).toEqual({ layer: "notes", paths: [], texts: [{ text: "R12", position: [80, 60], height: 7 }], hatches: [{ boundaries: [{ segments: [{ points: [[0, 0], [10, 0], [10, 10]] }] }], spacing: 6 }] });
        expect(Object.keys(notes!)).not.toContain("lineWeight");
    });

    it("should write a drawing scaled into inches as the DXF that reads back as the drawing scaled by hand, its line weight and hatch scale unchanged on paper", () => {
        // Act
        const inches = io.drawing.scaleParts({ parts: [DRAWING[0]!], factor: 1 / INCH });
        const file = io.dxf.dxfCreate({ dxfPathsParts: inches, unit: Inputs.Base.unitOfLengthEnum.inch });
        const millimetres = io.dxf.dxfCreate({ dxfPathsParts: [DRAWING[0]!], unit: Inputs.Base.unitOfLengthEnum.millimetre });
        const read = io.dxf.dxfRead({ dxf: file });
        const [text] = read.parts.flatMap(part => part.texts ?? []);
        const [hatch] = read.parts.flatMap(part => part.hatches ?? []);
        const segments = segmentsOfParts(read.parts);
        const expected = segmentsOfParts(BY_HAND_IN_INCHES);

        // Assert
        expect(read.unit).toBe(Inputs.Base.unitOfLengthEnum.inch);
        expect(read.warnings).toEqual([]);
        expect(segments).toHaveLength(expected.length);
        segments.forEach((segment, at) => expect(farthestApart(pointsAlong(segment), pointsAlong(expected[at]!))).toBeLessThan(ROUNDING));
        expect(rounded([text!.position, text!.height, text!.rotation])).toEqual(rounded([[10 / INCH, 20 / INCH, 0], 5 / INCH, 30]));
        expect(rounded([hatch!.pattern, hatch!.angle, hatch!.spacing])).toEqual(rounded(["ansi37", 30, 2 / INCH]));
        expect(rounded(hatch!.boundaries)).toEqual(rounded([{ segments: [{ points: [[52 / INCH, 30 / INCH, 0], [28 / INCH, 30 / INCH, 0]], bulges: [1, 1], closed: true }] }]));
        expect([file, millimetres].map(written => pairsOf(written, "CIRCLE")[0]!.filter(pair => pair.startsWith("370 ")))).toEqual([["370 50"], ["370 50"]]);
        expect(rounded([file, millimetres].map(written => Number(pairsOf(written, "HATCH")[0]!.find(pair => pair.startsWith("41 "))!.slice(3))))).toEqual(rounded([2 / 3.175, 2 / 3.175]));
    });

    it("should leave the parts it was given as they were and share no list with them", () => {
        // Arrange
        const given = frozen(structuredClone(DRAWING));

        // Act
        const scaled = io.drawing.scaleParts({ parts: given, factor: 3 });

        // Assert
        expect(given).toEqual(DRAWING);
        expect(scaled[0]!.paths[2]!.segments[0]).not.toBe(given[0]!.paths[2]!.segments[0]);
        expect((scaled[0]!.paths[2]!.segments[0] as Inputs.IO.DrawingPolylineSegmentDto).bulges).not.toBe((given[0]!.paths[2]!.segments[0] as Inputs.IO.DrawingPolylineSegmentDto).bulges);
        expect((scaled[0]!.paths[3]!.segments[0] as Inputs.IO.DrawingSplineSegmentDto).knots).not.toBe((given[0]!.paths[3]!.segments[0] as Inputs.IO.DrawingSplineSegmentDto).knots);
        expect((scaled[0]!.paths[5]!.segments[0] as Inputs.IO.DrawingCircleSegmentDto).normal).not.toBe((given[0]!.paths[5]!.segments[0] as Inputs.IO.DrawingCircleSegmentDto).normal);
    });

    it.each([0, -2, Number.NaN, Number.POSITIVE_INFINITY])("should refuse the factor %s, as base refuses an input", factor => {
        // Act
        const scaling = (): Inputs.IO.DrawingPartDto[] => io.drawing.scaleParts({ parts: DRAWING, factor });

        // Assert
        expect(scaling).toThrow(InputError);
        expect(scaling).toThrow(factor > 0 || Number.isNaN(factor) ? "`factor` must be a finite number below 1e+100 in size." : `\`factor\` must be above 0; it is ${factor}.`);
    });

    it("should refuse parts the writers would refuse, naming the property, and scale an empty drawing to an empty one", () => {
        // Act
        const broken = (): Inputs.IO.DrawingPartDto[] => io.drawing.scaleParts({ parts: [{ paths: [{ segments: [{ center: [0, 0], radius: -1 }] }] }], factor: 2 });

        // Assert
        expect(broken).toThrow(new InputError("`parts[0].paths[0].segments[0].radius` must be above 0; it is -1.", "parts[0].paths[0].segments[0].radius"));
        expect(io.drawing.scaleParts({ parts: [], factor: 2 })).toEqual([]);
    });
});
