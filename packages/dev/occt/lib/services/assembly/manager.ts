import { BitbybitOcctModule, Handle_TDocStd_Document, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";
import * as Models from "../../api/models";

// Re-export Handle_TDocStd_Document for convenience
export type { Handle_TDocStd_Document };

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
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) { }

    /**
     * Create a part definition for use in assembly structures.
     * This is a helper for visual programming - it simply wraps the inputs into a part object.
     * 
     * @param inputs - Part details including id, shape, name, and optional colorRgba
     * @returns Part definition that can be added to an assembly structure
     * @group assembly
     * @shortname create part
     * @drawable false
     * 
     * @example
     * ```typescript
     * const box = await occt.shapes.solid.createBox({ width: 10, length: 10, height: 10 });
     * const part = await occt.assembly.manager.createPart({ id: "box", shape: box, name: "Box", colorRgba: { r: 1, g: 0, b: 0, a: 1 } });
     * ```
     */
    createPart(inputs: Inputs.OCCT.CreateAssemblyPartDto<TopoDS_Shape>): Models.OCCT.AssemblyPartDef<TopoDS_Shape> {
        return {
            id: inputs.id,
            shape: inputs.shape,
            name: inputs.name,
            colorRgba: inputs.colorRgba
        };
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
    createAssemblyNode(inputs: Inputs.OCCT.CreateAssemblyNodeDto): Models.OCCT.AssemblyNodeDef {
        return {
            id: inputs.id,
            type: "assembly",
            name: inputs.name,
            parentId: inputs.parentId,
            colorRgba: inputs.colorRgba,
            matrix: inputs.matrix
        };
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
    createInstanceNode(inputs: Inputs.OCCT.CreateInstanceNodeDto): Models.OCCT.AssemblyNodeDef {
        return {
            id: inputs.id,
            type: "instance",
            name: inputs.name,
            parentId: inputs.parentId,
            partId: inputs.partId,
            translation: inputs.translation,
            rotation: inputs.rotation,
            scale: inputs.scale,
            matrix: inputs.matrix,
            colorRgba: inputs.colorRgba
        };
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
    createPartUpdate(inputs: Inputs.OCCT.CreatePartUpdateDto<TopoDS_Shape>): Models.OCCT.AssemblyPartUpdateDef<TopoDS_Shape> {
        return {
            label: inputs.label,
            shape: inputs.shape,
            name: inputs.name,
            colorRgba: inputs.colorRgba
        };
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
    combineStructure(inputs: Inputs.OCCT.CombineAssemblyStructureDto<TopoDS_Shape>): Models.OCCT.AssemblyStructureDef<TopoDS_Shape> {
        return {
            parts: inputs.parts ?? [],
            nodes: inputs.nodes ?? [],
            removals: inputs.removals,
            partUpdates: inputs.partUpdates,
            clearDocument: inputs.clearDocument,
            loadedParts: inputs.loadedParts
        };
    }

    /**
     * Create an imported part definition that copies a label tree from another document
     * (typically a STEP-loaded document) into the new assembly. Preserves sub-assembly
     * hierarchy, names and colors. The result can be referenced by `partId` from any
     * instance node to place the imported assembly multiple times.
     * 
     * @param inputs - Imported part details: id, sourceDocumentIndex, optional sourceLabel/name/colorRgba
     * @returns Imported part definition to add to an assembly structure
     * 
     * @example
     * ```typescript
     * const chairDoc = occt.assembly.manager.loadStepToDoc({ stepData });
     * const chair = occt.assembly.manager.createImportedPart({
     *     id: "chair", sourceDocumentIndex: 0, name: "Chair"
     * });
     * const i1 = occt.assembly.manager.createInstanceNode({ id: "c1", partId: "chair", name: "Chair 1", translation: [0,0,0] });
     * const i2 = occt.assembly.manager.createInstanceNode({ id: "c2", partId: "chair", name: "Chair 2", translation: [500,0,0] });
     * const structure = occt.assembly.manager.combineStructure({ parts: [], nodes: [i1, i2], loadedParts: [chair] });
     * const doc = occt.assembly.manager.buildAssemblyDocument({ structure, sourceDocuments: [chairDoc] });
     * ```
     */
    createImportedPart(inputs: Inputs.OCCT.CreateImportedPartDto): Models.OCCT.AssemblyLoadedPartDef {
        return {
            id: inputs.id,
            sourceDocumentIndex: inputs.sourceDocumentIndex,
            sourceLabel: inputs.sourceLabel,
            name: inputs.name,
            colorRgba: inputs.colorRgba
        };
    }

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
     * When updating an existing document (existingDocument provided):
     * - If `structure.removals` is provided, those labels are removed first
     * - If `structure.partUpdates` is provided, those parts are updated (shape, name, color)
     * - New `parts` and `nodes` are added to the document
     * - If neither `removals` nor `partUpdates` is provided, the document is cleared first (backward compatible)
     * - Use `clearDocument: false` in structure to preserve existing content while adding new parts/nodes
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
    buildAssemblyDocument(inputs: Inputs.OCCT.BuildAssemblyDocumentDto<TopoDS_Shape, Handle_TDocStd_Document>): Handle_TDocStd_Document {
        const { structure, existingDocument, sourceDocuments } = inputs;
        
        const shapes: TopoDS_Shape[] = [];
        const partsJson: { id: string; shapeIndex: number; name: string; colorRgba?: Inputs.Base.ColorRGBA | undefined }[] = [];
        
        // Add new parts to shapes array
        for (const part of structure.parts) {
            partsJson.push({
                id: part.id,
                shapeIndex: shapes.length,
                name: part.name,
                colorRgba: part.colorRgba
            });
            shapes.push(part.shape);
        }
        
        // Process partUpdates - add their shapes to the shapes array and reference by index
        const partUpdatesJson: { label: string; shapeIndex?: number | undefined; name?: string | undefined; colorRgba?: Inputs.Base.ColorRGBA | undefined }[] = [];
        if (structure.partUpdates) {
            for (const update of structure.partUpdates) {
                const updateJson: { label: string; shapeIndex?: number | undefined; name?: string | undefined; colorRgba?: Inputs.Base.ColorRGBA | undefined } = {
                    label: update.label
                };
                if (update.shape) {
                    updateJson.shapeIndex = shapes.length;
                    shapes.push(update.shape);
                }
                if (update.name !== undefined) {
                    updateJson.name = update.name;
                }
                if (update.colorRgba !== undefined) {
                    updateJson.colorRgba = update.colorRgba;
                }
                partUpdatesJson.push(updateJson);
            }
        }
        
        // Imported parts reference source documents by index; they carry no shape payload.
        const loadedPartsJson = structure.loadedParts && structure.loadedParts.length > 0
            ? structure.loadedParts.map(p => ({
                id: p.id,
                sourceDocumentIndex: p.sourceDocumentIndex,
                sourceLabel: p.sourceLabel,
                name: p.name,
                colorRgba: p.colorRgba
            }))
            : undefined;

        // Native placement expects `matrix` as a flat row-major 3x4 (12 values). The
        // public API uses column-major matrices (Base.TransformMatrix) and also accepts
        // an ordered list, so fold + transpose here at the boundary.
        const nodesJson = structure.nodes.map(node => {
            if (node.matrix === undefined || node.matrix === null) {
                return node;
            }
            const { matrix, ...rest } = node;
            return { ...rest, matrix: this.och.transformsService.foldToRowMajor12(matrix) };
        });

        const structureJson = JSON.stringify({
            parts: partsJson,
            nodes: nodesJson,
            removals: structure.removals,
            partUpdates: partUpdatesJson.length > 0 ? partUpdatesJson : undefined,
            clearDocument: structure.clearDocument,
            loadedParts: loadedPartsJson
        });
        
        const document = this.occ.BuildAssemblyDocument(
            structureJson,
            shapes,
            existingDocument,
            sourceDocuments ?? []
        );
        
        if (document.IsNull()) {
            throw new Error("Failed to create assembly document");
        }
        
        return document;
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
    loadStepToDoc(inputs: Inputs.OCCT.LoadStepToDocDto): Handle_TDocStd_Document {
        const document = this.occ.LoadStepToDoc(inputs.stepData as Uint8Array);
        
        if (document.IsNull()) {
            throw new Error("Failed to load STEP file");
        }
        
        return document;
    }

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
    setLabelColor(inputs: Inputs.OCCT.SetDocLabelColorDto<Handle_TDocStd_Document>): boolean {
        return this.occ.SetDocLabelColor(inputs.document, inputs.label, inputs.r, inputs.g, inputs.b, inputs.a);
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
    setLabelName(inputs: Inputs.OCCT.SetDocLabelNameDto<Handle_TDocStd_Document>): boolean {
        return this.occ.SetDocLabelName(inputs.document, inputs.label, inputs.name);
    }

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
    exportDocumentToStep(inputs: Inputs.OCCT.ExportDocumentToStepDto<Handle_TDocStd_Document>): Uint8Array {
        const result = inputs.compress
            ? this.occ.ExportDocumentToStepZ(inputs.document, inputs.fileName, inputs.author, inputs.organization)
            : this.occ.ExportDocumentToStep(inputs.document, inputs.fileName, inputs.author, inputs.organization);
        
        if (!result) {
            throw new Error("Failed to export document to STEP");
        }
        return result;
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
    exportDocumentToGltf(inputs: Inputs.OCCT.ExportDocumentToGltfDto<Handle_TDocStd_Document>): Uint8Array {
        const result = this.occ.ExportDocumentToGltf(
            inputs.document,
            inputs.meshDeflection,
            inputs.meshAngle,
            inputs.internalVerticesMode ?? false,
            inputs.controlSurfaceDeflection ?? false,
            inputs.mergeFaces,
            inputs.forceUVExport
        );
        
        if (!result) {
            throw new Error("Failed to export document to glTF");
        }
        return result;
    }

    /**
     * Export an assembly document to glTF binary (GLB) format with explicit
     * Draco geometry compression settings.
     *
     * @param inputs - Export options including document, mesh settings and Draco knobs
     * @returns GLB content as Uint8Array
     * @group export
     * @shortname export document glTF with draco
     * @drawable false
     *
     * @example
     * ```typescript
     * const document = await occt.assembly.manager.buildAssemblyDocument({ structure });
     * const glbData = await occt.assembly.manager.exportDocumentToGltfWithDraco({
     *     document,
     *     meshDeflection: 0.1,
     *     useDraco: true,
     *     dracoCompressionLevel: 7,
     *     tryDownload: true
     * });
     * ```
     */
    exportDocumentToGltfWithDraco(inputs: Inputs.OCCT.ExportDocumentToGltfWithDracoDto<Handle_TDocStd_Document>): Uint8Array {
        const result = this.occ.ExportDocumentToGltfWithDraco(
            inputs.document,
            inputs.meshDeflection ?? 0.1,
            inputs.meshAngle ?? 0.5,
            inputs.internalVerticesMode ?? false,
            inputs.controlSurfaceDeflection ?? false,
            inputs.mergeFaces ?? false,
            inputs.forceUVExport ?? false,
            inputs.useDraco ?? true,
            inputs.dracoCompressionLevel ?? 7,
            inputs.dracoQuantizePositionBits ?? 14,
            inputs.dracoQuantizeNormalBits ?? 10,
            inputs.dracoQuantizeTexcoordBits ?? 12,
            inputs.dracoQuantizeColorBits ?? 8,
            inputs.dracoQuantizeGenericBits ?? 12,
            inputs.dracoUnifiedQuantization ?? false
        );

        if (!result) {
            throw new Error("Failed to export document to glTF");
        }
        return result;
    }

}
