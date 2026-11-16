import type { Base } from "@bitbybit-dev/base";
import type { IO } from "@bitbybit-dev/base/lib/api/inputs/io-inputs";
import { dxfAcadVersionEnum } from "./enums";

/**
 * Shapes to join for `shapeFix.sewWithReport`, which sews their faces together along edges that lie
 * within `tolerance` of each other and reports what it joined and what it left open.
 */
export class SewWithReportDto<T> {
    constructor(shapes?: T[], tolerance?: number, nonManifold?: boolean) {
        if (shapes !== undefined) { this.shapes = shapes; }
        if (tolerance !== undefined) { this.tolerance = tolerance; }
        if (nonManifold !== undefined) { this.nonManifold = nonManifold; }
    }
    /**
     * The faces, shells or other shapes whose faces are sewn together.
     * @default undefined
     */
    shapes!: T[];
    /**
     * How far apart two edges may lie and still be sewn into one, in model units.
     * @default 1e-7
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.000001
     */
    tolerance?: number | undefined = 1e-7;
    /**
     * When true, an edge may join more than two faces, as where three sheets meet along one line;
     * when false, an edge joins two faces at most.
     * @default false
     */
    nonManifold?: boolean | undefined = false;
}

/**
 * An STL file for `io.loadStl`, which reads its triangles into a shape: one planar face per triangle,
 * or one face that carries the whole mesh.
 */
export class LoadStlDto {
    constructor(stlData?: string | ArrayBuffer | Uint8Array | File | Blob, asFaces?: boolean, adjustZtoY?: boolean) {
        if (stlData !== undefined) { this.stlData = stlData; }
        if (asFaces !== undefined) { this.asFaces = asFaces; }
        if (adjustZtoY !== undefined) { this.adjustZtoY = adjustZtoY; }
    }
    /**
     * The STL file, ASCII or binary: the text of an ASCII file, or the file as ArrayBuffer,
     * Uint8Array, File or Blob.
     * @default undefined
     */
    stlData!: string | ArrayBuffer | Uint8Array | File | Blob;
    /**
     * When true, each triangle becomes a planar face that sewing can join into a shell; when false,
     * one face carries the whole mesh, light to draw but not for modelling.
     * @default false
     */
    asFaces?: boolean | undefined = false;
    /**
     * When true, the file's Z-up is turned into this library's Y-up.
     * @default true
     */
    adjustZtoY?: boolean | undefined = true;
}

/**
 * A BREP file for `io.loadBrep`, the text format that keeps a shape's exact geometry and topology,
 * as `io.saveShapeBrep` writes it.
 */
export class LoadBrepDto {
    constructor(brepData?: string | File | Blob) {
        if (brepData !== undefined) { this.brepData = brepData; }
    }
    /**
     * The BREP file's text, or a File or Blob that holds it.
     * @default undefined
     */
    brepData!: string | File | Blob;
}

/**
 * A shape and file options for `io.saveShapeBrep`, which writes the shape as a BREP file, the exact
 * text format `io.loadBrep` reads back.
 */
export class SaveBrepDto<T> {
    constructor(shape?: T, fileName?: string, tryDownload?: boolean, withTriangulation?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (fileName !== undefined) { this.fileName = fileName; }
        if (tryDownload !== undefined) { this.tryDownload = tryDownload; }
        if (withTriangulation !== undefined) { this.withTriangulation = withTriangulation; }
    }
    /**
     * The shape written to the file.
     * @default undefined
     */
    shape!: T;
    /**
     * The name the downloaded file gets.
     * @default shape.brep
     */
    fileName?: string | undefined = "shape.brep";
    /**
     * When true, a browser download of the file is started where that is possible; the kernel
     * itself only returns the text.
     * @default true
     */
    tryDownload?: boolean | undefined = true;
    /**
     * When true, the mesh a shape carries is written with it, so a shape read back draws without
     * meshing again; false writes only the exact geometry.
     * @default true
     */
    withTriangulation?: boolean | undefined = true;
}

/**
 * A shape and file options for `io.saveShapeBrepBinary`, which writes the shape as binary BREP: the
 * same exact geometry and topology as the text form, in bytes `io.loadBrepBinary` reads back.
 */
