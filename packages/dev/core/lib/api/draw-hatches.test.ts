import { describe, it, expect } from "vitest";
import { InputError } from "@bitbybit-dev/base";
import { hatchedSectionDrawingOf, hatchesDrawingOf } from "./draw-hatches";
import * as Inputs from "./inputs";
import type * as Models from "./models";

type Point3 = Inputs.Base.Point3;

const plate: Inputs.IO.DrawingHatchDto = {
    boundaries: [
        { segments: [{ points: [[0, 0], [40, 0], [40, 30], [0, 30]], closed: true }] },
        { segments: [{ center: [20, 15], radius: 6 }] },
    ],
    pattern: Inputs.IO.hatchPatternEnum.ansi31,
    angle: 45,
    spacing: 1,
};
const level: Inputs.Base.Frame = { origin: [0, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0] };

const areaOf = (positions: readonly number[], indices: readonly number[]): number => {
    let total = 0;
    for (let at = 0; at < indices.length; at += 3) {
        const [a, b, c] = [indices[at]! * 3, indices[at + 1]! * 3, indices[at + 2]! * 3];
        const u = [positions[b]! - positions[a]!, positions[b + 1]! - positions[a + 1]!, positions[b + 2]! - positions[a + 2]!];
        const v = [positions[c]! - positions[a]!, positions[c + 1]! - positions[a + 1]!, positions[c + 2]! - positions[a + 2]!];
        total += Math.hypot(u[1]! * v[2]! - u[2]! * v[1]!, u[2]! * v[0]! - u[0]! * v[2]!, u[0]! * v[1]! - u[1]! * v[0]!) / 2;
    }
    return total;
};
const lengthOf = (lines: Point3[][]): number => lines.reduce((sum, [start, end]) => sum + Math.hypot(end![0] - start![0], end![1] - start![1], end![2] - start![2]), 0);

