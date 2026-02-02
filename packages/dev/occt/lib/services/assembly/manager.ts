import { BitbybitOcctModule, Handle_TDocStd_Document, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";
import * as Models from "../../api/models";

// Re-export Handle_TDocStd_Document for convenience
export type { Handle_TDocStd_Document };

/**
 * OCCT Assembly Manager for creating assembly documents with parts, instances, and colors.
 * 
 * This class provides methods for:
 * - Building assembly documents from structure definitions
 * - Creating parts and nodes for visual programming
 * - Querying document parts, hierarchy, colors, and transforms
 * - Modifying document labels (color, name)
 * - Exporting to STEP and glTF formats
 * - Loading STEP files into documents
 * 
 * All methods use document handles directly (no global document storage).
 * The caller is responsible for managing document lifetime by calling document.delete() when done.
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
     * 
     * @example
     * \`\`\`typescript
     * const box = occt.shapes.solid.createBox({ width: 10, length: 10, height: 10 });
     * const part = occt.assembly.manager.createPart({ id: "box", shape: box, name: "Box", colorRgba: { r: 1, g: 0, b: 0, a: 1 } });
     * \`\`\`
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
     */
    createAssemblyNode(inputs: Inputs.OCCT.CreateAssemblyNodeDto): Models.OCCT.AssemblyNodeDef {
        return {
            id: inputs.id,
            type: "assembly",
            name: inputs.name,
            parentId: inputs.parentId,
            colorRgba: inputs.colorRgba 
        };
    }

    /**
     * Create an instance node definition (a reference to a part with transform).
     * Instance nodes place a part at a specific location with optional translation, rotation, and scale.
     * 
     * @param inputs - Instance node details including id, partId, name, and transform
     * @returns Node definition that can be added to an assembly structure
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
            colorRgba: inputs.colorRgba
        };
    }

    /**
     * Create a part update definition for modifying an existing part in a document.
     * Part updates can change the shape, name, and/or color of an existing part.
     * 
     * @param inputs - Update details including label and optional new shape/name/color
     * @returns Part update definition that can be added to an assembly structure's partUpdates array
     * 
     * @example
     * ```typescript
     * // Get existing parts from document
     * const parts = occt.assembly.query.getDocumentParts({ document });
     * 
     * // Create a new shape to replace the old one
     * const newBox = occt.shapes.solid.createBox({ width: 20, length: 20, height: 20 });
     * 
     * // Create an update definition
     * const update = occt.assembly.manager.createPartUpdate({ 
     *     label: parts[0].label, 
     *     shape: newBox,
     *     name: "Bigger Box",
     *     colorRgba: { r: 0, g: 1, b: 0, a: 1 }
     * });
     * 
     * // Combine with structure and rebuild
     * const structure = occt.assembly.manager.combineStructure({ parts: [], nodes: [], partUpdates: [update] });
     * occt.assembly.manager.buildAssemblyDocument({ structure, existingDocument: document });
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
     */
    combineStructure(inputs: Inputs.OCCT.CombineAssemblyStructureDto<TopoDS_Shape>): Models.OCCT.AssemblyStructureDef<TopoDS_Shape> {
        return {
            parts: inputs.parts ?? [],
            nodes: inputs.nodes ?? [],
            removals: inputs.removals,
            partUpdates: inputs.partUpdates,
            clearDocument: inputs.clearDocument
        };
    }

    /**
     * Build an assembly document from a structure definition.
     * Returns the document handle directly - caller manages lifetime.
     * Call document.delete() when done to free memory.
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
     * @returns The document handle (new or updated)
     * @throws Error if assembly building fails
     */
    buildAssemblyDocument(inputs: Inputs.OCCT.BuildAssemblyDocumentDto<TopoDS_Shape, Handle_TDocStd_Document>): Handle_TDocStd_Document {
        const { structure, existingDocument } = inputs;
        
        const shapes: TopoDS_Shape[] = [];
        const partsJson: { id: string; shapeIndex: number; name: string; colorRgba?: Inputs.Base.ColorRGBA }[] = [];
        
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
        const partUpdatesJson: { label: string; shapeIndex?: number; name?: string; colorRgba?: Inputs.Base.ColorRGBA }[] = [];
        if (structure.partUpdates) {
            for (const update of structure.partUpdates) {
                const updateJson: { label: string; shapeIndex?: number; name?: string; colorRgba?: Inputs.Base.ColorRGBA } = {
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
        
        const structureJson = JSON.stringify({
            parts: partsJson,
            nodes: structure.nodes,
            removals: structure.removals,
            partUpdates: partUpdatesJson.length > 0 ? partUpdatesJson : undefined,
            clearDocument: structure.clearDocument
        });
        
        const document = this.occ.BuildAssemblyDocument(structureJson, shapes, existingDocument);
        
        if (document.IsNull()) {
            throw new Error("Failed to create assembly document");
        }
        
        return document;
    }

    /**
     * Load STEP data and return document handle directly.
     * Supports both regular STEP and gzip-compressed STEP-Z.
     * Call document.delete() when done to free memory.
     * 
     * @param inputs - STEP file data
     * @returns The document handle
     * @throws Error if STEP loading fails
     */
    loadStepToDoc(inputs: Inputs.OCCT.LoadStepToDocDto): Handle_TDocStd_Document {
        const document = this.occ.LoadStepToDoc(inputs.stepData as Uint8Array);
        
        if (document.IsNull()) {
            throw new Error("Failed to load STEP file");
        }
        
        return document;
    }

    /**
     * Set the color of a label in a document.
     * 
     * @param inputs - Document handle, label, and color
     * @returns true on success, false on failure
     */
    setLabelColor(inputs: Inputs.OCCT.SetDocLabelColorDto<Handle_TDocStd_Document>): boolean {
        return this.occ.SetDocLabelColor(inputs.document, inputs.label, inputs.r, inputs.g, inputs.b, inputs.a);
    }

    /**
     * Set or change the name of a label.
     * 
     * @param inputs - Document handle, label, and new name
     * @returns true on success, false on failure
     */
    setLabelName(inputs: Inputs.OCCT.SetDocLabelNameDto<Handle_TDocStd_Document>): boolean {
        return this.occ.SetDocLabelName(inputs.document, inputs.label, inputs.name);
    }

    /**
     * Export an assembly document to STEP format.
     * 
     * @param inputs - Export options including document, fileName, author, organization
     * @returns STEP file content as Uint8Array
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
     */
    exportDocumentToGltf(inputs: Inputs.OCCT.ExportDocumentToGltfDto<Handle_TDocStd_Document>): Uint8Array {
        const result = this.occ.ExportDocumentToGltf(
            inputs.document,
            inputs.meshDeflection,
            inputs.meshAngle,
            inputs.mergeFaces,
            inputs.forceUVExport
        );
        
        if (!result) {
            throw new Error("Failed to export document to glTF");
        }
        return result;
    }

}
