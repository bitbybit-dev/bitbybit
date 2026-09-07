// A fragment of the OCCT inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../occ-inputs.ts. Edit here, then regenerate.
import { Base } from "@bitbybit-dev/base";
import { IO } from "@bitbybit-dev/base/lib/api/inputs/io-inputs";
import { dxfAcadVersionEnum, dxfColorFormatEnum, fileTypeEnum } from "./enums";

export class ShapeToMeshDto<T> {
    constructor(shape?: T, precision?: number, adjustYtoZ?: boolean, computeMetadata?: boolean, keepMeshData?: boolean, allowQualityDecrease?: boolean, forceFaceDeflection?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (precision !== undefined) { this.precision = precision; }
        if (adjustYtoZ !== undefined) { this.adjustYtoZ = adjustYtoZ; }
        if (computeMetadata !== undefined) { this.computeMetadata = computeMetadata; }
        if (keepMeshData !== undefined) { this.keepMeshData = keepMeshData; }
        if (allowQualityDecrease !== undefined) { this.allowQualityDecrease = allowQualityDecrease; }
        if (forceFaceDeflection !== undefined) { this.forceFaceDeflection = forceFaceDeflection; }
    }
    /**
     * Shape to save
     * @default undefined
     */
    shape!: T;
    /**
     * Precision of the mesh
     * @default 0.01
     * @minimum 0
     * @maximum Infinity
     * @step 0.001
     */
    precision = 0.01;
    /**
     * Adjust Y (up) coordinate system to Z (up) coordinate system
     * @default false
     */
    adjustYtoZ = false;
    /**
     * Compute additional per-face and per-edge metadata (area, length, centers of mass,
     * surface/curve type, tolerance and adjacency). Adds cost; base mesh is unchanged when false.
     * @default false
     */
    computeMetadata?: boolean | undefined = false;
    /**
     * Keep the cached triangulation on the shape after meshing. When false (default) the mesh data
     * is flushed off the shape so it does not accumulate in memory across calls.
     * @default false
     */
    keepMeshData?: boolean | undefined = false;
    /**
     * Allow re-meshing to a lower resolution triangulation than one already cached on the shape
     * (OCCT IMeshTools_Parameters.AllowQualityDecrease).
     * @default true
     */
    allowQualityDecrease?: boolean | undefined = true;
    /**
     * Force every face to be re-meshed to the requested precision regardless of any cached
     * triangulation (OCCT IMeshTools_Parameters.ForceFaceDeflection).
     * @default false
     */
    forceFaceDeflection?: boolean | undefined = false;
}
export class ShapeFacesToPolygonPointsDto<T> {
    constructor(shape?: T, precision?: number, adjustYtoZ?: boolean, reversedPoints?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (precision !== undefined) { this.precision = precision; }
        if (adjustYtoZ !== undefined) { this.adjustYtoZ = adjustYtoZ; }
        if (reversedPoints !== undefined) { this.reversedPoints = reversedPoints; }
    }
    /**
     * Shape to save
     * @default undefined
     */
    shape!: T;
    /**
     * Precision of the mesh
     * @default 0.01
     * @minimum 0
     * @maximum Infinity
     * @step 0.001
     */
    precision = 0.01;
    /**
     * Adjust Y (up) coordinate system to Z (up) coordinate system
     * @default false
     */
    adjustYtoZ = false;
    /**
     * Reverse the order of the points describing the polygon because some CAD kernels use the opposite order
     * @default false
     */
    reversedPoints = false;
}
export class ShapesToMeshesDto<T> {
    constructor(shapes?: T[], precision?: number, adjustYtoZ?: boolean, computeMetadata?: boolean, keepMeshData?: boolean, allowQualityDecrease?: boolean, forceFaceDeflection?: boolean) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (precision !== undefined) { this.precision = precision; }
        if (adjustYtoZ !== undefined) { this.adjustYtoZ = adjustYtoZ; }
        if (computeMetadata !== undefined) { this.computeMetadata = computeMetadata; }
        if (keepMeshData !== undefined) { this.keepMeshData = keepMeshData; }
        if (allowQualityDecrease !== undefined) { this.allowQualityDecrease = allowQualityDecrease; }
        if (forceFaceDeflection !== undefined) { this.forceFaceDeflection = forceFaceDeflection; }
    }
    /**
     * Shapes to transform
     * @default undefined
     */
    shapes!: T[];
    /**
     * Precision of the mesh
     * @default 0.01
     * @minimum 0
     * @maximum Infinity
     * @step 0.001
     */
    precision = 0.01;
    /**
     * Adjust Y (up) coordinate system to Z (up) coordinate system
     * @default false
     */
    adjustYtoZ = false;
    /**
     * Compute additional per-face and per-edge metadata (area, length, centers of mass,
     * surface/curve type, tolerance and adjacency). Adds cost; base mesh is unchanged when false.
     * @default false
     */
    computeMetadata?: boolean | undefined = false;
    /**
     * Keep the cached triangulation on each shape after meshing. When false (default) the mesh data
     * is flushed so it does not accumulate in memory across calls.
     * @default false
     */
    keepMeshData?: boolean | undefined = false;
    /**
     * Allow re-meshing to a lower resolution triangulation than one already cached on a shape
     * (OCCT IMeshTools_Parameters.AllowQualityDecrease).
     * @default true
     */
    allowQualityDecrease?: boolean | undefined = true;
    /**
     * Force every face to be re-meshed to the requested precision regardless of any cached
     * triangulation (OCCT IMeshTools_Parameters.ForceFaceDeflection).
     * @default false
     */
    forceFaceDeflection?: boolean | undefined = false;
}
export class DocToMeshDto<U> {
    constructor(document?: U, precision?: number, adjustYtoZ?: boolean, computeMetadata?: boolean, keepMeshData?: boolean, allowQualityDecrease?: boolean, forceFaceDeflection?: boolean) {
        if (document !== undefined) { this.document = document; }
        if (precision !== undefined) { this.precision = precision; }
        if (adjustYtoZ !== undefined) { this.adjustYtoZ = adjustYtoZ; }
        if (computeMetadata !== undefined) { this.computeMetadata = computeMetadata; }
        if (keepMeshData !== undefined) { this.keepMeshData = keepMeshData; }
        if (allowQualityDecrease !== undefined) { this.allowQualityDecrease = allowQualityDecrease; }
        if (forceFaceDeflection !== undefined) { this.forceFaceDeflection = forceFaceDeflection; }
    }
    /**
     * The XCAF document to mesh. Its free (top-level) shapes are meshed as one combined mesh and
     * per-face colours are resolved from the document into the colorGroups map of the output.
     * @default undefined
     */
    document!: U;
    /**
     * Precision of the mesh
     * @default 0.01
     * @minimum 0
     * @maximum Infinity
     * @step 0.001
     */
    precision = 0.01;
    /**
     * Adjust Y (up) coordinate system to Z (up) coordinate system
     * @default false
     */
    adjustYtoZ = false;
    /**
     * Compute additional per-face and per-edge metadata (area, length, centers of mass,
     * surface/curve type, tolerance, adjacency, UIDs). Adds cost; base mesh is unchanged when false.
     * @default false
     */
    computeMetadata?: boolean | undefined = false;
    /**
     * Keep the cached triangulation on the shape after meshing. When false (default) the mesh data
     * is flushed off the shape so it does not accumulate in memory across calls.
     * @default false
     */
    keepMeshData?: boolean | undefined = false;
    /**
     * Allow re-meshing to a lower resolution triangulation than one already cached on the shape
     * (OCCT IMeshTools_Parameters.AllowQualityDecrease).
     * @default true
     */
    allowQualityDecrease?: boolean | undefined = true;
    /**
     * Force every face to be re-meshed to the requested precision regardless of any cached
     * triangulation (OCCT IMeshTools_Parameters.ForceFaceDeflection).
     * @default false
     */
    forceFaceDeflection?: boolean | undefined = false;
}
export class DocToMeshesDto<U> {
    constructor(document?: U, precision?: number, adjustYtoZ?: boolean, computeMetadata?: boolean, keepMeshData?: boolean, allowQualityDecrease?: boolean, forceFaceDeflection?: boolean) {
        if (document !== undefined) { this.document = document; }
        if (precision !== undefined) { this.precision = precision; }
        if (adjustYtoZ !== undefined) { this.adjustYtoZ = adjustYtoZ; }
        if (computeMetadata !== undefined) { this.computeMetadata = computeMetadata; }
        if (keepMeshData !== undefined) { this.keepMeshData = keepMeshData; }
        if (allowQualityDecrease !== undefined) { this.allowQualityDecrease = allowQualityDecrease; }
        if (forceFaceDeflection !== undefined) { this.forceFaceDeflection = forceFaceDeflection; }
    }
    /**
     * The XCAF document to mesh. Each of its free (top-level) shapes is meshed into a separate mesh
     * (one array entry), with per-face colours resolved from the document into each colorGroups map.
     * @default undefined
     */
    document!: U;
    /**
     * Precision of the mesh
     * @default 0.01
     * @minimum 0
     * @maximum Infinity
     * @step 0.001
     */
    precision = 0.01;
    /**
     * Adjust Y (up) coordinate system to Z (up) coordinate system
     * @default false
     */
    adjustYtoZ = false;
    /**
     * Compute additional per-face and per-edge metadata (area, length, centers of mass,
     * surface/curve type, tolerance, adjacency, UIDs). Adds cost; base mesh is unchanged when false.
     * @default false
     */
    computeMetadata?: boolean | undefined = false;
    /**
     * Keep the cached triangulation on each shape after meshing. When false (default) the mesh data
     * is flushed so it does not accumulate in memory across calls.
     * @default false
     */
    keepMeshData?: boolean | undefined = false;
    /**
     * Allow re-meshing to a lower resolution triangulation than one already cached on a shape
     * (OCCT IMeshTools_Parameters.AllowQualityDecrease).
     * @default true
     */
    allowQualityDecrease?: boolean | undefined = true;
    /**
     * Force every face to be re-meshed to the requested precision regardless of any cached
     * triangulation (OCCT IMeshTools_Parameters.ForceFaceDeflection).
     * @default false
     */
    forceFaceDeflection?: boolean | undefined = false;
}
export class SaveStepDto<T> {
    constructor(shape?: T, fileName?: string, adjustYtoZ?: boolean, tryDownload?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (fileName !== undefined) { this.fileName = fileName; }
        if (adjustYtoZ !== undefined) { this.adjustYtoZ = adjustYtoZ; }
        if (tryDownload !== undefined) { this.tryDownload = tryDownload; }
    }
    /**
     * Shape to save
     * @default undefined
     */
    shape!: T;
    /**
     * File name
     * @default shape.step
     */
    fileName = "shape.step";
    /**
     * Adjust Y (up) coordinate system to Z (up) coordinate system
     * @default false
     */
    adjustYtoZ = false;
    /**
     * Will assume that the shape is created in right handed coordinate system environment
     * and will compensate by not mirroring the shape along z axis
     * @default false
     */
    fromRightHanded?: boolean | undefined = false;
    /**
     * Will attempt to download the file if that is possible, keep in mind that you might need to implement this yourself. In bitbybit this is handled by worker layers which only run in browsers.
     * @default true
     */
    tryDownload?: boolean | undefined = true;
}
export class SaveStlDto<T> {
    constructor(shape?: T, fileName?: string, precision?: number, adjustYtoZ?: boolean, tryDownload?: boolean, binary?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (fileName !== undefined) { this.fileName = fileName; }
        if (precision !== undefined) { this.precision = precision; }
        if (adjustYtoZ !== undefined) { this.adjustYtoZ = adjustYtoZ; }
        if (tryDownload !== undefined) { this.tryDownload = tryDownload; }
        if (binary !== undefined) { this.binary = binary; }
    }
    /**
     * Shape to save
     * @default undefined
     */
    shape!: T;
    /**
     * File name
     * @default shape.stl
     */
    fileName = "shape.stl";
    /**
     * Precision of the mesh - lower means higher res
     * @default 0.01
     */
    precision = 0.01;
    /**
     * Adjust Y (up) coordinate system to Z (up) coordinate system
     * @default false
     */
    adjustYtoZ = false;
    /**
     * Will attempt to download the file if that is possible, keep in mind that you might need to implement this yourself. In bitbybit this is handled by worker layers which only run in browsers.
     * @default true
     */
    tryDownload?: boolean | undefined = true;
    /**
     * Generate binary STL file
     * @default true
     */
    binary?: boolean | undefined = true;
}

