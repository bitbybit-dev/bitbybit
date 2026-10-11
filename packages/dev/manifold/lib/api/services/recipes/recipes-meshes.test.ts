import type { Base } from "@bitbybit-dev/base";
import { beforeAll, describe, expect, it } from "vitest";
import { getManifold } from "../../__test__/kernel";
import type * as Inputs from "../../inputs";
import type { ManifoldService } from "../../manifold-service";

const IDENTITY: Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const SQUARE = [0, 0, 2, 0, 2, 1, 0, 1];
const TETRAHEDRON = [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1];
const BOX: Base.RecipeNode[] = [
    { op: "polygon", points: [0, 8], holes: [] },
    { op: "extrude", profile: 0, direction: [0, 0, 1], depth: 3 },
];

function moved(x: number, y = 0, z = 0): Base.TransformMatrix {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
}

function recipeOf(nodes: Base.RecipeNode[], roots: Base.RecipeRoot[], f64: number[] = SQUARE, i32: number[] = []): Base.Recipe {
    return { format: "bitbybit.recipe", version: 1, millimetresPerUnit: 1, tolerance: 1e-6, buffers: { f64: new Float64Array(f64), i32: new Int32Array(i32) }, nodes, roots, groups: [{ name: "Storey", tag: {} }] };
}

function rootOf(node: number, matrix: Base.TransformMatrix = IDENTITY, tag: Record<string, Base.RecipeTagValue> = {}, group?: number): Base.RecipeRoot {
    return { node, matrix, tag, ...(group === undefined ? {} : { group }) };
}

function boundsOf(mesh: Inputs.Manifold.DecomposedManifoldMeshDto, matrix: Base.TransformMatrix): number[][] {
    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];
    for (let at = 0; at < mesh.vertProperties.length; at += mesh.numProp) {
        const [x, y, z] = [mesh.vertProperties[at]!, mesh.vertProperties[at + 1]!, mesh.vertProperties[at + 2]!];
        for (let axis = 0; axis < 3; axis++) {
            const value = matrix[axis]! * x + matrix[4 + axis]! * y + matrix[8 + axis]! * z + matrix[12 + axis]!;
            min[axis] = Math.min(min[axis]!, value);
            max[axis] = Math.max(max[axis]!, value);
        }
    }
    return [min, max].map((corner) => corner.map((value) => Math.round(value * 1e6) / 1e6 + 0));
}

describe("ManifoldRecipes.meshes", () => {
    let manifold: ManifoldService;

    beforeAll(async () => {
        manifold = await getManifold();
    });

    it("should mesh a step that several roots place through turns and moves once, and keep a mirrored or scaled one apart", () => {
        // Arrange
        const mirror: Base.TransformMatrix = [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        const recipe = recipeOf([
            ...BOX,
            { op: "transform", of: 1, matrix: moved(10) },
            { op: "transform", of: 1, matrix: mirror },
            { op: "transform", of: 1, matrix: [2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1] },
        ], [rootOf(1, IDENTITY, { globalId: "a" }, 0), rootOf(2, moved(0, 5), { globalId: "b" }), rootOf(3), rootOf(4)]);

        // Act
        const { meshes, placements } = manifold.recipes.meshes({ recipe });

        // Assert
        expect(meshes).toHaveLength(3);
        expect(placements.map((placement) => placement.mesh)).toEqual([placements[0]!.mesh, placements[0]!.mesh, placements[2]!.mesh, placements[3]!.mesh]);
        expect(new Set(placements.map((placement) => placement.mesh)).size).toBe(3);
        expect(placements[1]!.matrix).toEqual(moved(10, 5));
        expect(placements[0]).toEqual({ mesh: placements[0]!.mesh, matrix: IDENTITY, tag: { globalId: "a" }, group: 0 });
        expect(placements[1]!.tag).toEqual({ globalId: "b" });
        expect(meshes.every((mesh) => mesh.numProp === 6)).toBe(true);
        expect(boundsOf(meshes[placements[1]!.mesh]!, placements[1]!.matrix)).toEqual([[10, 5, 0], [12, 6, 3]]);
        expect(boundsOf(meshes[placements[2]!.mesh]!, placements[2]!.matrix)).toEqual([[-2, 0, 0], [0, 1, 3]]);
        expect(boundsOf(meshes[placements[3]!.mesh]!, placements[3]!.matrix)).toEqual([[0, 0, 0], [4, 2, 6]]);
    });

    it("should fold the turn of Z into Y into every placement and shade faces flat at a sharp angle of 0", () => {
        // Arrange
        const recipe = recipeOf(BOX, [rootOf(1, moved(1, 2, 3))]);

        // Act
        const turned = manifold.recipes.meshes({ recipe, adjustZtoY: true });
        const flat = manifold.recipes.meshes({ recipe, minSharpAngle: 0 });
        const smooth = manifold.recipes.meshes({ recipe, minSharpAngle: 180 });

        // Assert
        expect(turned.placements[0]!.matrix).toEqual([1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 1, 3, -2, 1]);
        expect(boundsOf(turned.meshes[0]!, turned.placements[0]!.matrix)).toEqual([[1, 3, -3], [3, 6, -2]]);
        expect(flat.meshes[0]!.vertProperties.length / 6).toBe(24);
        expect(smooth.meshes[0]!.vertProperties.length / 6).toBe(8);
    });

    it("should draw a root that fails as a solid as its surface when it is triangles alone, and nothing for a step built on it or a host cut away entirely", () => {
        // Arrange
        const recipe = recipeOf([
            ...BOX,
            { op: "triangles", positions: [8, 9], indices: [0, 3] },
            { op: "polygon", points: [17, 8], holes: [] },
            { op: "extrude", profile: 3, direction: [0, 0, 1], depth: 5 },
            { op: "voids", host: 1, openings: [4] },
            { op: "difference", of: 2, tools: [1] },
        ], [rootOf(2, moved(4)), rootOf(5), rootOf(1), rootOf(6)], [...SQUARE, ...TETRAHEDRON.slice(0, 9), -1, -1, 3, -1, 3, 2, -1, 2], [0, 1, 2]);

        // Act
        const { meshes, placements } = manifold.recipes.meshes({ recipe, emptyWhenFailed: true });
        const strict = (): Inputs.Manifold.RecipeMeshesDto => manifold.recipes.meshes({ recipe });

        // Assert
        expect(placements.map((placement) => placement.mesh)).toEqual([1, -1, 0, -1]);
        expect(placements[0]!.matrix).toEqual(IDENTITY);
        expect(boundsOf(meshes[1]!, placements[0]!.matrix)).toEqual([[4, 0, 0], [5, 1, 0]]);
        expect(strict).toThrow("Recipe node 2 is a triangle mesh that is not closed");
    });

    it("should refuse a circle of fewer than three sides and a sharp angle outside 0 to 180 degrees", () => {
        // Arrange
        const recipe = recipeOf(BOX, [rootOf(1)]);

        // Act & Assert
        expect(() => manifold.recipes.meshes({ recipe, circularSegments: 2 })).toThrow("A circle needs at least 3 sides, got 2");
        expect(() => manifold.recipes.meshes({ recipe, minSharpAngle: -1 })).toThrow("minSharpAngle must be an angle from 0 to 180 degrees, got -1");
        expect(() => manifold.recipes.meshes({ recipe, minSharpAngle: Number.NaN })).toThrow("got NaN");
    });
});
