// A fragment of the OCCT inputs namespace: scripts/gen-inputs.mjs assembles every file in this
// directory, in the order set by scripts/inputs.config.mjs, into ../occ-inputs.ts. Edit here, then regenerate.
import { Base } from "@bitbybit-dev/base";
import { IO } from "@bitbybit-dev/base/lib/api/inputs/io-inputs";
import { dxfAcadVersionEnum, dxfColorFormatEnum, fileTypeEnum, surfaceAnalysisEnum } from "./enums";

/**
 * A shape and meshing settings for `shapeToMesh`, which triangulates the shape for drawing, and can
 * add each face's iso curves and a surface analysis value at every vertex.
 */
export class ShapeToMeshDto<T> {
    constructor(shape?: T, precision?: number, adjustYtoZ?: boolean, computeMetadata?: boolean, keepMeshData?: boolean, allowQualityDecrease?: boolean, forceFaceDeflection?: boolean, isoCurvesU?: number, isoCurvesV?: number, surfaceAnalysis?: surfaceAnalysisEnum, draftDirection?: Base.Vector3, angularDeflection?: number, relativeDeflection?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (precision !== undefined) { this.precision = precision; }
        if (adjustYtoZ !== undefined) { this.adjustYtoZ = adjustYtoZ; }
        if (computeMetadata !== undefined) { this.computeMetadata = computeMetadata; }
        if (keepMeshData !== undefined) { this.keepMeshData = keepMeshData; }
        if (allowQualityDecrease !== undefined) { this.allowQualityDecrease = allowQualityDecrease; }
        if (forceFaceDeflection !== undefined) { this.forceFaceDeflection = forceFaceDeflection; }
        if (isoCurvesU !== undefined) { this.isoCurvesU = isoCurvesU; }
        if (isoCurvesV !== undefined) { this.isoCurvesV = isoCurvesV; }
        if (surfaceAnalysis !== undefined) { this.surfaceAnalysis = surfaceAnalysis; }
        if (draftDirection !== undefined) { this.draftDirection = draftDirection; }
        if (angularDeflection !== undefined) { this.angularDeflection = angularDeflection; }
        if (relativeDeflection !== undefined) { this.relativeDeflection = relativeDeflection; }
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
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.001
     */
    precision?: number | undefined = 0.01;
    /**
     * The largest angle, in radians, a curved face may turn between neighbouring triangles; smaller
     * follows curvature more closely with more triangles.
     * @default 0.5
     * @minimum 0.001
     * @maximum 3.14159
     * @step 0.05
     */
    angularDeflection?: number | undefined = 0.5;
    /**
     * When true, `precision` is a fraction of each edge's and face's size instead of model units, so
     * small and large parts get triangles in proportion to their size.
     * @default false
     */
    relativeDeflection?: boolean | undefined = false;
    /**
     * When true, the mesh is turned so this library's Y-up becomes Z-up, for tools that treat Z as
     * up.
     * @default false
     */
    adjustYtoZ?: boolean | undefined = false;
    /**
     * When true, each face and edge entry also carries its area or length, center of mass, surface
     * or curve type, tolerance and neighbors, at extra cost.
     * @default false
     */
    computeMetadata?: boolean | undefined = false;
    /**
     * When true, the triangulation stays on the shape for the next mesh with the same settings to
     * reuse; when false it is cleared. A mesh retention budget keeps every mesh.
     * @default false
     */
    keepMeshData?: boolean | undefined = false;
    /**
     * When true, a face whose triangulation is not within 10% of the precision it needs is meshed
     * again; when false, a finer one is kept.
     * @default true
     */
    allowQualityDecrease?: boolean | undefined = true;
    /**
     * When true, every face is meshed at exactly the requested precision; when false, a face's
     * precision is raised to the average of its edges' and to twice its tolerance.
     * @default false
     */
    forceFaceDeflection?: boolean | undefined = false;
    /**
     * How many iso curves of constant u each face gets in `isoCurveList`, spread evenly inside its
     * u range and trimmed to the face; 0 gives none.
     * @default 0
     * @minimum 0
     * @maximum 1000
     * @step 1
     */
    isoCurvesU?: number | undefined = 0;
    /**
     * How many iso curves of constant v each face gets in `isoCurveList`, spread evenly inside its
     * v range and trimmed to the face; 0 gives none.
     * @default 0
     * @minimum 0
     * @maximum 1000
     * @step 1
     */
    isoCurvesV?: number | undefined = 0;
    /**
     * What each face's `analysisValues` hold, one value per vertex: a curvature, the smallest bending
     * radius, or the draft angle in degrees. `none` leaves them out.
     * @default none
     */
    surfaceAnalysis?: surfaceAnalysisEnum | undefined = surfaceAnalysisEnum.none;
    /**
     * The pull direction the draft angles are measured against; read only by `draftAngle`.
     * @default [0, 1, 0]
     */
    draftDirection?: Base.Vector3 | undefined = [0, 1, 0];
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
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.001
     */
    precision?: number | undefined = 0.01;
    /**
     * When true, the points are turned so this library's Y-up becomes Z-up, for tools that treat Z
     * as up.
     * @default false
     */
    adjustYtoZ?: boolean | undefined = false;
    /**
     * When true, the three points of each triangle come in the opposite order, for tools that wind
     * triangles the other way.
     * @default false
     */
    reversedPoints?: boolean | undefined = false;
}
/**
 * A shape and a meshing precision for `shapeToManifoldMesh`, which meshes the shape into one indexed
 * mesh for the Manifold kernel.
 */
export class ShapeToManifoldMeshDto<T> {
    constructor(shape?: T, precision?: number) {
        if (shape !== undefined) { this.shape = shape; }
        if (precision !== undefined) { this.precision = precision; }
    }
    /**
     * The shape to mesh; a closed solid gives a closed mesh.
     * @default undefined
     */
    shape!: T;
    /**
     * The meshing tolerance in model units; a smaller value follows curved surfaces more closely
     * with more triangles.
     * @default 0.01
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.001
     */
    precision?: number | undefined = 0.01;
}
/**
 * Shapes and meshing settings for `shapesToMeshes`, which triangulates each shape with the same
 * settings, iso curves and surface analysis included.
 */
export class ShapesToMeshesDto<T> {
    constructor(shapes?: T[], precision?: number, adjustYtoZ?: boolean, computeMetadata?: boolean, keepMeshData?: boolean, allowQualityDecrease?: boolean, forceFaceDeflection?: boolean, isoCurvesU?: number, isoCurvesV?: number, surfaceAnalysis?: surfaceAnalysisEnum, draftDirection?: Base.Vector3, angularDeflection?: number, relativeDeflection?: boolean) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (precision !== undefined) { this.precision = precision; }
        if (adjustYtoZ !== undefined) { this.adjustYtoZ = adjustYtoZ; }
        if (computeMetadata !== undefined) { this.computeMetadata = computeMetadata; }
        if (keepMeshData !== undefined) { this.keepMeshData = keepMeshData; }
        if (allowQualityDecrease !== undefined) { this.allowQualityDecrease = allowQualityDecrease; }
        if (forceFaceDeflection !== undefined) { this.forceFaceDeflection = forceFaceDeflection; }
        if (isoCurvesU !== undefined) { this.isoCurvesU = isoCurvesU; }
        if (isoCurvesV !== undefined) { this.isoCurvesV = isoCurvesV; }
        if (surfaceAnalysis !== undefined) { this.surfaceAnalysis = surfaceAnalysis; }
        if (draftDirection !== undefined) { this.draftDirection = draftDirection; }
        if (angularDeflection !== undefined) { this.angularDeflection = angularDeflection; }
        if (relativeDeflection !== undefined) { this.relativeDeflection = relativeDeflection; }
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
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.001
     */
    precision?: number | undefined = 0.01;
    /**
     * The largest angle, in radians, a curved face may turn between neighbouring triangles; smaller
     * follows curvature more closely with more triangles.
     * @default 0.5
     * @minimum 0.001
     * @maximum 3.14159
     * @step 0.05
     */
    angularDeflection?: number | undefined = 0.5;
    /**
     * When true, `precision` is a fraction of each edge's and face's size instead of model units, so
     * small and large parts get triangles in proportion to their size.
     * @default false
     */
    relativeDeflection?: boolean | undefined = false;
    /**
     * When true, the meshes are turned so this library's Y-up becomes Z-up, for tools that treat Z
     * as up.
     * @default false
     */
    adjustYtoZ?: boolean | undefined = false;
    /**
     * When true, each face and edge entry also carries its area or length, center of mass, surface
     * or curve type, tolerance and neighbors, at extra cost.
     * @default false
     */
    computeMetadata?: boolean | undefined = false;
    /**
     * When true, the triangulations stay on the shapes for the next mesh with the same settings to
     * reuse; when false they are cleared. A mesh retention budget keeps every mesh.
     * @default false
     */
    keepMeshData?: boolean | undefined = false;
    /**
     * When true, a face whose triangulation is not within 10% of the precision it needs is meshed
     * again; when false, a finer one is kept.
     * @default true
     */
    allowQualityDecrease?: boolean | undefined = true;
    /**
     * When true, every face is meshed at exactly the requested precision; when false, a face's
     * precision is raised to the average of its edges' and to twice its tolerance.
     * @default false
     */
    forceFaceDeflection?: boolean | undefined = false;
    /**
     * How many iso curves of constant u each face gets in `isoCurveList`, spread evenly inside its
     * u range and trimmed to the face; 0 gives none.
     * @default 0
     * @minimum 0
     * @maximum 1000
     * @step 1
     */
    isoCurvesU?: number | undefined = 0;
    /**
     * How many iso curves of constant v each face gets in `isoCurveList`, spread evenly inside its
     * v range and trimmed to the face; 0 gives none.
     * @default 0
     * @minimum 0
     * @maximum 1000
     * @step 1
     */
    isoCurvesV?: number | undefined = 0;
    /**
     * What each face's `analysisValues` hold, one value per vertex: a curvature, the smallest bending
     * radius, or the draft angle in degrees. `none` leaves them out.
     * @default none
     */
    surfaceAnalysis?: surfaceAnalysisEnum | undefined = surfaceAnalysisEnum.none;
    /**
     * The pull direction the draft angles are measured against; read only by `draftAngle`.
     * @default [0, 1, 0]
     */
    draftDirection?: Base.Vector3 | undefined = [0, 1, 0];
}
/**
 * An assembly document and meshing settings for `docToMesh`, which triangulates its top-level
 * shapes into one mesh with the document's colors.
 */
export class DocToMeshDto<U> {
    constructor(document?: U, precision?: number, adjustYtoZ?: boolean, computeMetadata?: boolean, keepMeshData?: boolean, allowQualityDecrease?: boolean, forceFaceDeflection?: boolean, angularDeflection?: number, relativeDeflection?: boolean) {
        if (document !== undefined) { this.document = document; }
        if (precision !== undefined) { this.precision = precision; }
        if (adjustYtoZ !== undefined) { this.adjustYtoZ = adjustYtoZ; }
        if (computeMetadata !== undefined) { this.computeMetadata = computeMetadata; }
        if (keepMeshData !== undefined) { this.keepMeshData = keepMeshData; }
        if (allowQualityDecrease !== undefined) { this.allowQualityDecrease = allowQualityDecrease; }
        if (forceFaceDeflection !== undefined) { this.forceFaceDeflection = forceFaceDeflection; }
        if (angularDeflection !== undefined) { this.angularDeflection = angularDeflection; }
        if (relativeDeflection !== undefined) { this.relativeDeflection = relativeDeflection; }
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
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.001
     */
    precision?: number | undefined = 0.01;
    /**
     * The largest angle, in radians, a curved face may turn between neighbouring triangles; smaller
     * follows curvature more closely with more triangles.
     * @default 0.5
     * @minimum 0.001
     * @maximum 3.14159
     * @step 0.05
     */
    angularDeflection?: number | undefined = 0.5;
    /**
     * When true, `precision` is a fraction of each edge's and face's size instead of model units, so
     * small and large parts get triangles in proportion to their size.
     * @default false
     */
    relativeDeflection?: boolean | undefined = false;
    /**
     * When true, the mesh is turned so this library's Y-up becomes Z-up, for tools that treat Z as
     * up.
     * @default false
     */
    adjustYtoZ?: boolean | undefined = false;
    /**
     * When true, each face and edge entry also carries its area or length, center of mass, surface
     * or curve type, tolerance, neighbors and ids, at extra cost.
     * @default false
     */
    computeMetadata?: boolean | undefined = false;
    /**
     * When true, the triangulations stay on the shapes for the next mesh with the same settings to
     * reuse; when false they are cleared. A mesh retention budget keeps every mesh.
     * @default false
     */
    keepMeshData?: boolean | undefined = false;
    /**
     * When true, a face whose triangulation is not within 10% of the precision it needs is meshed
     * again; when false, a finer one is kept.
     * @default true
     */
    allowQualityDecrease?: boolean | undefined = true;
    /**
     * When true, every face is meshed at exactly the requested precision; when false, a face's
     * precision is raised to the average of its edges' and to twice its tolerance.
     * @default false
     */
    forceFaceDeflection?: boolean | undefined = false;
}
/**
 * An assembly document and meshing settings for `docToMeshes`, which triangulates each top-level
 * shape into its own mesh with the document's colors.
 */
export class DocToMeshesDto<U> {
    constructor(document?: U, precision?: number, adjustYtoZ?: boolean, computeMetadata?: boolean, keepMeshData?: boolean, allowQualityDecrease?: boolean, forceFaceDeflection?: boolean, angularDeflection?: number, relativeDeflection?: boolean) {
        if (document !== undefined) { this.document = document; }
        if (precision !== undefined) { this.precision = precision; }
        if (adjustYtoZ !== undefined) { this.adjustYtoZ = adjustYtoZ; }
        if (computeMetadata !== undefined) { this.computeMetadata = computeMetadata; }
        if (keepMeshData !== undefined) { this.keepMeshData = keepMeshData; }
        if (allowQualityDecrease !== undefined) { this.allowQualityDecrease = allowQualityDecrease; }
        if (forceFaceDeflection !== undefined) { this.forceFaceDeflection = forceFaceDeflection; }
        if (angularDeflection !== undefined) { this.angularDeflection = angularDeflection; }
        if (relativeDeflection !== undefined) { this.relativeDeflection = relativeDeflection; }
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
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.001
     */
    precision?: number | undefined = 0.01;
    /**
     * The largest angle, in radians, a curved face may turn between neighbouring triangles; smaller
     * follows curvature more closely with more triangles.
     * @default 0.5
     * @minimum 0.001
     * @maximum 3.14159
     * @step 0.05
     */
    angularDeflection?: number | undefined = 0.5;
    /**
     * When true, `precision` is a fraction of each edge's and face's size instead of model units, so
     * small and large parts get triangles in proportion to their size.
     * @default false
     */
    relativeDeflection?: boolean | undefined = false;
    /**
     * When true, the meshes are turned so this library's Y-up becomes Z-up, for tools that treat Z
     * as up.
     * @default false
     */
    adjustYtoZ?: boolean | undefined = false;
    /**
     * When true, each face and edge entry also carries its area or length, center of mass, surface
     * or curve type, tolerance, neighbors and ids, at extra cost.
     * @default false
     */
    computeMetadata?: boolean | undefined = false;
    /**
     * When true, the triangulations stay on the shapes for the next mesh with the same settings to
     * reuse; when false they are cleared. A mesh retention budget keeps every mesh.
     * @default false
     */
    keepMeshData?: boolean | undefined = false;
    /**
     * When true, a face whose triangulation is not within 10% of the precision it needs is meshed
     * again; when false, a finer one is kept.
     * @default true
     */
    allowQualityDecrease?: boolean | undefined = true;
    /**
     * When true, every face is meshed at exactly the requested precision; when false, a face's
     * precision is raised to the average of its edges' and to twice its tolerance.
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
    fileName?: string | undefined = "shape.step";
    /**
     * When true, the shape is turned so this library's Y-up becomes STEP's Z-up.
     * @default false
     */
    adjustYtoZ?: boolean | undefined = false;
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
    fileName?: string | undefined = "shape.stl";
    /**
     * The meshing tolerance in model units; a smaller value follows curved surfaces more closely
     * and makes a bigger file.
     * @default 0.01
     */
    precision?: number | undefined = 0.01;
    /**
     * When true, the shape is turned so this library's Y-up becomes Z-up.
     * @default false
     */
    adjustYtoZ?: boolean | undefined = false;
    /**
     * When true, a browser download of the file is started where that is possible; the kernel
     * itself only returns the text or the bytes.
     * @default true
     */
    tryDownload?: boolean | undefined = true;
    /**
     * When true, the STL is written in its binary form, which is much smaller than the text form, and
     * comes back as bytes; when false, as ASCII text.
     * @default false
     */
    binary?: boolean | undefined = false;
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
    angularDeflection?: number | undefined = 0.1;
    /**
     * The largest distance, in model units, the traced polyline may stray from the curve; smaller
     * follows it more closely.
     * @default 0.1
     * @minimum 0
     * @maximum Infinity
     * @step 0.001
     */
    curvatureDeflection?: number | undefined = 0.1;
    /**
     * The fewest points any edge is traced with, however straight.
     * @default 2
     * @minimum 0
     * @maximum Infinity
     * @step 1
     */
    minimumOfPoints?: number | undefined = 2;
    /**
     * How close two parameter values must be to count as the same point.
     * @default 1.0e-9
     * @minimum 0
     * @maximum Infinity
     * @step 1.0e-9
     */
    uTolerance?: number | undefined = 1.0e-9;
    /**
     * Edges shorter than this, in model units, are traced with the minimum number of points.
     * @default 1.0e-7
     * @minimum 0
     * @maximum Infinity
     * @step 1.0e-7
     */
    minimumLength?: number | undefined = 1.0e-7;
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
    layer?: string | undefined = "Default";
    /**
     * The color of the paths as a hex string such as `#000000`.
     * @default #000000
     */
    color?: Base.Color | undefined = "#000000";
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
    colorFormat?: dxfColorFormatEnum | undefined = dxfColorFormatEnum.aci;
    /**
     * The DXF version to write: `AC1009` is R12, the most widely readable, `AC1015` is 2000.
     * @default AC1009
     */
    acadVersion?: dxfAcadVersionEnum | undefined = dxfAcadVersionEnum.AC1009;
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
     * @default step
     */
    fileType?: fileTypeEnum | undefined = fileTypeEnum.step;
    /**
     * When true, the shape is turned so the file's Z-up becomes this library's Y-up.
     * @default true
     */
    adjustZtoY?: boolean | undefined = true;
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
    adjustZtoY?: boolean | undefined = true;
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
    fileName?: string | undefined = "shape.step";
    /**
     * When true, the shape is turned so the file's Z-up becomes this library's Y-up.
     * @default true
     */
    adjustZtoY?: boolean | undefined = true;
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
     * @maximum Infinity
     * @step 0.001
     */
    meshPrecision?: number | undefined = 0.005;
    /**
     * The largest angle, in radians, between the normals of neighboring triangles; smaller gives
     * smoother curves and more triangles.
     * @default 0.5
     * @minimum 0.01
     * @maximum 3.141592653589793
     * @step 0.05
     */
    meshAngle?: number | undefined = 0.5;
    /**
     * When true, `meshPrecision` scales with each part's size, so small fasteners and large
     * housings both mesh well; when false it is an absolute distance.
     * @default true
     */
    meshRelative?: boolean | undefined = true;
    /**
     * When true, extra vertices are added inside curved faces for a closer fit, at the cost of
     * speed.
     * @default false
     */
    internalVerticesMode?: boolean | undefined = false;
    /**
     * When true, an extra pass refines triangles that bulge beyond the precision, at the cost of
     * speed.
     * @default false
     */
    controlSurfaceDeflection?: boolean | undefined = false;
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
    useDraco?: boolean | undefined = true;
    /**
     * How hard Draco compresses, from 0 for fastest and largest to 10 for slowest and smallest.
     * @default 7
     * @minimum 0
     * @maximum 10
     * @step 1
     */
    dracoCompressionLevel?: number | undefined = 7;
    /**
     * How many bits each vertex position keeps; fewer bits mean a smaller file and less precision.
     * @default 14
     * @minimum 0
     * @maximum 31
     * @step 1
     */
    dracoQuantizePositionBits?: number | undefined = 14;
    /**
     * How many bits each normal keeps; fewer bits mean a smaller file and less precision.
     * @default 10
     * @minimum 0
     * @maximum 31
     * @step 1
     */
    dracoQuantizeNormalBits?: number | undefined = 10;
    /**
     * How many bits each texture coordinate keeps; fewer bits mean a smaller file and less
     * precision.
     * @default 12
     * @minimum 0
     * @maximum 31
     * @step 1
     */
    dracoQuantizeTexcoordBits?: number | undefined = 12;
    /**
     * How many bits each vertex color keeps; fewer bits mean a smaller file and less precision.
     * @default 8
     * @minimum 0
     * @maximum 31
     * @step 1
     */
    dracoQuantizeColorBits?: number | undefined = 8;
    /**
     * How many bits other vertex attributes keep; fewer bits mean a smaller file and less
     * precision.
     * @default 12
     * @minimum 0
     * @maximum 31
     * @step 1
     */
    dracoQuantizeGenericBits?: number | undefined = 12;
    /**
     * When true, one quantization grid is used for every attribute instead of one per attribute.
     * @default false
     */
    dracoUnifiedQuantization?: boolean | undefined = false;
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
    readColors?: boolean | undefined = true;

    /**
     * When true, part names are read from the file; switch it off for faster parsing when names are
     * not needed.
     * @default true
     */
    readNames?: boolean | undefined = true;

    /**
     * When true, materials are read from the file; needed for material properties in the glTF.
     * @default true
     */
    readMaterials?: boolean | undefined = true;

    /**
     * When true, layer information is read from the file; rarely needed for glTF.
     * @default false
     */
    readLayers?: boolean | undefined = false;

    /**
     * When true, validation properties are read from the file; rarely needed for glTF.
     * @default false
     */
    readProps?: boolean | undefined = false;

    // ==================== Mesh Options ====================

    /**
     * How closely triangles follow curved surfaces: with `meshRelative` true a fraction of each
     * edge's length, otherwise an absolute distance in model units.
     * @default 0.005
     * @minimum 0.0001
     * @maximum Infinity
     * @step 0.001
     */
    meshDeflection?: number | undefined = 0.005;

    /**
     * The largest angle, in radians, between the normals of neighboring triangles; smaller gives
     * smoother curves and more triangles.
     * @default 0.5
     * @minimum 0.01
     * @maximum 3.141592653589793
     * @step 0.1
     */
    meshAngle?: number | undefined = 0.5;

    /**
     * When true, faces are meshed on several threads where the build allows it.
     * @default true
     */
    meshParallel?: boolean | undefined = true;

    /**
     * Above this many faces the assembly is meshed solid by solid to save memory; -1 meshes
     * everything in one pass, which is fastest.
     * @default -1
     * @minimum -1
     * @maximum Infinity
     * @step 10000
     */
    faceCountThreshold?: number | undefined = -1;

    /**
     * When true, `meshDeflection` scales with each part's size, so small fasteners and large
     * housings both mesh well; when false it is an absolute distance.
     * @default true
     */
    meshRelative?: boolean | undefined = true;

    /**
     * When true, extra vertices are added inside curved faces for a closer fit, at the cost of
     * speed.
     * @default false
     */
    internalVerticesMode?: boolean | undefined = false;

    /**
     * When true, an extra pass refines triangles that bulge beyond the precision, at the cost of
     * speed.
     * @default false
     */
    controlSurfaceDeflection?: boolean | undefined = false;

    // ==================== glTF Writer Options ====================

    /**
     * When true, the faces of a part are joined into one mesh, which makes a smaller file.
     * @default true
     */
    mergeFaces?: boolean | undefined = true;

    /**
     * When true, merged meshes use 16-bit indexes where they fit, which makes a smaller file.
     * @default true
     */
    splitIndices16?: boolean | undefined = true;

    /**
     * When true, the glTF is written on several threads, which helps with large files.
     * @default true
     */
    parallelWrite?: boolean | undefined = true;

    /**
     * When true, textures are embedded in the GLB instead of referenced as separate files.
     * @default true
     */
    embedTextures?: boolean | undefined = true;

    /**
     * When true, texture coordinates are written even for meshes without textures.
     * @default false
     */
    forceUVExport?: boolean | undefined = false;

    /**
     * What the glTF nodes are named after: the instance, the product, a combination, or nothing.
     * @default instance
     */
    nodeNameFormat?: gltfNameFormatEnum | undefined = gltfNameFormatEnum.instance;

    /**
     * What the glTF meshes are named after: the instance, the product, a combination, or nothing.
     * @default instance
     */
    meshNameFormat?: gltfNameFormatEnum | undefined = gltfNameFormatEnum.instance;

    /**
     * How node placements are written: `compact` as translation, rotation and scale where possible,
     * `mat4` always as a matrix, `trs` always as the three parts.
     * @default compact
     */
    transformFormat?: gltfTransformFormatEnum | undefined = gltfTransformFormatEnum.compact;

    // ==================== Coordinate System Options ====================

    /**
     * When true, the file's Z-up is turned into glTF's Y-up; false keeps Z up.
     * @default true
     */
    adjustZtoY?: boolean | undefined = true;

    /**
     * A factor applied to the whole model, such as 0.001 to turn millimeters into meters; 1 keeps
     * the size.
     * @default 1.0
     * @minimum 0.000001
     * @maximum 1000000
     * @step 0.001
     */
    scale?: number | undefined = 1.0;
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
    useDraco?: boolean | undefined = true;
    /**
     * How hard Draco compresses, from 0 for fastest and largest to 10 for slowest and smallest.
     * @default 7
     * @minimum 0
     * @maximum 10
     * @step 1
     */
    dracoCompressionLevel?: number | undefined = 7;
    /**
     * How many bits each vertex position keeps; fewer bits mean a smaller file and less precision.
     * @default 14
     * @minimum 0
     * @maximum 31
     * @step 1
     */
    dracoQuantizePositionBits?: number | undefined = 14;
    /**
     * How many bits each normal keeps; fewer bits mean a smaller file and less precision.
     * @default 10
     * @minimum 0
     * @maximum 31
     * @step 1
     */
    dracoQuantizeNormalBits?: number | undefined = 10;
    /**
     * How many bits each texture coordinate keeps; fewer bits mean a smaller file and less
     * precision.
     * @default 12
     * @minimum 0
     * @maximum 31
     * @step 1
     */
    dracoQuantizeTexcoordBits?: number | undefined = 12;
    /**
     * How many bits each vertex color keeps; fewer bits mean a smaller file and less precision.
     * @default 8
     * @minimum 0
     * @maximum 31
     * @step 1
     */
    dracoQuantizeColorBits?: number | undefined = 8;
    /**
     * How many bits other vertex attributes keep; fewer bits mean a smaller file and less
     * precision.
     * @default 12
     * @minimum 0
     * @maximum 31
     * @step 1
     */
    dracoQuantizeGenericBits?: number | undefined = 12;
    /**
     * When true, one quantization grid is used for every attribute instead of one per attribute.
     * @default false
     */
    dracoUnifiedQuantization?: boolean | undefined = false;
}

// =====================================================
// Document-based Assembly API DTOs
// These DTOs work with document handles directly instead of docId strings.
// The caller is responsible for managing document lifetime via document.delete().
// =====================================================