export class ShapeToDxfPathsDto<T> {
    constructor(shape?: T, angularDeflection?: number, curvatureDeflection?: number, minimumOfPoints?: number, uTolerance?: number, minimumLength?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (angularDeflection !== undefined) { this.angularDeflection = angularDeflection; }
        if (curvatureDeflection !== undefined) { this.curvatureDeflection = curvatureDeflection; }
        if (minimumOfPoints !== undefined) { this.minimumOfPoints = minimumOfPoints; }
        if (uTolerance !== undefined) { this.uTolerance = uTolerance; }
        if (minimumLength !== undefined) { this.minimumLength = minimumLength; }
    }
    /**
     * Shape to convert to DXF paths
     * @default undefined
     */
    shape!: T;
    /**
     * The angular deflection for curve tessellation
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    angularDeflection = 0.1;
    /**
     * The curvature deflection for curve tessellation
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.001
     */
    curvatureDeflection = 0.1;
    /**
     * Minimum of points for curve tessellation
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    minimumOfPoints = 2;
    /**
     * U tolerance for curve tessellation
     * @default 1.0e-9
     * @minimum 0
     * @maximum Infinity
     * @step 1.0e-9
     */
    uTolerance = 1.0e-9;
    /**
     * Minimum length for curve tessellation
     * @default 1.0e-7
     * @minimum 0
     * @maximum Infinity
     * @step 1.0e-7
     */
    minimumLength = 1.0e-7;
}

