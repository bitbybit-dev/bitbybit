import { describe, it, expect, beforeAll } from "vitest";
import { getManifold } from "../../__test__/kernel";
import type { ManifoldService } from "../../manifold-service";
import type * as Manifold3D from "manifold-3d";
import * as Inputs from "../../inputs";

const BIG_SIZE = 4;
const BIG_VOLUME = 64;
const SMALL_SIZE = 2;
const SMALL_VOLUME = 8;
// The small cube sits on a corner of the big one, so exactly one of its octants overlaps.
const OVERLAP_VOLUME = 1;
const OVERLAP_CORNER = 2;
const FAR = 100;
const GENUS_OF_A_BALL = 0;
const GENUS_WITH_ONE_HOLE = 1;
const HOLE_RADIUS = 0.5;
const HOLE_SEGMENTS = 64;
const HOLE_LENGTH = 10;

describe("ManifoldBooleans", () => {
    let manifold: ManifoldService;
    let big: Manifold3D.Manifold;
    let corner: Manifold3D.Manifold;
    let distant: Manifold3D.Manifold;
    const volumeOf = (shape: Manifold3D.Manifold): number =>
        manifold.manifold.evaluate.volume(new Inputs.Manifold.ManifoldDto(shape));
    const genusOf = (shape: Manifold3D.Manifold): number =>
        manifold.manifold.evaluate.genus(new Inputs.Manifold.ManifoldDto(shape));

    beforeAll(async () => {
        manifold = await getManifold();
        big = manifold.manifold.shapes.cube(new Inputs.Manifold.CubeDto(true, BIG_SIZE));
        const small = manifold.manifold.shapes.cube(new Inputs.Manifold.CubeDto(true, SMALL_SIZE));
        corner = manifold.manifold.transforms.translateXYZ(
            new Inputs.Manifold.TranslateXYZDto(small, OVERLAP_CORNER, OVERLAP_CORNER, OVERLAP_CORNER));
        distant = manifold.manifold.transforms.translateXYZ(
            new Inputs.Manifold.TranslateXYZDto(small, FAR, 0, 0));
    }, 120_000);

    describe("add", () => {
        it("should count a shared region once", () => {
            // Arrange
            const inputs = new Inputs.Manifold.TwoManifoldsDto(big, corner);

            // Act
            const joined = manifold.manifold.booleans.add(inputs);

            // Assert
            expect(volumeOf(joined)).toBeCloseTo(BIG_VOLUME + SMALL_VOLUME - OVERLAP_VOLUME, 6);
        });
    });

    describe("subtract", () => {
        it("should remove only the overlapping region", () => {
            // Arrange
            const inputs = new Inputs.Manifold.TwoManifoldsDto(big, corner);

            // Act
            const cut = manifold.manifold.booleans.subtract(inputs);

            // Assert
            expect(volumeOf(cut)).toBeCloseTo(BIG_VOLUME - OVERLAP_VOLUME, 6);
            expect(genusOf(cut)).toBe(GENUS_OF_A_BALL);
        });

        it("should put a hole through the solid when the tool passes clean through", () => {
            // Arrange
            const drill = manifold.manifold.shapes.cylinder(
                new Inputs.Manifold.CylinderDto(HOLE_LENGTH, HOLE_RADIUS, HOLE_RADIUS, HOLE_SEGMENTS, true));
            const inputs = new Inputs.Manifold.TwoManifoldsDto(big, drill);

            // Act
            const drilled = manifold.manifold.booleans.subtract(inputs);

            // Assert
            expect(genusOf(drilled)).toBe(GENUS_WITH_ONE_HOLE);
            expect(volumeOf(drilled)).toBeCloseTo(BIG_VOLUME - Math.PI * HOLE_RADIUS ** 2 * BIG_SIZE, 1);
        });
    });

    describe("intersect", () => {
        it("should keep only the shared region", () => {
            // Arrange
            const inputs = new Inputs.Manifold.TwoManifoldsDto(big, corner);

            // Act
            const shared = manifold.manifold.booleans.intersect(inputs);

            // Assert
            expect(volumeOf(shared)).toBeCloseTo(OVERLAP_VOLUME, 6);
        });

        it("should produce an empty solid from two that do not touch", () => {
            // Arrange
            const inputs = new Inputs.Manifold.TwoManifoldsDto(big, distant);

            // Act
            const shared = manifold.manifold.booleans.intersect(inputs);

            // Assert
            expect(volumeOf(shared)).toBe(0);
            expect(manifold.manifold.evaluate.isEmpty(new Inputs.Manifold.ManifoldDto(shared))).toBe(true);
        });
    });

    describe("the list forms", () => {
        it("should agree with the pairwise forms", () => {
            // Arrange
            const list = new Inputs.Manifold.ManifoldsDto([big, corner]);
            const pair = new Inputs.Manifold.TwoManifoldsDto(big, corner);

            // Act
            const unionOfList = manifold.manifold.booleans.union(list);
            const differenceOfList = manifold.manifold.booleans.difference(list);
            const intersectionOfList = manifold.manifold.booleans.intersection(list);

            // Assert
            expect(volumeOf(unionOfList)).toBeCloseTo(volumeOf(manifold.manifold.booleans.unionTwo(pair)), 6);
            expect(volumeOf(differenceOfList)).toBeCloseTo(volumeOf(manifold.manifold.booleans.differenceTwo(pair)), 6);
            expect(volumeOf(intersectionOfList)).toBeCloseTo(volumeOf(manifold.manifold.booleans.intersectionTwo(pair)), 6);
        });
    });

    describe("splitByPlane", () => {
        it("should divide a solid into two halves that add back up to the whole", () => {
            // Arrange
            const inputs = new Inputs.Manifold.SplitByPlaneDto(big, [0, 0, 1], 0);

            // Act
            const halves = manifold.manifold.booleans.splitByPlane(inputs);

            // Assert
            expect(halves).toHaveLength(2);
            const [lower, upper] = halves as [Manifold3D.Manifold, Manifold3D.Manifold];
            expect(volumeOf(lower) + volumeOf(upper)).toBeCloseTo(BIG_VOLUME, 6);
            expect(volumeOf(lower)).toBeCloseTo(BIG_VOLUME / 2, 6);
        });
    });

    describe("split", () => {
        it("should give back both what the cutter kept and what it took away", () => {
            // Arrange - a cutter reaching through half the cube
            const cutter = manifold.manifold.transforms.translateXYZ(
                new Inputs.Manifold.TranslateXYZDto(big, BIG_SIZE / 2, 0, 0));

            // Act
            const pieces = manifold.manifold.booleans.split(new Inputs.Manifold.SplitManifoldsDto(big, cutter));

            // Assert
            expect(pieces).toHaveLength(2);
            expect(volumeOf(pieces[0]!) + volumeOf(pieces[1]!)).toBeCloseTo(BIG_VOLUME, 5);
        });
    });

    describe("trimByPlane", () => {
        it("should keep only what lies on one side of the plane", () => {
            // Act
            const trimmed = manifold.manifold.booleans.trimByPlane(new Inputs.Manifold.TrimByPlaneDto(big, [1, 0, 0], 0));

            // Assert
            expect(volumeOf(trimmed)).toBeCloseTo(BIG_VOLUME / 2, 5);
        });
    });

    describe("splitByPlaneOnOffsets", () => {
        it("should give back one more piece than the offsets it was given", () => {
            // Act
            const pieces = manifold.manifold.booleans.splitByPlaneOnOffsets(
                new Inputs.Manifold.SplitByPlaneOnOffsetsDto(big, [1, 0, 0], [-BIG_SIZE / 4, 0, BIG_SIZE / 4]));

            // Assert - three planes cut a solid into four
            expect(pieces).toHaveLength(4);
        });

        it("should cut each piece at the offset that follows it", () => {
            // Act
            const pieces = manifold.manifold.booleans.splitByPlaneOnOffsets(
                new Inputs.Manifold.SplitByPlaneOnOffsetsDto(big, [1, 0, 0], [-BIG_SIZE / 4, 0, BIG_SIZE / 4]));

            // Assert - a 4 wide cube cut at -1, 0 and 1 gives four slabs of one unit each
            expect(pieces.map((piece) => volumeOf(piece))).toEqual(pieces.map(() => expect.closeTo(BIG_VOLUME / 4, 5)));
        });

        it("should give back the whole solid for an offset the solid lies beyond", () => {
            // Act - a plane far along the normal leaves the whole solid on the near side of it
            const pieces = manifold.manifold.booleans.splitByPlaneOnOffsets(
                new Inputs.Manifold.SplitByPlaneOnOffsetsDto(big, [1, 0, 0], [FAR]));

            // Assert
            expect(pieces).toHaveLength(1);
            expect(volumeOf(pieces[0]!)).toBeCloseTo(BIG_VOLUME, 5);
        });

        it("should give back the whole solid for an offset that lies before all of it", () => {
            // Act - a plane far back along the normal leaves nothing on the near side of it, so the
            // solid comes back whole as the piece beyond the plane
            const pieces = manifold.manifold.booleans.splitByPlaneOnOffsets(
                new Inputs.Manifold.SplitByPlaneOnOffsetsDto(big, [1, 0, 0], [-FAR]));

            // Assert
            expect(pieces).toHaveLength(1);
            expect(volumeOf(pieces[0]!)).toBeCloseTo(BIG_VOLUME, 5);
        });

        it("should give back nothing when there is no solid to split", () => {
            // Arrange - subtracting a shape from itself leaves nothing behind
            const empty = manifold.manifold.booleans.subtract(new Inputs.Manifold.TwoManifoldsDto(big, big));

            // Act
            const pieces = manifold.manifold.booleans.splitByPlaneOnOffsets(
                new Inputs.Manifold.SplitByPlaneOnOffsetsDto(empty, [1, 0, 0], [0]));

            // Assert
            expect(pieces).toEqual([]);
        });

        it("should account for the whole of the solid it was given", () => {
            // Act
            const pieces = manifold.manifold.booleans.splitByPlaneOnOffsets(
                new Inputs.Manifold.SplitByPlaneOnOffsetsDto(big, [1, 0, 0], [0]));

            // Assert - both halves come back, and together they are the solid that went in
            expect(pieces).toHaveLength(2);
            expect(pieces.reduce((total, piece) => total + volumeOf(piece), 0)).toBeCloseTo(BIG_VOLUME, 5);
        });

        it("should stop cutting once nothing is left to cut", () => {
            // Act - the first plane lies beyond the solid, so everything is a finished piece and the
            // offsets after it have nothing to work on
            const pieces = manifold.manifold.booleans.splitByPlaneOnOffsets(
                new Inputs.Manifold.SplitByPlaneOnOffsetsDto(big, [1, 0, 0], [FAR, FAR * 2]));

            // Assert
            expect(pieces).toHaveLength(1);
            expect(volumeOf(pieces[0]!)).toBeCloseTo(BIG_VOLUME, 5);
        });

        it("should give back the solid whole when it was asked to cut it nowhere", () => {
            // Act
            const pieces = manifold.manifold.booleans.splitByPlaneOnOffsets(
                new Inputs.Manifold.SplitByPlaneOnOffsetsDto(big, [1, 0, 0], []));

            // Assert
            expect(pieces).toHaveLength(1);
            expect(volumeOf(pieces[0]!)).toBeCloseTo(BIG_VOLUME, 5);
        });
    });
});
