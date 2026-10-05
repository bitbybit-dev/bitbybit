import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { OCCTWorkerManager } from "../../../occ-worker/occ-worker-manager";
import { OCCTAssemblyManager } from "./manager";
import type { AnchorRecord } from "../../__mocks__/test-helpers";
import { AnsweringWorker, recordDownloads } from "../../__mocks__/test-helpers";
import type { Models } from "@bitbybit-dev/occt";
import { Inputs } from "@bitbybit-dev/occt";

const A_DOCUMENT: Inputs.OCCT.TDocStdDocumentPointer = { hash: 1, type: "occ-entity" };
const OBJ_FILES: Models.OCCT.ObjFiles = { obj: "mtllib frame.mtl\ng frame\nv 0 0 0\n", mtl: "newmtl red\nKd 1 0 0\n" };
const PLY_TEXT = "ply";

describe("OCCTAssemblyManager hand-written file members", () => {
    let manager: OCCTAssemblyManager;
    let worker: AnsweringWorker;
    let anchors: AnchorRecord[];
    let blobs: Blob[];

    const sentInputs = (): Record<string, unknown> => worker.posted[0]?.action.inputs as Record<string, unknown>;

    beforeEach(() => {
        const workerManager = new OCCTWorkerManager();
        worker = new AnsweringWorker();
        workerManager.setOccWorker(worker);
        worker.answers.set("assembly.manager.exportDocumentToObj", OBJ_FILES);
        worker.answers.set("assembly.manager.exportDocumentToPly", PLY_TEXT);
        manager = new OCCTAssemblyManager(workerManager);
        const recorded = recordDownloads();
        anchors = recorded.anchors;
        blobs = recorded.blobs;
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    describe("loadGltfToDoc", () => {
        it("should send a File as the bytes it holds", async () => {
            // Arrange
            const file = new File([new Uint8Array([103, 108, 84, 70])], "part.glb");

            // Act
            await manager.loadGltfToDoc({ gltfData: file });

            // Assert
            expect(worker.paths()).toEqual(["assembly.manager.loadGltfToDoc"]);
            expect(sentInputs()["gltfData"]).toEqual(new Uint8Array([103, 108, 84, 70]));
        });

        it("should send glTF text as it stands", async () => {
            // Act
            await manager.loadGltfToDoc({ gltfData: "{\"asset\":{\"version\":\"2.0\"}}" });

            // Assert
            expect(sentInputs()["gltfData"]).toBe("{\"asset\":{\"version\":\"2.0\"}}");
        });
    });

    describe("loadObjToDoc", () => {
        it("should send a Blob as the bytes it holds", async () => {
            // Arrange
            const blob = new Blob(["v 0 0 0\n"]);

            // Act
            await manager.loadObjToDoc({ objData: blob });

            // Assert
            expect(worker.paths()).toEqual(["assembly.manager.loadObjToDoc"]);
            expect(sentInputs()["objData"]).toEqual(new TextEncoder().encode("v 0 0 0\n"));
        });
    });

    describe("exportDocumentToObj", () => {
        it("should hand back both texts and download nothing by the default of its DTO", async () => {
            // Act
            const result = await manager.exportDocumentToObj({ document: A_DOCUMENT });

            // Assert
            expect(result).toEqual(OBJ_FILES);
            expect(anchors).toEqual([]);
            expect(sentInputs()).toEqual({ ...new Inputs.OCCT.ExportDocumentToObjDto(A_DOCUMENT) });
        });

        it("should download the OBJ file and its material library under the name its mtllib line gives", async () => {
            // Act
            await manager.exportDocumentToObj({ document: A_DOCUMENT, fileName: "frame.obj", tryDownload: true });

            // Assert
            expect(anchors.map(anchor => anchor.download)).toEqual(["frame.obj", "frame.mtl"]);
            await expect(blobs[0]!.text()).resolves.toBe(OBJ_FILES.obj);
            await expect(blobs[1]!.text()).resolves.toBe(OBJ_FILES.mtl);
        });

        it("should download the OBJ file alone when the document has no colors", async () => {
            // Arrange
            worker.answers.set("assembly.manager.exportDocumentToObj", { obj: "g frame\n", mtl: "" });

            // Act
            await manager.exportDocumentToObj({ document: A_DOCUMENT, tryDownload: true });

            // Assert
            expect(anchors.map(anchor => anchor.download)).toEqual(["assembly.obj"]);
        });
    });

    describe("exportDocumentToPly", () => {
        it("should hand back the text and download nothing by the default of its DTO", async () => {
            // Act
            const result = await manager.exportDocumentToPly({ document: A_DOCUMENT });

            // Assert
            expect(result).toBe(PLY_TEXT);
            expect(anchors).toEqual([]);
        });

        it("should download the text under the name the caller gave", async () => {
            // Act
            await manager.exportDocumentToPly({ document: A_DOCUMENT, fileName: "frame.ply", tryDownload: true });

            // Assert
            expect(anchors.map(anchor => anchor.download)).toEqual(["frame.ply"]);
            await expect(blobs[0]!.text()).resolves.toBe(PLY_TEXT);
        });
    });

    describe("without a document to download into", () => {
        it("should hand back the text and start no download", async () => {
            // Arrange
            vi.unstubAllGlobals();

            // Act
            const result = await manager.exportDocumentToPly({ document: A_DOCUMENT, tryDownload: true });

            // Assert
            expect(result).toBe(PLY_TEXT);
            expect(anchors).toEqual([]);
        });
    });
});
