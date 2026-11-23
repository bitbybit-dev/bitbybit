import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { BitbybitOcctModule, Handle_TDocStd_Document } from "@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt";
import initOpenCascade from "@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt";
import { Inputs, OccHelper, OCCTService } from "@bitbybit-dev/occt";
import type { CacheHelper } from "./cache-helper";
import type { DataInput } from "./occ-worker";
import { initializationComplete, onMessageInput } from "./occ-worker";
import { OCCTWorkerManager } from "./occ-worker-manager";
import { DOCUMENT_READING_FUNCTIONS, ReservedFunctions } from "./constants";
import { OCCT } from "../api/occt/occt";

type Document = Inputs.OCCT.TDocStdDocumentPointer;
type Read = (document: Document, label: string) => Promise<unknown>;

const FILE_STAMP = /FILE_NAME\([^;]*;/g;
const USAGE_OCCURRENCE_ID = /NEXT_ASSEMBLY_USAGE_OCCURRENCE\('[^']*'/g;

class KernelWorker extends EventTarget implements Worker {
    onmessage: Worker["onmessage"] = null;
    onmessageerror: Worker["onmessageerror"] = null;
    onerror: Worker["onerror"] = null;

    postMessage(message: DataInput): void {
        onMessageInput(structuredClone(message), (data: unknown) => {
            this.onmessage?.({ data: structuredClone(data) } as MessageEvent);
        });
    }

    terminate(): void {
        this.onmessage = null;
    }
}

describe("the calls that only read an assembly document", () => {
    let kernel: BitbybitOcctModule;
    let cacheHelper: CacheHelper;
    let occt: OCCT;
    let direct: OCCTService;

    beforeAll(async () => {
        kernel = await initOpenCascade();
        direct = new OCCTService(kernel, new OccHelper(kernel));
        cacheHelper = initializationComplete(kernel, undefined, true);
        const manager = new OCCTWorkerManager();
        manager.setOccWorker(new KernelWorker());
        manager.setDocumentReferences("exact");
        occt = new OCCT(manager);
    });

    afterAll(() => {
        cacheHelper.cleanAllCache();
    });

    const readers: ReadonlyMap<string, Read> = new Map<string, Read>([
        [ReservedFunctions.DOC_TO_MESH, document => occt.docToMesh({ document })],
        [ReservedFunctions.DOC_TO_MESHES, document => occt.docToMeshes({ document })],
        ["assembly.manager.exportDocumentToStep", document => occt.assembly.manager.exportDocumentToStep({ document, fileName: "read.step", author: "", organization: "", compress: false, tryDownload: false })],
        ["assembly.manager.exportDocumentToGltf", document => occt.assembly.manager.exportDocumentToGltf({ document, fileName: "read.glb", tryDownload: false })],
        ["assembly.manager.exportDocumentToGltfWithDraco", document => occt.assembly.manager.exportDocumentToGltfWithDraco({ document, fileName: "read.glb", tryDownload: false })],
        ["assembly.manager.exportDocumentToObj", document => occt.assembly.manager.exportDocumentToObj({ document, fileName: "read.obj", tryDownload: false })],
        ["assembly.manager.exportDocumentToPly", document => occt.assembly.manager.exportDocumentToPly({ document, fileName: "read.ply", tryDownload: false })],
        ["assembly.query.getDocumentParts", document => occt.assembly.query.getDocumentParts({ document })],
        ["assembly.query.getShapeFromLabel", (document, label) => occt.assembly.query.getShapeFromLabel({ document, label })],
        ["assembly.query.getLabelColor", (document, label) => occt.assembly.query.getLabelColor({ document, label })],
        ["assembly.query.getLabelTransform", (document, label) => occt.assembly.query.getLabelTransform({ document, label })],
        ["assembly.query.getLabelInfo", (document, label) => occt.assembly.query.getLabelInfo({ document, label })],
        ["assembly.query.getAssemblyHierarchy", document => occt.assembly.query.getAssemblyHierarchy({ document })],
        ["assembly.query.getDocumentPmi", document => occt.assembly.query.getDocumentPmi({ document })],
        ["assembly.query.getDocumentAnnotations", document => occt.assembly.query.getDocumentAnnotations({ document })],
    ]);

    const fingerprint = (document: Handle_TDocStd_Document): string => {
        const step = new TextDecoder().decode(direct.assembly.manager.exportDocumentToStep({ document, fileName: "fingerprint.step", author: "", organization: "", compress: false }))
            .replace(FILE_STAMP, "")
            .replace(USAGE_OCCURRENCE_ID, "");
        return [
            step,
            JSON.stringify(direct.assembly.query.getDocumentPmi({ document })),
            JSON.stringify(direct.assembly.query.getAssemblyHierarchy({ document })),
            JSON.stringify(direct.assembly.query.getDocumentParts({ document })),
        ].join("\n");
    };

    const documentWithPmi = async (): Promise<{ document: Document; label: string }> => {
        const box = await occt.shapes.solid.createBox({ width: 10, length: 10, height: 10, center: [0, 0, 0] });
        const part = await occt.assembly.manager.createPart({ id: "box", shape: box, name: "Box", colorRgba: { r: 0.2, g: 0.4, b: 0.6, a: 1 } });
        const node = await occt.assembly.manager.createInstanceNode({ id: "n", partId: "box", name: "Box 1", translation: [1, 2, 3] });
        const made = await occt.assembly.manager.buildAssemblyDocument({ structure: await occt.assembly.manager.combineStructure({ parts: [part], nodes: [node], clearDocument: false }) });
        const label = (await occt.assembly.query.getDocumentParts({ document: made })).find(entry => entry.type === "part")!.label;
        const face = (index: number): Inputs.OCCT.PmiShapeDto[] => [{ part: label, kind: Inputs.OCCT.pmiShapeKindEnum.face, index }];
        const document = await occt.assembly.manager.addDocumentPmi({
            document: made,
            dimensions: [{ type: Inputs.OCCT.pmiDimensionTypeEnum.linearDistance, value: 10, shapeRefs: face(5), otherShapeRefs: face(4) }],
            datums: [{ letter: "A", shapeRefs: face(4) }],
            tolerances: [{ type: Inputs.OCCT.pmiToleranceTypeEnum.perpendicularity, value: 0.05, shapeRefs: face(1), datumLetters: ["A"] }],
        });
        return { document, label };
    };

    it("should name a reading of its own here for every call the worker declares as reading a document", () => {
        expect([...readers.keys()].sort()).toEqual([...DOCUMENT_READING_FUNCTIONS].sort());
    });

    it("should leave the document's STEP text, PMI, hierarchy and parts as they were, for every call that reads it", async () => {
        // Arrange
        const { document, label } = await documentWithPmi();
        const handle = (): Handle_TDocStd_Document => cacheHelper.documentAt(document.hash) as Handle_TDocStd_Document;
        const asMade = fingerprint(handle());

        // Act
        const changedBy: string[] = [];
        for (const [path, read] of readers) {
            await read(document, label);
            if (fingerprint(handle()) !== asMade) {
                changedBy.push(path);
            }
        }

        // Assert
        expect(changedBy).toEqual([]);
        expect(JSON.parse(asMade.split("\n").at(-3)!)).toMatchObject({ dimensions: [{ value: 10 }], datums: [{ letter: "A" }] });
    });
});
