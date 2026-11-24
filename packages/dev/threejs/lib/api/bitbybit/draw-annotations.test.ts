import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";
import { DoubleSide, Group, MeshBasicMaterial, Scene, type Mesh, type MeshPhysicalMaterial, type Object3D } from "three";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { Tag } from "@bitbybit-dev/core";
import type * as Models from "@bitbybit-dev/core/lib/api/models";
import { GeometryHelper, InputError, MathBitByBit, Vector } from "@bitbybit-dev/base";
import { JSCADText, JSCADWorkerManager } from "@bitbybit-dev/jscad-worker";
import { ManifoldWorkerManager } from "@bitbybit-dev/manifold-worker";
import { OCCTWorkerManager } from "@bitbybit-dev/occt-worker/lib";
import { mockOCCTBoxDecomposedMesh } from "../__mocks__/test-data";
import { Context } from "../context";
import { DrawHelper } from "../draw-helper";
import * as Inputs from "../inputs";
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

const named = (root: Object3D, part: string): Object3D[] => {
    const found: Object3D[] = [];
    root.traverse(child => { if (child.name.includes(`-${part}-`)) { found.push(child); } });
    return found;
};
const lettersOf = (root: Object3D): Mesh[] => named(root, "annotationLetters") as Mesh[];
const annotationLinesOf = (root: Object3D): LineSegments2[] => named(root, "annotations").flatMap(group => group.children.filter((child): child is LineSegments2 => child instanceof LineSegments2));
const colouredDocumentMesh = (): Inputs.OCCT.DecomposedMeshDto => ({ ...mockOCCTBoxDecomposedMesh(), colorGroups: { "#ff00004d": [0], "#00ff00": [1] } });
const looksOf = (mesh: Mesh | undefined): [string, number, boolean][] => {
    const worn = mesh === undefined ? [] : Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    return worn.map(material => [`#${(material as MeshPhysicalMaterial).color.getHexString()}`, Math.round((material.transparent ? material.opacity : 1) * 1000) / 1000, material.transparent]);
};
const segmentsOf = (line: LineSegments2): number => line.geometry.attributes["instanceStart"]!.count;

