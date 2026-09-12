// A fragment of the OCCT inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../occ-inputs.ts. Edit here, then regenerate.
import { Base } from "@bitbybit-dev/base";
import { IO } from "@bitbybit-dev/base/lib/api/inputs/io-inputs";
import { dxfAcadVersionEnum, dxfColorFormatEnum, fileTypeEnum } from "./enums";

/**
 * A shape and meshing settings for `shapeToMesh`, which triangulates the shape for drawing.
 */
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
     * The shape to triangulate.
     * @default undefined
     */
    shape!: T;
    /**
     * The meshing tolerance in model units; a smaller value follows curved surfaces more closely
     * with more triangles.
     * @default 0.01
     * @minimum 0
     * @maximum Infinity
     * @step 0.001
     */
    precision = 0.01;
    /**
     * When true, the mesh is turned so this library's Y-up becomes Z-up, for tools that treat Z as
     * up.
     * @default false
     */
    adjustYtoZ = false;
    /**
     * When true, each face and edge entry also carries its area or length, center of mass, surface
     * or curve type, tolerance and neighbors, at extra cost.
     * @default false
     */
    computeMetadata?: boolean | undefined = false;
    /**
     * When true, the triangulation stays cached on the shape; when false it is cleared afterwards
     * so memory does not grow across calls.
     * @default false
     */
    keepMeshData?: boolean | undefined = false;
    /**
     * When true, a shape already meshed more finely may be remeshed at the coarser precision asked
     * for.
     * @default true
     */
    allowQualityDecrease?: boolean | undefined = true;
    /**
     * When true, every face is remeshed at the requested precision even when a triangulation is
     * cached.
     * @default false
     */
    forceFaceDeflection?: boolean | undefined = false;
}
/**
 * A shape and meshing settings for `shapeFacesToPolygonPoints`, which returns every triangle of the
 * shape as three points.
 */
