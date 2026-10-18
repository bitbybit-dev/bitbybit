import { describe, expect, it } from "vitest";
import type { Base } from "../inputs/base-inputs";
import { Recipes } from "./recipes";
import { InputError } from "../kernel-calls";

const IDENTITY: Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const MOVED: Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 5, 0, 0, 1];

const triangleRecipe = (): Base.Recipe => ({
    format: "bitbybit.recipe",
    version: 1,
    millimetresPerUnit: 1,
    tolerance: 0.01,
    buffers: { f64: new Float64Array([0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1]), i32: new Int32Array([0, 1, 2]) },
    nodes: [
        { op: "triangles", positions: [0, 9], indices: [0, 3] },
        { op: "transform", of: 0, matrix: MOVED },
        { op: "polygon", points: [9, 6], holes: [] },
        { op: "extrude", profile: 2, direction: [0, 0, 1], depth: 1 },
    ],
    roots: [{ node: 1, matrix: IDENTITY, tag: {} }, { node: 3, matrix: IDENTITY, tag: {} }],
});

describe("Recipes", () => {
    const recipes = new Recipes();

    it("should find nothing wrong with a sound recipe and name the path of what is wrong with a broken one", () => {
        // Arrange
        const broken = { ...triangleRecipe(), nodes: [{ op: "transform", of: 3, matrix: IDENTITY }] } as Base.Recipe;

        // Act
        const sound = recipes.check({ recipe: triangleRecipe() });
        const issues = recipes.check({ recipe: broken });

        // Assert
        expect(sound).toEqual([]);
        expect(issues.length).toBeGreaterThan(0);
        expect(issues[0]!.path).toContain("nodes[0]");
    });

    it("should read a recipe whose buffers are lists, as JSON holds them, into typed arrays, and refuse a broken one", () => {
        // Arrange
        const typed = triangleRecipe();
        const listed = JSON.parse(JSON.stringify({ ...typed, buffers: { f64: Array.from(typed.buffers.f64), i32: Array.from(typed.buffers.i32) } })) as Base.Recipe;
        const unknownVersion = JSON.parse(JSON.stringify({ ...typed, version: 7 })) as Base.Recipe;

        // Act
        const read = recipes.read({ recipe: listed });

        // Assert
        expect(read.buffers.f64).toBeInstanceOf(Float64Array);
        expect(read.buffers.i32).toEqual(typed.buffers.i32);
        expect(Array.isArray(listed.buffers.f64)).toBe(true);
        expect(() => recipes.read({ recipe: unknownVersion })).toThrow();
    });

    it("should give the triangles of a root made of triangles, placed by its transform, and nothing for an extrusion", () => {
        // Act
        const [moved, extruded] = recipes.surfaceMeshes({ recipe: triangleRecipe() });

        // Assert
        expect(Array.from(moved!.positions.slice(0, 3))).toEqual([5, 0, 0]);
        expect(Array.from(moved!.indices)).toEqual([0, 1, 2]);
        expect(extruded).toBeUndefined();
    });

    it("should follow a root through the moves to the step it places, and refuse a node the recipe lacks", () => {
        // Act
        const source = recipes.sourceOf({ recipe: triangleRecipe(), node: 1, matrix: IDENTITY });

        // Assert
        expect(source).toEqual({ node: 0, matrix: MOVED });
        expect(() => recipes.sourceOf({ recipe: triangleRecipe(), node: 9, matrix: IDENTITY })).toThrow("`node`");
        expect(() => recipes.sourceOf({ recipe: triangleRecipe(), node: 4, matrix: IDENTITY })).toThrow("`node`");
        expect(() => recipes.sourceOf({ recipe: triangleRecipe(), node: -1, matrix: IDENTITY })).toThrow("`node`");
    });

    it("should stop at a move that does not lead to an earlier node, so a recipe nobody checked cannot loop", () => {
        // Arrange
        const looping: Base.Recipe = { ...triangleRecipe(), nodes: [{ op: "transform", of: 0, matrix: MOVED }, { op: "transform", of: 7, matrix: MOVED }] };

        // Act
        const itself = recipes.sourceOf({ recipe: looping, node: 0, matrix: IDENTITY });
        const outside = recipes.sourceOf({ recipe: looping, node: 1, matrix: IDENTITY });

        // Assert
        expect(itself).toEqual({ node: 0, matrix: IDENTITY });
        expect(outside).toEqual({ node: 1, matrix: IDENTITY });
    });

    it("should refuse a recipe without nodes and a placing matrix that is not 16 finite numbers, naming which", () => {
        // Arrange
        const nothing: unknown = undefined;
        const short: unknown = [1, 0, 0];

        // Act
        const noRecipe = (): unknown => recipes.sourceOf({ recipe: nothing as Base.Recipe, node: 0, matrix: IDENTITY });
        const noMatrix = (): unknown => recipes.sourceOf({ recipe: triangleRecipe(), node: 1, matrix: nothing as Base.TransformMatrix });
        const shortMatrix = (): unknown => recipes.sourceOf({ recipe: triangleRecipe(), node: 1, matrix: short as Base.TransformMatrix });

        // Assert
        expect(noRecipe).toThrow(InputError);
        expect(noRecipe).toThrow("`recipe` is not a recipe with a list of `nodes`.");
        expect(noMatrix).toThrow("`matrix` is not a matrix of 16 finite numbers.");
        expect(shortMatrix).toThrow("`matrix` is not a matrix of 16 finite numbers.");
    });

    it("should stop at a transform whose matrix is not 16 finite numbers, in a recipe nobody checked", () => {
        // Arrange
        const malformed = { ...triangleRecipe(), nodes: [{ op: "triangles", positions: [0, 9], indices: [0, 3] }, { op: "transform", of: 0 }] } as Base.Recipe;

        // Act
        const source = recipes.sourceOf({ recipe: malformed, node: 1, matrix: IDENTITY });

        // Assert
        expect(source).toEqual({ node: 1, matrix: IDENTITY });
    });
});
