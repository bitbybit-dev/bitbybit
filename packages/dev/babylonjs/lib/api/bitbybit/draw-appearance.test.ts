import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { Tag } from "@bitbybit-dev/core";
import type * as Models from "@bitbybit-dev/core/lib/api/models";
import { GeometryHelper, MathBitByBit, Vector, resolveDto } from "@bitbybit-dev/base";
import { JSCADText, JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import { DEFAULT_COLORS } from "../constants";
import { Context } from "../context";
import { DrawHelper } from "../draw-helper";
import * as Inputs from "../inputs";
import * as Resolved from "../resolved-inputs";
import { BabylonNode } from "./babylon/node";
import { Draw } from "./draw";

type Build = Models.OCCT.DesignBuildResult<Inputs.OCCT.TopoDSShapePointer>;

const CORNERS: Inputs.Base.Point3[] = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]];
const QUADS = [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [2, 3, 7, 6], [1, 2, 6, 5], [0, 4, 7, 3]];
const NORMALS = [[0, 0, -1], [0, 0, 1], [0, -1, 0], [0, 1, 0], [1, 0, 0], [-1, 0, 0]];
const EDGES = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];

const boxMesh = (): Inputs.OCCT.DecomposedMeshDto => {
    const faces = QUADS.map((quad, faceIndex) => {
        const face = new Inputs.OCCT.DecomposedFaceDto();
        face.faceIndex = faceIndex;
        face.vertexCoord = quad.flatMap(corner => CORNERS[corner]!);
        face.normalCoord = quad.flatMap(() => NORMALS[faceIndex]!);
        face.triIndexes = [0, 1, 2, 0, 2, 3];
        face.numberOfTriangles = 2;
        return face;
    });
    const edges = EDGES.map(([from, to], edgeIndex) => {
        const edge = new Inputs.OCCT.DecomposedEdgeDto();
        edge.edgeIndex = edgeIndex;
        edge.vertexCoord = [CORNERS[from!]!, CORNERS[to!]!];
        edge.middlePoint = [0, 0, 0];
        return edge;
    });
    const mesh = new Inputs.OCCT.DecomposedMeshDto(faces, edges);
    mesh.pointsList = [];
    return mesh;
};

const shapeA: Inputs.OCCT.TopoDSShapePointer = { hash: 101, type: "occ-shape" };
const shapeB: Inputs.OCCT.TopoDSShapePointer = { hash: 102, type: "occ-shape" };
const shapeC: Inputs.OCCT.TopoDSShapePointer = { hash: 103, type: "occ-shape" };

const at = (x: number): Inputs.Base.TransformMatrix => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, 0, 0, 1];

const boxAppearance: Models.OCCT.DesignBuiltAppearance = { color: "#ffffff", metallic: 0, roughness: 0.4, faces: [{ indexes: [0, 1], color: "#000000", metallic: 1 }] };

const partOf = (id: string, shape: Inputs.OCCT.TopoDSShapePointer, appearance?: Models.OCCT.DesignBuiltAppearance, shapeHash = `${id}-shape`): Models.OCCT.DesignBuiltPart<Inputs.OCCT.TopoDSShapePointer> => ({
    id,
    itemKey: `${id}-item`,
    buildKey: `${id}-build`,
    name: id,
    body: id,
    shape,
    shapeHash,
    faceNames: [],
    properties: {},
    connectors: [],
    parameters: {},
    ...(appearance ? { appearance } : {}),
});

const componentOf = (path: string, part: string, x: number): Models.OCCT.DesignBuiltComponent => ({ path, name: path, part, matrix: at(x), world: at(x), properties: {} });

const buildOf = (boxes: number[], pins: number[], extra?: { id: string; shape: Inputs.OCCT.TopoDSShapePointer }): Build => ({
    parts: [
        partOf("box-1", shapeA, boxAppearance),
        partOf("pin-2", shapeB),
        ...(extra ? [partOf(extra.id, extra.shape)] : []),
    ],
    report: [],
    issues: [],
    parameters: {},
    units: { length: "mm", angle: "deg" },
    up: "y",
    components: [
        ...boxes.map((x, index) => componentOf(`box${index}`, "box-1", x)),
        ...pins.map((x, index) => componentOf(`pin${index}`, "pin-2", x)),
        ...(extra ? [componentOf("extra", extra.id, 50)] : []),
    ],
});

