import { describe, expect, it } from "vitest";
import type { Base } from "@bitbybit-dev/base";
import { followedBy } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/matrices";
import { Recipes } from "@bitbybit-dev/base";
import { documentPlan, documentStructure } from "./recipe-document";

const RECIPES = new Recipes();

const IDENTITY: Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const MIRROR: Base.TransformMatrix = [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const QUARTER_TURN: Base.TransformMatrix = [0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 5, 6, 7, 1];

function moved(x: number): Base.TransformMatrix {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, 0, 0, 1];
}

function recipeOf(roots: Base.RecipeRoot[], millimetresPerUnit = 1): Base.Recipe {
    return {
        format: "bitbybit.recipe", version: 1, millimetresPerUnit, tolerance: 0.001,
        buffers: { f64: new Float64Array(), i32: new Int32Array() },
        nodes: [{ op: "polygon", points: [0, 6], holes: [] }, { op: "extrude", profile: 0, direction: [0, 0, 1], depth: 1 }, { op: "extrude", profile: 0, direction: [0, 0, 1], depth: 2 }],
        roots,
    };
}

function rootOf(node: number, matrix: Base.TransformMatrix, tag: Record<string, Base.RecipeTagValue> = {}): Base.RecipeRoot {
    return { node, matrix, tag };
}

describe("documentPlan", () => {
    it("should make one part of a step placed by moves and turns, built in place once and placed by each root", () => {
        // Arrange
        const recipe = recipeOf([rootOf(1, IDENTITY), rootOf(1, moved(10)), rootOf(1, QUARTER_TURN), rootOf(2, moved(3))]);

        // Act
        const plan = documentPlan(recipe, RECIPES);

        // Assert
        expect(plan.parts).toEqual([{ root: { node: 1, matrix: IDENTITY, tag: {} }, roots: [0, 1, 2] }, { root: { node: 2, matrix: IDENTITY, tag: {} }, roots: [3] }]);
        expect(plan.instances).toEqual([{ part: 0, matrix: IDENTITY }, { part: 0, matrix: moved(10) }, { part: 0, matrix: QUARTER_TURN }, { part: 1, matrix: moved(3) }]);
        expect(plan.lengthUnit).toBe("mm");
    });

    it("should make the step under moving and turning transforms the part, placed by the transforms and the root together", () => {
        // Arrange
        const recipe = recipeOf([rootOf(2, moved(10)), rootOf(3, IDENTITY), rootOf(4, IDENTITY), rootOf(5, IDENTITY), rootOf(2, MIRROR)]);
        recipe.nodes.splice(2, 1,
            { op: "transform", of: 1, matrix: QUARTER_TURN },
            { op: "transform", of: 1, matrix: moved(4) },
            { op: "transform", of: 2, matrix: moved(1) },
            { op: "transform", of: 1, matrix: MIRROR });

        // Act
        const plan = documentPlan(recipe, RECIPES);

        // Assert
        expect(plan.parts).toEqual([
            { root: { node: 1, matrix: IDENTITY, tag: {} }, roots: [0, 1, 2] },
            { root: { node: 5, matrix: IDENTITY, tag: {} }, roots: [3] },
            { root: { node: 1, matrix: followedBy(QUARTER_TURN, MIRROR), tag: {} }, roots: [4] },
        ]);
        expect(plan.instances).toEqual([
            { part: 0, matrix: followedBy(QUARTER_TURN, moved(10)) },
            { part: 0, matrix: moved(4) },
            { part: 0, matrix: followedBy(QUARTER_TURN, moved(1)) },
            { part: 1, matrix: IDENTITY },
            { part: 2, matrix: IDENTITY },
        ]);
    });

    it("should give a root that mirrors or scales a part of its own, built where it stands", () => {
        // Arrange
        const scaled: Base.TransformMatrix = [2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1];
        const recipe = recipeOf([rootOf(1, MIRROR), rootOf(1, scaled), rootOf(1, IDENTITY)]);

        // Act
        const plan = documentPlan(recipe, RECIPES);

        // Assert
        expect(plan.parts.map((part) => part.root.matrix)).toEqual([MIRROR, scaled, IDENTITY]);
        expect(plan.instances).toEqual([{ part: 0, matrix: IDENTITY }, { part: 1, matrix: IDENTITY }, { part: 2, matrix: IDENTITY }]);
    });

    it("should keep a unit a STEP file can state", () => {
        // Act
        const units = [1, 10, 1000, 25.4].map((millimetres) => documentPlan(recipeOf([rootOf(1, moved(1))], millimetres), RECIPES).lengthUnit);

        // Assert
        expect(units).toEqual(["mm", "cm", "m", "in"]);
    });

    it("should scale a recipe in another unit to millimetres, each root then a part of its own", () => {
        // Arrange
        const recipe = recipeOf([rootOf(1, moved(2)), rootOf(1, moved(3))], 304.8);

        // Act
        const plan = documentPlan(recipe, RECIPES);

        // Assert
        expect(plan.lengthUnit).toBe("mm");
        expect(plan.parts.map((part) => part.root.matrix)).toEqual([
            [304.8, 0, 0, 0, 0, 304.8, 0, 0, 0, 0, 304.8, 0, 609.6, 0, 0, 1],
            [304.8, 0, 0, 0, 0, 304.8, 0, 0, 0, 0, 304.8, 0, 914.4000000000001, 0, 0, 1],
        ]);
        expect(plan.instances.map((instance) => instance.part)).toEqual([0, 1]);
    });

    it("should leave the recipe it plans as it was", () => {
        // Arrange
        const recipe = recipeOf([rootOf(1, moved(2), { name: "A" })], 304.8);
        const before = structuredClone(recipe.roots);

        // Act
        documentPlan(recipe, RECIPES);

        // Assert
        expect(recipe.roots).toEqual(before);
    });
});

