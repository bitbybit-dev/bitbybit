import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { OCCTWorkerManager } from "../../../occ-worker/occ-worker-manager";
import { OCCTAssemblyManager } from "./manager";
import { AnchorRecord, AnsweringWorker, recordDownloads } from "../../__mocks__/test-helpers";
import { Inputs } from "@bitbybit-dev/occt";

// The three export members and the step loader are hand-written: an export decides whether the
// browser is asked to download what the worker answered with, and the loader turns the file shapes a
// browser hands a caller into something that survives a postMessage. Everything else in the class
// only forwards, and the delegation suite runs those.

const A_DOCUMENT: Inputs.OCCT.TDocStdDocumentPointer = { hash: 1, type: "occ-entity" };

// Every export DTO carries a dozen mesh and format settings that these tests do not touch; each
// starts from the defaults the DTO itself declares and states only what the case is about.
type Pointer = Inputs.OCCT.TDocStdDocumentPointer;
const stepInputs = (over: Partial<Inputs.OCCT.ExportDocumentToStepDto<Pointer>>): Inputs.OCCT.ExportDocumentToStepDto<Pointer> =>
    Object.assign(new Inputs.OCCT.ExportDocumentToStepDto<Pointer>(A_DOCUMENT), over);
const gltfInputs = (over: Partial<Inputs.OCCT.ExportDocumentToGltfDto<Pointer>>): Inputs.OCCT.ExportDocumentToGltfDto<Pointer> =>
    Object.assign(new Inputs.OCCT.ExportDocumentToGltfDto<Pointer>(A_DOCUMENT), over);
const dracoInputs = (over: Partial<Inputs.OCCT.ExportDocumentToGltfWithDracoDto<Pointer>>): Inputs.OCCT.ExportDocumentToGltfWithDracoDto<Pointer> =>
    Object.assign(new Inputs.OCCT.ExportDocumentToGltfWithDracoDto<Pointer>(A_DOCUMENT), over);
const STEP_BYTES = new Uint8Array([1, 2, 3]);
const GLB_BYTES = new Uint8Array([4, 5, 6]);

describe("OCCTAssemblyManager exports", () => {
    let manager: OCCTAssemblyManager;
    let worker: AnsweringWorker;
    let anchors: AnchorRecord[];

    const anchor = (): AnchorRecord => anchors[0] as AnchorRecord;

    beforeEach(() => {
        const workerManager = new OCCTWorkerManager();
        worker = new AnsweringWorker();
        workerManager.setOccWorker(worker);
        worker.answers.set("assembly.manager.exportDocumentToStep", STEP_BYTES);
        worker.answers.set("assembly.manager.exportDocumentToGltf", GLB_BYTES);
        worker.answers.set("assembly.manager.exportDocumentToGltfWithDraco", GLB_BYTES);
        manager = new OCCTAssemblyManager(workerManager);
        anchors = recordDownloads().anchors;
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    describe("exportDocumentToStep", () => {
        it("should hand back the bytes the worker answered with", async () => {
            // Act
            const result = await manager.exportDocumentToStep(stepInputs({ tryDownload: false }));

            // Assert
            expect(result).toBe(STEP_BYTES);
        });

        it("should download nothing when the caller did not ask for it", async () => {
            // Act
            await manager.exportDocumentToStep(stepInputs({ tryDownload: false }));

            // Assert
            expect(anchors).toEqual([]);
        });

        it("should download the file under the name the caller gave", async () => {
            // Act
            await manager.exportDocumentToStep(stepInputs({ fileName: "frame.step", tryDownload: true }));

            // Assert
            expect(anchor().download).toBe("frame.step");
            expect(anchor()).toMatchObject({ clicked: 1, removed: 1, target: "_self" });
        });

        it("should name an uncompressed export itself when the caller gave no name", async () => {
            // Act
            await manager.exportDocumentToStep(stepInputs({ fileName: "", tryDownload: true }));

            // Assert
            expect(anchor().download).toBe("assembly.step");
        });

        it("should name a compressed export with the compressed extension", async () => {
            // Act
            await manager.exportDocumentToStep(stepInputs({ fileName: "", compress: true, tryDownload: true }));

            // Assert
            expect(anchor().download).toBe("assembly.stpZ");
        });
    });

    describe("exportDocumentToGltf", () => {
        it("should hand back the bytes the worker answered with", async () => {
            // Act
            const result = await manager.exportDocumentToGltf(gltfInputs({ tryDownload: false }));

            // Assert
            expect(result).toBe(GLB_BYTES);
        });

        it("should download the file under the name the caller gave", async () => {
            // Act
            await manager.exportDocumentToGltf(gltfInputs({ fileName: "frame.glb", tryDownload: true }));

            // Assert
            expect(anchor().download).toBe("frame.glb");
        });

        it("should name the file itself when the caller gave no name", async () => {
            // Act
            await manager.exportDocumentToGltf(gltfInputs({ fileName: "", tryDownload: true }));

            // Assert
            expect(anchor().download).toBe("assembly.glb");
        });

        it("should download nothing when the caller did not ask for it", async () => {
            // Act
            await manager.exportDocumentToGltf(gltfInputs({ tryDownload: false }));

            // Assert
            expect(anchors).toEqual([]);
        });
    });

    describe("exportDocumentToGltfWithDraco", () => {
        it("should hand back the bytes the worker answered with", async () => {
            // Act
            const result = await manager.exportDocumentToGltfWithDraco(dracoInputs({ tryDownload: false }));

            // Assert
            expect(result).toBe(GLB_BYTES);
        });

        it("should download the file under the name the caller gave", async () => {
            // Act
            await manager.exportDocumentToGltfWithDraco(dracoInputs({ fileName: "frame.glb", tryDownload: true }));

            // Assert
            expect(anchor().download).toBe("frame.glb");
        });

        it("should name the file itself when the caller gave no name", async () => {
            // Act
            await manager.exportDocumentToGltfWithDraco(dracoInputs({ fileName: "", tryDownload: true }));

            // Assert
            expect(anchor().download).toBe("assembly.glb");
        });

        it("should download nothing when the caller did not ask for it", async () => {
            // Act
            await manager.exportDocumentToGltfWithDraco(dracoInputs({ tryDownload: false }));

            // Assert
            expect(anchors).toEqual([]);
        });
    });
});

describe("OCCTAssemblyManager loadStepToDoc", () => {
    let manager: OCCTAssemblyManager;
    let worker: AnsweringWorker;

    const sentInputs = (): { stepData?: unknown } => worker.posted[0]?.action.inputs as { stepData?: unknown };

    beforeEach(() => {
        const workerManager = new OCCTWorkerManager();
        worker = new AnsweringWorker();
        workerManager.setOccWorker(worker);
        manager = new OCCTAssemblyManager(workerManager);
    });

    it("should post the load path", async () => {
        // Act
        await manager.loadStepToDoc({ stepData: "ISO-10303-21;" });

        // Assert
        expect(worker.paths()).toEqual(["assembly.manager.loadStepToDoc"]);
    });

    it("should send step text through as it stands", async () => {
        // Act
        await manager.loadStepToDoc({ stepData: "ISO-10303-21;" });

        // Assert
        expect(sentInputs().stepData).toBe("ISO-10303-21;");
    });

    it("should send a File as the bytes it holds", async () => {
        // Arrange
        const file = new File([STEP_BYTES], "part.step");

        // Act
        await manager.loadStepToDoc({ stepData: file });

        // Assert
        expect(sentInputs().stepData).toEqual(STEP_BYTES);
    });
});
