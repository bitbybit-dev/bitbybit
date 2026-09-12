import { BitbybitOcctModule, Handle_TDocStd_Document, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";
import * as Models from "../../api/models";

export type { Handle_TDocStd_Document };

/**
 * Building and changing assembly documents: describe parts, assembly nodes and instance nodes one
 * object at a time, combine them into a structure, and build a document from it; or load a STEP
 * file into a document. Then recolor and rename labels, update or remove parts, and export to STEP
 * or glTF. A document is an in-memory handle that stays alive until it is deleted, so build once
 * and query or export as often as needed.
 */
export class OCCTAssemblyManager {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) { }

    /**
     * Describes a part for an assembly structure: an id to reference it by, its shape, a name and
     * an optional color.
     *
     * Nothing is built yet; the part only becomes real when a structure holding it goes through
     * `buildAssemblyDocument`. Instance nodes place the part by its id, as many times as needed.
     * @param inputs - The part id, its shape, its name and an optional color
     * @returns The part definition, ready for `combineStructure`
     * @group assembly
     * @shortname create part
     * @drawable false
     * @example
     * ```typescript
     * const box = await bitbybit.occt.shapes.solid.createBox({ width: 10, length: 10, height: 10, center: [0, 0, 0] });
     * const part = await bitbybit.occt.assembly.manager.createPart({ id: "box", shape: box, name: "Box", colorRgba: { r: 1, g: 0, b: 0, a: 1 } });
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
     * Describes an assembly node, a container that groups instances and other assemblies in the
     * hierarchy.
     *
     * `parentId` names the assembly it sits in; leave it out for a root. An optional matrix places
     * the whole group.
     * @param inputs - The node id, its name, an optional parent id, an optional color and an optional placement matrix
     * @returns The node definition, ready for `combineStructure`
     * @group assembly
     * @shortname create assembly node
     * @drawable false
     * @example
     * ```typescript
     * const root = await bitbybit.occt.assembly.manager.createAssemblyNode({ id: "root", name: "Root Assembly" });
     * const sub = await bitbybit.occt.assembly.manager.createAssemblyNode({ id: "sub", name: "Sub Assembly", parentId: "root" });
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
     * Describes a part taken from another document, typically one loaded from STEP, so its whole
     * label tree with sub-assemblies, names and colors is copied into the new assembly.
     *
     * `sourceDocumentIndex` points into the `sourceDocuments` list given to
     * `buildAssemblyDocument`, and `sourceLabel` picks a sub-tree instead of the whole document.
     * Instance nodes place it by `partId` like any part.
     * @param inputs - The part id, the index of the source document, an optional source label, name and color
     * @returns The imported part definition, ready for `combineStructure`
     * @example
     * ```typescript
     * const chairDoc = await bitbybit.occt.assembly.manager.loadStepToDoc({ stepData });
     * const chair = await bitbybit.occt.assembly.manager.createImportedPart({ id: "chair", sourceDocumentIndex: 0, name: "Chair" });
     * const c1 = await bitbybit.occt.assembly.manager.createInstanceNode({ id: "c1", partId: "chair", name: "Chair 1", translation: [0, 0, 0] });
     * const c2 = await bitbybit.occt.assembly.manager.createInstanceNode({ id: "c2", partId: "chair", name: "Chair 2", translation: [500, 0, 0] });
     * const structure = await bitbybit.occt.assembly.manager.combineStructure({ parts: [], nodes: [c1, c2], loadedParts: [chair], clearDocument: false });
     * const doc = await bitbybit.occt.assembly.manager.buildAssemblyDocument({ structure, sourceDocuments: [chairDoc] });
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
     * Describes an instance node, one placement of a part: which part by `partId`, where it goes
     * and under which assembly.
     *
     * `translation` moves it, `rotation` turns it by Euler angles in degrees about X, Y and Z,
     * `scale` sizes it uniformly; a `matrix` can replace all three. The same part may be placed by
     * many instances.
     * @param inputs - The node id, the part id, the name, an optional parent id and the placement
     * @returns The node definition, ready for `combineStructure`
     * @group assembly
     * @shortname create instance node
     * @drawable false
     * @example
     * ```typescript
     * const first = await bitbybit.occt.assembly.manager.createInstanceNode({ id: "box1", partId: "box", name: "Box 1" });
     * const second = await bitbybit.occt.assembly.manager.createInstanceNode({ id: "box2", partId: "box", name: "Box 2", translation: [20, 0, 0], rotation: [0, 0, 45] });
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
     * Describes a change to a part that already exists in a document: a new shape, a new name or a
     * new color, or any mix of them, addressed by the part's label.
     *
     * Collect the updates in `combineStructure` under `partUpdates` and pass the structure to
     * `buildAssemblyDocument` with the existing document.
     * @param inputs - The label of the part and the optional new shape, name and color
     * @returns The update definition, ready for `combineStructure`
     * @group assembly
     * @shortname create part update
     * @drawable false
     * @example
     * ```typescript
     * const parts = await bitbybit.occt.assembly.query.getDocumentParts({ document: doc });
     * const bigger = await bitbybit.occt.shapes.solid.createBox({ width: 20, length: 20, height: 20, center: [0, 0, 0] });
     * const update = await bitbybit.occt.assembly.manager.createPartUpdate({ label: parts[0].label, shape: bigger, name: "Bigger Box" });
     * const structure = await bitbybit.occt.assembly.manager.combineStructure({ parts: [], nodes: [], partUpdates: [update], clearDocument: false });
     * await bitbybit.occt.assembly.manager.buildAssemblyDocument({ structure, existingDocument: doc });
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
     * Gathers parts, nodes and, for updates, removals, part updates and imported parts into one
     * structure definition, the last step before `buildAssemblyDocument`.
     *
     * `clearDocument` false keeps what an existing document already holds when the structure is
     * applied to it.
     * @param inputs - The parts, the nodes, and the optional removals, part updates, imported parts and clear flag
     * @returns The structure, ready to build
     * @group assembly
     * @shortname combine structure
     * @drawable false
     * @example
     * ```typescript
     * const structure = await bitbybit.occt.assembly.manager.combineStructure({ parts: [part], nodes: [root, first, second], clearDocument: false });
     * const doc = await bitbybit.occt.assembly.manager.buildAssemblyDocument({ structure });
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
     * Builds an assembly document from a structure, or applies the structure to an existing
     * document.
     *
     * With `existingDocument` the labels in `removals` are dropped first, the `partUpdates`
     * applied, then the new parts and nodes added; a structure with neither clears the document
     * unless `clearDocument` is false. `sourceDocuments` supplies the documents imported parts copy
     * from. The document stays in memory until deleted.
     * @param inputs - The structure, an optional document to update and the optional source documents
     * @returns The document handle, new or updated
     * @throws Error if assembly building fails
     * @group assembly
     * @shortname build document
     * @drawable false
     * @example
     * ```typescript
     * const structure = await bitbybit.occt.assembly.manager.combineStructure({ parts: [part], nodes: [root, first], clearDocument: false });
     * const doc = await bitbybit.occt.assembly.manager.buildAssemblyDocument({ structure });
     * const glb = await bitbybit.occt.assembly.manager.exportDocumentToGltf({ document: doc, meshDeflection: 0.1, meshAngle: 0.5, internalVerticesMode: false, controlSurfaceDeflection: false, mergeFaces: false, forceUVExport: false, fileName: "assembly.glb", tryDownload: false });
     * ```
     */
    buildAssemblyDocument(inputs: Inputs.OCCT.BuildAssemblyDocumentDto<TopoDS_Shape, Handle_TDocStd_Document>): Handle_TDocStd_Document {
        const { structure, existingDocument, sourceDocuments } = inputs;
        
        const shapes: TopoDS_Shape[] = [];
        const partsJson: { id: string; shapeIndex: number; name: string; colorRgba?: Inputs.Base.ColorRGBA | undefined }[] = [];
        
        for (const part of structure.parts) {
            partsJson.push({
                id: part.id,
                shapeIndex: shapes.length,
                name: part.name,
                colorRgba: part.colorRgba
            });
            shapes.push(part.shape);
        }
        
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
        
        const loadedPartsJson = structure.loadedParts && structure.loadedParts.length > 0
            ? structure.loadedParts.map(p => ({
                id: p.id,
                sourceDocumentIndex: p.sourceDocumentIndex,
                sourceLabel: p.sourceLabel,
                name: p.name,
                colorRgba: p.colorRgba
            }))
            : undefined;

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
     * Loads a STEP file into a new assembly document, with its parts, sub-assemblies, names, colors
     * and placements.
     *
     * `stepData` is the file as text or binary; gzip-compressed STEP-Z is accepted too. A file that
     * cannot be loaded throws an error.
     * @param inputs - The STEP file content
     * @returns The document handle
     * @throws Error if STEP loading fails
     * @group assembly
     * @shortname load STEP to document
     * @drawable false
     * @example
     * ```typescript
     * const doc = await bitbybit.occt.assembly.manager.loadStepToDoc({ stepData: stepText });
     * const parts = await bitbybit.occt.assembly.query.getDocumentParts({ document: doc });
     * ```
     */
    loadStepToDoc(inputs: Inputs.OCCT.LoadStepToDocDto): Handle_TDocStd_Document {
        const document = this.occ.LoadStepToDoc(inputs.stepData);
        
        if (document.IsNull()) {
            throw new Error("Failed to load STEP file");
        }
        
        return document;
    }

    /**
     * Colors a label of a document, a part, instance or assembly, with red, green, blue and alpha
     * from 0 to 1.
     *
     * The color is kept when the document is exported to STEP or glTF.
     * @param inputs - The document, the label and the four color channels
     * @returns True when the color was set
     * @group modify
     * @shortname set label color
     * @drawable false
     * @example
     * ```typescript
     * const done = await bitbybit.occt.assembly.manager.setDocLabelColor({ document: doc, label: "0:1:1:1", r: 1, g: 0, b: 0, a: 1 });
     * ```
     */
    setLabelColor(inputs: Inputs.OCCT.SetDocLabelColorDto<Handle_TDocStd_Document>): boolean {
        return this.occ.SetDocLabelColor(inputs.document, inputs.label, inputs.r, inputs.g, inputs.b, inputs.a);
    }

    /**
     * Renames a label of a document, a part, instance or assembly.
     * @param inputs - The document, the label and the new name
     * @returns True when the name was set
     * @group modify
     * @shortname set label name
     * @drawable false
     * @example
     * ```typescript
     * const done = await bitbybit.occt.assembly.manager.setDocLabelName({ document: doc, label: "0:1:1:1", name: "Left bracket" });
     * ```
     */
    setLabelName(inputs: Inputs.OCCT.SetDocLabelNameDto<Handle_TDocStd_Document>): boolean {
        return this.occ.SetDocLabelName(inputs.document, inputs.label, inputs.name);
    }

    /**
     * Writes an assembly document as a STEP file with its hierarchy, names and colors, and returns
     * the file's bytes.
     *
     * `author` and `organization` go into the file header; `compress` writes gzip-compressed STEP-Z
     * instead. Failure throws an error.
     * @param inputs - The document, the file name, the header details, the compression flag and the download option
     * @returns The STEP file as bytes
     * @group export
     * @shortname export document STEP
     * @drawable false
     * @example
     * ```typescript
     * const step = await bitbybit.occt.assembly.manager.exportDocumentToStep({ document: doc, fileName: "assembly.step", author: "Bitbybit user", organization: "Bitbybit", compress: false, tryDownload: false });
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
     * Triangulates an assembly document and writes it as a binary glTF (GLB) with the hierarchy,
     * names and colors kept as glTF nodes and materials.
     *
     * `meshDeflection` and `meshAngle` set how finely curved surfaces are triangulated;
     * `mergeFaces` joins the faces of a part into one mesh. Failure throws an error.
     * @param inputs - The document, the meshing settings, the export flags, the file name and the download option
     * @returns The GLB file as bytes
     * @group export
     * @shortname export document glTF
     * @drawable false
     * @example
     * ```typescript
     * const glb = await bitbybit.occt.assembly.manager.exportDocumentToGltf({ document: doc, meshDeflection: 0.1, meshAngle: 0.5, internalVerticesMode: false, controlSurfaceDeflection: false, mergeFaces: false, forceUVExport: false, fileName: "assembly.glb", tryDownload: false });
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
     * Writes an assembly document as a binary glTF (GLB) like `exportDocumentToGltf` and compresses
     * the geometry with Draco, which makes the file much smaller at the cost of a Draco-capable
     * loader.
     *
     * The Draco settings set the compression level and how many bits positions, normals, texture
     * coordinates and colors keep.
     * @param inputs - The document, the meshing settings, the export flags and the Draco settings
     * @returns The GLB file as bytes
     * @group export
     * @shortname export document glTF with draco
     * @drawable false
     * @example
     * ```typescript
     * const options = new Bit.Inputs.OCCT.ExportDocumentToGltfWithDracoDto<Bit.Inputs.OCCT.TDocStdDocumentPointer>();
     * options.document = doc;
     * options.meshDeflection = 0.1;
     * options.dracoCompressionLevel = 7;
     * const glb = await bitbybit.occt.assembly.manager.exportDocumentToGltfWithDraco(options);
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