export class SaveBrepBinaryDto<T> {
    constructor(shape?: T, fileName?: string, tryDownload?: boolean, withTriangulation?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (fileName !== undefined) { this.fileName = fileName; }
        if (tryDownload !== undefined) { this.tryDownload = tryDownload; }
        if (withTriangulation !== undefined) { this.withTriangulation = withTriangulation; }
    }
    /**
     * The shape written to the file.
     * @default undefined
     */
    shape!: T;
    /**
     * The name the downloaded file gets.
     * @default shape.bbrep
     */
    fileName?: string | undefined = "shape.bbrep";
    /**
     * When true, a browser download of the file is started where that is possible; the kernel
     * itself only returns the bytes.
     * @default true
     */
    tryDownload?: boolean | undefined = true;
    /**
     * When true, the mesh a shape carries is written with it, so a shape read back draws without
     * meshing again; false writes only the exact geometry.
     * @default true
     */
    withTriangulation?: boolean | undefined = true;
}

/**
 * The bytes of a binary BREP file for `io.loadBrepBinary`.
 */
export class LoadBrepBinaryDto {
    constructor(brepData?: ArrayBuffer | Uint8Array | File | Blob) {
        if (brepData !== undefined) { this.brepData = brepData; }
    }
    /**
     * The binary BREP file's bytes, or a File or Blob that holds them.
     * @default undefined
     */
    brepData!: ArrayBuffer | Uint8Array | File | Blob;
}

/**
 * A DXF file for `io.loadDxf` and `io.loadDxfStructured`, which build its lines, arcs, circles,
 * ellipses, polylines and splines as exact edges joined into wires, and faces where asked.
 */
export class LoadDxfDto {
    constructor(dxf?: string | File | Blob, makeFaces?: boolean, joinTolerance?: number, includeHiddenLayers?: boolean, unit?: Base.unitOfLengthEnum) {
        if (dxf !== undefined) { this.dxf = dxf; }
        if (makeFaces !== undefined) { this.makeFaces = makeFaces; }
        if (joinTolerance !== undefined) { this.joinTolerance = joinTolerance; }
        if (includeHiddenLayers !== undefined) { this.includeHiddenLayers = includeHiddenLayers; }
        if (unit !== undefined) { this.unit = unit; }
    }
    /**
     * The DXF file's text, or a File or Blob holding it (ASCII DXF, R12 or later). Older bytes not
     * in UTF-8 are read in the header's code page, or Windows-1252.
     * @default undefined
     */
    dxf!: string | File | Blob;
    /**
     * When true, closed outlines that lie flat in the drawing become faces, an outline inside
     * another cutting a hole in it as an even-odd fill does; open outlines stay wires.
     * @default false
     */
    makeFaces?: boolean | undefined = false;
    /**
     * How far apart, in file units, two entities' ends may lie and still join into one wire: at most
     * 0.001 or a hundredth of the drawing's span, whichever is larger.
     * @default 0.001
     * @minimum 0
     * @maximum Infinity
     * @step 0.001
     */
    joinTolerance?: number | undefined = 0.001;
    /**
     * When true, entities on frozen and switched-off layers are read too.
     * @default false
     */
    includeHiddenLayers?: boolean | undefined = false;
    /**
     * The unit to give the shapes in, scaled from the unit the file states; a file stating none is
     * read as drawn. Left out, the numbers stay as drawn.
     * @default undefined
     * @optional true
     */
    unit?: Base.unitOfLengthEnum | undefined;
}

/**
 * One layer, color and line type of a DXF file that `io.loadDxfStructured` read, with its shape.
 * An output, not an input.
 */
export class DxfShapePart<T> {
    /**
     * The layer the entities lie on.
     */
    layer!: string;
    /**
     * Their color as hex, such as `#ff0000`.
     */
    color!: string;
    /**
     * Their line type.
     */
    lineType!: IO.lineTypeEnum;
    /**
     * A compound of their wires, and of faces when `makeFaces` asked for them.
     */
    shape!: T;
}

/**
 * What `io.loadDxfStructured` returns: one shape per layer, color and line type, the file's unit
 * and version, and any warnings. An output, not an input.
 */
