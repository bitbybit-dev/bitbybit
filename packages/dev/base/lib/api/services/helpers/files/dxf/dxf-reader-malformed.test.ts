import { describe, expect, it } from "vitest";
import type * as Inputs from "../../../../inputs";
import { InputError } from "../../../../kernel-calls";
import { Dxf } from "../../../io/dxf";
import { blockDxf, dxfOf, elapsedMs, entitiesDxf, insertDxf, lightPolylineDxf } from "../__test__/dxf-builders";
import { readDxfDrawing } from "./dxf-reader";

const TIME_LIMIT_MS = 5000;
const NO_PLANE = "1 arc could not be drawn: a radius, a plane or a sweep is missing.";
const FIT_ONLY = "1 spline is given only by fit points, which need a kernel to interpolate; they were left out here, and occt.io.loadDxf reads them.";

const read = (text: string, includeHiddenLayers: unknown = false): Inputs.IO.DxfDrawingDto => new Dxf().dxfRead({ dxf: text, includeHiddenLayers: includeHiddenLayers as boolean });

const refusalOf = (act: () => unknown): string => {
    try {
        act();
        return "read";
    } catch (error) {
        return error instanceof InputError ? error.message : `not an input error: ${String(error)}`;
    }
};

const summaryOf = (drawing: Inputs.IO.DxfDrawingDto): [number, readonly string[]] => [drawing.parts.reduce((total, part) => total + part.paths.length, 0), drawing.warnings];

const knotsDxf = (knots: readonly number[]): string[] => knots.flatMap(knot => ["40", String(knot)]);

const controlsDxf = (count: number): string[] => Array.from({ length: count }, (_, at) => ["10", String(at), "20", String(at % 2)]).flat();

const splineDxf = (degree: number, knots: readonly number[], controls: number): string[] =>
    ["0", "SPLINE", "8", "0", "70", "8", "71", String(degree), ...knotsDxf(knots), ...controlsDxf(controls)];

const clampedKnots = (degree: number, controls: number): number[] =>
    Array.from({ length: controls + degree + 1 }, (_, at) => Math.min(Math.max(at - degree, 0), controls - degree));

const fitSplineDxf = (points: readonly (readonly number[])[], extra: readonly string[] = [], flags = 8): string[] =>
    ["0", "SPLINE", "8", "0", "70", String(flags), "71", "3", ...extra, ...points.flatMap(([x, y]) => ["11", String(x), "21", String(y)])];

describe("reading a malformed DXF: what is not a DXF drawing is refused with an input error", () => {
    it.each([
        ["a binary file", "AutoCAD Binary DXF\r\n\u001a\u0000", "`dxf` is a binary DXF file; save it as ASCII DXF, which every CAD program can write."],
        ["a damaged group code", "0\nSECTION\nxx\nENTITIES", "`dxf` is damaged: line 3 should hold a group code, a whole number, and holds \"xx\"."],
        ["a number that is no number", entitiesDxf(["0", "LINE", "10", "NaN"]), "`dxf` is damaged: line 8 should hold a number for group code 10 and holds \"NaN\"."],
        ["an endless number", entitiesDxf(["0", "LINE", "10", "Infinity"]), "`dxf` is damaged: line 8 should hold a number for group code 10 and holds \"Infinity\"."],
        ["a million empty lines", "\n".repeat(1_000_000), "`dxf` is damaged: line 1 should hold a group code, a whole number, and holds \"\"."],
        ["a file with no ENTITIES section", dxfOf([["HEADER"]]), "`dxf` has no ENTITIES section, so it is not a DXF drawing."],
        ["a number in place of the text", 42, "`dxf` must be the text of a DXF file or its bytes; it is number."],
        ["garbage bytes in place of the text", new Uint8Array([0xff, 0xfe, 0x00, 0x41]), "`dxf` has no ENTITIES section, so it is not a DXF drawing."],
    ])("should refuse %s", (_name, dxf, message) => {
        // Act
        const refusal = refusalOf(() => read(dxf as string));

        // Assert
        expect(refusal).toBe(message);
    });

    it.each([
        ["no number", Number.NaN, "number"],
        ["a word", "yes", "string"],
        ["an object", {}, "object"],
    ])("should refuse an includeHiddenLayers that is %s", (_name, includeHiddenLayers, type) => {
        // Act
        const refusal = refusalOf(() => read(entitiesDxf(["0", "LINE", "10", "0"]), includeHiddenLayers));

        // Assert
        expect(refusal).toBe(`\`includeHiddenLayers\` must be true or false, and is of type ${type}.`);
    });

    it("should read an old POLYLINE of 300,000 VERTEX records whole within the time limit", () => {
        // Arrange
        const vertices = Array.from({ length: 300_000 }, (_, at) => ["0", "VERTEX", "8", "0", "10", String(at), "20", String(at % 2)]).flat();
        const text = entitiesDxf(["0", "POLYLINE", "8", "0", "70", "0", ...vertices, "0", "SEQEND"]);
        let points = 0;

        // Act
        const took = elapsedMs(() => {
            const segment = read(text).parts[0]!.paths[0]!.segments[0] as Inputs.IO.DrawingPolylineSegmentDto;
            points = segment.points.length;
        });

        // Assert
        expect([took < TIME_LIMIT_MS, points]).toEqual([true, 300_000]);
    }, 60_000);
});

