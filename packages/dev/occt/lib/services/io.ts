import { IGESControl_Reader, BitbybitOcctModule, STEPControl_Reader, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import * as Inputs from "../api/inputs";
import * as Models from "../api/models";
import { IO } from "@bitbybit-dev/base/lib/api/inputs";

/**
 * Reading and writing OpenCascade shapes in exchange formats: STEP and IGES in, STEP, STL and DXF
 * out, STEP to glTF conversion with the assembly tree, colors and names preserved, and a STEP
 * assembly structure as JSON. Files travel as text or binary data, never as paths. OpenCascade
 * treats Z as up while this library treats Y as up, so the `adjustYtoZ` and `adjustZtoY` flags swap
 * the axes on the way out and in.
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
        const shapeToUse = inputs.shape;
        let adjustedShape;
        if (inputs.adjustYtoZ) {
            const rotatedShape = this.och.transformsService.rotate({ shape: inputs.shape, axis: [1, 0, 0], angle: -90 });
            if (inputs.fromRightHanded) {
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
     * returning the file's text.
     *
     * `precision` is the meshing tolerance in model units; smaller values follow curved surfaces
     * more closely and make a bigger file. `adjustYtoZ` turns the shape so Y-up becomes Z-up.
     * `fileName` and `tryDownload` only matter where a download can start.
     * @param inputs - The shape, the file name, the meshing precision, the axis adjustment and the download options
     * @returns The STL file as text
     * @group io
     * @shortname save stl return
     * @drawable false
     * @example
     * ```typescript
     * const stl = await bitbybit.occt.io.saveShapeStlAndReturn({ shape: box, fileName: "box.stl", precision: 0.01, adjustYtoZ: true, tryDownload: false });
     * ```
     */
    saveShapeStl(inputs: Inputs.OCCT.SaveStlDto<TopoDS_Shape>): string {
        const shapeToUse = inputs.shape;

        this.occ.BRepTools.Clean(shapeToUse);

        let adjustedShape;
        if (inputs.adjustYtoZ) {
            const rotatedShape = this.och.transformsService.rotate({ shape: inputs.shape, axis: [1, 0, 0], angle: -90 });
            adjustedShape = this.och.transformsService.mirrorAlongNormal(
                { shape: rotatedShape, origin: [0, 0, 0], normal: [0, 0, 1] }
            );
            rotatedShape.delete();
        }
        const fileName = "x";
        const writer = new this.occ.StlAPI_Writer();
        let transferShape;
        if (adjustedShape) {
            transferShape = adjustedShape;
        } else {
            transferShape = shapeToUse;
        }
        let result: string;
        const incrementalMeshBuilder = new this.occ.BRepMesh_IncrementalMesh(transferShape, inputs.precision, false, 0.5, false);

        const writeResult = writer.Write(transferShape, fileName);
        if (writeResult) {
            const stlFile = this.occ.FS.readFile("/" + fileName, { encoding: "utf8" }) as string;
            this.occ.FS.unlink("/" + fileName);
            result = stlFile;
        } else {
            throw (new Error("Failed when writing stl file."));
        }

        if (adjustedShape) {
            adjustedShape.delete();
        }

        if (incrementalMeshBuilder) {
            incrementalMeshBuilder.delete();
        }

        return result;
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
        const fileName = inputs.fileName;
        const fileText = inputs.filetext;
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
        if (inputs.adjustZtoY && stepShape) {
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
        return this.och.dxfService.shapeToDxfPaths(inputs);
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
        return this.och.dxfService.dxfPathsWithLayer(inputs);
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
        return this.och.dxfService.dxfCreate(inputs);
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
        try {
            const stepData = inputs.stepData;
            let result: Uint8Array;

            const meshPrecision = inputs.meshPrecision ?? 0.005;
            const meshAngle = inputs.meshAngle ?? 0.5;
            const meshRelative = inputs.meshRelative ?? true;
            const internalVerticesMode = inputs.internalVerticesMode ?? false;
            const controlSurfaceDeflection = inputs.controlSurfaceDeflection ?? false;

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
        try {
            const stepData = inputs.stepData;
            let result: Uint8Array;
            
            const nodeNameFormatNum = this.gltfNameFormatEnumToOcct(inputs.nodeNameFormat ?? Inputs.OCCT.gltfNameFormatEnum.instance);
            const meshNameFormatNum = this.gltfNameFormatEnumToOcct(inputs.meshNameFormat ?? Inputs.OCCT.gltfNameFormatEnum.instance);
            const transformFormatNum = this.gltfTransformFormatEnumToOcct(inputs.transformFormat ?? Inputs.OCCT.gltfTransformFormatEnum.compact);
            
            if (stepData instanceof Uint8Array) {
                result = this.occ.ConvertStepToGltfFromBinaryAdvanced(
                    stepData,
                    inputs.readColors ?? true,
                    inputs.readNames ?? true,
                    inputs.readMaterials ?? true,
                    inputs.readLayers ?? false,
                    inputs.readProps ?? false,
                    inputs.meshDeflection ?? 0.005,
                    inputs.meshAngle ?? 0.5,
                    inputs.meshParallel ?? true,
                    inputs.meshRelative ?? true,
                    inputs.internalVerticesMode ?? false,
                    inputs.controlSurfaceDeflection ?? false,
                    inputs.faceCountThreshold ?? -1,
                    inputs.mergeFaces ?? true,
                    inputs.splitIndices16 ?? true,
                    inputs.parallelWrite ?? true,
                    inputs.embedTextures ?? true,
                    inputs.forceUVExport ?? false,
                    nodeNameFormatNum,
                    meshNameFormatNum,
                    transformFormatNum,
                    inputs.adjustZtoY ?? true,
                    inputs.scale ?? 1.0
                );
            } else if (stepData instanceof ArrayBuffer) {
                result = this.occ.ConvertStepToGltfFromBinaryAdvanced(
                    new Uint8Array(stepData),
                    inputs.readColors ?? true,
                    inputs.readNames ?? true,
                    inputs.readMaterials ?? true,
                    inputs.readLayers ?? false,
                    inputs.readProps ?? false,
                    inputs.meshDeflection ?? 0.005,
                    inputs.meshAngle ?? 0.5,
                    inputs.meshParallel ?? true,
                    inputs.meshRelative ?? true,
                    inputs.internalVerticesMode ?? false,
                    inputs.controlSurfaceDeflection ?? false,
                    inputs.faceCountThreshold ?? -1,
                    inputs.mergeFaces ?? true,
                    inputs.splitIndices16 ?? true,
                    inputs.parallelWrite ?? true,
                    inputs.embedTextures ?? true,
                    inputs.forceUVExport ?? false,
                    nodeNameFormatNum,
                    meshNameFormatNum,
                    transformFormatNum,
                    inputs.adjustZtoY ?? true,
                    inputs.scale ?? 1.0
                );
            } else if (typeof stepData === "string") {
                const encoder = new TextEncoder();
                const binaryData = encoder.encode(stepData);
                result = this.occ.ConvertStepToGltfFromBinaryAdvanced(
                    binaryData,
                    inputs.readColors ?? true,
                    inputs.readNames ?? true,
                    inputs.readMaterials ?? true,
                    inputs.readLayers ?? false,
                    inputs.readProps ?? false,
                    inputs.meshDeflection ?? 0.005,
                    inputs.meshAngle ?? 0.5,
                    inputs.meshParallel ?? true,
                    inputs.meshRelative ?? true,
                    inputs.internalVerticesMode ?? false,
                    inputs.controlSurfaceDeflection ?? false,
                    inputs.faceCountThreshold ?? -1,
                    inputs.mergeFaces ?? true,
                    inputs.splitIndices16 ?? true,
                    inputs.parallelWrite ?? true,
                    inputs.embedTextures ?? true,
                    inputs.forceUVExport ?? false,
                    nodeNameFormatNum,
                    meshNameFormatNum,
                    transformFormatNum,
                    inputs.adjustZtoY ?? true,
                    inputs.scale ?? 1.0
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
        try {
            const stepData = inputs.stepData;
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
                inputs.meshPrecision ?? 0.005,
                inputs.meshAngle ?? 0.5,
                inputs.meshRelative ?? true,
                inputs.internalVerticesMode ?? false,
                inputs.controlSurfaceDeflection ?? false,
                -1,
                inputs.useDraco ?? true,
                inputs.dracoCompressionLevel ?? 7,
                inputs.dracoQuantizePositionBits ?? 14,
                inputs.dracoQuantizeNormalBits ?? 10,
                inputs.dracoQuantizeTexcoordBits ?? 12,
                inputs.dracoQuantizeColorBits ?? 8,
                inputs.dracoQuantizeGenericBits ?? 12,
                inputs.dracoUnifiedQuantization ?? false
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
        try {
            const stepData = inputs.stepData;
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

            const nodeNameFormatNum = this.gltfNameFormatEnumToOcct(inputs.nodeNameFormat ?? Inputs.OCCT.gltfNameFormatEnum.instance);
            const meshNameFormatNum = this.gltfNameFormatEnumToOcct(inputs.meshNameFormat ?? Inputs.OCCT.gltfNameFormatEnum.instance);
            const transformFormatNum = this.gltfTransformFormatEnumToOcct(inputs.transformFormat ?? Inputs.OCCT.gltfTransformFormatEnum.compact);

            const result = this.occ.ConvertStepToGltfFromBinaryAdvancedWithDraco(
                binaryData,
                inputs.readColors ?? true,
                inputs.readNames ?? true,
                inputs.readMaterials ?? true,
                inputs.readLayers ?? false,
                inputs.readProps ?? false,
                inputs.meshDeflection ?? 0.005,
                inputs.meshAngle ?? 0.5,
                inputs.meshParallel ?? true,
                inputs.meshRelative ?? true,
                inputs.internalVerticesMode ?? false,
                inputs.controlSurfaceDeflection ?? false,
                inputs.faceCountThreshold ?? -1,
                inputs.mergeFaces ?? true,
                inputs.splitIndices16 ?? true,
                inputs.parallelWrite ?? true,
                inputs.embedTextures ?? true,
                inputs.forceUVExport ?? false,
                nodeNameFormatNum,
                meshNameFormatNum,
                transformFormatNum,
                inputs.adjustZtoY ?? true,
                inputs.scale ?? 1.0,
                inputs.useDraco ?? true,
                inputs.dracoCompressionLevel ?? 7,
                inputs.dracoQuantizePositionBits ?? 14,
                inputs.dracoQuantizeNormalBits ?? 10,
                inputs.dracoQuantizeTexcoordBits ?? 12,
                inputs.dracoQuantizeColorBits ?? 8,
                inputs.dracoQuantizeGenericBits ?? 12,
                inputs.dracoUnifiedQuantization ?? false
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
}
