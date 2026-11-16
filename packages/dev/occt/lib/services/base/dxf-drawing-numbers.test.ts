import { describe, expect, it } from "vitest";
import type { ReadEntity, ReadSegment } from "@bitbybit-dev/base/lib/api/services/helpers/files/dxf/dxf-reader-types";
import { IO } from "@bitbybit-dev/base/lib/api/inputs/io-inputs";
import { WorkBudget } from "@bitbybit-dev/base/lib/api/services/helpers/files/work-budget";
import { DRAWING_SEGMENT, REFUSAL, drawingGroupsOf, drawingNumbersOf, kernelEdgeBudgetFor, leftOutWarnings, refusalCode } from "./dxf-drawing-numbers";
import { KERNEL_EDGE_CEILING, KERNEL_EDGE_FLOOR, MAX_LISTED_LEFT_OUT } from "./dxf-loader.constants";

const style = (layer: string, color = "#000000"): ReadEntity["style"] => ({ layer, color, lineType: IO.lineTypeEnum.continuous });

const unbounded = (): WorkBudget => new WorkBudget(Number.POSITIVE_INFINITY);

const numbersOf = (segments: ReadSegment[], scale = 1): number[] => [...drawingNumbersOf([{ style: style("0"), segments }], scale, unbounded()).numbers];