describe("documentStructure", () => {
    it("should gather roots sharing the grouping tag into one product carrying the first root's tags", () => {
        // Arrange
        const recipe = recipeOf([
            rootOf(1, moved(5), { globalId: "A", type: "IfcWindow", name: "W1", rgba: [0.1, 0.2, 0.3, 1] }),
            rootOf(2, moved(5), { globalId: "A", type: "IfcWindow", name: "W1", rgba: [0.5, 0.6, 0.7, 0.4] }),
        ]);
        const plan = documentPlan(recipe, RECIPES);

        // Act
        const structure = documentStructure(recipe, plan, ["frame", "glass"], "House", "globalId");

        // Assert
        expect(structure.lengthUnit).toBe("mm");
        expect(structure.clearDocument).toBe(false);
        expect(structure.parts).toEqual([
            { id: "part-0", shape: "frame", name: "W1", colorRgba: { r: 0.1, g: 0.2, b: 0.3, a: 1 } },
            { id: "part-1", shape: "glass", name: "W1", colorRgba: { r: 0.5, g: 0.6, b: 0.7, a: 0.4 } },
        ]);
        expect(structure.nodes).toEqual([
            { id: "recipe", type: "assembly", name: "House" },
            { id: "product-0", type: "assembly", name: "W1", parentId: "recipe", properties: { globalId: "A", type: "IfcWindow", name: "W1" } },
            { id: "root-0", type: "instance", name: "W1 1", parentId: "product-0", partId: "part-0", matrix: moved(5) },
            { id: "root-1", type: "instance", name: "W1 2", parentId: "product-0", partId: "part-1", matrix: moved(5) },
        ]);
    });

    it("should make each root a product of its own when it lacks the grouping tag or it is empty", () => {
        // Arrange
        const recipe = recipeOf([rootOf(1, IDENTITY, { name: "A" }), rootOf(1, moved(1), { name: "B", globalId: "" }), rootOf(1, moved(2), { name: "C", globalId: 7 }), rootOf(1, moved(3), { name: "D", globalId: 7 })]);

        // Act
        const structure = documentStructure(recipe, documentPlan(recipe, RECIPES), ["box"], "Top", "globalId");

        // Assert
        expect(structure.nodes.filter((node) => node.type === "assembly").map((node) => node.name)).toEqual(["Top", "A", "B", "C"]);
        expect(structure.nodes.filter((node) => node.type === "instance").map((node) => [node.name, node.parentId])).toEqual([["A", "product-0"], ["B", "product-1"], ["C 1", "product-2"], ["C 2", "product-2"]]);
    });

    it("should name a product after its name tag, then its type tag, then its root's position", () => {
        // Arrange
        const recipe = recipeOf([rootOf(1, IDENTITY, { name: " ", type: "IfcSlab" }), rootOf(1, IDENTITY, { name: 3, type: "" }), rootOf(1, IDENTITY, { name: "Wall" })]);

        // Act
        const structure = documentStructure(recipe, documentPlan(recipe, RECIPES), ["box"], "Top", "globalId");

        // Assert
        expect(structure.nodes.filter((node) => node.parentId === "recipe").map((node) => node.name)).toEqual(["IfcSlab", "Root 1", "Wall"]);
    });

    it("should name a part its roots share after them when they agree, else after their type and its number", () => {
        // Arrange
        const recipe = recipeOf([
            rootOf(1, IDENTITY, { name: "Door", type: "IfcDoor" }), rootOf(1, moved(1), { name: "Door", type: "IfcDoor" }),
            rootOf(2, IDENTITY, { name: "D1", type: "IfcDoor" }), rootOf(2, moved(1), { name: "D2", type: "IfcDoor" }),
            rootOf(2, moved(2), { name: "D3" }),
        ]);
        const plan = documentPlan(recipe, RECIPES);

        // Act
        const structure = documentStructure(recipe, plan, ["a", "b"], "Top", "globalId");

        // Assert
        expect(structure.parts.map((part) => part.name)).toEqual(["Door", "IfcDoor 2"]);
    });

    it("should name a shared part Part and its number when its roots agree on no name and carry no type", () => {
        // Arrange
        const recipe = recipeOf([rootOf(1, IDENTITY, { name: "A" }), rootOf(1, moved(1), { name: "B" })]);

        // Act
        const structure = documentStructure(recipe, documentPlan(recipe, RECIPES), ["box"], "Top", "globalId");

        // Assert
        expect(structure.parts.map((part) => part.name)).toEqual(["Part 1"]);
    });

    it("should colour each placement instead of the part when the roots placing it differ in colour", () => {
        // Arrange
        const recipe = recipeOf([rootOf(1, IDENTITY, { name: "A", rgba: [1, 0, 0] }), rootOf(1, moved(1), { name: "B", rgba: [0, 1, 0, 0.5] }), rootOf(1, moved(2), { name: "C" })]);

        // Act
        const structure = documentStructure(recipe, documentPlan(recipe, RECIPES), ["box"], "Top", "globalId");

        // Assert
        expect(structure.parts[0]!.colorRgba).toBeUndefined();
        expect(structure.nodes.filter((node) => node.type === "instance").map((node) => node.colorRgba)).toEqual([{ r: 1, g: 0, b: 0, a: 1 }, { r: 0, g: 1, b: 0, a: 0.5 }, undefined]);
    });

    it("should read no colour from an rgba tag of the wrong length or with numbers that are not finite", () => {
        // Arrange
        const recipe = recipeOf([rootOf(1, IDENTITY, { name: "A", rgba: [1, 0] }), rootOf(2, IDENTITY, { name: "B", rgba: [1, Number.NaN, 0] }), rootOf(2, moved(1), { name: "C", rgba: [1, 0, 0, 1, 1] })]);

        // Act
        const structure = documentStructure(recipe, documentPlan(recipe, RECIPES), ["a", "b"], "Top", "globalId");

        // Assert
        expect(structure.parts.map((part) => part.colorRgba)).toEqual([undefined, undefined]);
        expect(structure.nodes.some((node) => node.colorRgba !== undefined)).toBe(false);
    });

    it("should carry only text, finite numbers and flags as properties", () => {
        // Arrange
        const recipe = recipeOf([rootOf(1, IDENTITY, { name: "A", level: 2, external: true, rgba: [1, 0, 0], ratio: Number.POSITIVE_INFINITY })]);

        // Act
        const structure = documentStructure(recipe, documentPlan(recipe, RECIPES), ["box"], "Top", "globalId");

        // Assert
        expect(structure.nodes[1]!.properties).toEqual({ name: "A", level: 2, external: true });
    });

    it("should leave out a part that was not built with every root and product that places only it", () => {
        // Arrange
        const recipe = recipeOf([rootOf(1, IDENTITY, { globalId: "A", name: "A" }), rootOf(2, IDENTITY, { globalId: "A", name: "A" }), rootOf(2, moved(1), { globalId: "B", name: "B" })]);

        // Act
        const structure = documentStructure(recipe, documentPlan(recipe, RECIPES), ["first", null], "Top", "globalId");

        // Assert
        expect(structure.parts.map((part) => part.id)).toEqual(["part-0"]);
        expect(structure.nodes.map((node) => node.id)).toEqual(["recipe", "product-0", "root-0"]);
        expect(structure.nodes[2]!.name).toBe("A");
    });

    it("should nest each product in an assembly of its group, the groups in theirs, carrying each group's tags", () => {
        // Arrange
        const recipe: Base.Recipe = {
            ...recipeOf([
                rootOf(1, IDENTITY, { globalId: "W", name: "South wall" }),
                rootOf(2, moved(1), { globalId: "S", name: "Slab" }),
                rootOf(1, moved(2), { globalId: "T", name: "Tree" }),
            ]),
            groups: [
                { name: "Ground floor", tag: { globalId: "G", type: "IfcBuildingStorey" } },
                { name: "Walls", parent: 0, tag: { type: "IfcWall" } },
            ],
        };
        recipe.roots[0]!.group = 1;
        recipe.roots[1]!.group = 0;

        // Act
        const structure = documentStructure(recipe, documentPlan(recipe, RECIPES), ["box", "slab"], "House", "globalId");

        // Assert
        expect(structure.nodes.filter((node) => node.type === "assembly")).toEqual([
            { id: "recipe", type: "assembly", name: "House" },
            { id: "group-0", type: "assembly", name: "Ground floor", parentId: "recipe", properties: { globalId: "G", type: "IfcBuildingStorey" } },
            { id: "group-1", type: "assembly", name: "Walls", parentId: "group-0", properties: { type: "IfcWall" } },
            { id: "product-0", type: "assembly", name: "South wall", parentId: "group-1", properties: { globalId: "W", name: "South wall" } },
            { id: "product-1", type: "assembly", name: "Slab", parentId: "group-0", properties: { globalId: "S", name: "Slab" } },
            { id: "product-2", type: "assembly", name: "Tree", parentId: "recipe", properties: { globalId: "T", name: "Tree" } },
        ]);
    });

    it("should make the groups a product lies in through others, though they hold no product of their own", () => {
        // Arrange
        const recipe: Base.Recipe = {
            ...recipeOf([rootOf(1, IDENTITY, { globalId: "W", name: "South wall" })]),
            groups: [{ name: "Site", tag: {} }, { name: "Ground floor", parent: 0, tag: {} }, { name: "Walls", parent: 1, tag: {} }],
        };
        recipe.roots[0]!.group = 2;

        // Act
        const structure = documentStructure(recipe, documentPlan(recipe, RECIPES), ["box"], "House", "globalId");

        // Assert
        expect(structure.nodes.filter((node) => node.type === "assembly").map((node) => [node.name, node.parentId])).toEqual([
            ["House", undefined], ["Site", "recipe"], ["Ground floor", "group-0"], ["Walls", "group-1"], ["South wall", "group-2"],
        ]);
    });

    it("should keep a text tag and a number tag of the same digits apart as products", () => {
        // Arrange
        const recipe = recipeOf([rootOf(1, IDENTITY, { name: "Text", globalId: "7" }), rootOf(1, moved(1), { name: "Number", globalId: 7 })]);

        // Act
        const structure = documentStructure(recipe, documentPlan(recipe, RECIPES), ["box"], "Top", "globalId");

        // Assert
        expect(structure.nodes.filter((node) => node.type === "assembly").map((node) => node.name)).toEqual(["Top", "Text", "Number"]);
    });

    it("should colour each placement instead of the part when the roots placing it differ only in their alpha", () => {
        // Arrange
        const recipe = recipeOf([rootOf(1, IDENTITY, { name: "A", rgba: [0.1, 0.2, 0.3, 1] }), rootOf(1, moved(1), { name: "B", rgba: [0.1, 0.2, 0.3, 0.5] })]);

        // Act
        const structure = documentStructure(recipe, documentPlan(recipe, RECIPES), ["box"], "Top", "globalId");

        // Assert
        expect(structure.parts[0]!.colorRgba).toBeUndefined();
        expect(structure.nodes.filter((node) => node.type === "instance").map((node) => node.colorRgba?.a)).toEqual([1, 0.5]);
    });

    it("should leave out a group whose results were not built and one that holds nothing, and name a group without a name by its number", () => {
        // Arrange
        const recipe: Base.Recipe = {
            ...recipeOf([rootOf(1, IDENTITY, { globalId: "A", name: "A" }), rootOf(2, IDENTITY, { globalId: "B", name: "B" })]),
            groups: [{ name: " ", tag: {} }, { name: "Empty", tag: {} }, { name: "Failed", parent: 0, tag: {} }],
        };
        recipe.roots[0]!.group = 0;
        recipe.roots[1]!.group = 2;

        // Act
        const structure = documentStructure(recipe, documentPlan(recipe, RECIPES), ["box", null], "Top", "globalId");

        // Assert
        expect(structure.nodes.map((node) => [node.id, node.name, node.parentId])).toEqual([
            ["recipe", "Top", undefined],
            ["group-0", "Group 1", "recipe"],
            ["product-0", "A", "group-0"],
            ["root-0", "A", "product-0"],
        ]);
    });

    it("should leave an instance at the identity unplaced", () => {
        // Arrange
        const recipe = recipeOf([rootOf(1, IDENTITY, { name: "A" })]);

        // Act
        const structure = documentStructure(recipe, documentPlan(recipe, RECIPES), ["box"], "Top", "globalId");

        // Assert
        expect(structure.nodes[2]).toEqual({ id: "root-0", type: "instance", name: "A", parentId: "product-0", partId: "part-0" });
    });
});
