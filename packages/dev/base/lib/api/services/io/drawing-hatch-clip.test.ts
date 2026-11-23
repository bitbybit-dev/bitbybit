import { describe, expect, it } from "vitest";
import * as Inputs from "../../inputs";
import { IoBitByBit } from "./io";

const io = new IoBitByBit();

type Point2 = Inputs.Base.Point2;
type Segment2 = Inputs.Base.Segment2;

const lengthOf = ([start, end]: Segment2): number => Math.hypot(end[0] - start[0], end[1] - start[1]);
const summedLength = (lines: Segment2[]): number => lines.reduce((sum, line) => sum + lengthOf(line), 0);
const middleOf = ([start, end]: Segment2): Point2 => [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];
const shoelace = (loop: Point2[]): number => loop.reduce((sum, point, at) => {
    const next = loop[(at + 1) % loop.length]!;
    return sum + point[0] * next[1] - next[0] * point[1];
}, 0) / 2;
const square = (x: number, y: number, width: number, height: number): Inputs.IO.DrawingPathDto => ({ segments: [{ points: [[x, y], [x + width, y], [x + width, y + height], [x, y + height]], closed: true }] });
const circle = (center: Point2, radius: number): Inputs.IO.DrawingPathDto => ({ segments: [{ center, radius }] });
const insideCircle = (point: Point2, center: Point2, radius: number): boolean => Math.hypot(point[0] - center[0], point[1] - center[1]) < radius;

const plate = [square(0, 0, 40, 30), circle([20, 15], 6)];
const plateArea = 40 * 30 - Math.PI * 6 * 6;
const platePerimeter = 2 * (40 + 30) + 2 * Math.PI * 6;