describe("drawing a document's annotations in three.js", () => {
    let scene: Scene;
    let draw: Draw;
    let workerCall: Mock;

    beforeEach(() => {
        const context = new Context();
        scene = new Scene();
        context.scene = scene;
        const jscadWorkerManager = new JSCADWorkerManager();
        const occtWorkerManager = new OCCTWorkerManager();
        const drawHelper = new DrawHelper(context, new JSCADText(jscadWorkerManager), new Vector(new MathBitByBit(), new GeometryHelper()), jscadWorkerManager, new ManifoldWorkerManager(), occtWorkerManager);
        draw = new Draw(drawHelper, context, new Tag(context));
        workerCall = vi.fn((method: string) => Promise.resolve(method === "docToMesh" ? mockOCCTBoxDecomposedMesh() : pmi()));
        occtWorkerManager.genericCallToWorkerPromise = workerCall;
    });

    describe("the annotations themselves", () => {
        it("should draw the lines as one ribbon line and the letters as one unlit, two-sided mesh, both in the annotation color", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctDocumentOptions(), annotations: { annotationColour: "#ff8800" } };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: pmi(), options });

            // Assert
            expect(drawn).toBeInstanceOf(Group);
            expect(drawn.parent).toBe(scene);
            const lines = annotationLinesOf(drawn);
            expect(lines).toHaveLength(1);
            expect(segmentsOf(lines[0]!)).toBe(2 + 1);
            const [letters] = lettersOf(drawn);
            expect(letters!.geometry.attributes["position"]!.count).toBe(8);
            expect(letters!.geometry.index!.count).toBe(8 * 3);
            const material = letters!.material as MeshBasicMaterial;
            expect(material).toBeInstanceOf(MeshBasicMaterial);
            expect(material.side).toBe(DoubleSide);
            expect(material.color.getHexString()).toBe("ff8800");
            expect(drawn.userData["type"]).toBe(Inputs.Draw.drawingTypes.occtAnnotations);
        });

        it("should draw the lines a third of the annotation width wide in pixels", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctDocumentOptions(), annotations: { annotationWidth: 6 } };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: pmi(), options });

            // Assert
            expect(annotationLinesOf(drawn)[0]!.material.linewidth).toBeCloseTo(2, 12);
        });

        it("should outline the letters among the lines, each loop closed, when they are not filled", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctDocumentOptions(), annotations: { annotationsFilled: false } };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: pmi(), options });

            // Assert
            expect(lettersOf(drawn)).toEqual([]);
            expect(segmentsOf(annotationLinesOf(drawn)[0]!)).toBe(2 + 4 + 4 + 1);
        });

        it("should draw only the annotations the named saved view shows", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctDocumentOptions(), annotations: { annotationsView: "FRONT" } };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: pmi(), options });

            // Assert
            expect(segmentsOf(annotationLinesOf(drawn)[0]!)).toBe(1);
            expect(lettersOf(drawn)).toEqual([]);
        });

        it("should refuse a view name no saved view bears, leaving nothing in the scene", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctDocumentOptions(), annotations: { annotationsView: "TOP" } };

            // Act
            const act = draw.drawAnyAsync({ entity: pmi(), options });

            // Assert
            await expect(act).rejects.toThrow(InputError);
            expect(scene.children).toEqual([]);
        });
    });

    describe("an assembly document", () => {
        it("should mesh the document turned from Z-up into Y-up with the options' meshing, as loadSTEPorIGES turns a shape, and not read its annotations unless asked", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctDocumentOptions(), meshing: { precision: 0.05 } };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: DOCUMENT, options });

            // Assert
            expect(workerCall).toHaveBeenCalledTimes(1);
            expect(workerCall).toHaveBeenCalledWith("docToMesh", expect.objectContaining({ document: DOCUMENT, precision: 0.05, upAxis: Inputs.Base.upAxisConversionEnum.zUpToYUp }));
            expect(named(drawn, "annotations")).toEqual([]);
            expect(drawn.userData["type"]).toBe(Inputs.Draw.drawingTypes.occtDocument);
        });

        it("should draw the document's annotations inside its group when asked, reading their curves at the meshing precision", async () => {
            // Arrange
            const options = { ...new Inputs.Draw.DrawOcctDocumentOptions(), meshing: { precision: 0.05 }, drawAnnotations: true };

            // Act
            const drawn = await draw.drawAnyAsync({ entity: DOCUMENT, options });

            // Assert
            expect(workerCall).toHaveBeenCalledWith("assembly.query.getDocumentAnnotations", { document: DOCUMENT, deflection: 0.05, upAxis: Inputs.Base.upAxisConversionEnum.zUpToYUp });
            const [annotations] = named(drawn, "annotations");
            expect(annotations!.parent).toBe(drawn);
            expect(lettersOf(drawn)).toHaveLength(1);
            expect(lettersOf(drawn)[0]!.castShadow).toBe(false);
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

            // Act
            const act = draw.drawAnyAsync({ entity: DOCUMENT, options });

            // Assert
            await expect(act).rejects.toThrow("no saved view of the document is called");
            expect(scene.children).toEqual([]);
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
            const front = named(drawn, "lookedSurface")[0] as Mesh | undefined;
            const back = named(drawn, "backFaceSurfaceChild") as Mesh[];
            expect(looksOf(front)).toEqual([["#c0c0c0", 1, false], ["#ff0000", 0.302, true], ["#00ff00", 1, false]]);
            expect(back).toHaveLength(1);
            expect(looksOf(back[0])).toEqual(looksOf(front));
            expect(back[0]!.geometry.index!.count).toBe(front!.geometry.index!.count);
        });

        it("should draw only the annotations the saved view shows with the options optionsOcctDocument builds", async () => {
            // Arrange
            const options = draw.optionsOcctDocument({ drawAnnotations: true, annotations: draw.optionsAnnotations({ annotationsView: "FRONT" }) });

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