export class ShapeFacesToPolygonPointsDto<T> {
    constructor(shape?: T, precision?: number, adjustYtoZ?: boolean, reversedPoints?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (precision !== undefined) { this.precision = precision; }
        if (adjustYtoZ !== undefined) { this.adjustYtoZ = adjustYtoZ; }
        if (reversedPoints !== undefined) { this.reversedPoints = reversedPoints; }
    }
    /**
     * The shape to triangulate.
     * @default undefined
     */
    shape!: T;
    /**
     * The meshing tolerance in model units; a smaller value follows curved surfaces more closely
     * with more triangles.
     * @default 0.01
     * @minimum 0
     * @maximum Infinity
     * @step 0.001
     */
    precision = 0.01;
    /**
     * When true, the points are turned so this library's Y-up becomes Z-up, for tools that treat Z
     * as up.
     * @default false
     */
    adjustYtoZ = false;
    /**
     * When true, the three points of each triangle come in the opposite order, for tools that wind
     * triangles the other way.
     * @default false
     */
    reversedPoints = false;
}
/**
 * Shapes and meshing settings for `shapesToMeshes`, which triangulates each shape with the same
 * settings.
 */
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
     * The shapes to triangulate, one mesh per shape.
     * @default undefined
     */
    shapes!: T[];
    /**
     * The meshing tolerance in model units; a smaller value follows curved surfaces more closely
     * with more triangles.
     * @default 0.01
     * @minimum 0
     * @maximum Infinity
     * @step 0.001
     */
    precision = 0.01;
    /**
     * When true, the meshes are turned so this library's Y-up becomes Z-up, for tools that treat Z
     * as up.
     * @default false
     */
    adjustYtoZ = false;
    /**
     * When true, each face and edge entry also carries its area or length, center of mass, surface
     * or curve type, tolerance and neighbors, at extra cost.
     * @default false
     */
    computeMetadata?: boolean | undefined = false;
    /**
     * When true, the triangulation stays cached on each shape; when false it is cleared afterwards
     * so memory does not grow across calls.
     * @default false
     */
    keepMeshData?: boolean | undefined = false;
    /**
     * When true, a shape already meshed more finely may be remeshed at the coarser precision asked
     * for.
     * @default true
     */
    allowQualityDecrease?: boolean | undefined = true;
    /**
     * When true, every face is remeshed at the requested precision even when a triangulation is
     * cached.
     * @default false
     */
    forceFaceDeflection?: boolean | undefined = false;
}
/**
 * An assembly document and meshing settings for `docToMesh`, which triangulates its top-level
 * shapes into one mesh with the document's colors.
 */
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
     * The assembly document whose top-level shapes are meshed together; their face colors end up in
     * the mesh's color groups.
     * @default undefined
     */
    document!: U;
    /**
     * The meshing tolerance in model units; a smaller value follows curved surfaces more closely
     * with more triangles.
     * @default 0.01
     * @minimum 0
     * @maximum Infinity
     * @step 0.001
     */
    precision = 0.01;
    /**
     * When true, the mesh is turned so this library's Y-up becomes Z-up, for tools that treat Z as
     * up.
     * @default false
     */
    adjustYtoZ = false;
    /**
     * When true, each face and edge entry also carries its area or length, center of mass, surface
     * or curve type, tolerance, neighbors and ids, at extra cost.
     * @default false
     */
    computeMetadata?: boolean | undefined = false;
    /**
     * When true, the triangulation stays cached on the shapes; when false it is cleared afterwards
     * so memory does not grow across calls.
     * @default false
     */
    keepMeshData?: boolean | undefined = false;
    /**
     * When true, a shape already meshed more finely may be remeshed at the coarser precision asked
     * for.
     * @default true
     */
    allowQualityDecrease?: boolean | undefined = true;
    /**
     * When true, every face is remeshed at the requested precision even when a triangulation is
     * cached.
     * @default false
     */
    forceFaceDeflection?: boolean | undefined = false;
}
/**
 * An assembly document and meshing settings for `docToMeshes`, which triangulates each top-level
 * shape into its own mesh with the document's colors.
 */
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
     * The assembly document whose top-level shapes are meshed one by one; each shape's face colors
     * end up in its mesh's color groups.
     * @default undefined
     */
    document!: U;
    /**
     * The meshing tolerance in model units; a smaller value follows curved surfaces more closely
     * with more triangles.
     * @default 0.01
     * @minimum 0
     * @maximum Infinity
     * @step 0.001
     */
    precision = 0.01;
    /**
     * When true, the meshes are turned so this library's Y-up becomes Z-up, for tools that treat Z
     * as up.
     * @default false
     */
    adjustYtoZ = false;
    /**
     * When true, each face and edge entry also carries its area or length, center of mass, surface
     * or curve type, tolerance, neighbors and ids, at extra cost.
     * @default false
     */
    computeMetadata?: boolean | undefined = false;
    /**
     * When true, the triangulation stays cached on the shapes; when false it is cleared afterwards
     * so memory does not grow across calls.
     * @default false
     */
    keepMeshData?: boolean | undefined = false;
    /**
     * When true, a shape already meshed more finely may be remeshed at the coarser precision asked
     * for.
     * @default true
     */
    allowQualityDecrease?: boolean | undefined = true;
    /**
     * When true, every face is remeshed at the requested precision even when a triangulation is
     * cached.
     * @default false
     */
    forceFaceDeflection?: boolean | undefined = false;
}
/**
 * A shape, a file name and axis options for `io.saveShapeSTEP`, which writes the shape as a STEP
 * file.
 */
