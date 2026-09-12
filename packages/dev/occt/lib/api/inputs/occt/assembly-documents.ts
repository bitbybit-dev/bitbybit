// A fragment of the OCCT inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../occ-inputs.ts. Edit here, then regenerate.
import { Base } from "@bitbybit-dev/base";
import * as Models from "../../models";

/**
 * A structure, an optional document to update and optional source documents for
 * `assembly.manager.buildAssemblyDocument`.
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
     * The parts, nodes and updates to build, from `combineStructure`.
     * @default undefined
     */
    structure!: Models.OCCT.AssemblyStructureDef<T>;
    /**
     * A document to update in place instead of creating a new one; its removals and part updates
     * are applied first, then the new parts and nodes added.
     * @default undefined
     * @optional true
     */
    existingDocument?: D | undefined;
    /**
     * The documents imported parts copy from, indexed by `sourceDocumentIndex`; usually loaded with
     * `loadStepToDoc`, and left unchanged.
     * @default undefined
     * @optional true
     */
    sourceDocuments?: D[] | undefined;
}

/**
 * A part definition for `assembly.manager.createPart`: a shape with an id that instance nodes
 * place, as many times as needed.
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
     * The id instance nodes refer to the part by; it must be unique among the parts.
     * @default undefined
     */
    id!: string;
    /**
     * The geometry of the part, shared by every instance of it.
     * @default undefined
     */
    shape!: T;
    /**
     * The name of the part, written into STEP files and shown by viewers.
     * @default undefined
     */
    name!: string;
    /**
     * The color of the part as `{ r, g, b, a }` with every channel from 0 to 1; leave it out for
     * the default gray.
     * @default {"r":0.5,"g":0.5,"b":0.5,"a":1}
     * @minimum 0
     * @maximum 1
     */
    colorRgba?: Base.ColorRGBA | undefined;
}

/**
 * An assembly node definition for `assembly.manager.createAssemblyNode`: a container that groups
 * instances and other assemblies.
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
     * The id child nodes refer to this assembly by; it must be unique among the nodes.
     * @default undefined
     */
    id!: string;
    /**
     * The name of the assembly, written into STEP files and shown by viewers.
     * @default undefined
     */
    name!: string;
    /**
     * The id of the assembly this one sits in; leave it out for a root.
     * @default undefined
     */
    parentId?: string | undefined;
    /**
     * A color for the assembly as `{ r, g, b, a }` with every channel from 0 to 1.
     * @default {"r":0.5,"g":0.5,"b":0.5,"a":1}
     * @minimum 0
     * @maximum 1
     */
    colorRgba?: Base.ColorRGBA | undefined = { r: 0.5, g: 0.5, b: 0.5, a: 1 };
    /**
     * A placement for the whole group as a column-major 4x4 matrix, or a list of them applied first
     * to last.
     * @default undefined
     */
    matrix?: Base.TransformMatrix | Base.TransformMatrixes | undefined;
}

/**
 * An instance node definition for `assembly.manager.createInstanceNode`: one placement of a part,
 * with a translation, rotation and scale or a matrix.
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
     * The id of this placement; it must be unique among the nodes.
     * @default undefined
     */
    id!: string;
    /**
     * The id of the part, or imported part, being placed.
     * @default undefined
     */
    partId!: string;
    /**
     * The name of this placement, written into STEP files and shown by viewers.
     * @default undefined
     */
    name!: string;
    /**
     * The id of the assembly this placement sits in; leave it out for the root.
     * @default undefined
     */
    parentId?: string | undefined;
    /**
     * Where the part is moved to, as `[x, y, z]` in model units.
     * @default [0, 0, 0]
     */
    translation?: Base.Point3 | undefined = [0, 0, 0];
    /**
     * Euler angles `[rx, ry, rz]` in degrees about the X, Y and Z axes; the Z turn is applied
     * first, then Y, then X.
     * @default [0, 0, 0]
     */
    rotation?: Base.Vector3 | undefined = [0, 0, 0];
    /**
     * A uniform scale of the placed part; 1 keeps its size.
     * @default 1.0
     */
    scale?: number | undefined = 1.0;
    /**
     * A color for this placement only, as `{ r, g, b, a }` from 0 to 1, overriding the part's
     * color.
     * @default undefined
     */
    colorRgba?: Base.ColorRGBA | undefined;
    /**
     * The placement as a column-major 4x4 matrix, or a list of them applied first to last; when
     * given, translation, rotation and scale are ignored.
     * @default undefined
     */
    matrix?: Base.TransformMatrix | Base.TransformMatrixes | undefined;
}

/**
 * A change to an existing part for `assembly.manager.createPartUpdate`: a new shape, name or color
 * for the part at a label.
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
     * The label of the part to change, such as `0:1:1:1`, as `assembly.query.getDocumentParts`
     * reports it.
     * @default undefined
     */
    label!: string;
    /**
     * The new geometry of the part; leave it out to keep the old one.
     * @default undefined
     */
    shape?: T | undefined;
    /**
     * The new name of the part; leave it out to keep the old one.
     * @default undefined
     */
    name?: string | undefined;
    /**
     * The new color of the part as `{ r, g, b, a }` from 0 to 1; leave it out to keep the old one.
     * @default undefined
     */
    colorRgba?: Base.ColorRGBA | undefined;
}

