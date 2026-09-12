// Hand-written members of the generated class of the same name (see scripts/gen-worker-api.mjs).
// Each member's marker says where it lands: `// replaces <path>` takes the kernel method's slot (and its doc,
// when the member has none), `// after <path>` follows that slot, `// first` and `// last` frame the class.
import { Inputs } from "@bitbybit-dev/occt";
import { OCCTWorkerManager } from "../../../occ-worker/occ-worker-manager";

export class OCCTAssemblyManager {
    constructor(private readonly occWorkerManager: OCCTWorkerManager) { }

    // replaces assembly.manager.loadStepToDoc
    async loadStepToDoc(inputs: Inputs.OCCT.LoadStepToDocDto): Promise<Inputs.OCCT.TDocStdDocumentPointer> {
        // Convert File/Blob to ArrayBuffer before sending to worker
        const stepData = await this.occWorkerManager.prepareStepData(inputs.stepData);
        const preparedInputs = {
            ...inputs,
            stepData
        };
        return this.occWorkerManager.genericCallToWorkerPromise("assembly.manager.loadStepToDoc", preparedInputs);
    }

    // replaces assembly.manager.exportDocumentToStep
    async exportDocumentToStep(inputs: Inputs.OCCT.ExportDocumentToStepDto<Inputs.OCCT.TDocStdDocumentPointer>): Promise<Uint8Array> {
        return this.occWorkerManager.genericCallToWorkerPromise<Uint8Array>("assembly.manager.exportDocumentToStep", inputs).then((s: Uint8Array) => {
            if (inputs.tryDownload && typeof document !== "undefined") {
                const blob = new Blob([s.buffer as ArrayBuffer], { type: "application/step" });
                const blobUrl = URL.createObjectURL(blob);

                const fileName = inputs.fileName || (inputs.compress ? "assembly.stpZ" : "assembly.step");

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
        return this.occWorkerManager.genericCallToWorkerPromise<Uint8Array>("assembly.manager.exportDocumentToGltf", inputs).then((s: Uint8Array) => {
            if (inputs.tryDownload && typeof document !== "undefined") {
                const blob = new Blob([s.buffer as ArrayBuffer], { type: "model/gltf-binary" });
                const blobUrl = URL.createObjectURL(blob);

                const fileName = inputs.fileName || "assembly.glb";

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
        return this.occWorkerManager.genericCallToWorkerPromise<Uint8Array>("assembly.manager.exportDocumentToGltfWithDraco", inputs).then((s: Uint8Array) => {
            if (inputs.tryDownload && typeof document !== "undefined") {
                const blob = new Blob([s.buffer as ArrayBuffer], { type: "model/gltf-binary" });
                const blobUrl = URL.createObjectURL(blob);

                const fileName = inputs.fileName || "assembly.glb";

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
