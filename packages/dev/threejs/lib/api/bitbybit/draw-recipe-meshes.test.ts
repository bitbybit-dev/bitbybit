import { describe, it, expect, beforeEach } from "vitest";
import type { InstancedMesh, MeshPhysicalMaterial } from "three";
import { BoxGeometry, Color, Group, LinearSRGBColorSpace, Matrix4, Mesh, Raycaster, Scene, Vector3, type BufferAttribute, type Intersection } from "three";
import { Tag } from "@bitbybit-dev/core";
import { GeometryHelper, MathBitByBit, Vector } from "@bitbybit-dev/base";
import { srgbToLinear } from "@bitbybit-dev/base/lib/api/services/helpers/color/color-space";
import { JSCADText, JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker/lib";
import { Context } from "../context";
import { DrawHelper } from "../draw-helper";
import * as Inputs from "../inputs";
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

describe("drawing the meshes of a recipe in three.js", () => {
    let scene: Scene;
    let draw: Draw;

    beforeEach(() => {
        const context = new Context();
        scene = new Scene();
        context.scene = scene;
        const jscadWorkerManager = new JSCADWorkerManager();
        const drawHelper = new DrawHelper(context, new JSCADText(jscadWorkerManager), new Vector(new MathBitByBit(), new GeometryHelper()), jscadWorkerManager, new ManifoldWorkerManager(), new OCCTWorkerManager());
        draw = new Draw(drawHelper, context, new Tag(context));
    });

    async function drawn(options?: Inputs.Draw.DrawRecipeMeshesOptions): Promise<Group> {
        const root = await draw.drawAnyAsync({ entity: MESHES, ...(options ? { options } : {}) });
        root.updateMatrixWorld(true);
        return root;
    }

    function pickAt(root: Group, x: number): Intersection | undefined {
        const raycaster = new Raycaster(new Vector3(x, 0.5, -5), new Vector3(0, 0, 1), 0, 20);
        return raycaster.intersectObject(root, true)[0];
    }

    it("should draw a mesh placed twice as instances and the rest as an opaque and a see-through batch, in the scene", async () => {
        // Act
        const root = await drawn();

        // Assert
        expect(root.parent).toBe(scene);
        expect(root.userData["type"]).toBe(Inputs.Draw.drawingTypes.recipeMeshes);
        const [opaque, glass, instances] = root.children as [Mesh, Mesh, InstancedMesh];
        expect(root.children.map((child) => child.userData)).toEqual([{ recipeBatch: 0 }, { recipeBatch: 1 }, { recipeInstances: 0 }]);
        expect((opaque.material as MeshPhysicalMaterial).vertexColors).toBe(true);
        expect((glass.material as MeshPhysicalMaterial).transparent).toBe(true);
        expect((instances.material as MeshPhysicalMaterial).vertexColors).toBe(false);
        expect(opaque.position.toArray()).toEqual([9.5, 0.5, 0.5]);
        expect(Array.from((opaque.geometry.getAttribute("color") as BufferAttribute).array.slice(0, 4))).toEqual([0, 0, 1, 1]);
        expect(Array.from(opaque.geometry.getIndex()!.array.slice(0, 3))).toEqual([0, 2, 1]);
        expect(instances.count).toBe(2);
        expect(instances.position.toArray()).toEqual([2.5, 0, 0]);
        const color = new Color();
        instances.getColorAt(0, color);
        expect(color.toArray()).toEqual([1, 0, 0]);
    });

    it("should name the element a ray picks, in a batch by its face and among instances by the instance, and none for another object", async () => {
        // Arrange
        const root = await drawn();
        const other = new Mesh(new BoxGeometry());

        // Act
        const [inBatch, inInstances] = [pickAt(root, 9.5), pickAt(root, 5.5)];
        const elementOf = (hit: Intersection | undefined): string | undefined => draw.recipeElementOfPick({ drawn: root, mesh: hit!.object, ...(hit!.faceIndex == null ? {} : { triangle: hit!.faceIndex }), ...(hit!.instanceId === undefined ? {} : { instance: hit!.instanceId }) });

        // Assert
        expect(elementOf(inBatch)).toBe("c");
        expect(inInstances!.instanceId).toBe(1);
        expect(elementOf(inInstances)).toBe("b");
        expect(draw.recipeElementOfPick({ drawn: root, mesh: other, triangle: 0 })).toBeUndefined();
        expect(draw.recipeElementOfPick({ drawn: root, mesh: root.children[0]!, triangle: 500 })).toBeUndefined();
        expect(draw.recipeElementOfPick({ drawn: root, mesh: root.children[0]! })).toBeUndefined();
        expect(draw.recipeElementOfPick({ drawn: root, mesh: root.children[2]! })).toBeUndefined();
    });

    it("should hide an element so a ray passes through it, and show it again as it was", async () => {
        // Arrange
        const root = await drawn();
        const [opaque, , instances] = root.children as [Mesh, Mesh, InstancedMesh];
        const planned = Array.from(opaque.geometry.getIndex()!.array);
        const versions = { index: opaque.geometry.getIndex()!.version, matrices: instances.instanceMatrix.version };

        // Act
        draw.setRecipeElementsVisible({ drawn: root, keys: ["c", "a", "unknown"], visible: false });
        const hidden = { batch: pickAt(root, 9.5), instance: pickAt(root, 0.5), indices: Array.from(opaque.geometry.getIndex()!.array), scale: new Matrix4() };
        instances.getMatrixAt(0, hidden.scale);
        draw.setRecipeElementsVisible({ drawn: root, keys: ["c", "a"], visible: true });

        // Assert
        expect(hidden.batch).toBeUndefined();
        expect(hidden.instance).toBeUndefined();
        expect(hidden.indices).toEqual(planned.map(() => 0));
        expect(hidden.scale.elements[0]).toBe(0);
        expect(opaque.geometry.getIndex()!.updateRanges).toEqual([{ start: 0, count: 36 }, { start: 0, count: 36 }]);
        expect(Array.from(opaque.geometry.getIndex()!.array)).toEqual(planned);
        expect([opaque.geometry.getIndex()!.version - versions.index, instances.instanceMatrix.version - versions.matrices]).toEqual([2, 2]);
        expect(draw.recipeElementOfPick({ drawn: root, mesh: pickAt(root, 0.5)!.object, instance: pickAt(root, 0.5)!.instanceId! })).toBe("a");
    });

    it("should color an element's vertices and instances in linear light, and give them their own colors back", async () => {
        // Arrange
        const root = await drawn();
        const [opaque, , instances] = root.children as [Mesh, Mesh, InstancedMesh];
        const colors = opaque.geometry.getAttribute("color") as BufferAttribute;
        const orange = [1, srgbToLinear(170 / 255), 0, 0.5].map((value) => Math.fround(value));
        const grey = new Color().setRGB(srgbToLinear(0.8), srgbToLinear(0.8), srgbToLinear(0.8), LinearSRGBColorSpace);
        const versions = { colors: colors.version, instances: instances.instanceColor!.version };

        // Act
        draw.setRecipeElementsColour({ drawn: root, keys: ["c", "b"], colour: "#ffaa00", opacity: 0.5 });
        const shown = { vertex: Array.from(colors.array.slice(0, 4)), instance: new Color() };
        instances.getColorAt(1, shown.instance);
        draw.setRecipeElementsColour({ drawn: root, keys: ["c", "b"] });
        const restored = new Color();
        instances.getColorAt(1, restored);

        // Assert
        expect(shown.vertex.map((value) => Math.round(value * 1e5))).toEqual(orange.map((value) => Math.round(value * 1e5)));
        expect(shown.instance.toArray().map((value) => Math.round(value * 1e5))).toEqual(orange.slice(0, 3).map((value) => Math.round(value * 1e5)));
        expect(Array.from(colors.array.slice(0, 4))).toEqual([0, 0, 1, 1]);
        expect(restored.toArray().map((value) => Math.round(value * 1e5))).toEqual(grey.toArray().map((value) => Math.round(value * 1e5)));
        expect(colors.updateRanges[0]).toEqual({ start: 0, count: 96 });
        expect([colors.version - versions.colors, instances.instanceColor!.version - versions.instances]).toEqual([2, 2]);
    });

    it("should give a see-through instance group a material of its one opacity, since an instance color has no alpha", async () => {
        // Arrange
        const panes = { meshes: [cube()], placements: [0, 3].map((x) => ({ mesh: 0, matrix: moved(x), tag: { globalId: `pane${x}`, rgba: [0.5, 0.7, 1, 0.4] } })) };

        // Act
        const root = await draw.drawAnyAsync({ entity: panes });

        // Assert
        const [group] = root.children as [InstancedMesh];
        const material = group.material as MeshPhysicalMaterial;
        expect(group.count).toBe(2);
        expect([material.transparent, material.depthWrite]).toEqual([true, false]);
        expect(material.opacity).toBeCloseTo(0.4, 6);
    });

    it("should draw every placement into batches when instancing is off, and refuse a group it did not draw from recipe meshes", async () => {
        // Act
        const root = await drawn(new Inputs.Draw.DrawRecipeMeshesOptions("globalId", false));

        // Assert
        expect(root.children.map((child) => child.userData)).toEqual([{ recipeBatch: 0 }, { recipeBatch: 1 }]);
        expect(() => draw.setRecipeElementsVisible({ drawn: new Group(), keys: ["a"], visible: false })).toThrow("The group was not drawn from recipe meshes by this renderer, so it holds no elements");
        expect(draw.optionsRecipeMeshes({ roughness: 0.3 })).toEqual({ ...new Inputs.Draw.DrawRecipeMeshesOptions(), roughness: 0.3 });
    });
});
