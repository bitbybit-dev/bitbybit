import { describe, expect, it } from "vitest";
import fc from "fast-check";
import * as Inputs from "../../inputs";
import { IoBitByBit } from "./io";

type Point2 = Inputs.Base.Point2;

interface DrawnCase {
    dimension: Inputs.IO.DrawingDimensionDto;
    lineTurn: number | undefined;
    centre: Point2 | undefined;
    radius: number | undefined;
}

const io = new IoBitByBit();
const SEED = 20261122;
const RUNS = 300;
const KIND = Inputs.IO.dimensionKindEnum;
const QUARTER = 90;
const SLACK = 1e-9;

const minus = (a: Point2, b: Point2): Point2 => [a[0] - b[0], a[1] - b[1]];
const plus = (a: Point2, b: Point2): Point2 => [a[0] + b[0], a[1] + b[1]];
const times = (a: Point2, factor: number): Point2 => [a[0] * factor, a[1] * factor];
const dotOf = (a: Point2, b: Point2): number => a[0] * b[0] + a[1] * b[1];
const cross = (a: Point2, b: Point2): number => a[0] * b[1] - a[1] * b[0];
const lengthOf = (a: Point2): number => Math.sqrt(a[0] * a[0] + a[1] * a[1]);
const toward = (degrees: number): Point2 => [Math.cos(degrees * Math.PI / 180), Math.sin(degrees * Math.PI / 180)];

const distanceToSegment = (point: Point2, start: Point2, end: Point2): number => {
    const run = minus(end, start);
    const share = Math.min(1, Math.max(0, dotOf(minus(point, start), run) / dotOf(run, run)));
    return lengthOf(minus(point, plus(start, times(run, share))));
};

const triangleArea = (triangle: readonly Point2[]): number => cross(minus(triangle[1]!, triangle[0]!), minus(triangle[2]!, triangle[0]!)) / 2;

const insideTriangle = (point: Point2, triangle: readonly Point2[]): boolean =>
    [0, 1, 2].every(at => cross(minus(triangle[(at + 1) % 3]!, triangle[at]!), minus(point, triangle[at]!)) >= 0);

const segmentsCross = (a: Point2, b: Point2, c: Point2, d: Point2): boolean => {
    const side = (p: Point2, q: Point2, r: Point2): number => Math.sign(cross(minus(q, p), minus(r, p)));
    return side(a, b, c) * side(a, b, d) <= 0 && side(c, d, a) * side(c, d, b) <= 0;
};

const trianglesMeet = (first: readonly Point2[], second: readonly Point2[]): boolean =>
    first.some(point => insideTriangle(point, second)) || second.some(point => insideTriangle(point, first))
    || [0, 1, 2].some(i => [0, 1, 2].some(j => segmentsCross(first[i]!, first[(i + 1) % 3]!, second[j]!, second[(j + 1) % 3]!)));

const coordinate = fc.double({ min: -1000, max: 1000, noNaN: true });
const point = fc.tuple(coordinate, coordinate).map((pair): Point2 => [pair[0], pair[1]]);
const degrees = fc.double({ min: -720, max: 720, noNaN: true });
const textHeight = fc.double({ min: 0.5, max: 10, noNaN: true });
const arrowLength = fc.option(fc.double({ min: 0.2, max: 10, noNaN: true }), { nil: undefined });
const amount = fc.option(fc.double({ min: 0, max: 5, noNaN: true }), { nil: undefined });
const value = fc.option(fc.double({ min: -1e6, max: 1e6, noNaN: true }), { nil: undefined });
const common = fc.record({ textHeight, arrowLength, upperTolerance: amount, lowerTolerance: amount, value, decimalPlaces: fc.integer({ min: 0, max: 6 }) });

const linear = fc.tuple(point, degrees, fc.double({ min: 0.01, max: 500, noNaN: true }), fc.option(degrees, { nil: undefined }), fc.double({ min: -200, max: 200, noNaN: true }), common)
    .filter(([, turn, , across]) => across === undefined || Math.abs(Math.cos((turn - across) * Math.PI / 180)) > 1e-3)
    .map(([start, turn, length, across, offset, rest]): DrawnCase => ({
        dimension: { ...rest, kind: KIND.linear, start, end: plus(start, times(toward(turn), length)), offset, ...(across === undefined ? {} : { direction: toward(across) }) },
        lineTurn: across ?? turn,
        centre: undefined,
        radius: undefined,
    }));

const circular = fc.tuple(fc.constantFrom(KIND.diameter, KIND.radius), point, degrees, fc.double({ min: 0.01, max: 500, noNaN: true }), common)
    .map(([kind, start, turn, radius, rest]): DrawnCase => ({
        dimension: { ...rest, kind, start, end: plus(start, times(toward(turn), radius)) },
        lineTurn: turn,
        centre: start,
        radius,
    }));

