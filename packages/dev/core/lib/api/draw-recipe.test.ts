import type { Base } from "@bitbybit-dev/base";
import { srgbToLinear } from "@bitbybit-dev/base";
import { describe, expect, it } from "vitest";
import type * as Inputs from "./inputs";
import { recipeDrawElementAt, recipeDrawPlanOf, recipeDrawRangeColors, recipeDrawRangeIndices } from "./draw-recipe";

const IDENTITY: Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const QUARTER_TURN: Base.TransformMatrix = [0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const MIRROR: Base.TransformMatrix = [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

function moved(x: number, y = 0, z = 0, matrix: Base.TransformMatrix = IDENTITY): Base.TransformMatrix {
    const placed = [...matrix] as Base.TransformMatrix;
    placed[12] = x;
    placed[13] = y;
    placed[14] = z;
    return placed;
}

function squareMesh(numProp = 6): Inputs.Manifold.DecomposedManifoldMeshDto {
    const corners = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]];
    const vertProperties = new Float32Array(corners.flatMap((corner) => numProp === 6 ? [...corner, 0, 0, 1] : corner));
    return { numProp, vertProperties, triVerts: new Uint32Array([0, 1, 2, 0, 2, 3]) };
}

function placement(mesh: number, matrix: Base.TransformMatrix, tag: Record<string, Base.RecipeTagValue> = {}, group?: number): Inputs.Manifold.RecipeMeshPlacementDto {
    return { mesh, matrix, tag, ...(group === undefined ? {} : { group }) };
}

function rounded(values: ArrayLike<number>): number[] {
    return Array.from(values, (value) => Math.round(value * 1e6) / 1e6 + 0);
}

