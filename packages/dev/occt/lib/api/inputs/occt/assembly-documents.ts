// A fragment of the OCCT inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../occ-inputs.ts. Edit here, then regenerate.
import { Base } from "@bitbybit-dev/base";
import * as Models from "../../models";

/**
 * DTO for building an assembly document.
 * Returns a document handle that the caller manages.
 * @typeParam T - Shape type (TopoDS_Shape or pointer)
 * @typeParam D - Document type (Handle_TDocStd_Document or pointer)
 */
export class BuildAssemblyDocumentDto<T, D> {
    constructor(structure?: Models.OCCT.AssemblyStructureDef<T>, existingDocument?: D, sourceDocuments?: D[]) {
        if (structure !== undefined) { this.structure = structure; }
        if (existingDocument !== undefined) { this.existingDocument = existingDocument; }
        if (sourceDocuments !== undefined) { this.sourceDocuments = sourceDocuments; }
    }
    /**
     * Assembly structure definition with parts and nodes
     * @default undefined
     */
    structure!: Models.OCCT.AssemblyStructureDef<T>;
    /**
     * Optional existing document handle to reuse.
     * If provided and valid, the document will be cleared and updated instead of creating a new one.
     * This is useful for updating an assembly without creating a new document each time.
     * @default undefined
     * @optional true
     */
    existingDocument?: D | undefined;
    /**
     * Optional array of source document handles referenced by `structure.loadedParts` entries
     * via `sourceDocumentIndex`. Typically these are documents previously loaded with
     * loadStepToDoc. Lifetime of source documents is the caller's responsibility — they are
     * not modified or deleted by buildAssemblyDocument.
     * @default undefined
     * @optional true
     */
    sourceDocuments?: D[] | undefined;
}

/**
 * DTO for creating a single assembly part definition.
 * Use this in visual programming to define a part that can be instanced.
 */
export class CreateAssemblyPartDto<T> {
    constructor(
        id?: string,
        shape?: T,
        name?: string,
        colorRgba?: Base.ColorRGBA
    ) {
        if (id !== undefined) { this.id = id; }
        if (shape !== undefined) { this.shape = shape; }
        if (name !== undefined) { this.name = name; }
        if (colorRgba !== undefined) { this.colorRgba = colorRgba; }
    }
    /**
     * Unique identifier for referencing this part in nodes
     * @default undefined
     */
    id!: string;
    /**
     * The shape for this part
     * @default undefined
     */
    shape!: T;
    /**
     * Display name for the part (appears in STEP file and viewers)
     * @default undefined
     */
    name!: string;
    /**
     * Optional color for the part (RGBA, values 0-1)
     * @default {"r":0.5,"g":0.5,"b":0.5,"a":1}
     * @min 0
     * @max 1
     */
    colorRgba?: Base.ColorRGBA | undefined;
}

/**
 * DTO for creating an assembly node (container for other nodes).
 * Assembly nodes group instances and other assemblies together.
 */
export class CreateAssemblyNodeDto {
    constructor(
        id?: string,
        name?: string,
        parentId?: string,
        colorRgba?: Base.ColorRGBA,
        matrix?: Base.TransformMatrix | Base.TransformMatrixes
    ) {
        if (id !== undefined) { this.id = id; }
        if (name !== undefined) { this.name = name; }
        if (parentId !== undefined) { this.parentId = parentId; }
        if (colorRgba !== undefined) { this.colorRgba = colorRgba; }
        if (matrix !== undefined) { this.matrix = matrix; }
    }
    /**
     * Unique identifier for this assembly node
     * @default undefined
     */
    id!: string;
    /**
     * Display name for the assembly
     * @default undefined
     */
    name!: string;
    /**
     * Parent node ID. Leave undefined for root level assembly.
     * @default undefined
     */
    parentId?: string | undefined;
    /**
     * Optional color for the assembly
     * @default {"r":0.5,"g":0.5,"b":0.5,"a":1}
     * @min 0
     * @max 1
     */
    colorRgba?: Base.ColorRGBA | undefined = { r: 0.5, g: 0.5, b: 0.5, a: 1 };
    /**
     * Optional placement matrix (column-major, 16 numbers) or an ordered list of
     * matrices applied first-to-last. When provided it fully defines the node's
     * placement and takes precedence over any translation/rotation/scale.
     * @default undefined
     */
    matrix?: Base.TransformMatrix | Base.TransformMatrixes | undefined;
}

