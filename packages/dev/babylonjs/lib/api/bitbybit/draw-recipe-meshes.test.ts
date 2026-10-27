import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { Tag } from "@bitbybit-dev/core";
import { GeometryHelper, MathBitByBit, Vector } from "@bitbybit-dev/base";
import { srgbToLinear } from "@bitbybit-dev/base/lib/api/services/helpers/color/color-space";
import { JSCADText, JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import { Context } from "../context";
import { DrawHelper } from "../draw-helper";
import * as Inputs from "../inputs";
import { BabylonNode } from "./babylon/node";
import { Draw } from "./draw";

const QUADS = [[[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]], [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]], [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]], [[0, 1, 0], [0, 1, 1], [1, 1, 1], [1, 1, 0]], [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]], [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]]];
const NORMALS = [[0, 0, -1], [0, 0, 1], [0, -1, 0], [0, 1, 0], [1, 0, 0], [-1, 0, 0]];

function cube(): Inputs.Manifold.DecomposedManifoldMeshDto {
    const vertProperties = new Float32Array(QUADS.flatMap((quad, face) => quad.flatMap((corner) => [...corner, ...NORMALS[face]!])));
    const triVerts = new Uint32Array(QUADS.flatMap((_, face) => [0, 1, 2, 0, 2, 3].map((corner) => face * 4 + corner)));
    return { numProp: 6, vertProperties, triVerts };
}

function moved(x: number, mirror = false): Inputs.Base.TransformMatrix {
    return [mirror ? -1 : 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, 0, 0, 1];
}

const MESHES: Inputs.Manifold.RecipeMeshesDto = {
    meshes: [cube(), cube()],
    placements: [
        { mesh: 0, matrix: moved(0), tag: { globalId: "a", rgba: [1, 0, 0, 1] } },
        { mesh: 0, matrix: moved(5), tag: { globalId: "b" } },
        { mesh: 0, matrix: moved(10, true), tag: { globalId: "c", rgba: [0, 0, 1] } },
        { mesh: 1, matrix: moved(20), tag: { globalId: "d", rgba: [1, 1, 1, 0.5] } },
        { mesh: -1, matrix: moved(0), tag: { globalId: "lost" } },
    ],
};