export class DxfPathsWithLayerDto {
    constructor(paths?: IO.DxfPathDto[], layer?: string, color?: Base.Color) {
        if (paths !== undefined) { this.paths = paths; }
        if (layer !== undefined) { this.layer = layer; }
        if (color !== undefined) { this.color = color; }
    }
    /**
     * Array of DXF paths (output from shapeToDxfPaths)
     * @default undefined
     */
    paths!: IO.DxfPathDto[];
    /**
     * Layer name for these paths
     * @default Default
     */
    layer = "Default";
    /**
     * Color for these paths
     * @default #000000
     */
    color: Base.Color = "#000000";
}

export class DxfPathsPartsListDto {
    constructor(pathsParts?: IO.DxfPathsPartDto[], colorFormat?: dxfColorFormatEnum, acadVersion?: dxfAcadVersionEnum, tryDownload?: boolean) {
        if (pathsParts !== undefined) { this.pathsParts = pathsParts; }
        if (colorFormat !== undefined) { this.colorFormat = colorFormat; }
        if (acadVersion !== undefined) { this.acadVersion = acadVersion; }
        if (tryDownload !== undefined) { this.tryDownload = tryDownload; }
    }
    /**
     * Array of DXF paths parts (output from dxfPathsWithLayer)
     * @default undefined
     */
    pathsParts!: IO.DxfPathsPartDto[];
    /**
     * Color format to use in the DXF file
     * @default aci
     */
    colorFormat: dxfColorFormatEnum = dxfColorFormatEnum.aci;
    /**
     * AutoCAD version format for DXF file
     * @default AC1009
     */
    acadVersion: dxfAcadVersionEnum = dxfAcadVersionEnum.AC1009;
    /**
     * File name
     * @default bitbybit-dev.dxf
     */
    fileName?: string | undefined = "bitbybit-dev.dxf";
    /**
     * Will attempt to download the file if that is possible, keep in mind that you might need to implement this yourself. In bitbybit this is handled by worker layers which only run in browsers.
     * @default true
     */
    tryDownload?: boolean | undefined = true;
}