export class DxfShapesResult<T> {
    /**
     * One entry per layer, color and line type, in the order the file first uses each; one with
     * nothing that could be drawn has no entry.
     */
    parts!: DxfShapePart<T>[];
    /**
     * The unit the shapes are in: the one asked for, or the file's when none was asked; left out
     * when the file states none it knows.
     * @optional true
     */
    unit?: Base.unitOfLengthEnum | undefined;
    /**
     * The file's DXF version, such as `AC1015` for AutoCAD 2000; empty when it states none.
     */
    version!: string;
    /**
     * What the file held that was left out or changed, such as text, hatches or entities on hidden
     * layers.
     */
    warnings!: string[];
}

/**
 * A shape, a file name and meshing options for `io.saveShapeObj`, which triangulates the shape and
 * writes it as an OBJ file with the material library its `mtllib` line names.
 */
export class SaveObjDto<T> {
    constructor(shape?: T, fileName?: string, precision?: number, adjustYtoZ?: boolean, tryDownload?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (fileName !== undefined) { this.fileName = fileName; }
        if (precision !== undefined) { this.precision = precision; }
        if (adjustYtoZ !== undefined) { this.adjustYtoZ = adjustYtoZ; }
        if (tryDownload !== undefined) { this.tryDownload = tryDownload; }
    }
    /**
     * The shape written to the file.
     * @default undefined
     */
    shape!: T;
    /**
     * The name the downloaded file gets. Without its extension it also names the shape and the
     * material library, so it may hold no spaces or slashes.
     * @default shape.obj
     */
    fileName?: string | undefined = "shape.obj";
    /**
     * The meshing tolerance in model units; a smaller value follows curved surfaces more closely
     * and makes a bigger file.
     * @default 0.01
     * @minimum 1e-7
     * @maximum Infinity
     * @step 0.001
     */
    precision?: number | undefined = 0.01;
    /**
     * When true, the file is written Z-up for CAD programs. With the conventions set, the file shows
     * what the screen shows either way; without them this swaps Y and Z.
     * @default false
     */
    adjustYtoZ?: boolean | undefined = false;
    /**
     * When true, a browser download of the OBJ file and of any material library is started where
     * that is possible; the kernel itself only returns the texts.
     * @default true
     */
    tryDownload?: boolean | undefined = true;
}

/**
 * A shape, a file name and meshing options for `io.saveShapePly`, which triangulates the shape and
 * writes it as an ASCII PLY file with normals.
 */
export class SavePlyDto<T> {
    constructor(shape?: T, fileName?: string, precision?: number, adjustYtoZ?: boolean, tryDownload?: boolean) {
        if (shape !== undefined) { this.shape = shape; }
        if (fileName !== undefined) { this.fileName = fileName; }
        if (precision !== undefined) { this.precision = precision; }
        if (adjustYtoZ !== undefined) { this.adjustYtoZ = adjustYtoZ; }
        if (tryDownload !== undefined) { this.tryDownload = tryDownload; }
    }
    /**
     * The shape written to the file.
     * @default undefined
     */
    shape!: T;
    /**
     * The name the downloaded file gets.
     * @default shape.ply
     */
    fileName?: string | undefined = "shape.ply";
    /**
     * The meshing tolerance in model units; a smaller value follows curved surfaces more closely
     * and makes a bigger file.
     * @default 0.01
     * @minimum 1e-7
     * @maximum Infinity
     * @step 0.001
     */
    precision?: number | undefined = 0.01;
    /**
     * When true, the file is written Z-up for CAD programs. With the conventions set, the file shows
     * what the screen shows either way; without them this swaps Y and Z.
     * @default false
     */
    adjustYtoZ?: boolean | undefined = false;
    /**
     * When true, a browser download of the file is started where that is possible; the kernel
     * itself only returns the text.
     * @default true
     */
    tryDownload?: boolean | undefined = true;
}

/**
 * A shape, a view and file options for `io.saveShapeSvg`, which draws the edges the view sees as an
 * SVG drawing, and the edges other faces cover dashed when asked.
 */
