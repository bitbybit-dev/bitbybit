import { describe, expect, it } from "vitest";
import type { Base } from "../inputs/base-inputs";
import { InputError } from "../kernel-calls/errors";
import { recipeSurfaceMeshes } from "./surface-mesh";

const IDENTITY: Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const MOVED: Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 10, 20, 30, 1];
const MIRRORED: Base.TransformMatrix = [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const QUARTER_TURN: Base.TransformMatrix = [0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

function surfaceRecipe(roots: Base.RecipeRoot[]): Base.Recipe {
    return {
        format: "bitbybit.recipe",
        version: 1,
        millimetresPerUnit: 1,
        tolerance: 0.01,
        buffers: {
            f64: new Float64Array([0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 2, 0, 2, 2, 0, 0, 5, 0, 0, 1, 0, 1, 1, 0, 1]),
            i32: new Int32Array([0, 1, 2, 0, 1, 2]),
        },
        nodes: [
            { op: "triangles", positions: [0, 9], indices: [0, 3] },
            { op: "triangles", positions: [9, 9], indices: [3, 3] },
            { op: "transform", of: 1, matrix: MOVED },
            { op: "compound", of: [0, 2] },
            { op: "polygon", points: [18, 8], holes: [] },
            { op: "extrude", profile: 4, direction: [0, 0, 1], depth: 1 },
            { op: "compound", of: [0, 5] },
        ],
        roots,
    };
}

function root(node: number, matrix: Base.TransformMatrix = IDENTITY): Base.RecipeRoot {
    return { node, matrix, tag: {} };
}

describe("recipeSurfaceMeshes", () => {
    it("should place a triangle root's vertices by its matrix and keep its triangles", () => {
        // Act
        const [mesh] = recipeSurfaceMeshes(surfaceRecipe([root(0, MOVED)]));

        // Assert
        expect(Array.from(mesh!.positions)).toEqual([10, 20, 30, 11, 20, 30, 10, 21, 30]);
        expect(Array.from(mesh!.indices)).toEqual([0, 1, 2]);
    });

    it("should join the triangles of a compound through its transforms, counting each part's vertices on", () => {
        // Act
        const [mesh] = recipeSurfaceMeshes(surfaceRecipe([root(3)]));

        // Assert
        expect(Array.from(mesh!.positions)).toEqual([0, 0, 0, 1, 0, 0, 0, 1, 0, 10, 20, 32, 10, 22, 32, 10, 20, 35]);
        expect(Array.from(mesh!.indices)).toEqual([0, 1, 2, 3, 4, 5]);
    });

    it("should apply a transform node before the root's placement", () => {
        // Act
        const [mesh] = recipeSurfaceMeshes(surfaceRecipe([root(3, QUARTER_TURN)]));

        // Assert
        expect(Array.from(mesh!.positions.slice(9))).toEqual([-20, 10, 32, -22, 10, 32, -20, 10, 35]);
    });

    it("should turn the winding round under a mirroring matrix so the outside stays out", () => {
        // Act
        const [mesh] = recipeSurfaceMeshes(surfaceRecipe([root(0, MIRRORED)]));

        // Assert
        expect(Array.from(mesh!.positions)).toEqual([0, 0, 0, -1, 0, 0, 0, 1, 0]);
        expect(Array.from(mesh!.indices)).toEqual([0, 2, 1]);
    });

    it("should turn Z into Y as a recipe build does when asked", () => {
        // Act
        const [mesh] = recipeSurfaceMeshes(surfaceRecipe([root(0, MOVED)]), undefined, true);

        // Assert
        expect(Array.from(mesh!.positions)).toEqual([10, 30, -20, 11, 30, -20, 10, 30, -21]);
        expect(Array.from(mesh!.indices)).toEqual([0, 1, 2]);
    });

    it("should give undefined for a root that holds a step other than triangles, transforms and compounds", () => {
        // Act
        const meshes = recipeSurfaceMeshes(surfaceRecipe([root(5), root(6), root(0)]));

        // Assert
        expect(meshes.map((mesh) => mesh?.indices.length)).toEqual([undefined, undefined, 3]);
    });

    it("should read only the roots asked for, in the order asked", () => {
        // Arrange
        const recipe = surfaceRecipe([root(0), root(5), root(0, MOVED)]);

        // Act
        const meshes = recipeSurfaceMeshes(recipe, [2, 1]);

        // Assert
        expect(meshes.map((mesh) => mesh && mesh.positions[0])).toEqual([10, undefined]);
    });

    it("should refuse a root position the recipe does not have, and a value that is not a recipe", () => {
        // Arrange
        const recipe = surfaceRecipe([root(0)]);

        // Act & Assert
        expect(() => recipeSurfaceMeshes(recipe, [1])).toThrow(new InputError("Root 1 is not one of the recipe's 1 roots", "roots"));
        expect(() => recipeSurfaceMeshes(recipe, [0.5])).toThrow("Root 0.5 is not one of the recipe's 1 roots");
        expect(() => recipeSurfaceMeshes({ format: "other" })).toThrow(InputError);
    });

    it("should give nothing for a recipe without roots", () => {
        // Act & Assert
        expect(recipeSurfaceMeshes(surfaceRecipe([]))).toEqual([]);
    });
});
