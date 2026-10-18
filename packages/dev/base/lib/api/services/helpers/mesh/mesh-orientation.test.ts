import { describe, expect, it } from "vitest";
import { windingComponents, windingRepairs } from "./mesh-orientation";

const CUBE_POSITIONS = [0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1];
const CUBE_OUTWARD = [
    0, 2, 1, 0, 3, 2,
    4, 5, 6, 4, 6, 7,
    0, 1, 5, 0, 5, 4,
    1, 2, 6, 1, 6, 5,
    2, 3, 7, 2, 7, 6,
    3, 0, 4, 3, 4, 7,
];

function turned(indices: number[], triangles: readonly number[]): number[] {
    const out = [...indices];
    for (const triangle of triangles) {
        [out[triangle * 3 + 1], out[triangle * 3 + 2]] = [out[triangle * 3 + 2]!, out[triangle * 3 + 1]!];
    }
    return out;
}

function applied(indices: readonly number[], flips: Uint8Array): number[] {
    return turned([...indices], [...flips].flatMap((flip, triangle) => (flip ? [triangle] : [])));
}

describe("windingComponents", () => {
    it("should turn over the faces of a cube that wind against their neighbours, keeping the first triangle as it is", () => {
        // Arrange
        const mixed = turned(CUBE_OUTWARD, [2, 3, 8, 9]);

        // Act
        const { flips, component, count } = windingComponents(mixed);

        // Assert
        expect(count).toBe(1);
        expect([...component]).toEqual(Array(12).fill(0));
        expect([...flips]).toEqual([0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0]);
        expect(applied(mixed, flips)).toEqual(CUBE_OUTWARD);
    });

    it("should leave a mesh wound one way throughout as it is, even when that way is inward", () => {
        // Arrange
        const inward = turned(CUBE_OUTWARD, [...Array(12).keys()]);

        // Act
        const { flips } = windingComponents(inward);

        // Assert
        expect([...flips].every((flip) => flip === 0)).toBe(true);
    });

    it("should give each separate piece its own number and read only the range asked for", () => {
        // Arrange
        const second = CUBE_OUTWARD.map((index) => index + 8);
        const indices = [9, 9, 9, ...CUBE_OUTWARD, ...turned(second, [0])];

        // Act
        const { flips, component, count } = windingComponents(indices, 3);

        // Assert
        expect(count).toBe(2);
        expect([...component.slice(0, 12)]).toEqual(Array(12).fill(0));
        expect([...component.slice(12)]).toEqual(Array(12).fill(1));
        expect([...flips.slice(12)]).toEqual([0, ...Array(11).fill(1)]);
    });

    it("should not follow an edge three triangles share, nor an edge of a triangle whose corners meet", () => {
        // Arrange
        const indices = [0, 1, 2, 1, 0, 3, 0, 1, 4, 5, 5, 6];

        // Act
        const { component, count } = windingComponents(indices);

        // Assert
        expect(count).toBe(4);
        expect([...component]).toEqual([0, 1, 2, 3]);
    });

    it("should give nothing for an empty range", () => {
        // Act
        const { flips, count } = windingComponents([], 0, 0);

        // Assert
        expect(flips).toHaveLength(0);
        expect(count).toBe(0);
    });
});

describe("windingRepairs", () => {
    it("should mend the faces of a cube that wind against most of its area", () => {
        // Arrange
        const mixed = turned(CUBE_OUTWARD, [2, 3, 8, 9]);

        // Act
        const repairs = windingRepairs(CUBE_POSITIONS, mixed);

        // Assert
        expect(applied(mixed, repairs)).toEqual(CUBE_OUTWARD);
    });

    it("should keep the winding most of a piece has even when the first triangle is the one written wrong", () => {
        // Arrange
        const mixed = turned(CUBE_OUTWARD, [0]);

        // Act
        const repairs = windingRepairs(CUBE_POSITIONS, mixed);

        // Assert
        expect([...repairs]).toEqual([1, ...Array(11).fill(0)]);
        expect(applied(mixed, repairs)).toEqual(CUBE_OUTWARD);
    });

    it("should leave a hollow body as it is: the outside wound outward and the inside, a piece of its own, inward", () => {
        // Arrange
        const inner = CUBE_POSITIONS.map((value) => 0.25 + value * 0.5);
        const positions = [...CUBE_POSITIONS, ...inner];
        const indices = [...CUBE_OUTWARD, ...turned(CUBE_OUTWARD.map((index) => index + 8), [...Array(12).keys()])];

        // Act
        const repairs = windingRepairs(positions, indices);

        // Assert
        expect([...repairs].every((repair) => repair === 0)).toBe(true);
    });

    it("should give nothing to mend in an empty range", () => {
        // Act
        const repairs = windingRepairs([], [], 0, 0);

        // Assert
        expect(repairs).toHaveLength(0);
    });
});