const surfacesOf = (drawn: BABYLON.Mesh): BABYLON.Mesh[] => drawn.getChildMeshes(true).filter((child): child is BABYLON.Mesh => child instanceof BABYLON.Mesh && !(child instanceof BABYLON.GreasedLineBaseMesh));
const linesOf = (drawn: BABYLON.Mesh): BABYLON.GreasedLineMesh[] => drawn.getChildMeshes(true).filter((child): child is BABYLON.GreasedLineMesh => child instanceof BABYLON.GreasedLineMesh);
const lookColours = (mesh: BABYLON.Mesh): string[] => {
    const material = mesh.material;
    const materials = material instanceof BABYLON.MultiMaterial ? material.subMaterials : [material];
    return materials.map(each => each instanceof BABYLON.PBRMetallicRoughnessMaterial ? each.baseColor.toHexString().toLowerCase() : "none");
};
const lineColours = (line: BABYLON.GreasedLineMesh, points: readonly number[]): string[] => points.map(point => line.greasedLineMaterial!.colors![point]!.toHexString().toLowerCase());
const instanceMatrices = (mesh: BABYLON.Mesh): number[][] => mesh.thinInstanceGetWorldMatrices().map(matrix => Array.from(matrix.asArray()));

describe("drawing shapes with their appearance and design builds in BabylonJS", () => {
    let engine: BABYLON.NullEngine;
    let scene: BABYLON.Scene;
    let draw: Draw;
    let drawHelper: DrawHelper;
    let workerCall: Mock;

    beforeEach(() => {
        engine = new BABYLON.NullEngine();
        scene = new BABYLON.Scene(engine);
        scene.metadata = { shadowGenerators: [] };
        const context = new Context();
        context.scene = scene;
        const jscadWorkerManager = new JSCADWorkerManager();
        const occtWorkerManager = new OCCTWorkerManager();
        drawHelper = new DrawHelper(context, new JSCADText(jscadWorkerManager), new Vector(new MathBitByBit(), new GeometryHelper()), jscadWorkerManager, new ManifoldWorkerManager(), occtWorkerManager);
        draw = new Draw(drawHelper, new BabylonNode(context, drawHelper), new Tag(context), context);
        workerCall = vi.fn((_method: string, inputs: { shapes: unknown[] }) => Promise.resolve(inputs.shapes.map(() => boxMesh())));
        occtWorkerManager.genericCallToWorkerPromise = workerCall;
    });

    afterEach(() => {
        scene.dispose();
        engine.dispose();
    });

    describe("a shape with its appearance", () => {
        it("should draw one mesh with a sub-mesh and a material per look", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctShapeOptions(), drawTwoSided: false, drawEdges: false };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: { shape: shapeA, appearance: boxAppearance }, options });

            // Assert
            const surfaces = surfacesOf(drawn);
            expect(surfaces).toHaveLength(1);
            const surface = surfaces[0]!;
            expect(lookColours(surface)).toEqual(["#ffffff", "#000000"]);
            expect(surface.subMeshes.map(subMesh => [subMesh.materialIndex, subMesh.indexStart, subMesh.indexCount, subMesh.verticesStart, subMesh.verticesCount])).toEqual([[0, 0, 24, 0, 16], [1, 24, 12, 16, 8]]);
            const multi = surface.material as BABYLON.MultiMaterial;
            expect(multi.subMaterials.map(material => (material as BABYLON.PBRMetallicRoughnessMaterial).metallic)).toEqual([0, 1]);
            expect(drawn.metadata.type).toBe(Inputs.Draw.drawingTypes.occt);
        });

        it("should write each triangle reversed, as the kernel's other meshes are, and record where each face's triangles are", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctShapeOptions(), drawTwoSided: false, drawEdges: false };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: { shape: shapeA, appearance: boxAppearance }, options });

            // Assert
            const surface = surfacesOf(drawn)[0]!;
            expect(Array.from(surface.getIndices()!.slice(0, 6))).toEqual([0, 2, 1, 0, 3, 2]);
            expect(surface.metadata.faceRanges).toEqual([
                { face: 2, start: 0, count: 6 }, { face: 3, start: 6, count: 6 }, { face: 4, start: 12, count: 6 },
                { face: 5, start: 18, count: 6 }, { face: 0, start: 24, count: 6 }, { face: 1, start: 30, count: 6 },
            ]);
        });

        it("should take the cached material itself when every face wears one look", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctShapeOptions(), faceColour: "#00ff00", drawTwoSided: false, drawEdges: false };

            // Act
            const first = await draw.drawAnyAsync({ entity: { shape: shapeA }, options });
            const second = await draw.drawAnyAsync({ entity: { shape: shapeB }, options });

            // Assert
            const material = surfacesOf(first)[0]!.material;
            expect(material).toBeInstanceOf(BABYLON.PBRMetallicRoughnessMaterial);
            expect(lookColours(surfacesOf(first)[0]!)).toEqual(["#00ff00"]);
            expect(surfacesOf(second)[0]!.material).toBe(material);
            expect(surfacesOf(first)[0]!.subMeshes).toHaveLength(1);
        });

        it("should make a look glow in its emissive color scaled by its strength", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctShapeOptions(), drawTwoSided: false, drawEdges: false };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: { shape: shapeA, appearance: { color: "#ffffff", emissive: "#3cf2ff", emissiveStrength: 2, faces: [] } }, options });

            // Assert
            const emissive = (surfacesOf(drawn)[0]!.material as BABYLON.PBRMetallicRoughnessMaterial).emissiveColor;
            expect([emissive.r, emissive.g, emissive.b]).toEqual([0x3c / 255 * 2, 0xf2 / 255 * 2, 2]);
        });

        it("should multiply the opacity of each look by the face opacity", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctShapeOptions(), faceOpacity: 0.5, drawTwoSided: false, drawEdges: false };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: { shape: shapeA, appearance: { color: "#ffffff", opacity: 0.5, faces: [] } }, options });

            // Assert
            expect((surfacesOf(drawn)[0]!.material as BABYLON.PBRMetallicRoughnessMaterial).alpha).toBe(0.25);
        });

        it("should draw the edges once, as one line, each in its color, and the back faces when asked", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctShapeOptions(), drawTwoSided: true };
            const appearance = { color: "#ffffff", edgeColor: "#333333", faces: [], edges: [{ indexes: [2, 5], color: "#ff0000" }] };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: { shape: shapeA, appearance }, options });

            // Assert
            const lines = linesOf(drawn);
            expect(lines).toHaveLength(1);
            expect(lineColours(lines[0]!, [0, 4, 10, 22])).toEqual(["#333333", "#ff0000", "#ff0000", "#333333"]);
            expect(surfacesOf(drawn)).toHaveLength(2);
        });

        it("should give edges no appearance colors the shape's color moved by the edge contrast", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctShapeOptions(), drawFaces: false, edgeColour: "#00ff00", edgeContrast: 0.4 };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: { shape: shapeA, appearance: { color: "#ffffff", faces: [] } }, options });

            // Assert
            expect(lineColours(linesOf(drawn)[0]!, [0, 23])).toEqual(["#999999", "#999999"]);
        });

        it("should give the back faces the default color when the options leave theirs empty", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctShapeOptions(), drawTwoSided: true, drawEdges: false, backFaceColour: "" };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: { shape: shapeA }, options });

            // Assert
            const back = surfacesOf(drawn)[1]!;
            expect((back.material as BABYLON.PBRMetallicRoughnessMaterial).baseColor.toHexString().toLowerCase()).toBe(DEFAULT_COLORS.BACK_FACE.toLowerCase());
        });

        it("should draw a mesh without a material for faces that have no triangles", async () => {
            // Arrange
            const empty = boxMesh();
            empty.faceList.forEach(face => { face.triIndexes = []; });
            workerCall.mockResolvedValueOnce([empty]);
            const options = { ...new Inputs.Draw.DrawOcctShapeOptions(), drawTwoSided: false, drawEdges: false };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: { shape: shapeA, appearance: boxAppearance }, options });

            // Assert
            const surface = surfacesOf(drawn)[0]!;
            expect(surface.material).toBeNull();
            expect(surface.getTotalIndices()).toBe(0);
        });

        it("should mesh a list of them in one call to the worker", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctShapeOptions(), drawTwoSided: false };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: [{ shape: shapeA, appearance: boxAppearance }, { shape: shapeB }], options });

            // Assert
            expect(drawn.getChildMeshes(true)).toHaveLength(2);
            expect(workerCall).toHaveBeenCalledTimes(1);
            expect(workerCall.mock.calls[0]![0]).toBe("shapesToMeshes");
            expect(workerCall.mock.calls[0]![1].shapes).toEqual([shapeA, shapeB]);
            expect(drawn.metadata.type).toBe(Inputs.Draw.drawingTypes.occtShapes);
        });

        it("should refuse an answer from the worker that is not one mesh per shape", async () => {
            // Arrange
            workerCall.mockResolvedValueOnce([]);

            // Act
            const drawing = draw.drawAnyAsync({ entity: { shape: shapeA } });

            // Assert
            await expect(drawing).rejects.toThrow("did not return one mesh of faces and edges per shape");
        });
    });

    describe("the color groups of an assembly document", () => {
        it("should color the faces of each group in one mesh", async () => {
            // Arrange
            const mesh = { ...boxMesh(), colorGroups: { "#00ff00ff": [0, 1], "#0000ff80": [2] } };
            const options = resolveDto(Inputs.Draw.DrawOcctShapeOptions, { faceColour: "#ff0000", drawEdges: false, drawTwoSided: false }) as Resolved.Draw.DrawOcctShapeOptions;

            // Act
            const drawn = await drawHelper.handleDecomposedMesh(options, mesh, options);

            // Assert
            const surface = surfacesOf(drawn)[0]!;
            expect(lookColours(surface)).toEqual(["#ff0000", "#00ff00", "#0000ff"]);
            expect(((surface.material as BABYLON.MultiMaterial).subMaterials[2] as BABYLON.PBRMetallicRoughnessMaterial).alpha).toBeCloseTo(128 / 255);
            expect(surface.subMeshes.map(subMesh => subMesh.indexCount)).toEqual([18, 12, 6]);
        });
    });

    describe("a design build", () => {
        const options = { ...new Inputs.Draw.DrawOcctShapeOptions(), faceColour: "#ff0000", precision: 0.1 };

        it("should mesh each part once and draw one mesh and one line per part, a thin instance per placement", async () => {
            // Act
            const drawn = await draw.drawAnyAsync({ entity: buildOf([0, 10], [20]), options });

            // Assert
            expect(workerCall).toHaveBeenCalledTimes(1);
            expect(workerCall.mock.calls[0]![1].shapes).toEqual([shapeA, shapeB]);
            const [box, pin] = surfacesOf(drawn);
            expect(lookColours(box!)).toEqual(["#ffffff", "#000000"]);
            expect(lookColours(pin!)).toEqual(["#ff0000"]);
            expect([box!.thinInstanceCount, pin!.thinInstanceCount]).toEqual([2, 1]);
            expect(instanceMatrices(box!)[1]).toEqual(at(10));
            expect(box!.metadata).toEqual(expect.objectContaining({ part: "box-1", paths: ["box0", "box1"] }));
            const lines = linesOf(drawn);
            expect(lines.map(line => line.thinInstanceCount)).toEqual([2, 1]);
            expect(instanceMatrices(lines[1]!)[0]).toEqual(at(20));
            expect(drawn.metadata.type).toBe(Inputs.Draw.drawingTypes.occtShapes);
        });

        it("should only move the instances when redrawn with the same parts at the same paths", async () => {
            // Arrange
            const drawn = await draw.drawAnyAsync({ entity: buildOf([0, 10], [20]), options });
            const children = drawn.getChildMeshes(true);

            // Act
            const redrawn = await draw.drawAnyAsync({ entity: buildOf([5, 15], [25]), options, babylonMesh: drawn });

            // Assert
            expect(redrawn).toBe(drawn);
            expect(workerCall).toHaveBeenCalledTimes(1);
            expect(redrawn.getChildMeshes(true)).toEqual(children);
            const [box, pin] = surfacesOf(redrawn);
            expect(instanceMatrices(box!)[1]).toEqual(at(15));
            expect(instanceMatrices(pin!)[0]).toEqual(at(25));
            expect(instanceMatrices(linesOf(redrawn)[0]!)[0]).toEqual(at(5));
        });

        it("should mesh only the parts it has not when the placements change, and dispose what it drew before", async () => {
            // Arrange
            const drawn = await draw.drawAnyAsync({ entity: buildOf([0], [20]), options });
            const before = drawn.getChildMeshes(true);
            const lookMaterial = surfacesOf(drawn)[0]!.material as BABYLON.MultiMaterial;

            // Act
            const redrawn = await draw.drawAnyAsync({ entity: buildOf([0], [20], { id: "nut-3", shape: shapeC }), options, babylonMesh: drawn });

            // Assert
            expect(redrawn).toBe(drawn);
            expect(workerCall).toHaveBeenCalledTimes(2);
            expect(workerCall.mock.calls[1]![1].shapes).toEqual([shapeC]);
            expect(surfacesOf(redrawn).map(surface => surface.thinInstanceCount)).toEqual([1, 1, 1]);
            expect(before.every(child => child.isDisposed())).toBe(true);
            expect(scene.multiMaterials).not.toContain(lookMaterial);
            expect(lookMaterial.subMaterials.every(material => material !== null && scene.materials.includes(material))).toBe(true);
        });

        it("should mesh a part again when its shape changed under the same id, and only that part", async () => {
            // Arrange
            const drawn = await draw.drawAnyAsync({ entity: buildOf([0], [20]), options });
            const before = drawn.getChildMeshes(true);
            const edited = buildOf([0], [20]);
            edited.parts[1] = partOf("pin-2", shapeC, undefined, "pin-2-edited");

            // Act
            const redrawn = await draw.drawAnyAsync({ entity: edited, options, babylonMesh: drawn });

            // Assert
            expect(redrawn).toBe(drawn);
            expect(workerCall).toHaveBeenCalledTimes(2);
            expect(workerCall.mock.calls[1]![1].shapes).toEqual([shapeC]);
            expect(before.every(child => child.isDisposed())).toBe(true);
        });

        it("should mesh every part again when the precision changes", async () => {
            // Arrange
            const drawn = await draw.drawAnyAsync({ entity: buildOf([0], [20]), options });

            // Act
            await draw.drawAnyAsync({ entity: buildOf([0], [20]), options: { ...options, precision: 0.5 }, babylonMesh: drawn });

            // Assert
            expect(workerCall).toHaveBeenCalledTimes(2);
            expect(workerCall.mock.calls[1]![1].shapes).toEqual([shapeA, shapeB]);
        });

        it("should color the edges of each part as its appearance says, and draw them again when the edge contrast changes", async () => {
            // Arrange
            const build = buildOf([0, 10], [20]);
            build.parts[0] = partOf("box-1", shapeA, { ...boxAppearance, edgeColor: "#333333", edges: [{ indexes: [0], color: "#0000ff" }] });
            const drawn = await draw.drawAnyAsync({ entity: build, options: { ...options, edgeColour: "#00ff00" } });
            const [boxLine, pinLine] = linesOf(drawn);
            const coloured = [lineColours(boxLine!, [0, 2]), lineColours(pinLine!, [0])];

            // Act
            await draw.drawAnyAsync({ entity: build, options: { ...options, edgeColour: "#00ff00", edgeContrast: 0.5 }, babylonMesh: drawn });

            // Assert
            expect(coloured).toEqual([["#0000ff", "#333333"], ["#00ff00"]]);
            expect(workerCall).toHaveBeenCalledTimes(1);
            expect(boxLine!.isDisposed()).toBe(true);
            expect(lineColours(linesOf(drawn)[1]!, [0])).toEqual(["#ff8080"]);
        });

        it("should pose and redraw only the lines when the faces are off", async () => {
            // Arrange
            const linesOnly = { ...options, drawFaces: false };
            const drawn = await draw.drawAnyAsync({ entity: buildOf([0], [20]), options: linesOnly });
            const before = linesOf(drawn);

            // Act
            await draw.drawAnyAsync({ entity: buildOf([7], [20]), options: linesOnly, babylonMesh: drawn });
            const posed = instanceMatrices(linesOf(drawn)[0]!)[0];
            await draw.drawAnyAsync({ entity: buildOf([7], [20], { id: "nut-3", shape: shapeC }), options: linesOnly, babylonMesh: drawn });

            // Assert
            expect(posed).toEqual(at(7));
            expect(surfacesOf(drawn)).toHaveLength(0);
            expect(before.every(line => line.isDisposed())).toBe(true);
            expect(linesOf(drawn)).toHaveLength(3);
        });

        it("should place each part of a build without components once, at the origin", async () => {
            // Arrange
            const partDocument: Build = { parts: [partOf("box-1", shapeA, boxAppearance)], report: [], issues: [], parameters: {}, units: { length: "mm", angle: "deg" }, up: "y" };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: partDocument, options });

            // Assert
            const surface = surfacesOf(drawn)[0]!;
            expect(surface.thinInstanceCount).toBe(1);
            expect(instanceMatrices(surface)[0]).toEqual(at(0));
        });

        it("should draw no faces and no edges when the options turn them off", async () => {
            // Act
            const drawn = await draw.drawAnyAsync({ entity: buildOf([0], [20]), options: { ...options, drawFaces: false, drawEdges: false } });

            // Assert
            expect(drawn.getChildMeshes(true)).toHaveLength(0);
        });

        it("should make every drawn part a shadow caster and receiver when the scene has shadows", async () => {
            // Arrange
            const light = new BABYLON.DirectionalLight("sun", new BABYLON.Vector3(0, -1, 0), scene);
            const shadows = new BABYLON.ShadowGenerator(256, light);
            scene.metadata = { shadowGenerators: [shadows] };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: buildOf([0], [20]), options });

            // Assert
            const children = drawn.getChildMeshes(true);
            expect(children.every(child => shadows.getShadowMap()!.renderList!.includes(child) && child.receiveShadows)).toBe(true);
        });
    });
});
