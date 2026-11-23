import { describe, expect, it } from "vitest";
import * as Inputs from "../../inputs";
import { InputError } from "../../kernel-calls";
import { IoBitByBit } from "./io";

type Point2 = Inputs.Base.Point2;

const io = new IoBitByBit();
const CLOSE = 12;
const KIND = Inputs.IO.dimensionKindEnum;

const rounded = (points: readonly Point2[]): number[][] => points.map(point => point.map(value => Math.round(value * 1e9) / 1e9 + 0));
const turnOf = (from: Point2, to: Point2): number => Math.atan2(to[1] - from[1], to[0] - from[0]) * 180 / Math.PI;
const reach = (centre: Point2, point: Point2): number => Math.sqrt((point[0] - centre[0]) ** 2 + (point[1] - centre[1]) ** 2);

describe("io.drawing.dimensionPicture", () => {
    it("should draw a linear dimension as its line at the offset, two extension lines with a gap at the points and a little past the line, and arrowheads whose tips stand on the extension lines", () => {
        // Act
        const picture = io.drawing.dimensionPicture({ start: [0, 0], end: [60, 0], offset: 12, textHeight: 4 });

        // Assert
        expect(picture.lines.map(rounded)).toEqual([[[0, 12], [60, 12]], [[0, 1], [0, 14]], [[60, 1], [60, 14]]]);
        expect(picture.fills.map(rounded)).toEqual([
            [[0, 12], [4, 12 - 2 / 3], [4, 12 + 2 / 3]].map(point => point.map(value => Math.round(value * 1e9) / 1e9)),
            [[60, 12], [56, 12 + 2 / 3], [56, 12 - 2 / 3]].map(point => point.map(value => Math.round(value * 1e9) / 1e9)),
        ]);
        expect(picture.text).toEqual({ text: "60", position: [30, 13], height: 4, anchor: "middle", rotation: 0, widthFactor: 1 });
    });

    it("should measure along the direction given, from the feet of the two points on the dimension line", () => {
        // Act
        const picture = io.drawing.dimensionPicture({ start: [0, 0], end: [40, 10], direction: [1, 0], offset: -8 });

        // Assert
        expect(picture.text.text).toBe("40");
        expect(rounded(picture.lines[0]!)).toEqual([[0, -8], [40, -8]]);
        expect(rounded(picture.lines[2]!)).toEqual([[40, 10 - 0.875], [40, -8 - 1.75]]);
    });

    it("should measure an aligned dimension along the line from start to end and turn its text along it", () => {
        // Act
        const picture = io.drawing.dimensionPicture({ start: [0, 0], end: [30, 40], offset: 5 });

        // Assert
        expect(picture.text.text).toBe("50");
        expect(picture.text.rotation).toBeCloseTo(turnOf([0, 0], [30, 40]), CLOSE);
    });

    it("should turn the text of a line running right to left or downwards so it reads from left to right or from bottom to top", () => {
        // Act
        const leftward = io.drawing.dimensionPicture({ start: [60, 0], end: [0, 0] });
        const downward = io.drawing.dimensionPicture({ start: [0, 60], end: [0, 0] });
        const upward = io.drawing.dimensionPicture({ start: [0, 0], end: [0, 60] });

        // Assert
        expect(leftward.text.rotation).toBeCloseTo(0, CLOSE);
        expect(downward.text.rotation).toBeCloseTo(90, CLOSE);
        expect(upward.text.rotation).toBeCloseTo(90, CLOSE);
    });

    it("should write a tolerance as plus and minus amounts, once with a plus-minus sign when they are equal, and the missing one as 0", () => {
        // Act
        const texts = [
            io.drawing.dimensionPicture({ start: [0, 0], end: [15, 0], upperTolerance: 0.1, lowerTolerance: 0.05 }),
            io.drawing.dimensionPicture({ start: [0, 0], end: [15, 0], upperTolerance: 0.1, lowerTolerance: 0.1 }),
            io.drawing.dimensionPicture({ start: [0, 0], end: [15, 0], upperTolerance: 0.05 }),
            io.drawing.dimensionPicture({ start: [0, 0], end: [15, 0], lowerTolerance: 0.0125 }),
        ].map(picture => picture.text.text);

        // Assert
        expect(texts).toEqual(["15 +0.1/-0.05", "15 ±0.1", "15 +0.05/-0", "15 +0/-0.0125"]);
    });

    it("should write the value given instead of the measured one, rounded to the decimal places and without trailing zeros", () => {
        // Act
        const texts = [
            io.drawing.dimensionPicture({ start: [0, 0], end: [15, 0], value: 15.5 }),
            io.drawing.dimensionPicture({ start: [0, 0], end: [15, 0], value: 2 / 3, decimalPlaces: 3 }),
            io.drawing.dimensionPicture({ start: [0, 0], end: [15, 0], value: 2.4, decimalPlaces: 0 }),
            io.drawing.dimensionPicture({ start: [0, 0], end: [15, 0], value: -0.0001 }),
        ].map(picture => picture.text.text);

        // Assert
        expect(texts).toEqual(["15.5", "0.667", "2", "0"]);
    });

    it("should draw a diameter through the center with an arrow at each end of it on the circle and the diameter sign before the value", () => {
        // Act
        const picture = io.drawing.dimensionPicture({ kind: KIND.diameter, start: [10, 10], end: [10, 30], textHeight: 2 });

        // Assert
        expect(picture.text.text).toBe("⌀40");
        expect(picture.fills.map(fill => reach([10, 10], fill[0]!))).toEqual([20, 20]);
        expect(rounded(picture.lines[0]!)).toEqual([[10, -10], [10, 30]]);
        expect(picture.lines).toHaveLength(1);
    });

    it("should put the arrows of a span too short for them outside it, pointing in, and the text past its end", () => {
        // Act
        const picture = io.drawing.dimensionPicture({ kind: KIND.diameter, start: [0, 0], end: [2, 0] });

        // Assert
        const [first, second] = picture.fills;
        expect(rounded(first!)[0]).toEqual([-2, 0]);
        expect(first![1]![0]).toBeLessThan(-2);
        expect(rounded(second!)[0]).toEqual([2, 0]);
        expect(second![1]![0]).toBeGreaterThan(2);
        expect(picture.lines[0]![0]![0]).toBeCloseTo(-2 - 1.5 * 3.5, CLOSE);
        expect(picture.text.position[0]).toBeGreaterThan(2 + 1.5 * 3.5);
    });

    it("should draw a radius from the center with one arrow at the circle and R before the value", () => {
        // Act
        const picture = io.drawing.dimensionPicture({ kind: KIND.radius, start: [0, 0], end: [30, 0] });

        // Assert
        expect(picture.text.text).toBe("R30");
        expect(picture.fills).toHaveLength(1);
        expect(rounded(picture.fills[0]!)[0]).toEqual([30, 0]);
        expect(rounded(picture.lines[0]!)).toEqual([[0, 0], [30, 0]]);
        expect(picture.text.position[0]).toBeCloseTo(15, CLOSE);
    });

    it("should draw an angle as an arc through end with arrows at the arms and the text outside the arc, the degree sign after the value", () => {
        // Act
        const picture = io.drawing.dimensionPicture({ kind: KIND.angular, start: [0, 0], end: [20, 0], angle: 90 });

        // Assert
        expect(picture.text.text).toBe("90°");
        expect(rounded(picture.fills.map(fill => fill[0]!))).toEqual([[20, 0], [0, 20]]);
        expect(picture.lines[0]!.every(point => Math.abs(reach([0, 0], point) - 20) < 1e-9)).toBe(true);
        expect(rounded(picture.lines[1]!)).toEqual([[0.875, 0], [21.75, 0]]);
        expect(rounded(picture.lines[2]!)).toEqual([[0, 0.875], [0, 21.75]]);
        expect(reach([0, 0], picture.textPoint)).toBeGreaterThan(20);
        expect(picture.text.rotation).toBeCloseTo(-45, CLOSE);
    });

    it("should write an angle given as a value, not the one the arc sweeps", () => {
        // Act
        const picture = io.drawing.dimensionPicture({ kind: KIND.angular, start: [0, 0], end: [20, 0], angle: 30, value: 30.25, decimalPlaces: 1 });

        // Assert
        expect(picture.text.text).toBe("30.3°");
    });

    it("should give the box it fills, the same box dimensionExtent gives, holding its text point", () => {
        // Arrange
        const dimension: Inputs.IO.DrawingDimensionDto = { kind: KIND.diameter, start: [0, 0], end: [5, 0], upperTolerance: 0.05 };

        // Act
        const picture = io.drawing.dimensionPicture(dimension);
        const extent = io.drawing.dimensionExtent(dimension);

        // Assert
        expect(extent).toEqual(picture.extent);
        expect(rounded([extent.min, extent.max])).toEqual(rounded([[-5, -0.5833333333333334], picture.extent.max]));
        expect(picture.textPoint[0]).toBeGreaterThan(extent.min[0]);
        expect(picture.textPoint[1]).toBeLessThan(extent.max[1]);
    });

    it("should draw its letters as io.drawing.textStrokes draws its text", () => {
        // Act
        const picture = io.drawing.dimensionPicture({ start: [0, 0], end: [0, 25], upperTolerance: 0.2, lowerTolerance: 0.2 });

        // Assert
        const strokes = io.drawing.textStrokes(picture.text).map(stroke => stroke.map((point): Point2 => [point[0], point[1]]));
        expect(picture.textStrokes).toEqual(strokes);
    });

    it("should leave its inputs as they were", () => {
        // Arrange
        const dimension: Inputs.IO.DrawingDimensionDto = { kind: KIND.linear, start: [1, 2], end: [40, 2], direction: [1, 0] };
        const copy = structuredClone(dimension);

        // Act
        io.drawing.dimensionPicture(dimension);

        // Assert
        expect(dimension).toEqual(copy);
    });

    it("should refuse what it cannot draw, naming the input", () => {
        // Arrange
        const threeNumbers: number[] = [0, 0, 0];
        const refusals: [Inputs.IO.DrawingDimensionDto, InputError][] = [
            [{ start: [0, 0], end: [0, 0] }, new InputError("`end` lies level with `start` along the measured direction, so the dimension measures no distance.", "end")],
            [{ start: [0, 0], end: [0, 10], direction: [1, 0] }, new InputError("`end` lies level with `start` along the measured direction, so the dimension measures no distance.", "end")],
            [{ start: [0, 0], end: [10, 0], direction: [0, 0] }, new InputError("`direction` must not be a zero vector.", "direction")],
            [{ kind: KIND.radius, start: [3, 3], end: [3, 3] }, new InputError("`end` lies on `start`, so the dimension has no circle or arm to measure.", "end")],
            [{ kind: KIND.angular, start: [0, 0], end: [10, 0], angle: 360 }, new InputError("`angle` must lie between 0 and 360 degrees, both left out; it is 360.", "angle")],
            [{ kind: KIND.angular, start: [0, 0], end: [2, 0] }, new InputError("`end` lies 2 from `start`, nearer than an arrowhead is long (3.5), so the arc has no room for its arrows.", "end")],
            [{ start: [0, 0], end: [10, 0], decimalPlaces: 1.5 }, new InputError("`decimalPlaces` must be a whole number from 0 to 15; it is 1.5.", "decimalPlaces")],
            [{ start: [0, 0], end: [10, 0], upperTolerance: -0.1 }, new InputError("`upperTolerance` is an amount and must not be below 0; it is -0.1.", "upperTolerance")],
            [{ start: [0, 0], end: [10, 0], textHeight: 0 }, new InputError("`textHeight` must be above 0; it is 0.", "textHeight")],
            [{ start: threeNumbers as Point2, end: [10, 0] }, new InputError("`start` must be a point of 2 finite numbers.", "start")],
            [{ kind: "chord" as Inputs.IO.dimensionKindEnum, start: [0, 0], end: [10, 0] }, new InputError("`kind` must be one of linear, diameter, radius, angular.", "kind")],
        ];

        // Act
        const thrown = refusals.map(([dimension]) => {
            try {
                io.drawing.dimensionPicture(dimension);
                return undefined;
            } catch (error) {
                return error;
            }
        });

        // Assert
        thrown.forEach((error, at) => {
            expect(error).toBeInstanceOf(InputError);
            expect((error as InputError).message).toBe(refusals[at]![1].message);
            expect((error as InputError).property).toBe(refusals[at]![1].property);
        });
    });
});