export class SaveSvgDto<T> {
    constructor(shape?: T, frame?: Base.Frame, drawHidden?: boolean, precision?: number, fileName?: string, tryDownload?: boolean, unit?: Base.unitOfLengthEnum) {
        if (shape !== undefined) { this.shape = shape; }
        if (frame !== undefined) { this.frame = frame; }
        if (drawHidden !== undefined) { this.drawHidden = drawHidden; }
        if (precision !== undefined) { this.precision = precision; }
        if (fileName !== undefined) { this.fileName = fileName; }
        if (tryDownload !== undefined) { this.tryDownload = tryDownload; }
        if (unit !== undefined) { this.unit = unit; }
    }
    /**
     * The shape to draw.
     * @default undefined
     */
    shape!: T;
    /**
     * The view, as in `operations.hiddenLines`: the eye sits on the side the normal points to and
     * looks back along it, and the drawing's x runs along the direction.
     * @default undefined
     */
    frame!: Base.Frame;
    /**
     * When true, the edges other faces cover are drawn too, dashed.
     * @default false
     */
    drawHidden?: boolean | undefined = false;
    /**
     * How far the view may stray from the shape, in model units: the tolerance of hidden-line
     * removal and of the cubics that stand in for curves SVG cannot draw.
     * @default 0.01
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.001
     */
    precision?: number | undefined = 0.01;
    /**
     * The unit the shape is modelled in. Given, the drawing states its true width and height; left
     * out, it has only a view box.
     * @default undefined
     * @optional true
     */
    unit?: Base.unitOfLengthEnum | undefined;
    /**
     * The name the downloaded file gets.
     * @default shape.svg
     */
    fileName?: string | undefined = "shape.svg";
    /**
     * When true, a browser download of the file is started where that is possible; the kernel
     * itself only returns the text.
     * @default true
     */
    tryDownload?: boolean | undefined = true;
}

/**
 * A shape, a view and file options for `io.saveShapeDxf`, which draws the edges the view sees as a
 * DXF drawing, and the edges other faces cover on a hidden layer when asked.
 */
export class SaveDxfDto<T> {
    constructor(shape?: T, frame?: Base.Frame, drawHidden?: boolean, precision?: number, fileName?: string, tryDownload?: boolean, unit?: Base.unitOfLengthEnum, acadVersion?: dxfAcadVersionEnum) {
        if (shape !== undefined) { this.shape = shape; }
        if (frame !== undefined) { this.frame = frame; }
        if (drawHidden !== undefined) { this.drawHidden = drawHidden; }
        if (precision !== undefined) { this.precision = precision; }
        if (fileName !== undefined) { this.fileName = fileName; }
        if (tryDownload !== undefined) { this.tryDownload = tryDownload; }
        if (unit !== undefined) { this.unit = unit; }
        if (acadVersion !== undefined) { this.acadVersion = acadVersion; }
    }
    /**
     * The shape to draw.
     * @default undefined
     */
    shape!: T;
    /**
     * The view, as in `operations.hiddenLines`: the eye sits on the side the normal points to and
     * looks back along it, and the drawing's x runs along the direction.
     * @default undefined
     */
    frame!: Base.Frame;
    /**
     * When true, the edges other faces cover are drawn too, on the layer `hidden` with the
     * `HIDDEN` line type.
     * @default false
     */
    drawHidden?: boolean | undefined = false;
    /**
     * How far the view may stray from the shape, in model units: the tolerance of the hidden-line
     * removal, and of the polylines that stand in for curves in `AC1009`.
     * @default 0.01
     * @minimum 0
     * @exclusiveMinimum true
     * @maximum Infinity
     * @step 0.001
     */
    precision?: number | undefined = 0.01;
    /**
     * The unit the shape is modelled in, written into the file so CAD programs open it at true
     * size; `AC1015` only.
     * @default undefined
     * @optional true
     */
    unit?: Base.unitOfLengthEnum | undefined;
    /**
     * The DXF version: `AC1015` (AutoCAD 2000) keeps every curve exact; `AC1009` (R12) writes
     * splines and ellipses as polylines.
     * @default AC1015
     */
    acadVersion?: dxfAcadVersionEnum | undefined = dxfAcadVersionEnum.AC1015;
    /**
     * The name the downloaded file gets.
     * @default shape.dxf
     */
    fileName?: string | undefined = "shape.dxf";
    /**
     * When true, a browser download of the file is started where that is possible; the kernel
     * itself only returns the text.
     * @default true
     */
    tryDownload?: boolean | undefined = true;
}

