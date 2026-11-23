import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from "vitest";
import * as BABYLON from "@babylonjs/core";
import { Tag } from "@bitbybit-dev/core";
import type * as Models from "@bitbybit-dev/core/lib/api/models";
import { GeometryHelper, InputError, MathBitByBit, Vector } from "@bitbybit-dev/base";
import { JSCADText, JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import { Context } from "../context";
import { DrawHelper } from "../draw-helper";
import * as Inputs from "../inputs";
import { BabylonNode } from "./babylon/node";
import { Draw } from "./draw";

type Point3 = Inputs.Base.Point3;

const DOCUMENT: Inputs.OCCT.TDocStdDocumentPointer = { hash: 7, type: "occ-document" };

const ring: Point3[][] = [
    [[1, 1, 35], [1, 5, 35], [5, 5, 35], [5, 1, 35]],
    [[2, 2, 35], [2, 4, 35], [4, 4, 35], [4, 2, 35]],
];

const annotation = (label: string, more: Partial<Models.OCCT.DocumentAnnotation> = {}): Models.OCCT.DocumentAnnotation => ({
    label, kind: "dimension", type: "Size_Thickness", name: "", value: 20, attached: 1, lines: [[[0, 0, 35], [10, 0, 35], [10, 5, 35]]], fills: [], ...more,
});

const pmi = (): Models.OCCT.DocumentAnnotations => ({
    annotations: [annotation("0:1:4:1", { fills: ring }), annotation("0:1:4:2", { lines: [[[0, 30, 0], [10, 30, 0]]] })],
    views: [{ label: "0:1:7:1", name: "FRONT", isParallel: true, eye: [5, 10, 100], direction: [0, 0, -1], up: [0, -1, 0], width: 80, height: 60, annotations: ["0:1:4:2"] }],
    leftOut: { annotations: 0, views: 0 },
});

const triangleFace = (): Inputs.OCCT.DecomposedFaceDto => {
    const face = new Inputs.OCCT.DecomposedFaceDto();
    face.faceIndex = 0;
    face.vertexCoord = [0, 0, 0, 1, 0, 0, 0, 1, 0];
    face.normalCoord = [0, 0, 1, 0, 0, 1, 0, 0, 1];
    face.triIndexes = [0, 1, 2];
    face.numberOfTriangles = 1;
    return face;
};

const documentMesh = (): Inputs.OCCT.DecomposedMeshDto => {
    const mesh = new Inputs.OCCT.DecomposedMeshDto([triangleFace()], []);
    mesh.pointsList = [];
    return mesh;
};

const colouredDocumentMesh = (): Inputs.OCCT.DecomposedMeshDto => {
    const faces = [0, 1, 2].map(index => ({ ...triangleFace(), faceIndex: index, vertexCoord: [0, 0, index, 1, 0, index, 0, 1, index] }));
    const mesh = new Inputs.OCCT.DecomposedMeshDto(faces, []);
    mesh.pointsList = [];
    mesh.colorGroups = { "#ff00004d": [0], "#00ff00": [1] };
    return mesh;
};

const looksOf = (mesh: BABYLON.AbstractMesh | undefined): [string, number][] => {
    const material = mesh?.material;
    const worn = material instanceof BABYLON.MultiMaterial ? material.subMaterials : [material];
    return worn.map(each => [(each as BABYLON.PBRMetallicRoughnessMaterial).baseColor.toHexString().toLowerCase(), Math.round(each!.alpha * 1000) / 1000]);
};

const lettersOf = (drawn: BABYLON.Node): BABYLON.Mesh[] => drawn.getChildMeshes(false).filter((child): child is BABYLON.Mesh => child.name.includes("-annotationLetters-"));
const annotationLinesOf = (drawn: BABYLON.Node): BABYLON.GreasedLineMesh[] => (drawn.getChildMeshes(false).find(child => child.name.includes("-annotations-"))?.getChildMeshes(true) ?? drawn.getChildMeshes(true))
    .filter((child): child is BABYLON.GreasedLineMesh => child instanceof BABYLON.GreasedLineMesh);

describe("drawing a document's annotations in BabylonJS", () => {
    let engine: BABYLON.NullEngine;
    let scene: BABYLON.Scene;
    let draw: Draw;
    let workerCall: Mock;

    beforeEach(() => {
        engine = new BABYLON.NullEngine();
        scene = new BABYLON.Scene(engine);
        scene.metadata = { shadowGenerators: [] };
        const context = new Context();
        context.scene = scene;
        const jscadWorkerManager = new JSCADWorkerManager();
        const occtWorkerManager = new OCCTWorkerManager();
        const drawHelper = new DrawHelper(context, new JSCADText(jscadWorkerManager), new Vector(new MathBitByBit(), new GeometryHelper()), jscadWorkerManager, new ManifoldWorkerManager(), occtWorkerManager);
        draw = new Draw(drawHelper, new BabylonNode(context, drawHelper), new Tag(context), context);
        workerCall = vi.fn((method: string) => Promise.resolve(method === "docToMesh" ? documentMesh() : pmi()));
        occtWorkerManager.genericCallToWorkerPromise = workerCall;
    });

    afterEach(() => {
        scene.dispose();
        engine.dispose();
    });

    describe("the annotations themselves", () => {
        it("should draw the lines as one greased line and the letters as one unlit, two-sided mesh, both in the annotation color", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctDocumentOptions(), annotations: { annotationColour: "#ff8800" } };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: pmi(), options });

            // Assert
            const lines = annotationLinesOf(drawn);
            expect(lines).toHaveLength(1);
            expect(lines[0]!.metadata.linesForRenderLengths).toEqual([9, 6]);
            expect(lines[0]!.greasedLineMaterial!.color!.toHexString().toLowerCase()).toBe("#ff8800");
            const [letters] = lettersOf(drawn);
            expect(letters!.getTotalVertices()).toBe(8);
            expect(letters!.getIndices()!.length).toBe(8 * 3);
            const material = letters!.material as BABYLON.StandardMaterial;
            expect(material.disableLighting).toBe(true);
            expect(material.backFaceCulling).toBe(false);
            expect(material.emissiveColor.toHexString().toLowerCase()).toBe("#ff8800");
            expect(drawn.metadata.type).toBe(Inputs.Draw.drawingTypes.occtAnnotations);
        });

        it("should draw the lines a hundredth of the annotation width wide, in model units", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctDocumentOptions(), annotations: { annotationWidth: 5 } };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: pmi(), options });

            // Assert
            expect(annotationLinesOf(drawn)[0]!.greasedLineMaterial!.width).toBeCloseTo(0.05, 12);
        });

        it("should outline the letters among the lines, each loop closed, when they are not filled", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctDocumentOptions(), annotations: { annotationsFilled: false } };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: pmi(), options });

            // Assert
            expect(lettersOf(drawn)).toEqual([]);
            expect(annotationLinesOf(drawn)[0]!.metadata.linesForRenderLengths).toEqual([9, 15, 15, 6]);
        });

        it("should draw only the annotations the named saved view shows", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctDocumentOptions(), annotations: { annotationsView: "FRONT" } };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: pmi(), options });

            // Assert
            expect(annotationLinesOf(drawn)[0]!.metadata.linesForRenderLengths).toEqual([6]);
            expect(lettersOf(drawn)).toEqual([]);
        });

        it("should refuse a view name no saved view bears, leaving nothing in the scene", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctDocumentOptions(), annotations: { annotationsView: "TOP" } };
            const before = scene.meshes.length;

            // Act
            const act = draw.drawAnyAsync({ entity: pmi(), options });

            // Assert
            await expect(act).rejects.toThrow(InputError);
            expect(scene.meshes.length).toBe(before);
        });

        it("should cast no shadow, even in a scene that has shadow generators", async () => {
            // Arrange
            const light = new BABYLON.DirectionalLight("sun", new BABYLON.Vector3(0, -1, 0), scene);
            const shadows = new BABYLON.ShadowGenerator(256, light);
            scene.metadata.shadowGenerators.push(shadows);

            // Act
            await draw.drawAnyAsync({ entity: pmi() });

            // Assert
            expect(shadows.getShadowMap()!.renderList!.length).toBe(0);
        });

        it("should free the letters' material with the letters", async () => {
            // Arrange
            const before = scene.materials.length;
            const drawn = await draw.drawAnyAsync({ entity: pmi() });

            // Act
            drawn.dispose();

            // Assert
            expect(scene.materials.length).toBe(before);
        });
    });

    describe("an assembly document", () => {
        it("should mesh the document turned from Z-up into Y-up with the options' meshing, as loadSTEPorIGES turns a shape, and not read its annotations unless asked", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctDocumentOptions(), meshing: { precision: 0.05 }, drawEdges: false };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: DOCUMENT, options });

            // Assert
            expect(workerCall).toHaveBeenCalledTimes(1);
            expect(workerCall).toHaveBeenCalledWith("docToMesh", expect.objectContaining({ document: DOCUMENT, precision: 0.05, upAxis: Inputs.Base.upAxisConversionEnum.zUpToYUp }));
            expect(drawn.getChildMeshes(true)).toHaveLength(2);
            expect(drawn.getChildMeshes(true).filter(child => child.name.includes("backFace"))).toHaveLength(1);
            expect(drawn.metadata.type).toBe(Inputs.Draw.drawingTypes.occtDocument);
        });

        it("should draw the document's annotations with it when asked, reading their curves at the meshing precision", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctDocumentOptions(), meshing: { precision: 0.05 }, drawEdges: false, drawAnnotations: true };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: DOCUMENT, options });

            // Assert
            expect(workerCall).toHaveBeenCalledWith("assembly.query.getDocumentAnnotations", { document: DOCUMENT, deflection: 0.05, upAxis: Inputs.Base.upAxisConversionEnum.zUpToYUp });
            const annotations = drawn.getChildMeshes(true).find(child => child.name.includes("-annotations-"));
            expect(annotations).toBeDefined();
            expect(lettersOf(drawn)).toHaveLength(1);
        });

        it("should turn the parts and the annotations together, or leave both in the document's own axes", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctDocumentOptions(), drawEdges: false, drawAnnotations: true, upAxis: Inputs.Base.upAxisConversionEnum.keep };

            // Act
            await draw.drawAnyAsync({ entity: DOCUMENT, options });

            // Assert
            expect(workerCall).toHaveBeenCalledWith("docToMesh", expect.objectContaining({ upAxis: Inputs.Base.upAxisConversionEnum.keep }));
            expect(workerCall).toHaveBeenCalledWith("assembly.query.getDocumentAnnotations", expect.objectContaining({ upAxis: Inputs.Base.upAxisConversionEnum.keep }));
        });

        it("should keep the annotations out of the shadows the document casts", async () => {
            // Arrange
            const light = new BABYLON.DirectionalLight("sun", new BABYLON.Vector3(0, -1, 0), scene);
            const shadows = new BABYLON.ShadowGenerator(256, light);
            scene.metadata.shadowGenerators.push(shadows);
            const options = { ...new Inputs.Draw.DrawOcctDocumentOptions(), drawEdges: false, drawAnnotations: true };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: DOCUMENT, options });

            // Assert
            const casters = shadows.getShadowMap()!.renderList!;
            expect(casters).toContain(drawn);
            expect(casters.some(mesh => mesh.name.includes("-annotation"))).toBe(false);
        });

        it("should refuse a view name no saved view bears before anything of the document is drawn", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctDocumentOptions(), drawAnnotations: true, annotations: { annotationsView: "TOP" } };
            const before = scene.meshes.length;

            // Act
            const act = draw.drawAnyAsync({ entity: DOCUMENT, options });

            // Assert
            await expect(act).rejects.toThrow("no saved view of the document is called");
            expect(scene.meshes.length).toBe(before);
        });

        it("should give the document its own defaults when drawn with the options of a plain shape, which it does not read, or with none", async () => {
            // Arrange
            const options = draw.optionsOcctShape({ precision: 0.05, drawEdges: false, drawTwoSided: false });

            // Act
            await draw.drawAnyAsync({ entity: DOCUMENT, options });
            await draw.drawAnyAsync({ entity: DOCUMENT });

            // Assert
            expect(workerCall).toHaveBeenCalledTimes(2);
            expect(workerCall).toHaveBeenNthCalledWith(1, "docToMesh", expect.objectContaining({ precision: 0.01, upAxis: Inputs.Base.upAxisConversionEnum.zUpToYUp }));
            expect(workerCall).toHaveBeenNthCalledWith(2, "docToMesh", expect.objectContaining({ precision: 0.01, upAxis: Inputs.Base.upAxisConversionEnum.zUpToYUp }));
        });

        it("should mesh the document as the piece optionsMeshing builds says, and build the edges piece with its defaults for what is left out", async () => {
            // Arrange
            const meshing = draw.optionsMeshing({ precision: 0.05 });
            const edges = draw.optionsEdges({ edgeColour: "#333333" });

            // Act
            await draw.drawAnyAsync({ entity: DOCUMENT, options: draw.optionsOcctDocument({ meshing, edges, drawEdges: false }) });

            // Assert
            expect(meshing).toEqual({ precision: 0.05, angularDeflection: 0.5, relativeDeflection: false, forceFaceDeflection: false, allowQualityDecrease: true });
            expect(edges).toEqual({ edgeColour: "#333333", edgeWidth: 2, edgeOpacity: 1 });
            expect(workerCall).toHaveBeenCalledWith("docToMesh", expect.objectContaining({ document: DOCUMENT, precision: 0.05, angularDeflection: 0.5, allowQualityDecrease: true }));
        });

        it("should draw the back of each part's faces in that part's color and transparency, a part the document leaves uncolored in grey", async () => {
            // Arrange
            workerCall.mockImplementation(() => Promise.resolve(colouredDocumentMesh()));

            // Act
            const drawn = await draw.drawAnyAsync({ entity: DOCUMENT, options: draw.optionsOcctDocument({ drawEdges: false }) });

            // Assert
            const front = drawn.getChildMeshes(true).find(child => child.name.includes("lookedSurface"));
            const back = drawn.getChildMeshes(true).filter(child => child.name.includes("backFace"));
            expect(looksOf(front)).toEqual([["#c0c0c0", 1], ["#ff0000", 0.302], ["#00ff00", 1]]);
            expect(back).toHaveLength(1);
            expect(looksOf(back[0])).toEqual(looksOf(front));
            expect(back[0]!.getTotalIndices()).toBe(front!.getTotalIndices());
        });

        it("should draw a document again over its mesh with the options it was drawn with, which it keeps as they were given", async () => {
            // Arrange
            const options = draw.optionsOcctDocument({ upAxis: Inputs.Base.upAxisConversionEnum.keep, meshing: { precision: 0.2 }, drawEdges: false });
            const first = await draw.drawAnyAsync({ entity: DOCUMENT, options });

            // Act
            await draw.drawAnyAsync({ entity: DOCUMENT, babylonMesh: first });

            // Assert
            expect(first.metadata.options).toEqual(options);
            expect(workerCall).toHaveBeenLastCalledWith("docToMesh", expect.objectContaining({ precision: 0.2, upAxis: Inputs.Base.upAxisConversionEnum.keep }));
        });

        it("should draw only the annotations the saved view shows with the options optionsOcctDocument builds", async () => {
            // Arrange
            const options = draw.optionsOcctDocument({ drawAnnotations: true, annotations: draw.optionsAnnotations({ annotationsView: "FRONT" }), drawEdges: false });

            // Act
            const drawn = await draw.drawAnyAsync({ entity: DOCUMENT, options });

            // Assert
            expect(options.upAxis).toBe(Inputs.Base.upAxisConversionEnum.zUpToYUp);
            expect(options.annotations?.annotationColour).toBe("#0047ab");
            expect(workerCall).toHaveBeenCalledWith("assembly.query.getDocumentAnnotations", expect.objectContaining({ document: DOCUMENT, upAxis: Inputs.Base.upAxisConversionEnum.zUpToYUp }));
            expect(lettersOf(drawn)).toEqual([]);
        });
    });
});
