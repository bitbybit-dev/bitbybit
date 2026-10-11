import { Inputs } from "@bitbybit-dev/occt";
import type { Models } from "@bitbybit-dev/occt";
import type { Resolved } from "@bitbybit-dev/occt";
import { resolveDto } from "@bitbybit-dev/base";
import type { OCCTWorkerManager } from "../../../occ-worker/occ-worker-manager";

export class OCCTAssemblyManager {
    constructor(private readonly occWorkerManager: OCCTWorkerManager) { }

    // replaces assembly.manager.loadStepToDoc
    async loadStepToDoc(inputs: Inputs.OCCT.LoadStepToDocDto): Promise<Inputs.OCCT.TDocStdDocumentPointer> {
        const stepData = await this.occWorkerManager.prepareStepData(inputs.stepData);
        const preparedInputs = {
            ...inputs,
            stepData
        };
        return this.occWorkerManager.genericCallToWorkerPromise("assembly.manager.loadStepToDoc", preparedInputs);
    }

    // replaces assembly.manager.loadGltfToDoc
    async loadGltfToDoc(inputs: Inputs.OCCT.LoadGltfToDocDto): Promise<Inputs.OCCT.TDocStdDocumentPointer> {
        const gltfData = await this.occWorkerManager.prepareStepData(inputs.gltfData);
        return this.occWorkerManager.genericCallToWorkerPromise("assembly.manager.loadGltfToDoc", { ...inputs, gltfData });
    }

    // replaces assembly.manager.loadObjToDoc
    async loadObjToDoc(inputs: Inputs.OCCT.LoadObjToDocDto): Promise<Inputs.OCCT.TDocStdDocumentPointer> {
        const objData = await this.occWorkerManager.prepareStepData(inputs.objData);
        return this.occWorkerManager.genericCallToWorkerPromise("assembly.manager.loadObjToDoc", { ...inputs, objData });
    }

    // replaces assembly.manager.exportDocumentToObj
    async exportDocumentToObj(inputs: Inputs.OCCT.ExportDocumentToObjDto<Inputs.OCCT.TDocStdDocumentPointer>): Promise<Models.OCCT.ObjFiles> {
        const resolved = resolveDto(Inputs.OCCT.ExportDocumentToObjDto, inputs) as Resolved.OCCT.ExportDocumentToObjDto<Inputs.OCCT.TDocStdDocumentPointer>;
        const files = await this.occWorkerManager.genericCallToWorkerPromise<Models.OCCT.ObjFiles>("assembly.manager.exportDocumentToObj", resolved);
        if (resolved.tryDownload) {
            this.downloadFile(files.obj, resolved.fileName, "model/obj");
            const library = /^mtllib (.+)$/m.exec(files.obj)?.[1]?.trim();
            if (library !== undefined && files.mtl !== "") {
                this.downloadFile(files.mtl, library, "model/mtl");
            }
        }
        return files;
    }

    // replaces assembly.manager.exportDocumentToPly
    async exportDocumentToPly(inputs: Inputs.OCCT.ExportDocumentToPlyDto<Inputs.OCCT.TDocStdDocumentPointer>): Promise<string> {
        const resolved = resolveDto(Inputs.OCCT.ExportDocumentToPlyDto, inputs) as Resolved.OCCT.ExportDocumentToPlyDto<Inputs.OCCT.TDocStdDocumentPointer>;
        const text = await this.occWorkerManager.genericCallToWorkerPromise<string>("assembly.manager.exportDocumentToPly", resolved);
        if (resolved.tryDownload) {
            this.downloadFile(text, resolved.fileName, "text/plain");
        }
        return text;
    }

    // after assembly.manager.exportDocumentToPly
    private downloadFile(content: string, fileName: string, type: string): void {
        if (typeof document === "undefined") {
            return;
        }
        const blob = new Blob([content], { type });
        const fileLink = document.createElement("a");
        fileLink.href = URL.createObjectURL(blob);
        fileLink.target = "_self";
        fileLink.download = fileName;
        fileLink.click();
        fileLink.remove();
    }

