import { describe, it, expect, beforeAll } from "vitest";
import { getManifold } from "../../__test__/kernel";
import type { ManifoldService } from "../../manifold-service";
import type * as Manifold3D from "manifold-3d";
import * as Inputs from "../../inputs";

const CUBE_SIZE = 2;
const CUBE_VOLUME = 8;
const CUBE_TRIANGLES = 12;
const CORNERS: Inputs.Base.Point3[] = [
    [0, 0, 0], [2, 0, 0], [0, 2, 0], [0, 0, 2],
];
// A tetrahedron on three unit-2 legs from the origin: base area 2, height 2, so volume 8/6.
const TETRAHEDRON_VOLUME = 8 / 6;
const SEPARATION = 10;
const TWO_PARTS = 2;
const REFINEMENT = 3;

describe("ManifoldOperations", () => {
    let manifold: ManifoldService;
    let cube: Manifold3D.Manifold;
    const volumeOf = (shape: Manifold3D.Manifold): number =>
        manifold.manifold.evaluate.volume(new Inputs.Manifold.ManifoldDto(shape));
    const trianglesOf = (shape: Manifold3D.Manifold): number =>
        manifold.manifold.evaluate.numTri(new Inputs.Manifold.ManifoldDto(shape));

    beforeAll(async () => {
        manifold = await getManifold();
        cube = manifold.manifold.shapes.cube(new Inputs.Manifold.CubeDto(true, CUBE_SIZE));
    }, 120_000);

    describe("hullPoints", () => {
        it("should wrap four points in the tetrahedron they define", () => {
            // Arrange
            const inputs = new Inputs.Manifold.HullPointsDto(CORNERS);

            // Act
            const hull = manifold.manifold.operations.hullPoints(inputs);

            // Assert
            expect(volumeOf(hull)).toBeCloseTo(TETRAHEDRON_VOLUME, 6);
        });
    });

    describe("hull", () => {
        it("should leave a convex solid as it is", () => {
            // Act
            const hull = manifold.manifold.operations.hull(new Inputs.Manifold.ManifoldDto(cube));

            // Assert
            expect(volumeOf(hull)).toBeCloseTo(CUBE_VOLUME, 6);
        });
    });

    describe("compose and decompose", () => {
        it("should join separate solids and take them apart again", () => {
            // Arrange
            const apart = manifold.manifold.transforms.translateXYZ(
                new Inputs.Manifold.TranslateXYZDto(cube, SEPARATION, 0, 0));

            // Act
            const composed = manifold.manifold.operations.compose(new Inputs.Manifold.ManifoldsDto([cube, apart]));
            const parts = manifold.manifold.operations.decompose(new Inputs.Manifold.ManifoldDto(composed));

            // Assert
            expect(volumeOf(composed)).toBeCloseTo(2 * CUBE_VOLUME, 6);
            expect(parts).toHaveLength(TWO_PARTS);
            for (const part of parts) expect(volumeOf(part)).toBeCloseTo(CUBE_VOLUME, 6);
        });
    });

    describe("refine", () => {
        it("should subdivide the surface without changing the volume of a flat-faced solid", () => {
            // Arrange
            const inputs = new Inputs.Manifold.ManifoldRefineDto(cube, REFINEMENT);

            // Act
            const refined = manifold.manifold.operations.refine(inputs);

            // Assert
            expect(trianglesOf(refined)).toBeGreaterThan(CUBE_TRIANGLES);
            expect(volumeOf(refined)).toBeCloseTo(CUBE_VOLUME, 6);
        });
    });

    describe("project", () => {
        it("should flatten a solid into the cross section of its shadow", () => {
            // Act
            const projected = manifold.manifold.operations.project(new Inputs.Manifold.ManifoldDto(cube));

            // Assert
            const area = manifold.crossSection.evaluate.area(new Inputs.Manifold.CrossSectionDto(projected));
            expect(area).toBeCloseTo(CUBE_SIZE * CUBE_SIZE, 6);
        });
    });

    describe("slice", () => {
        it("should cut the solid at a plane and give back that cross section", () => {
            // Act
            const sliced = manifold.manifold.operations.slice(new Inputs.Manifold.SliceDto(cube));

            // Assert
            const area = manifold.crossSection.evaluate.area(new Inputs.Manifold.CrossSectionDto(sliced));
            expect(area).toBeCloseTo(CUBE_SIZE * CUBE_SIZE, 6);
        });
    });

    // The rest of the operations. Most hand a knob straight to the kernel, so what is asserted is
    // that the solid comes back changed in the way the knob names, or unchanged where that is the
    // point - and, for the identity ones, that the volume is what it was.
    describe("asOriginal", () => {
        it("should give back a solid of the same volume, with an identity of its own", () => {
            // Act
            const original = manifold.manifold.operations.asOriginal(new Inputs.Manifold.ManifoldDto(cube));

            // Assert
            expect(volumeOf(original)).toBeCloseTo(volumeOf(cube), 6);
            expect(manifold.manifold.evaluate.originalID(new Inputs.Manifold.ManifoldDto(original))).toBeGreaterThanOrEqual(0);
        });
    });

    describe("reserveIds", () => {
        it("should hand out the first of a run of identities", () => {
            // Act
            const first = manifold.manifold.operations.reserveIds(new Inputs.Manifold.CountDto(4));
            const next = manifold.manifold.operations.reserveIds(new Inputs.Manifold.CountDto(4));

            // Assert
            expect(next).toBeGreaterThanOrEqual(first + 4);
        });
    });

    describe("setTolerance", () => {
        it("should hold the tolerance it was given", () => {
            // Act
            const loosened = manifold.manifold.operations.setTolerance(new Inputs.Manifold.ManifoldRefineToleranceDto(cube, 0.1));

            // Assert
            expect(manifold.manifold.evaluate.tolerance(new Inputs.Manifold.ManifoldDto(loosened))).toBeCloseTo(0.1, 6);
        });
    });

    describe("refineToTolerance", () => {
        it("should divide the faces of a curved solid until they meet the tolerance", () => {
            // Arrange - a coarse sphere carries the curvature that a tolerance can improve on; a cube
            // is already exact and would come back untouched
            const sphere = manifold.manifold.shapes.sphere(new Inputs.Manifold.SphereDto(1, 8));
            const loosened = manifold.manifold.operations.setTolerance(new Inputs.Manifold.ManifoldRefineToleranceDto(sphere, 0.1));

            // Act
            const refined = manifold.manifold.operations.refineToTolerance(new Inputs.Manifold.ManifoldRefineToleranceDto(loosened, 0.001));

            // Assert
            expect(trianglesOf(refined)).toBeGreaterThanOrEqual(trianglesOf(sphere));
            expect(volumeOf(refined)).toBeGreaterThan(0);
        });
    });

    describe("refineToLength", () => {
        it("should divide every edge longer than the length it was given", () => {
            // Act
            const refined = manifold.manifold.operations.refineToLength(new Inputs.Manifold.ManifoldRefineLengthDto(cube, 0.5));

            // Assert
            expect(trianglesOf(refined)).toBeGreaterThan(trianglesOf(cube));
            expect(volumeOf(refined)).toBeCloseTo(CUBE_VOLUME, 5);
        });
    });

    describe("calculateNormals", () => {
        it("should give the solid a property channel holding its normals", () => {
            // Act
            const withNormals = manifold.manifold.operations.calculateNormals(new Inputs.Manifold.CalculateNormalsDto(cube, 0, 60));

            // Assert
            expect(manifold.manifold.evaluate.numProp(new Inputs.Manifold.ManifoldDto(withNormals))).toBeGreaterThanOrEqual(3);
        });
    });

    describe("calculateCurvature", () => {
        it("should give the solid property channels holding its curvature", () => {
            // Act
            const withCurvature = manifold.manifold.operations.calculateCurvature({ manifold: cube, gaussianIdx: 0, meanIdx: 1 });

            // Assert
            expect(manifold.manifold.evaluate.numProp(new Inputs.Manifold.ManifoldDto(withCurvature))).toBeGreaterThanOrEqual(2);
        });
    });

    describe("smoothOut", () => {
        it("should leave a cube alone, every edge of it being sharp", () => {
            // Act
            const smoothed = manifold.manifold.operations.smoothOut(new Inputs.Manifold.ManifoldSmoothOutDto(cube, 60, 0));

            // Assert
            expect(volumeOf(smoothed)).toBeCloseTo(CUBE_VOLUME, 5);
        });
    });

    describe("smoothByNormals", () => {
        it("should give back a solid built from the normals it was pointed at", () => {
            // Arrange
            const withNormals = manifold.manifold.operations.calculateNormals(new Inputs.Manifold.CalculateNormalsDto(cube, 0, 60));

            // Act
            const smoothed = manifold.manifold.operations.smoothByNormals(new Inputs.Manifold.ManifoldSmoothByNormalsDto(withNormals, 0));

            // Assert
            expect(volumeOf(smoothed)).toBeCloseTo(CUBE_VOLUME, 5);
        });
    });

    describe("simplify", () => {
        it("should not add triangles to a shape already as simple as it can be", () => {
            // Act
            const simplified = manifold.manifold.operations.simplify(new Inputs.Manifold.ManifoldSimplifyDto(cube, 0.01));

            // Assert
            expect(trianglesOf(simplified)).toBeLessThanOrEqual(CUBE_TRIANGLES);
        });
    });

    describe("setProperties", () => {
        it("should write the property channels the function fills in", () => {
            // Act
            const withProperties = manifold.manifold.operations.setProperties({
                manifold: cube,
                numProp: 1,
                propFunc: (newProp) => { newProp[0] = 1; },
            });

            // Assert
            expect(manifold.manifold.evaluate.numProp(new Inputs.Manifold.ManifoldDto(withProperties))).toBe(1);
        });
    });
});