export class SaveStepDto<T> {
    constructor(shape?: T, fileName?: string, adjustYtoZ?: boolean, tryDownload?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (fileName !== undefined) { this.fileName = fileName; }
        if (adjustYtoZ !== undefined) { this.adjustYtoZ = adjustYtoZ; }
        if (tryDownload !== undefined) { this.tryDownload = tryDownload; }
    }
    /**
     * The shape written to the file.
     * @default undefined
     */
    shape!: T;
    /**
     * The name the downloaded file gets; `.step` is appended when missing.
     * @default shape.step
     */
    fileName = "shape.step";
    /**
     * When true, the shape is turned so this library's Y-up becomes STEP's Z-up.
     * @default false
     */
    adjustYtoZ = false;
    /**
     * When true, the axis swap skips its mirror step, for shapes that were built in a right-handed
     * system.
     * @default false
     */
    fromRightHanded?: boolean | undefined = false;
    /**
     * When true, a browser download of the file is started where that is possible; the kernel
     * itself only returns the text.
     * @default true
     */
    tryDownload?: boolean | undefined = true;
}
/**
 * A shape, a file name and meshing options for `io.saveShapeStl`, which triangulates the shape and
 * writes it as an STL file.
 */
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
     * The shape written to the file.
     * @default undefined
     */
    shape!: T;
    /**
     * The name the downloaded file gets.
     * @default shape.stl
     */
    fileName = "shape.stl";
    /**
     * The meshing tolerance in model units; a smaller value follows curved surfaces more closely
     * and makes a bigger file.
     * @default 0.01
     */
    precision = 0.01;
    /**
     * When true, the shape is turned so this library's Y-up becomes Z-up.
     * @default false
     */
    adjustYtoZ = false;
    /**
     * When true, a browser download of the file is started where that is possible; the kernel
     * itself only returns the text.
     * @default true
     */
    tryDownload?: boolean | undefined = true;
    /**
     * When true, the STL is written in its binary form, which is much smaller than the text form.
     * @default true
     */
    binary?: boolean | undefined = true;
}

/**
 * A shape and deflection settings for `io.shapeToDxfPaths`, which traces the shape's wires into DXF
 * path records.
 */
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
     * The shape whose wires are traced; it must lie flat on the XZ ground plane.
     * @default undefined
     */
    shape!: T;
    /**
     * The largest angle, in radians, the traced polyline may turn between two points; smaller
     * follows curves more closely.
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    angularDeflection = 0.1;
    /**
     * The largest distance, in model units, the traced polyline may stray from the curve; smaller
     * follows it more closely.
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.001
     */
    curvatureDeflection = 0.1;
    /**
     * The fewest points any edge is traced with, however straight.
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    minimumOfPoints = 2;
    /**
     * How close two parameter values must be to count as the same point.
     * @default 1.0e-9
     * @minimum 0
     * @maximum Infinity
     * @step 1.0e-9
     */
    uTolerance = 1.0e-9;
    /**
     * Edges shorter than this, in model units, are traced with the minimum number of points.
     * @default 1.0e-7
     * @minimum 0
     * @maximum Infinity
     * @step 1.0e-7
     */
    minimumLength = 1.0e-7;
}

/**
 * DXF paths, a layer and a color for `io.dxfPathsWithLayer`, which makes them one part of a DXF
 * drawing.
 */
export class DxfPathsWithLayerDto {
    constructor(paths?: IO.DxfPathDto[], layer?: string, color?: Base.Color) {
        if (paths !== undefined) { this.paths = paths; }
        if (layer !== undefined) { this.layer = layer; }
        if (color !== undefined) { this.color = color; }
    }
    /**
     * The paths from `io.shapeToDxfPaths`.
     * @default undefined
     */
    paths!: IO.DxfPathDto[];
    /**
     * The name of the DXF layer the paths go on.
     * @default Default
     */
    layer = "Default";
    /**
     * The color of the paths as a hex string such as `#000000`.
     * @default #000000
     */
    color: Base.Color = "#000000";
}

/**
 * Layered DXF parts and file options for `io.dxfCreate`, which writes them into one DXF file.
 */
export class DxfPathsPartsListDto {
    constructor(pathsParts?: IO.DxfPathsPartDto[], colorFormat?: dxfColorFormatEnum, acadVersion?: dxfAcadVersionEnum, tryDownload?: boolean) {
        if (pathsParts !== undefined) { this.pathsParts = pathsParts; }
        if (colorFormat !== undefined) { this.colorFormat = colorFormat; }
        if (acadVersion !== undefined) { this.acadVersion = acadVersion; }
        if (tryDownload !== undefined) { this.tryDownload = tryDownload; }
    }
    /**
     * The parts from `io.dxfPathsWithLayer`, each with its own layer and color.
     * @default undefined
     */
    pathsParts!: IO.DxfPathsPartDto[];
    /**
     * How colors are written: `aci` as AutoCAD's indexed colors, `truecolor` as RGB.
     * @default aci
     */
    colorFormat: dxfColorFormatEnum = dxfColorFormatEnum.aci;
    /**
     * The DXF version to write: `AC1009` is R12, the most widely readable, `AC1015` is 2000.
     * @default AC1009
     */
    acadVersion: dxfAcadVersionEnum = dxfAcadVersionEnum.AC1009;
    /**
     * The name the downloaded file gets.
     * @default bitbybit-dev.dxf
     */
    fileName?: string | undefined = "bitbybit-dev.dxf";
    /**
     * When true, a browser download of the file is started where that is possible; the kernel
     * itself only returns the text.
     * @default true
     */
    tryDownload?: boolean | undefined = true;
}

