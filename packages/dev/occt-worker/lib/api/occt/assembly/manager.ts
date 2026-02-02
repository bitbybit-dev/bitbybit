import { Inputs } from "@bitbybit-dev/occt";
import { Models } from "@bitbybit-dev/occt";
import { OCCTWorkerManager } from "../../../occ-worker/occ-worker-manager";

/**
 * OCCT Assembly Manager for creating and managing assembly documents.
 * 
 * This class provides a document-based API for:
 * - Creating parts and structure definitions (helper methods for visual programming)
 * - Building assembly documents from structure definitions
 * - Querying document parts, shapes, colors, and transforms
 * - Modifying document labels (color, name)
 * - Exporting to STEP and glTF formats
 * - Document lifecycle management
 * 
 * Note: All methods work with document handles directly. The document stays
 * in worker memory until explicitly deleted with deleteDocument().
 */
export class OCCTAssemblyManager {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }

    // =====================================================
    // Part and Structure Definition Helpers
    // These are local helper methods for visual programming
    // =====================================================

    /**
     * Create a part definition for use in assembly structures.
     * This is a helper for visual programming - it simply wraps the inputs into a part object.
     * 
     * @param inputs - Part details including id, shape, name, and optional color
     * @returns Part definition that can be added to an assembly structure
     * @group assembly
     * @shortname create part
     * @drawable false
     * 
     * @example
     * ```typescript
     * const box = await occt.shapes.solid.createBox({ width: 10, length: 10, height: 10 });
     * const part = await occt.assembly.manager.createPart({ id: "box", shape: box, name: "Box", color: { r: 1, g: 0, b: 0, a: 1 } });
     * ```
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async createPart(inputs: Inputs.OCCT.CreateAssemblyPartDto<any>): Promise<Models.OCCT.AssemblyPartDef<any>> {
        return this.occWorkerManager.genericCallToWorkerPromise("assembly.manager.createPart", inputs);
    }

    /**
     * Create an assembly node definition (a container for other nodes).
     * Assembly nodes group instances and other assemblies together in the hierarchy.
     * 
     * @param inputs - Assembly node details including id, name, and optional parent
     * @returns Node definition that can be added to an assembly structure
     * @group assembly
     * @shortname create assembly node
     * @drawable false
     * 
     * @example
     * ```typescript
     * const rootAsm = await occt.assembly.manager.createAssemblyNode({ id: "root", name: "Root Assembly" });
     * const subAsm = await occt.assembly.manager.createAssemblyNode({ id: "sub", name: "Sub Assembly", parentId: "root" });
     * ```
     */
    async createAssemblyNode(inputs: Inputs.OCCT.CreateAssemblyNodeDto): Promise<Models.OCCT.AssemblyNodeDef> {
        return this.occWorkerManager.genericCallToWorkerPromise("assembly.manager.createAssemblyNode", inputs);
    }

    /**
     * Create an instance node definition (a reference to a part with transform).
     * Instance nodes place a part at a specific location with optional translation, rotation, and scale.
     * 
     * @param inputs - Instance node details including id, partId, name, and transform
     * @returns Node definition that can be added to an assembly structure
     * @group assembly
     * @shortname create instance node
     * @drawable false
     * 
     * @example
     * ```typescript
     * const inst1 = await occt.assembly.manager.createInstanceNode({ id: "box1", partId: "box", name: "Box 1" });
     * const inst2 = await occt.assembly.manager.createInstanceNode({ 
     *     id: "box2", partId: "box", name: "Box 2", 
     *     translation: [20, 0, 0], rotation: [0, 0, 45] 
     * });
     * ```
     */
    async createInstanceNode(inputs: Inputs.OCCT.CreateInstanceNodeDto): Promise<Models.OCCT.AssemblyNodeDef> {
        return this.occWorkerManager.genericCallToWorkerPromise("assembly.manager.createInstanceNode", inputs);
    }

    /**
     * Create a part update definition for modifying an existing part in a document.
     * Part updates can change the shape, name, and/or color of an existing part.
     * 
     * @param inputs - Update details including label and optional new shape/name/color
     * @returns Part update definition that can be added to an assembly structure's partUpdates array
     * @group assembly
     * @shortname create part update
     * @drawable false
     * 
     * @example
     * ```typescript
     * // Get existing parts from document
     * const parts = await occt.assembly.query.getDocumentParts({ document });
     * 
     * // Create a new shape to replace the old one
     * const newBox = await occt.shapes.solid.createBox({ width: 20, length: 20, height: 20 });
     * 
     * // Create an update definition
     * const update = await occt.assembly.manager.createPartUpdate({ 
     *     label: parts[0].label, 
     *     shape: newBox,
     *     name: "Bigger Box",
     *     colorRgba: { r: 0, g: 1, b: 0, a: 1 }
     * });
     * 
     * // Combine with structure and rebuild
     * const structure = await occt.assembly.manager.combineStructure({ parts: [], nodes: [], partUpdates: [update] });
     * await occt.assembly.manager.buildAssemblyDocument({ structure, existingDocument: document });
     * ```
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async createPartUpdate(inputs: Inputs.OCCT.CreatePartUpdateDto<any>): Promise<Models.OCCT.AssemblyPartUpdateDef<any>> {
        return this.occWorkerManager.genericCallToWorkerPromise("assembly.manager.createPartUpdate", inputs);
    }

    /**
     * Combine parts and nodes into a complete assembly structure definition.
     * This is the final step before calling buildAssemblyDocument.
     * 
     * @param inputs - Lists of parts and nodes to combine
     * @returns Complete assembly structure ready for building
     * @group assembly
     * @shortname combine structure
     * @drawable false
     * 
     * @example
     * ```typescript
     * const parts = [part1, part2];
     * const nodes = [rootAsm, inst1, inst2];
     * const structure = await occt.assembly.manager.combineStructure({ parts, nodes });
     * const result = await occt.assembly.manager.buildAssemblyDocument({ structure });
     * ```
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async combineStructure(inputs: Inputs.OCCT.CombineAssemblyStructureDto<any>): Promise<Models.OCCT.AssemblyStructureDef<any>> {
        return this.occWorkerManager.genericCallToWorkerPromise("assembly.manager.combineStructure", inputs);
    }

    // =====================================================
    // Document Building
    // =====================================================

    /**
     * Build an assembly document from a structure definition.
     * Returns the document handle directly - document stays in worker memory.
     * 
     * This is the recommended approach for creating assemblies:
     * 1. Define parts with shapes, names, and optional colors
     * 2. Define nodes (assemblies and instances) with hierarchy and transforms
     * 3. Call this method to create the document
     * 4. Query the document or export to STEP/glTF
     * 5. Call deleteDocument() to release memory when done
     * 
     * If existingDocument is provided and valid, the document will be cleared and 
     * updated instead of creating a new one. This is useful for updating an assembly
     * without allocating a new document each time.
     * 
     * @param inputs - Assembly structure definition and optional existing document
     * @returns The document handle (reference to worker-side document, new or updated)
     * @throws Error if assembly building fails
     * @group assembly
     * @shortname build document
     * @drawable false
     * 
     * @example
     * ```typescript
     * // Create new document
     * const structure = await occt.assembly.manager.combineStructure({ parts, nodes });
     * const document = await occt.assembly.manager.buildAssemblyDocument({ structure });
     * 
     * // Update existing document (reuses same handle)
     * const updatedStructure = await occt.assembly.manager.combineStructure({ parts: newParts, nodes: newNodes });
     * await occt.assembly.manager.buildAssemblyDocument({ structure: updatedStructure, existingDocument: document });
     * 
     * // Cleanup
     * await occt.assembly.manager.deleteDocument({ document });
     * ```
     */
    async buildAssemblyDocument(inputs: Inputs.OCCT.BuildAssemblyDocumentDto<Inputs.OCCT.TopoDSShapePointer, Inputs.OCCT.TDocStdDocumentPointer>): Promise<Inputs.OCCT.TDocStdDocumentPointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("assembly.manager.buildAssemblyDocument", inputs);
    }

    /**
     * Load a STEP file into a new assembly document.
     * Supports both regular STEP and gzip-compressed STEP-Z.
     * 
     * @param inputs - STEP file data (as string, ArrayBuffer, Uint8Array, File, or Blob)
     * @returns The document handle (reference to worker-side document)
     * @throws Error if STEP loading fails
     * @group assembly
     * @shortname load STEP to document
     * @drawable false
     * 
     * @example
     * ```typescript
     * const stepData = await fetch("model.step").then(r => r.text());
     * const document = await occt.assembly.manager.loadStepToDoc({ stepData });
     * const parts = await occt.assembly.query.getDocumentParts({ document });
     * console.log("Found parts:", parts);
     * ```
     */
    async loadStepToDoc(inputs: Inputs.OCCT.LoadStepToDocDto): Promise<Inputs.OCCT.TDocStdDocumentPointer> {
        // Convert File/Blob to ArrayBuffer before sending to worker
        const stepData = await this.occWorkerManager.prepareStepData(inputs.stepData);
        const preparedInputs = {
            ...inputs,
            stepData
        };
        return this.occWorkerManager.genericCallToWorkerPromise("assembly.manager.loadStepToDoc", preparedInputs);
    }

    // =====================================================
    // Document Modification
    // =====================================================

    /**
     * Set the color of a label in the document.
     * Colors are preserved when exporting to STEP and other formats.
     * 
     * @param inputs - Document, label, and RGBA color values
     * @returns true on success, false on failure
     * @group modify
     * @shortname set label color
     * @drawable false
     * 
     * @example
     * ```typescript
     * const success = await occt.assembly.manager.setDocLabelColor({ 
     *     document, 
     *     label: "0:1:1:1",
     *     r: 255, g: 0, b: 0, a: 255
     * });
     * ```
     */
    async setDocLabelColor(inputs: Inputs.OCCT.SetDocLabelColorDto<Inputs.OCCT.TDocStdDocumentPointer>): Promise<boolean> {
        return this.occWorkerManager.genericCallToWorkerPromise("assembly.manager.setDocLabelColor", inputs);
    }

    /**
     * Set or change the name of a label (part, instance, or assembly).
     * 
     * @param inputs - Document, label, and new name
     * @returns true on success, false on failure
     * @group modify
     * @shortname set label name
     * @drawable false
     * 
     * @example
     * ```typescript
     * const success = await occt.assembly.manager.setDocLabelName({ 
     *     document, 
     *     label: "0:1:1:1",
     *     name: "Updated Part Name"
     * });
     * ```
     */
    async setDocLabelName(inputs: Inputs.OCCT.SetDocLabelNameDto<Inputs.OCCT.TDocStdDocumentPointer>): Promise<boolean> {
        return this.occWorkerManager.genericCallToWorkerPromise("assembly.manager.setDocLabelName", inputs);
    }

    // =====================================================
    // Document Export
    // =====================================================

    /**
     * Export an assembly document to STEP format.
     * 
     * @param inputs - Export options including document, fileName, author, organization
     * @returns STEP file content as Uint8Array
     * @group export
     * @shortname export document STEP
     * @drawable false
     * 
     * @example
     * ```typescript
     * const document = await occt.assembly.manager.buildAssemblyDocument({ structure });
     * const stepData = await occt.assembly.manager.exportDocumentToStep({
     *     document,
     *     fileName: "my-assembly.step",
     *     author: "John Doe",
     *     tryDownload: true
     * });
     * ```
     */
    async exportDocumentToStep(inputs: Inputs.OCCT.ExportDocumentToStepDto<Inputs.OCCT.TDocStdDocumentPointer>): Promise<Uint8Array> {
        return this.occWorkerManager.genericCallToWorkerPromise("assembly.manager.exportDocumentToStep", inputs).then((s: Uint8Array) => {
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

    /**
     * Export an assembly document to glTF binary (GLB) format.
     * 
     * @param inputs - Export options including document and mesh settings
     * @returns GLB content as Uint8Array
     * @group export
     * @shortname export document glTF
     * @drawable false
     * 
     * @example
     * ```typescript
     * const document = await occt.assembly.manager.buildAssemblyDocument({ structure });
     * const glbData = await occt.assembly.manager.exportDocumentToGltf({
     *     document,
     *     meshDeflection: 0.1,
     *     tryDownload: true
     * });
     * ```
     */
    async exportDocumentToGltf(inputs: Inputs.OCCT.ExportDocumentToGltfDto<Inputs.OCCT.TDocStdDocumentPointer>): Promise<Uint8Array> {
        return this.occWorkerManager.genericCallToWorkerPromise("assembly.manager.exportDocumentToGltf", inputs).then((s: Uint8Array) => {
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

    // =====================================================
    // Document Lifecycle
    // =====================================================

    /**
     * Delete an assembly document and release its memory.
     * Call this when done with the document to free resources.
     * 
     * @param inputs - Document to delete
     * @group lifecycle
     * @shortname delete document
     * @drawable false
     * 
     * @example
     * ```typescript
     * const document = await occt.assembly.manager.buildAssemblyDocument({ structure });
     * // ... use the document ...
     * await occt.assembly.manager.deleteDocument({ document });
     * ```
     */
    async deleteDocument(inputs: Inputs.OCCT.DocumentQueryDto<Inputs.OCCT.TDocStdDocumentPointer>): Promise<void> {
        return this.occWorkerManager.genericCallToWorkerPromise("assembly.manager.deleteDocument", inputs);
    }
}
