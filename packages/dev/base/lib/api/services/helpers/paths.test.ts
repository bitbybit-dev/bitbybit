import { describe, expect, it } from "vitest";
import type * as Inputs from "../../inputs";
import { pathLength3, pathTangents, roundedPath3, sweepMatrices, transportedAxes } from "./paths";

const L_PATH: Inputs.Base.Point3[] = [[0, 0, 0], [1, 0, 0], [1, 1, 0]];

function near(values: readonly number[]): unknown[] {
    return values.map((value) => expect.closeTo(value, 9));
}

describe("pathLength3", () => {
    it("should add up the lengths of a path's segments, a lone point or no point measuring nothing", () => {
        // Act
        const lengths = [pathLength3([[0, 0, 0], [3, 4, 0], [3, 4, 12]]), pathLength3([[1, 1, 1]]), pathLength3([])];

        // Assert
        expect(lengths).toEqual([17, 0, 0]);
    });
});

describe("pathTangents and transportedAxes", () => {
    it("should point along each segment at the ends and halfway between the segments at a corner", () => {
        // Act
        const tangents = pathTangents(L_PATH);

        // Assert
        expect(tangents).toEqual([near([1, 0, 0]), near([Math.SQRT1_2, Math.SQRT1_2, 0]), near([0, 1, 0])]);
    });

    it("should take the end tangents it is given, as a curve's own tangents, instead of its first and last segments", () => {
        // Act
        const tangents = pathTangents(L_PATH, [2, 0, 0], [0, 0, 3]);

        // Assert
        expect([tangents[0], tangents[2]]).toEqual([[1, 0, 0], [0, 0, 1]]);
    });

    it("should keep the next segment's direction where a path turns straight back, and carry an axis unturned along a straight path", () => {
        // Arrange
        const back: Inputs.Base.Point3[] = [[0, 0, 0], [1, 0, 0], [0, 0, 0]];
        const straight: Inputs.Base.Point3[] = [[0, 0, 0], [1, 0, 0], [2, 0, 0]];

        // Act
        const tangents = pathTangents(back);
        const axes = transportedAxes(straight, pathTangents(straight), [0, 1, 0]);
        const matrices = sweepMatrices(back, tangents, transportedAxes(back, tangents, [0, 1, 0]));

        // Assert
        expect(tangents[1]).toEqual(near([-1, 0, 0]));
        expect(axes).toEqual([near([0, 1, 0]), near([0, 1, 0]), near([0, 1, 0])]);
        expect(matrices).toHaveLength(3);
    });

    it("should carry an axis round a turn without twisting it, keeping one square to a flat path where it is", () => {
        // Arrange
        const tangents = pathTangents(L_PATH);

        // Act
        const inPlane = transportedAxes(L_PATH, tangents, [0, 1, 0]);
        const upright = transportedAxes(L_PATH, tangents, [0, 0, 1]);

        // Assert
        expect(inPlane.at(-1)).toEqual(near([-1, 0, 0]));
        expect(upright).toEqual([near([0, 0, 1]), near([0, 0, 1]), near([0, 0, 1])]);
    });

    it("should square a first axis that leans along the path, and pick one when it lies along it", () => {
        // Arrange
        const tangents = pathTangents(L_PATH);

        // Act
        const [leaning] = transportedAxes(L_PATH, tangents, [1, 1, 0]);
        const [along] = transportedAxes(L_PATH, tangents, [2, 0, 0]);

        // Assert
        expect(leaning).toEqual(near([0, 1, 0]));
        expect(along?.[0]).toBeCloseTo(0, 12);
    });
});

describe("sweepMatrices", () => {
    it("should place each section square to the path and stretch a corner's section across the bend so a tube keeps its width", () => {
        // Arrange
        const tangents = pathTangents(L_PATH);

        // Act
        const [start, corner] = sweepMatrices(L_PATH, tangents, transportedAxes(L_PATH, tangents, [0, 0, 1]));

        // Assert
        expect(start).toEqual(near([0, 0, 1, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1]));
        expect(corner?.slice(0, 3)).toEqual(near([0, 0, 1]));
        expect(Math.hypot(corner![4], corner![5], corner![6])).toBeCloseTo(Math.SQRT2, 9);
        expect(corner?.slice(8, 15)).toEqual(near([Math.SQRT1_2, Math.SQRT1_2, 0, 0, 1, 0, 0]));
    });
});

describe("roundedPath3", () => {
    it("should round a corner by an arc of the radius, meeting both segments where they are tangent to it", () => {
        // Act
        const rounded = roundedPath3(L_PATH, 0.5, () => 4);

        // Assert
        expect(rounded[0]).toEqual([0, 0, 0]);
        expect(rounded.slice(1, 6).map(([x, y]) => Math.hypot(x - 0.5, y - 0.5))).toEqual(near([0.5, 0.5, 0.5, 0.5, 0.5]));
        expect(rounded[1]).toEqual(near([0.5, 0, 0]));
        expect(rounded[5]).toEqual(near([1, 0.5, 0]));
        expect(rounded.at(-1)).toEqual([1, 1, 0]);
    });

    it("should shrink a radius too large for its segments, and keep a straight path or a radius of nothing as it is", () => {
        // Act
        const tight = roundedPath3(L_PATH, 10, () => 2);
        const straight = roundedPath3([[0, 0, 0], [1, 0, 0], [2, 0, 0]], 1, () => 4);
        const sharp = roundedPath3(L_PATH, 0, () => 4);

        // Assert
        expect(tight[1]).toEqual(near([0.5, 0, 0]));
        expect(tight[3]).toEqual(near([1, 0.5, 0]));
        expect(straight).toEqual([[0, 0, 0], [1, 0, 0], [2, 0, 0]]);
        expect(sharp).toEqual(L_PATH);
    });
});