const angular = fc.tuple(point, degrees, fc.double({ min: 1.001, max: 50, noNaN: true }), fc.double({ min: 0.5, max: 359.5, noNaN: true }), common)
    .map(([start, turn, reachShare, sweep, rest]): DrawnCase => {
        const radius = (rest.arrowLength ?? rest.textHeight) * reachShare;
        return {
            dimension: { ...rest, kind: KIND.angular, start, end: plus(start, times(toward(turn), radius)), angle: sweep },
            lineTurn: turn + sweep / 2 + QUARTER,
            centre: start,
            radius,
        };
    });

const drawn = fc.oneof(linear, circular, angular);

describe("io.drawing.dimensionPicture, whatever it is asked to draw", () => {
    it("should keep every line, arrowhead and letter inside the box it gives, the box dimensionExtent gives, its text point inside what it draws", () => {
        fc.assert(fc.property(drawn, ({ dimension }) => {
            // Act
            const picture = io.drawing.dimensionPicture(dimension);
            const extent = io.drawing.dimensionExtent(dimension);

            // Assert
            const drawnPoints = [...picture.lines.flat(), ...picture.fills.flat(), ...picture.textStrokes.flat()];
            const size = Math.max(1, ...drawnPoints.map(entry => Math.max(Math.abs(entry[0]), Math.abs(entry[1]))));
            const slack = SLACK * size;
            const within = (entry: Point2, min: Point2, max: Point2): boolean =>
                entry[0] >= min[0] - slack && entry[0] <= max[0] + slack && entry[1] >= min[1] - slack && entry[1] <= max[1] + slack;
            expect(extent).toEqual(picture.extent);
            expect(drawnPoints.every(entry => within(entry, extent.min, extent.max))).toBe(true);
            const low: Point2 = [Math.min(...drawnPoints.map(entry => entry[0])), Math.min(...drawnPoints.map(entry => entry[1]))];
            const high: Point2 = [Math.max(...drawnPoints.map(entry => entry[0])), Math.max(...drawnPoints.map(entry => entry[1]))];
            expect(within(picture.textPoint, low, high)).toBe(true);
        }), { seed: SEED, numRuns: RUNS });
    });

    it("should turn its text along the dimension line, or across the arc's middle, so it reads from left to right or from bottom to top", () => {
        fc.assert(fc.property(drawn, ({ dimension, lineTurn }) => {
            // Act
            const picture = io.drawing.dimensionPicture(dimension);

            // Assert
            const rotation = picture.text.rotation!;
            expect(rotation).toBeGreaterThan(-QUARTER - SLACK);
            expect(rotation).toBeLessThanOrEqual(QUARTER + SLACK);
            expect(Math.abs(Math.sin((rotation - lineTurn!) * Math.PI / 180))).toBeLessThan(1e-9);
            const strokes = io.drawing.textStrokes(picture.text).map(stroke => stroke.map((entry): Point2 => [entry[0], entry[1]]));
            expect(picture.textStrokes).toEqual(strokes);
        }), { seed: SEED, numRuns: RUNS });
    });

    it("should stand the tip of every arrowhead on an extension line, or on the circle it measures, and keep the arrowheads apart", () => {
        fc.assert(fc.property(drawn, ({ dimension, centre, radius }) => {
            // Act
            const picture = io.drawing.dimensionPicture(dimension);

            // Assert
            const tips = picture.fills.map(fill => fill[0]!);
            const size = Math.max(1, ...picture.lines.flat().map(entry => Math.max(Math.abs(entry[0]), Math.abs(entry[1]))));
            if (dimension.kind === KIND.linear || dimension.kind === KIND.angular) {
                const extensions = picture.lines.slice(1);
                expect(extensions).toHaveLength(2);
                tips.forEach((tip, at) => expect(distanceToSegment(tip, extensions[at]![0]!, extensions[at]![1]!)).toBeLessThan(1e-9 * size));
            }
            if (centre !== undefined) {
                tips.forEach(tip => expect(Math.abs(lengthOf(minus(tip, centre)) - radius!)).toBeLessThan(1e-9 * size));
            }
            expect(tips).toHaveLength(dimension.kind === KIND.radius ? 1 : 2);
            if (picture.fills.length === 2) {
                expect(trianglesMeet(picture.fills[0]!, picture.fills[1]!)).toBe(false);
            }
        }), { seed: SEED, numRuns: RUNS });
    });

    it("should give lines of two or more points with no two neighbours in one place, and arrowheads of three corners running counterclockwise", () => {
        fc.assert(fc.property(drawn, ({ dimension }) => {
            // Act
            const picture = io.drawing.dimensionPicture(dimension);

            // Assert
            [...picture.lines, ...picture.textStrokes].forEach(line => {
                expect(line.length).toBeGreaterThan(1);
                line.slice(1).forEach((entry, at) => expect(lengthOf(minus(entry, line[at]!))).toBeGreaterThan(0));
            });
            picture.fills.forEach(fill => {
                expect(fill).toHaveLength(3);
                expect(triangleArea(fill)).toBeGreaterThan(0);
            });
        }), { seed: SEED, numRuns: RUNS });
    });
});
