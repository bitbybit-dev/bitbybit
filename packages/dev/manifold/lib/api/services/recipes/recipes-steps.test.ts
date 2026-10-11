import type { Base } from "@bitbybit-dev/base";
import type * as Manifold3D from "manifold-3d";
import { beforeAll, describe, expect, it } from "vitest";
import { getManifold } from "../../__test__/kernel";
import type { ManifoldService } from "../../manifold-service";

const IDENTITY: Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const SEGMENTS = 256;
const SQUARE = [0, 0, 1, 0, 1, 1, 0, 1];
const BIG_SQUARE = [0, 0, 2, 0, 2, 2, 0, 2];
const RING = [2, 0, 3, 0, 3, 1, 2, 1];
const FRAME_AT = (z: number): number[] => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, z, 1];
const polygonArea = (radius: number): number => (SEGMENTS / 2) * radius * radius * Math.sin((2 * Math.PI) / SEGMENTS);

function recipeOf(nodes: Base.RecipeNode[], roots: number[], f64: number[]): Base.Recipe {
    return {
        format: "bitbybit.recipe",
        version: 1,
        millimetresPerUnit: 1,
        tolerance: 1e-6,
        buffers: { f64: new Float64Array(f64), i32: new Int32Array(0) },
        nodes,
        roots: roots.map((node) => ({ node, matrix: IDENTITY, tag: {} })),
    };
}

