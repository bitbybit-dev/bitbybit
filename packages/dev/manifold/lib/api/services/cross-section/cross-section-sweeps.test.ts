import type { Base } from "@bitbybit-dev/base";
import type * as Manifold3D from "manifold-3d";
import { beforeAll, describe, expect, it } from "vitest";
import { getManifold } from "../../__test__/kernel";
import type { ManifoldService } from "../../manifold-service";

const AT = (z: number, scale = 1): Base.TransformMatrix => [scale, 0, 0, 0, 0, scale, 0, 0, 0, 0, 1, 0, 0, 0, z, 1];
const AWAY = (z: number): Base.TransformMatrix => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -1000, -1000, z, 1];

describe("CrossSectionOperations.loft and sweep", () => {
    let manifold: ManifoldService;

    beforeAll(async () => {
        manifold = await getManifold();
    });

    function measured(solid: Manifold3D.Manifold): { volume: number; min: number[]; max: number[] } {
        const { min, max } = solid.boundingBox();
        const result = { volume: solid.volume(), min: [...min], max: [...max] };
        solid.delete();
        return result;
    }

    function square(size: number): Manifold3D.CrossSection {
        return manifold.crossSection.shapes.square({ size, center: true });
    }

    it("should loft one cross-section through its frames, and taper it by a frame that scales or by a scaled copy", () => {
        // Arrange
        const base = square(2);
        const smaller = manifold.crossSection.transforms.scale({ crossSection: base, factor: 0.5 });

        // Act
        const straight = measured(manifold.crossSection.operations.loft({ crossSections: [base], frames: [AT(0), AT(1), AT(3)] }));
        const scaled = measured(manifold.crossSection.operations.loft({ crossSections: [base], frames: [AT(0), AT(4, 0.5)] }));
        const copied = measured(manifold.crossSection.operations.loft({ crossSections: [base, smaller], frames: [AT(0), AT(4)] }));

        // Assert
        expect(straight.volume).toBeCloseTo(12, 9);
        expect([straight.min, straight.max]).toEqual([[-1, -1, 0], [1, 1, 3]]);
        expect(scaled.volume).toBeCloseTo((4 / 3) * (4 + 1 + 2), 9);
        expect(copied.volume).toBeCloseTo(scaled.volume, 9);
    });

    it("should loft a cross-section far smaller than a unit, and one with a notch far narrower than its size, without losing either", () => {
        // Arrange
        const tiny = square(1e-4);
        const notch = manifold.crossSection.shapes.rectangle({ length: 1e-4, height: 1, center: false });
        const notched = manifold.crossSection.booleans.subtract({ crossSection1: square(2), crossSection2: notch });

        // Act
        const solid = measured(manifold.crossSection.operations.loft({ crossSections: [tiny], frames: [AT(0), AT(1e-4)] }));
        const cut = measured(manifold.crossSection.operations.loft({ crossSections: [notched], frames: [AT(0), AT(1)] }));

        // Assert
        expect(solid.volume).toBeCloseTo(1e-12, 18);
        expect(cut.volume).toBeCloseTo(4 - 1e-4, 6);
    });

    it("should loft a cross-section with a hole, and through a frame that mirrors", () => {
        // Arrange
        const holed = manifold.crossSection.booleans.subtract({ crossSection1: square(4), crossSection2: square(2) });
        const mirrored: Base.TransformMatrix = [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 2, 1];

        // Act
        const tube = measured(manifold.crossSection.operations.loft({ crossSections: [holed], frames: [AT(0), AT(2)] }));
        const flipped = measured(manifold.crossSection.operations.loft({ crossSections: [square(2)], frames: [[-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], mirrored] }));

        // Assert
        expect(tube.volume).toBeCloseTo((16 - 4) * 2, 9);
        expect(flipped.volume).toBeCloseTo(8, 9);
    });

    it("should refuse a loft of one frame, a frame that projects or flattens, cross-sections that do not match the frames and loops that differ", () => {
        // Arrange
        const base = square(2);
        const circle = manifold.crossSection.shapes.circle({ radius: 1, circularSegments: 16 });
        const loft = (crossSections: Manifold3D.CrossSection[], frames: Base.TransformMatrix[]) => (): void => {
            manifold.crossSection.operations.loft({ crossSections, frames });
        };
        const projecting = [[3, 0.5], [7, 0.5], [11, 0.5], [15, 2]].map(([index, value]) => AT(1).map((entry, at) => (at === index ? value! : entry)) as Base.TransformMatrix);

        // Act & Assert
        expect(loft([base], [AT(0)])).toThrow("A loft needs at least 2 frames");
        for (const frame of projecting) {
            expect(loft([base], [AT(0), frame])).toThrow("Frame 1 is not sixteen numbers");
        }
        expect(loft(undefined as never, [AT(0), AT(1)])).toThrow("A loft needs one cross-section, or one for each of its 2 frames");
        expect(loft([base], [AT(0), AT(1, 0)])).toThrow("Frame 1 is not sixteen numbers");
        expect(loft([base, base], [AT(0), AT(1), AT(2)])).toThrow("A loft needs one cross-section, or one for each of its 3 frames");
        expect(loft([base, circle], [AT(0), AT(1)])).toThrow("The loft lofts profiles whose loops hold different numbers of corners");
    });

    it("should refuse frames that leave the sections in one plane, and frames that mirror where the first does not or the other way round", () => {
        // Arrange
        const base = square(2);
        const loft = (frames: Base.TransformMatrix[]) => (): void => {
            manifold.crossSection.operations.loft({ crossSections: [base], frames });
        };
        const slid: Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 3, 1, 0, 1];
        const mirrored: Base.TransformMatrix = [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1];
        const flat = "The loft is no thicker than the precision of its coordinates: its frames leave its sections in one plane";
        const turnsOver = "turns the profile over where frame 0 does not, or the other way round: a loft's frames all mirror, or none do";

        // Act & Assert
        expect(loft([AT(0), AT(0)])).toThrow(flat);
        expect(loft([AT(0), slid])).toThrow(flat);
        expect(loft([AT(0, 1000), AT(1e-4, 1000)])).toThrow(flat);
        expect(loft([AT(0, 1000), AT(1e-4)])).toThrow(flat);
        expect(loft([AWAY(0), AWAY(1e-4)])).toThrow(flat);
        expect(() => manifold.crossSection.operations.loft({ crossSections: [base, square(2000)], frames: [AT(0), AT(1e-4)] })).toThrow(flat);
        expect(loft([AT(0, 1000), AT(1, 1000)])).not.toThrow();
        expect(loft([AT(0), AT(1), mirrored])).toThrow(`Frame 2 ${turnsOver}`);
        expect(loft([mirrored, AT(1)])).toThrow(`Frame 1 ${turnsOver}`);
    });

    it("should sweep a cross-section along a path, mitring its corners so the solid keeps its width", () => {
        // Arrange
        const profile = square(1);

        // Act
        const bent = measured(manifold.crossSection.operations.sweep({ crossSection: profile, path: [[0, 0, 0], [10, 0, 0], [10, 0, 0], [10, 10, 0]] }));

        // Assert
        expect(bent.volume).toBeCloseTo(20, 9);
        expect(bent.min.map((value) => Math.round(value * 1e9) / 1e9)).toEqual([0, -0.5, -0.5]);
        expect(bent.max.map((value) => Math.round(value * 1e9) / 1e9)).toEqual([10.5, 10, 0.5]);
    });

    it("should round a path's corners by the radius in enough segments to keep each within its share of a turn, and turn the profile's X axis toward the direction given", () => {
        // Arrange
        const flat = manifold.crossSection.shapes.rectangle({ length: 2, height: 0.5, center: true });

        // Act
        const rounded = measured(manifold.crossSection.operations.sweep({ crossSection: square(1), path: [[0, 0, 0], [10, 0, 0], [10, 10, 0]], cornerRadius: 3, circularSegments: 32 }));
        const coarse = measured(manifold.crossSection.operations.sweep({ crossSection: square(1), path: [[0, 0, 0], [10, 0, 0], [10, 10, 0]], cornerRadius: 3, circularSegments: 5 }));
        const upright = measured(manifold.crossSection.operations.sweep({ crossSection: flat, path: [[0, 0, 0], [0, 10, 0]], xDirection: [0, 0, 1] }));

        // Assert
        expect(rounded.volume).toBeCloseTo(14 + 48 * Math.sin(Math.PI / 32), 6);
        expect(coarse.volume).toBeCloseTo(14 + 12 * Math.sin(Math.PI / 8), 5);
        expect(upright.max[2]! - upright.min[2]!).toBeCloseTo(2, 9);
        expect(upright.max[0]! - upright.min[0]!).toBeCloseTo(0.5, 9);
    });

    it("should refuse a sweep along a path of one point or no path, and a rounded corner of too few segments", () => {
        // Arrange
        const profile = square(1);

        // Act & Assert
        expect(() => manifold.crossSection.operations.sweep({ crossSection: profile, path: [[1, 1, 1], [1, 1, 1]] })).toThrow("A sweep needs a path of at least 2 distinct points");
        expect(() => manifold.crossSection.operations.sweep({ crossSection: profile, path: undefined as never })).toThrow("A sweep needs a path of at least 2 distinct points");
        expect(() => manifold.crossSection.operations.sweep({ crossSection: profile, path: [[0, 0, 0], [1, 0, 0]], cornerRadius: 1, circularSegments: 2 })).toThrow("A rounded corner needs at least 3 segments a turn, got 2");
        expect(() => manifold.crossSection.operations.sweep({ crossSection: profile, path: [[0, 0, 0], [1, 0, 0]], cornerRadius: 1, circularSegments: 3.5 })).toThrow("A rounded corner needs at least 3 segments a turn, got 3.5");
    });
});
