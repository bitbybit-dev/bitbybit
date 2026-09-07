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
});
