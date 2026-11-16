import { describe, it, expect, beforeAll } from "vitest";
import type { BitbybitOcctModule } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";
import type { PathGroup } from "./path-builder";
import { PathBuilder } from "./path-builder";

describe("PathBuilder groups", () => {
    let och: OccHelper;
    let builder: PathBuilder;

    beforeAll(async () => {
        const occt: BitbybitOcctModule = await createBitbybitOcct();
        och = new OccHelper(occt);
        builder = new PathBuilder(occt, och);
    });

    const square = (x: number, size: number): PathGroup => ({
        makeFaces: false,
        subpaths: [{ start: [x, 0], closed: true, segments: [{ type: "line", to: [x + size, 0] }, { type: "line", to: [x + size, size] }, { type: "line", to: [x, size] }] }],
    });
    const nothing = (): PathGroup => ({ makeFaces: false, subpaths: [{ start: [5, 5], closed: false, segments: [{ type: "line", to: [5, 5] }] }] });

    it("should keep every group's shape at its group's index when a group makes no wire", () => {
        // Arrange
        const groups = [nothing(), square(0, 10), nothing(), square(100, 20)];

        // Act
        const built = builder.buildGroups(groups, { scale: 1, flipY: false, origin: [0, 0, 0] }, { joinSegments: true, tolerance: 1e-7, warnings: [] });

        // Assert
        expect(built.map((b) => b === undefined)).toEqual([true, false, true, false]);
        expect(och.wiresService.getWireLength({ shape: built[1]!.shape })).toBeCloseTo(40, 9);
        expect(och.wiresService.getWireLength({ shape: built[3]!.shape })).toBeCloseTo(80, 9);
        expect(built.every((b) => b === undefined || och.enumService.getShapeTypeEnum(b.shape) === Inputs.OCCT.shapeTypeEnum.wire)).toBe(true);
        built.forEach((b) => b?.shape.delete());
    });
});