describe("reading a malformed DXF: a spline no kernel curve can be is left out before anything is computed from it", () => {
    it.each([
        ["26 with knots to match", splineDxf(26, clampedKnots(26, 30), 30)],
        ["a billion", ["0", "SPLINE", "8", "0", "71", "1000000000", "10", "0", "10", "1"]],
    ])("should leave out a spline of degree %s, saying why", (_name, spline) => {
        // Act
        const reading = readDxfDrawing(entitiesDxf(spline), false);

        // Assert
        expect([reading.entities.length, reading.warnings]).toEqual([0, ["1 SPLINE entity could not be drawn: its degree is above 25, the highest a kernel curve takes."]]);
    });

    it("should read a spline of degree 25, the highest a kernel curve takes", () => {
        // Act
        const reading = readDxfDrawing(entitiesDxf(splineDxf(25, clampedKnots(25, 30), 30)), false);

        // Assert
        expect([reading.entities.map(entity => entity.segments[0]!.kind), reading.warnings]).toEqual([["spline"], []]);
    });

    it("should leave out a spline of more than 10,000 fit points, saying why, and keep one of 10,000", () => {
        // Arrange
        const fits = (count: number): number[][] => Array.from({ length: count }, (_, at) => [at, at % 3]);

        // Act
        const readings = [10_001, 10_000].map(count => readDxfDrawing(entitiesDxf(fitSplineDxf(fits(count))), false));

        // Assert
        expect(readings.map(reading => [reading.entities.length, reading.warnings])).toEqual([
            [0, ["1 SPLINE entity could not be drawn: it has more than 10000 fit points, more than one spline is interpolated through."]],
            [1, []],
        ]);
    });
});

describe("reading a malformed DXF: numbers at the edge of what a double holds end in a segment or a warning", () => {
    const circleIn = (radius: string): string[] => ["0", "CIRCLE", "8", "0", "10", "0", "20", "0", "40", radius];
    const tilted = ["210", "1", "220", "0", "230", "0"];

    it.each([
        ["a circle of radius 1e-300", entitiesDxf(circleIn("1e-300")), [0, [NO_PLANE]]],
        ["a bulge of 1e300", entitiesDxf(lightPolylineDxf([[0, 0, 1e300], [1, 0]])), [1, []]],
        ["a bulge of 1e-300", entitiesDxf(lightPolylineDxf([[0, 0, 1e-300], [1, 0]])), [1, []]],
        ["a bulge of 1e300 standing upright", entitiesDxf(lightPolylineDxf([[0, 0, 1e300], [1, 0]], tilted)), [0, [NO_PLANE]]],
        ["a circle in a block inserted at a scale of 0", dxfOf([["BLOCKS", ...blockDxf("RING", circleIn("1"))], ["ENTITIES", ...insertDxf("RING", 1, 1, ["41", "0", "42", "0", "43", "0"])]]), [0, [NO_PLANE]]],
        ["an ellipse whose parameters run from 1e300 to -1e300", entitiesDxf(["0", "ELLIPSE", "8", "0", "10", "0", "20", "0", "11", "1", "21", "0", "40", "0.5", "41", "1e300", "42", "-1e300"]), [1, []]],
        ["a spline whose knots reach 1e99", entitiesDxf(splineDxf(2, [0, 0, 0, 1e99, 1e99, 1e99], 3)), [1, []]],
        ["a spline whose knots span 1e-300", entitiesDxf(splineDxf(2, [0, 0, 0, 1e-300, 1e-300, 1e-300], 3)), [1, []]],
        ["a spline whose knots decrease", entitiesDxf(splineDxf(2, [5, 4, 3, 2, 1, 0], 3)), [1, []]],
        ["a closed spline through 50 fit points at one place", entitiesDxf(fitSplineDxf(Array.from({ length: 50 }, () => [1, 1]), [], 9)), [0, [FIT_ONLY]]],
        ["a spline whose end tangents are 1e99 and 1e-300 long", entitiesDxf(fitSplineDxf([[0, 0], [1, 1], [2, 0]], ["12", "1e99", "22", "0", "32", "0", "13", "0", "23", "1e-300", "33", "0"])), [0, [FIT_ONLY]]],
    ])("should read %s without an exception", (_name, text, expected) => {
        // Act
        const drawing = read(text);

        // Assert
        expect(summaryOf(drawing)).toEqual(expected);
    });
});
