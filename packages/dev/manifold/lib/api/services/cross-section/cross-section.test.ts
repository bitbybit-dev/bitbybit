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
    const boundsOf = (shape: Manifold3D.CrossSection): [Inputs.Base.Vector2, Inputs.Base.Vector2] =>
        manifold.crossSection.evaluate.bounds(new Inputs.Manifold.CrossSectionDto(shape)) as [Inputs.Base.Vector2, Inputs.Base.Vector2];

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

    // The rest of the cross-section API: the ways one is built from points, the ways one is read back
    // as points, the operations that reshape it, and the transforms that move it.
    describe("shapes.create", () => {
        it("should build a section from the contour it was given", () => {
            // Arrange - a 4 x 4 square, given as its four corners
            const polygons: Inputs.Base.Vector2[][] = [[[-2, -2], [2, -2], [2, 2], [-2, 2]]];

            // Act
            const section = manifold.crossSection.shapes.create(new Inputs.Manifold.CreateContourSectionDto(polygons));

            // Assert
            expect(areaOf(section)).toBeCloseTo(SQUARE_AREA, 6);
        });
    });

    describe("crossSectionFromPoints", () => {
        it("should close a section through the points it was given", () => {
            // Arrange
            const points: Inputs.Base.Point3[] = [[-2, -2, 0], [2, -2, 0], [2, 2, 0], [-2, 2, 0]];

            // Act
            const section = manifold.crossSection.crossSectionFromPoints({ points });

            // Assert
            expect(areaOf(section)).toBeCloseTo(SQUARE_AREA, 6);
        });

        it("should drop a repeated point when asked to", () => {
            // Arrange - the first corner appears twice in a row
            const points: Inputs.Base.Point3[] = [[-2, -2, 0], [-2, -2, 0], [2, -2, 0], [2, 2, 0], [-2, 2, 0]];

            // Act
            const section = manifold.crossSection.crossSectionFromPoints({ points, removeDuplicates: true, tolerance: 1e-6 });

            // Assert
            expect(manifold.crossSection.evaluate.numVert(new Inputs.Manifold.CrossSectionDto(section))).toBe(SQUARE_CORNERS);
        });

        it("should judge a repeat by its own tolerance when none was given", () => {
            // Arrange
            const points: Inputs.Base.Point3[] = [[-2, -2, 0], [-2, -2, 0], [2, -2, 0], [2, 2, 0], [-2, 2, 0]];

            // Act
            const section = manifold.crossSection.crossSectionFromPoints({ points, removeDuplicates: true });

            // Assert
            expect(manifold.crossSection.evaluate.numVert(new Inputs.Manifold.CrossSectionDto(section))).toBe(SQUARE_CORNERS);
        });
    });

    describe("crossSectionFromPolygons", () => {
        it("should build a section from every contour it was given", () => {
            // Arrange - a square with a square hole through it
            const polygonPoints: Inputs.Base.Point3[][] = [
                [[-2, -2, 0], [2, -2, 0], [2, 2, 0], [-2, 2, 0]],
                [[-1, -1, 0], [-1, 1, 0], [1, 1, 0], [1, -1, 0]],
            ];

            // Act
            const section = manifold.crossSection.crossSectionFromPolygons({ polygonPoints });

            // Assert
            expect(areaOf(section)).toBeCloseTo(SQUARE_AREA - 4, 6);
        });

        it("should drop a repeated point from each contour when asked to", () => {
            // Arrange
            const polygonPoints: Inputs.Base.Point3[][] = [
                [[-2, -2, 0], [-2, -2, 0], [2, -2, 0], [2, 2, 0], [-2, 2, 0]],
            ];

            // Act
            const section = manifold.crossSection.crossSectionFromPolygons({ polygonPoints, removeDuplicates: true, tolerance: 1e-6 });

            // Assert
            expect(manifold.crossSection.evaluate.numVert(new Inputs.Manifold.CrossSectionDto(section))).toBe(SQUARE_CORNERS);
        });

        it("should judge a repeat by its own tolerance when none was given", () => {
            // Arrange
            const polygonPoints: Inputs.Base.Point3[][] = [
                [[-2, -2, 0], [-2, -2, 0], [2, -2, 0], [2, 2, 0], [-2, 2, 0]],
            ];

            // Act
            const section = manifold.crossSection.crossSectionFromPolygons({ polygonPoints, removeDuplicates: true });

            // Assert
            expect(manifold.crossSection.evaluate.numVert(new Inputs.Manifold.CrossSectionDto(section))).toBe(SQUARE_CORNERS);
        });
    });

    describe("crossSectionToPolygons", () => {
        it("should give the contour back as its corner points", () => {
            // Act
            const polygons = manifold.crossSection.crossSectionToPolygons(new Inputs.Manifold.CrossSectionDto(square));

            // Assert
            expect(polygons).toHaveLength(ONE_CONTOUR);
            expect(polygons[0]).toHaveLength(SQUARE_CORNERS);
        });
    });

    describe("crossSectionToPoints", () => {
        it("should lift the contour onto the plane it will be drawn on", () => {
            // Act
            const points = manifold.crossSection.crossSectionToPoints(new Inputs.Manifold.CrossSectionDto(square));

            // Assert
            expect(points[0]).toHaveLength(SQUARE_CORNERS);
            expect(points[0]!.every((point) => point[2] === 0)).toBe(true);
        });
    });

    describe("crossSectionsToPolygons", () => {
        it("should read every section it was given", () => {
            // Act
            const polygons = manifold.crossSection.crossSectionsToPolygons({ crossSections: [square, distant] });

            // Assert
            expect(polygons).toHaveLength(2);
        });
    });

    describe("crossSectionsToPoints", () => {
        it("should read every section it was given", () => {
            // Act
            const points = manifold.crossSection.crossSectionsToPoints({ crossSections: [square, distant] });

            // Assert
            expect(points).toHaveLength(2);
        });
    });

    describe("deleteCrossSection", () => {
        it("should release the section it was given", () => {
            // Arrange
            const throwaway = manifold.crossSection.shapes.square(new Inputs.Manifold.SquareDto(true, SQUARE_SIZE));

            // Act
            manifold.crossSection.deleteCrossSection(new Inputs.Manifold.CrossSectionDto(throwaway));

            // Assert - a released section can no longer be measured
            expect(() => areaOf(throwaway)).toThrow();
        });
    });

    describe("deleteCrossSections", () => {
        it("should release every section it was given", () => {
            // Arrange
            const throwaways = [
                manifold.crossSection.shapes.square(new Inputs.Manifold.SquareDto(true, SQUARE_SIZE)),
                manifold.crossSection.shapes.square(new Inputs.Manifold.SquareDto(true, SQUARE_SIZE)),
            ];

            // Act
            manifold.crossSection.deleteCrossSections({ crossSections: throwaways });

            // Assert
            expect(() => areaOf(throwaways[0]!)).toThrow();
            expect(() => areaOf(throwaways[1]!)).toThrow();
        });
    });

    describe("operations", () => {
        it("should hull a section into its convex outline", () => {
            // Arrange - an L shape, whose hull is the triangle that spans it
            const l = manifold.crossSection.crossSectionFromPoints({
                points: [[0, 0, 0], [4, 0, 0], [4, 1, 0], [1, 1, 0], [1, 4, 0], [0, 4, 0]],
            });

            // Act
            const hulled = manifold.crossSection.operations.hull(new Inputs.Manifold.CrossSectionDto(l));

            // Assert
            expect(areaOf(hulled)).toBeGreaterThan(areaOf(l));
        });

        it("should extrude a section into a solid of the height it was given", () => {
            // Act
            const solid = manifold.crossSection.operations.extrude({ crossSection: square, height: 3, nDivisions: 1, twistDegrees: 0, scaleTopX: 1, scaleTopY: 1, center: true });

            // Assert
            expect(manifold.manifold.evaluate.volume(new Inputs.Manifold.ManifoldDto(solid))).toBeCloseTo(SQUARE_AREA * 3, 5);
        });

        it("should revolve a section into a solid of revolution", () => {
            // Arrange - a section set away from the axis, so the sweep is a ring rather than a disc
            const away = manifold.crossSection.transforms.translateXY(
                new Inputs.Manifold.TranslateXYCrossSectionDto(square, SHIFT, 0));

            // Act
            const solid = manifold.crossSection.operations.revolve(new Inputs.Manifold.RevolveDto(away, 360, false, 64));

            // Assert
            expect(manifold.manifold.evaluate.volume(new Inputs.Manifold.ManifoldDto(solid))).toBeGreaterThan(0);
        });

        it("should stand a revolved solid up when asked to match the profile", () => {
            // Arrange
            const away = manifold.crossSection.transforms.translateXY(
                new Inputs.Manifold.TranslateXYCrossSectionDto(square, SHIFT, 0));

            // Act - the kernel revolves about Y and leaves the ring lying in XZ; matching the profile
            // turns it back a quarter, so the ring stands in the plane the section was drawn on
            const asRevolved = manifold.crossSection.operations.revolve(new Inputs.Manifold.RevolveDto(away, 360, false, 64));
            const upright = manifold.crossSection.operations.revolve(new Inputs.Manifold.RevolveDto(away, 360, true, 64));
            const spanOf = (shape: Manifold3D.Manifold, axis: 0 | 1 | 2): number => {
                const [min, max] = manifold.manifold.evaluate.boundingBox(new Inputs.Manifold.ManifoldDto(shape)) as [Inputs.Base.Vector3, Inputs.Base.Vector3];
                return max[axis] - min[axis];
            };

            // Assert - the thin axis of the ring moves from Z to Y
            expect(spanOf(asRevolved, 2)).toBeCloseTo(SQUARE_SIZE, 5);
            expect(spanOf(upright, 1)).toBeCloseTo(SQUARE_SIZE, 5);
        });

        it("should offset a section outwards by the delta it was given", () => {
            // Act
            const grown = manifold.crossSection.operations.offset(
                new Inputs.Manifold.OffsetDto(square, 1, Inputs.Manifold.manifoldJoinTypeEnum.square, 2, 64));

            // Assert
            expect(areaOf(grown)).toBeGreaterThan(SQUARE_AREA);
        });

        it("should not add corners to a section already as simple as it can be", () => {
            // Act
            const simplified = manifold.crossSection.operations.simplify(new Inputs.Manifold.SimplifyDto(square, 0.01));

            // Assert
            expect(manifold.crossSection.evaluate.numVert(new Inputs.Manifold.CrossSectionDto(simplified))).toBeLessThanOrEqual(SQUARE_CORNERS);
        });

        it("should compose several sections into one", () => {
            // Act
            const composed = manifold.crossSection.operations.compose({ polygons: [square, distant] });

            // Assert
            expect(areaOf(composed)).toBeCloseTo(SQUARE_AREA * 2, 5);
        });

        it("should decompose a section back into the parts it is made of", () => {
            // Arrange
            const composed = manifold.crossSection.operations.compose({ polygons: [square, distant] });

            // Act
            const parts = manifold.crossSection.operations.decompose(new Inputs.Manifold.CrossSectionDto(composed));

            // Assert
            expect(parts).toHaveLength(2);
        });
    });

    describe("transforms", () => {
        it("should scale a section by the factor it was given", () => {
            // Act
            const scaled = manifold.crossSection.transforms.scale(new Inputs.Manifold.ScaleCrossSectionDto(square, 2));

            // Assert
            expect(areaOf(scaled)).toBeCloseTo(SQUARE_AREA * 4, 5);
        });

        it("should mirror a section across the normal it was given", () => {
            // Act
            const mirrored = manifold.crossSection.transforms.mirror(new Inputs.Manifold.MirrorCrossSectionDto(offsetSquare, [1, 0]));
            const [min] = boundsOf(mirrored);

            // Assert
            expect(min[0]).toBeCloseTo(-OVERLAP_OFFSET - SQUARE_SIZE / 2, 5);
        });

        it("should move a section by the vector it was given", () => {
            // Act
            const moved = manifold.crossSection.transforms.translate(new Inputs.Manifold.TranslateCrossSectionDto(square, [SHIFT, 0]));
            const [min] = boundsOf(moved);

            // Assert
            expect(min[0]).toBeCloseTo(SHIFT - SQUARE_SIZE / 2, 5);
        });

        it("should turn a section by the angle it was given", () => {
            // Arrange - an oblong, so that a quarter turn is visible
            const oblong = manifold.crossSection.shapes.rectangle(
                new Inputs.Manifold.RectangleDto(RECTANGLE_LENGTH, RECTANGLE_HEIGHT, true));

            // Act
            const turned = manifold.crossSection.transforms.rotate(new Inputs.Manifold.RotateCrossSectionDto(oblong, 90));
            const [min, max] = boundsOf(turned);

            // Assert
            expect(max[1] - min[1]).toBeCloseTo(RECTANGLE_LENGTH, 5);
        });

        it("should apply the matrix it was given", () => {
            // Arrange - the kernel reads the matrix in column order, so the translation is the last
            // column and the row after it is ignored
            const translate: Inputs.Base.TransformMatrix3x3 = [1, 0, 0, 0, 1, 0, SHIFT, 0, 1];

            // Act
            const moved = manifold.crossSection.transforms.transform(new Inputs.Manifold.TransformCrossSectionDto(square, translate));
            const [min] = boundsOf(moved);

            // Assert
            expect(min[0]).toBeCloseTo(SHIFT - SQUARE_SIZE / 2, 5);
        });

        it("should move every point the way the warp function says", () => {
            // Act
            const warped = manifold.crossSection.transforms.warp({
                crossSection: square,
                warpFunc: (vertex) => { vertex[0] += SHIFT; },
            });
            const [min] = boundsOf(warped);

            // Assert
            expect(min[0]).toBeCloseTo(SHIFT - SQUARE_SIZE / 2, 5);
        });
    });
});