/**
 * DTO for creating an instance node (reference to a part with transform).
 * Instance nodes place a part at a specific location with optional transform.
 */
export class CreateInstanceNodeDto {
    constructor(
        id?: string,
        partId?: string,
        name?: string,
        parentId?: string,
        translation?: Base.Point3,
        rotation?: Base.Vector3,
        scale?: number,
        colorRgba?: Base.ColorRGBA,
        matrix?: Base.TransformMatrix | Base.TransformMatrixes
    ) {
        if (id !== undefined) { this.id = id; }
        if (partId !== undefined) { this.partId = partId; }
        if (name !== undefined) { this.name = name; }
        if (parentId !== undefined) { this.parentId = parentId; }
        if (translation !== undefined) { this.translation = translation; }
        if (rotation !== undefined) { this.rotation = rotation; }
        if (scale !== undefined) { this.scale = scale; }
        if (colorRgba !== undefined) { this.colorRgba = colorRgba; }
        if (matrix !== undefined) { this.matrix = matrix; }
    }
    /**
     * Unique identifier for this instance node
     * @default undefined
     */
    id!: string;
    /**
     * ID of the part to instance (must match a part's id)
     * @default undefined
     */
    partId!: string;
    /**
     * Display name for this instance
     * @default undefined
     */
    name!: string;
    /**
     * Parent assembly node ID. Leave undefined for root level.
     * @default undefined
     */
    parentId?: string | undefined;
    /**
     * Translation as [x, y, z]
     * @default [0, 0, 0]
     */
    translation?: Base.Point3 | undefined = [0, 0, 0];
    /**
     * Rotation as [rx, ry, rz] Euler angles in degrees (applied Rx * Ry * Rz)
     * @default [0, 0, 0]
     */
    rotation?: Base.Vector3 | undefined = [0, 0, 0];
    /**
     * Uniform scale factor
     * @default 1.0
     */
    scale?: number | undefined = 1.0;
    /**
     * Optional color override for this instance
     * @default undefined
     */
    colorRgba?: Base.ColorRGBA | undefined;
    /**
     * Optional placement matrix (column-major, 16 numbers) or an ordered list of
     * matrices applied first-to-last. When provided it fully defines the instance's
     * placement and takes precedence over translation/rotation/scale.
     * @default undefined
     */
    matrix?: Base.TransformMatrix | Base.TransformMatrixes | undefined;
}

/**
 * DTO for creating a part update definition.
 * Part updates specify changes to apply to existing parts in a document.
 */
export class CreatePartUpdateDto<T> {
    constructor(
        label?: string,
        shape?: T,
        name?: string,
        colorRgba?: Base.ColorRGBA
    ) {
        if (label !== undefined) { this.label = label; }
        if (shape !== undefined) { this.shape = shape; }
        if (name !== undefined) { this.name = name; }
        if (colorRgba !== undefined) { this.colorRgba = colorRgba; }
    }
    /**
     * Label of the existing part to update (e.g., "0:1:1:1").
     * Obtain this from document queries like getDocumentParts.
     * @default undefined
     */
    label!: string;
    /**
     * New shape to replace the existing shape.
     * If undefined, the shape is not changed.
     * @default undefined
     */
    shape?: T | undefined;
    /**
     * New name for the part.
     * If undefined, the name is not changed.
     * @default undefined
     */
    name?: string | undefined;
    /**
     * New color for the part.
     * If undefined, the color is not changed.
     * @default undefined
     */
    colorRgba?: Base.ColorRGBA | undefined;
}

/**
 * DTO for combining parts and nodes into an assembly structure.
 * Use this as the final step to create a complete structure definition.
 * 
 * For updating existing documents:
 * - Use `removals` to specify labels to remove
 * - Use `partUpdates` to update existing parts (shape, name, color)
 */