export class SaveDxfDto<T> {
    constructor(shape?: T, fileName?: string, tryDownload?: boolean, angularDeflection?: number, curvatureDeflection?: number, minimumOfPoints?: number, uTolerance?: number, minimumLength?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (fileName !== undefined) { this.fileName = fileName; }
        if (tryDownload !== undefined) { this.tryDownload = tryDownload; }
        if (angularDeflection !== undefined) { this.angularDeflection = angularDeflection; }
        if (curvatureDeflection !== undefined) { this.curvatureDeflection = curvatureDeflection; }
        if (minimumOfPoints !== undefined) { this.minimumOfPoints = minimumOfPoints; }
        if (uTolerance !== undefined) { this.uTolerance = uTolerance; }
        if (minimumLength !== undefined) { this.minimumLength = minimumLength; }
    }
    /**
     * Shape to save
     * @default undefined
     */
    shape!: T;
    /**
     * File name
     * @default shape.dxf
     */
    fileName = "shape.dxf";
    /**
     * Will attempt to download the file if that is possible, keep in mind that you might need to implement this yourself. In bitbybit this is handled by worker layers which only run in browsers.
     * @default true
     */
    tryDownload?: boolean | undefined = true;
    /**
     * The angular deflection
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    angularDeflection = 0.1;
    /**
     * The curvature deflection
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.001
     */
    curvatureDeflection = 0.1;
    /**
     * Minimum of points
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    minimumOfPoints = 2;
    /**
     * U tolerance
     * @default 1.0e-9
     * @minimum 0
     * @maximum Infinity
     * @step 1.0e-9
     */
    uTolerance = 1.0e-9;
    /**
     * Minimum length
     * @default 1.0e-7
     * @minimum 0
     * @maximum Infinity
     * @step 1.0e-7
     */
    minimumLength = 1.0e-7;
}
export class ImportStepIgesFromTextDto {
    constructor(text?: string, fileType?: fileTypeEnum, adjustZtoY?: boolean) {
        if (text !== undefined) { this.text = text; }
        if (fileType !== undefined) { this.fileType = fileType; }
        if (adjustZtoY !== undefined) { this.adjustZtoY = adjustZtoY; }
    }
    /**
     * The text that represents step or iges contents
     * @default undefined
     */
    text!: string;
    /**
     * Identify the import type
     */
    fileType: fileTypeEnum = fileTypeEnum.step;
    /**
     * Adjusts models that use Z coordinate as up to Y up system.
     * @default true
     */
    adjustZtoY = true;
}
export class ImportStepIgesDto {
    constructor(assetFile?: File, adjustZtoY?: boolean) {
        if (assetFile !== undefined) { this.assetFile = assetFile; }
        if (adjustZtoY !== undefined) { this.adjustZtoY = adjustZtoY; }
    }
    /**
     * The name of the asset to store in the cache.
     * This allows to store the imported objects for multiple run cycles in the cache
     * @default undefined
     */
    assetFile!: File;
    /**
     * Adjusts models that use Z coordinate as up to Y up system.
     * @default true
     */
    adjustZtoY = true;
}

