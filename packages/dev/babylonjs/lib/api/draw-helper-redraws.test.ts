import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { GeometryHelper, MathBitByBit, Vector } from "@bitbybit-dev/base";
import { Tag } from "@bitbybit-dev/core";
import { createMockJSCADText, createMockWorkerManagers, type MockWorkerManagers } from "./__mocks__/test-helpers";
import { Context } from "./context";
import { DrawHelper } from "./draw-helper";
import { BabylonNode } from "./bitbybit/babylon/node";
import { Draw } from "./bitbybit/draw";
import * as Inputs from "./inputs";

const REDRAWS = 50;
const CLONES = 20;
const NODE_AXES_MESHES = 4;
const PIXEL = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";
const WORLD_FRAME: Inputs.Base.Frame = { origin: [0, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0] };
const RAISED_FRAME: Inputs.Base.Frame = { origin: [0, 0, 5], normal: [0, 0, 1], direction: [1, 0, 0] };
const UNSQUARABLE_FRAME: Inputs.Base.Frame = { origin: [0, 0, 0], normal: [0, 0, 0], direction: [1, 0, 0] };

describe("Babylon drawing redrawn again and again", () => {
    let engine: BABYLON.NullEngine;
    let scene: BABYLON.Scene;
    let context: Context;
    let workers: MockWorkerManagers;
    let drawHelper: DrawHelper;

    beforeEach(() => {
        engine = new BABYLON.NullEngine();
        scene = new BABYLON.Scene(engine);
        scene.metadata = { shadowGenerators: [] };
        context = new Context();
        context.scene = scene;
        workers = createMockWorkerManagers();
        drawHelper = new DrawHelper(context, createMockJSCADText(vi.fn().mockResolvedValue([[[0, 0], [1, 0]]])), new Vector(new MathBitByBit(), new GeometryHelper()), workers.mockJscadWorkerManager, workers.mockManifoldWorkerManager, workers.mockOccWorkerManager);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        scene.dispose();
        engine.dispose();
    });

    const sceneCounts = (): number[] => [scene.meshes.length, scene.materials.length, scene.geometries.length, scene.textures.length];
    const polylineOf = (pointCount: number): number[][] => Array.from({ length: pointCount }, (_, at) => [at, at % 2, 0]);
    const pointsOf = (count: number): Inputs.Base.Point3[] => Array.from({ length: count }, (_, at) => [at, at % 2, 0]);
    const idsOf = (items: { uniqueId: number }[]): number[] => items.map(item => item.uniqueId);
    const pointColoursOf = (points: BABYLON.Mesh): string[] => points.getChildMeshes().map(sphere => (sphere.material as BABYLON.StandardMaterial).emissiveColor.toHexString().toLowerCase());
    const pointRadiiOf = (points: BABYLON.Mesh): number[] => points.getChildMeshes<BABYLON.Mesh>().map(sphere => Math.max(...Array.from(sphere.getVerticesData(BABYLON.VertexBuffer.PositionKind)!)));

    const texturedMaterial = (name: string): { material: BABYLON.PBRMaterial; texture: BABYLON.Texture } => {
        const material = new BABYLON.PBRMaterial(name, scene);
        const texture = new BABYLON.Texture(PIXEL, scene);
        material.albedoTexture = texture;
        return { material, texture };
    };

    it("should hold as many meshes, materials, geometries and textures after redrawing polylines whose point count changes as after drawing them once", () => {
        // Arrange
        let drawn = drawHelper.drawPolylines(undefined, [polylineOf(3)], true, 2, 1, "#ff0000");
        const once = sceneCounts();

        // Act
        for (let redraw = 0; redraw < REDRAWS; redraw++) {
            drawn = drawHelper.drawPolylines(drawn, [polylineOf(4 + redraw % 3)], true, 2, 1, "#ff0000");
        }

        // Assert
        expect(sceneCounts()).toEqual(once);
    });

    it("should hold as many meshes, materials, geometries and textures after redrawing points whose count changes as after drawing them once", () => {
        // Arrange
        let drawn = drawHelper.drawPoints({ points: pointsOf(3), updatable: true, colours: "#ff0000" });
        const once = sceneCounts();

        // Act
        for (let redraw = 0; redraw < REDRAWS; redraw++) {
            drawn = drawHelper.drawPoints({ points: pointsOf(4 + redraw % 3), pointsMesh: drawn, updatable: true, colours: "#ff0000" });
        }

        // Assert
        expect(sceneCounts()).toEqual(once);
    });

    it("should draw the new colour after an updatable redraw of as many points in another colour", () => {
        // Arrange
        const drawn = drawHelper.drawPoints({ points: pointsOf(3), updatable: true, colours: "#ff0000" });

        // Act
        const redrawn = drawHelper.drawPoints({ points: pointsOf(3), pointsMesh: drawn, updatable: true, colours: "#0000ff" });

        // Assert
        expect(pointColoursOf(redrawn)).toEqual(["#0000ff"]);
    });

    it("should draw the new colours after an updatable redraw of as many points coloured one by one", () => {
        // Arrange
        const drawn = drawHelper.drawPoints({ points: pointsOf(3), updatable: true, colours: ["#ff0000", "#00ff00", "#0000ff"] });

        // Act
        const redrawn = drawHelper.drawPoints({ points: pointsOf(3), pointsMesh: drawn, updatable: true, colours: ["#ffffff", "#ffffff", "#000000"] });

        // Assert
        expect(pointColoursOf(redrawn)).toEqual(["#ffffff", "#000000"]);
        expect(redrawn.getChildMeshes<BABYLON.Mesh>().map(sphere => sphere.thinInstanceCount)).toEqual([2, 1]);
    });

    it("should draw the new opacity after an updatable redraw of as many points", () => {
        // Arrange
        const drawn = drawHelper.drawPoints({ points: pointsOf(3), updatable: true, colours: "#ff0000", opacity: 1 });

        // Act
        const redrawn = drawHelper.drawPoints({ points: pointsOf(3), pointsMesh: drawn, updatable: true, colours: "#ff0000", opacity: 0.5 });

        // Assert
        expect(redrawn.getChildMeshes().map(sphere => sphere.material!.alpha)).toEqual([0.5]);
    });

    it("should draw the new size after an updatable redraw of as many points", () => {
        // Arrange
        const drawn = drawHelper.drawPoints({ points: pointsOf(3), updatable: true, colours: "#ff0000", size: 0.1 });

        // Act
        const redrawn = drawHelper.drawPoints({ points: pointsOf(3), pointsMesh: drawn, updatable: true, colours: "#ff0000", size: 2 });

        // Assert
        expect(pointRadiiOf(redrawn)).toEqual([1]);
    });

    it("should move the points in place when an updatable redraw keeps their count and their look", () => {
        // Arrange
        const drawn = drawHelper.drawPoints({ points: pointsOf(3), updatable: true, colours: "#ff0000" });

        // Act
        const redrawn = drawHelper.drawPoints({ points: [[0, 5, 0], [1, 6, 0], [2, 7, 0]], pointsMesh: drawn, updatable: true, colours: "#ff0000" });

        // Assert
        expect(redrawn).toBe(drawn);
        expect(Array.from(redrawn.getChildMeshes<BABYLON.Mesh>()[0]!.thinInstanceGetWorldMatrices().map(matrix => matrix.getTranslation().y))).toEqual([5, 6, 7]);
    });

    it("should hold as many meshes, materials, geometries and textures after redrawing as many points in colours that change as after drawing them in both colours", () => {
        // Arrange
        let drawn = drawHelper.drawPoints({ points: pointsOf(3), updatable: true, colours: "#ff0000" });
        drawn = drawHelper.drawPoints({ points: pointsOf(3), pointsMesh: drawn, updatable: true, colours: "#0000ff" });
        const once = sceneCounts();

        // Act
        for (let redraw = 0; redraw < REDRAWS; redraw++) {
            drawn = drawHelper.drawPoints({ points: pointsOf(3), pointsMesh: drawn, updatable: true, colours: redraw % 2 === 0 ? "#ff0000" : "#0000ff" });
        }

        // Assert
        expect(sceneCounts()).toEqual(once);
    });

    it("should draw the new colour after an updatable redraw of a point in another colour", () => {
        // Arrange
        const drawn = drawHelper.drawPoint({ point: [1, 2, 3], updatable: true, colours: "#ff0000" });

        // Act
        const redrawn = drawHelper.drawPoint({ point: [1, 2, 3], pointMesh: drawn, updatable: true, colours: "#0000ff" });

        // Assert
        expect(pointColoursOf(redrawn)).toEqual(["#0000ff"]);
    });

    it("should hold as many meshes, materials, geometries and textures after redrawing a point in colours that change as after drawing it in both colours", () => {
        // Arrange
        let drawn = drawHelper.drawPoint({ point: [1, 2, 3], updatable: true, colours: "#ff0000" });
        drawn = drawHelper.drawPoint({ point: [1, 2, 3], pointMesh: drawn, updatable: true, colours: "#0000ff" });
        const once = sceneCounts();

        // Act
        for (let redraw = 0; redraw < REDRAWS; redraw++) {
            drawn = drawHelper.drawPoint({ point: [1, 2, 3], pointMesh: drawn, updatable: true, colours: redraw % 2 === 0 ? "#ff0000" : "#0000ff" });
        }

        // Assert
        expect(sceneCounts()).toEqual(once);
    });

    it("should hold as many meshes, materials, geometries and textures after restyling polylines of the same shape as after drawing them once", () => {
        // Arrange
        let drawn = drawHelper.drawPolylines(undefined, [polylineOf(3)], true, 2, 1, "#ff0000");
        const once = sceneCounts();

        // Act
        for (let redraw = 0; redraw < REDRAWS; redraw++) {
            drawn = drawHelper.drawPolylines(drawn, [polylineOf(3).map(([x, y, z]) => [x!, y! + redraw, z!])], true, 2, 1, redraw % 2 === 0 ? "#00ff00" : "#0000ff");
        }

        // Assert
        expect(sceneCounts()).toEqual(once);
    });

    it("should keep a material the caller gave the line, and its texture, when a redraw replaces the line", () => {
        // Arrange
        const drawn = drawHelper.drawPolylines(undefined, [polylineOf(3)], true, 2, 1, "#ff0000")!;
        const shared = texturedMaterial("shared");
        const box = BABYLON.MeshBuilder.CreateBox("box", {}, scene);
        box.material = shared.material;
        drawn.material = shared.material;

        // Act
        drawHelper.drawPolylines(drawn, [polylineOf(4)], true, 2, 1, "#ff0000");

        // Assert
        expect(box.material?.uniqueId).toBe(shared.material.uniqueId);
        expect(idsOf(scene.materials)).toContain(shared.material.uniqueId);
        expect(idsOf(scene.textures)).toContain(shared.texture.uniqueId);
    });

    it("should keep the materials of meshes the caller parented under the line when a redraw replaces the line", () => {
        // Arrange
        const drawn = drawHelper.drawPolylines(undefined, [polylineOf(3)], true, 2, 1, "#ff0000")!;
        const childLook = texturedMaterial("child");
        const child = BABYLON.MeshBuilder.CreateBox("child", {}, scene);
        child.material = childLook.material;
        child.parent = drawn;

        // Act
        drawHelper.drawPolylines(drawn, [polylineOf(4)], true, 2, 1, "#ff0000");

        // Assert
        expect(idsOf(scene.materials)).toContain(childLook.material.uniqueId);
        expect(idsOf(scene.textures)).toContain(childLook.texture.uniqueId);
    });

    it("should dispose the material it made for a line when a redraw replaces the line", () => {
        // Arrange
        const drawn = drawHelper.drawPolylines(undefined, [polylineOf(3)], true, 2, 1, "#ff0000")!;
        const madeForTheLine = drawn.material!;

        // Act
        drawHelper.drawPolylines(drawn, [polylineOf(4)], true, 2, 1, "#ff0000");

        // Assert
        expect(idsOf(scene.materials)).not.toContain(madeForTheLine.uniqueId);
    });

    it("should dispose the material it made for a line the caller has since given another material when a redraw replaces the line", () => {
        // Arrange
        const drawn = drawHelper.drawPolylines(undefined, [polylineOf(3)], true, 2, 1, "#ff0000")!;
        const madeForTheLine = drawn.material!;
        drawn.material = texturedMaterial("shared").material;

        // Act
        drawHelper.drawPolylines(drawn, [polylineOf(3)], true, 2, 1, "#ff0000");

        // Assert
        expect(idsOf(scene.materials)).not.toContain(madeForTheLine.uniqueId);
    });

    it("should hold as many meshes, materials, geometries and textures after a line in several colours is drawn and disposed as before it was drawn", () => {
        // Arrange
        drawHelper.drawPolylines(undefined, [polylineOf(3), polylineOf(4)], false, 2, 1, ["#ff0000", "#00ff00"]);
        const before = sceneCounts();
        const drawn = drawHelper.drawPolylines(undefined, [polylineOf(3), polylineOf(4)], false, 2, 1, ["#ff0000", "#00ff00"])!;

        // Act
        drawn.dispose();

        // Assert
        expect(sceneCounts()).toEqual(before);
    });

    it("should keep a material the caller gave the line, and its texture, when the caller disposes the line", () => {
        // Arrange
        const drawn = drawHelper.drawPolylines(undefined, [polylineOf(3)], false, 2, 1, "#ff0000")!;
        const shared = texturedMaterial("shared");
        drawn.material = shared.material;

        // Act
        drawn.dispose();

        // Assert
        expect(idsOf(scene.materials)).toContain(shared.material.uniqueId);
        expect(idsOf(scene.textures)).toContain(shared.texture.uniqueId);
    });

    it("should keep the material it made for a line, and its colours texture, while a clone of the line still wears them", () => {
        // Arrange
        const drawn = drawHelper.drawPolylines(undefined, [polylineOf(3), polylineOf(4)], false, 2, 1, ["#ff0000", "#00ff00"])!;
        const madeForTheLine = drawn.material!;
        const clone = drawn.clone();
        const texturesWorn = idsOf(scene.textures);

        // Act
        drawn.dispose();

        // Assert
        expect(clone.material).toBe(madeForTheLine);
        expect(idsOf(scene.materials)).toContain(madeForTheLine.uniqueId);
        expect(idsOf(scene.textures)).toEqual(texturesWorn);
    });

    it("should hold as many meshes, materials, geometries and textures once a line and its clone are both disposed as before the line was drawn", () => {
        // Arrange
        drawHelper.drawPolylines(undefined, [polylineOf(3), polylineOf(4)], false, 2, 1, ["#ff0000", "#00ff00"]);
        const before = sceneCounts();
        const drawn = drawHelper.drawPolylines(undefined, [polylineOf(3), polylineOf(4)], false, 2, 1, ["#ff0000", "#00ff00"])!;
        const clone = drawn.clone();

        // Act
        drawn.dispose();
        clone.dispose();

        // Assert
        expect(sceneCounts()).toEqual(before);
    });

    it("should watch the last of twenty clones of a line once when the line and the other clones are disposed in the order they were made", () => {
        // Arrange
        const drawn = drawHelper.drawPolylines(undefined, [polylineOf(3), polylineOf(4)], false, 2, 1, ["#ff0000", "#00ff00"])!;
        const clones = Array.from({ length: CLONES }, () => drawn.clone());
        const last = clones[CLONES - 1]!;

        // Act
        drawn.dispose();
        clones.slice(0, CLONES - 1).forEach(clone => clone.dispose());

        // Assert
        expect(last.onDisposeObservable.observers).toHaveLength(1);
    });

    it("should keep the material it made for a line until the last of twenty clones is disposed and free it then", () => {
        // Arrange
        const drawn = drawHelper.drawPolylines(undefined, [polylineOf(3), polylineOf(4)], false, 2, 1, ["#ff0000", "#00ff00"])!;
        const madeForTheLine = drawn.material!;
        const clones = Array.from({ length: CLONES }, () => drawn.clone());
        drawn.dispose();
        clones.slice(0, CLONES - 1).forEach(clone => clone.dispose());
        const whileTheLastIsWorn = idsOf(scene.materials).includes(madeForTheLine.uniqueId);

        // Act
        clones[CLONES - 1]!.dispose();

        // Assert
        expect(whileTheLastIsWorn).toBe(true);
        expect(idsOf(scene.materials)).not.toContain(madeForTheLine.uniqueId);
    });

    it("should hold as many meshes, materials, geometries and textures once a line and twenty clones are disposed as before the line was drawn", () => {
        // Arrange
        drawHelper.drawPolylines(undefined, [polylineOf(3), polylineOf(4)], false, 2, 1, ["#ff0000", "#00ff00"]);
        const before = sceneCounts();
        const drawn = drawHelper.drawPolylines(undefined, [polylineOf(3), polylineOf(4)], false, 2, 1, ["#ff0000", "#00ff00"])!;
        const clones = Array.from({ length: CLONES }, () => drawn.clone());

        // Act
        drawn.dispose();
        clones.forEach(clone => clone.dispose());

        // Assert
        expect(sceneCounts()).toEqual(before);
    });

    it("should hold as many meshes, materials, geometries and textures once a grid is drawn and disposed as before it was drawn", () => {
        // Arrange
        const draw = new Draw(drawHelper, new BabylonNode(context, drawHelper), new Tag(context), context);
        const before = sceneCounts();
        const grid = draw.drawGridMesh(new Inputs.Draw.SceneDrawGridMeshDto());

        // Act
        grid.dispose();

        // Assert
        expect(sceneCounts()).toEqual(before);
    });

    it("should keep the grid's material while a clone of the grid still wears it", () => {
        // Arrange
        const draw = new Draw(drawHelper, new BabylonNode(context, drawHelper), new Tag(context), context);
        const grid = draw.drawGridMesh(new Inputs.Draw.SceneDrawGridMeshDto());
        const clone = grid.clone();

        // Act
        grid.dispose();

        // Assert
        expect(scene.materials).toContain(clone.material);
    });

    it("should hold as many meshes, materials, geometries and textures after redrawing a node as after drawing it once", () => {
        // Arrange
        const draw = new Draw(drawHelper, new BabylonNode(context, drawHelper), new Tag(context), context);
        const node = new BABYLON.TransformNode("node", scene);
        draw.drawAny({ entity: node });
        const once = sceneCounts();

        // Act
        for (let redraw = 0; redraw < REDRAWS; redraw++) {
            draw.drawAny({ entity: node });
        }

        // Assert
        expect(sceneCounts()).toEqual(once);
        expect(node.getChildMeshes()).toHaveLength(NODE_AXES_MESHES);
    });

    it("should hold as many meshes, materials, geometries and textures after redrawing a list of nodes as after drawing it once", () => {
        // Arrange
        const draw = new Draw(drawHelper, new BabylonNode(context, drawHelper), new Tag(context), context);
        const nodes = [new BABYLON.TransformNode("first", scene), new BABYLON.TransformNode("second", scene)];
        draw.drawAny({ entity: nodes });
        const once = sceneCounts();

        // Act
        for (let redraw = 0; redraw < REDRAWS; redraw++) {
            draw.drawAny({ entity: nodes });
        }

        // Assert
        expect(sceneCounts()).toEqual(once);
        expect(nodes.map(node => node.getChildMeshes().length)).toEqual([NODE_AXES_MESHES, NODE_AXES_MESHES]);
    });

    it("should hold as many meshes, materials, geometries and textures after an updatable frame drawing is redrawn with frames that cannot be squared as before it was drawn", () => {
        // Arrange
        const draw = new Draw(drawHelper, new BabylonNode(context, drawHelper), new Tag(context), context);
        const updatableFrames = draw.optionsFrame({ updatable: true });
        draw.drawAny({ entity: WORLD_FRAME, options: updatableFrames });
        const before = sceneCounts();
        const drawn = draw.drawAny({ entity: [WORLD_FRAME, RAISED_FRAME], options: updatableFrames });

        // Act
        const redrawn = draw.drawAny({ entity: [UNSQUARABLE_FRAME], babylonMesh: drawn });

        // Assert
        expect(redrawn).toBeUndefined();
        expect(sceneCounts()).toEqual(before);
    });
});
