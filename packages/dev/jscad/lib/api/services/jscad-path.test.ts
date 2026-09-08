import { describe, it, expect, beforeAll } from "vitest";
import { expectPath, getJscad } from "../__test__/kernel";
import type { Jscad } from "../jscad-service";
import * as Inputs from "../inputs";

const OPEN_CORNER: Inputs.Base.Point2[] = [[0, 0], [4, 0], [4, 3]];
// The same corner as a polyline, which carries its points in three dimensions.
const OPEN_CORNER_3D: Inputs.Base.Point3[] = [[0, 0, 0], [4, 0, 0], [4, 3, 0]];
const EXTRA_POINTS_3D: Inputs.Base.Point3[] = [[0, 3, 0]];
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
            const path = expectPath(jscad.path.createFromPoints(inputs));

            // Assert
            expect(path.isClosed).toBe(false);
            expect(path.points).toHaveLength(OPEN_CORNER_3D.length);
        });

        it("should mark a path closed when asked", () => {
            // Arrange
            const inputs = new Inputs.JSCAD.PathFromPointsDto(OPEN_CORNER, true);

            // Act
            const path = expectPath(jscad.path.createFromPoints(inputs));

            // Assert
            expect(path.isClosed).toBe(true);
            expect(path.points).toHaveLength(OPEN_CORNER_3D.length);
        });
    });

    describe("close", () => {
        it("should close an open path without adding a point", () => {
            // Arrange
            const open = expectPath(jscad.path.createFromPoints(new Inputs.JSCAD.PathFromPointsDto(OPEN_CORNER, false)));

            // Act
            const closed = expectPath(jscad.path.close(new Inputs.JSCAD.PathDto(open)));

            // Assert
            expect(closed.isClosed).toBe(true);
            expect(closed.points).toHaveLength(OPEN_CORNER.length);
        });
    });

    describe("appendPoints", () => {
        it("should extend the path by the points given", () => {
            // Arrange
            const open = expectPath(jscad.path.createFromPoints(new Inputs.JSCAD.PathFromPointsDto(OPEN_CORNER, false)));
            const inputs = new Inputs.JSCAD.PathAppendPointsDto(EXTRA_POINTS, open);

            // Act
            const extended = expectPath(jscad.path.appendPoints(inputs));

            // Assert
            expect(extended.points).toHaveLength(OPEN_CORNER.length + EXTRA_POINTS.length);
            expect(extended.points[extended.points.length - 1]).toEqual(EXTRA_POINTS[0]);
        });

        it("should leave the original path untouched", () => {
            // Arrange
            const open = expectPath(jscad.path.createFromPoints(new Inputs.JSCAD.PathFromPointsDto(OPEN_CORNER, false)));
            const inputs = new Inputs.JSCAD.PathAppendPointsDto(EXTRA_POINTS, open);

            // Act
            jscad.path.appendPoints(inputs);

            // Assert
            expect(open.points).toHaveLength(OPEN_CORNER.length);
        });
    });

    describe("createPathsFromPoints", () => {
        it("should build one path per list of points", () => {
            // Act
            const paths = jscad.path.createPathsFromPoints(new Inputs.JSCAD.PathsFromPointsDto([OPEN_CORNER, OPEN_CORNER]));

            // Assert
            expect(paths).toHaveLength(2);
            expect(expectPath(paths[0]!).isClosed).toBe(false);
        });

        it("should close a path whose last point repeats its first", () => {
            // Arrange
            const ring: Inputs.Base.Point2[] = [[0, 0], [4, 0], [4, 3], [0, 0]];

            // Act
            const paths = jscad.path.createPathsFromPoints(new Inputs.JSCAD.PathsFromPointsDto([ring]));

            // Assert
            expect(expectPath(paths[0]!).isClosed).toBe(true);
        });
    });

    describe("createFromPolyline", () => {
        it("should build a path through the polyline's points", () => {
            // Act
            const path = expectPath(jscad.path.createFromPolyline(
                new Inputs.JSCAD.PathFromPolylineDto({ points: OPEN_CORNER_3D }, false)));

            // Assert
            expect(path.points).toHaveLength(OPEN_CORNER_3D.length);
            expect(path.isClosed).toBe(false);
        });

        it("should close the path when it was asked to", () => {
            // Act
            const path = expectPath(jscad.path.createFromPolyline(
                new Inputs.JSCAD.PathFromPolylineDto({ points: OPEN_CORNER_3D }, true)));

            // Assert
            expect(path.isClosed).toBe(true);
        });
    });

    describe("createEmpty", () => {
        it("should build a path with no points at all", () => {
            // Act
            const path = expectPath(jscad.path.createEmpty());

            // Assert
            expect(path.points).toEqual([]);
            expect(path.isClosed).toBe(false);
        });
    });

    describe("appendPolyline", () => {
        it("should carry the polyline's points onto the end of the path", () => {
            // Arrange
            const path = jscad.path.createFromPoints(new Inputs.JSCAD.PathFromPointsDto(OPEN_CORNER, false));

            // Act
            const appended = expectPath(jscad.path.appendPolyline(
                new Inputs.JSCAD.PathAppendPolylineDto({ points: EXTRA_POINTS_3D }, path)));

            // Assert
            expect(appended.points).toHaveLength(OPEN_CORNER.length + EXTRA_POINTS_3D.length);
        });
    });

    describe("appendArc", () => {
        it("should reach the end point the arc was given", () => {
            // Arrange
            const path = jscad.path.createFromPoints(new Inputs.JSCAD.PathFromPointsDto([[0, 0]], false));

            // Act
            const appended = expectPath(jscad.path.appendArc(
                new Inputs.JSCAD.PathAppendArcDto(path, [4, 4], 0, false, false, 16, 4, 4)));

            // Assert
            const last = appended.points[appended.points.length - 1]!;
            expect(last[0]).toBeCloseTo(4, 5);
            expect(last[1]).toBeCloseTo(4, 5);
        });

        it("should curve rather than jump straight to the end point", () => {
            // Arrange
            const path = jscad.path.createFromPoints(new Inputs.JSCAD.PathFromPointsDto([[0, 0]], false));

            // Act
            const appended = expectPath(jscad.path.appendArc(
                new Inputs.JSCAD.PathAppendArcDto(path, [4, 4], 0, false, false, 16, 4, 4)));

            // Assert
            expect(appended.points.length).toBeGreaterThan(2);
        });
    });
});