/**
 * A shape, a file name and deflection settings for a one-step DXF export; currently unused by the
 * library, which goes through `io.shapeToDxfPaths` and `io.dxfCreate`.
 */
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
     * The shape written to the file; it must lie flat on the XZ ground plane.
     * @default undefined
     */
    shape!: T;
    /**
     * The name the downloaded file gets.
     * @default shape.dxf
     */
    fileName = "shape.dxf";
    /**
     * When true, a browser download of the file is started where that is possible.
     * @default true
     */
    tryDownload?: boolean | undefined = true;
    /**
     * The largest angle, in radians, the traced polyline may turn between two points; smaller
     * follows curves more closely.
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.01
     */
    angularDeflection = 0.1;
    /**
     * The largest distance, in model units, the traced polyline may stray from the curve; smaller
     * follows it more closely.
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.001
     */
    curvatureDeflection = 0.1;
    /**
     * The fewest points any edge is traced with, however straight.
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    minimumOfPoints = 2;
    /**
     * How close two parameter values must be to count as the same point.
     * @default 1.0e-9
     * @minimum 0
     * @maximum Infinity
     * @step 1.0e-9
     */
    uTolerance = 1.0e-9;
    /**
     * Edges shorter than this, in model units, are traced with the minimum number of points.
     * @default 1.0e-7
     * @minimum 0
     * @maximum Infinity
     * @step 1.0e-7
     */
    minimumLength = 1.0e-7;
}
/**
 * STEP or IGES text and its kind for the core `occt.io.loadSTEPorIGESFromText`, which reads it into
 * a shape.
 */
export class ImportStepIgesFromTextDto {
    constructor(text?: string, fileType?: fileTypeEnum, adjustZtoY?: boolean) {
        if (text !== undefined) { this.text = text; }
        if (fileType !== undefined) { this.fileType = fileType; }
        if (adjustZtoY !== undefined) { this.adjustZtoY = adjustZtoY; }
    }
    /**
     * The full text of the STEP or IGES file.
     * @default undefined
     */
    text!: string;
    /**
     * Whether the text is STEP or IGES.
     */
    fileType: fileTypeEnum = fileTypeEnum.step;
    /**
     * When true, the shape is turned so the file's Z-up becomes this library's Y-up.
     * @default true
     */
    adjustZtoY = true;
}
/**
 * A STEP or IGES file for the core `occt.io.loadSTEPorIGES`, which reads it into a shape.
 */
export class ImportStepIgesDto {
    constructor(assetFile?: File, adjustZtoY?: boolean) {
        if (assetFile !== undefined) { this.assetFile = assetFile; }
        if (adjustZtoY !== undefined) { this.adjustZtoY = adjustZtoY; }
    }
    /**
     * The file to read; its extension decides whether it is STEP or IGES.
     * @default undefined
     */
    assetFile!: File;
    /**
     * When true, the shape is turned so the file's Z-up becomes this library's Y-up.
     * @default true
     */
    adjustZtoY = true;
}

/**
 * File content, a file name and an axis option for `io.loadSTEPorIGES`, which reads STEP or IGES
 * into a shape.
 */