describe("ManifoldRecipes.build and the steps that join, turn and loft", () => {
    let manifold: ManifoldService;

    beforeAll(async () => {
        manifold = await getManifold();
    });

    function built(recipe: Base.Recipe, emptyWhenFailed = false): { volume: number; min: number[]; max: number[] }[] {
        const solids: Manifold3D.Manifold[] = manifold.recipes.build({ recipe, circularSegments: SEGMENTS, emptyWhenFailed });
        return solids.map((solid) => {
            const { min, max } = solid.boundingBox();
            const result = { volume: solid.volume(), min: [...min], max: [...max] };
            solid.delete();
            return result;
        });
    }

    it("should join overlapping solids into one by their union and keep what they share by their intersection", () => {
        // Arrange
        const nodes: Base.RecipeNode[] = [
            { op: "polygon", points: [0, 8], holes: [] },
            { op: "extrude", profile: 0, direction: [0, 0, 1], depth: 2 },
            { op: "transform", of: 1, matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1] },
            { op: "union", of: [1, 2] },
            { op: "intersection", of: [1, 2] },
        ];

        // Act
        const [union, intersection] = built(recipeOf(nodes, [3, 4], BIG_SQUARE));

        // Assert
        expect(union?.volume).toBeCloseTo(8 + 8 - 1, 9);
        expect(intersection?.volume).toBeCloseTo(1, 9);
        expect(intersection?.min).toEqual([1, 1, 1]);
    });

    it("should turn a profile about an axis by the right-hand rule, leaving it where it lies at the start", () => {
        // Arrange
        const nodes: Base.RecipeNode[] = [
            { op: "polygon", points: [0, 8], holes: [] },
            { op: "revolve", profile: 0, origin: [0, 0], direction: [0, 1], angle: Math.PI / 2 },
            { op: "revolve", profile: 0, origin: [0, 0], direction: [0, 1], angle: 2 * Math.PI },
        ];

        // Act
        const [quarter, whole] = built(recipeOf(nodes, [1, 2], RING));

        // Assert
        expect(whole?.volume).toBeCloseTo(polygonArea(3) - polygonArea(2), 6);
        expect(quarter?.volume).toBeCloseTo((polygonArea(3) - polygonArea(2)) / 4, 6);
        expect(quarter?.min.map((value) => Math.round(value * 1e6) / 1e6)).toEqual([0, 0, -3]);
        expect(quarter?.max.map((value) => Math.round(value * 1e6) / 1e6)).toEqual([3, 1, 0]);
    });

    it("should turn a profile lying on the other side of its axis, and refuse one lying on both sides", () => {
        // Arrange
        const nodes: Base.RecipeNode[] = [
            { op: "polygon", points: [0, 8], holes: [] },
            { op: "revolve", profile: 0, origin: [0, 0], direction: [0, -1], angle: 2 * Math.PI },
            { op: "revolve", profile: 0, origin: [2.5, 0], direction: [0, 1], angle: Math.PI },
        ];

        // Act
        const [aside, across] = built(recipeOf(nodes, [1, 2], RING), true);

        // Assert
        expect(aside?.volume).toBeCloseTo(polygonArea(3) - polygonArea(2), 6);
        expect(across?.volume).toBe(0);
        expect(() => built(recipeOf(nodes, [2], RING))).toThrow("Recipe node 2 turns a profile that lies on both sides of its axis");
    });

    it("should loft one profile through its frames, and taper one profile into another corner to corner", () => {
        // Arrange
        const nodes: Base.RecipeNode[] = [
            { op: "polygon", points: [0, 8], holes: [] },
            { op: "polygon", points: [8, 8], holes: [] },
            { op: "loft", profiles: [0], frames: [16, 48] },
            { op: "loft", profiles: [1, 0], frames: [16, 32] },
        ];
        const f64 = [...SQUARE, ...BIG_SQUARE, ...FRAME_AT(0), ...FRAME_AT(1), ...FRAME_AT(3)];

        // Act
        const [swept, tapered] = built(recipeOf(nodes, [2, 3], f64));

        // Assert
        expect(swept?.volume).toBeCloseTo(3, 9);
        expect(tapered?.volume).toBeCloseTo((4 + 1 + 2) / 3, 9);
    });

    it("should loft a profile with a hole and a circle, and close a loft whose frames run backwards or mirror", () => {
        // Arrange
        const nodes: Base.RecipeNode[] = [
            { op: "polygon", points: [0, 8], holes: [[8, 8]] },
            { op: "circle", center: [0, 0], radius: 1 },
            { op: "loft", profiles: [0], frames: [16, 32] },
            { op: "loft", profiles: [1], frames: [48, 32] },
            { op: "loft", profiles: [0], frames: [80, 32] },
        ];
        const mirrored = (z: number): number[] => [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, z, 1];
        const f64 = [0, 0, 4, 0, 4, 4, 0, 4, 1, 1, 3, 1, 3, 3, 1, 3, ...FRAME_AT(0), ...FRAME_AT(2), ...FRAME_AT(2), ...FRAME_AT(0), ...mirrored(0), ...mirrored(1)];

        // Act
        const [holed, round, mirror] = built(recipeOf(nodes, [2, 3, 4], f64));

        // Assert
        expect(holed?.volume).toBeCloseTo((16 - 4) * 2, 9);
        expect(round?.volume).toBeCloseTo(polygonArea(1) * 2, 6);
        expect(mirror?.volume).toBeCloseTo(12, 9);
    });

    it("should still turn and loft profiles after a node before them failed, when asked to go on", () => {
        // Arrange
        const nodes: Base.RecipeNode[] = [
            { op: "triangles", positions: [8, 9], indices: [0, 3] },
            { op: "polygon", points: [0, 8], holes: [] },
            { op: "revolve", profile: 1, origin: [-1, 0], direction: [0, 1], angle: Math.PI },
            { op: "loft", profiles: [1], frames: [17, 32] },
        ];
        const f64 = [...SQUARE, 0, 0, 0, 1, 0, 0, 0, 1, 0, ...FRAME_AT(0), ...FRAME_AT(2)];
        const recipe: Base.Recipe = { ...recipeOf(nodes, [0, 2, 3], f64), buffers: { f64: new Float64Array(f64), i32: new Int32Array([0, 1, 2]) } };

        // Act
        const [failed, turned, lofted] = built(recipe, true);

        // Assert
        expect(failed?.volume).toBe(0);
        expect(turned?.volume).toBeGreaterThan(0);
        expect(lofted?.volume).toBeCloseTo(2, 9);
    });

    it("should refuse to loft profiles whose loops hold different numbers of corners", () => {
        // Arrange
        const nodes: Base.RecipeNode[] = [
            { op: "polygon", points: [0, 8], holes: [] },
            { op: "circle", center: [0, 0], radius: 1 },
            { op: "loft", profiles: [0, 1], frames: [8, 32] },
        ];

        // Act & Assert
        expect(() => built(recipeOf(nodes, [2], [...SQUARE, ...FRAME_AT(0), ...FRAME_AT(1)]))).toThrow("Recipe node 2 lofts profiles whose loops hold different numbers of corners");
    });

    it("should fail a loft whose frames leave its sections in one plane, or that is thinner than its coordinates' precision, and go on past it when asked", () => {
        // Arrange
        const loftThrough = (frames: number[][]): Base.Recipe => recipeOf([{ op: "polygon", points: [0, 8], holes: [] }, { op: "loft", profiles: [0], frames: [8, 16 * frames.length] }], [1], [...BIG_SQUARE, ...frames.flat()]);
        const slid = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 3, 0, 0, 1];
        const recipes = [loftThrough([FRAME_AT(0), FRAME_AT(0)]), loftThrough([FRAME_AT(0), slid]), loftThrough([FRAME_AT(0), FRAME_AT(1e-7)])];
        const thin = "Recipe node 1 is no thicker than the precision of its coordinates: its frames leave its sections in one plane";

        // Act
        const failures = recipes.map((recipe) => () => built(recipe));
        const goneOn = recipes.map((recipe) => built(recipe, true)[0]!.volume);
        const thick = built(loftThrough([FRAME_AT(0), FRAME_AT(1e-5)]))[0]!.volume;

        // Assert
        for (const failure of failures) {
            expect(failure).toThrow(thin);
        }
        expect(goneOn).toEqual([0, 0, 0]);
        expect(thick).toBeCloseTo(4e-5, 9);
    });

    it("should refuse a recipe whose loft frames mirror where the first does not", () => {
        // Arrange
        const nodes: Base.RecipeNode[] = [
            { op: "polygon", points: [0, 8], holes: [] },
            { op: "loft", profiles: [0], frames: [8, 32] },
        ];
        const mirrored = [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1];

        // Act & Assert
        expect(() => built(recipeOf(nodes, [1], [...SQUARE, ...FRAME_AT(0), ...mirrored]))).toThrow("nodes[1].frames[1] turns the profile over where the first frame does not");
    });
});
