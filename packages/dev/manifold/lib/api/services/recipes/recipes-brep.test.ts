import type { Base } from "@bitbybit-dev/base";
import { beforeAll, describe, expect, it } from "vitest";
import { getManifold } from "../../__test__/kernel";
import type { ManifoldService } from "../../manifold-service";

const IDENTITY: Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const SQUARE = [0, 0, 2, 0, 2, 1, 0, 1];
const SEAM = [1, 0, 0, 1, 0, 2];
const OPEN_TRIANGLE = [0, 0, 0, 1, 0, 0, 0, 1, 0];
const SEAM_AT = SQUARE.length;
const TRIANGLE_AT = SEAM_AT + SEAM.length;
const BOX_VOLUME = 2 * 1 * 3;

const placement = (z: number): Base.RecipeBrepPlacement => ({ origin: [0, 0, z], axis: [0, 0, 1], xDirection: [1, 0, 0] });

function cylinder(fallback?: number): Base.RecipeBrepNode {
    return {
        op: "brep",
        vertices: [SEAM_AT, SEAM.length],
        curves: [
            { kind: "circle", ...placement(0), radius: 1 },
            { kind: "circle", ...placement(2), radius: 1 },
            { kind: "line", origin: [1, 0, 0], direction: [0, 0, 1] },
        ],
        surfaces: [{ kind: "cylinder", ...placement(0), radius: 1 }, { kind: "plane", ...placement(0) }, { kind: "plane", ...placement(2) }],
        edges: [{ curve: 0, start: 0, end: 0 }, { curve: 1, start: 1, end: 1 }, { curve: 2, start: 0, end: 1 }],
        faces: [
            { surface: 0, sameSense: true, bounds: [{ outer: true, edges: [0, 2, 1, 2], forward: [true, true, false, false] }] },
            { surface: 1, sameSense: false, bounds: [{ outer: true, edges: [0], forward: [false] }] },
            { surface: 2, sameSense: true, bounds: [{ outer: true, edges: [1], forward: [true] }] },
        ],
        closed: true,
        ...(fallback === undefined ? {} : { fallback }),
    };
}

function recipeOf(nodes: Base.RecipeNode[], roots: number[]): Base.Recipe {
    return {
        format: "bitbybit.recipe",
        version: 1,
        millimetresPerUnit: 1,
        tolerance: 1e-6,
        buffers: { f64: new Float64Array([...SQUARE, ...SEAM, ...OPEN_TRIANGLE]), i32: new Int32Array([0, 1, 2]) },
        nodes,
        roots: roots.map((node) => ({ node, matrix: IDENTITY, tag: {} })),
    };
}

const BOX: Base.RecipeNode[] = [
    { op: "polygon", points: [0, SQUARE.length], holes: [] },
    { op: "extrude", profile: 0, direction: [0, 0, 1], depth: 3 },
];

describe("ManifoldRecipes and the brep node", () => {
    let manifold: ManifoldService;

    beforeAll(async () => {
        manifold = await getManifold();
    });

    it("should build a brep node's fallback, since it builds no exact surfaces", () => {
        // Arrange
        const recipe = recipeOf([...BOX, cylinder(1)], [2, 1]);

        // Act
        const solids = manifold.recipes.build({ recipe });

        // Assert
        expect(solids.map((solid) => solid.volume())).toEqual([BOX_VOLUME, BOX_VOLUME]);
        solids.forEach((solid) => solid.delete());
    });

    it("should refuse a brep node without a fallback, saying why, or leave its root empty when asked", () => {
        // Arrange
        const recipe = recipeOf([...BOX, cylinder()], [2, 1]);

        // Act
        const build = (): unknown => manifold.recipes.build({ recipe });
        const solids = manifold.recipes.build({ recipe, emptyWhenFailed: true });

        // Assert
        expect(build).toThrow("Recipe node 2 describes faces on exact surfaces, which this kernel does not build, and gives no fallback to build instead");
        expect(solids.map((solid) => solid.volume())).toEqual([0, BOX_VOLUME]);
        solids.forEach((solid) => solid.delete());
    });

    it("should fail a brep node without a fallback after an earlier step failed, leaving the roots on both empty", () => {
        // Arrange
        const recipe = recipeOf([{ op: "triangles", positions: [TRIANGLE_AT, OPEN_TRIANGLE.length], indices: [0, 3] }, cylinder()], [0, 1]);

        // Act
        const solids = manifold.recipes.build({ recipe, emptyWhenFailed: true });

        // Assert
        expect(solids.map((solid) => solid.isEmpty())).toEqual([true, true]);
        solids.forEach((solid) => solid.delete());
    });

    it("should draw a brep node whose fallback is an open surface as that surface", () => {
        // Arrange
        const recipe = recipeOf([{ op: "triangles", positions: [TRIANGLE_AT, OPEN_TRIANGLE.length], indices: [0, 3] }, cylinder(0)], [1]);

        // Act
        const { meshes, placements } = manifold.recipes.meshes({ recipe, emptyWhenFailed: true });

        // Assert
        expect(placements).toHaveLength(1);
        expect(placements[0]!.mesh).toBe(0);
        expect(Array.from(meshes[0]!.triVerts)).toEqual([0, 1, 2]);
    });
});
