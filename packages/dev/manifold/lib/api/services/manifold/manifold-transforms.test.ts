import { describe, it, expect, beforeAll } from "vitest";
import { getManifold } from "../../__test__/kernel";
import type { ManifoldService } from "../../manifold-service";
import type * as Manifold3D from "manifold-3d";
import * as Inputs from "../../inputs";

const CUBE_SIZE = 2;
const CUBE_VOLUME = 8;
const SHIFT = 5;
const SCALE_FACTOR = 3;
const QUARTER_TURN_DEGREES = 90;
const OBLONG: Inputs.Base.Vector3 = [1, 2, 3];

describe("ManifoldTransforms", () => {
    let manifold: ManifoldService;
    let cube: Manifold3D.Manifold;
    const volumeOf = (shape: Manifold3D.Manifold): number =>
        manifold.manifold.evaluate.volume(new Inputs.Manifold.ManifoldDto(shape));
    const boxOf = (shape: Manifold3D.Manifold): Inputs.Base.Vector3[] =>
        manifold.manifold.evaluate.boundingBox(new Inputs.Manifold.ManifoldDto(shape));

    beforeAll(async () => {
        manifold = await getManifold();
        cube = manifold.manifold.shapes.cube(new Inputs.Manifold.CubeDto(true, CUBE_SIZE));
    }, 120_000);

    describe("translateXYZ", () => {
        it("should move the solid without changing its volume", () => {
            // Arrange
            const inputs = new Inputs.Manifold.TranslateXYZDto(cube, SHIFT, 0, 0);

            // Act
            const moved = manifold.manifold.transforms.translateXYZ(inputs);

            // Assert
            expect(volumeOf(moved)).toBeCloseTo(CUBE_VOLUME, 6);
            const [min, max] = boxOf(moved) as [Inputs.Base.Vector3, Inputs.Base.Vector3];
            expect(min[0]).toBeCloseTo(SHIFT - CUBE_SIZE / 2, 6);
            expect(max[0]).toBeCloseTo(SHIFT + CUBE_SIZE / 2, 6);
        });
    });

    describe("scale3D", () => {
        it("should multiply the volume by the product of the three factors", () => {
            // Arrange
            const inputs = new Inputs.Manifold.Scale3DDto(cube, OBLONG);

            // Act
            const scaled = manifold.manifold.transforms.scale3D(inputs);

            // Assert
            const expected = CUBE_VOLUME * OBLONG[0] * OBLONG[1] * OBLONG[2];
            expect(volumeOf(scaled)).toBeCloseTo(expected, 6);
            const [min, max] = boxOf(scaled) as [Inputs.Base.Vector3, Inputs.Base.Vector3];
            expect(max[2] - min[2]).toBeCloseTo(CUBE_SIZE * OBLONG[2], 6);
        });

        it("should cube the volume factor when scaling uniformly", () => {
            // Arrange
            const inputs = new Inputs.Manifold.Scale3DDto(cube, [SCALE_FACTOR, SCALE_FACTOR, SCALE_FACTOR]);

            // Act
            const scaled = manifold.manifold.transforms.scale3D(inputs);

            // Assert
            expect(volumeOf(scaled)).toBeCloseTo(CUBE_VOLUME * SCALE_FACTOR ** 3, 6);
        });
    });

    describe("rotateXYZ", () => {
        it("should preserve volume, and a quarter turn should map one axis onto another", () => {
            // Arrange
            const oblong = manifold.manifold.transforms.scale3D(new Inputs.Manifold.Scale3DDto(cube, OBLONG));
            const inputs = new Inputs.Manifold.RotateXYZDto(oblong, QUARTER_TURN_DEGREES, 0, 0);
            const [beforeMin, beforeMax] = boxOf(oblong) as [Inputs.Base.Vector3, Inputs.Base.Vector3];

            // Act
            const turned = manifold.manifold.transforms.rotateXYZ(inputs);

            // Assert
            expect(volumeOf(turned)).toBeCloseTo(volumeOf(oblong), 6);
            const [afterMin, afterMax] = boxOf(turned) as [Inputs.Base.Vector3, Inputs.Base.Vector3];
            // Turning about X swaps what Y and Z span.
            expect(afterMax[1] - afterMin[1]).toBeCloseTo(beforeMax[2] - beforeMin[2], 6);
            expect(afterMax[2] - afterMin[2]).toBeCloseTo(beforeMax[1] - beforeMin[1], 6);
        });
    });

    describe("mirror", () => {
        it("should reflect the solid across the plane without changing its volume", () => {
            // Arrange
            const offset = manifold.manifold.transforms.translateXYZ(new Inputs.Manifold.TranslateXYZDto(cube, SHIFT, 0, 0));
            const inputs = new Inputs.Manifold.MirrorDto(offset, [1, 0, 0]);

            // Act
            const mirrored = manifold.manifold.transforms.mirror(inputs);

            // Assert
            expect(volumeOf(mirrored)).toBeCloseTo(CUBE_VOLUME, 6);
            const [min, max] = boxOf(mirrored) as [Inputs.Base.Vector3, Inputs.Base.Vector3];
            expect(min[0]).toBeCloseTo(-SHIFT - CUBE_SIZE / 2, 6);
            expect(max[0]).toBeCloseTo(-SHIFT + CUBE_SIZE / 2, 6);
        });
    });

    // The forms that take a vector where the ones above take three numbers, and the two that apply a
    // matrix. Each is the same movement stated differently, so each is checked against what it did to
    // the solid rather than against the call it made.
    describe("scale", () => {
        it("should scale each axis by its own factor", () => {
            // Act
            const scaled = manifold.manifold.transforms.scale(new Inputs.Manifold.Scale3DDto(cube, OBLONG));
            const [min, max] = boxOf(scaled) as [Inputs.Base.Vector3, Inputs.Base.Vector3];

            // Assert
            expect(max[0] - min[0]).toBeCloseTo(CUBE_SIZE * OBLONG[0], 6);
            expect(max[2] - min[2]).toBeCloseTo(CUBE_SIZE * OBLONG[2], 6);
        });
    });

    describe("translate", () => {
        it("should move the solid by the vector it was given", () => {
            // Act
            const moved = manifold.manifold.transforms.translate(new Inputs.Manifold.TranslateDto(cube, [SHIFT, 0, 0]));
            const [min] = boxOf(moved) as [Inputs.Base.Vector3, Inputs.Base.Vector3];

            // Assert
            expect(min[0]).toBeCloseTo(SHIFT - CUBE_SIZE / 2, 6);
        });

        it("should not change the volume", () => {
            // Act
            const moved = manifold.manifold.transforms.translate(new Inputs.Manifold.TranslateDto(cube, [SHIFT, 0, 0]));

            // Assert
            expect(volumeOf(moved)).toBeCloseTo(CUBE_VOLUME, 6);
        });
    });

    describe("translateByVectors", () => {
        it("should place one copy per vector it was given", () => {
            // Act
            const copies = manifold.manifold.transforms.translateByVectors(
                new Inputs.Manifold.TranslateByVectorsDto(cube, [[SHIFT, 0, 0], [0, SHIFT, 0]]));

            // Assert
            expect(copies).toHaveLength(2);
            const [alongX, alongY] = copies.map((copy) => boxOf(copy) as [Inputs.Base.Vector3, Inputs.Base.Vector3]);
            expect(alongX![0][0]).toBeCloseTo(SHIFT - CUBE_SIZE / 2, 6);
            expect(alongY![0][1]).toBeCloseTo(SHIFT - CUBE_SIZE / 2, 6);
        });
    });

    describe("rotate", () => {
        it("should turn the solid by the angles the vector holds", () => {
            // Arrange - an oblong, so that a quarter turn is visible
            const oblong = manifold.manifold.transforms.scale(new Inputs.Manifold.Scale3DDto(cube, OBLONG));

            // Act
            const turned = manifold.manifold.transforms.rotate(new Inputs.Manifold.RotateDto(oblong, [0, 0, QUARTER_TURN_DEGREES]));
            const [min, max] = boxOf(turned) as [Inputs.Base.Vector3, Inputs.Base.Vector3];

            // Assert - what was the x span is now the y span
            expect(max[1] - min[1]).toBeCloseTo(CUBE_SIZE * OBLONG[0], 6);
        });
    });

    describe("transform", () => {
        it("should apply the matrix it was given", () => {
            // Arrange - the kernel reads the matrix in column order, so the translation is the last
            // column and the row after it is ignored
            const translate: Inputs.Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, SHIFT, 0, 0, 1];

            // Act
            const moved = manifold.manifold.transforms.transform(new Inputs.Manifold.TransformDto(cube, translate));
            const [min] = boxOf(moved) as [Inputs.Base.Vector3, Inputs.Base.Vector3];

            // Assert
            expect(min[0]).toBeCloseTo(SHIFT - CUBE_SIZE / 2, 6);
        });
    });

    describe("transforms", () => {
        it("should apply every matrix in turn", () => {
            // Arrange
            const alongX: Inputs.Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, SHIFT, 0, 0, 1];
            const alongY: Inputs.Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, SHIFT, 0, 1];

            // Act
            const moved = manifold.manifold.transforms.transforms(new Inputs.Manifold.TransformsDto(cube, [alongX, alongY]));
            const [min] = boxOf(moved) as [Inputs.Base.Vector3, Inputs.Base.Vector3];

            // Assert
            expect(min[0]).toBeCloseTo(SHIFT - CUBE_SIZE / 2, 6);
            expect(min[1]).toBeCloseTo(SHIFT - CUBE_SIZE / 2, 6);
        });

        it("should refuse a call that names no transform at all", () => {
            expect(() => manifold.manifold.transforms.transforms(new Inputs.Manifold.TransformsDto(cube, [])))
                .toThrow("At least one transform is required");
        });
    });

    describe("warp", () => {
        it("should move every vertex the way the function says", () => {
            // Act
            const warped = manifold.manifold.transforms.warp({
                manifold: cube,
                warpFunc: (vertex) => { vertex[0] += SHIFT; },
            });
            const [min] = boxOf(warped) as [Inputs.Base.Vector3, Inputs.Base.Vector3];

            // Assert
            expect(min[0]).toBeCloseTo(SHIFT - CUBE_SIZE / 2, 6);
        });
    });
});
