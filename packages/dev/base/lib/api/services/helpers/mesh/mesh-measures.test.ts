import { describe, expect, it } from "vitest";
import { signedVolumeOf } from "./mesh-measures";

const TETRAHEDRON = [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1];
const OUTWARD = [0, 2, 1, 0, 1, 3, 0, 3, 2, 1, 2, 3];

describe("signedVolumeOf", () => {
    it("should give the volume a closed mesh encloses, positive when its triangles face outwards", () => {
        // Act
        const outward = signedVolumeOf(TETRAHEDRON, OUTWARD);
        const inward = signedVolumeOf(TETRAHEDRON, [0, 1, 2, 0, 3, 1, 0, 2, 3, 1, 3, 2]);

        // Assert
        expect(outward).toBeCloseTo(1 / 6, 15);
        expect(inward).toBeCloseTo(-1 / 6, 15);
    });

    it("should measure only the triangles of the range it is given, and nothing for an empty one", () => {
        // Arrange
        const moved = TETRAHEDRON.map((value, at) => (at % 3 === 0 ? value + 1000 : value));
        const twice = [...OUTWARD, ...OUTWARD.map((index) => index + 4)];

        // Act
        const first = signedVolumeOf([...TETRAHEDRON, ...moved], twice, 0, 12);
        const second = signedVolumeOf([...TETRAHEDRON, ...moved], twice, 12);
        const none = signedVolumeOf(TETRAHEDRON, OUTWARD, 6, 6);

        // Assert
        expect(first).toBeCloseTo(1 / 6, 9);
        expect(second).toBeCloseTo(1 / 6, 9);
        expect(none).toBe(0);
    });
});