describe("recipeDrawPlanOf", () => {
    it("should make one element of the roots sharing a global id, and one of each root without one", () => {
        // Arrange
        const meshes = { meshes: [squareMesh()], placements: [
            placement(0, moved(0), { globalId: "wall", rgba: [1, 0, 0, 1] }, 2),
            placement(0, moved(5, 0, 0, MIRROR), { globalId: "wall", rgba: [0, 0, 1, 0.5] }),
            placement(0, moved(9, 9, 9, [2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1])),
            placement(-1, IDENTITY, { globalId: "lost" }),
            placement(0, moved(30), { globalId: "", step: 7 }),
            placement(0, moved(40), { step: 7 }),
            placement(0, moved(50), { step: Number.NaN }),
        ] };

        // Act
        const plan = recipeDrawPlanOf(meshes, { instancing: false });
        const bySteps = recipeDrawPlanOf(meshes, { instancing: false, elementKey: "step" });

        // Assert
        expect(plan.elements.map((element) => element.key)).toEqual(["wall", "root:2", "root:4", "root:5", "root:6"]);
        expect(bySteps.elements.map((element) => element.key)).toEqual(["root:0", "root:1", "root:2", "7", "root:6"]);
        expect(plan.elements[0]!.tag).toEqual({ globalId: "wall", rgba: [1, 0, 0, 1] });
        expect(plan.elements[0]!.group).toBe(2);
        expect(plan.elements[1]!.group).toBeUndefined();
        expect(plan.elements[0]!.parts).toEqual([{ batch: 0, range: 0 }, { batch: 1, range: 0 }]);
        expect(plan.elements[1]!.parts).toEqual([{ batch: 0, range: 1 }]);
        expect(bySteps.elements[3]!.parts).toHaveLength(2);
        expect(plan.batches.map((batch) => batch.transparent)).toEqual([false, true]);
    });

    it("should place a merged batch's positions about its centre, turn its normals, write its colors and keep each run's triangles and vertices", () => {
        // Arrange
        const meshes = { meshes: [squareMesh()], placements: [
            placement(0, moved(10, 0, 0, QUARTER_TURN), { globalId: "a", rgba: [1, 0, 0] }),
            placement(0, moved(20, 0, 0, MIRROR), { globalId: "b" }),
        ] };

        // Act
        const [batch] = recipeDrawPlanOf(meshes, { instancing: false, defaultColor: { r: 0, g: 1, b: 0, a: 1 } }).batches;

        // Assert
        expect(batch!.origin).toEqual([14.5, 0.5, 0]);
        expect(rounded(batch!.positions.subarray(0, 12))).toEqual([-4.5, -0.5, 0, -4.5, 0.5, 0, -5.5, 0.5, 0, -5.5, -0.5, 0]);
        expect(rounded(batch!.positions.subarray(12, 24))).toEqual([5.5, -0.5, 0, 4.5, -0.5, 0, 4.5, 0.5, 0, 5.5, 0.5, 0]);
        expect(rounded(batch!.normals)).toEqual(Array.from({ length: 8 }, () => [0, 0, 1]).flat());
        expect(Array.from(batch!.colors.subarray(0, 8))).toEqual([1, 0, 0, 1, 1, 0, 0, 1]);
        expect(Array.from(batch!.colors.subarray(16, 20))).toEqual([0, 1, 0, 1]);
        expect(Array.from(recipeDrawPlanOf(meshes, { instancing: false, reverseWinding: true }).batches[0]!.indices)).toEqual([0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7]);
        expect(Array.from(batch!.indices)).toEqual([0, 1, 2, 0, 2, 3, 4, 6, 5, 4, 7, 6]);
        expect(batch!.ranges).toEqual([
            { element: 0, firstTriangle: 0, triangles: 2, firstVertex: 0, vertices: 4 },
            { element: 1, firstTriangle: 2, triangles: 2, firstVertex: 4, vertices: 4 },
        ]);
    });

    it("should turn the normals of a stretched placement by the inverse transpose, so they stay square to the surface", () => {
        // Arrange
        const slanted = { numProp: 6, vertProperties: new Float32Array([0, 0, 0, 0.6, 0, 0.8, 0, 1, 0, 0.6, 0, 0.8, 4, 0, -3, 0.6, 0, 0.8]), triVerts: new Uint32Array([0, 1, 2]) };
        const stretch: Base.TransformMatrix = [2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

        // Act
        const [batch] = recipeDrawPlanOf({ meshes: [slanted], placements: [placement(0, stretch)] }).batches;

        // Assert
        const normal = Array.from(batch!.normals.subarray(0, 3));
        const edge = [batch!.positions[6]! - batch!.positions[0]!, 0, batch!.positions[8]! - batch!.positions[2]!];
        expect(normal[0]! * edge[0]! + normal[2]! * edge[2]!).toBeCloseTo(0, 6);
        expect(Math.hypot(normal[0]!, normal[1]!, normal[2]!)).toBeCloseTo(1, 6);
    });

    it("should draw a mesh placed often enough by turns and moves as instances about their centre, and leave the rest in batches", () => {
        // Arrange
        const meshes = { meshes: [squareMesh(), squareMesh()], placements: [
            placement(0, moved(0), { globalId: "a" }),
            placement(0, moved(10, 4, 0, QUARTER_TURN), { globalId: "b", rgba: [0, 0, 1, 1] }),
            placement(0, moved(20, 0, 0, MIRROR), { globalId: "c" }),
            placement(0, moved(0), { globalId: "d", rgba: [1, 1, 1, 0.5] }),
            placement(1, moved(3), { globalId: "e" }),
        ] };

        // Act
        const plan = recipeDrawPlanOf(meshes);
        const fewer = recipeDrawPlanOf(meshes, { minInstances: 3 });

        // Assert
        expect(plan.instances).toHaveLength(1);
        expect(plan.meshes).toHaveLength(1);
        const [group] = plan.instances;
        expect(group!.mesh).toBe(0);
        expect(group!.transparent).toBe(false);
        expect(group!.origin).toEqual([5, 2, 0]);
        expect(Array.from(group!.matrices.subarray(12, 15))).toEqual([-5, -2, 0]);
        expect(Array.from(group!.matrices.subarray(16, 32))).toEqual([0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 5, 2, 0, 1]);
        expect(Array.from(group!.colors.subarray(4, 8))).toEqual([0, 0, 1, 1]);
        expect(Array.from(group!.elements)).toEqual([0, 1]);
        expect(plan.elements[1]!.parts).toEqual([{ instances: 0, instance: 1 }]);
        expect(plan.batches.map((batch) => batch.ranges.map((range) => range.element))).toEqual([[2, 4], [3]]);
        expect(rounded(plan.meshes[0]!.positions)).toEqual([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0]);
        expect(Array.from(plan.meshes[0]!.indices)).toEqual([0, 1, 2, 0, 2, 3]);
        expect(Array.from(recipeDrawPlanOf(meshes, { reverseWinding: true }).meshes[0]!.indices)).toEqual([0, 2, 1, 0, 3, 2]);
        expect(fewer.instances).toHaveLength(0);
    });

    it("should start a new batch past the most vertices one holds, and give a placement larger than that a batch of its own", () => {
        // Arrange
        const meshes = { meshes: [squareMesh()], placements: [0, 1, 2, 3, 4].map((at) => placement(0, moved(at * 2, 0, 0, MIRROR))) };

        // Act
        const plan = recipeDrawPlanOf(meshes, { maxBatchVertices: 8 });
        const tiny = recipeDrawPlanOf(meshes, { maxBatchVertices: 2 });

        // Assert
        expect(plan.batches.map((batch) => batch.ranges.length)).toEqual([2, 2, 1]);
        expect(plan.batches.map((batch) => batch.positions.length / 3)).toEqual([8, 8, 4]);
        expect(tiny.batches).toHaveLength(5);
    });

    it("should crease normals for a mesh that carries none, and read a color of three numbers as opaque and a wrong one as the default, both in linear light", () => {
        // Arrange
        const meshes = { meshes: [squareMesh(3)], placements: [placement(0, IDENTITY, { rgba: [0.2, 0.4, 0.6] }), placement(0, moved(2, 0, 0, MIRROR), { rgba: [1, "x"] as never })] };

        // Act
        const [batch] = recipeDrawPlanOf(meshes, { instancing: false }).batches;

        // Assert
        expect(rounded(batch!.normals.subarray(0, 3))).toEqual([0, 0, 1]);
        expect(rounded(batch!.colors.subarray(0, 4))).toEqual(rounded([srgbToLinear(0.2), srgbToLinear(0.4), srgbToLinear(0.6), 1]));
        expect(rounded(batch!.colors.subarray(batch!.colors.length - 4))).toEqual(rounded([srgbToLinear(0.8), srgbToLinear(0.8), srgbToLinear(0.8), 1]));
    });
});

describe("recipeDrawElementAt and the run helpers", () => {
    const meshes = { meshes: [squareMesh()], placements: [0, 1, 2].map((at) => placement(0, moved(at * 2, 0, 0, MIRROR), { globalId: `e${at}` })) };
    const [batch] = recipeDrawPlanOf(meshes).batches;

    it("should find the element of every triangle of a batch, and none past its end", () => {
        // Act
        const elements = [0, 1, 2, 3, 4, 5, 6, -1].map((triangle) => recipeDrawElementAt(batch!, triangle));

        // Assert
        expect(elements).toEqual([0, 0, 1, 1, 2, 2, undefined, undefined]);
    });

    it("should give a hidden run triangles of no area at its first vertex, a shown one its planned indices, and a run's vertices one color", () => {
        // Arrange
        const range = batch!.ranges[1]!;

        // Act
        const hidden = recipeDrawRangeIndices(batch!, range, false);
        const shown = recipeDrawRangeIndices(batch!, range, true);
        const colors = recipeDrawRangeColors(range, { r: 1, g: 0.5, b: 0, a: 0.5 });

        // Assert
        expect(Array.from(hidden)).toEqual([4, 4, 4, 4, 4, 4]);
        expect(Array.from(shown)).toEqual([4, 6, 5, 4, 7, 6]);
        expect(shown.buffer).not.toBe(batch!.indices.buffer);
        expect(rounded(colors)).toEqual(Array.from({ length: 4 }, () => rounded([1, srgbToLinear(0.5), 0, 0.5])).flat());
    });
});
