import { describe, it, expect, beforeAll } from "vitest";
import type * as Modeling from "@jscad/modeling";
import { getJscad } from "../__test__/kernel";
import type { Jscad } from "../jscad-service";
import * as Inputs from "../inputs";

const CENTRE: Inputs.Base.Point2 = [0, 0];
const CIRCLE_RADIUS = 2;
const CIRCLE_SEGMENTS = 128;
// A regular polygon of n sides is inscribed in its circle, so its area falls short of pi r^2.
const CIRCLE_AREA_TOLERANCE = 0.01;
const SQUARE_SIZE = 3;
const SQUARE_AREA = 9;
const SQUARE_SIDES = 4;
const RECTANGLE_WIDTH = 2;
const RECTANGLE_LENGTH = 5;
const RECTANGLE_AREA = 10;
const ELLIPSE_RADII: Inputs.Base.Point2 = [3, 1];
const STAR_POINTS = 5;
const STAR_SIDES = 10;
const TRIANGLE: Inputs.Base.Point2[] = [[0, 0], [4, 0], [0, 3]];
const TRIANGLE_AREA = 6;

describe("JSCADPolygon", () => {
    let jscad: Jscad;
    let kernel: typeof Modeling;

    beforeAll(async () => {
        ({ jscad, kernel } = await getJscad());
    });

    describe("circle", () => {
        it("should approach the area of its radius as an inscribed polygon", () => {
            // Arrange
            const inputs = new Inputs.JSCAD.CircleDto(CENTRE, CIRCLE_RADIUS, CIRCLE_SEGMENTS);
            const analyticArea = Math.PI * CIRCLE_RADIUS ** 2;

            // Act
            const circle = jscad.polygon.circle(inputs);

            // Assert
            const area = kernel.measurements.measureArea(circle);
            expect(area).toBeLessThan(analyticArea);
            expect(analyticArea - area).toBeLessThan(CIRCLE_AREA_TOLERANCE);
            expect(circle.sides).toHaveLength(CIRCLE_SEGMENTS);
        });
    });

    describe("square", () => {
        it("should have four sides and the area of its size squared", () => {
            // Arrange
            const inputs = new Inputs.JSCAD.SquareDto(CENTRE, SQUARE_SIZE);

            // Act
            const square = jscad.polygon.square(inputs);

            // Assert
            expect(kernel.measurements.measureArea(square)).toBeCloseTo(SQUARE_AREA, 6);
            expect(square.sides).toHaveLength(SQUARE_SIDES);
        });
    });

    describe("rectangle", () => {
        it("should span its width and length about the centre", () => {
            // Arrange
            const inputs = new Inputs.JSCAD.RectangleDto(CENTRE, RECTANGLE_WIDTH, RECTANGLE_LENGTH);

            // Act
            const rectangle = jscad.polygon.rectangle(inputs);

            // Assert
            expect(kernel.measurements.measureArea(rectangle)).toBeCloseTo(RECTANGLE_AREA, 6);
            const [min, max] = kernel.measurements.measureBoundingBox(rectangle);
            expect(max[0] - min[0]).toBeCloseTo(RECTANGLE_WIDTH, 6);
            expect(max[1] - min[1]).toBeCloseTo(RECTANGLE_LENGTH, 6);
        });
    });

    describe("roundedRectangle", () => {
        it("should cover less area than the square corners it replaces", () => {
            // Arrange
            const sharp = jscad.polygon.rectangle(new Inputs.JSCAD.RectangleDto(CENTRE, RECTANGLE_WIDTH, RECTANGLE_LENGTH));
            const inputs = new Inputs.JSCAD.RoundedRectangleDto(CENTRE, 0.5, 32, RECTANGLE_WIDTH, RECTANGLE_LENGTH);

            // Act
            const rounded = jscad.polygon.roundedRectangle(inputs);

            // Assert
            expect(kernel.measurements.measureArea(rounded)).toBeLessThan(kernel.measurements.measureArea(sharp));
            const [min, max] = kernel.measurements.measureBoundingBox(rounded);
            expect(max[0] - min[0]).toBeCloseTo(RECTANGLE_WIDTH, 6);
        });
    });

    describe("ellipse", () => {
        it("should span twice each of its two radii", () => {
            // Arrange
            const inputs = new Inputs.JSCAD.EllipseDto(CENTRE, ELLIPSE_RADII, CIRCLE_SEGMENTS);

            // Act
            const ellipse = jscad.polygon.ellipse(inputs);

            // Assert
            const [min, max] = kernel.measurements.measureBoundingBox(ellipse);
            expect(max[0] - min[0]).toBeCloseTo(2 * ELLIPSE_RADII[0], 6);
            expect(max[1] - min[1]).toBeCloseTo(2 * ELLIPSE_RADII[1], 6);
        });
    });

    describe("star", () => {
        it("should have two sides per point", () => {
            // Arrange
            const inputs = new Inputs.JSCAD.StarDto(CENTRE, STAR_POINTS, 2, 3, 1.5);

            // Act
            const star = jscad.polygon.star(inputs);

            // Assert
            expect(star.sides).toHaveLength(STAR_SIDES);
        });
    });

    describe("createFromPoints", () => {
        it("should build the polygon those points enclose", () => {
            // Arrange
            const inputs = new Inputs.Point.PointsDto(TRIANGLE as unknown as Inputs.Base.Point3[]);

            // Act
            const triangle = jscad.polygon.createFromPoints(inputs);

            // Assert
            expect(kernel.measurements.measureArea(triangle)).toBeCloseTo(TRIANGLE_AREA, 6);
            expect(triangle.sides).toHaveLength(TRIANGLE.length);
        });
    });
});
