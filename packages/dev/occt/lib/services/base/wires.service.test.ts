import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";

describe("WiresService", () => {
    let helper: OccHelper;

    beforeAll(async () => {
        helper = new OccHelper(await createBitbybitOcct());
    });

    const thrownBy = (action: () => unknown): unknown => {
        try {
            action();
        } catch (error) {
            return error;
        }
        return undefined;
    };

    it.each([
        ["through the points", (): unknown => helper.wiresService.interpolatePoints({ points: [[0, 0, 0], [0, 0, 0], [5, 0, 0], [5, 5, 0]], periodic: false, tolerance: 1e-7 })],
        ["symmetrically through the points", (): unknown => helper.wiresService.interpolatePointsSymmetric({ points: [[0, 0, 0], [0, 0, 0], [5, 0, 0], [5, 5, 0]], tolerance: 1e-7 })],
    ])("should hand on the kernel's refusal to interpolate %s that repeat a point as a read error, not a raw C++ exception", (_name, interpolate) => {
        // Act
        const thrown = thrownBy(interpolate);

        // Assert
        expect(thrown).toBeInstanceOf(Error);
        expect((thrown as Error).message).toMatch(/two consecutive points lie within the tolerance/);
    });
});