describe("io.drawing.clippedHatchLines", () => {

    it("should keep the pieces of a square's lines inside it, standing where hatchLines puts them", () => {
        // Arrange
        const boundaries = [square(0, 0, 10, 10)];
        const rounded = (lines: Segment2[]): number[][] => lines.map(line => line.flat().map(value => Math.round(value * 1e9) / 1e9 + 0));

        // Act
        const clipped = io.drawing.clippedHatchLines({ boundaries, angle: 0, spacing: 4 });
        const whole = io.drawing.hatchLines({ boundaries, angle: 0, spacing: 4 });

        // Assert
        expect(rounded(clipped)).toEqual([[0, 2, 10, 2], [0, 6, 10, 6]]);
        expect(rounded(whole).slice(0, 2)).toEqual(rounded(clipped));
    });

    it("should hatch a plate with a bore so that the lines' summed length times the spacing gives its area, within the spacing times its perimeter", () => {
        // Arrange
        const tolerance = 0.01;
        const spacings = [1, 0.5, 0.25, 0.1];
        const angles = [0, 30, 45, 90, 137];

        // Act
        const errors = spacings.flatMap(spacing => angles.map(angle => {
            const lines = io.drawing.clippedHatchLines({ boundaries: plate, angle, spacing, tolerance });
            return { spacing, error: Math.abs(summedLength(lines) * spacing - plateArea) };
        }));

        // Assert
        errors.forEach(({ spacing, error }) => expect(error).toBeLessThanOrEqual(spacing * platePerimeter + platePerimeter * tolerance));
        expect(Math.max(...errors.filter(({ spacing }) => spacing === 0.1).map(({ error }) => error))).toBeLessThan(plateArea * 0.005);
    });

    it("should hatch an island inside a hole again, under the even-odd rule", () => {
        // Arrange
        const boundaries = [...plate, circle([20, 15], 3)];
        const area = plateArea + Math.PI * 3 * 3;
        const perimeter = platePerimeter + 2 * Math.PI * 3;
        const spacing = 0.2;

        // Act
        const lines = io.drawing.clippedHatchLines({ boundaries, angle: 45, spacing, tolerance: 0.01 });
        const middles = lines.map(middleOf);

        // Assert
        expect(Math.abs(summedLength(lines) * spacing - area)).toBeLessThanOrEqual(spacing * perimeter + perimeter * 0.01);
        expect(middles.some(point => insideCircle(point, [20, 15], 3))).toBe(true);
        expect(middles.every(point => insideCircle(point, [20, 15], 3) || !insideCircle(point, [20, 15], 6 - 0.01))).toBe(true);
    });

    it("should give an ellipse's area by the same oracle, its boundary followed within the tolerance", () => {
        // Arrange
        const boundaries: Inputs.IO.DrawingPathDto[] = [{ segments: [{ center: [0, 0], majorAxis: [10, 0], ratio: 0.4, startParameter: 0, endParameter: 2 * Math.PI }] }];
        const area = Math.PI * 10 * 4;
        const perimeter = 2 * Math.PI * Math.sqrt((10 * 10 + 4 * 4) / 2);
        const spacing = 0.1;

        // Act
        const lines = io.drawing.clippedHatchLines({ boundaries, angle: 20, spacing, tolerance: 0.001 });

        // Assert
        expect(Math.abs(summedLength(lines) * spacing - area)).toBeLessThanOrEqual(spacing * perimeter + perimeter * 0.001);
    });

    it("should cover the region twice with a crossed pattern and leave a solid one without lines", () => {
        // Arrange
        const spacing = 0.25;

        // Act
        const crossed = io.drawing.clippedHatchLines({ boundaries: plate, pattern: Inputs.IO.hatchPatternEnum.ansi37, angle: 45, spacing });
        const solid = io.drawing.clippedHatchLines({ boundaries: plate, pattern: Inputs.IO.hatchPatternEnum.solid });

        // Assert
        expect(Math.abs(summedLength(crossed) * spacing - 2 * plateArea)).toBeLessThanOrEqual(2 * (spacing * platePerimeter + platePerimeter * 0.01));
        expect(solid).toEqual([]);
    });

    it("should leave every piece inside the plate and outside its bore, on a line hatchLines gives", () => {
        // Arrange
        const hatch = { boundaries: plate, angle: 30, spacing: 2 };
        const across: Point2 = [-Math.sin(Math.PI / 6), Math.cos(Math.PI / 6)];
        const offsetOf = (point: Point2): number => Math.round((point[0] * across[0] + point[1] * across[1]) * 1e6) / 1e6;

        // Act
        const lines = io.drawing.clippedHatchLines(hatch);
        const wholeOffsets = new Set(io.drawing.hatchLines(hatch).map(([start]) => offsetOf(start)));

        // Assert
        expect(lines.length).toBeGreaterThan(wholeOffsets.size);
        lines.forEach(line => {
            const middle = middleOf(line);
            expect(middle[0] > 0 && middle[0] < 40 && middle[1] > 0 && middle[1] < 30).toBe(true);
            expect(insideCircle(middle, [20, 15], 6)).toBe(false);
            expect(wholeOffsets.has(offsetOf(line[0]))).toBe(true);
            expect(offsetOf(line[1])).toBe(offsetOf(line[0]));
        });
    });

    it("should run the pattern on unbroken across two regions side by side", () => {
        // Arrange
        const options = { angle: 60, spacing: 1.5 };
        const offsetsOf = (lines: Segment2[]): number[] => [...new Set(lines.map(([start]) => Math.round((start[1] * 0.5 - start[0] * Math.sqrt(3) / 2) * 1e6) / 1e6))].sort((a, b) => a - b);

        // Act
        const left = io.drawing.clippedHatchLines({ boundaries: [square(0, 0, 10, 10)], ...options });
        const right = io.drawing.clippedHatchLines({ boundaries: [square(10, 0, 10, 10)], ...options });
        const both = io.drawing.clippedHatchLines({ boundaries: [square(0, 0, 20, 10)], ...options });

        // Assert
        expect(offsetsOf([...left, ...right])).toEqual(offsetsOf(both));
        expect(summedLength(left) + summedLength(right)).toBeCloseTo(summedLength(both), 9);
    });

    it("should close a boundary whose ends do not meet with a straight line", () => {
        // Arrange
        const boundaries: Inputs.IO.DrawingPathDto[] = [{ segments: [{ points: [[0, 0], [10, 0], [0, 10]] }] }];
        const spacing = 0.05;

        // Act
        const lines = io.drawing.clippedHatchLines({ boundaries, angle: 0, spacing });

        // Assert
        expect(Math.abs(summedLength(lines) * spacing - 50)).toBeLessThanOrEqual(spacing * (20 + 10 * Math.SQRT2));
    });

    it("should leave the given boundaries as they were", () => {
        // Arrange
        const boundaries = [square(0, 0, 10, 10), circle([5, 5], 2)];
        const before = JSON.stringify(boundaries);

        // Act
        io.drawing.clippedHatchLines({ boundaries, angle: 15, spacing: 1 });
        io.drawing.hatchOutlines({ boundaries });

        // Assert
        expect(JSON.stringify(boundaries)).toBe(before);
    });

    it("should refuse a tolerance not above 0, a spacing too fine for the region and a hatch without boundaries", () => {
        // Arrange
        const boundaries = [square(0, 0, 1000, 1000)];

        // Act
        const flat = (): Segment2[] => io.drawing.clippedHatchLines({ boundaries, tolerance: 0 });
        const fine = (): Segment2[] => io.drawing.clippedHatchLines({ boundaries, spacing: 0.001 });
        const empty = (): Segment2[] => io.drawing.clippedHatchLines({ boundaries: [] });
        const outlines = (): Point2[][] => io.drawing.hatchOutlines({ boundaries, tolerance: -1 });

        // Assert
        expect(flat).toThrow("`tolerance` must be above 0; it is 0.");
        expect(fine).toThrow("`spacing` is 0.001 for a region that would take more than 200000 lines: widen the spacing.");
        expect(empty).toThrow("`boundaries` must be a list of at least one path.");
        expect(outlines).toThrow("`tolerance` must be above 0; it is -1.");
    });
});