export class CombineAssemblyStructureDto<T> {
    constructor(
        parts?: Models.OCCT.AssemblyPartDef<T>[],
        nodes?: Models.OCCT.AssemblyNodeDef[],
        removals?: string[],
        partUpdates?: Models.OCCT.AssemblyPartUpdateDef<T>[],
        clearDocument?: boolean,
        loadedParts?: Models.OCCT.AssemblyLoadedPartDef[]
    ) {
        if (parts !== undefined) { this.parts = parts; }
        if (nodes !== undefined) { this.nodes = nodes; }
        if (removals !== undefined) { this.removals = removals; }
        if (partUpdates !== undefined) { this.partUpdates = partUpdates; }
        if (clearDocument !== undefined) { this.clearDocument = clearDocument; }
        if (loadedParts !== undefined) { this.loadedParts = loadedParts; }
    }
    /**
     * List of part definitions (shapes that can be instanced)
     * @default []
     */
    parts: Models.OCCT.AssemblyPartDef<T>[] = [];
    /**
     * List of node definitions (assemblies and instances)
     * @default []
     */
    nodes: Models.OCCT.AssemblyNodeDef[] = [];
    /**
     * Labels to remove from existing document.
     * Can be part labels, instance labels, or assembly labels.
     * Ignored when creating a new document (no existingDocument provided).
     * @default undefined
     */
    removals?: string[] | undefined;
    /**
     * Updates to apply to existing parts in the document.
     * Each update can change the shape, name, and/or color of a part.
     * Ignored when creating a new document (no existingDocument provided).
     * @default undefined
     */
    partUpdates?: Models.OCCT.AssemblyPartUpdateDef<T>[] | undefined;
    /**
     * Whether to clear the existing document before adding new content.
     * Only relevant when an existingDocument is provided to buildAssemblyDocument.
     * 
     * - `true`: Clear all existing shapes, then add new parts/nodes (full rebuild)
     * - `false`: Keep existing shapes, apply removals/updates, add new parts/nodes (incremental)
     * 
     * @default false
     */
    clearDocument = false;
    /**
     * Parts imported from other documents (e.g. STEP-loaded). Each entry references a
     * source document via `sourceDocumentIndex` (matching the order of `sourceDocuments`
     * on buildAssemblyDocument) and copies a label (or all free shapes) into this assembly,
     * preserving sub-assembly hierarchy, names and colors. Instance nodes can then reference
     * them by `partId` to place the imported assembly multiple times with different transforms.
     * @default undefined
     */
    loadedParts?: Models.OCCT.AssemblyLoadedPartDef[] | undefined;
}

/**
 * DTO for creating an imported part definition.
 * Imported parts copy a label tree from a source document (typically STEP-loaded) into
 * the new assembly, preserving sub-assembly hierarchy. They become referenceable as a
 * single part (by id) from any instance node.
 */
export class CreateImportedPartDto {
    constructor(
        id?: string,
        sourceDocumentIndex?: number,
        sourceLabel?: string,
        name?: string,
        colorRgba?: Base.ColorRGBA
    ) {
        if (id !== undefined) { this.id = id; }
        if (sourceDocumentIndex !== undefined) { this.sourceDocumentIndex = sourceDocumentIndex; }
        if (sourceLabel !== undefined) { this.sourceLabel = sourceLabel; }
        if (name !== undefined) { this.name = name; }
        if (colorRgba !== undefined) { this.colorRgba = colorRgba; }
    }
    /**
     * Unique identifier for referencing this imported part from instance nodes (via partId).
     * @default undefined
     */
    id!: string;
    /**
     * Index into the `sourceDocuments` array passed to buildAssemblyDocument.
     * @default 0
     */
    sourceDocumentIndex = 0;
    /**
     * Optional OCAF entry string of the label to copy from the source document (e.g. "0:1:1:1").
     * If omitted, all free shapes of the source document are imported (wrapped in a new
     * assembly compound when there are multiple).
     * @default undefined
     */
    sourceLabel?: string | undefined;
    /**
     * Optional display name override applied to the imported root label.
     * @default undefined
     */
    name?: string | undefined;
    /**
     * Optional color override applied to the imported root label.
     * @default undefined
     */
    colorRgba?: Base.ColorRGBA | undefined;
}

/**
 * DTO for setting the color of a label in a document.
 * Takes the document handle directly instead of docId.
 */