    // replaces assembly.manager.exportDocumentToStep
    async exportDocumentToStep(inputs: Inputs.OCCT.ExportDocumentToStepDto<Inputs.OCCT.TDocStdDocumentPointer>): Promise<Uint8Array> {
        const resolved = resolveDto(Inputs.OCCT.ExportDocumentToStepDto, inputs) as Resolved.OCCT.ExportDocumentToStepDto<Inputs.OCCT.TDocStdDocumentPointer>;
        return this.occWorkerManager.genericCallToWorkerPromise<Uint8Array>("assembly.manager.exportDocumentToStep", resolved).then((s: Uint8Array) => {
            if (resolved.tryDownload && typeof document !== "undefined") {
                const blob = new Blob([s.buffer as ArrayBuffer], { type: "application/step" });
                const blobUrl = URL.createObjectURL(blob);

                const fileName = resolved.compress && resolved.fileName === new Inputs.OCCT.ExportDocumentToStepDto().fileName ? "assembly.stpZ" : resolved.fileName;

                const fileLink = document.createElement("a");
                fileLink.href = blobUrl;
                fileLink.target = "_self";
                fileLink.download = fileName;
                fileLink.click();
                fileLink.remove();
            }
            return s;
        });
    }

    // replaces assembly.manager.exportDocumentToGltf
    async exportDocumentToGltf(inputs: Inputs.OCCT.ExportDocumentToGltfDto<Inputs.OCCT.TDocStdDocumentPointer>): Promise<Uint8Array> {
        const resolved = resolveDto(Inputs.OCCT.ExportDocumentToGltfDto, inputs) as Resolved.OCCT.ExportDocumentToGltfDto<Inputs.OCCT.TDocStdDocumentPointer>;
        return this.occWorkerManager.genericCallToWorkerPromise<Uint8Array>("assembly.manager.exportDocumentToGltf", resolved).then((s: Uint8Array) => {
            if (resolved.tryDownload && typeof document !== "undefined") {
                const blob = new Blob([s.buffer as ArrayBuffer], { type: "model/gltf-binary" });
                const blobUrl = URL.createObjectURL(blob);

                const fileName = resolved.fileName;

                const fileLink = document.createElement("a");
                fileLink.href = blobUrl;
                fileLink.target = "_self";
                fileLink.download = fileName;
                fileLink.click();
                fileLink.remove();
            }
            return s;
        });
    }

    // replaces assembly.manager.exportDocumentToGltfWithDraco
    async exportDocumentToGltfWithDraco(inputs: Inputs.OCCT.ExportDocumentToGltfWithDracoDto<Inputs.OCCT.TDocStdDocumentPointer>): Promise<Uint8Array> {
        const resolved = resolveDto(Inputs.OCCT.ExportDocumentToGltfWithDracoDto, inputs) as Resolved.OCCT.ExportDocumentToGltfWithDracoDto<Inputs.OCCT.TDocStdDocumentPointer>;
        return this.occWorkerManager.genericCallToWorkerPromise<Uint8Array>("assembly.manager.exportDocumentToGltfWithDraco", resolved).then((s: Uint8Array) => {
            if (resolved.tryDownload && typeof document !== "undefined") {
                const blob = new Blob([s.buffer as ArrayBuffer], { type: "model/gltf-binary" });
                const blobUrl = URL.createObjectURL(blob);

                const fileName = resolved.fileName;

                const fileLink = document.createElement("a");
                fileLink.href = blobUrl;
                fileLink.target = "_self";
                fileLink.download = fileName;
                fileLink.click();
                fileLink.remove();
            }
            return s;
        });
    }

    // last
    /**
     * Deletes an assembly document and frees the memory it holds.
     *
     * A document built with `buildAssemblyDocument` or loaded with `loadStepToDoc` stays in memory
     * until this is called, so delete it once its shapes and exports have been read.
     * @param inputs - The document to delete
     * @returns Nothing; the document handle is no longer valid afterwards
     * @group lifecycle
     * @shortname delete document
     * @drawable false
     * @example
     * ```typescript
     * const doc = await bitbybit.occt.assembly.manager.buildAssemblyDocument({ structure });
     * const glb = await bitbybit.occt.assembly.manager.exportDocumentToGltf({ document: doc, meshDeflection: 0.1, meshAngle: 0.5, internalVerticesMode: false, controlSurfaceDeflection: false, mergeFaces: false, forceUVExport: false, fileName: "assembly.glb", tryDownload: false });
     * await bitbybit.occt.assembly.manager.deleteDocument({ document: doc });
     * ```
     */
    async deleteDocument(inputs: Inputs.OCCT.DocumentQueryDto<Inputs.OCCT.TDocStdDocumentPointer>): Promise<void> {
        return this.occWorkerManager.genericCallToWorkerPromise("deleteDocument", inputs);
    }
}