describe("hatchesDrawingOf", () => {
    it("should fill a plate with a bore to its area, outline both loops and clip its lines to it, lifted over the plane", () => {
        // Act
        const drawing = hatchesDrawingOf([plate], level, 0.01);
        const heights = new Set([...drawing.lines.flat(), ...drawing.outlines.flat()].map(point => point[2]));
        const fillHeights = new Set(drawing.faces.positions.filter((_, at) => at % 3 === 2));

        // Assert
        expect(areaOf(drawing.faces.positions, drawing.faces.indices)).toBeCloseTo(1200 - Math.PI * 36, 0);
        expect(drawing.ink.indices).toEqual([]);
        expect(drawing.outlines).toHaveLength(2);
        drawing.outlines.forEach(outline => expect(outline[outline.length - 1]).toEqual(outline[0]));
        expect(Math.abs(lengthOf(drawing.lines) * plate.spacing! - (1200 - Math.PI * 36))).toBeLessThan(plate.spacing! * (140 + 12 * Math.PI));
        expect([...fillHeights]).toEqual([0.04]);
        expect([...heights]).toEqual([0.08]);
    });

    it("should place the hatch in a slanted frame's plane, X along its direction and Y along the normal crossed with the direction", () => {
        // Arrange
        const frame: Inputs.Base.Frame = { origin: [1, 2, 3], normal: [0, 2, 0], direction: [0, 0, 5] };
        const square: Inputs.IO.DrawingHatchDto = { boundaries: [{ segments: [{ points: [[0, 0], [4, 0], [4, 2], [0, 2]], closed: true }] }], angle: 0, spacing: 1 };

        // Act
        const drawing = hatchesDrawingOf([square], frame, 0.01);
        const corners = drawing.outlines[0]!.slice(0, 4);

        // Assert
        expect(corners.map(point => point.map(value => Math.round(value * 1e6) / 1e6 + 0))).toEqual([[1, 2.008, 3], [1, 2.008, 7], [3, 2.008, 7], [3, 2.008, 3]]);
        drawing.lines.forEach(([start, end]) => {
            expect(start![2]).toBeCloseTo(3, 9);
            expect(end![2]).toBeCloseTo(7, 9);
            expect(end![0]).toBeCloseTo(start![0], 9);
        });
        expect(drawing.lines.map(([start]) => Math.round(start![0] * 1e6) / 1e6)).toEqual([1.5, 2.5]);
    });

    it("should fill a solid hatch as ink, with no pattern lines", () => {
        // Act
        const drawing = hatchesDrawingOf([{ ...plate, pattern: Inputs.IO.hatchPatternEnum.solid }, plate], level, 0.01);

        // Assert
        expect(areaOf(drawing.ink.positions, drawing.ink.indices)).toBeCloseTo(1200 - Math.PI * 36, 0);
        expect(areaOf(drawing.faces.positions, drawing.faces.indices)).toBeCloseTo(1200 - Math.PI * 36, 0);
        expect(drawing.faces.indices.every(index => index < drawing.faces.positions.length / 3)).toBe(true);
        expect(drawing.outlines).toHaveLength(4);
        expect(lengthOf(drawing.lines)).toBeGreaterThan(0);
    });

    it("should count each fill's corners from its own start when several hatches are filled", () => {
        // Arrange
        const left: Inputs.IO.DrawingHatchDto = { boundaries: [{ segments: [{ points: [[0, 0], [1, 0], [1, 1], [0, 1]], closed: true }] }] };
        const right: Inputs.IO.DrawingHatchDto = { boundaries: [{ segments: [{ points: [[5, 0], [7, 0], [7, 1], [5, 1]], closed: true }] }] };

        // Act
        const drawing = hatchesDrawingOf([left, right], level, 0.01);

        // Assert
        expect(drawing.faces.positions).toHaveLength(24);
        expect(Math.max(...drawing.faces.indices)).toBe(7);
        expect(areaOf(drawing.faces.positions, drawing.faces.indices)).toBeCloseTo(3, 9);
    });

    it("should draw nothing for no hatches, and leave the hatches as they were", () => {
        // Arrange
        const before = JSON.stringify(plate);

        // Act
        const none = hatchesDrawingOf([], level, 0.01);
        hatchesDrawingOf([plate], level, 0.01);

        // Assert
        expect(none).toEqual({ faces: { positions: [], indices: [] }, ink: { positions: [], indices: [] }, lines: [], outlines: [] });
        expect(JSON.stringify(plate)).toBe(before);
    });

    it("should refuse a frame that is not one and a hatch without boundaries, naming it", () => {
        // Act
        const flat = (): unknown => hatchesDrawingOf([plate], { origin: [0, 0, 0], normal: [0, 0, 1], direction: [0, 0, 3] }, 0.01);
        const empty = (): unknown => hatchesDrawingOf([plate, { boundaries: [] }], level, 0.01);

        // Assert
        expect(flat).toThrow(new InputError("`frame` is not a frame: its `direction` runs along its normal or has no length.", "frame"));
        expect(empty).toThrow("`hatches[1].boundaries` must be a list of at least one path.");
    });
});

describe("hatchedSectionDrawingOf", () => {
    it("should draw every cut face of every shape in the section's frame", () => {
        // Arrange
        const shifted: Inputs.IO.DrawingHatchDto = { ...plate, boundaries: [{ segments: [{ points: [[50, 0], [60, 0], [60, 10], [50, 10]], closed: true }] }], angle: 135 };
        const section: Models.OCCT.HatchedSection<string> = {
            frame: level,
            shapes: [{ angle: 45, caps: [{ face: "a", lines: "b", hatch: plate }] }, { angle: 135, caps: [{ face: "c", lines: "d", hatch: shifted }] }, { angle: 45, caps: [] }],
        };

        // Act
        const drawing = hatchedSectionDrawingOf(section, 0.01);

        // Assert
        expect(drawing).toEqual(hatchesDrawingOf([plate, shifted], level, 0.01));
        expect(drawing.outlines).toHaveLength(3);
    });
});
