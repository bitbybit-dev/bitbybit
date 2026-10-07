import type { Base } from "@bitbybit-dev/base";
import { length2, subtract2 } from "@bitbybit-dev/base/lib/api/services/helpers/vectors";
import { describe, expect, it } from "vitest";
import { rounded } from "../__test__/build-geometry";
import type { Line2 } from "./build-types";
import { normalize2 } from "./math";
import type { WallGeometry } from "./build-types";
import { axisLine, buttCut, endPoint, footprintOf, mitreCut, sideLine } from "./wall-geometry";

const PARALLEL = 1e-9;
const TOLERANCE = 0.001;
const RIGHT_LOW = -200;
const RIGHT_HIGH = 0;

function wallGeometry(start: Base.Point2, end: Base.Point2, low: number, high: number): WallGeometry {
    const direction = normalize2(subtract2(end, start));
    return {
        wall: 1,
        frame: { origin: [start[0], start[1], 0], x: [direction[0], direction[1], 0], y: [-direction[1], direction[0], 0], z: [0, 0, 1] },
        start,
        end,
        direction,
        length: length2(subtract2(end, start)),
        low,
        high,
        height: 3000,
        base: 0,
        body: undefined,
        usage: 2,
    };
}

function lineOf(line: Line2 | undefined): number[][] {
    if (!line) {
        throw new Error("Expected a line");
    }
    return rounded([line.point, line.direction]);
}

describe("sideLine and endPoint", () => {
    it("should offset a side line to the left of the axis by a positive amount", () => {
        // Arrange
        const north = wallGeometry([0, 0], [0, 5000], RIGHT_LOW, RIGHT_HIGH);

        // Act
        const outer = sideLine(north, -200);

        // Assert
        expect(lineOf(outer)).toEqual([[200, 0], [0, 1]]);
        expect(lineOf(axisLine(north))).toEqual([[0, 0], [0, 1]]);
    });

    it("should give a wall's start and end by their names", () => {
        // Arrange
        const wall = wallGeometry([1, 2], [3, 4], RIGHT_LOW, RIGHT_HIGH);

        // Act
        const ends = [endPoint(wall, "ATSTART"), endPoint(wall, "ATEND")];

        // Assert
        expect(ends).toEqual([[1, 2], [3, 4]]);
    });
});

describe("mitreCut", () => {
    it("should cut from the inner corner to the outer corner where one wall ends and the next starts", () => {
        // Arrange
        const south = wallGeometry([0, 0], [10000, 0], RIGHT_LOW, RIGHT_HIGH);
        const east = wallGeometry([10000, 0], [10000, 8000], RIGHT_LOW, RIGHT_HIGH);

        // Act
        const cut = mitreCut(south, "ATEND", east, "ATSTART", TOLERANCE, PARALLEL);

        // Assert
        expect(lineOf(cut)).toEqual(rounded([[10000, 0], [Math.SQRT1_2, -Math.SQRT1_2]]));
    });

    it("should pair the opposite faces of two walls that start at the same corner", () => {
        // Arrange
        const south = wallGeometry([0, 0], [10000, 0], -100, 100);
        const west = wallGeometry([0, 0], [0, 8000], -100, 100);

        // Act
        const cut = mitreCut(south, "ATSTART", west, "ATSTART", TOLERANCE, PARALLEL);

        // Assert
        expect(lineOf(cut)).toEqual(rounded([[100, 100], [-Math.SQRT1_2, -Math.SQRT1_2]]));
    });

    it("should give no cut between two walls in one line", () => {
        // Arrange
        const first = wallGeometry([0, 0], [5000, 0], RIGHT_LOW, RIGHT_HIGH);
        const second = wallGeometry([5000, 0], [10000, 0], RIGHT_LOW, RIGHT_HIGH);

        // Act
        const cut = mitreCut(first, "ATEND", second, "ATSTART", TOLERANCE, PARALLEL);

        // Assert
        expect(cut).toBeUndefined();
    });
});

describe("buttCut", () => {
    it("should cut a stem coming from the left of the other wall back to that wall's left face", () => {
        // Arrange
        const main = wallGeometry([0, 0], [10000, 0], -100, 100);
        const stem = wallGeometry([5000, 4000], [5000, 0], -50, 50);

        // Act
        const cut = buttCut(stem, "ATEND", main);

        // Assert
        expect(lineOf(cut)).toEqual([[0, 100], [1, 0]]);
    });

    it("should cut a stem coming from the right of the other wall back to that wall's right face", () => {
        // Arrange
        const main = wallGeometry([0, 0], [10000, 0], -100, 100);
        const stem = wallGeometry([5000, 0], [5000, -4000], -50, 50);

        // Act
        const cut = buttCut(stem, "ATSTART", main);

        // Assert
        expect(lineOf(cut)).toEqual([[0, -100], [1, 0]]);
    });
});

describe("footprintOf", () => {
    it("should square both ends of a wall without cuts", () => {
        // Arrange
        const wall = wallGeometry([2000, 1000], [2000, 6000], RIGHT_LOW, RIGHT_HIGH);

        // Act
        const footprint = footprintOf(wall, { start: undefined, end: undefined }, TOLERANCE, PARALLEL);

        // Assert
        expect(rounded(footprint)).toEqual([[0, -200], [5000, -200], [5000, 0], [0, 0]]);
    });

    it("should mitre the end of a wall along its cut, in the wall's own coordinates", () => {
        // Arrange
        const south = wallGeometry([0, 0], [10000, 0], RIGHT_LOW, RIGHT_HIGH);
        const east = wallGeometry([10000, 0], [10000, 8000], RIGHT_LOW, RIGHT_HIGH);

        // Act
        const footprint = footprintOf(east, { start: mitreCut(east, "ATSTART", south, "ATEND", TOLERANCE, PARALLEL), end: undefined }, TOLERANCE, PARALLEL);

        // Assert
        expect(rounded(footprint)).toEqual([[-200, -200], [8000, -200], [8000, 0], [0, 0]]);
    });

    it("should fall back to a square end when a cut runs along the wall's faces", () => {
        // Arrange
        const wall = wallGeometry([0, 0], [1000, 0], RIGHT_LOW, RIGHT_HIGH);
        const alongTheWall: Line2 = { point: [500, -500], direction: [1, 0] };

        // Act
        const footprint = footprintOf(wall, { start: undefined, end: alongTheWall }, TOLERANCE, PARALLEL);

        // Assert
        expect(rounded(footprint)).toEqual([[0, -200], [1000, -200], [1000, 0], [0, 0]]);
    });

    it("should refuse cuts that leave a face of the wall with no length", () => {
        // Arrange
        const wall = wallGeometry([0, 0], [1000, 0], RIGHT_LOW, RIGHT_HIGH);
        const across: Base.Vector2 = [0, 1];

        // Act & Assert
        expect(() => footprintOf(wall, { start: { point: [600, 0], direction: across }, end: { point: [400, 0], direction: across } }, TOLERANCE, PARALLEL))
            .toThrow("The joins of wall #1 leave it with no length on one face");
    });
});
