import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from "vitest";
import * as pc from "playcanvas";
import { Tag } from "@bitbybit-dev/core";
import type * as Models from "@bitbybit-dev/core/lib/api/models";
import { GeometryHelper, InputError, MathBitByBit, Vector } from "@bitbybit-dev/base";
import { JSCADText, JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker";
import { Context } from "../context";
import { DrawHelper } from "../draw-helper";
import * as Inputs from "../inputs";
import { Draw } from "./draw";

type Point3 = Inputs.Base.Point3;
type MetaEntity = pc.Entity & { bitbybitMeta?: Inputs.Draw.BitByBitMeta };

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

const documentMesh = (): Inputs.OCCT.DecomposedMeshDto => {
    const face = new Inputs.OCCT.DecomposedFaceDto();
    face.faceIndex = 0;
    face.vertexCoord = [0, 0, 0, 1, 0, 0, 0, 1, 0];
    face.normalCoord = [0, 0, 1, 0, 0, 1, 0, 0, 1];
    face.triIndexes = [0, 1, 2];
    face.numberOfTriangles = 1;
    const mesh = new Inputs.OCCT.DecomposedMeshDto([face], []);
    mesh.pointsList = [];
    return mesh;
};

const colouredDocumentMesh = (): Inputs.OCCT.DecomposedMeshDto => {
    const faces = [0, 1, 2].map(index => {
        const face = documentMesh().faceList[0]!;
        face.faceIndex = index;
        face.vertexCoord = [0, 0, index, 1, 0, index, 0, 1, index];
        return face;
    });
    const mesh = new Inputs.OCCT.DecomposedMeshDto(faces, []);
    mesh.pointsList = [];
    mesh.colorGroups = { "#ff00004d": [0], "#00ff00": [1] };
    return mesh;
};

const looksOf = (entity: pc.Entity | undefined): [string, number][] => (entity?.render?.meshInstances ?? []).map(instance => {
    const material = instance.material as pc.StandardMaterial;
    return [`#${material.diffuse.toString(false).slice(1).toLowerCase()}`, Math.round(material.opacity * 1000) / 1000];
});

const named = (root: pc.GraphNode, part: string): pc.Entity[] => root.find(node => node.name.includes(`-${part}-`)) as pc.Entity[];
const lettersOf = (root: pc.GraphNode): pc.Entity[] => named(root, "annotationLetters");
const lineVerticesOf = (root: pc.GraphNode): number => named(root, "annotations")
    .flatMap(group => group.children.filter(child => child.name.includes("-lines-")) as pc.Entity[])
    .reduce((sum, line) => sum + line.render!.meshInstances[0]!.mesh!.vertexBuffer.numVertices, 0);

describe("drawing a document's annotations in PlayCanvas", () => {
    let app: pc.AppBase;
    let draw: Draw;
    let workerCall: Mock;

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
        const occtWorkerManager = new OCCTWorkerManager();
        const drawHelper = new DrawHelper(context, new JSCADText(jscadWorkerManager), new Vector(new MathBitByBit(), new GeometryHelper()), jscadWorkerManager, new ManifoldWorkerManager(), occtWorkerManager);
        draw = new Draw(drawHelper, context, new Tag(context));
        workerCall = vi.fn((method: string) => Promise.resolve(method === "docToMesh" ? documentMesh() : pmi()));
        occtWorkerManager.genericCallToWorkerPromise = workerCall;
    });

    afterEach(() => {
        app.destroy();
    });

    describe("the annotations themselves", () => {
        it("should draw the lines as one line entity and the letters as one unlit, two-sided mesh in the annotation color, casting no shadow", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctDocumentOptions(), annotations: { annotationColour: "#ff8800" } };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: pmi(), options }) as MetaEntity;

            // Assert
            expect(drawn.parent).toBe(app.root);
            expect(lineVerticesOf(drawn)).toBe((2 + 1) * 2);
            const [letters] = lettersOf(drawn);
            const instance = letters!.render!.meshInstances[0]!;
            expect(instance.mesh!.vertexBuffer.numVertices).toBe(8);
            expect(instance.mesh!.indexBuffer[0]!.numIndices).toBe(8 * 3);
            const material = instance.material as pc.StandardMaterial;
            expect(material.useLighting).toBe(false);
            expect(material.cull).toBe(pc.CULLFACE_NONE);
            expect([material.emissive.r, material.emissive.g, material.emissive.b]).toEqual([1, 0x88 / 255, 0]);
            expect(letters!.render!.castShadows).toBe(false);
            expect(drawn.bitbybitMeta!.type).toBe(Inputs.Draw.drawingTypes.occtAnnotations);
        });

        it("should outline the letters among the lines, each loop closed, when they are not filled", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctDocumentOptions(), annotations: { annotationsFilled: false } };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: pmi(), options }) as pc.Entity;

            // Assert
            expect(lettersOf(drawn)).toEqual([]);
            expect(lineVerticesOf(drawn)).toBe((2 + 4 + 4 + 1) * 2);
        });

        it("should draw only the annotations the named saved view shows", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctDocumentOptions(), annotations: { annotationsView: "FRONT" } };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: pmi(), options }) as pc.Entity;

            // Assert
            expect(lineVerticesOf(drawn)).toBe(2);
            expect(lettersOf(drawn)).toEqual([]);
        });

        it("should refuse a view name no saved view bears, the refusal kept as the cause, leaving nothing in the scene", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctDocumentOptions(), annotations: { annotationsView: "TOP" } };
            const before = app.root.children.length;
            vi.spyOn(console, "error").mockImplementation(() => undefined);

            // Act
            const act = draw.drawAnyAsync({ entity: pmi(), options });

            // Assert
            const refusal = await act.then(() => undefined, (error: unknown) => error as Error);
            expect(refusal!.message).toContain("no saved view of the document is called");
            expect(refusal!.cause).toBeInstanceOf(InputError);
            expect(app.root.children.length).toBe(before);
        });
    });

    describe("an assembly document", () => {
        it("should mesh the document turned from Z-up into Y-up with the options' meshing, as loadSTEPorIGES turns a shape, and not read its annotations unless asked", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctDocumentOptions(), meshing: { precision: 0.05 } };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: DOCUMENT, options }) as MetaEntity;

            // Assert
            expect(workerCall).toHaveBeenCalledTimes(1);
            expect(workerCall).toHaveBeenCalledWith("docToMesh", expect.objectContaining({ document: DOCUMENT, precision: 0.05, upAxis: Inputs.Base.upAxisConversionEnum.zUpToYUp }));
            expect(named(drawn, "annotations")).toEqual([]);
            expect(drawn.bitbybitMeta!.type).toBe(Inputs.Draw.drawingTypes.occtDocument);
        });

        it("should draw the document's annotations inside its entity when asked, reading their curves at the meshing precision", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctDocumentOptions(), meshing: { precision: 0.05 }, drawAnnotations: true };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: DOCUMENT, options }) as pc.Entity;

            // Assert
            expect(workerCall).toHaveBeenCalledWith("assembly.query.getDocumentAnnotations", { document: DOCUMENT, deflection: 0.05, upAxis: Inputs.Base.upAxisConversionEnum.zUpToYUp });
            const [annotations] = named(drawn, "annotations");
            expect(annotations!.parent).toBe(drawn);
            expect(lettersOf(drawn)).toHaveLength(1);
        });

        it("should turn the parts and the annotations together, or leave both in the document's own axes", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctDocumentOptions(), drawAnnotations: true, upAxis: Inputs.Base.upAxisConversionEnum.keep };

            // Act
            await draw.drawAnyAsync({ entity: DOCUMENT, options });

            // Assert
            expect(workerCall).toHaveBeenCalledWith("docToMesh", expect.objectContaining({ upAxis: Inputs.Base.upAxisConversionEnum.keep }));
            expect(workerCall).toHaveBeenCalledWith("assembly.query.getDocumentAnnotations", expect.objectContaining({ upAxis: Inputs.Base.upAxisConversionEnum.keep }));
        });

        it("should refuse a view name no saved view bears before anything of the document is drawn", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctDocumentOptions(), drawAnnotations: true, annotations: { annotationsView: "TOP" } };
            const before = app.root.children.length;
            vi.spyOn(console, "error").mockImplementation(() => undefined);

            // Act
            const act = draw.drawAnyAsync({ entity: DOCUMENT, options });

            // Assert
            await expect(act).rejects.toThrow("no saved view of the document is called");
            expect(app.root.children.length).toBe(before);
        });

        it("should give the document its own defaults when drawn with the options of a plain shape, which it does not read, or with none", async () => {
            // Arrange
            const options = draw.optionsOcctShape({ precision: 0.05 });

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
            await draw.drawAnyAsync({ entity: DOCUMENT, options: draw.optionsOcctDocument({ meshing, edges }) });

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
            const [front] = named(drawn, "lookedSurface");
            const back = named(drawn, "backFaceSurfaceChild");
            expect(looksOf(front)).toEqual([["#c0c0c0", 1], ["#ff0000", 0.302], ["#00ff00", 1]]);
            expect(back).toHaveLength(1);
            expect(looksOf(back[0])).toEqual(looksOf(front));
            expect(back[0]!.render!.meshInstances.map(instance => instance.mesh!.indexBuffer[0]!.numIndices)).toEqual(front!.render!.meshInstances.map(instance => instance.mesh!.indexBuffer[0]!.numIndices));
        });

        it("should draw only the annotations the saved view shows with the options optionsOcctDocument builds", async () => {
            // Arrange
            const options = draw.optionsOcctDocument({ drawAnnotations: true, annotations: draw.optionsAnnotations({ annotationsView: "FRONT" }) });

            // Act
            const drawn = await draw.drawAnyAsync({ entity: DOCUMENT, options }) as pc.Entity;

            // Assert
            expect(options.upAxis).toBe(Inputs.Base.upAxisConversionEnum.zUpToYUp);
            expect(options.annotations?.annotationColour).toBe("#0047ab");
            expect(workerCall).toHaveBeenCalledWith("assembly.query.getDocumentAnnotations", expect.objectContaining({ document: DOCUMENT, upAxis: Inputs.Base.upAxisConversionEnum.zUpToYUp }));
            expect(lettersOf(drawn)).toEqual([]);
        });
    });
});
