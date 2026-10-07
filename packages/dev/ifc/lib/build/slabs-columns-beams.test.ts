import type { Base } from "@bitbybit-dev/base";
import { cross3, dot3, length3 } from "@bitbybit-dev/base/lib/api/services/helpers/vectors";
import { describe, expect, it } from "vitest";
import { rounded } from "../__test__/build-geometry";
import type { Frame3 } from "./build-types";
import { memberFrame } from "./slabs-columns-beams";

function axesOf(frame: Frame3): number[][] {
    return rounded([frame.x, frame.y, frame.z]);
}

describe("memberFrame", () => {
    it("should stand an upright member with its section's X to the east", () => {
        // Act
        const frame = memberFrame([1, 2, 0], [1, 2, 5], 0);

        // Assert
        expect(frame.origin).toEqual([1, 2, 0]);
        expect(axesOf(frame)).toEqual([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
    });

    it("should keep a member hanging straight down right-handed", () => {
        // Act
        const frame = memberFrame([0, 0, 5], [0, 0, 0], 0);

        // Assert
        expect(axesOf(frame)).toEqual([[1, 0, 0], [0, -1, 0], [0, 0, -1]]);
    });

    it("should lay a level member's section X level and its Y up", () => {
        // Act
        const frame = memberFrame([0, 0, 0], [5000, 0, 0], 0);

        // Assert
        expect(axesOf(frame)).toEqual([[0, 1, 0], [0, 0, 1], [1, 0, 0]]);
    });

    it.each([
        [90, [[0, 0, 1], [0, -1, 0], [1, 0, 0]]],
        [180, [[0, -1, 0], [0, 0, -1], [1, 0, 0]]],
        [-90, [[0, 0, -1], [0, 1, 0], [1, 0, 0]]],
    ])("should turn the section %s degrees about the member's axis", (rotation, axes) => {
        // Act
        const frame = memberFrame([0, 0, 0], [5000, 0, 0], rotation);

        // Assert
        expect(axesOf(frame)).toEqual(axes);
    });

    it("should give an orthonormal right-handed frame for a member in any direction", () => {
        // Arrange
        const start: Base.Point3 = [100, -200, 300];
        const end: Base.Point3 = [1300, 700, 2300];

        // Act
        const frame = memberFrame(start, end, 37);

        // Assert
        expect([length3(frame.x), length3(frame.y), length3(frame.z)].map((value) => Math.round(value * 1e9) / 1e9)).toEqual([1, 1, 1]);
        expect([dot3(frame.x, frame.y), dot3(frame.y, frame.z), dot3(frame.z, frame.x)].map((value) => Math.round(value * 1e9) / 1e9 + 0)).toEqual([0, 0, 0]);
        expect(rounded([cross3(frame.x, frame.y)])).toEqual(rounded([frame.z]));
    });

    it("should refuse a member whose start and end are the same point", () => {
        // Act & Assert
        expect(() => memberFrame([1, 1, 1], [1, 1, 1], 0)).toThrow("A member's start and end must be apart");
    });
});
