import { describe, it, expect, beforeAll } from "vitest";
import { getManifold } from "../../__test__/kernel";
import type { ManifoldService } from "../../manifold-service";
import type * as Manifold3D from "manifold-3d";
import * as Inputs from "../../inputs";

const CUBE_SIZE = 2;
const CUBE_VERTICES = 8;
const CUBE_TRIANGLES = 12;
// Euler's formula for a closed surface of genus 0: V - E + F = 2, so E = V + F - 2.
const CUBE_EDGES = CUBE_VERTICES + CUBE_TRIANGLES - 2;
const GENUS_OF_A_BALL = 0;
const GAP = 3;
const NO_PROPERTIES = 0;

describe("ManifoldEvaluate", () => {
    let manifold: ManifoldService;
    let cube: Manifold3D.Manifold;
    let measure: Inputs.Manifold.ManifoldDto<Manifold3D.Manifold>;

    beforeAll(async () => {
        manifold = await getManifold();
        cube = manifold.manifold.shapes.cube(new Inputs.Manifold.CubeDto(true, CUBE_SIZE));
        measure = new Inputs.Manifold.ManifoldDto(cube);
    }, 120_000);

    describe("the counting functions", () => {
        it("should report a cube's vertices, triangles and edges in Euler's relation", () => {
            // Act
            const vertices = manifold.manifold.evaluate.numVert(measure);
            const triangles = manifold.manifold.evaluate.numTri(measure);
            const edges = manifold.manifold.evaluate.numEdge(measure);

            // Assert
            expect(vertices).toBe(CUBE_VERTICES);
            expect(triangles).toBe(CUBE_TRIANGLES);
            expect(edges).toBe(CUBE_EDGES);
            expect(vertices - edges + triangles).toBe(2 - 2 * GENUS_OF_A_BALL);
        });

        it("should report no properties on a plain solid", () => {
            // Act, Assert
            expect(manifold.manifold.evaluate.numProp(measure)).toBe(NO_PROPERTIES);
            expect(manifold.manifold.evaluate.numPropVert(measure)).toBe(CUBE_VERTICES);
        });
    });

    describe("isEmpty", () => {
        it("should be false for a solid and true for one with nothing in it", () => {
            // Arrange
            const nothing = manifold.manifold.booleans.intersect(new Inputs.Manifold.TwoManifoldsDto(
                cube,
                manifold.manifold.transforms.translateXYZ(new Inputs.Manifold.TranslateXYZDto(cube, 100, 0, 0)),
            ));

            // Act, Assert
            expect(manifold.manifold.evaluate.isEmpty(measure)).toBe(false);
            expect(manifold.manifold.evaluate.isEmpty(new Inputs.Manifold.ManifoldDto(nothing))).toBe(true);
        });
    });

    describe("minGap", () => {
        it("should measure the clear distance between two separated solids", () => {
            // Arrange
            const apart = manifold.manifold.transforms.translateXYZ(
                new Inputs.Manifold.TranslateXYZDto(cube, CUBE_SIZE + GAP, 0, 0));
            const inputs = new Inputs.Manifold.ManifoldsMinGapDto(cube, apart, CUBE_SIZE + GAP + 1);

            // Act
            const gap = manifold.manifold.evaluate.minGap(inputs);

            // Assert
            expect(gap).toBeCloseTo(GAP, 6);
        });
    });

    describe("tolerance", () => {
        it("should report a non-negative tolerance for a well-formed solid", () => {
            // Act
            const tolerance = manifold.manifold.evaluate.tolerance(measure);

            // Assert
            expect(tolerance).toBeGreaterThanOrEqual(0);
            expect(Number.isFinite(tolerance)).toBe(true);
        });
    });

    describe("originalID", () => {
        it("should give a solid built from a primitive an identity of its own", () => {
            // Act
            const id = manifold.manifold.evaluate.originalID(new Inputs.Manifold.ManifoldDto(cube));

            // Assert
            expect(id).toBeGreaterThanOrEqual(0);
        });

        it("should give a solid built by a boolean no identity of its own", () => {
            // Arrange
            const moved = manifold.manifold.transforms.translateXYZ(new Inputs.Manifold.TranslateXYZDto(cube, CUBE_SIZE / 2, 0, 0));
            const cut = manifold.manifold.booleans.subtract(new Inputs.Manifold.TwoManifoldsDto(cube, moved));

            // Act
            const id = manifold.manifold.evaluate.originalID(new Inputs.Manifold.ManifoldDto(cut));

            // Assert
            expect(id).toBe(-1);
        });
    });

    describe("status", () => {
        it("should report a well formed solid as being in no error", () => {
            // Act
            const status = manifold.manifold.evaluate.status(new Inputs.Manifold.ManifoldDto(cube));

            // Assert
            expect(status).toBe("NoError");
        });
    });
});