describe("drawing the meshes of a recipe in BabylonJS", () => {
    let engine: BABYLON.NullEngine;
    let scene: BABYLON.Scene;
    let draw: Draw;

    beforeEach(() => {
        engine = new BABYLON.NullEngine();
        scene = new BABYLON.Scene(engine);
        scene.metadata = { shadowGenerators: [] };
        const context = new Context();
        context.scene = scene;
        const jscadWorkerManager = new JSCADWorkerManager();
        const drawHelper = new DrawHelper(context, new JSCADText(jscadWorkerManager), new Vector(new MathBitByBit(), new GeometryHelper()), jscadWorkerManager, new ManifoldWorkerManager(), new OCCTWorkerManager());
        draw = new Draw(drawHelper, new BabylonNode(context, drawHelper), new Tag(context), context);
    });

    afterEach(() => {
        scene.dispose();
        engine.dispose();
    });

    async function drawn(options?: Inputs.Draw.DrawRecipeMeshesOptions): Promise<BABYLON.Mesh> {
        const root = await draw.drawAnyAsync({ entity: MESHES, ...(options ? { options } : {}) });
        root.getChildMeshes().forEach((mesh) => mesh.computeWorldMatrix(true));
        return root;
    }

    function pickAt(x: number): BABYLON.PickingInfo | null {
        return scene.pickWithRay(new BABYLON.Ray(new BABYLON.Vector3(x, 0.5, -5), new BABYLON.Vector3(0, 0, 1), 20));
    }

    it("should draw a mesh placed twice as thin instances and the rest as an opaque and a see-through batch, every one pickable", async () => {
        // Act
        const root = await drawn();

        // Assert
        const children = root.getChildMeshes<BABYLON.Mesh>();
        expect(root.metadata.type).toBe(Inputs.Draw.drawingTypes.recipeMeshes);
        expect(root.isVisible).toBe(false);
        expect(children.map((mesh) => mesh.metadata)).toEqual([{ recipeBatch: 0 }, { recipeBatch: 1 }, { recipeInstances: 0 }]);
        expect(children.every((mesh) => mesh.isPickable)).toBe(true);
        const [opaque, glass, instances] = children;
        expect(opaque!.hasVertexAlpha).toBe(false);
        expect(glass!.hasVertexAlpha).toBe(true);
        expect((glass!.material as BABYLON.PBRMetallicRoughnessMaterial).transparencyMode).toBe(BABYLON.Material.MATERIAL_ALPHABLEND);
        expect(opaque!.position.asArray()).toEqual([9.5, 0.5, 0.5]);
        expect(Array.from(opaque!.getVerticesData(BABYLON.VertexBuffer.ColorKind)!.slice(0, 4))).toEqual([0, 0, 1, 1]);
        expect(Array.from(opaque!.getIndices()!.slice(0, 3))).toEqual([0, 1, 2]);
        expect(Array.from(instances!.getIndices()!.slice(0, 3))).toEqual([0, 2, 1]);
        expect(instances!.thinInstanceCount).toBe(2);
        expect(instances!.position.asArray()).toEqual([2.5, 0, 0]);
        expect(Array.from(instances!.thinInstanceGetWorldMatrices()[1]!.asArray().slice(12, 15))).toEqual([2.5, 0, 0]);
    });

    it("should name the element a ray picks, in a batch by its triangle and among instances by the instance, and none for another mesh", async () => {
        // Arrange
        const root = await drawn();
        const other = BABYLON.MeshBuilder.CreateBox("other", {}, scene);

        // Act
        const [inBatch, inInstances] = [pickAt(9.5), pickAt(5.5)];
        const elementOf = (pick: BABYLON.PickingInfo | null): string | undefined => draw.recipeElementOfPick({ drawn: root, mesh: pick!.pickedMesh!, triangle: pick!.faceId, instance: pick!.thinInstanceIndex });

        // Assert
        expect(elementOf(inBatch)).toBe("c");
        expect(inInstances!.thinInstanceIndex).toBe(1);
        expect(elementOf(inInstances)).toBe("b");
        expect(draw.recipeElementOfPick({ drawn: root, mesh: other, triangle: 0 })).toBeUndefined();
        expect(draw.recipeElementOfPick({ drawn: root, mesh: root.getChildMeshes()[0]!, triangle: 500 })).toBeUndefined();
        expect(draw.recipeElementOfPick({ drawn: root, mesh: root.getChildMeshes()[0]! })).toBeUndefined();
        expect(draw.recipeElementOfPick({ drawn: root, mesh: root.getChildMeshes()[2]! })).toBeUndefined();
    });

    it("should hide an element so a pick passes through it, and show it again as it was", async () => {
        // Arrange
        const root = await drawn();
        const [opaque, , instances] = root.getChildMeshes<BABYLON.Mesh>();
        const planned = Array.from(opaque!.getIndices()!);
        const refreshed = vi.spyOn(instances!, "thinInstanceBufferUpdated");

        // Act
        draw.setRecipeElementsVisible({ drawn: root, keys: ["c", "a", "unknown"], visible: false });
        const hidden = { batch: pickAt(9.5)?.pickedMesh ?? null, instance: pickAt(0.5)?.pickedMesh ?? null, indices: Array.from(opaque!.getIndices()!), scale: instances!.thinInstanceGetWorldMatrices()[0]!.asArray()[0] };
        draw.setRecipeElementsVisible({ drawn: root, keys: ["c", "a"], visible: true });

        // Assert
        expect(hidden.batch).toBeNull();
        expect(hidden.instance).toBeNull();
        expect(hidden.indices).toEqual(planned.map(() => 0));
        expect(hidden.scale).toBe(0);
        expect(Array.from(opaque!.getIndices()!)).toEqual(planned);
        expect(instances!.thinInstanceGetWorldMatrices()[0]!.asArray()[0]).toBe(1);
        expect(refreshed.mock.calls).toEqual([["matrix"], ["matrix"]]);
        expect(draw.recipeElementOfPick({ drawn: root, mesh: pickAt(0.5)!.pickedMesh!, instance: pickAt(0.5)!.thinInstanceIndex })).toBe("a");
    });

    it("should color an element's vertices and instances in linear light, and give them their own colors back", async () => {
        // Arrange
        const root = await drawn();
        const [opaque, , instances] = root.getChildMeshes<BABYLON.Mesh>();
        const buffer = opaque!.getVertexBuffer(BABYLON.VertexBuffer.ColorKind)!;
        const written = vi.spyOn(buffer, "updateDirectly");
        const attribute = vi.spyOn(instances!, "thinInstanceSetAttributeAt");
        const refreshed = vi.spyOn(instances!, "thinInstanceBufferUpdated");
        const orange = [1, srgbToLinear(170 / 255), 0, 0.5];

        // Act
        draw.setRecipeElementsColour({ drawn: root, keys: ["c", "b"], colour: "#ffaa00", opacity: 0.5 });
        draw.setRecipeElementsColour({ drawn: root, keys: ["c", "b"] });

        // Assert
        const [shown, restored] = written.mock.calls;
        expect(shown![1]).toBe(0);
        expect(Array.from((shown![0] as Float32Array).slice(0, 4)).map((value) => Math.round(value * 1e6) / 1e6)).toEqual(orange.map((value) => Math.round(value * 1e6) / 1e6));
        expect((shown![0] as Float32Array).length).toBe(24 * 4);
        expect(Array.from((restored![0] as Float32Array).slice(0, 4))).toEqual([0, 0, 1, 1]);
        expect(attribute.mock.calls[0]!.slice(0, 2)).toEqual(["color", 1]);
        expect(attribute.mock.calls[0]![2].map((value) => Math.round(value * 1e6))).toEqual(orange.map((value) => Math.round(value * 1e6)));
        expect(attribute.mock.calls[1]![2]).toEqual([srgbToLinear(0.8), srgbToLinear(0.8), srgbToLinear(0.8), 1].map((value) => Math.fround(value)));
        expect(attribute.mock.calls.every((call) => call[3] === false)).toBe(true);
        expect(refreshed.mock.calls).toEqual([["color"], ["color"]]);
    });

    it("should draw every placement into batches when instancing is off, keep those options on a redraw from the mesh, color a run past the first at its own vertices, and refuse a mesh it did not draw from recipe meshes", async () => {
        // Arrange
        const root = await drawn(new Inputs.Draw.DrawRecipeMeshesOptions("globalId", false));
        const plain = BABYLON.MeshBuilder.CreateBox("plain", {}, scene);
        const written = vi.spyOn(root.getChildMeshes<BABYLON.Mesh>()[0]!.getVertexBuffer(BABYLON.VertexBuffer.ColorKind)!, "updateDirectly");

        // Act
        draw.setRecipeElementsColour({ drawn: root, keys: ["b"], colour: "#000000" });

        const redrawn = await draw.drawAnyAsync({ entity: MESHES, babylonMesh: root });

        // Assert
        expect(redrawn.getChildMeshes().map((mesh) => mesh.metadata)).toEqual([{ recipeBatch: 0 }, { recipeBatch: 1 }]);
        expect(written.mock.calls[0]![1]).toBe(24 * 4);
        expect(root.getChildMeshes().map((mesh) => mesh.metadata)).toEqual([{ recipeBatch: 0 }, { recipeBatch: 1 }]);
        expect(() => draw.setRecipeElementsVisible({ drawn: plain, keys: ["a"], visible: false })).toThrow("The mesh was not drawn from recipe meshes by this renderer, so it holds no elements");
        expect(draw.optionsRecipeMeshes({ roughness: 0.3 })).toEqual({ ...new Inputs.Draw.DrawRecipeMeshesOptions(), roughness: 0.3 });
    });
});
