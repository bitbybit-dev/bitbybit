import { describe, it, expect, beforeAll } from "vitest";
import { getJscad } from "../__test__/kernel";
import type { Jscad } from "../jscad-service";
import * as Inputs from "../inputs";

const OPEN_CORNER: Inputs.Base.Point2[] = [[0, 0], [4, 0], [4, 3]];
const EXTRA_POINTS: Inputs.Base.Point2[] = [[0, 3]];

describe("JSCADPath", () => {
    let jscad: Jscad;

    beforeAll(async () => {
        ({ jscad } = await getJscad());
    });

    describe("createFromPoints", () => {
        it("should leave an open path one segment short of its point count", () => {
            // Arrange
            const inputs = new Inputs.JSCAD.PathFromPointsDto(OPEN_CORNER, false);

            // Act
            const path = jscad.path.createFromPoints(inputs);

            // Assert
            expect(path.isClosed).toBe(false);
            expect(path.points).toHaveLength(OPEN_CORNER.length);
        });

        it("should mark a path closed when asked", () => {
            // Arrange
            const inputs = new Inputs.JSCAD.PathFromPointsDto(OPEN_CORNER, true);

            // Act
            const path = jscad.path.createFromPoints(inputs);

            // Assert
            expect(path.isClosed).toBe(true);
            expect(path.points).toHaveLength(OPEN_CORNER.length);
        });
    });

    describe("close", () => {
        it("should close an open path without adding a point", () => {
            // Arrange
            const open = jscad.path.createFromPoints(new Inputs.JSCAD.PathFromPointsDto(OPEN_CORNER, false));

            // Act
            const closed = jscad.path.close(new Inputs.JSCAD.PathDto(open));

            // Assert
            expect(closed.isClosed).toBe(true);
            expect(closed.points).toHaveLength(OPEN_CORNER.length);
        });
    });

    describe("appendPoints", () => {
        it("should extend the path by the points given", () => {
            // Arrange
            const open = jscad.path.createFromPoints(new Inputs.JSCAD.PathFromPointsDto(OPEN_CORNER, false));
            const inputs = new Inputs.JSCAD.PathAppendPointsDto(EXTRA_POINTS, open);

            // Act
            const extended = jscad.path.appendPoints(inputs);

            // Assert
            expect(extended.points).toHaveLength(OPEN_CORNER.length + EXTRA_POINTS.length);
            expect(extended.points[extended.points.length - 1]).toEqual(EXTRA_POINTS[0]);
        });

        it("should leave the original path untouched", () => {
            // Arrange
            const open = jscad.path.createFromPoints(new Inputs.JSCAD.PathFromPointsDto(OPEN_CORNER, false));
            const inputs = new Inputs.JSCAD.PathAppendPointsDto(EXTRA_POINTS, open);

            // Act
            jscad.path.appendPoints(inputs);

            // Assert
            expect(open.points).toHaveLength(OPEN_CORNER.length);
        });
    });
});