describe("io.drawing.hatchOutlines", () => {

    it("should follow a circle within the tolerance, each corner once", () => {
        // Act
        const loops = io.drawing.hatchOutlines({ boundaries: [circle([0, 0], 5)], tolerance: 0.01 });
        const distances = loops[0]!.map(point => Math.hypot(point[0], point[1]));

        // Assert
        expect(loops).toHaveLength(1);
        expect(loops[0]).toHaveLength(50);
        distances.forEach(distance => expect(distance).toBeCloseTo(5, 9));
        expect(Math.abs(shoelace(loops[0]!)) - Math.PI * 25).toBeLessThan(0);
        expect(Math.PI * 25 - Math.abs(shoelace(loops[0]!))).toBeLessThan(2 * Math.PI * 5 * 0.01);
    });

    it("should give a plate and its bore as two loops whose areas differ by the plate's", () => {
        // Act
        const loops = io.drawing.hatchOutlines({ boundaries: plate, tolerance: 0.001 });
        const areas = loops.map(loop => Math.abs(shoelace(loop)));

        // Assert
        expect(loops).toHaveLength(2);
        expect(areas[0]! - areas[1]!).toBeCloseTo(plateArea, 1);
    });

    it("should join the segments of a path whose ends meet into one loop, and bend a bulge into points", () => {
        // Arrange
        const boundaries: Inputs.IO.DrawingPathDto[] = [{
            segments: [
                { start: [0, 0], end: [10, 0] },
                { points: [[10, 0], [10, 10]], bulges: [1, 0] },
                { start: [10, 10], end: [0, 0] },
            ],
        }];

        // Act
        const loops = io.drawing.hatchOutlines({ boundaries, tolerance: 0.01 });

        // Assert
        expect(loops).toHaveLength(1);
        expect(loops[0]!.length).toBeGreaterThan(10);
        expect(Math.abs(shoelace(loops[0]!))).toBeCloseTo(50 + Math.PI * 25 / 2, 0);
    });
});
