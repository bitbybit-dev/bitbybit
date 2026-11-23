import type { BitbybitOcctModule, Handle_TDocStd_Document, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";
import { InputError, resolveDto } from "@bitbybit-dev/base";
import type * as Resolved from "../../api/resolved-inputs";
import { checkedNumber } from "../base/input-checks";
import { SMALLEST_MESH_DEFLECTION, bytesOfFile, checkedDocument, objNameOf } from "../base/file-data";
import { glbWithRootScale } from "@bitbybit-dev/base/lib/api/services/helpers/files/glb";
import { withKernelErrorsRead } from "../base/kernel-refusals";
import { DocumentPmiWriter } from "./pmi";
import type { KernelLabelInfo } from "./manager-types";

type GltfExportCall = (...args: unknown[]) => Uint8Array | undefined;

export type { Handle_TDocStd_Document };

const GLB_MAGIC: readonly number[] = [0x67, 0x6c, 0x54, 0x46];
const LENGTH_UNITS: readonly unknown[] = Object.values(Inputs.Base.unitOfLengthEnum);

const checkedNames = (names: unknown, labels: number): string[] => {
    if (!Array.isArray(names)) {
        throw new InputError("`names` must be a list of names, one for each label, in the same order.", "names");
    }
    if (names.length !== labels) {
        throw new InputError(`\`names\` holds ${names.length} name${names.length === 1 ? "" : "s"} for ${labels} labels; give one name for each label, in the same order.`, "names");
    }
    names.forEach((name: unknown, at) => {
        if (typeof name !== "string") {
            throw new InputError(`\`names[${at}]\` is ${JSON.stringify(name)}, but a name is text.`, `names[${at}]`);
        }
    });
    return names as string[];
};

const SETTABLE_LABEL_TYPES: ReadonlySet<string> = new Set(["part", "assembly", "instance"]);
const SHAPE_TREE_ENTRY = "0:1:1:";

const labelNotFound = (label: unknown, property: string): InputError => new InputError(`\`${property}\` is ${JSON.stringify(label)}, which names no label of the document.`, property);

/**
 * Building and changing assembly documents: describe parts, assembly nodes and instance nodes one
 * object at a time, combine them into a structure, and build a document from it; or load a STEP,
 * glTF or OBJ file into a document. Then recolor and rename labels, update or remove parts, add
 * dimensions, datums and tolerances, and export to STEP, glTF, OBJ or PLY. A document is an in-memory handle that stays alive until it is
 * deleted, so build once and query or export as often as needed.
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
        const resolved = resolveDto(Inputs.OCCT.CreateAssemblyPartDto, inputs) as Resolved.OCCT.CreateAssemblyPartDto<TopoDS_Shape>;
        return {
            id: resolved.id,
            shape: resolved.shape,
            name: resolved.name,
            colorRgba: resolved.colorRgba
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
        const resolved = resolveDto(Inputs.OCCT.CreateAssemblyNodeDto, inputs) as Resolved.OCCT.CreateAssemblyNodeDto;
        return {
            id: resolved.id,
            type: "assembly",
            name: resolved.name,
            parentId: resolved.parentId,
            colorRgba: resolved.colorRgba,
            matrix: resolved.matrix
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
        const resolved = resolveDto(Inputs.OCCT.CreateImportedPartDto, inputs) as Resolved.OCCT.CreateImportedPartDto;
        return {
            id: resolved.id,
            sourceDocumentIndex: resolved.sourceDocumentIndex,
            sourceLabel: resolved.sourceLabel,
            name: resolved.name,
            colorRgba: resolved.colorRgba
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
        const resolved = resolveDto(Inputs.OCCT.CreateInstanceNodeDto, inputs) as Resolved.OCCT.CreateInstanceNodeDto;
        return {
            id: resolved.id,
            type: "instance",
            name: resolved.name,
            parentId: resolved.parentId,
            partId: resolved.partId,
            translation: resolved.translation,
            rotation: resolved.rotation,
            scale: resolved.scale,
            matrix: resolved.matrix,
            colorRgba: resolved.colorRgba
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
        const resolved = resolveDto(Inputs.OCCT.CombineAssemblyStructureDto, inputs) as Resolved.OCCT.CombineAssemblyStructureDto<TopoDS_Shape>;
        return {
            parts: resolved.parts,
            nodes: resolved.nodes,
            removals: resolved.removals,
            partUpdates: resolved.partUpdates,
            clearDocument: resolved.clearDocument,
            loadedParts: resolved.loadedParts
        };
    }

    /**
     * Builds an assembly document from a structure, or applies the structure to an existing
     * document.
     *
     * With `existingDocument`, `removals` go first, then `partUpdates`, then new parts and nodes;
     * with neither, the document is cleared unless `clearDocument` is false. `sourceDocuments` feeds
     * imported parts; a placed root assembly goes under a top "Assembly". The document stays in
     * memory until deleted.
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
     * const glb = await bitbybit.occt.assembly.manager.exportDocumentToGltf({ document: doc, meshDeflection: 0.1, meshAngle: 0.5, internalVerticesMode: true, controlSurfaceDeflection: false, mergeFaces: false, forceUVExport: false, fileName: "assembly.glb", tryDownload: false });
     * ```
     */
    buildAssemblyDocument(inputs: Inputs.OCCT.BuildAssemblyDocumentDto<TopoDS_Shape, Handle_TDocStd_Document>): Handle_TDocStd_Document {
        const { structure, existingDocument, sourceDocuments } = inputs;
        if (structure.lengthUnit !== undefined && !LENGTH_UNITS.includes(structure.lengthUnit)) {
            throw new InputError(`\`structure.lengthUnit\` is ${String(structure.lengthUnit)}, which is none of ${LENGTH_UNITS.join(", ")}.`, "structure");
        }
        
        const shapes: TopoDS_Shape[] = [];
        const partsJson: (Omit<Models.OCCT.AssemblyPartDef<TopoDS_Shape>, "shape"> & { shapeIndex: number })[] = [];
        
        for (const part of structure.parts) {
            partsJson.push({
                id: part.id,
                shapeIndex: shapes.length,
                name: part.name,
                colorRgba: part.colorRgba,
                edgeColorRgba: part.edgeColorRgba,
                metallic: part.metallic,
                roughness: part.roughness,
                emissiveRgb: part.emissiveRgb,
                faceColors: part.faceColors,
                edgeColors: part.edgeColors,
                properties: part.properties
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

        const nodesJson = this.withPlacedRoots(structure.nodes).map(node => {
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
            loadedParts: loadedPartsJson,
            lengthUnit: structure.lengthUnit
        });
        
        const document = this.occ.BuildAssemblyDocument(
            structureJson,
            shapes,
            existingDocument,
            sourceDocuments ?? []
        );
        
        if (document.IsNull()) {
            document.delete();
            throw new Error("Failed to create assembly document");
        }
        
        return document;
    }

    private upFor(exportCall: GltfExportCall, olderArity: number, up: Inputs.OCCT.upAxisEnum): [boolean] | [] {
        if (exportCall.length !== olderArity) {
            return [up === Inputs.OCCT.upAxisEnum.y];
        }
        if (up === Inputs.OCCT.upAxisEnum.y) {
            throw new InputError("this kernel writes every document as z-up; a newer kernel writes a y-up one", "up");
        }
        return [];
    }

    private withPlacedRoots(nodes: Models.OCCT.AssemblyNodeDef[]): Models.OCCT.AssemblyNodeDef[] {
        const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0];
        const placed = (node: Models.OCCT.AssemblyNodeDef): boolean => {
            if (node.matrix !== undefined && node.matrix !== null) {
                return this.och.transformsService.foldToRowMajor12(node.matrix).some((value, index) => Math.abs(value - identity[index]!) > 1e-12);
            }
            return (node.translation?.some(value => value !== 0) ?? false) || (node.rotation?.some(value => value !== 0) ?? false) || (node.scale !== undefined && node.scale !== 1);
        };
        if (!nodes.some(node => node.type === "assembly" && !node.parentId && placed(node))) {
            return nodes;
        }
        const top = "__root__";
        return [{ id: top, type: "assembly", name: "Assembly" }, ...nodes.map(node => node.parentId ? node : { ...node, parentId: top })];
    }

    /**
     * Loads a STEP file into a new assembly document, with its parts, sub-assemblies, names, colors
     * and placements.
     *
     * `stepData` is the file as text or binary; gzip-compressed STEP-Z is accepted too. A file that
     * cannot be loaded throws. An instance the file leaves unnamed, as SolidWorks does, is named
     * after the part it places, numbered when that part repeats beside it.
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
     * const options = bitbybit.draw.optionsOcctDocument({ drawAnnotations: true });
     * const drawn = await bitbybit.draw.drawAnyAsync({ entity: doc, options });
     * ```
     */
    loadStepToDoc(inputs: Inputs.OCCT.LoadStepToDocDto): Handle_TDocStd_Document {
        const document = this.occ.LoadStepToDoc(bytesOfFile(inputs.stepData, "stepData"));

        if (document.IsNull()) {
            document.delete();
            throw new InputError("Failed to load STEP file", "stepData");
        }

        return document;
    }

    /**
     * Loads a glTF file into a new assembly document, with its hierarchy, names and colors, the
     * meshes becoming faces that carry triangles.
     *
     * `gltfData` is a binary `.glb` or a `.gltf` with its buffers embedded; the file's header tells
     * which. glTF's Y-up becomes the document's Z-up, as `exportDocumentToGltf` writes it, and a file
     * that holds no mesh is refused.
     * @param inputs - The glTF file
     * @returns The document handle
     * @group assembly
     * @shortname load glTF to document
     * @drawable false
     * @example
     * ```typescript
     * const doc = await bitbybit.occt.assembly.manager.loadGltfToDoc({ gltfData: glbBytes });
     * const parts = await bitbybit.occt.assembly.query.getDocumentParts({ document: doc });
     * ```
     */
    loadGltfToDoc(inputs: Inputs.OCCT.LoadGltfToDocDto): Handle_TDocStd_Document {
        const resolved = resolveDto(Inputs.OCCT.LoadGltfToDocDto, inputs);
        const bytes = bytesOfFile(resolved.gltfData, "gltfData");
        const isBinary = bytes.length >= GLB_MAGIC.length && GLB_MAGIC.every((byte, at) => bytes[at] === byte);
        return this.occ.ReadGltfToDoc(bytes, isBinary);
    }

    /**
     * Loads an OBJ file into a new assembly document, its meshes becoming faces that carry
     * triangles, named as the file names them.
     *
     * Coordinates are taken as they are, since OBJ has no agreed up axis. A material library the
     * file names is not read, and a file that holds no mesh is refused.
     * @param inputs - The OBJ file
     * @returns The document handle
     * @group assembly
     * @shortname load OBJ to document
     * @drawable false
     * @example
     * ```typescript
     * const doc = await bitbybit.occt.assembly.manager.loadObjToDoc({ objData: objText });
     * const tree = await bitbybit.occt.assembly.query.getAssemblyHierarchy({ document: doc });
     * ```
     */
    loadObjToDoc(inputs: Inputs.OCCT.LoadObjToDocDto): Handle_TDocStd_Document {
        const resolved = resolveDto(Inputs.OCCT.LoadObjToDocDto, inputs);
        return this.occ.ReadObjToDoc(bytesOfFile(resolved.objData, "objData"));
    }

    /**
     * Colors a label of a document, a part, instance or assembly, with red, green, blue and alpha
     * from 0 to 1.
     *
     * It answers the colored document, which an export or a read given it shows, STEP and glTF
     * included. A label that names no part, instance or assembly of the document is refused;
     * `setDocLabelColors` colors many labels in one change.
     * @param inputs - The document, the label and the four color channels
     * @returns The colored document
     * @group modify
     * @shortname set label color
     * @drawable false
     * @example
     * ```typescript
     * const colored = await bitbybit.occt.assembly.manager.setDocLabelColor({ document: doc, label: "0:1:1:1", r: 1, g: 0, b: 0, a: 1 });
     * const step = await bitbybit.occt.assembly.manager.exportDocumentToStep({ document: colored });
     * ```
     */
    setDocLabelColor(inputs: Inputs.OCCT.SetDocLabelColorDto<Handle_TDocStd_Document>): Handle_TDocStd_Document {
        const resolved = resolveDto(Inputs.OCCT.SetDocLabelColorDto, inputs) as Resolved.OCCT.SetDocLabelColorDto<Handle_TDocStd_Document>;
        const document = checkedDocument(resolved.document, "document");
        const label = this.settableLabel(document, resolved.label, "label");
        if (!this.occ.SetDocLabelColor(document, label, resolved.r, resolved.g, resolved.b, resolved.a)) {
            throw labelNotFound(resolved.label, "label");
        }
        return document;
    }

    /**
     * Renames a label of a document, a part, instance or assembly.
     *
     * It answers the renamed document, which an export or a read given it shows. A label that names
     * no part, instance or assembly of the document is refused; `setDocLabelNames` renames many
     * labels in one change.
     * @param inputs - The document, the label and the new name
     * @returns The renamed document
     * @group modify
     * @shortname set label name
     * @drawable false
     * @example
     * ```typescript
     * const renamed = await bitbybit.occt.assembly.manager.setDocLabelName({ document: doc, label: "0:1:1:1", name: "Left bracket" });
     * const tree = await bitbybit.occt.assembly.query.getAssemblyHierarchy({ document: renamed });
     * ```
     */
    setDocLabelName(inputs: Inputs.OCCT.SetDocLabelNameDto<Handle_TDocStd_Document>): Handle_TDocStd_Document {
        const resolved = resolveDto(Inputs.OCCT.SetDocLabelNameDto, inputs) as Resolved.OCCT.SetDocLabelNameDto<Handle_TDocStd_Document>;
        const document = checkedDocument(resolved.document, "document");
        const label = this.settableLabel(document, resolved.label, "label");
        if (!this.occ.SetDocLabelName(document, label, resolved.name)) {
            throw labelNotFound(resolved.label, "label");
        }
        return document;
    }

    /**
     * Colors many labels of a document, parts, instances or assemblies, with one color in one
     * change.
     *
     * It answers the colored document as `setDocLabelColor` does, one change for the whole list. A
     * label that names no part, instance or assembly is refused before any is colored; an empty
     * list answers the document as it was.
     * @param inputs - The document, the labels and the four color channels
     * @returns The colored document
     * @group modify
     * @shortname set labels color
     * @drawable false
     * @beta
     * @example
     * ```typescript
     * const parts = await bitbybit.occt.assembly.query.getDocumentParts({ document: doc });
     * const labels = parts.filter(part => part.type === "part").map(part => part.label);
     * const colored = await bitbybit.occt.assembly.manager.setDocLabelColors({ document: doc, labels, r: 1, g: 0, b: 0, a: 1 });
     * ```
     */
    setDocLabelColors(inputs: Inputs.OCCT.SetDocLabelColorsDto<Handle_TDocStd_Document>): Handle_TDocStd_Document {
        const resolved = resolveDto(Inputs.OCCT.SetDocLabelColorsDto, inputs) as Resolved.OCCT.SetDocLabelColorsDto<Handle_TDocStd_Document>;
        const document = checkedDocument(resolved.document, "document");
        this.checkedLabels(document, resolved.labels).forEach(label => this.occ.SetDocLabelColor(document, label, resolved.r, resolved.g, resolved.b, resolved.a));
        return document;
    }

    /**
     * Renames many labels of a document, parts, instances or assemblies, in one change.
     *
     * `names` holds each label's new name, in the order of `labels`. A label that is no part,
     * instance or assembly, a name that is not text, a count unlike the labels' or a label given two
     * names is refused before any is renamed.
     * @param inputs - The document, the labels and the new name of each
     * @returns The renamed document
     * @group modify
     * @shortname set labels name
     * @drawable false
     * @beta
     * @example
     * ```typescript
     * const renamed = await bitbybit.occt.assembly.manager.setDocLabelNames({ document: doc, labels: ["0:1:1:1", "0:1:1:2"], names: ["Left bracket", "Right bracket"] });
     * const tree = await bitbybit.occt.assembly.query.getAssemblyHierarchy({ document: renamed });
     * ```
     */
    setDocLabelNames(inputs: Inputs.OCCT.SetDocLabelNamesDto<Handle_TDocStd_Document>): Handle_TDocStd_Document {
        const resolved = resolveDto(Inputs.OCCT.SetDocLabelNamesDto, inputs) as Resolved.OCCT.SetDocLabelNamesDto<Handle_TDocStd_Document>;
        const document = checkedDocument(resolved.document, "document");
        const labels = this.checkedLabels(document, resolved.labels);
        const names = checkedNames(resolved.names, labels.length);
        const firstAt = new Map<string, number>();
        labels.forEach((label, at) => {
            const earlier = firstAt.get(label);
            if (earlier === undefined) {
                firstAt.set(label, at);
            } else if (names[earlier] !== names[at]) {
                throw new InputError(`\`labels[${at}]\` gives ${label} again, after \`labels[${earlier}]\`, with another name; a label takes one name.`, `labels[${at}]`);
            }
        });
        labels.forEach((label, at) => this.occ.SetDocLabelName(document, label, names[at]!));
        return document;
    }

    private checkedLabels(document: Handle_TDocStd_Document, labels: unknown): string[] {
        if (!Array.isArray(labels)) {
            throw new InputError("`labels` must be a list of labels, such as 0:1:1:1.", "labels");
        }
        return labels.map((label: unknown, at) => this.settableLabel(document, label, `labels[${at}]`));
    }

    private settableLabel(document: Handle_TDocStd_Document, label: unknown, property: string): string {
        const info = typeof label === "string" ? JSON.parse(this.occ.GetDocLabelInfo(document, label)) as KernelLabelInfo : undefined;
        if (info === undefined || info.error !== undefined || typeof info.label !== "string") {
            throw labelNotFound(label, property);
        }
        if (!SETTABLE_LABEL_TYPES.has(info.type ?? "") || !info.label.startsWith(SHAPE_TREE_ENTRY)) {
            throw new InputError(`\`${property}\` is ${JSON.stringify(label)}, which names no part, instance or assembly of the document.`, property);
        }
        return info.label;
    }

    /**
     * Describes one shape of a part for a dimension, datum or tolerance: the part's label and which
     * face, edge or vertex of it.
     *
     * Faces, edges and vertices count from 0 as `shapes.face.getFace`, `shapes.edge.getEdge` and
     * `shapes.vertex.getVertices` count them on the part's shape, which `assembly.query.getShapeFromLabel`
     * reads; `kind` `part` means the whole part.
     * @param inputs - The part's label, whether a face, edge, vertex or the whole part is meant, and its index
     * @returns The shape, ready for the `shapeRefs` of `createPmiDimension`, `createPmiDatum` and `createPmiTolerance`
     * @group pmi
     * @shortname pmi shape
     * @drawable false
     * @beta
     * @example
     * ```typescript
     * const top = await bitbybit.occt.assembly.manager.createPmiShape({ part: "0:1:1:1", kind: Bit.Inputs.OCCT.pmiShapeKindEnum.face, index: 5 });
     * const bottom = await bitbybit.occt.assembly.manager.createPmiShape({ part: "0:1:1:1", kind: Bit.Inputs.OCCT.pmiShapeKindEnum.face, index: 4 });
     * ```
     */
    createPmiShape(inputs: Inputs.OCCT.PmiShapeDto): Inputs.OCCT.PmiShapeDto {
        const resolved = resolveDto(Inputs.OCCT.PmiShapeDto, inputs) as Resolved.OCCT.PmiShapeDto;
        return resolved;
    }

    /**
     * Describes a dimension for `addDocumentPmi`: what it states, its value and tolerance, the
     * shapes it measures, and where its picture is drawn.
     *
     * With `start` and `end` the picture is drawn as `io.drawing.dimensionPicture` draws it, in the
     * plane `normal` faces, in the part's own axes; a `presentation` replaces it. Nothing is written
     * until `addDocumentPmi`.
     * @param inputs - The type, the value, the tolerance, the shapes and how the picture is drawn
     * @returns The dimension, ready for `addDocumentPmi`
     * @group pmi
     * @shortname pmi dimension
     * @drawable false
     * @beta
     * @example
     * ```typescript
     * const thickness = await bitbybit.occt.assembly.manager.createPmiDimension({
     *     type: Bit.Inputs.OCCT.pmiDimensionTypeEnum.linearDistance, value: 15, upperTolerance: 0.1, lowerTolerance: 0.1,
     *     shapeRefs: [{ part: "0:1:1:1", index: 5 }], otherShapeRefs: [{ part: "0:1:1:1", index: 4 }],
     *     start: [30, 0, 15], end: [30, 0, 0], normal: [0, -1, 0], offset: 12,
     * });
     * ```
     */
    createPmiDimension(inputs: Inputs.OCCT.PmiDimensionDto): Inputs.OCCT.PmiDimensionDto {
        const resolved = resolveDto(Inputs.OCCT.PmiDimensionDto, inputs) as Resolved.OCCT.PmiDimensionDto;
        return resolved;
    }

    /**
     * Describes a datum for `addDocumentPmi`: its letter and the shapes it is taken from.
     *
     * A tolerance in the same call must refer to it by letter, as a STEP file keeps a datum only
     * through its tolerances. A letter names one datum in a document, given again only on its
     * shapes. Nothing is written until `addDocumentPmi`.
     * @param inputs - The letter, the shapes and an optional presentation
     * @returns The datum, ready for `addDocumentPmi`
     * @group pmi
     * @shortname pmi datum
     * @drawable false
     * @beta
     * @example
     * ```typescript
     * const datumA = await bitbybit.occt.assembly.manager.createPmiDatum({ letter: "A", shapeRefs: [{ part: "0:1:1:1", index: 4 }] });
     * ```
     */
    createPmiDatum(inputs: Inputs.OCCT.PmiDatumDto): Inputs.OCCT.PmiDatumDto {
        const resolved = resolveDto(Inputs.OCCT.PmiDatumDto, inputs) as Resolved.OCCT.PmiDatumDto;
        return resolved;
    }

    /**
     * Describes a geometric tolerance for `addDocumentPmi`: what it controls, its value, the shapes
     * it applies to and the letters of the datums it refers to, primary first.
     *
     * Only `position`, `perpendicularity` and `parallelism` take a diameter zone or a material
     * condition. Nothing is written until `addDocumentPmi`.
     * @param inputs - The type, the value, the shapes, the datum letters, the zone and material condition and an optional presentation
     * @returns The tolerance, ready for `addDocumentPmi`
     * @group pmi
     * @shortname pmi tolerance
     * @drawable false
     * @beta
     * @example
     * ```typescript
     * const position = await bitbybit.occt.assembly.manager.createPmiTolerance({
     *     type: Bit.Inputs.OCCT.pmiToleranceTypeEnum.position, value: 0.1, shapeRefs: [{ part: "0:1:1:1", index: 7 }],
     *     datumLetters: ["A", "B", "C"], diameterZone: true, material: Bit.Inputs.OCCT.pmiMaterialConditionEnum.maximum,
     * });
     * ```
     */
    createPmiTolerance(inputs: Inputs.OCCT.PmiToleranceDto): Inputs.OCCT.PmiToleranceDto {
        const resolved = resolveDto(Inputs.OCCT.PmiToleranceDto, inputs) as Resolved.OCCT.PmiToleranceDto;
        return resolved;
    }

    /**
     * Adds dimensions, datums and tolerances to a document as product manufacturing
     * information, all of them or, when one is refused, none.
     *
     * Each names a part's faces, edges or vertices. It answers the changed document, which
     * `exportDocumentToStep` writes as STEP AP242 with their pictures; `assembly.query.getDocumentPmi`
     * lists the items with their labels, as taken here. Calls add up until `removeDocumentPmi`.
     * @param inputs - The document and the dimensions, datums and tolerances to add
     * @returns The document with the items added
     * @group pmi
     * @shortname add PMI
     * @drawable false
     * @beta
     * @example
     * ```typescript
     * const measured = await bitbybit.occt.assembly.manager.addDocumentPmi({
     *     document: doc,
     *     dimensions: [{ type: Bit.Inputs.OCCT.pmiDimensionTypeEnum.diameter, value: 10, shapeRefs: [{ part: "0:1:1:1", index: 7 }], start: [30, 20, 15], end: [35, 20, 15] }],
     *     datums: [{ letter: "A", shapeRefs: [{ part: "0:1:1:1", index: 4 }] }],
     *     tolerances: [{ type: Bit.Inputs.OCCT.pmiToleranceTypeEnum.perpendicularity, value: 0.02, shapeRefs: [{ part: "0:1:1:1", index: 7 }], datumLetters: ["A"] }],
     * });
     * const labels = (await bitbybit.occt.assembly.query.getDocumentPmi({ document: measured })).dimensions.map(d => d.label);
     * const step = await bitbybit.occt.assembly.manager.exportDocumentToStep({ document: measured });
     * ```
     * @example
     * ```typescript
     * const pmi = await bitbybit.occt.assembly.query.getDocumentPmi({ document: source });
     * const { annotations } = await bitbybit.occt.assembly.query.getDocumentAnnotations({ document: source });
     * const shown = new Map(annotations.map(annotation => [annotation.label, annotation]));
     * const measured = await bitbybit.occt.assembly.manager.addDocumentPmi({
     *     document: copy,
     *     dimensions: pmi.dimensions.map(d => ({ ...d, type: d.type as Bit.Inputs.OCCT.pmiDimensionTypeEnum, presentation: shown.get(d.label) })),
     *     datums: pmi.datums.map(d => ({ ...d, presentation: shown.get(d.label) })),
     *     tolerances: pmi.tolerances.map(t => ({ ...t, type: t.type as Bit.Inputs.OCCT.pmiToleranceTypeEnum, presentation: shown.get(t.label) })),
     * });
     * ```
     */
    addDocumentPmi(inputs: Inputs.OCCT.AddDocumentPmiDto<Handle_TDocStd_Document>): Handle_TDocStd_Document {
        const resolved = resolveDto(Inputs.OCCT.AddDocumentPmiDto, inputs) as Resolved.OCCT.AddDocumentPmiDto<Handle_TDocStd_Document>;
        return new DocumentPmiWriter(this.occ, this.och.base).add(resolved);
    }

    /**
     * Removes every dimension, datum and geometric tolerance from a document, with their pictures and
     * the saved views that showed only them.
     *
     * It answers the document without them, which exports as one that never held PMI and which
     * `addDocumentPmi` writes into as into a fresh one.
     * @param inputs - The document
     * @returns The document without its PMI
     * @group pmi
     * @shortname remove PMI
     * @drawable false
     * @beta
     * @example
     * ```typescript
     * const cleared = await bitbybit.occt.assembly.manager.removeDocumentPmi({ document: doc });
     * const measured = await bitbybit.occt.assembly.manager.addDocumentPmi({
     *     document: cleared,
     *     dimensions: [{ type: Bit.Inputs.OCCT.pmiDimensionTypeEnum.diameter, value: 12, shapeRefs: [{ part: "0:1:1:1", index: 7 }] }],
     * });
     * ```
     */
    removeDocumentPmi(inputs: Inputs.OCCT.RemoveDocumentPmiDto<Handle_TDocStd_Document>): Handle_TDocStd_Document {
        const resolved = resolveDto(Inputs.OCCT.RemoveDocumentPmiDto, inputs) as Resolved.OCCT.RemoveDocumentPmiDto<Handle_TDocStd_Document>;
        return new DocumentPmiWriter(this.occ, this.och.base).remove(resolved);
    }

    /**
     * Writes an assembly document as a STEP file with its hierarchy, names and colors, and returns
     * the file's bytes.
     *
     * `compress` writes gzip-compressed STEP-Z. A document holding dimensions, datums or tolerances is
     * written as STEP AP242 with them and their pictures, those of each part in that part's own
     * context and units.
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
        const resolved = resolveDto(Inputs.OCCT.ExportDocumentToStepDto, inputs) as Resolved.OCCT.ExportDocumentToStepDto<Handle_TDocStd_Document>;
        const result = withKernelErrorsRead(this.occ, () => resolved.compress
            ? this.occ.ExportDocumentToStepZ(resolved.document, resolved.fileName, resolved.author, resolved.organization)
            : this.occ.ExportDocumentToStep(resolved.document, resolved.fileName, resolved.author, resolved.organization)) as Uint8Array | undefined;
        
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
     * `mergeFaces` joins the faces of a part into one mesh. With the document's `unit`, the file is
     * in metres, glTF's own unit.
     * @param inputs - The document, the meshing settings, the export flags, the unit, the file name and the download option
     * @returns The GLB file as bytes
     * @group export
     * @shortname export document glTF
     * @drawable false
     * @example
     * ```typescript
     * const glb = await bitbybit.occt.assembly.manager.exportDocumentToGltf({ document: doc, meshDeflection: 0.1, meshAngle: 0.5, internalVerticesMode: true, controlSurfaceDeflection: false, mergeFaces: false, forceUVExport: false, fileName: "assembly.glb", tryDownload: false });
     * ```
     */
    exportDocumentToGltf(inputs: Inputs.OCCT.ExportDocumentToGltfDto<Handle_TDocStd_Document>): Uint8Array {
        const resolved = resolveDto(Inputs.OCCT.ExportDocumentToGltfDto, inputs) as Resolved.OCCT.ExportDocumentToGltfDto<Handle_TDocStd_Document>;
        const exportCall = this.occ.ExportDocumentToGltf.bind(this.occ) as GltfExportCall;
        const result = exportCall(
            resolved.document,
            resolved.meshDeflection,
            resolved.meshAngle,
            resolved.internalVerticesMode,
            resolved.controlSurfaceDeflection,
            resolved.mergeFaces,
            resolved.forceUVExport,
            ...this.upFor(exportCall, 7, resolved.up)
        );
        
        if (!result) {
            throw new Error("Failed to export document to glTF");
        }
        return this.inMetres(result, resolved.unit);
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
        const resolved = resolveDto(Inputs.OCCT.ExportDocumentToGltfWithDracoDto, inputs) as Resolved.OCCT.ExportDocumentToGltfWithDracoDto<Handle_TDocStd_Document>;
        const exportCall = this.occ.ExportDocumentToGltfWithDraco.bind(this.occ) as GltfExportCall;
        const result = exportCall(
            resolved.document,
            resolved.meshDeflection,
            resolved.meshAngle,
            resolved.internalVerticesMode,
            resolved.controlSurfaceDeflection,
            resolved.mergeFaces,
            resolved.forceUVExport,
            resolved.useDraco,
            resolved.dracoCompressionLevel,
            resolved.dracoQuantizePositionBits,
            resolved.dracoQuantizeNormalBits,
            resolved.dracoQuantizeTexcoordBits,
            resolved.dracoQuantizeColorBits,
            resolved.dracoQuantizeGenericBits,
            resolved.dracoUnifiedQuantization,
            ...this.upFor(exportCall, 15, resolved.up)
        );

        if (!result) {
            throw new Error("Failed to export document to glTF");
        }
        return this.inMetres(result, resolved.unit);
    }

    private inMetres(glb: Uint8Array, unit: Inputs.Base.unitOfLengthEnum | undefined): Uint8Array {
        const math = this.och.base.math;
        return unit === undefined ? glb : glbWithRootScale(glb, math.millimetresPerUnit({ unit }) / math.millimetresPerUnit({ unit: Inputs.Base.unitOfLengthEnum.metre }));
    }

    /**
     * Triangulates an assembly document and writes it as OBJ, returning the file's text and the
     * text of the material library its `mtllib` line names.
     *
     * The file name without its extension names the library, which holds the parts' colors and is
     * empty for a document without any. Coordinates keep six decimals. `meshDeflection` sets how
     * finely curved surfaces are triangulated.
     * @param inputs - The document, the meshing tolerance, the file name and the download option
     * @returns The OBJ text and the material library text
     * @group export
     * @shortname export document OBJ
     * @drawable false
     * @example
     * ```typescript
     * const files = await bitbybit.occt.assembly.manager.exportDocumentToObj({ document: doc, meshDeflection: 0.1, fileName: "assembly.obj", tryDownload: false });
     * console.log(files.obj, files.mtl);
     * ```
     */
    exportDocumentToObj(inputs: Inputs.OCCT.ExportDocumentToObjDto<Handle_TDocStd_Document>): Models.OCCT.ObjFiles {
        const resolved = resolveDto(Inputs.OCCT.ExportDocumentToObjDto, inputs) as Resolved.OCCT.ExportDocumentToObjDto<Handle_TDocStd_Document>;
        const document = checkedDocument(resolved.document, "document");
        const meshDeflection = checkedNumber(resolved.meshDeflection, "meshDeflection", SMALLEST_MESH_DEFLECTION);
        const name = objNameOf(resolved.fileName, "fileName");
        const files = this.occ.ExportDocumentToObj(document, meshDeflection, name);
        return { obj: files.obj, mtl: files.mtl };
    }

    /**
     * Triangulates an assembly document and writes it as ASCII PLY with a normal per vertex and the
     * parts' colors, returning the file's text.
     *
     * Coordinates keep six significant digits, so a model more than about 1000 units across loses
     * detail below 0.01. `meshDeflection` sets how finely curved surfaces are triangulated.
     * @param inputs - The document, the meshing tolerance, the file name and the download option
     * @returns The PLY file as text
     * @group export
     * @shortname export document PLY
     * @drawable false
     * @example
     * ```typescript
     * const ply = await bitbybit.occt.assembly.manager.exportDocumentToPly({ document: doc, meshDeflection: 0.1, fileName: "assembly.ply", tryDownload: false });
     * ```
     */
    exportDocumentToPly(inputs: Inputs.OCCT.ExportDocumentToPlyDto<Handle_TDocStd_Document>): string {
        const resolved = resolveDto(Inputs.OCCT.ExportDocumentToPlyDto, inputs) as Resolved.OCCT.ExportDocumentToPlyDto<Handle_TDocStd_Document>;
        const document = checkedDocument(resolved.document, "document");
        const meshDeflection = checkedNumber(resolved.meshDeflection, "meshDeflection", SMALLEST_MESH_DEFLECTION);
        return this.occ.ExportDocumentToPly(document, meshDeflection);
    }

}
