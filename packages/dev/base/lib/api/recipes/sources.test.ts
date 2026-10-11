import { describe, expect, it } from "vitest";
import type { Base } from "../inputs/base-inputs";
import { recipeSourceOf } from "./sources";

const IDENTITY: Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const QUARTER_TURN: Base.TransformMatrix = [0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

function moved(x: number, y = 0, z = 0): Base.TransformMatrix {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
}

function recipeOf(nodes: Base.RecipeNode[]): Base.Recipe {
    return { format: "bitbybit.recipe", version: 1, millimetresPerUnit: 1, tolerance: 1e-6, buffers: { f64: new Float64Array(8), i32: new Int32Array(0) }, nodes, roots: [] };
}

describe("recipeSourceOf", () => {
    it("should fold every transform that turns and moves into the matrix, the first transform applied first", () => {
        // Arrange
        const recipe = recipeOf([
            { op: "polygon", points: [0, 8], holes: [] },
            { op: "extrude", profile: 0, direction: [0, 0, 1], depth: 1 },
            { op: "transform", of: 1, matrix: QUARTER_TURN },
            { op: "transform", of: 2, matrix: moved(5) },
        ]);

        // Act
        const source = recipeSourceOf(recipe, 3, moved(0, 0, 2));

        // Assert
        expect(source.node).toBe(1);
        expect(source.matrix).toEqual([0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 5, 0, 2, 1]);
    });

    it("should stop at a transform that mirrors, scales or stretches, and keep a step that is no transform", () => {
        // Arrange
        const mirror: Base.TransformMatrix = [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        const scale: Base.TransformMatrix = [2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1];
        const shear: Base.TransformMatrix = [1, 0, 0, 0, 0.5, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        const recipe = recipeOf([
            { op: "polygon", points: [0, 8], holes: [] },
            { op: "extrude", profile: 0, direction: [0, 0, 1], depth: 1 },
            { op: "transform", of: 1, matrix: mirror },
            { op: "transform", of: 1, matrix: scale },
            { op: "transform", of: 1, matrix: shear },
            { op: "transform", of: 2, matrix: moved(1) },
        ]);

        // Act
        const kept = [2, 3, 4, 1].map((node) => recipeSourceOf(recipe, node, IDENTITY));
        const movedMirror = recipeSourceOf(recipe, 5, IDENTITY);

        // Assert
        expect(kept).toEqual([2, 3, 4, 1].map((node) => ({ node, matrix: IDENTITY })));
        expect(movedMirror).toEqual({ node: 2, matrix: moved(1) });
    });
});
