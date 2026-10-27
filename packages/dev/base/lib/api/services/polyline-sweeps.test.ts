import { describe, expect, it } from "vitest";
import type * as Inputs from "../inputs";
import { InputError } from "../kernel-calls";
import { BaseBitByBit } from "./base-bitbybit";

const base = new BaseBitByBit();
const rounded = (values: readonly number[]): number[] => values.map(value => Number(value.toFixed(9)) + 0);
const HALF = Math.SQRT1_2;

describe("polyline as a path to sweep along", () => {
    it("should head each point along the path, bisecting the segments at a bend", () => {
        // Act
        const tangents = base.polyline.tangents({ polyline: { points: [[0, 0, 0], [1, 0, 0], [1, 1, 0]] } });

        // Assert
        expect(tangents.map(rounded)).toEqual([[1, 0, 0], [HALF, HALF, 0], [0, 1, 0]].map(rounded));
    });

    it("should start along a given start direction, scaled to length 1", () => {
        // Act
        const tangents = base.polyline.tangents({ polyline: { points: [[0, 0, 0], [1, 0, 0]] }, startTangent: [0, 2, 0] });

        // Assert
        expect(tangents[0]).toEqual([0, 1, 0]);
    });

    it("should keep the profile's axis where it started along a straight path", () => {
        // Act
        const frames = base.polyline.sweepFrames({ polyline: { points: [[0, 0, 0], [5, 0, 0], [10, 0, 0]] }, firstDirection: [0, 1, 0] });

        // Assert
        expect(frames.map(frame => [...rounded(frame.normal), ...rounded(frame.direction)])).toEqual([[1, 0, 0, 0, 1, 0], [1, 0, 0, 0, 1, 0], [1, 0, 0, 0, 1, 0]]);
    });

    it("should not twist the profile about a path that bends in one plane", () => {
        // Act
        const frames = base.polyline.sweepFrames({ polyline: { points: [[0, 0, 0], [5, 0, 0], [8, 4, 0], [8, 10, 0]] }, firstDirection: [0, 0, 1] });

        // Assert
        expect(frames.map(frame => rounded(frame.direction))).toEqual([[0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1]]);
        expect(frames.map(frame => rounded([base.vector.dot({ first: frame.normal, second: frame.direction })]))).toEqual([[0], [0], [0], [0]]);
    });

    it("should place the XY plane at each point of a straight path along Z by a move alone", () => {
        // Act
        const placements = base.polyline.sweepPlacements({ polyline: { points: [[0, 0, 0], [0, 0, 5]] }, firstDirection: [1, 0, 0] });

        // Assert
        expect(placements).toEqual([[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 5, 1]]);
    });

    it("should round a corner of a path in space, keeping its ends where they were", () => {
        // Act
        const path = base.polyline.roundCorners({ polyline: { points: [[0, 0, 0], [10, 0, 0], [10, 10, 0]] }, radius: 2, segments: 1 });

        // Assert
        expect(path.points.map(rounded)).toEqual([[0, 0, 0], [8, 0, 0], [10, 2, 0], [10, 10, 0]]);
        expect(path.isClosed).toBe(false);
    });

    it("should round two corners whose arcs meet halfway along their segment into a path the sweep methods and itself take again", () => {
        // Arrange
        const square: Inputs.Base.Point3[] = [[0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0]];

        // Act
        const path = base.polyline.roundCorners({ polyline: { points: square }, radius: 100, segments: 8 });
        const frames = base.polyline.sweepFrames({ polyline: path });
        const tangents = base.polyline.tangents({ polyline: path });
        const again = base.polyline.roundCorners({ polyline: path, radius: 1, segments: 2 });

        // Assert
        expect(path.points).toHaveLength(19);
        expect(path.points[9]).toEqual([10, 5, 0]);
        expect(frames).toHaveLength(19);
        expect(tangents).toHaveLength(19);
        expect([again.points[0], again.points.at(-1)]).toEqual([[0, 0, 0], [0, 10, 0]]);
    });

    it("should refuse a path with two points in one place, naming where", () => {
        // Act
        const refused = (): unknown => base.polyline.sweepFrames({ polyline: { points: [[0, 0, 0], [1, 0, 0], [1, 0, 0]] } });

        // Assert
        expect(refused).toThrow(InputError);
        expect(refused).toThrow("`polyline` has two points in one place, at positions 1 and 2.");
    });

    it("should refuse a closed polyline in each of the four path methods, since a path to sweep along is open", () => {
        // Arrange
        const closed = { points: [[0, 0, 0], [1, 0, 0], [1, 1, 0]] as Inputs.Base.Point3[], isClosed: true };
        const message = "`polyline` is closed; give it as an open path, repeating its first point at the end to follow it all the way round.";

        // Act
        const refusals = [
            (): unknown => base.polyline.tangents({ polyline: closed }),
            (): unknown => base.polyline.sweepFrames({ polyline: closed }),
            (): unknown => base.polyline.sweepPlacements({ polyline: closed }),
            (): unknown => base.polyline.roundCorners({ polyline: closed, radius: 0.2 }),
        ];

        // Assert
        refusals.forEach(refused => expect(refused).toThrow(message));
        expect(refusals[0]).toThrow(InputError);
    });

    it("should refuse a path of one point and a first direction of no length", () => {
        // Arrange
        const flat: Inputs.Base.Vector3 = [0, 0, 0];

        // Act
        const onePoint = (): unknown => base.polyline.tangents({ polyline: { points: [[0, 0, 0]] } });
        const noDirection = (): unknown => base.polyline.sweepFrames({ polyline: { points: [[0, 0, 0], [1, 0, 0]] }, firstDirection: flat });

        // Assert
        expect(onePoint).toThrow("`polyline` does not hold a path of at least two points of three finite numbers.");
        expect(noDirection).toThrow("`firstDirection` is not a direction of three finite numbers with some length.");
    });
});