export class LoadStepOrIgesDto {
    constructor(filetext?: string | ArrayBuffer, fileName?: string, adjustZtoY?: boolean) {
        if (filetext !== undefined) { this.filetext = filetext; }
        if (fileName !== undefined) { this.fileName = fileName; }
        if (adjustZtoY !== undefined) { this.adjustZtoY = adjustZtoY; }
    }
    /**
     * The file's text for `.step`, `.stp`, `.iges` and `.igs`, or an ArrayBuffer for the compressed
     * `.stpz` and `.igz` forms.
     * @default undefined
     */
    filetext!: string | ArrayBuffer;
    /**
     * The file name; its extension decides whether it is read as STEP or IGES and whether it is
     * compressed.
     * @default shape.step
     */
    fileName = "shape.step";
    /**
     * When true, the shape is turned so the file's Z-up becomes this library's Y-up.
     * @default true
     */
    adjustZtoY = true;
}

/**
 * A STEP file for `io.parseStepToJson`, which reads its assembly structure without building
 * geometry.
 */
export class ParseStepAssemblyToJsonDto {
    constructor(stepData?: string | ArrayBuffer | Uint8Array | File | Blob) {
        if (stepData !== undefined) { this.stepData = stepData; }
    }
    /**
     * The STEP file as text, ArrayBuffer, Uint8Array, File or Blob; gzip-compressed `.stpz` content
     * is unpacked on its own.
     * @default undefined
     */
    stepData!: string | ArrayBuffer | Uint8Array | File | Blob;
}

/**
 * A STEP file and meshing settings for `io.convertStepToGltf`, which converts it into a binary
 * glTF.
 */
export class ConvertStepToGltfDto {
    constructor(stepData?: string | ArrayBuffer | Uint8Array | File | Blob) {
        if (stepData !== undefined) { this.stepData = stepData; }
    }
    /**
     * The STEP file as text, ArrayBuffer, Uint8Array, File or Blob; gzip-compressed `.stpz` content
     * is unpacked on its own.
     * @default undefined
     */
    stepData!: string | ArrayBuffer | Uint8Array | File | Blob;
    /**
     * How closely triangles follow curved surfaces: with `meshRelative` true a fraction of each
     * edge's length, otherwise an absolute distance in model units.
     * @default 0.005
     * @minimum 0.0001
     * @maximum 10
     * @step 0.001
     */
    meshPrecision = 0.005;
    /**
     * The largest angle, in radians, between the normals of neighboring triangles; smaller gives
     * smoother curves and more triangles.
     * @default 0.5
     * @minimum 0.01
     * @maximum 3.14159
     * @step 0.05
     */
    meshAngle = 0.5;
    /**
     * When true, `meshPrecision` scales with each part's size, so small fasteners and large
     * housings both mesh well; when false it is an absolute distance.
     * @default true
     */
    meshRelative = true;
    /**
     * When true, extra vertices are added inside curved faces for a closer fit, at the cost of
     * speed.
     * @default false
     */
    internalVerticesMode = false;
    /**
     * When true, an extra pass refines triangles that bulge beyond the precision, at the cost of
     * speed.
     * @default false
     */
    controlSurfaceDeflection = false;
}

/**
 * A STEP file, meshing settings and Draco settings for `io.convertStepToGltfWithDraco`, which
 * converts it into a Draco-compressed binary glTF.
 */
