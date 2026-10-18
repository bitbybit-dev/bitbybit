import { describe, expect, it } from "vitest";
import type * as Inputs from "../inputs";
import { InputError } from "../kernel-calls";
import { BaseBitByBit } from "./base-bitbybit";

const base = new BaseBitByBit();
const SQUARE: Inputs.Base.Point2[] = [[0, 0], [4, 0], [4, 4], [0, 4]];
const TEN: Inputs.Base.Point2[] = [[0, 0], [10, 0], [10, 10], [0, 10]];

describe("polyline on flat outlines", () => {
    it("should give a counter-clockwise outline a positive area and the same outline reversed a negative one", () => {
        // Act
        const forward = base.polyline.signedArea2d({ points: SQUARE });
        const backward = base.polyline.signedArea2d({ points: [...SQUARE].reverse() });

        // Assert
        expect([forward, backward]).toEqual([16, -16]);
    });

    it("should measure around an outline, its closing side included", () => {
        // Act
        const around = base.polyline.perimeter2d({ points: [[0, 0], [3, 0], [3, 4]] });

        // Assert
        expect(around).toBe(12);
    });

    it("should find a point in the arm of an L inside and one in its notch outside", () => {
        // Arrange
        const ell: Inputs.Base.Point2[] = [[0, 0], [6, 0], [6, 2], [2, 2], [2, 6], [0, 6]];

        // Act
        const arm = base.polyline.isPointInside2d({ points: ell, point: [1, 5] });
        const notch = base.polyline.isPointInside2d({ points: ell, point: [4, 4] });

        // Assert
        expect([arm, notch]).toEqual([true, false]);
    });

    it("should reverse an outline only when it runs the other way than asked", () => {
        // Arrange
        const clockwise: Inputs.Base.Point2[] = [[0, 0], [0, 4], [4, 4], [4, 0]];

        // Act
        const turned = base.polyline.orient2d({ points: clockwise, counterClockwise: true });
        const kept = base.polyline.orient2d({ points: clockwise, counterClockwise: false });

        // Assert
        expect(turned).toEqual([[4, 0], [4, 4], [0, 4], [0, 0]]);
        expect(kept).toEqual(clockwise);
    });

    it("should round each corner of a square, a single straight piece per quarter cutting a 2 by 2 corner off each", () => {
        // Act
        const rounded = base.polyline.roundCorners2d({ points: TEN, radius: 2, segments: 1 });

        // Assert
        expect(rounded).toHaveLength(8);
        expect(base.polyline.signedArea2d({ points: rounded })).toBeCloseTo(92, 9);
    });

    it("should take a radius per corner, leaving a corner with radius 0 sharp", () => {
        // Act
        const rounded = base.polyline.roundCorners2d({ points: TEN, radiusList: [0, 2, 0, 0], segments: 4 });

        // Assert
        expect(rounded).toHaveLength(8);
        expect(rounded[0]).toEqual([0, 0]);
    });

    it("should round a square whose arcs fill its sides into an outline it takes again", () => {
        // Act
        const rounded = base.polyline.roundCorners2d({ points: SQUARE, radius: 2, segments: 8 });
        const again = base.polyline.roundCorners2d({ points: rounded, radius: 0.1, segments: 2 });

        // Assert
        expect(rounded).toHaveLength(32);
        expect(base.polyline.signedArea2d({ points: again })).toBeCloseTo(base.polyline.signedArea2d({ points: rounded }), 3);
    });

    it("should refuse a radius that does not fit beside its corner and a radius list of the wrong length", () => {
        // Act
        const tooLarge = (): unknown => base.polyline.roundCorners2d({ points: TEN, radius: 11 });
        const shortList = (): unknown => base.polyline.roundCorners2d({ points: TEN, radiusList: [1, 1] });

        // Assert
        expect(tooLarge).toThrow(InputError);
        expect(tooLarge).toThrow(/^`radius` is too large for a corner: /);
        expect(shortList).toThrow("`radiusList` does not hold one radius of 0 or more for each point.");
    });

    it("should refuse a single radius below 0 or not a number in words about `radius` alone", () => {
        // Act
        const negative = (): unknown => base.polyline.roundCorners2d({ points: TEN, radius: -1 });
        const notANumber = (): unknown => base.polyline.roundCorners2d({ points: TEN, radius: Number.NaN });

        // Assert
        expect(negative).toThrow("`radius` is not a number of 0 or more.");
        expect(notANumber).toThrow("`radius` is not a number of 0 or more.");
    });

    it("should refuse radii whose arcs overlap on a side and an outline that repeats a point", () => {
        // Act
        const overlapping = (): unknown => base.polyline.roundCorners2d({ points: [[0, 0], [10, 0], [10, 4], [0, 4]], radius: 2.5 });
        const repeated = (): unknown => base.polyline.roundCorners2d({ points: [[0, 0], [10, 0], [10, 0], [10, 10]], radius: 1 });

        // Assert
        expect(overlapping).toThrow("`radius` is too large for a corner: the arcs at the points at positions 1 and 2 need 5 of the side between them, which is 4 long.");
        expect(repeated).toThrow(InputError);
        expect(repeated).toThrow("`points` holds the same point at positions 1 and 2, so the corner between them has no sides: remove one of them.");
    });

    it("should refuse an outline of fewer than three points", () => {
        // Act
        const refused = (): unknown => base.polyline.signedArea2d({ points: [[0, 0], [1, 1]] });

        // Assert
        expect(refused).toThrow("`points` does not hold an outline of at least three points of two finite numbers.");
    });
});