/**
 * Parts, nodes and the update lists for `assembly.manager.combineStructure`, which gathers them
 * into one structure for `buildAssemblyDocument`; the update lists only matter when an existing
 * document is updated.
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
     * The part definitions from `createPart`, the shapes that instances place.
     * @default []
     */
    parts: Models.OCCT.AssemblyPartDef<T>[] = [];
    /**
     * The assembly and instance node definitions that make up the tree.
     * @default []
     */
    nodes: Models.OCCT.AssemblyNodeDef[] = [];
    /**
     * Labels of parts, instances or assemblies to remove from an existing document; ignored for a
     * new one.
     * @default undefined
     */
    removals?: string[] | undefined;
    /**
     * Changes to parts of an existing document from `createPartUpdate`; ignored for a new one.
     * @default undefined
     */
    partUpdates?: Models.OCCT.AssemblyPartUpdateDef<T>[] | undefined;
    /**
     * When true, an existing document is emptied before the new parts and nodes are added; when
     * false its content is kept and the removals and updates applied.
     * @default false
     */
    clearDocument = false;
    /**
     * Imported part definitions from `createImportedPart`, each copying a label tree out of one of
     * the source documents so instances can place it.
     * @default undefined
     */
    loadedParts?: Models.OCCT.AssemblyLoadedPartDef[] | undefined;
}

/**
 * An imported part definition for `assembly.manager.createImportedPart`: a label tree copied from
 * another document, placed by instances like any part.
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
     * The id instance nodes refer to the imported part by; it must be unique among the parts.
     * @default undefined
     */
    id!: string;
    /**
     * Which of the `sourceDocuments` given to `buildAssemblyDocument` to copy from, counting from
     * 0.
     * @default 0
     */
    sourceDocumentIndex = 0;
    /**
     * The label of the sub-tree to copy, such as `0:1:1:1`; leave it out to copy every top-level
     * shape of the source document.
     * @default undefined
     */
    sourceLabel?: string | undefined;
    /**
     * A name for the copied root; leave it out to keep the source's name.
     * @default undefined
     */
    name?: string | undefined;
    /**
     * A color for the copied root as `{ r, g, b, a }` from 0 to 1; leave it out to keep the
     * source's colors.
     * @default undefined
     */
    colorRgba?: Base.ColorRGBA | undefined;
}

/**
 * A document, a label and a color for `assembly.manager.setLabelColor`.
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
     * The document from `buildAssemblyDocument` or `loadStepToDoc`.
     * @default undefined
     */
    document!: T;
    /**
     * The label of the part, instance or assembly to color, such as `0:1:1:1`.
     * @default undefined
     */
    label!: string;
    /**
     * The red channel, from 0 to 1.
     * @default 0.5
     * @minimum 0
     * @maximum 1
     * @step 0.01
     */
    r = 0.5;
    /**
     * The green channel, from 0 to 1.
     * @default 0.5
     * @minimum 0
     * @maximum 1
     * @step 0.01
     */
    g = 0.5;
    /**
     * The blue channel, from 0 to 1.
     * @default 0.5
     * @minimum 0
     * @maximum 1
     * @step 0.01
     */
    b = 0.5;
    /**
     * The opacity, from 0 for transparent to 1 for opaque.
     * @default 1.0
     * @minimum 0
     * @maximum 1
     * @step 0.01
     */
    a = 1.0;
}

/**
 * A document, a label and a name for `assembly.manager.setLabelName`.
 */
export class SetDocLabelNameDto<T> {
    constructor(document?: T, label?: string, name?: string) {
        if (document !== undefined) { this.document = document; }
        if (label !== undefined) { this.label = label; }
        if (name !== undefined) { this.name = name; }
    }
    /**
     * The document from `buildAssemblyDocument` or `loadStepToDoc`.
     * @default undefined
     */
    document!: T;
    /**
     * The label of the part, instance or assembly to rename, such as `0:1:1:1`.
     * @default undefined
     */
    label!: string;
    /**
     * The new name written to the label.
     * @default Renamed
     */
    name = "Renamed";
}

/**
 * A document for the queries that read it whole, such as `assembly.query.getDocumentParts` and
 * `getAssemblyHierarchy`, and for deleting it.
 */
export class DocumentQueryDto<T> {
    constructor(document?: T) {
        if (document !== undefined) { this.document = document; }
    }
    /**
     * The document from `buildAssemblyDocument` or `loadStepToDoc`.
     * @default undefined
     */
    document!: T;
}

/**
 * A document and one label for the queries that read a single label, such as
 * `assembly.query.getShapeFromLabel` and `getLabelColor`.
 */