export class ConvertStepToGltfWithDracoDto extends ConvertStepToGltfDto {
    constructor(stepData?: string | ArrayBuffer | Uint8Array | File | Blob) {
        super(stepData);
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
 * A STEP file with every reading, meshing and writing option for `io.convertStepToGltfAdvanced`;
 * switch off what is not needed for a faster conversion.
 */
export class ConvertStepToGltfAdvancedDto {
    constructor(stepData?: string | ArrayBuffer | Uint8Array | File | Blob) {
        if (stepData !== undefined) { this.stepData = stepData; }
    }

    /**
     * The STEP file as text, ArrayBuffer, Uint8Array, File or Blob; gzip-compressed `.stpz` content
     * is unpacked on its own.
     * @default undefined
     */
    stepData!: string | ArrayBuffer | Uint8Array | File | Blob;

    // ==================== STEP Reading Options ====================

    /**
     * When true, colors are read from the file; needed for a colored glTF.
     * @default true
     */
    readColors = true;

    /**
     * When true, part names are read from the file; switch it off for faster parsing when names are
     * not needed.
     * @default true
     */
    readNames = true;

    /**
     * When true, materials are read from the file; needed for material properties in the glTF.
     * @default true
     */
    readMaterials = true;

    /**
     * When true, layer information is read from the file; rarely needed for glTF.
     * @default false
     */
    readLayers = false;

    /**
     * When true, validation properties are read from the file; rarely needed for glTF.
     * @default false
     */
    readProps = false;

    // ==================== Mesh Options ====================

    /**
     * How closely triangles follow curved surfaces: with `meshRelative` true a fraction of each
     * edge's length, otherwise an absolute distance in model units.
     * @default 0.005
     * @minimum 0.0001
     * @maximum 10
     * @step 0.001
     */
    meshDeflection = 0.005;

    /**
     * The largest angle, in radians, between the normals of neighboring triangles; smaller gives
     * smoother curves and more triangles.
     * @default 0.5
     * @minimum 0.01
     * @maximum 3.14159
     * @step 0.1
     */
    meshAngle = 0.5;

    /**
     * When true, faces are meshed on several threads where the build allows it.
     * @default true
     */
    meshParallel = true;

    /**
     * Above this many faces the assembly is meshed solid by solid to save memory; -1 meshes
     * everything in one pass, which is fastest.
     * @default -1
     * @minimum -1
     * @maximum 500000
     * @step 10000
     */
    faceCountThreshold = -1;

    /**
     * When true, `meshDeflection` scales with each part's size, so small fasteners and large
     * housings both mesh well; when false it is an absolute distance.
     * @default true
     */
    meshRelative = true;

    /**
     * When true, extra vertices are added inside curved faces for a closer fit, at the cost of
     * speed.
     * @default false
     */
    internalVerticesMode = false;

    /**
     * When true, an extra pass refines triangles that bulge beyond the precision, at the cost of
     * speed.
     * @default false
     */
    controlSurfaceDeflection = false;

    // ==================== glTF Writer Options ====================

    /**
     * When true, the faces of a part are joined into one mesh, which makes a smaller file.
     * @default true
     */
    mergeFaces = true;

    /**
     * When true, merged meshes use 16-bit indexes where they fit, which makes a smaller file.
     * @default true
     */
    splitIndices16 = true;

    /**
     * When true, the glTF is written on several threads, which helps with large files.
     * @default true
     */
    parallelWrite = true;

    /**
     * When true, textures are embedded in the GLB instead of referenced as separate files.
     * @default true
     */
    embedTextures = true;

    /**
     * When true, texture coordinates are written even for meshes without textures.
     * @default false
     */
    forceUVExport = false;

    /**
     * What the glTF nodes are named after: the instance, the product, a combination, or nothing.
     * @default instance
     */
    nodeNameFormat: gltfNameFormatEnum = gltfNameFormatEnum.instance;

    /**
     * What the glTF meshes are named after: the instance, the product, a combination, or nothing.
     * @default instance
     */
    meshNameFormat: gltfNameFormatEnum = gltfNameFormatEnum.instance;

    /**
     * How node placements are written: `compact` as translation, rotation and scale where possible,
     * `mat4` always as a matrix, `trs` always as the three parts.
     * @default compact
     */
    transformFormat: gltfTransformFormatEnum = gltfTransformFormatEnum.compact;

    // ==================== Coordinate System Options ====================

    /**
     * When true, the file's Z-up is turned into glTF's Y-up; false keeps Z up.
     * @default true
     */
    adjustZtoY = true;

    /**
     * A factor applied to the whole model, such as 0.001 to turn millimeters into meters; 1 keeps
     * the size.
     * @default 1.0
     * @minimum 0.000001
     * @maximum 1000000
     * @step 0.001
     */
    scale = 1.0;
}

/**
 * A STEP file with every reading, meshing and writing option plus Draco settings for
 * `io.convertStepToGltfAdvancedWithDraco`.
 */
export class ConvertStepToGltfAdvancedWithDracoDto extends ConvertStepToGltfAdvancedDto {
    constructor(stepData?: string | ArrayBuffer | Uint8Array | File | Blob) {
        super(stepData);
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

// =====================================================
// Document-based Assembly API DTOs
// These DTOs work with document handles directly instead of docId strings.
// The caller is responsible for managing document lifetime via document.delete().
// =====================================================