describe("the numbers a DXF drawing is built from", () => {
    it("should group entities by layer, color and line type in the order the file first uses each", () => {
        // Arrange
        const line: ReadSegment = { kind: "line", start: [0, 0, 0], end: [1, 0, 0] };

        // Act
        const groups = drawingGroupsOf([
            { style: style("cut"), segments: [line] },
            { style: style("mark"), segments: [line, line] },
            { style: style("cut", "#ff0000"), segments: [line] },
            { style: style("cut"), segments: [line] },
        ]);

        // Assert
        expect(groups.map(group => [group.style.layer, group.style.color, group.segments.length])).toEqual([["cut", "#000000", 2], ["mark", "#000000", 2], ["cut", "#ff0000", 1]]);
    });

    it("should write a line scaled, and a group count, then each group's segment count", () => {
        // Act
        const numbers = numbersOf([{ kind: "line", start: [1, 2, 3], end: [4, 5, 6] }], 10);

        // Assert
        expect(numbers).toEqual([1, 1, DRAWING_SEGMENT.line, 10, 20, 30, 40, 50, 60]);
    });

    it("should write a conic by its principal axes, a skewed pair of conjugate axes turned to them with its angles moved to match", () => {
        // Act
        const round = numbersOf([{ kind: "conic", center: [1, 1, 0], xAxis: [2, 0, 0], yAxis: [0, 2, 0], start: 0.5, sweep: 1 }], 2);
        const skewed = numbersOf([{ kind: "conic", center: [0, 0, 0], xAxis: [2, 0, 0], yAxis: [1, 1, 0], start: 0, sweep: 2 * Math.PI }]);

        // Assert
        expect(round).toEqual([1, 1, DRAWING_SEGMENT.conic, 2, 2, 0, 0, 0, 1, 4, 0, 0, 4, 0.5, 1.5]);
        const [major, minor, start, end] = [Math.hypot(skewed[9]!, skewed[10]!, skewed[11]!), skewed[12]!, skewed[13]!, skewed[14]!];
        expect(major * minor).toBeCloseTo(2, 12);
        expect(major).toBeGreaterThan(minor);
        expect(end - start).toBeCloseTo(2 * Math.PI, 12);
    });

    it("should leave out a conic with no plane to lie in, naming its group and kind as the kernel names what it leaves out", () => {
        // Arrange
        const line: ReadSegment = { kind: "line", start: [0, 0, 0], end: [1, 0, 0] };
        const point: ReadSegment = { kind: "conic", center: [1, 1, 0], xAxis: [0, 0, 0], yAxis: [0, 0, 0], start: 0, sweep: 2 * Math.PI };
        const flat: ReadSegment = { kind: "conic", center: [0, 0, 0], xAxis: [1, 0, 0], yAxis: [2, 0, 0], start: 0, sweep: 1 };

        // Act
        const drawn = drawingNumbersOf([{ style: style("cut"), segments: [line] }, { style: style("mark"), segments: [point, line, flat] }], 1, unbounded());

        // Assert
        expect([...drawn.numbers]).toEqual([2, 1, DRAWING_SEGMENT.line, 0, 0, 0, 1, 0, 0, 1, DRAWING_SEGMENT.line, 0, 0, 0, 1, 0, 0]);
        expect(drawn.leftOut).toEqual([1, DRAWING_SEGMENT.conic, 1, DRAWING_SEGMENT.conic]);
        expect(drawingNumbersOf([{ style: style("cut"), segments: [line] }], 1, unbounded()).leftOut).toEqual([]);
    });

    it("should write a polyline's straight spans as lines and its bulges as arcs", () => {
        // Act
        const numbers = numbersOf([{ kind: "polyline", points: [[0, 0, 0], [2, 0, 0], [2, 2, 0]], bulges: [1, 0, 0], closed: false, normal: [0, 0, 1] }]);

        // Assert
        expect(numbers.slice(0, 3)).toEqual([1, 2, DRAWING_SEGMENT.conic]);
        expect(numbers.slice(3, 9).map(value => value + 0)).toEqual([1, 0, 0, 0, 0, 1]);
        expect(numbers.slice(-7)).toEqual([DRAWING_SEGMENT.line, 2, 0, 0, 2, 2, 0]);
    });

    it("should turn a bulge that runs clockwise into an arc that runs forward about the opposite normal", () => {
        // Act
        const numbers = numbersOf([{ kind: "polyline", points: [[0, 0, 0], [2, 0, 0]], bulges: [-1, 0], closed: false, normal: [0, 0, 1] }]);

        // Assert
        expect(numbers[8]).toBe(-1);
        expect(numbers[14]! - numbers[13]!).toBeCloseTo(Math.PI, 12);
    });

    it("should write a spline clamped, with weights beside its poles and the rational flag only when the weights differ", () => {
        // Act
        const plain = numbersOf([{ kind: "spline", curve: { degree: 1, points: [[0, 0, 0], [1, 0, 0]], weights: [2, 2], knots: [0, 0, 1, 1] } }]);
        const unclamped = numbersOf([{ kind: "spline", curve: { degree: 2, points: [[0, 0, 0], [1, 1, 0], [2, 0, 0], [3, 1, 0]], weights: [1, 1, 1, 1], knots: [0, 1, 2, 3, 4, 5, 6] } }]);

        // Assert
        expect(plain).toEqual([1, 1, DRAWING_SEGMENT.spline, 1, 0, 2, 4, 0, 0, 1, 1, 0, 0, 0, 2, 1, 0, 0, 2]);
        expect(unclamped.slice(2, 7)).toEqual([DRAWING_SEGMENT.spline, 2, 0, 4, 7]);
        expect(unclamped.slice(7, 14)).toEqual([2, 2, 2, 3, 4, 4, 4]);
    });

    it("should write fit points as given, repeated ones included, with their end tangents only for an open curve given both", () => {
        // Act
        const open = numbersOf([{ kind: "fit", points: [[0, 0, 0], [1, 1, 0]], startTangent: [1, 0, 0], endTangent: [0, 1, 0], closed: false }], 2);
        const oneTangent = numbersOf([{ kind: "fit", points: [[0, 0, 0], [1, 1, 0]], startTangent: [1, 0, 0], endTangent: undefined, closed: false }]);
        const closed = numbersOf([{ kind: "fit", points: [[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 0]], startTangent: [1, 0, 0], endTangent: [1, 0, 0], closed: true }]);

        // Assert
        expect(open).toEqual([1, 1, DRAWING_SEGMENT.fit, 2, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 2, 2, 0]);
        expect(oneTangent).toEqual([1, 1, DRAWING_SEGMENT.fit, 2, 0, 0, 0, 0, 0, 1, 1, 0]);
        expect(closed).toEqual([1, 1, DRAWING_SEGMENT.fit, 4, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0]);
    });

    it("should word what the kernel left out once per layer and kind, counted, layer by layer in the order first met", () => {
        // Arrange
        const line: ReadSegment = { kind: "line", start: [0, 0, 0], end: [1, 0, 0] };
        const groups = drawingGroupsOf([
            { style: style("cut"), segments: [line] },
            { style: style("cut", "#ff0000"), segments: [line] },
            { style: style("mark"), segments: [line] },
        ]);
        const leftOut = Int32Array.from([0, DRAWING_SEGMENT.spline, 2, DRAWING_SEGMENT.conic, 1, DRAWING_SEGMENT.spline, 0, DRAWING_SEGMENT.fit, 2, 7]);

        // Act
        const warnings = leftOutWarnings(groups, leftOut);

        // Assert
        expect(warnings).toEqual([
            "2 splines on layer \"cut\" could not be drawn: the kernel refuses the degree, knots or weights given.",
            "1 fit-point spline on layer \"cut\" could not be drawn: the fit points given cannot be interpolated.",
            "1 arc on layer \"mark\" could not be drawn: a radius, a plane or a sweep is missing.",
            "1 segment on layer \"mark\" could not be drawn: the kernel could not make a curve.",
        ]);
        expect(leftOutWarnings(groups, new Int32Array(0))).toEqual([]);
    });

    it("should leave out a spline of a degree the kernel refuses before clamping it, however many poles it has", { timeout: 2000 }, () => {
        // Arrange
        const degree = 4000;
        const points = Array.from({ length: 2 * degree + 1 }, (_, k): [number, number, number] => [k, k % 7, 0]);
        const knots = Array.from({ length: points.length + degree + 1 }, (_, k) => k);
        const spline: ReadSegment = { kind: "spline", curve: { degree, points, weights: points.map(() => 1), knots } };
        const degreeless: ReadSegment = { kind: "spline", curve: { degree: Number.NaN, points: points.slice(0, 2), weights: [1, 1], knots: [0, 0, 1, 1] } };

        // Act
        const drawn = drawingNumbersOf([{ style: style("0"), segments: [spline, degreeless] }], 1, unbounded());

        // Assert
        expect([...drawn.numbers]).toEqual([1, 0]);
        expect(drawn.refused).toEqual([0, refusalCode(DRAWING_SEGMENT.spline, REFUSAL.degree), 0, refusalCode(DRAWING_SEGMENT.spline, REFUSAL.degree)]);
        expect(leftOutWarnings([{ style: style("0"), segments: [] }], [], drawn.refused)).toEqual(["2 splines on layer \"0\" could not be drawn: its degree is above 25, the highest the kernel draws."]);
    });

    it("should leave out a fit-point spline through more points than one is interpolated through, and a closed one through fewer", () => {
        // Arrange
        const fit = (count: number, closed: boolean): ReadSegment => ({ kind: "fit", points: Array.from({ length: count }, (_, k): [number, number, number] => [k, k % 3, 0]), startTangent: undefined, endTangent: undefined, closed });
        const groups = [{ style: style("0"), segments: [fit(10_001, false), fit(5_001, true), fit(5_000, true), fit(10_000, false)] }];

        // Act
        const drawn = drawingNumbersOf(groups, 1, unbounded());

        // Assert
        expect(drawn.drawn).toBe(2);
        expect(leftOutWarnings(groups, drawn.leftOut, drawn.refused)).toEqual([
            "1 fit-point spline on layer \"0\" could not be drawn: it has more than 10000 fit points, more than one spline is interpolated through.",
            "1 fit-point spline on layer \"0\" could not be drawn: it is closed through more than 5000 fit points, more than one closed spline is interpolated through.",
        ]);
    });

    it.each([
        ["a line reaching 1e100", { kind: "line", start: [0, 0, 0], end: [1e100, 0, 0] }, 1],
        ["a line holding no number", { kind: "line", start: [Number.NaN, 0, 0], end: [1, 0, 0] }, 1],
        ["a line scaled past every finite number", { kind: "line", start: [0, 0, 0], end: [1e300, 0, 0] }, 1e10],
        ["an arc whose radius the scale takes past 1e100", { kind: "conic", center: [0, 0, 0], xAxis: [1e99, 0, 0], yAxis: [0, 1e99, 0], start: 0, sweep: 1 }, 1e10],
        ["a spline with an endless knot", { kind: "spline", curve: { degree: 1, points: [[0, 0, 0], [1, 0, 0]], weights: [1, 1], knots: [0, 0, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY] } }, 1],
        ["a fit-point spline whose tangent is endless", { kind: "fit", points: [[0, 0, 0], [1, 1, 0]], startTangent: [Number.POSITIVE_INFINITY, 0, 0], endTangent: [1, 0, 0], closed: false }, 1],
    ] as [string, ReadSegment, number][])("should leave out %s, naming its layer and kind, rather than hand the kernel a number it takes for infinite", (_name, segment, scale) => {
        // Arrange
        const groups = [{ style: style("cut"), segments: [segment, { kind: "line", start: [0, 0, 0], end: [1, 0, 0] } as ReadSegment] }];

        // Act
        const drawn = drawingNumbersOf(groups, scale, unbounded());

        // Assert
        expect(drawn.numbers.every(Number.isFinite)).toBe(true);
        expect(drawn.drawn).toBe(1);
        expect(leftOutWarnings(groups, drawn.leftOut, drawn.refused)).toEqual([expect.stringMatching(/^1 (segment|arc|spline|fit-point spline) on layer "cut" could not be drawn: a number in it is not finite or is 1e\+100 or more in size\.$/)]);
    });

    it("should charge the kernel edge budget per edge and per pole and fit point, and leave out in order what it cannot cover", () => {
        // Arrange
        const line: ReadSegment = { kind: "line", start: [0, 0, 0], end: [1, 0, 0] };
        const poles = Array.from({ length: 80 }, (_, k): [number, number, number] => [k, k % 2, 0]);
        const spline: ReadSegment = { kind: "spline", curve: { degree: 1, points: poles, weights: poles.map(() => 1), knots: [0, ...poles.map((_, k) => k), poles.length - 1] } };
        const closedFit: ReadSegment = { kind: "fit", points: Array.from({ length: 2500 }, (_, k): [number, number, number] => [Math.cos(k), Math.sin(k), 0]), startTangent: undefined, endTangent: undefined, closed: true };
        const charged = (segment: ReadSegment): number => {
            const budget = unbounded();
            drawingNumbersOf([{ style: style("0"), segments: [segment] }], 1, budget);
            return budget.spent;
        };
        const budget = new WorkBudget(12);

        // Act
        const spent = [line, spline, closedFit].map(charged);
        const drawn = drawingNumbersOf([{ style: style("a"), segments: [line, spline, line] }, { style: style("b"), segments: [line, { kind: "polyline", points: [[0, 0, 0], [1, 0, 0], [1, 1, 0]], bulges: [0, 1, 0], closed: false, normal: [0, 0, 1] }] }], 1, budget);

        // Assert
        expect(spent).toEqual([1, 11, 5001]);
        expect(drawn.drawn).toBe(2);
        expect([...drawn.numbers.slice(0, 2)]).toEqual([2, 2]);
        expect(drawn.refused).toEqual([0, refusalCode(DRAWING_SEGMENT.line, REFUSAL.edges), 1, refusalCode(DRAWING_SEGMENT.line, REFUSAL.edges), 1, refusalCode(DRAWING_SEGMENT.line, REFUSAL.edges), 1, refusalCode(DRAWING_SEGMENT.conic, REFUSAL.edges)]);
        expect(budget.exhausted).toBe(true);
    });

    it("should size the kernel edge budget by the file's length between a floor and a ceiling", () => {
        // Act
        const capacities = [0, 100_000, 1_000_000, 100_000_000].map((length) => kernelEdgeBudgetFor(length).capacity);

        // Assert
        expect(capacities).toEqual([KERNEL_EDGE_FLOOR, KERNEL_EDGE_FLOOR, 100_000, KERNEL_EDGE_CEILING]);
    });

    it("should measure the extent of what it draws, an arc by its reach, and count what it drew", () => {
        // Act
        const drawn = drawingNumbersOf([{ style: style("0"), segments: [
            { kind: "line", start: [0, 0, 0], end: [4, 1, 0] },
            { kind: "conic", center: [10, 0, 0], xAxis: [3, 0, 0], yAxis: [0, 3, 0], start: 0, sweep: 1 },
            { kind: "line", start: [0, 0, 0], end: [1e100, 0, 0] },
        ] }], 2, unbounded());

        // Assert
        expect([drawn.extent, drawn.drawn]).toEqual([26, 2]);
        expect(drawingNumbersOf([], 1, unbounded()).extent).toBe(0);
    });

    it("should list what it left out on at most a few layers and count the rest in one warning", () => {
        // Arrange
        const groups = Array.from({ length: 1000 }, (_, k) => ({ style: style(`L${String(k)}`), segments: [] }));
        const leftOut = groups.flatMap((_, k) => [k, DRAWING_SEGMENT.spline, k, DRAWING_SEGMENT.spline]);

        // Act
        const warnings = leftOutWarnings(groups, leftOut);

        // Assert
        expect(warnings).toHaveLength(MAX_LISTED_LEFT_OUT + 1);
        expect(warnings[0]).toBe("2 splines on layer \"L0\" could not be drawn: the kernel refuses the degree, knots or weights given.");
        expect(warnings[MAX_LISTED_LEFT_OUT]).toBe(`${String(2 * (1000 - MAX_LISTED_LEFT_OUT))} more segments on ${String(1000 - MAX_LISTED_LEFT_OUT)} layers could not be drawn, for reasons like those above.`);
    });
});