/**
 * A glTF file for `assembly.manager.loadGltfToDoc`, which reads its meshes, names, colors and
 * hierarchy into an assembly document.
 */
export class LoadGltfToDocDto {
    constructor(gltfData?: string | ArrayBuffer | Uint8Array | File | Blob) {
        if (gltfData !== undefined) { this.gltfData = gltfData; }
    }
    /**
     * A binary `.glb`, or a `.gltf` with its buffers embedded, as text, ArrayBuffer, Uint8Array,
     * File or Blob; the file's header tells which of the two it is.
     * @default undefined
     */
    gltfData!: string | ArrayBuffer | Uint8Array | File | Blob;
}

/**
 * An OBJ file for `assembly.manager.loadObjToDoc`, which reads its meshes and names into an
 * assembly document.
 */
export class LoadObjToDocDto {
    constructor(objData?: string | ArrayBuffer | Uint8Array | File | Blob) {
        if (objData !== undefined) { this.objData = objData; }
    }
    /**
     * The OBJ file as text, ArrayBuffer, Uint8Array, File or Blob; a material library it names is
     * not read.
     * @default undefined
     */
    objData!: string | ArrayBuffer | Uint8Array | File | Blob;
}

/**
 * A document, a meshing tolerance and file options for `assembly.manager.exportDocumentToObj`, which
 * writes the document as an OBJ file with the material library its `mtllib` line names.
 */
export class ExportDocumentToObjDto<T> {
    constructor(document?: T, meshDeflection?: number, fileName?: string, tryDownload?: boolean) {
        if (document !== undefined) { this.document = document; }
        if (meshDeflection !== undefined) { this.meshDeflection = meshDeflection; }
        if (fileName !== undefined) { this.fileName = fileName; }
        if (tryDownload !== undefined) { this.tryDownload = tryDownload; }
    }
    /**
     * The document from `buildAssemblyDocument`, `loadStepToDoc` or another loader.
     * @default undefined
     */
    document!: T;
    /**
     * How closely triangles follow curved surfaces, in model units; smaller gives a finer mesh.
     * @default 0.1
     * @minimum 1e-7
     * @maximum Infinity
     * @step 0.01
     */
    meshDeflection?: number | undefined = 0.1;
    /**
     * The name the downloaded file gets. Without its extension it also names the material library,
     * so it may hold no spaces or slashes.
     * @default assembly.obj
     */
    fileName?: string | undefined = "assembly.obj";
    /**
     * When true, a browser download of the OBJ file and of any material library is started where
     * that is possible; the kernel itself only returns the texts.
     * @default false
     */
    tryDownload?: boolean | undefined = false;
}

/**
 * A document, a meshing tolerance and file options for `assembly.manager.exportDocumentToPly`,
 * which writes the document as an ASCII PLY file with normals and colors.
 */
export class ExportDocumentToPlyDto<T> {
    constructor(document?: T, meshDeflection?: number, fileName?: string, tryDownload?: boolean) {
        if (document !== undefined) { this.document = document; }
        if (meshDeflection !== undefined) { this.meshDeflection = meshDeflection; }
        if (fileName !== undefined) { this.fileName = fileName; }
        if (tryDownload !== undefined) { this.tryDownload = tryDownload; }
    }
    /**
     * The document from `buildAssemblyDocument`, `loadStepToDoc` or another loader.
     * @default undefined
     */
    document!: T;
    /**
     * How closely triangles follow curved surfaces, in model units; smaller gives a finer mesh.
     * @default 0.1
     * @minimum 1e-7
     * @maximum Infinity
     * @step 0.01
     */
    meshDeflection?: number | undefined = 0.1;
    /**
     * The name the downloaded file gets.
     * @default assembly.ply
     */
    fileName?: string | undefined = "assembly.ply";
    /**
     * When true, a browser download of the file is started where that is possible; the kernel
     * itself only returns the text.
     * @default false
     */
    tryDownload?: boolean | undefined = false;
}