/**
 * Options for loading STEP or IGES files.
 * Accepts text content (string) for plain files, or binary content (ArrayBuffer) for compressed files.
 */
export class LoadStepOrIgesDto {
    constructor(filetext?: string | ArrayBuffer, fileName?: string, adjustZtoY?: boolean) {
        if (filetext !== undefined) { this.filetext = filetext; }
        if (fileName !== undefined) { this.fileName = fileName; }
        if (adjustZtoY !== undefined) { this.adjustZtoY = adjustZtoY; }
    }
    /**
     * File content:
     * - string: for plain text files (.step, .stp, .iges, .igs)
     * - ArrayBuffer: for compressed files (.stpz, .igz)
     * @default undefined
     */
    filetext!: string | ArrayBuffer;
    /**
     * File name (used to determine file type)
     * @default shape.step
     */
    fileName = "shape.step";
    /**
     * Adjusts models that use Z coordinate as up to Y up system.
     * @default true
     */
    adjustZtoY = true;
}

/**
 * Options for parsing STEP assemblies to JSON using native C++ XCAF traversal.
 * This is the fast, native approach that runs entirely in C++.
 */
export class ParseStepAssemblyToJsonDto {
    constructor(stepData?: string | ArrayBuffer | Uint8Array | File | Blob) {
        if (stepData !== undefined) { this.stepData = stepData; }
    }
    /**
     * STEP data as string (for plain text files), ArrayBuffer, Uint8Array, File, or Blob.
     * Supports compressed .stpz files - gzip-compressed data is automatically decompressed.
     * @default undefined
     */
    stepData!: string | ArrayBuffer | Uint8Array | File | Blob;
}

/**
 * Options for converting STEP to glTF format.
 * Uses native OCCT RWGltf_CafWriter for fast conversion with full attribute preservation.
 */