export class SetDocLabelColorDto<T> {
    constructor(
        document?: T,
        label?: string,
        r?: number,
        g?: number,
        b?: number,
        a?: number
    ) {
        if (document !== undefined) { this.document = document; }
        if (label !== undefined) { this.label = label; }
        if (r !== undefined) { this.r = r; }
        if (g !== undefined) { this.g = g; }
        if (b !== undefined) { this.b = b; }
        if (a !== undefined) { this.a = a; }
    }
    /**
     * Assembly document handle from buildAssemblyDocument or loadStepToDoc
     * @default undefined
     */
    document!: T;
    /**
     * Label of the part/instance to color
     * @default undefined
     */
    label!: string;
    /**
     * Red component (0.0 - 1.0)
     * @default 0.5
     * @minimum 0
     * @maximum 1
     * @step 0.01
     */
    r = 0.5;
    /**
     * Green component (0.0 - 1.0)
     * @default 0.5
     * @minimum 0
     * @maximum 1
     * @step 0.01
     */
    g = 0.5;
    /**
     * Blue component (0.0 - 1.0)
     * @default 0.5
     * @minimum 0
     * @maximum 1
     * @step 0.01
     */
    b = 0.5;
    /**
     * Alpha component (0.0 - 1.0, 1.0 = opaque)
     * @default 1.0
     * @minimum 0
     * @maximum 1
     * @step 0.01
     */
    a = 1.0;
}

/**
 * DTO for setting the name of a label in a document.
 * Takes the document handle directly instead of docId.
 */
export class SetDocLabelNameDto<T> {
    constructor(document?: T, label?: string, name?: string) {
        if (document !== undefined) { this.document = document; }
        if (label !== undefined) { this.label = label; }
        if (name !== undefined) { this.name = name; }
    }
    /**
     * Assembly document handle from buildAssemblyDocument or loadStepToDoc
     * @default undefined
     */
    document!: T;
    /**
     * Label to rename
     * @default undefined
     */
    label!: string;
    /**
     * New name
     * @default Renamed
     */
    name = "Renamed";
}

/**
 * DTO for querying a document (e.g., get parts, hierarchy).
 * Takes the document handle directly.
 */
export class DocumentQueryDto<T> {
    constructor(document?: T) {
        if (document !== undefined) { this.document = document; }
    }
    /**
     * Assembly document handle from buildAssemblyDocument or loadStepToDoc
     * @default undefined
     */
    document!: T;
}

/**
 * DTO for querying a specific label in a document.
 * Takes the document handle directly.
 */
export class DocumentLabelQueryDto<T> {
    constructor(document?: T, label?: string) {
        if (document !== undefined) { this.document = document; }
        if (label !== undefined) { this.label = label; }
    }
    /**
     * Assembly document handle from buildAssemblyDocument or loadStepToDoc
     * @default undefined
     */
    document!: T;
    /**
     * Label entry string (e.g., "0:1:1:1")
     * @default undefined
     */
    label!: string;
}

/**
 * DTO for loading a STEP file and returning a document handle.
 */
export class LoadStepToDocDto {
    constructor(stepData?: string | ArrayBuffer | Uint8Array | File | Blob) {
        if (stepData !== undefined) { this.stepData = stepData; }
    }
    /**
     * STEP file content.
     * Accepts string, ArrayBuffer, Uint8Array, File, or Blob.
     * Supports both regular STEP and gzip-compressed STEP-Z.
     * @default undefined
     */
    stepData!: string | ArrayBuffer | Uint8Array | File | Blob;
}

/**
 * DTO for exporting an assembly document to STEP format.
 * Takes the document handle directly.
 */
export class ExportDocumentToStepDto<T> {
    constructor(
        document?: T,
        fileName?: string,
        author?: string,
        organization?: string,
        compress?: boolean,
        tryDownload?: boolean
    ) {
        if (document !== undefined) { this.document = document; }
        if (fileName !== undefined) { this.fileName = fileName; }
        if (author !== undefined) { this.author = author; }
        if (organization !== undefined) { this.organization = organization; }
        if (compress !== undefined) { this.compress = compress; }
        if (tryDownload !== undefined) { this.tryDownload = tryDownload; }
    }
    /**
     * Assembly document handle from buildAssemblyDocument or loadStepToDoc
     * @default undefined
     */
    document!: T;
    /**
     * File name for the STEP header and download
     * @default assembly.step
     */
    fileName = "assembly.step";
    /**
     * Author name for the STEP header (optional)
     * @default Bitbybit user
     */
    author = "Bitbybit user";
    /**
     * Organization name for the STEP header (optional)
     * @default Bitbybit
     */
    organization = "Bitbybit";
    /**
     * Whether to compress as STEP-Z (gzip)
     * @default false
     */
    compress = false;
    /**
     * Whether to trigger a file download in the browser
     * @default false
     */
    tryDownload = false;
}

