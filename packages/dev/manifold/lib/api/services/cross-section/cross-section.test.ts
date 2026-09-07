import { describe, it, expect, beforeAll } from "vitest";
import { getManifold } from "../../__test__/kernel";
import type { ManifoldService } from "../../manifold-service";
import type * as Manifold3D from "manifold-3d";
import * as Inputs from "../../inputs";

const SQUARE_SIZE = 4;
const SQUARE_AREA = 16;
const SQUARE_CORNERS = 4;
const ONE_CONTOUR = 1;
const CIRCLE_RADIUS = 2;
const CIRCLE_SEGMENTS = 256;
const CIRCLE_AREA_TOLERANCE = 0.01;
const RECTANGLE_LENGTH = 6;
const RECTANGLE_HEIGHT = 2;
const RECTANGLE_AREA = 12;
const SHIFT = 10;
const OVERLAP_OFFSET = 2;
// Two 4x4 squares offset by 2 in both axes share a 2x2 corner.
const OVERLAP_AREA = 4;
const SCALE: Inputs.Base.Vector2 = [2, 3];

describe("ManifoldCrossSection", () => {
    let manifold: ManifoldService;
    let square: Manifold3D.CrossSection;
    let offsetSquare: Manifold3D.CrossSection;
    let distant: Manifold3D.CrossSection;
    const areaOf = (shape: Manifold3D.CrossSection): number =>
        manifold.crossSection.evaluate.area(new Inputs.Manifold.CrossSectionDto(shape));

    beforeAll(async () => {
        manifold = await getManifold();
        square = manifold.crossSection.shapes.square(new Inputs.Manifold.SquareDto(true, SQUARE_SIZE));
        offsetSquare = manifold.crossSection.transforms.translateXY(
            new Inputs.Manifold.TranslateXYCrossSectionDto(square, OVERLAP_OFFSET, OVERLAP_OFFSET));
        distant = manifold.crossSection.transforms.translateXY(
            new Inputs.Manifold.TranslateXYCrossSectionDto(square, SHIFT, SHIFT));
    }, 120_000);

    describe("shapes", () => {
        it("should build a square of the given size with four corners in one contour", () => {
            // Act
            const measure = new Inputs.Manifold.CrossSectionDto(square);

            // Assert
            expect(areaOf(square)).toBeCloseTo(SQUARE_AREA, 6);
            expect(manifold.crossSection.evaluate.numVert(measure)).toBe(SQUARE_CORNERS);
            expect(manifold.crossSection.evaluate.numContour(measure)).toBe(ONE_CONTOUR);
        });

        it("should approach the area of a circle from below as an inscribed polygon", () => {
            // Arrange
            const inputs = new Inputs.Manifold.CircleDto(CIRCLE_RADIUS, CIRCLE_SEGMENTS);
            const analyticArea = Math.PI * CIRCLE_RADIUS ** 2;

            // Act
            const circle = manifold.crossSection.shapes.circle(inputs);

            // Assert
            const area = areaOf(circle);
            expect(area).toBeLessThan(analyticArea);
            expect(analyticArea - area).toBeLessThan(CIRCLE_AREA_TOLERANCE);
        });

        it("should build a rectangle spanning its length and height", () => {
            // Arrange
            const inputs = new Inputs.Manifold.RectangleDto(RECTANGLE_LENGTH, RECTANGLE_HEIGHT, true);

            // Act
            const rectangle = manifold.crossSection.shapes.rectangle(inputs);

            // Assert
            expect(areaOf(rectangle)).toBeCloseTo(RECTANGLE_AREA, 6);
            const [min, max] = manifold.crossSection.evaluate.bounds(new Inputs.Manifold.CrossSectionDto(rectangle)) as [Inputs.Base.Vector2, Inputs.Base.Vector2];
            expect(max[0] - min[0]).toBeCloseTo(RECTANGLE_LENGTH, 6);
            expect(max[1] - min[1]).toBeCloseTo(RECTANGLE_HEIGHT, 6);
        });
    });

    describe("booleans", () => {
        it("should add areas, counting a shared region once", () => {
            // Act
            const joined = manifold.crossSection.booleans.add(
                new Inputs.Manifold.TwoCrossSectionsDto(square, offsetSquare));

            // Assert
            expect(areaOf(joined)).toBeCloseTo(2 * SQUARE_AREA - OVERLAP_AREA, 6);
        });

        it("should subtract only the shared region", () => {
            // Act
            const cut = manifold.crossSection.booleans.subtract(
                new Inputs.Manifold.TwoCrossSectionsDto(square, offsetSquare));

            // Assert
            expect(areaOf(cut)).toBeCloseTo(SQUARE_AREA - OVERLAP_AREA, 6);
        });

        it("should intersect to the shared region, and to nothing when apart", () => {
            // Act
            const shared = manifold.crossSection.booleans.intersect(
                new Inputs.Manifold.TwoCrossSectionsDto(square, offsetSquare));
            const nothing = manifold.crossSection.booleans.intersect(
                new Inputs.Manifold.TwoCrossSectionsDto(square, distant));

            // Assert
            expect(areaOf(shared)).toBeCloseTo(OVERLAP_AREA, 6);
            expect(manifold.crossSection.evaluate.isEmpty(new Inputs.Manifold.CrossSectionDto(nothing))).toBe(true);
        });

        it("should agree between the list and pairwise forms", () => {
            // Arrange
            const list = new Inputs.Manifold.CrossSectionsDto([square, offsetSquare]);
            const pair = new Inputs.Manifold.TwoCrossSectionsDto(square, offsetSquare);

            // Act, Assert
            expect(areaOf(manifold.crossSection.booleans.union(list)))
                .toBeCloseTo(areaOf(manifold.crossSection.booleans.unionTwo(pair)), 6);
            expect(areaOf(manifold.crossSection.booleans.difference(list)))
                .toBeCloseTo(areaOf(manifold.crossSection.booleans.differenceTwo(pair)), 6);
            expect(areaOf(manifold.crossSection.booleans.intersection(list)))
                .toBeCloseTo(areaOf(manifold.crossSection.booleans.intersectionTwo(pair)), 6);
        });
    });

    describe("transforms", () => {
        it("should move a section without changing its area", () => {
            // Act
            const moved = manifold.crossSection.transforms.translateXY(
                new Inputs.Manifold.TranslateXYCrossSectionDto(square, SHIFT, 0));

            // Assert
            expect(areaOf(moved)).toBeCloseTo(SQUARE_AREA, 6);
            const [min, max] = manifold.crossSection.evaluate.bounds(new Inputs.Manifold.CrossSectionDto(moved)) as [Inputs.Base.Vector2, Inputs.Base.Vector2];
            expect(min[0]).toBeCloseTo(SHIFT - SQUARE_SIZE / 2, 6);
            expect(max[0]).toBeCloseTo(SHIFT + SQUARE_SIZE / 2, 6);
        });

        it("should multiply the area by the product of the two scale factors", () => {
            // Act
            const scaled = manifold.crossSection.transforms.scale2D(
                new Inputs.Manifold.Scale2DCrossSectionDto(square, SCALE));

            // Assert
            expect(areaOf(scaled)).toBeCloseTo(SQUARE_AREA * SCALE[0] * SCALE[1], 6);
        });
    });
});
