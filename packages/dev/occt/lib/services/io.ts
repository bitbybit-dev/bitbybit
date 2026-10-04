import { IGESControl_Reader, BitbybitOcctModule, Handle_TDocStd_Document, STEPControl_Reader, TopoDS_Compound, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import * as Inputs from "../api/inputs";
import * as Models from "../api/models";
import { IO } from "@bitbybit-dev/base/lib/api/inputs";
import { InputError, resolveDto } from "@bitbybit-dev/base";
import * as Resolved from "../api/resolved-inputs";
import { checkedFrame, checkedNumber, checkedShape } from "./base/input-checks";
import { readKernelException } from "../kernel-exception";
import { numbersOfFrames } from "./base/frames";
import { SMALLEST_MESH_DEFLECTION, bytesOfFile, objNameOf, textOfFile } from "./base/file-data";
import { DrawingLine, svgOfDrawing } from "./base/svg-drawing";
import { stlWithYAndZSwapped } from "./base/stl-data";

/** What a whole BREP text opens with, after an optional line a drawing tool writes before it. */
const BREP_HEADER = /^\s*(DBRep_DrawableShape\s+)?CASCADE Topology V\d/;

/** What a whole BREP text ends with: its table of shapes, then the reference to the shape it holds. */
const BREP_ENDING = /\r?\nTShapes \d+\r?\n[\s\S]*\r?\n[+\-ie]\d+ \d+\s*$/;

/**
 * Reading and writing OpenCascade shapes in exchange formats: STEP, IGES, STL and BREP in; STEP, STL,
 * BREP, OBJ, PLY, SVG and DXF out; STEP to glTF conversion with the assembly tree, colors and names
 * preserved, and a STEP assembly structure as JSON. Files travel as text or binary data, never as
 * paths. OpenCascade treats Z as up while this library treats Y as up, so the `adjustYtoZ` and
 * `adjustZtoY` flags swap the axes on the way out and in.
 */
export class OCCTIO {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
    }

    /**
     * Writes a shape as STEP, the standard exchange format for exact CAD geometry, and returns the
     * file's text.
     *
     * With `adjustYtoZ` true the shape is turned so this library's Y-up becomes STEP's Z-up;
     * `fromRightHanded` skips the mirror that swap otherwise includes. `fileName` and `tryDownload`
     * matter only where a browser download can be started.
     * @param inputs - The shape, the file name, the axis adjustment and the download options
     * @returns The STEP file as text
     * @group io
     * @shortname save step and return
     * @drawable false
     * @example
     * ```typescript
     * const step = await bitbybit.occt.io.saveShapeSTEPAndReturn({ shape: box, fileName: "box.step", adjustYtoZ: true, tryDownload: false });
     * ```
     */
    saveShapeSTEP(inputs: Inputs.OCCT.SaveStepDto<TopoDS_Shape>): string {
        const resolved = resolveDto(Inputs.OCCT.SaveStepDto, inputs) as Resolved.OCCT.SaveStepDto<TopoDS_Shape>;
        const shapeToUse = resolved.shape;
        let adjustedShape;
        if (resolved.adjustYtoZ) {
            const rotatedShape = this.och.transformsService.rotate({ shape: resolved.shape, axis: [1, 0, 0], angle: -90 });
            if (resolved.fromRightHanded) {
                adjustedShape = rotatedShape;
            } else {
                adjustedShape = this.och.transformsService.mirrorAlongNormal(
                    { shape: rotatedShape, origin: [0, 0, 0], normal: [0, 0, 1] }
                );
                rotatedShape.delete();
            }
        }
        const fileName = "x";
        const writer = new this.occ.STEPControl_Writer();
        let transferShape;
        if (adjustedShape) {
            transferShape = adjustedShape;
        } else {
            transferShape = shapeToUse;
        }

        let transferResult;
        try {
            transferResult = writer.Transfer(
                transferShape,
                this.occ.STEPControl_StepModelType.AsIs
            );
        } catch (ex) {
            throw new Error("Failed when calling writer.Transfer.", { cause: ex });
        }
        let result: string;
        if (transferResult === this.occ.IFSelect_ReturnStatus.RetDone) {
            const writeResult = writer.Write(fileName);
            if (writeResult === this.occ.IFSelect_ReturnStatus.RetDone) {
                const stepFileText = this.occ.FS.readFile("/" + fileName, { encoding: "utf8" }) as string;
                this.occ.FS.unlink("/" + fileName);

                result = stepFileText;
            } else {
                throw (new Error("Failed when writing step file."));
            }
        } else {
            throw (new Error("Failed when transfering to step writer."));
        }
        if (adjustedShape) {
            adjustedShape.delete();
        }

        return result;
    }

    /**
     * Triangulates a shape and writes it as STL, the mesh format 3D printers and slicers read,
     * returning the file's text, or its bytes when `binary` is true.
     *
     * `precision` is the meshing tolerance in model units; smaller values follow curved surfaces
     * more closely. `adjustYtoZ` turns Y-up into Z-up. `fileName` and `tryDownload` only matter
     * where a download can start.
     * @param inputs - The shape, the file name, the meshing precision, the axis adjustment, the form and the download options
     * @returns The STL file as text, or as bytes when `binary` is true
     * @group io
     * @shortname save stl return
     * @drawable false
     * @example
     * ```typescript
     * const stl = await bitbybit.occt.io.saveShapeStlAndReturn({ shape: box, fileName: "box.stl", precision: 0.01, adjustYtoZ: true, tryDownload: false });
     * const bytes = await bitbybit.occt.io.saveShapeStlAndReturn({ shape: box, fileName: "box.stl", precision: 0.01, adjustYtoZ: true, tryDownload: false, binary: true });
     * ```
     */
    saveShapeStl(inputs: Inputs.OCCT.SaveStlDto<TopoDS_Shape>): string | Uint8Array {
        const resolved = resolveDto(Inputs.OCCT.SaveStlDto, inputs) as Resolved.OCCT.SaveStlDto<TopoDS_Shape>;
        const transferShape = this.occ.BRepBuilderAPI_Copy_Shape(resolved.shape, false);
        const fileName = "x";
        const writer = new this.occ.StlAPI_Writer();
        const incrementalMeshBuilder = new this.occ.BRepMesh_IncrementalMesh(transferShape, resolved.precision, false, 0.5, this.occ.RunsInParallel());
        try {
            writer.SetASCIIMode(!resolved.binary);
            if (!writer.Write(transferShape, fileName)) {
                throw (new Error("Failed when writing stl file."));
            }
            const bytes = this.occ.FS.readFile("/" + fileName) as Uint8Array;
            const turned = resolved.adjustYtoZ ? stlWithYAndZSwapped(bytes) : bytes;
            return resolved.binary ? turned : new TextDecoder().decode(turned);
        } finally {
            this.removeFile("/" + fileName);
            writer.delete();
            incrementalMeshBuilder.delete();
            transferShape.delete();
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
     * `precision` is the meshing tolerance in model units, `adjustYtoZ` turns Y-up into Z-up, and
     * coordinates keep six decimals. `mtl` stays empty, since a shape carries no colors;
     * `assembly.manager.exportDocumentToObj` writes colored parts.
     * @param inputs - The shape, the file name, the meshing precision, the axis adjustment and the download option
     * @returns The OBJ text, with an empty material library text
     * @group io
     * @shortname save obj and return
     * @drawable false
     * @example
     * ```typescript
     * const files = await bitbybit.occt.io.saveShapeObjAndReturn({ shape: box, fileName: "box.obj", precision: 0.01, adjustYtoZ: false, tryDownload: false });
     * console.log(files.obj);
     * ```
     */
    saveShapeObj(inputs: Inputs.OCCT.SaveObjDto<TopoDS_Shape>): Models.OCCT.ObjFiles {
        const resolved = resolveDto(Inputs.OCCT.SaveObjDto, inputs) as Resolved.OCCT.SaveObjDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const precision = checkedNumber(resolved.precision, "precision", SMALLEST_MESH_DEFLECTION);
        const name = objNameOf(resolved.fileName, "fileName");
        return this.writtenAsDocument(shape, resolved.adjustYtoZ, name, document => {
            const files = this.occ.ExportDocumentToObj(document, precision, name);
            return { obj: files.obj, mtl: files.mtl };
        });
    }

    /**
     * Triangulates a shape and writes it as ASCII PLY with a normal per vertex, a mesh format
     * scanning tools read, returning the file's text.
     *
     * Coordinates keep six significant digits, so past 1000 units they keep two decimals.
     * `precision` is the meshing tolerance in model units and `adjustYtoZ` turns Y-up into Z-up.
     * @param inputs - The shape, the file name, the meshing precision, the axis adjustment and the download option
     * @returns The PLY file as text
     * @group io
     * @shortname save ply and return
     * @drawable false
     * @example
     * ```typescript
     * const ply = await bitbybit.occt.io.saveShapePlyAndReturn({ shape: box, fileName: "box.ply", precision: 0.01, adjustYtoZ: false, tryDownload: false });
     * ```
     */
    saveShapePly(inputs: Inputs.OCCT.SavePlyDto<TopoDS_Shape>): string {
        const resolved = resolveDto(Inputs.OCCT.SavePlyDto, inputs) as Resolved.OCCT.SavePlyDto<TopoDS_Shape>;
        const shape = checkedShape(resolved.shape);
        const precision = checkedNumber(resolved.precision, "precision", SMALLEST_MESH_DEFLECTION);
        return this.writtenAsDocument(shape, resolved.adjustYtoZ, "shape", document => this.occ.ExportDocumentToPly(document, precision));
    }

    /**
     * Draws the edges a view of a shape sees as an SVG drawing, with the hidden edges dashed when
     * asked, and returns the file's text.
     *
     * It shows the view from the frame's normal side in model units, x running right along the
     * frame's direction and y up, so the file holds each point as x and minus y.
     * @param inputs - The shape, the view, whether to draw hidden edges, the precision and the download options
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
        const shape = checkedShape(resolved.shape);
        const frame = checkedFrame(resolved.frame, "frame");
        const precision = checkedNumber(resolved.precision, "precision", 0);
        if (precision === 0) {
            throw new InputError("`precision` must be above 0; it is 0.", "precision");
        }
        const lines = this.occ.HiddenLines(shape, numbersOfFrames([frame]), true, false, resolved.drawHidden, 0, precision);
        try {
            return svgOfDrawing(this.drawingLinesOf(lines.visible, precision), this.drawingLinesOf(lines.hidden, precision));
        } finally {
            lines.visible.delete();
            lines.hidden.delete();
        }
    }

    /**
     * Reads a STEP or IGES file into one shape.
     *
     * The extension of `fileName` decides the kind: `.step`, `.stp`, `.stpz` are STEP, `.iges`,
     * `.igs`, `.igz` are IGES. `filetext` is the file's text, or an ArrayBuffer for compressed and
     * binary forms; `adjustZtoY` turns the file's Z-up into Y-up. An unreadable file gives
     * undefined.
     * @param inputs - The file content, its name with extension and the axis adjustment
     * @returns The shape, or undefined when the file could not be read
     */
    loadSTEPorIGES(inputs: Inputs.OCCT.LoadStepOrIgesDto): TopoDS_Shape | undefined {
        const resolved = resolveDto(Inputs.OCCT.LoadStepOrIgesDto, inputs) as Resolved.OCCT.LoadStepOrIgesDto;
        const fileName = resolved.fileName;
        const fileText = resolved.filetext;
        const extension = fileName.toLowerCase().split(".").pop();
        
        const fileType = (() => {
            switch (extension) {
                case "step":
                case "stp":
                case "stpz":
                    return "step";
                case "iges":
                case "igs":
                case "igz":
                    return "iges";
                default:
                    return undefined;
            }
        })();
        
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
                console.error("Failed to read " + fileType.toUpperCase() + " file: " + fileName);
                return undefined;
            }
        } else {
            this.occ.FS.createDataFile("/", `file.${fileType}`, fileText, true, true, true);
            
            let reader: STEPControl_Reader | IGESControl_Reader;
            if (fileType === "step") {
                reader = new this.occ.STEPControl_Reader();
            } else {
                reader = new this.occ.IGESControl_Reader();
            }
            
            const readResult = reader.ReadFile(`file.${fileType}`);
            if (readResult === this.occ.IFSelect_ReturnStatus.RetDone) {
                reader.TransferRoots();
                stepShape = reader.OneShape();
                this.occ.FS.unlink(`/file.${fileType}`);
                if (!stepShape || stepShape.IsNull()) {
                    console.error("Failed to read " + fileType.toUpperCase() + " file: " + fileName);
                    return undefined;
                }
            } else {
                console.error("Something in OCCT went wrong trying to read " + fileName);
                this.occ.FS.unlink(`/file.${fileType}`);
                return undefined;
            }
        }
        
        let adjustedShape;
        if (resolved.adjustZtoY && stepShape) {
            const mirroredShape = this.och.transformsService.mirrorAlongNormal(
                { shape: stepShape, origin: [0, 0, 0], normal: [0, 0, 1] }
            );
            adjustedShape = this.och.transformsService.rotate({ shape: mirroredShape, axis: [1, 0, 0], angle: 90 });
            mirroredShape.delete();
        }
        
        if (adjustedShape) {
            stepShape?.delete();
            return adjustedShape;
        }

        return stepShape;
    }

    /**
     * Reads an STL file, ASCII or binary, into a shape: one planar face per triangle, or one face
     * that carries the whole mesh.
     *
     * With `asFaces` true the faces share their corners' edges in a compound that
     * `shapeFix.sewWithReport` can join into a shell. `adjustZtoY` turns Z-up into Y-up, and a file
     * without triangles is refused.
     * @param inputs - The STL file, the face option and the axis adjustment
     * @returns A compound of triangular faces, or one face that carries the mesh
     * @group io
     * @shortname load stl
     * @drawable true
     * @example
     * ```typescript
     * const mesh = await bitbybit.occt.io.loadStl({ stlData: stlText, asFaces: true, adjustZtoY: true });
     * const sewn = await bitbybit.occt.shapeFix.sewWithReport({ shapes: [mesh], tolerance: 1e-6 });
     * ```
     */
    loadStl(inputs: Inputs.OCCT.LoadStlDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.LoadStlDto, inputs) as Resolved.OCCT.LoadStlDto;
        const bytes = bytesOfFile(resolved.stlData, "stlData");
        return this.occ.ReadStlFromBytes(resolved.adjustZtoY ? stlWithYAndZSwapped(bytes) : bytes, resolved.asFaces);
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
        try {
            return this.occ.ReadBREPFromBytes(bytes);
        } catch (thrown) {
            const read = readKernelException(this.occ, thrown);
            const refusal = read instanceof Error ? /ReadBREPFromBytes: (?:the binary BREP data is damaged: )?(.+)$/.exec(read.message) : null;
            if (refusal === null) {
                throw read;
            }
            throw new InputError(`\`brepData\` is damaged: ${refusal[1]}.`, "brepData");
        }
    }

    /** The kernel's reading of BREP text; text the kernel finds damaged is refused as an input error saying where. */
    private brepShapeOf(text: string): TopoDS_Shape {
        try {
            return this.occ.ReadBREPFromString(text);
        } catch (thrown) {
            const read = readKernelException(this.occ, thrown);
            const damage = read instanceof Error ? /the BREP text is damaged: (.+)$/.exec(read.message) : null;
            if (damage === null) {
                throw read;
            }
            throw new InputError(`\`brepData\` is damaged: ${damage[1]}.`, "brepData");
        }
    }

    /**
     * Turns the wires of a shape into DXF path records, the first step of a 2D DXF export.
     *
     * The shape must lie flat on the XZ ground plane, since DXF drawings are two-dimensional. The
     * deflection settings say how closely curved edges are followed. Give the paths a layer with
     * `dxfPathsWithLayer` and write the file with `dxfCreate`.
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
     * });
     * ```
     */
    shapeToDxfPaths(inputs: Inputs.OCCT.ShapeToDxfPathsDto<TopoDS_Shape>): IO.DxfPathDto[] {
        const resolved = resolveDto(Inputs.OCCT.ShapeToDxfPathsDto, inputs) as Resolved.OCCT.ShapeToDxfPathsDto<TopoDS_Shape>;
        return this.och.dxfService.shapeToDxfPaths(resolved);
    }

    /**
     * Puts DXF paths on a named layer with a color, making one part of a DXF drawing.
     *
     * A drawing may hold several parts, each with its own layer and color; `dxfCreate` writes them
     * into one file.
     * @param inputs - The paths, the layer name and the color
     * @returns The paths as one layered part
     * @group dxf
     * @shortname dxf paths with layer
     * @drawable false
     * @example
     * ```typescript
     * const part = await bitbybit.occt.io.dxfPathsWithLayer({ paths, layer: "cut", color: "#ff0000" });
     * ```
     */
    dxfPathsWithLayer(inputs: Inputs.OCCT.DxfPathsWithLayerDto): IO.DxfPathsPartDto {
        const resolved = resolveDto(Inputs.OCCT.DxfPathsWithLayerDto, inputs) as Resolved.OCCT.DxfPathsWithLayerDto;
        return this.och.dxfService.dxfPathsWithLayer(resolved);
    }

    /**
     * Writes DXF parts into one DXF file and returns its text.
     *
     * `colorFormat` chooses AutoCAD's indexed colors or true color, `acadVersion` the DXF version:
     * AC1009 is R12, the most widely readable, AC1015 is 2000. `fileName` and `tryDownload` matter
     * only where a browser download can be started.
     * @param inputs - The layered parts, the color format, the DXF version and the download options
     * @returns The DXF file as text
     * @group dxf
     * @shortname dxf create
     * @drawable false
     * @example
     * ```typescript
     * const dxf = await bitbybit.occt.io.dxfCreate({
     *     pathsParts: [part],
     *     colorFormat: Bit.Inputs.OCCT.dxfColorFormatEnum.aci,
     *     acadVersion: Bit.Inputs.OCCT.dxfAcadVersionEnum.AC1009,
     *     fileName: "drawing.dxf",
     *     tryDownload: false,
     * });
     * ```
     */
    dxfCreate(inputs: Inputs.OCCT.DxfPathsPartsListDto): string {
        const resolved = resolveDto(Inputs.OCCT.DxfPathsPartsListDto, inputs) as Resolved.OCCT.DxfPathsPartsListDto;
        return this.och.dxfService.dxfCreate(resolved);
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
     * const glb = await bitbybit.occt.io.convertStepToGltf({ stepData: stepText, meshPrecision: 0.005, meshAngle: 0.5, meshRelative: true, internalVerticesMode: false, controlSurfaceDeflection: false });
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
                result = this.occ.ConvertStepToGltfFromBinary(
                    stepData,
                    meshPrecision,
                    meshAngle,
                    meshRelative,
                    internalVerticesMode,
                    controlSurfaceDeflection,
                    -1
                );
            } else if (stepData instanceof ArrayBuffer) {
                result = this.occ.ConvertStepToGltfFromBinary(
                    new Uint8Array(stepData),
                    meshPrecision,
                    meshAngle,
                    meshRelative,
                    internalVerticesMode,
                    controlSurfaceDeflection,
                    -1
                );
            } else if (typeof stepData === "string") {
                result = this.occ.ConvertStepToGltfFromMemory(
                    stepData,
                    meshPrecision,
                    meshAngle,
                    meshRelative,
                    internalVerticesMode,
                    controlSurfaceDeflection,
                    -1
                );
            } else {
                throw new Error("File/Blob must be converted to ArrayBuffer before calling this method. Use the worker layer for automatic conversion.");
            }

            if (result.length === 0) {
                throw new Error("Failed to convert STEP to glTF");
            }

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`STEP to glTF conversion failed: ${errorMessage}`, { cause: error });
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
     * options.adjustZtoY = true;
     * const glb = await bitbybit.occt.io.convertStepToGltfAdvanced(options);
     * ```
     */
    convertStepToGltfAdvanced(inputs: Inputs.OCCT.ConvertStepToGltfAdvancedDto): Uint8Array {
        const resolved = resolveDto(Inputs.OCCT.ConvertStepToGltfAdvancedDto, inputs) as Resolved.OCCT.ConvertStepToGltfAdvancedDto;
        try {
            const stepData = resolved.stepData;
            let result: Uint8Array;
            
            const nodeNameFormatNum = this.gltfNameFormatEnumToOcct(resolved.nodeNameFormat);
            const meshNameFormatNum = this.gltfNameFormatEnumToOcct(resolved.meshNameFormat);
            const transformFormatNum = this.gltfTransformFormatEnumToOcct(resolved.transformFormat);
            
            if (stepData instanceof Uint8Array) {
                result = this.occ.ConvertStepToGltfFromBinaryAdvanced(
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
                    resolved.adjustZtoY,
                    resolved.scale
                );
            } else if (stepData instanceof ArrayBuffer) {
                result = this.occ.ConvertStepToGltfFromBinaryAdvanced(
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
                    resolved.adjustZtoY,
                    resolved.scale
                );
            } else if (typeof stepData === "string") {
                const encoder = new TextEncoder();
                const binaryData = encoder.encode(stepData);
                result = this.occ.ConvertStepToGltfFromBinaryAdvanced(
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
                    resolved.adjustZtoY,
                    resolved.scale
                );
            } else {
                throw new Error("File/Blob must be converted to ArrayBuffer before calling this method. Use the worker layer for automatic conversion.");
            }

            if (result.length === 0) {
                throw new Error("Failed to convert STEP to glTF");
            }

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`STEP to glTF advanced conversion failed: ${errorMessage}`, { cause: error });
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

            const result = this.occ.ConvertStepToGltfFromBinaryWithDraco(
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
            );

            if (result.length === 0) {
                throw new Error("Failed to convert STEP to glTF");
            }

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`STEP to glTF (Draco) conversion failed: ${errorMessage}`, { cause: error });
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

            const result = this.occ.ConvertStepToGltfFromBinaryAdvancedWithDraco(
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
                resolved.adjustZtoY,
                resolved.scale,
                resolved.useDraco,
                resolved.dracoCompressionLevel,
                resolved.dracoQuantizePositionBits,
                resolved.dracoQuantizeNormalBits,
                resolved.dracoQuantizeTexcoordBits,
                resolved.dracoQuantizeColorBits,
                resolved.dracoQuantizeGenericBits,
                resolved.dracoUnifiedQuantization
            );

            if (result.length === 0) {
                throw new Error("Failed to convert STEP to glTF");
            }

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`STEP to glTF advanced (Draco) conversion failed: ${errorMessage}`, { cause: error });
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
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                version: "1.0",
                nodes: [],
                error: `STEP assembly parsing failed: ${errorMessage}`
            };
        }
    }

    /**
     * Convert gltfNameFormatEnum string to OCCT numeric value.
     */
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

    /**
     * Convert gltfTransformFormatEnum string to OCCT numeric value.
     */
    private gltfTransformFormatEnumToOcct(format: Inputs.OCCT.gltfTransformFormatEnum): number {
        switch (format) {
            case Inputs.OCCT.gltfTransformFormatEnum.compact: return 0;
            case Inputs.OCCT.gltfTransformFormatEnum.mat4: return 1;
            case Inputs.OCCT.gltfTransformFormatEnum.trs: return 2;
            default: return 0;
        }
    }

    /**
     * A copy of the shape without the mesh it may carry, so a mesh export triangulates at its own
     * precision and leaves the caller's mesh alone. With `adjustYtoZ` the copy is placed with y and z
     * swapped, which turns Y-up into Z-up; a placement moves a face that carries only a mesh too, and
     * the mesh writers turn the triangles of a mirrored placement so they keep facing out.
     */
    private unmeshedCopy(shape: TopoDS_Shape, adjustYtoZ: boolean): TopoDS_Shape {
        const copy = this.occ.BRepBuilderAPI_Copy_Shape(shape, false);
        if (!adjustYtoZ) {
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

    /**
     * Puts a copy of the shape into a new document as one part named `name`, hands the document to
     * `write` and deletes the document and the copy, whatever `write` does.
     */
    private writtenAsDocument<R>(shape: TopoDS_Shape, adjustYtoZ: boolean, name: string, write: (document: Handle_TDocStd_Document) => R): R {
        const copy = this.unmeshedCopy(shape, adjustYtoZ);
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

    /** The edges of a flat drawing as lines of x and y, each curve traced within `precision`. */
    private drawingLinesOf(drawing: TopoDS_Compound, precision: number): DrawingLine[] {
        const edges = this.occ.EdgesOf(drawing, true);
        try {
            return edges.map(edge => {
                const numbers: ArrayLike<number> = this.occ.SubdivideEdgeByDeflection(edge, precision);
                const line: [number, number][] = [];
                for (let at = 0; at + 2 < numbers.length; at += 3) {
                    line.push([numbers[at]!, numbers[at + 1]!]);
                }
                return line;
            });
        } finally {
            edges.forEach(edge => edge.delete());
        }
    }

    /** Removes a file the kernel staged, if it is there. */
    private removeFile(path: string): void {
        try {
            this.occ.FS.unlink(path);
        } catch {
            return;
        }
    }
}