export class ConvertStepToGltfDto {
    constructor(stepData?: string | ArrayBuffer | Uint8Array | File | Blob) {
        if (stepData !== undefined) { this.stepData = stepData; }
    }
    /**
     * STEP data as string (for plain text files), ArrayBuffer, Uint8Array, File, or Blob.
     * Supports compressed .stpz files - gzip-compressed data is automatically decompressed.
     * @default undefined
     */
    stepData!: string | ArrayBuffer | Uint8Array | File | Blob;
    /**
     * Mesh linear deflection (triangulation precision).
     * When `meshRelative` is true (default), this is a fraction of each edge's length
     * (e.g. 0.005 = 0.5%) so small parts get fine meshes and large parts get coarse ones.
     * When `meshRelative` is false, this is an absolute value in model units (mm for STEP).
     * @default 0.005
     * @minimum 0.0001
     * @maximum 10
     * @step 0.001
     */
    meshPrecision = 0.005;
    /**
     * Mesh angular deflection in radians (max normal deviation between adjacent triangles).
     * Smaller values produce smoother curved surfaces but more triangles.
     * @default 0.5
     * @minimum 0.01
     * @maximum 3.14159
     * @step 0.05
     */
    meshAngle = 0.5;
    /**
     * Use size-aware relative deflection per face. Recommended default for mixed-scale
     * assemblies (machine + small fasteners) - dramatically reduces triangle count and
     * meshing time with negligible visual difference. Set to false for absolute deflection
     * (the value of `meshPrecision` is then interpreted in model units).
     * @default true
     */
    meshRelative = true;
    /**
     * Add interior vertices for better curved face fidelity (slower, set false for speed).
     * @default false
     */
    internalVerticesMode = false;
    /**
     * Extra post-pass refining triangles that bulge beyond the deflection (slower, set
     * false for speed).
     * @default false
     */
    controlSurfaceDeflection = false;
}

/**
 * Options for converting STEP to glTF format with explicit Draco geometry
 * compression settings. Mirrors `ConvertStepToGltfDto` and exposes the Draco knobs
 * (8 trailing parameters of the underlying native function).
 */
