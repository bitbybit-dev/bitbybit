import { describe, expect, it } from "vitest";
import { rackOutline, rackSizes } from "./racks";
import type { RackSpec } from "./gear-types";

describe("racks", () => {
    const spec = (overrides: Partial<RackSpec> = {}): RackSpec => ({ module: 2, teeth: 5, pressureAngle: 20, backlash: 0, addendum: 1, dedendum: 1.25, rootFillet: 0.38, height: 6, ...overrides });

    it("should give a rack's pitch, length, tip height, root depth and tooth thickness", () => {
        // Act
        const sizes = rackSizes(spec({ backlash: 0.1 }));

        // Assert
        expect(sizes.pitch).toBeCloseTo(2 * Math.PI, 12);
        expect(sizes.length).toBeCloseTo(10 * Math.PI, 12);
        expect([sizes.tipHeight, sizes.rootDepth]).toEqual([2, 2.5]);
        expect(sizes.toothThickness).toBeCloseTo(Math.PI - 0.1, 12);
    });

    it("should draw a closed outline counterclockwise, its tips on the tip line, its gaps down to the root line and its back below", () => {
        // Act
        const outline = rackOutline(spec());

        // Assert
        const ends = outline.moves.map(move => move.to);
        const last = ends[ends.length - 1]!;
        expect(last).toEqual(outline.start);
        expect(Math.max(...ends.map(point => point[1]))).toBeCloseTo(2, 12);
        expect(Math.min(...ends.filter(point => point[1] > -6).map(point => point[1]))).toBeCloseTo(-2.5, 12);
        expect(outline.moves.filter(move => move.part === "tip")).toHaveLength(5);
        expect(outline.moves.filter(move => move.part === "flank")).toHaveLength(10);
        expect(outline.moves.filter(move => move.part === "side")).toHaveLength(2);
        expect(outline.moves.filter(move => move.part === "back")).toHaveLength(1);
        expect(outline.start).toEqual([-Math.PI, -6]);
        const area = outline.moves.reduce((sum, move, index) => {
            const from = index === 0 ? outline.start : outline.moves[index - 1]!.to;
            return sum + (from[0] * move.to[1] - move.to[0] * from[1]) / 2;
        }, 0);
        expect(area).toBeGreaterThan(0);
    });

    it("should centre its first tooth on the origin, its flanks at the pressure angle", () => {
        // Act
        const outline = rackOutline(spec({ teeth: 1, rootFillet: 0 }));

        // Assert
        const tip = outline.moves.find(move => move.part === "tip")!;
        const halfTip = Math.PI / 2 - 2 * Math.tan(20 * Math.PI / 180);
        expect(tip.to[0]).toBeCloseTo(-halfTip, 12);
        expect(outline.moves.some(move => move.kind === "arc")).toBe(false);
    });

    it("should refuse teeth that come to a point, gaps that close, a back above the gaps and a count that is not whole", () => {
        // Act & Assert
        expect(() => rackOutline(spec({ addendum: 3 }))).toThrow("The teeth come to a point");
        expect(() => rackOutline(spec({ dedendum: 3, height: 8 }))).toThrow("The gaps close");
        expect(() => rackSizes(spec({ height: 2 }))).toThrow("`height` does not reach below the gaps");
        expect(() => rackSizes(spec({ teeth: 2.5 }))).toThrow("`teeth` is not a whole number of at least 1.");
    });

    it("should refuse in its sizes the backlash its outline refuses, and a height that is not finite", () => {
        // Act & Assert
        expect(() => rackSizes(spec({ backlash: 4 }))).toThrow("`backlash` takes the whole tooth away.");
        expect(() => rackSizes(spec({ height: Infinity }))).toThrow("`height` is not a finite number.");
    });
});
