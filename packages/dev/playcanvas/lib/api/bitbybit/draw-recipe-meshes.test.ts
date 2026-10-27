import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as pc from "playcanvas";
import { Tag } from "@bitbybit-dev/core";
import { GeometryHelper, MathBitByBit, Vector } from "@bitbybit-dev/base";
import { srgbToLinear } from "@bitbybit-dev/base/lib/api/services/helpers/color/color-space";
import { JSCADText, JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
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

type BatchEntity = pc.Entity & { recipeBatch?: number };

describe("drawing the meshes of a recipe in PlayCanvas", () => {
    let app: pc.AppBase;
    let draw: Draw;

    beforeEach(() => {
        const canvas = document.createElement("canvas");
        const device = new pc.NullGraphicsDevice(canvas);
        app = new pc.AppBase(canvas);
        const appOptions = new pc.AppOptions();
        appOptions.graphicsDevice = device;
        appOptions.componentSystems = [pc.RenderComponentSystem];
        app.init(appOptions);
        const context = new Context();
        context.app = app;
        context.scene = app.root;
        const jscadWorkerManager = new JSCADWorkerManager();
        const drawHelper = new DrawHelper(context, new JSCADText(jscadWorkerManager), new Vector(new MathBitByBit(), new GeometryHelper()), jscadWorkerManager, new ManifoldWorkerManager(), new OCCTWorkerManager());
        draw = new Draw(drawHelper, context, new Tag(context));
    });

    afterEach(() => {
        app.destroy();
    });

    function batchesOf(root: pc.Entity): BatchEntity[] {
        return root.children as BatchEntity[];
    }

    function meshInstanceOf(entity: pc.Entity): pc.MeshInstance {
        return entity.render!.meshInstances[0]!;
    }

    it("should draw every placement into an opaque and a see-through batch with vertex colors, in the scene", async () => {
        // Act
        const root = await draw.drawAnyAsync({ entity: MESHES });

        // Assert
        const [opaque, glass] = batchesOf(root);
        expect(root.parent).toBe(app.root);
        expect(batchesOf(root).map((batch) => batch.recipeBatch)).toEqual([0, 1]);
        const opaqueMaterial = meshInstanceOf(opaque!).material as pc.StandardMaterial;
        const glassMaterial = meshInstanceOf(glass!).material as pc.StandardMaterial;
        expect([opaqueMaterial.diffuseVertexColor, opaqueMaterial.blendType]).toEqual([true, pc.BLEND_NONE]);
        expect([glassMaterial.opacityVertexColor, glassMaterial.blendType]).toEqual([true, pc.BLEND_NORMAL]);
        expect(Array.from(opaque!.getLocalPosition().toArray())).toEqual([5, 0.5, 0.5]);
        const colors: number[] = [];
        meshInstanceOf(opaque!).mesh!.getColors(colors);
        expect(colors.slice(0, 4).map((value) => Math.round(value * 255))).toEqual([255, 0, 0, 255]);
    });

    it("should name the element of a picked triangle, and none for another mesh instance or a triangle past the batch", async () => {
        // Arrange
        const root = await draw.drawAnyAsync({ entity: MESHES });
        const opaque = meshInstanceOf(batchesOf(root)[0]!);
        const other = meshInstanceOf(batchesOf(root)[1]!);

        // Act
        const elements = [0, 12, 24, 36].map((triangle) => draw.recipeElementOfPick({ drawn: root, mesh: opaque, triangle }));

        // Assert
        expect(elements).toEqual(["a", "b", "c", undefined]);
        expect(draw.recipeElementOfPick({ drawn: root, mesh: other, triangle: 0 })).toBe("d");
        expect(draw.recipeElementOfPick({ drawn: root, mesh: opaque })).toBeUndefined();
    });

    it("should hide an element by collapsing its triangles, and show it again as it was", async () => {
        // Arrange
        const root = await draw.drawAnyAsync({ entity: MESHES });
        const mesh = meshInstanceOf(batchesOf(root)[0]!).mesh!;
        const planned: number[] = [];
        mesh.getIndices(planned);

        // Act
        draw.setRecipeElementsVisible({ drawn: root, keys: ["b", "unknown"], visible: false });
        const hidden: number[] = [];
        mesh.getIndices(hidden);
        draw.setRecipeElementsVisible({ drawn: root, keys: ["b"], visible: true });
        const shown: number[] = [];
        mesh.getIndices(shown);

        // Assert
        expect(hidden.slice(0, 36)).toEqual(planned.slice(0, 36));
        expect(hidden.slice(36, 72)).toEqual(planned.slice(36, 72).map(() => 24));
        expect(hidden.slice(72)).toEqual(planned.slice(72));
        expect(shown).toEqual(planned);
    });

    it("should color an element's vertices in linear light, and give them their own colors back", async () => {
        // Arrange
        const root = await draw.drawAnyAsync({ entity: MESHES });
        const mesh = meshInstanceOf(batchesOf(root)[0]!).mesh!;
        const colorsNow = (): number[] => {
            const colors: number[] = [];
            mesh.getColors(colors);
            return colors;
        };

        // Act
        draw.setRecipeElementsColour({ drawn: root, keys: ["b"], colour: "#ffaa00" });
        const shown = colorsNow();
        draw.setRecipeElementsColour({ drawn: root, keys: ["b"] });
        const restored = colorsNow();

        // Assert
        expect(shown.slice(24 * 4, 24 * 4 + 4).map((value) => Math.round(value * 255))).toEqual([255, Math.round(srgbToLinear(170 / 255) * 255), 0, 255]);
        expect(restored.slice(24 * 4, 24 * 4 + 4).map((value) => Math.round(value * 255))).toEqual([srgbToLinear(0.8), srgbToLinear(0.8), srgbToLinear(0.8), 1].map((value) => Math.round(value * 255)));
        expect(shown.slice(0, 4).map((value) => Math.round(value * 255))).toEqual([255, 0, 0, 255]);
    });

    it("should refuse an entity it did not draw from recipe meshes, and build its options", () => {
        // Act & Assert
        expect(() => draw.setRecipeElementsVisible({ drawn: new pc.Entity(), keys: ["a"], visible: false })).toThrow("The entity was not drawn from recipe meshes by this renderer, so it holds no elements");
        expect(draw.optionsRecipeMeshes({ roughness: 0.3 })).toEqual({ ...new Inputs.Draw.DrawRecipeMeshesOptions(), roughness: 0.3 });
    });
});
