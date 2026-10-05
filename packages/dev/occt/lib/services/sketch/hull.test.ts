import { describe, it, expect } from "vitest";
import type { HullPart } from "./hull";
import { hullOf } from "./hull";
import type { ArcPiece } from "./outline";
import { signedArea } from "./outline";

const point = (x: number, y: number): HullPart => ({ kind: "point", at: [x, y] });
const disc = (x: number, y: number, radius: number): HullPart => ({ kind: "disc", center: [x, y], radius });

describe("sketch hull", () => {
    it("should wrap points in straight pieces running counterclockwise, leaving out what lies inside", () => {
        // Arrange
        const parts = [point(0, 0), point(10, 0), point(10, 10), point(0, 10), point(4, 6)];

        // Act
        const hull = hullOf(parts);

        // Assert
        expect(hull).toBeDefined();
        expect(hull!.closed).toBe(true);
        expect(hull!.pieces).toHaveLength(4);
        expect(hull!.pieces.every(piece => piece.kind === "line")).toBe(true);
        expect(signedArea(hull!.pieces)).toBeCloseTo(100, 10);
    });

    it("should run straight past points that lie on a side", () => {
        // Arrange
        const parts = [point(0, 0), point(5, 0), point(10, 0), point(10, 10), point(0, 10), point(0, 5)];

        // Act
        const hull = hullOf(parts);

        // Assert
        expect(hull!.pieces).toHaveLength(4);
        expect(signedArea(hull!.pieces)).toBeCloseTo(100, 10);
    });

    it("should wrap a lone circle in one full arc", () => {
        // Arrange
        const parts = [disc(3, 4, 2)];

        // Act
        const hull = hullOf(parts);

        // Assert
        expect(hull!.pieces).toHaveLength(1);
        const arc = hull!.pieces[0] as ArcPiece;
        expect(arc.kind).toBe("arc");
        expect(arc.sweep).toBeCloseTo(2 * Math.PI, 10);
        expect(signedArea(hull!.pieces)).toBeCloseTo(4 * Math.PI, 10);
    });

    it("should wrap a circle and a point outside it in two tangents and the arc between them", () => {
        // Arrange
        const parts = [disc(0, 0, 5), point(13, 0)];

        // Act
        const hull = hullOf(parts);

        // Assert
        const tangent = Math.sqrt(169 - 25);
        const half = Math.acos(5 / 13);
        const expected = tangent * 5 + (2 * Math.PI - 2 * half) * 25 / 2;
        expect(hull!.pieces.map(piece => piece.kind).sort()).toEqual(["arc", "line", "line"]);
        expect(signedArea(hull!.pieces)).toBeCloseTo(expected, 10);
    });

    it("should leave a circle inside another out of the hull", () => {
        // Arrange
        const parts = [disc(0, 0, 5), disc(1, 1, 1)];

        // Act
        const hull = hullOf(parts);

        // Assert
        expect(signedArea(hull!.pieces)).toBeCloseTo(25 * Math.PI, 10);
    });

    it("should follow an arc only over the directions it covers, either way it was drawn", () => {
        // Arrange
        const upper: HullPart = { kind: "disc", center: [0, 0], radius: 5, range: { from: 0, span: Math.PI } };
        const lower: HullPart = { kind: "disc", center: [0, 0], radius: 5, range: { from: Math.PI, span: Math.PI / 2 } };
        const withUpper = [upper, point(5, 0), point(-5, 0), point(0, -5)];
        const withLower = [lower, point(-5, 0), point(0, -5), point(5, 0)];

        // Act
        const upperHull = hullOf(withUpper);
        const lowerHull = hullOf(withLower);

        // Assert
        expect(signedArea(upperHull!.pieces)).toBeCloseTo(25 * Math.PI / 2 + 25, 10);
        expect(signedArea(lowerHull!.pieces)).toBeCloseTo(25 * Math.PI / 4 + 12.5, 10);
    });

    it("should give nothing when there is nothing to wrap", () => {
        // Arrange
        const parts: HullPart[] = [];
        const uncovered: HullPart[] = [{ kind: "disc", center: [0, 0], radius: 1, range: { from: 2, span: 1 } }];

        // Act
        const results = [hullOf(parts), hullOf(uncovered)];

        // Assert
        expect(results).toEqual([undefined, undefined]);
    });
});