/**
 * DTO for exporting an assembly document directly to glTF (GLB) format.
 * Takes the document handle directly.
 */
export class ExportDocumentToGltfDto<T> {
    constructor(
        document?: T,
        meshDeflection?: number,
        meshAngle?: number,
        mergeFaces?: boolean,
        forceUVExport?: boolean,
        fileName?: string,
        tryDownload?: boolean
    ) {
        if (document !== undefined) { this.document = document; }
        if (meshDeflection !== undefined) { this.meshDeflection = meshDeflection; }
        if (meshAngle !== undefined) { this.meshAngle = meshAngle; }
        if (mergeFaces !== undefined) { this.mergeFaces = mergeFaces; }
        if (forceUVExport !== undefined) { this.forceUVExport = forceUVExport; }
        if (fileName !== undefined) { this.fileName = fileName; }
        if (tryDownload !== undefined) { this.tryDownload = tryDownload; }
    }
    /**
     * Assembly document handle from buildAssemblyDocument or loadStepToDoc
     * @default undefined
     */
    document!: T;
    /**
     * Mesh precision for triangulation. Lower values = finer mesh.
     * @default 0.1
     */
    meshDeflection = 0.1;
    /**
     * Angular deflection for meshing in radians. Lower values = smoother curves.
     * @default 0.5
     */
    meshAngle = 0.5;
    /**
     * Add interior vertices for better curved face fidelity (slower, set false for speed).
     * @default false
     */
    internalVerticesMode = false;
    /**
     * Extra post-pass refining triangles that bulge beyond the deflection (slower,
     * set false for speed).
     * @default false
     */
    controlSurfaceDeflection = false;
    /**
     * Whether to merge faces with same material for optimization.
     * Set to false to preserve face boundaries.
     * @default false
     */
    mergeFaces = false;
    /**
     * Whether to export texture coordinates (UVs).
     * @default false
     */
    forceUVExport = false;
    /**
     * File name for download (optional, should end with .glb)
     * @default assembly.glb
     */
    fileName = "assembly.glb";
    /**
     * Whether to trigger a file download in the browser
     * @default false
     */
    tryDownload = false;
}

/**
 * DTO for exporting an assembly document directly to glTF (GLB) format with
 * explicit Draco geometry compression settings. Mirrors `ExportDocumentToGltfDto`
 * and exposes the 8 Draco knobs of the underlying native function.
 */
export class ExportDocumentToGltfWithDracoDto<T> extends ExportDocumentToGltfDto<T> {
    constructor(
        document?: T,
        meshDeflection?: number,
        meshAngle?: number,
        mergeFaces?: boolean,
        forceUVExport?: boolean,
        fileName?: string,
        tryDownload?: boolean
    ) {
        super(document, meshDeflection, meshAngle, mergeFaces, forceUVExport, fileName, tryDownload);
    }
    /**
     * Enable Draco geometry compression on output.
     * @default true
     */
    useDraco = true;
    /**
     * Draco compression level - 0 (fastest, largest) ... 10 (slowest, smallest).
     * @default 7
     * @minimum 0
     * @maximum 10
     * @step 1
     */
    dracoCompressionLevel = 7;
    /**
     * Quantization bits for vertex positions.
     * @default 14
     * @minimum 0
     * @maximum 31
     * @step 1
     */
    dracoQuantizePositionBits = 14;
    /**
     * Quantization bits for normals.
     * @default 10
     * @minimum 0
     * @maximum 31
     * @step 1
     */
    dracoQuantizeNormalBits = 10;
    /**
     * Quantization bits for texture coordinates (UVs).
     * @default 12
     * @minimum 0
     * @maximum 31
     * @step 1
     */
    dracoQuantizeTexcoordBits = 12;
    /**
     * Quantization bits for vertex colors.
     * @default 8
     * @minimum 0
     * @maximum 31
     * @step 1
     */
    dracoQuantizeColorBits = 8;
    /**
     * Quantization bits for generic attributes.
     * @default 12
     * @minimum 0
     * @maximum 31
     * @step 1
     */
    dracoQuantizeGenericBits = 12;
    /**
     * Apply a single quantization grid across all attributes.
     * @default false
     */
    dracoUnifiedQuantization = false;
}