export class DocumentLabelQueryDto<T> {
    constructor(document?: T, label?: string) {
        if (document !== undefined) { this.document = document; }
        if (label !== undefined) { this.label = label; }
    }
    /**
     * The document from `buildAssemblyDocument` or `loadStepToDoc`.
     * @default undefined
     */
    document!: T;
    /**
     * The label to read, such as `0:1:1:1`, as `getDocumentParts` reports it.
     * @default undefined
     */
    label!: string;
}

/**
 * A STEP file for `assembly.manager.loadStepToDoc`, which reads it into an assembly document.
 */
export class LoadStepToDocDto {
    constructor(stepData?: string | ArrayBuffer | Uint8Array | File | Blob) {
        if (stepData !== undefined) { this.stepData = stepData; }
    }
    /**
     * The STEP file as text, ArrayBuffer, Uint8Array, File or Blob; gzip-compressed STEP-Z is
     * unpacked on its own.
     * @default undefined
     */
    stepData!: string | ArrayBuffer | Uint8Array | File | Blob;
}

/**
 * A document and file options for `assembly.manager.exportDocumentToStep`.
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
     * The document from `buildAssemblyDocument` or `loadStepToDoc`.
     * @default undefined
     */
    document!: T;
    /**
     * The file name written into the STEP header and used for the download.
     * @default assembly.step
     */
    fileName = "assembly.step";
    /**
     * The author written into the STEP header.
     * @default Bitbybit user
     */
    author = "Bitbybit user";
    /**
     * The organization written into the STEP header.
     * @default Bitbybit
     */
    organization = "Bitbybit";
    /**
     * When true, the file is written as gzip-compressed STEP-Z.
     * @default false
     */
    compress = false;
    /**
     * When true, a browser download of the file is started where that is possible; the kernel
     * itself only returns the bytes.
     * @default false
     */
    tryDownload = false;
}

/**
 * A document, meshing settings and file options for `assembly.manager.exportDocumentToGltf`.
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
     * The document from `buildAssemblyDocument` or `loadStepToDoc`.
     * @default undefined
     */
    document!: T;
    /**
     * How closely triangles follow curved surfaces, in model units; smaller gives a finer mesh.
     * @default 0.1
     */
    meshDeflection = 0.1;
    /**
     * The largest angle, in radians, between the normals of neighboring triangles; smaller gives
     * smoother curves.
     * @default 0.5
     */
    meshAngle = 0.5;
    /**
     * When true, extra vertices are added inside curved faces for a closer fit, at the cost of
     * speed.
     * @default false
     */
    internalVerticesMode = false;
    /**
     * When true, an extra pass refines triangles that bulge beyond the deflection, at the cost of
     * speed.
     * @default false
     */
    controlSurfaceDeflection = false;
    /**
     * When true, faces with the same material are joined into one mesh; false keeps every face
     * separate.
     * @default false
     */
    mergeFaces = false;
    /**
     * When true, texture coordinates are written even for meshes without textures.
     * @default false
     */
    forceUVExport = false;
    /**
     * The name the downloaded file gets; it should end in `.glb`.
     * @default assembly.glb
     */
    fileName = "assembly.glb";
    /**
     * When true, a browser download of the file is started where that is possible; the kernel
     * itself only returns the bytes.
     * @default false
     */
    tryDownload = false;
}

/**
 * A document, meshing settings and Draco settings for
 * `assembly.manager.exportDocumentToGltfWithDraco`, which writes a Draco-compressed glTF.
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
     * When true, the geometry is compressed with Draco.
     * @default true
     */
    useDraco = true;
    /**
     * How hard Draco compresses, from 0 for fastest and largest to 10 for slowest and smallest.
     * @default 7
     * @minimum 0
     * @maximum 10
     * @step 1
     */
    dracoCompressionLevel = 7;
    /**
     * How many bits each vertex position keeps; fewer bits mean a smaller file and less precision.
     * @default 14
     * @minimum 0
     * @maximum 31
     * @step 1
     */
    dracoQuantizePositionBits = 14;
    /**
     * How many bits each normal keeps; fewer bits mean a smaller file and less precision.
     * @default 10
     * @minimum 0
     * @maximum 31
     * @step 1
     */
    dracoQuantizeNormalBits = 10;
    /**
     * How many bits each texture coordinate keeps; fewer bits mean a smaller file and less
     * precision.
     * @default 12
     * @minimum 0
     * @maximum 31
     * @step 1
     */
    dracoQuantizeTexcoordBits = 12;
    /**
     * How many bits each vertex color keeps; fewer bits mean a smaller file and less precision.
     * @default 8
     * @minimum 0
     * @maximum 31
     * @step 1
     */
    dracoQuantizeColorBits = 8;
    /**
     * How many bits other vertex attributes keep; fewer bits mean a smaller file and less
     * precision.
     * @default 12
     * @minimum 0
     * @maximum 31
     * @step 1
     */
    dracoQuantizeGenericBits = 12;
    /**
     * When true, one quantization grid is used for every attribute instead of one per attribute.
     * @default false
     */
    dracoUnifiedQuantization = false;
}