export class ConvertStepToGltfWithDracoDto extends ConvertStepToGltfDto {
    constructor(stepData?: string | ArrayBuffer | Uint8Array | File | Blob) {
        super(stepData);
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

/**
 * glTF node/mesh naming format options.
 * Controls how node and mesh names are generated in the output glTF.
 */
export enum gltfNameFormatEnum {
    /** Omit the name */
    empty = "empty",
    /** Use product name (shared by multiple instances) */
    product = "product",
    /** Use instance name */
    instance = "instance",
    /** Use instance name, fall back to product name */
    instanceOrProduct = "instanceOrProduct",
    /** Use product name, fall back to instance name */
    productOrInstance = "productOrInstance",
    /** Use both product and instance names "Product [Instance]" */
    productAndInstance = "productAndInstance",
    /** Verbose naming combining Product+Instance+OCAF (for debugging) */
    productAndInstanceAndOcaf = "productAndInstanceAndOcaf"
}

/**
 * glTF transformation format options.
 * Controls how node transformations are encoded in the output glTF.
 */
export enum gltfTransformFormatEnum {
    /** Compact format - uses TRS when possible, Mat4 otherwise */
    compact = "compact",
    /** Always use 4x4 matrix format */
    mat4 = "mat4",
    /** Always use Translation-Rotation-Scale format */
    trs = "trs"
}

/**
 * Advanced options for converting STEP to glTF format.
 * Provides full control over STEP reading, meshing, and glTF export options.
 * Use this for performance tuning - disable features you don't need.
 */
export class ConvertStepToGltfAdvancedDto {
    constructor(stepData?: string | ArrayBuffer | Uint8Array | File | Blob) {
        if (stepData !== undefined) { this.stepData = stepData; }
    }

    /**
     * STEP data as string (for plain text files), ArrayBuffer, Uint8Array, File, or Blob.
     * Supports compressed .stpz files - gzip-compressed data is automatically decompressed.
     * @default undefined
     */
    stepData!: string | ArrayBuffer | Uint8Array | File | Blob;

    // ==================== STEP Reading Options ====================

    /**
     * Read color attributes from STEP file.
     * Required for colored glTF output.
     * @default true
     */
    readColors = true;

    /**
     * Read name attributes from STEP file.
     * Disable for faster parsing if names are not needed.
     * @default true
     */
    readNames = true;

    /**
     * Read material attributes from STEP file.
     * Required for material properties in glTF.
     * @default true
     */
    readMaterials = true;

    /**
     * Read layer attributes from STEP file.
     * Usually not needed for glTF output.
     * @default false
     */
    readLayers = false;

    /**
     * Read validation properties from STEP file.
     * Usually not needed for glTF output.
     * @default false
     */
    readProps = false;

    // ==================== Mesh Options ====================

    /**
     * Mesh linear deflection (triangulation precision).
     * When `meshRelative` is true (default), this is a fraction of each edge's length
     * (e.g. 0.005 = 0.5%) so deflection auto-scales with feature size.
     * When `meshRelative` is false, this is absolute in model units (mm for STEP).
     * @default 0.005
     * @minimum 0.0001
     * @maximum 10
     * @step 0.001
     */
    meshDeflection = 0.005;

    /**
     * Mesh angular deflection in radians.
     * Controls curvature-based refinement.
     * @default 0.5
     * @minimum 0.01
     * @maximum 3.14159
     * @step 0.1
     */
    meshAngle = 0.5;

    /**
     * Enable parallel meshing for multi-threaded builds.
     * Recommended to keep enabled.
     * @default true
     */
    meshParallel = true;

    /**
     * Face count threshold for the legacy per-sub-shape meshing fallback.
     * Default -1 means single-pass meshing of the whole compound (fastest, recommended).
     * Set to a positive value (e.g. 100000) to fall back to per-solid meshing for
     * very large assemblies in memory-constrained environments.
     * @default -1
     * @minimum -1
     * @maximum 500000
     * @step 10000
     */
    faceCountThreshold = -1;

    /**
     * Use size-aware relative deflection per face (recommended). When true,
     * `meshDeflection` is interpreted as a fraction of each edge's length.
     * Set to false to use absolute deflection in model units.
     * @default true
     */
    meshRelative = true;

    /**
     * Enable internal vertices mode for more accurate mesh on complex faces.
     * @default false
     */
    internalVerticesMode = false;

    /**
     * Enable control surface deflection for better quality on curved surfaces.
     * @default false
     */
    controlSurfaceDeflection = false;

    // ==================== glTF Writer Options ====================

    /**
     * Merge faces within a single part into one mesh.
     * Produces smaller file sizes.
     * @default true
     */
    mergeFaces = true;

    /**
     * Prefer 16-bit indices when merging faces.
     * Produces smaller binary data when mesh fits in 16-bit indices.
     * @default true
     */
    splitIndices16 = true;

    /**
     * Enable parallel glTF writing.
     * Recommended for large files.
     * @default true
     */
    parallelWrite = true;

    /**
     * Embed textures in GLB output.
     * Only applies to binary (GLB) format.
     * @default true
     */
    embedTextures = true;

    /**
     * Export UV coordinates even without textures.
     * @default false
     */
    forceUVExport = false;

    /**
     * Node naming format in output glTF.
     * @default instance
     */
    nodeNameFormat: gltfNameFormatEnum = gltfNameFormatEnum.instance;

    /**
     * Mesh naming format in output glTF.
     * @default instance
     */
    meshNameFormat: gltfNameFormatEnum = gltfNameFormatEnum.instance;

    /**
     * Transformation format in output glTF.
     * @default compact
     */
    transformFormat: gltfTransformFormatEnum = gltfTransformFormatEnum.compact;

    // ==================== Coordinate System Options ====================

    /**
     * Convert Z-up (OCCT default) to Y-up (glTF standard).
     * Set to false to keep Z-up coordinate system.
     * @default true
     */
    adjustZtoY = true;

    /**
     * Scale factor for the model.
     * Useful for unit conversion (e.g., 0.001 to convert mm to meters).
     * Set to 1.0 for no scaling.
     * @default 1.0
     * @minimum 0.000001
     * @maximum 1000000
     * @step 0.001
     */
    scale = 1.0;
}

/**
 * Advanced options for converting STEP to glTF format with explicit Draco
 * geometry compression settings. Mirrors `ConvertStepToGltfAdvancedDto` and
 * adds the 8 Draco knobs supported by the underlying native function.
 */
export class ConvertStepToGltfAdvancedWithDracoDto extends ConvertStepToGltfAdvancedDto {
    constructor(stepData?: string | ArrayBuffer | Uint8Array | File | Blob) {
        super(stepData);
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

// =====================================================
// Document-based Assembly API DTOs
// These DTOs work with document handles directly instead of docId strings.
// The caller is responsible for managing document lifetime via document.delete().
// =====================================================

