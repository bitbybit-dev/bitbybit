import type { IGESControl_Reader, BitbybitOcctModule, Handle_TDocStd_Document, STEPControl_Reader, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import type { OccHelper } from "../occ-helper";
import * as Inputs from "../api/inputs";
import type * as Models from "../api/models";
import type { IO } from "@bitbybit-dev/base/lib/api/inputs";
import { InputError, messageOf, resolveDto } from "@bitbybit-dev/base";
import type * as Resolved from "../api/resolved-inputs";
import { checkedNumber, checkedShape } from "./base/input-checks";
import { withKernelRefusals } from "./base/kernel-refusals";
import { SMALLEST_MESH_DEFLECTION, bytesOfFile, objNameOf, textOfFile } from "./base/file-data";
import { igesLengthUnit, stepLengthUnit, stepOrIgesKindOf } from "./base/file-units";
import { gunzipped, isGzip } from "@bitbybit-dev/base/lib/api/services/helpers/files/gzip";
import { readKernelException } from "../kernel-exception";
import { trapOr } from "../kernel-traps";
import { checkedView, viewParts } from "./base/view-drawings";
import { groundPathsOf, svgModelOf } from "./base/drawing-layers";
import { withKernelErrorsRead } from "./base/kernel-refusals";
import { kernelObjects, released } from "./base/release";
import { DxfLoader } from "./base/dxf-loader";
import { followsCoordinateSystem, shapeInFileAxes, shapeInModelAxes, stlInFileAxes, stlInModelAxes, turnedFromZUp, turnedToZUp } from "./base/file-axes";

const BREP_HEADER = /^\s*(DBRep_DrawableShape\s+)?CASCADE Topology V\d/;

const BREP_ENDING = /\r?\nTShapes \d+\r?\n[\s\S]*\r?\n[+\-ie]\d+ \d+\s*$/;

/**
 * Reading and writing OpenCascade shapes in exchange formats: STEP, IGES, STL, BREP and DXF in; STEP,
 * STL, BREP, OBJ, PLY, SVG and DXF out; STEP to glTF conversion with the assembly tree, colors and names
 * preserved, and a STEP assembly structure as JSON. Files travel as text or binary data, never as
 * paths. CAD files stand Z up while this library models Y up, so `upAxis` turns a shape between the
 * two. With the conventions set every file shows what the screen shows; without them a turn swaps Y
 * and Z, which mirrors the shape.
 */
export class OCCTIO {
    private readonly dxfLoader: DxfLoader;

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
        this.dxfLoader = new DxfLoader(occ, och);
    }

    /**
     * Writes a shape as STEP, the exchange format for exact CAD geometry, and returns its text.
     *
     * With `upAxis` `yUpToZUp` the file is Z-up, as CAD programs expect: with the conventions set it
     * shows what the screen shows, and without them Y and Z are swapped. The file is in
     * millimetres, a shape in another `unit` scaled to them.
     * @param inputs - The shape, the file name, the axis adjustment, the unit and the download options
     * @returns The STEP file as text
     * @group io
     * @shortname save step and return
     * @drawable false
     * @example
     * ```typescript
     * const step = await bitbybit.occt.io.saveShapeSTEPAndReturn({ shape: box, fileName: "box.step", upAxis: Bit.Inputs.Base.upAxisConversionEnum.yUpToZUp, tryDownload: false });
     * ```
     */
    saveShapeSTEP(inputs: Inputs.OCCT.SaveStepDto<TopoDS_Shape>): string {
        const resolved = resolveDto(Inputs.OCCT.SaveStepDto, inputs) as Resolved.OCCT.SaveStepDto<TopoDS_Shape>;
        const millimetres = this.och.base.math.millimetresPerUnit({ unit: resolved.unit });
        const adjustedShape = shapeInFileAxes(this.och, resolved.shape, turnedToZUp(resolved.upAxis), resolved.fromRightHanded);
        const scaledShape = millimetres === 1 ? undefined : released(adjustedShape === undefined ? [] : [adjustedShape], () => this.och.transformsService.scaleFromCenter({ shape: adjustedShape ?? resolved.shape, factor: millimetres, center: [0, 0, 0] }));
        const writer = new this.occ.STEPControl_Writer();
        try {
            let transferResult;
            try {
                transferResult = withKernelErrorsRead(this.occ, () => writer.Transfer(scaledShape ?? adjustedShape ?? resolved.shape, this.occ.STEPControl_StepModelType.AsIs));
            } catch (ex) {
                throw trapOr(ex, () => new Error("Failed when calling writer.Transfer.", { cause: ex }));
            }
            if (transferResult !== this.occ.IFSelect_ReturnStatus.RetDone) {
                throw (new Error("Failed when transfering to step writer."));
            }
            const fileName = "x";
            if (writer.Write(fileName) !== this.occ.IFSelect_ReturnStatus.RetDone) {
                throw (new Error("Failed when writing step file."));
            }
            const stepFileText = this.occ.FS.readFile("/" + fileName, { encoding: "utf8" }) as string;
            this.occ.FS.unlink("/" + fileName);
            return stepFileText;
        } finally {
            writer.delete();
            (scaledShape === undefined ? adjustedShape : scaledShape)?.delete();
        }
    }

    /**
     * Triangulates a shape and writes it as STL, the mesh format 3D printers read, returning its
     * text, or its bytes when `binary` is true.
     *
     * `precision` is the meshing tolerance in model units, smaller following curves more closely.
     * With the conventions set the file shows what the screen shows, Z-up under `yUpToZUp`.
     * `fileName` and `tryDownload` matter only for a download.
     * @param inputs - The shape, the file name, the meshing precision, the axis adjustment, the form and the download options
     * @returns The STL file as text, or as bytes when `binary` is true
     * @group io
     * @shortname save stl return
     * @drawable false
     * @example
     * ```typescript
     * const stl = await bitbybit.occt.io.saveShapeStlAndReturn({ shape: box, fileName: "box.stl", precision: 0.01, upAxis: Bit.Inputs.Base.upAxisConversionEnum.yUpToZUp, tryDownload: false });
     * const bytes = await bitbybit.occt.io.saveShapeStlAndReturn({ shape: box, fileName: "box.stl", precision: 0.01, upAxis: Bit.Inputs.Base.upAxisConversionEnum.yUpToZUp, tryDownload: false, binary: true });
     * ```
     */
    saveShapeStl(inputs: Inputs.OCCT.SaveStlDto<TopoDS_Shape>): string | Uint8Array {
        const resolved = resolveDto(Inputs.OCCT.SaveStlDto, inputs) as Resolved.OCCT.SaveStlDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const precision = checkedNumber(resolved.precision, "precision", SMALLEST_MESH_DEFLECTION);
        const zUp = turnedToZUp(resolved.upAxis);
        const fileName = "x";
        const { own, releaseAll } = kernelObjects();
        try {
            const transferShape = own(this.occ.BRepBuilderAPI_Copy_Shape(shape, false));
            const writer = own(new this.occ.StlAPI_Writer());
            own(new this.occ.BRepMesh_IncrementalMesh(transferShape, precision, false, 0.5, this.occ.RunsInParallel()));
            writer.SetASCIIMode(!resolved.binary);
            if (!writer.Write(transferShape, fileName)) {
                throw (new Error("Failed when writing stl file."));
            }
            const turned = stlInFileAxes(this.och, this.occ.FS.readFile("/" + fileName) as Uint8Array, zUp);
            return resolved.binary ? turned : new TextDecoder().decode(turned);
        } finally {
            this.removeFile("/" + fileName);
            releaseAll();
        }
    }

    /**
     * Writes a shape as BREP, the text format that keeps its exact geometry and topology, and
     * returns the file's text.
     *
     * `io.loadBrep` reads the text back into the same shape, placement and orientation included.
     * `fileName` and `tryDownload` only matter where a download can start.
     * @param inputs - The shape, the file name and the download option
     * @returns The BREP file as text
     * @group io
     * @shortname save brep and return
     * @drawable false
     * @example
     * ```typescript
     * const brep = await bitbybit.occt.io.saveShapeBrepAndReturn({ shape: box, fileName: "box.brep", tryDownload: false });
     * const copy = await bitbybit.occt.io.loadBrep({ brepData: brep });
     * ```
     */
    saveShapeBrep(inputs: Inputs.OCCT.SaveBrepDto<TopoDS_Shape>): string {
        const resolved = resolveDto(Inputs.OCCT.SaveBrepDto, inputs) as Resolved.OCCT.SaveBrepDto<TopoDS_Shape>;
        return this.occ.WriteBREPToString(checkedShape(resolved.shape), resolved.withTriangulation);
    }

    /**
     * Writes a shape as binary BREP, the exact geometry and topology `saveShapeBrep` writes as text,
     * in bytes, and returns them.
     *
     * `io.loadBrepBinary` reads them back with every face and edge at the same index.
     * `withTriangulation` false leaves out the mesh.
     * @param inputs - The shape, the file name, the download option and whether to keep the mesh
     * @returns The binary BREP file's bytes
     * @group io
     * @shortname save brep binary and return
     * @drawable false
     * @example
     * ```typescript
     * const bytes = await bitbybit.occt.io.saveShapeBrepBinaryAndReturn({ shape: box, fileName: "box.bbrep", tryDownload: false, withTriangulation: false });
     * const copy = await bitbybit.occt.io.loadBrepBinary({ brepData: bytes });
     * ```
     */
    saveShapeBrepBinary(inputs: Inputs.OCCT.SaveBrepBinaryDto<TopoDS_Shape>): Uint8Array {
        const resolved = resolveDto(Inputs.OCCT.SaveBrepBinaryDto, inputs) as Resolved.OCCT.SaveBrepBinaryDto<TopoDS_Shape>;
        return this.occ.WriteBREPToBytes(checkedShape(resolved.shape), resolved.withTriangulation);
    }

    /**
     * Triangulates a shape and writes it as OBJ, the mesh format most 3D programs read, returning
     * the file's text.
     *
     * `precision` is the meshing tolerance in model units and coordinates keep six decimals. With
     * the conventions set the file shows what the screen shows, Z-up under `yUpToZUp`. `mtl` stays
     * empty, since a shape carries no colors; `assembly.manager.exportDocumentToObj` writes colored
     * parts.
     * @param inputs - The shape, the file name, the meshing precision, the axis adjustment and the download option
     * @returns The OBJ text, with an empty material library text
     * @group io
     * @shortname save obj and return
     * @drawable false
     * @example
     * ```typescript
     * const files = await bitbybit.occt.io.saveShapeObjAndReturn({ shape: box, fileName: "box.obj", precision: 0.01, upAxis: Bit.Inputs.Base.upAxisConversionEnum.keep, tryDownload: false });
     * console.log(files.obj);
     * ```
     */
    saveShapeObj(inputs: Inputs.OCCT.SaveObjDto<TopoDS_Shape>): Models.OCCT.ObjFiles {
        const resolved = resolveDto(Inputs.OCCT.SaveObjDto, inputs) as Resolved.OCCT.SaveObjDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const precision = checkedNumber(resolved.precision, "precision", SMALLEST_MESH_DEFLECTION);
        const name = objNameOf(resolved.fileName, "fileName");
        return this.writtenAsDocument(shape, turnedToZUp(resolved.upAxis), name, document => {
            const files = this.occ.ExportDocumentToObj(document, precision, name);
            return { obj: files.obj, mtl: files.mtl };
        });
    }

    /**
     * Triangulates a shape and writes it as ASCII PLY with a normal per vertex, a mesh format
     * scanning tools read, returning the file's text.
     *
     * Coordinates keep six significant digits, so past 1000 units they keep two decimals.
     * `precision` is the meshing tolerance in model units. With the conventions set the file shows
     * what the screen shows, Z-up under `yUpToZUp`.
     * @param inputs - The shape, the file name, the meshing precision, the axis adjustment and the download option
     * @returns The PLY file as text
     * @group io
     * @shortname save ply and return
     * @drawable false
     * @example
     * ```typescript
     * const ply = await bitbybit.occt.io.saveShapePlyAndReturn({ shape: box, fileName: "box.ply", precision: 0.01, upAxis: Bit.Inputs.Base.upAxisConversionEnum.keep, tryDownload: false });
     * ```
     */
    saveShapePly(inputs: Inputs.OCCT.SavePlyDto<TopoDS_Shape>): string {
        const resolved = resolveDto(Inputs.OCCT.SavePlyDto, inputs) as Resolved.OCCT.SavePlyDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const precision = checkedNumber(resolved.precision, "precision", SMALLEST_MESH_DEFLECTION);
        return this.writtenAsDocument(shape, turnedToZUp(resolved.upAxis), "shape", document => this.occ.ExportDocumentToPly(document, precision));
    }

    /**
     * Draws the edges a view of a shape sees as SVG, hidden ones dashed when asked, and returns the
     * file's text.
     *
     * The view looks from the frame's normal side, x along the frame's direction. Curves stay exact
     * where SVG can draw them, others become cubics within `precision`; with the shape's `unit`, the
     * file states its true size.
     * @param inputs - The shape, the view, whether to draw hidden edges, the precision, the unit and the download options
     * @returns The SVG file as text
     * @group io
     * @shortname save svg and return
     * @drawable false
     * @example
     * ```typescript
     * const view = { origin: [0, 0, 0], normal: [1, 1, 1], direction: [1, -1, 0] };
     * const svg = await bitbybit.occt.io.saveShapeSvgAndReturn({ shape: box, frame: view, drawHidden: true, precision: 0.01, fileName: "box.svg", tryDownload: false });
     * ```
     */
    saveShapeSvg(inputs: Inputs.OCCT.SaveSvgDto<TopoDS_Shape>): string {
        const resolved = resolveDto(Inputs.OCCT.SaveSvgDto, inputs) as Resolved.OCCT.SaveSvgDto<TopoDS_Shape>;
        const view = checkedView(resolved.shape, resolved.frame, resolved.precision, resolved.unit);
        const parts = viewParts(this.occ, this.och, view, resolved.drawHidden);
        return this.och.base.io.svg.svgCreate({ parts, unit: view.unit, tolerance: view.precision });
    }

    /**
     * Puts shapes on a named layer with a color and a line type, making one layer of an SVG drawing.
     *
     * The shapes are kept as they are; `svgCreate` draws their wires when it writes the file.
     * @param inputs - The shapes, the layer name, the color and the line type
     * @returns The shapes as one styled layer
     * @group svg
     * @shortname svg layer
     * @drawable false
     * @example
     * ```typescript
     * const cut = await bitbybit.occt.io.svgLayer({ shapes: [outline], layer: "cut", color: "#ff0000" });
     * ```
     */
    svgLayer(inputs: Inputs.OCCT.SvgLayerDto<TopoDS_Shape>): Inputs.OCCT.SvgLayerDto<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.SvgLayerDto, inputs) as Resolved.OCCT.SvgLayerDto<TopoDS_Shape>;
        return { shapes: resolved.shapes, layer: resolved.layer, color: resolved.color, lineType: resolved.lineType };
    }

    /**
     * Draws layers of shapes into one SVG file and returns its text.
     *
     * Each layer becomes an Inkscape layer. The shapes are seen along Y: X stays X and Z becomes the
     * drawing's Y (-Z under right-handed conventions). Curves stay exact where SVG can draw them and
     * become cubics within `tolerance` elsewhere; with `unit` the file has its true size.
     * @param inputs - The layers, the unit, the line width, the border, the tolerance and the download options
     * @returns The SVG file as text
     * @group svg
     * @shortname svg create
     * @drawable false
     * @example
     * ```typescript
     * const cut = await bitbybit.occt.io.svgLayer({ shapes: [outline], layer: "cut", color: "#ff0000" });
     * const engrave = await bitbybit.occt.io.svgLayer({ shapes: [lettering], layer: "engrave", color: "#0000ff" });
     * const svg = await bitbybit.occt.io.svgCreate({ layers: [cut, engrave], unit: Bit.Inputs.Base.unitOfLengthEnum.millimetre, fileName: "panel.svg", tryDownload: false });
     * ```
     */
    svgCreate(inputs: Inputs.OCCT.SvgLayersDto<TopoDS_Shape>): string {
        const resolved = resolveDto(Inputs.OCCT.SvgLayersDto, inputs) as Resolved.OCCT.SvgLayersDto<TopoDS_Shape>;
        return this.och.base.io.svg.svgCreate(svgModelOf(this.och, resolved));
    }

    /**
     * Draws the edges a view of a shape sees as DXF, hidden ones on their own layer when asked, and
     * returns the file's text.
     *
     * The view looks from the frame's normal side, x along the frame's direction. Curves stay exact;
     * hidden edges go on the layer `hidden` with the `HIDDEN` line type.
     * @param inputs - The shape, the view, whether to draw hidden edges, the precision, the unit, the version and the download options
     * @returns The DXF file as text
     * @group io
     * @shortname save dxf and return
     * @drawable false
     * @example
     * ```typescript
     * const view = { origin: [0, 0, 0], normal: [0, 1, 0], direction: [1, 0, 0] };
     * const dxf = await bitbybit.occt.io.saveShapeDxfAndReturn({ shape: box, frame: view, drawHidden: true, precision: 0.01, fileName: "top.dxf", tryDownload: false });
     * ```
     */
    saveShapeDxf(inputs: Inputs.OCCT.SaveDxfDto<TopoDS_Shape>): string {
        const resolved = resolveDto(Inputs.OCCT.SaveDxfDto, inputs) as Resolved.OCCT.SaveDxfDto<TopoDS_Shape>;
        const view = checkedView(resolved.shape, resolved.frame, resolved.precision, resolved.unit);
        const parts = viewParts(this.occ, this.och, view, resolved.drawHidden);
        return this.och.base.io.dxf.dxfCreate({
            dxfPathsParts: parts,
            colorFormat: Inputs.OCCT.dxfColorFormatEnum.aci,
            acadVersion: resolved.acadVersion,
            unit: view.unit,
            curveTolerance: view.precision,
        });
    }

    /**
     * Reads a STEP or IGES file into one shape.
     *
     * The extension of `fileName` decides the kind: `.step`, `.stp`, `.stpz` are STEP, `.iges`,
     * `.igs`, `.igz` are IGES. `filetext` is text, or an ArrayBuffer for compressed and binary forms;
     * `upAxis` `zUpToYUp` turns Z-up into Y-up. The shape comes back in `unit`. An unreadable file gives
     * undefined.
     * @param inputs - The file content, its name with extension, the axis adjustment and the unit
     * @returns The shape, or undefined when the file could not be read
     */
    loadSTEPorIGES(inputs: Inputs.OCCT.LoadStepOrIgesDto): TopoDS_Shape | undefined {
        const resolved = resolveDto(Inputs.OCCT.LoadStepOrIgesDto, inputs) as Resolved.OCCT.LoadStepOrIgesDto;
        const zUp = turnedFromZUp(resolved.upAxis);
        const { fileName, filetext: fileText } = resolved;
        const millimetres = this.och.base.math.millimetresPerUnit({ unit: resolved.unit });
        const fileType = stepOrIgesKindOf(fileName);
        
        if (!fileType) {
            console.error("opencascade can't parse this extension!");
            return undefined;
        }
        
        const isBinaryInput = fileText instanceof ArrayBuffer;
        
        let stepShape: TopoDS_Shape | undefined;
        
        if (isBinaryInput) {
            const uint8Array = new Uint8Array(fileText);
            if (fileType === "step") {
                stepShape = this.occ.ReadSTEPFromBinary(uint8Array);
            } else if (fileType === "iges") {
                stepShape = this.occ.ReadIGESFromBinary(uint8Array);
            }
            
            if (!stepShape || stepShape.IsNull()) {
                stepShape?.delete();
                console.error("Failed to read " + fileType.toUpperCase() + " file: " + fileName);
                return undefined;
            }
        } else {
            this.occ.FS.createDataFile("/", `file.${fileType}`, fileText, true, true, true);
            
            const reader: STEPControl_Reader | IGESControl_Reader = fileType === "step" ? new this.occ.STEPControl_Reader() : new this.occ.IGESControl_Reader();
            try {
                const readResult = withKernelErrorsRead(this.occ, () => reader.ReadFile(`file.${fileType}`));
                if (readResult !== this.occ.IFSelect_ReturnStatus.RetDone) {
                    console.error("Something in OCCT went wrong trying to read " + fileName);
                    return undefined;
                }
                stepShape = withKernelErrorsRead(this.occ, () => {
                    reader.TransferRoots();
                    return reader.OneShape();
                });
            } finally {
                reader.delete();
                this.occ.FS.unlink(`/file.${fileType}`);
            }
            if (stepShape.IsNull()) {
                stepShape.delete();
                console.error("Failed to read " + fileType.toUpperCase() + " file: " + fileName);
                return undefined;
            }
        }
        
        const turned = shapeInModelAxes(this.och, stepShape, zUp);
        if (millimetres === 1) {
            return turned;
        }
        return released([turned], () => this.och.transformsService.scaleFromCenter({ shape: turned, factor: 1 / millimetres, center: [0, 0, 0] }));
    }

    /**
     * Reads the unit a STEP or IGES file writes its lengths in, without building its geometry.
     *
     * Millimetres, centimetres, metres and inches are told; a file in another unit, one whose parts
     * disagree, or one that states none gives undefined. `io.loadSTEPorIGES` reads any of them into
     * the `unit` it is asked for.
     * @param inputs - The file content and its name with extension
     * @returns The file's unit, or undefined when it is none of these or cannot be told
     * @group io
     * @shortname file length unit
     * @drawable false
     * @example
     * ```typescript
     * const unit = await bitbybit.occt.io.fileLengthUnit({ filetext: stepText, fileName: "bracket.step" });
     * const shape = await bitbybit.occt.io.loadSTEPorIGES({ filetext: stepText, fileName: "bracket.step", unit: unit ?? Bit.Inputs.Base.unitOfLengthEnum.millimetre });
     * ```
     */
    fileLengthUnit(inputs: Inputs.OCCT.FileLengthUnitDto): Inputs.Base.unitOfLengthEnum | undefined {
        const resolved = resolveDto(Inputs.OCCT.FileLengthUnitDto, inputs) as Resolved.OCCT.FileLengthUnitDto;
        const fileType = stepOrIgesKindOf(resolved.fileName);
        if (fileType === undefined) {
            throw new InputError(`\`fileName\` is ${JSON.stringify(resolved.fileName)}, which ends in none of a STEP or IGES file's extensions.`, "fileName");
        }
        const bytes = typeof resolved.filetext === "string" ? undefined : bytesOfFile(resolved.filetext, "filetext");
        const text = bytes === undefined ? textOfFile(resolved.filetext, "filetext") : new TextDecoder().decode(isGzip(bytes) ? gunzipped(bytes) : bytes);
        return fileType === "step" ? stepLengthUnit(text) : igesLengthUnit(text);
    }

    /**
     * Reads an STL file, ASCII or binary, into a shape: one planar face per triangle, or one face
     * that carries the whole mesh.
     *
     * With `asFaces` true the faces share their corners' edges in a compound that
     * `shapeFix.sewWithReport` can join into a shell. `upAxis` `zUpToYUp` turns Z-up into Y-up, and a file
     * without triangles is refused.
     * @param inputs - The STL file, the face option and the axis adjustment
     * @returns A compound of triangular faces, or one face that carries the mesh
     * @group io
     * @shortname load stl
     * @drawable true
     * @example
     * ```typescript
     * const mesh = await bitbybit.occt.io.loadStl({ stlData: stlText, asFaces: true, upAxis: Bit.Inputs.Base.upAxisConversionEnum.zUpToYUp });
     * const sewn = await bitbybit.occt.shapeFix.sewWithReport({ shapes: [mesh], tolerance: 1e-6 });
     * ```
     */
    loadStl(inputs: Inputs.OCCT.LoadStlDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.LoadStlDto, inputs) as Resolved.OCCT.LoadStlDto;
        const bytes = bytesOfFile(resolved.stlData, "stlData");
        return this.occ.ReadStlFromBytes(stlInModelAxes(this.och, bytes, turnedFromZUp(resolved.upAxis)), resolved.asFaces);
    }

    /**
     * Reads a BREP file, the text format that keeps a shape's exact geometry and topology, back into
     * the shape `io.saveShapeBrep` wrote.
     *
     * The shape keeps its placement and orientation. Text that is not a whole BREP file, such as
     * one cut short, is refused, and so is a damaged one, with where it is damaged.
     * @param inputs - The BREP file
     * @returns The shape the file holds
     * @group io
     * @shortname load brep
     * @drawable true
     * @example
     * ```typescript
     * const brep = await bitbybit.occt.io.saveShapeBrepAndReturn({ shape: box, fileName: "box.brep", tryDownload: false });
     * const copy = await bitbybit.occt.io.loadBrep({ brepData: brep });
     * ```
     */
    loadBrep(inputs: Inputs.OCCT.LoadBrepDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.LoadBrepDto, inputs);
        const text = textOfFile(resolved.brepData, "brepData");
        if (!BREP_HEADER.test(text) || !BREP_ENDING.test(text)) {
            throw new InputError("`brepData` is not a whole BREP file: its header, its table of shapes or the shape it names at the end is missing.", "brepData");
        }
        const shape = this.brepShapeOf(text);
        if (shape.IsNull()) {
            shape.delete();
            throw new InputError("`brepData` holds no shape a BREP reader can build.", "brepData");
        }
        return shape;
    }

    /**
     * Reads a binary BREP file, the bytes `io.saveShapeBrepBinary` writes, back into the shape it
     * holds, with its faces and edges in the same order.
     *
     * The bytes are checked first: damaged ones, or ones not in version 4, are refused, saying where.
     * @param inputs - The binary BREP file
     * @returns The shape the file holds
     * @group io
     * @shortname load brep binary
     * @drawable true
     * @example
     * ```typescript
     * const bytes = await bitbybit.occt.io.saveShapeBrepBinaryAndReturn({ shape: box, fileName: "box.bbrep", tryDownload: false, withTriangulation: true });
     * const copy = await bitbybit.occt.io.loadBrepBinary({ brepData: bytes });
     * ```
     */
    loadBrepBinary(inputs: Inputs.OCCT.LoadBrepBinaryDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.LoadBrepBinaryDto, inputs);
        const bytes = bytesOfFile(resolved.brepData, "brepData");
        return withKernelRefusals(this.occ, () => this.occ.ReadBREPFromBytes(bytes), message => {
            const refusal = /ReadBREPFromBytes: (?:the binary BREP data is damaged: )?(.+)$/.exec(message);
            return refusal === null ? undefined : new InputError(`\`brepData\` is damaged: ${refusal[1]}.`, "brepData");
        });
    }

    private brepShapeOf(text: string): TopoDS_Shape {
        return withKernelRefusals(this.occ, () => this.occ.ReadBREPFromString(text), message => {
            const damage = /the BREP text is damaged: (.+)$/.exec(message);
            return damage === null ? undefined : new InputError(`\`brepData\` is damaged: ${damage[1]}.`, "brepData");
        });
    }

    /**
     * Turns the wires of a shape into drawing paths, the first step of a 2D DXF export.
     *
     * The shape is seen along Y: X stays X and Z becomes the drawing's Y (-Z under right-handed
     * conventions). Curves stay exact unless `exactCurves` is off. Give the paths a layer with
     * `dxfPathsWithLayer` and write them with `dxfCreate`.
     * @param inputs - The shape and the deflection settings
     * @returns The DXF paths
     * @group dxf
     * @shortname shape to dxf paths
     * @drawable false
     * @example
     * ```typescript
     * const paths = await bitbybit.occt.io.shapeToDxfPaths({
     *     shape: flatOutline,
     *     angularDeflection: 0.1,
     *     curvatureDeflection: 0.1,
     *     minimumOfPoints: 2,
     *     uTolerance: 1e-9,
     *     minimumLength: 1e-7,
     *     exactCurves: true,
     * });
     * ```
     */
    shapeToDxfPaths(inputs: Inputs.OCCT.ShapeToDxfPathsDto<TopoDS_Shape>): IO.DrawingPathDto[] {
        const resolved = resolveDto(Inputs.OCCT.ShapeToDxfPathsDto, inputs) as Resolved.OCCT.ShapeToDxfPathsDto<TopoDS_Shape>;
        return groundPathsOf(this.och, resolved.shape, resolved);
    }

    /**
     * Puts drawing paths on a named layer with a color and a line type, making one part of a drawing.
     *
     * A drawing may hold several parts, each with its own layer, color and line type; `dxfCreate`
     * writes them into one file.
     * @param inputs - The paths, the layer name, the color and the line type
     * @returns The paths as one layered part
     * @group dxf
     * @shortname dxf paths with layer
     * @drawable false
     * @example
     * ```typescript
     * const part = await bitbybit.occt.io.dxfPathsWithLayer({ paths, layer: "cut", color: "#ff0000" });
     * ```
     */
    dxfPathsWithLayer(inputs: Inputs.OCCT.DxfPathsWithLayerDto): IO.DrawingPartDto {
        const resolved = resolveDto(Inputs.OCCT.DxfPathsWithLayerDto, inputs) as Resolved.OCCT.DxfPathsWithLayerDto;
        return { layer: resolved.layer, color: resolved.color, paths: resolved.paths, lineType: resolved.lineType };
    }

    /**
     * Writes drawing parts into one DXF file and returns its text.
     *
     * `acadVersion` AC1015 (AutoCAD 2000) keeps every curve exact and can state the drawing's `unit`;
     * AC1009 (R12) suits old software and writes splines and ellipses as polylines within
     * `curveTolerance`. `fileName` and `tryDownload` matter only where a browser download can start.
     * @param inputs - The layered parts, the color format, the DXF version, the unit, the curve tolerance and the download options
     * @returns The DXF file as text
     * @group dxf
     * @shortname dxf create
     * @drawable false
     * @example
     * ```typescript
     * const dxf = await bitbybit.occt.io.dxfCreate({
     *     pathsParts: [part],
     *     colorFormat: Bit.Inputs.OCCT.dxfColorFormatEnum.aci,
     *     acadVersion: Bit.Inputs.OCCT.dxfAcadVersionEnum.AC1015,
     *     unit: Bit.Inputs.Base.unitOfLengthEnum.millimetre,
     *     fileName: "drawing.dxf",
     *     tryDownload: false,
     * });
     * ```
     */
    dxfCreate(inputs: Inputs.OCCT.DxfPathsPartsListDto): string {
        const resolved = resolveDto(Inputs.OCCT.DxfPathsPartsListDto, inputs) as Resolved.OCCT.DxfPathsPartsListDto;
        return this.och.base.io.dxf.dxfCreate({
            dxfPathsParts: resolved.pathsParts,
            colorFormat: resolved.colorFormat,
            acadVersion: resolved.acadVersion,
            unit: resolved.unit,
            curveTolerance: resolved.curveTolerance,
        });
    }

    /**
     * Reads a DXF file into one compound of exact wires, fit-point splines interpolated and block
     * inserts expanded.
     *
     * It lies on the ground, Y along Z (-Z under right-handed conventions) and elevations along Y.
     * Ends within `joinTolerance` join; `makeFaces` makes faces with holes. A very large file is
     * read up to its limits; `loadDxfStructured` lists what was left out.
     * @param inputs - The DXF file and the reading options
     * @returns One compound holding every layer's wires, and faces when asked
     * @group dxf
     * @shortname load dxf
     * @drawable true
     * @example
     * ```typescript
     * const drawing = await bitbybit.occt.io.loadDxf({ dxf: dxfText, makeFaces: true, joinTolerance: 0.001, includeHiddenLayers: false, unit: Bit.Inputs.Base.unitOfLengthEnum.millimetre });
     * const plate = await bitbybit.occt.operations.extrude({ shape: drawing, direction: [0, 3, 0] });
     * ```
     */
    loadDxf(inputs: Inputs.OCCT.LoadDxfDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.LoadDxfDto, inputs) as Resolved.OCCT.LoadDxfDto;
        const shapes = this.dxfLoader.load(resolved).parts.map(part => part.shape);
        try {
            return this.och.converterService.makeCompound({ shapes });
        } finally {
            shapes.forEach(shape => shape.delete());
        }
    }

    /**
     * Reads a DXF file as `loadDxf` does, into one shape per layer, color and line type, each with
     * its layer name, color and line type, plus the file's unit, its version and what was left out.
     *
     * Use it to treat the layers apart, such as outlines to cut on one layer and lines to engrave on
     * another.
     * @param inputs - The DXF file and the reading options
     * @returns The shapes with their layers, colors and line types, the unit, the version and the warnings
     * @group dxf
     * @shortname load dxf structured
     * @drawable false
     * @example
     * ```typescript
     * const result = await bitbybit.occt.io.loadDxfStructured({ dxf: dxfText, makeFaces: true });
     * const cuts = result.parts.filter(part => part.layer === "cut").map(part => part.shape);
     * ```
     */
    loadDxfStructured(inputs: Inputs.OCCT.LoadDxfDto): Inputs.OCCT.DxfShapesResult<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.LoadDxfDto, inputs) as Resolved.OCCT.LoadDxfDto;
        return this.dxfLoader.load(resolved);
    }

    /**
     * Converts a STEP file into a binary glTF (GLB), keeping the assembly tree as glTF nodes along
     * with part names, colors, materials and placements.
     *
     * `stepData` is the file as text, ArrayBuffer or Uint8Array. The mesh settings say how finely
     * curved surfaces are triangulated: `meshPrecision` is the deflection, `meshAngle` the angular
     * deflection. Z-up becomes glTF's Y-up. Failure throws.
     * @param inputs - The STEP file content and the meshing settings
     * @returns The GLB file as bytes
     * @group assembly
     * @shortname step to gltf
     * @drawable false
     * @example
     * ```typescript
     * const glb = await bitbybit.occt.io.convertStepToGltf({ stepData: stepText, meshPrecision: 0.005, meshAngle: 0.5, meshRelative: true, internalVerticesMode: true, controlSurfaceDeflection: false });
     * ```
     */
    convertStepToGltf(inputs: Inputs.OCCT.ConvertStepToGltfDto): Uint8Array {
        const resolved = resolveDto(Inputs.OCCT.ConvertStepToGltfDto, inputs) as Resolved.OCCT.ConvertStepToGltfDto;
        try {
            const stepData = resolved.stepData;
            let result: Uint8Array;

            const meshPrecision = resolved.meshPrecision;
            const meshAngle = resolved.meshAngle;
            const meshRelative = resolved.meshRelative;
            const internalVerticesMode = resolved.internalVerticesMode;
            const controlSurfaceDeflection = resolved.controlSurfaceDeflection;

            if (stepData instanceof Uint8Array) {
                result = withKernelErrorsRead(this.occ, () => this.occ.ConvertStepToGltfFromBinary(
                    stepData,
                    meshPrecision,
                    meshAngle,
                    meshRelative,
                    internalVerticesMode,
                    controlSurfaceDeflection,
                    -1
                ));
            } else if (stepData instanceof ArrayBuffer) {
                result = withKernelErrorsRead(this.occ, () => this.occ.ConvertStepToGltfFromBinary(
                    new Uint8Array(stepData),
                    meshPrecision,
                    meshAngle,
                    meshRelative,
                    internalVerticesMode,
                    controlSurfaceDeflection,
                    -1
                ));
            } else if (typeof stepData === "string") {
                result = withKernelErrorsRead(this.occ, () => this.occ.ConvertStepToGltfFromMemory(
                    stepData,
                    meshPrecision,
                    meshAngle,
                    meshRelative,
                    internalVerticesMode,
                    controlSurfaceDeflection,
                    -1
                ));
            } else {
                throw new Error("File/Blob must be converted to ArrayBuffer before calling this method. Use the worker layer for automatic conversion.");
            }

            if (result.length === 0) {
                throw new Error("Failed to convert STEP to glTF");
            }

            return result;
        } catch (error) {
            const errorMessage = messageOf(error);
            throw trapOr(error, () => new Error(`STEP to glTF conversion failed: ${errorMessage}`, { cause: error }));
        }
    }

    /**
     * Converts a STEP file into a binary glTF (GLB) like `convertStepToGltf`, with every option
     * exposed.
     *
     * The read flags choose what to take from the file (colors, names, materials, layers,
     * properties), the mesh settings how finely to triangulate, the export settings how the glTF is
     * written (merged faces, 16-bit indexes, naming, scale). Switch off what you do not need.
     * @param inputs - The STEP file content and the reading, meshing and export settings
     * @returns The GLB file as bytes
     * @group assembly
     * @shortname step to gltf advanced
     * @drawable false
     * @example
     * ```typescript
     * const options = new Bit.Inputs.OCCT.ConvertStepToGltfAdvancedDto();
     * options.stepData = stepText;
     * options.readColors = true;
     * options.readNames = true;
     * options.meshDeflection = 0.005;
     * options.mergeFaces = true;
     * options.upAxis = Bit.Inputs.Base.upAxisConversionEnum.zUpToYUp;
     * const glb = await bitbybit.occt.io.convertStepToGltfAdvanced(options);
     * ```
     */
    convertStepToGltfAdvanced(inputs: Inputs.OCCT.ConvertStepToGltfAdvancedDto): Uint8Array {
        const resolved = resolveDto(Inputs.OCCT.ConvertStepToGltfAdvancedDto, inputs) as Resolved.OCCT.ConvertStepToGltfAdvancedDto;
        const zUp = turnedFromZUp(resolved.upAxis);
        try {
            const stepData = resolved.stepData;
            let result: Uint8Array;
            
            const nodeNameFormatNum = this.gltfNameFormatEnumToOcct(resolved.nodeNameFormat);
            const meshNameFormatNum = this.gltfNameFormatEnumToOcct(resolved.meshNameFormat);
            const transformFormatNum = this.gltfTransformFormatEnumToOcct(resolved.transformFormat);
            
            if (stepData instanceof Uint8Array) {
                result = withKernelErrorsRead(this.occ, () => this.occ.ConvertStepToGltfFromBinaryAdvanced(
                    stepData,
                    resolved.readColors,
                    resolved.readNames,
                    resolved.readMaterials,
                    resolved.readLayers,
                    resolved.readProps,
                    resolved.meshDeflection,
                    resolved.meshAngle,
                    resolved.meshParallel,
                    resolved.meshRelative,
                    resolved.internalVerticesMode,
                    resolved.controlSurfaceDeflection,
                    resolved.faceCountThreshold,
                    resolved.mergeFaces,
                    resolved.splitIndices16,
                    resolved.parallelWrite,
                    resolved.embedTextures,
                    resolved.forceUVExport,
                    nodeNameFormatNum,
                    meshNameFormatNum,
                    transformFormatNum,
                    zUp,
                    resolved.scale
                ));
            } else if (stepData instanceof ArrayBuffer) {
                result = withKernelErrorsRead(this.occ, () => this.occ.ConvertStepToGltfFromBinaryAdvanced(
                    new Uint8Array(stepData),
                    resolved.readColors,
                    resolved.readNames,
                    resolved.readMaterials,
                    resolved.readLayers,
                    resolved.readProps,
                    resolved.meshDeflection,
                    resolved.meshAngle,
                    resolved.meshParallel,
                    resolved.meshRelative,
                    resolved.internalVerticesMode,
                    resolved.controlSurfaceDeflection,
                    resolved.faceCountThreshold,
                    resolved.mergeFaces,
                    resolved.splitIndices16,
                    resolved.parallelWrite,
                    resolved.embedTextures,
                    resolved.forceUVExport,
                    nodeNameFormatNum,
                    meshNameFormatNum,
                    transformFormatNum,
                    zUp,
                    resolved.scale
                ));
            } else if (typeof stepData === "string") {
                const encoder = new TextEncoder();
                const binaryData = encoder.encode(stepData);
                result = withKernelErrorsRead(this.occ, () => this.occ.ConvertStepToGltfFromBinaryAdvanced(
                    binaryData,
                    resolved.readColors,
                    resolved.readNames,
                    resolved.readMaterials,
                    resolved.readLayers,
                    resolved.readProps,
                    resolved.meshDeflection,
                    resolved.meshAngle,
                    resolved.meshParallel,
                    resolved.meshRelative,
                    resolved.internalVerticesMode,
                    resolved.controlSurfaceDeflection,
                    resolved.faceCountThreshold,
                    resolved.mergeFaces,
                    resolved.splitIndices16,
                    resolved.parallelWrite,
                    resolved.embedTextures,
                    resolved.forceUVExport,
                    nodeNameFormatNum,
                    meshNameFormatNum,
                    transformFormatNum,
                    zUp,
                    resolved.scale
                ));
            } else {
                throw new Error("File/Blob must be converted to ArrayBuffer before calling this method. Use the worker layer for automatic conversion.");
            }

            if (result.length === 0) {
                throw new Error("Failed to convert STEP to glTF");
            }

            return result;
        } catch (error) {
            const errorMessage = messageOf(error);
            throw trapOr(error, () => new Error(`STEP to glTF advanced conversion failed: ${errorMessage}`, { cause: error }));
        }
    }

    /**
     * Converts a STEP file into a binary glTF (GLB) like `convertStepToGltf` and compresses the
     * geometry with Draco, which makes the file much smaller at the cost of a Draco-capable loader.
     *
     * The Draco settings set the compression level and how many bits positions, normals, texture
     * coordinates and colors keep; fewer bits mean a smaller file and less precision.
     * @param inputs - The STEP file content, the meshing settings and the Draco settings
     * @returns The GLB file as bytes
     * @group assembly
     * @shortname step to gltf with draco
     * @drawable false
     * @example
     * ```typescript
     * const options = new Bit.Inputs.OCCT.ConvertStepToGltfWithDracoDto();
     * options.stepData = stepText;
     * options.meshPrecision = 0.005;
     * options.dracoCompressionLevel = 7;
     * options.dracoQuantizePositionBits = 14;
     * const glb = await bitbybit.occt.io.convertStepToGltfWithDraco(options);
     * ```
     */
    convertStepToGltfWithDraco(inputs: Inputs.OCCT.ConvertStepToGltfWithDracoDto): Uint8Array {
        const resolved = resolveDto(Inputs.OCCT.ConvertStepToGltfWithDracoDto, inputs) as Resolved.OCCT.ConvertStepToGltfWithDracoDto;
        try {
            const stepData = resolved.stepData;
            let binaryData: Uint8Array;

            if (stepData instanceof Uint8Array) {
                binaryData = stepData;
            } else if (stepData instanceof ArrayBuffer) {
                binaryData = new Uint8Array(stepData);
            } else if (typeof stepData === "string") {
                binaryData = new TextEncoder().encode(stepData);
            } else {
                throw new Error("File/Blob must be converted to ArrayBuffer before calling this method. Use the worker layer for automatic conversion.");
            }

            const result = withKernelErrorsRead(this.occ, () => this.occ.ConvertStepToGltfFromBinaryWithDraco(
                binaryData,
                resolved.meshPrecision,
                resolved.meshAngle,
                resolved.meshRelative,
                resolved.internalVerticesMode,
                resolved.controlSurfaceDeflection,
                -1,
                resolved.useDraco,
                resolved.dracoCompressionLevel,
                resolved.dracoQuantizePositionBits,
                resolved.dracoQuantizeNormalBits,
                resolved.dracoQuantizeTexcoordBits,
                resolved.dracoQuantizeColorBits,
                resolved.dracoQuantizeGenericBits,
                resolved.dracoUnifiedQuantization
            ));

            if (result.length === 0) {
                throw new Error("Failed to convert STEP to glTF");
            }

            return result;
        } catch (error) {
            const errorMessage = messageOf(error);
            throw trapOr(error, () => new Error(`STEP to glTF (Draco) conversion failed: ${errorMessage}`, { cause: error }));
        }
    }

    /**
     * Converts a STEP file into a binary glTF (GLB) with every reading, meshing and writing option
     * exposed, as `convertStepToGltfAdvanced` does, and compresses the geometry with Draco.
     *
     * The Draco settings set the compression level and how many bits positions, normals, texture
     * coordinates and colors keep; fewer bits mean a smaller file and less precision.
     * @param inputs - The STEP file content, the reading, meshing and export settings, and the Draco settings
     * @returns The GLB file as bytes
     * @group assembly
     * @shortname step to gltf advanced with draco
     * @drawable false
     * @example
     * ```typescript
     * const options = new Bit.Inputs.OCCT.ConvertStepToGltfAdvancedWithDracoDto();
     * options.stepData = stepText;
     * options.readColors = true;
     * options.meshDeflection = 0.005;
     * options.dracoCompressionLevel = 7;
     * const glb = await bitbybit.occt.io.convertStepToGltfAdvancedWithDraco(options);
     * ```
     */
    convertStepToGltfAdvancedWithDraco(inputs: Inputs.OCCT.ConvertStepToGltfAdvancedWithDracoDto): Uint8Array {
        const resolved = resolveDto(Inputs.OCCT.ConvertStepToGltfAdvancedWithDracoDto, inputs) as Resolved.OCCT.ConvertStepToGltfAdvancedWithDracoDto;
        const zUp = turnedFromZUp(resolved.upAxis);
        try {
            const stepData = resolved.stepData;
            let binaryData: Uint8Array;

            if (stepData instanceof Uint8Array) {
                binaryData = stepData;
            } else if (stepData instanceof ArrayBuffer) {
                binaryData = new Uint8Array(stepData);
            } else if (typeof stepData === "string") {
                binaryData = new TextEncoder().encode(stepData);
            } else {
                throw new Error("File/Blob must be converted to ArrayBuffer before calling this method. Use the worker layer for automatic conversion.");
            }

            const nodeNameFormatNum = this.gltfNameFormatEnumToOcct(resolved.nodeNameFormat);
            const meshNameFormatNum = this.gltfNameFormatEnumToOcct(resolved.meshNameFormat);
            const transformFormatNum = this.gltfTransformFormatEnumToOcct(resolved.transformFormat);

            const result = withKernelErrorsRead(this.occ, () => this.occ.ConvertStepToGltfFromBinaryAdvancedWithDraco(
                binaryData,
                resolved.readColors,
                resolved.readNames,
                resolved.readMaterials,
                resolved.readLayers,
                resolved.readProps,
                resolved.meshDeflection,
                resolved.meshAngle,
                resolved.meshParallel,
                resolved.meshRelative,
                resolved.internalVerticesMode,
                resolved.controlSurfaceDeflection,
                resolved.faceCountThreshold,
                resolved.mergeFaces,
                resolved.splitIndices16,
                resolved.parallelWrite,
                resolved.embedTextures,
                resolved.forceUVExport,
                nodeNameFormatNum,
                meshNameFormatNum,
                transformFormatNum,
                zUp,
                resolved.scale,
                resolved.useDraco,
                resolved.dracoCompressionLevel,
                resolved.dracoQuantizePositionBits,
                resolved.dracoQuantizeNormalBits,
                resolved.dracoQuantizeTexcoordBits,
                resolved.dracoQuantizeColorBits,
                resolved.dracoQuantizeGenericBits,
                resolved.dracoUnifiedQuantization
            ));

            if (result.length === 0) {
                throw new Error("Failed to convert STEP to glTF");
            }

            return result;
        } catch (error) {
            const errorMessage = messageOf(error);
            throw trapOr(error, () => new Error(`STEP to glTF advanced (Draco) conversion failed: ${errorMessage}`, { cause: error }));
        }
    }

    /**
     * Reads the assembly structure of a STEP file without building geometry: every part and
     * sub-assembly as a node with its id, name, whether it is an assembly, its visibility, its
     * color and its placement matrix.
     *
     * The nodes come in depth-first order, so children follow their parent. A file that cannot be
     * parsed reports its error in the result.
     * @param inputs - The STEP file content
     * @returns The list of nodes, the format version and any error
     * @group assembly
     * @shortname parse step to json
     * @drawable false
     * @example
     * ```typescript
     * const tree = await bitbybit.occt.io.parseStepToJson({ stepData: stepText });
     * console.log(tree.nodes.map(n => n.name));
     * ```
     */
    parseStepToJson(inputs: Inputs.OCCT.ParseStepAssemblyToJsonDto): Models.OCCT.AssemblyJsonResult {
        try {
            const stepData = inputs.stepData;
            let jsonString: string;
            
            if (stepData instanceof Uint8Array) {
                jsonString = this.occ.ParseStepAssemblyToJsonFromBinary(stepData);
            } else if (stepData instanceof ArrayBuffer) {
                jsonString = this.occ.ParseStepAssemblyToJsonFromBinary(new Uint8Array(stepData));
            } else if (typeof stepData === "string") {
                jsonString = this.occ.ParseStepAssemblyToJsonFromMemory(stepData);
            } else {
                throw new Error("File/Blob must be converted to ArrayBuffer before calling this method. Use the worker layer for automatic conversion.");
            }

            const result = JSON.parse(jsonString) as Models.OCCT.AssemblyJsonResult;

            return result;
        } catch (error) {
            const errorMessage = messageOf(readKernelException(this.occ, error));
            return {
                version: "1.0",
                nodes: [],
                error: `STEP assembly parsing failed: ${errorMessage}`
            };
        }
    }

    private gltfNameFormatEnumToOcct(format: Inputs.OCCT.gltfNameFormatEnum): number {
        switch (format) {
            case Inputs.OCCT.gltfNameFormatEnum.empty: return 0;
            case Inputs.OCCT.gltfNameFormatEnum.product: return 1;
            case Inputs.OCCT.gltfNameFormatEnum.instance: return 2;
            case Inputs.OCCT.gltfNameFormatEnum.instanceOrProduct: return 3;
            case Inputs.OCCT.gltfNameFormatEnum.productOrInstance: return 4;
            case Inputs.OCCT.gltfNameFormatEnum.productAndInstance: return 5;
            case Inputs.OCCT.gltfNameFormatEnum.productAndInstanceAndOcaf: return 6;
            default: return 2;
        }
    }

    private gltfTransformFormatEnumToOcct(format: Inputs.OCCT.gltfTransformFormatEnum): number {
        switch (format) {
            case Inputs.OCCT.gltfTransformFormatEnum.compact: return 0;
            case Inputs.OCCT.gltfTransformFormatEnum.mat4: return 1;
            case Inputs.OCCT.gltfTransformFormatEnum.trs: return 2;
            default: return 0;
        }
    }

    private unmeshedCopy(shape: TopoDS_Shape, zUp: boolean): TopoDS_Shape {
        if (followsCoordinateSystem(this.och)) {
            const inFile = shapeInFileAxes(this.och, shape, zUp, false);
            try {
                return this.occ.BRepBuilderAPI_Copy_Shape(inFile ?? shape, false);
            } finally {
                inFile?.delete();
            }
        }
        const copy = this.occ.BRepBuilderAPI_Copy_Shape(shape, false);
        if (!zUp) {
            return copy;
        }
        const swap = new this.occ.gp_Trsf();
        swap.SetValues(1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0);
        const location = new this.occ.TopLoc_Location(swap);
        const placed = copy.Moved(location);
        location.delete();
        swap.delete();
        copy.delete();
        return placed;
    }

    private writtenAsDocument<R>(shape: TopoDS_Shape, zUp: boolean, name: string, write: (document: Handle_TDocStd_Document) => R): R {
        const copy = this.unmeshedCopy(shape, zUp);
        try {
            const structure = JSON.stringify({ parts: [{ id: "shape", shapeIndex: 0, name }], nodes: [] });
            const document = this.occ.BuildAssemblyDocument(structure, [copy], undefined, []);
            try {
                if (document.IsNull()) {
                    throw new Error("The shape could not be put into a document for the export.");
                }
                return write(document);
            } finally {
                document.delete();
            }
        } finally {
            copy.delete();
        }
    }

    private removeFile(path: string): void {
        try {
            this.occ.FS.unlink(path);
        } catch {
            return;
        }
    }
}
