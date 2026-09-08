import { IGESControl_Reader, BitbybitOcctModule, STEPControl_Reader, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import * as Inputs from "../api/inputs";
import * as Models from "../api/models";
import { IO } from "@bitbybit-dev/base/lib/api/inputs";

export class OCCTIO {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
    }

    /**
     * Saves the step file and returns the text value
     * @param inputs STEP filename and shape to be saved
     * @group io
     * @shortname save step and return
     * @drawable false
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
     * Saves the stl file and returns
     * @param inputs STL filename and shape to be saved
     * @group io
     * @shortname save stl return
     * @drawable false
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

    /** This function parses the contents of a `.STEP` or `.IGES` file as a Shape.
     * 
     * Accepts:
     * - string: for plain text files (.step, .stp, .iges, .igs)
     * - ArrayBuffer: for compressed files (.stpz, .igz) or binary content
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
     * Creates DXF paths from an OCCT shape
     * Important - shapes containing wires must lie on XZ plane (Y=0) for correct 2D DXF export.
     * @param inputs Shape to convert to DXF paths
     * @group dxf
     * @shortname shape to dxf paths
     * @drawable false
     */
    shapeToDxfPaths(inputs: Inputs.OCCT.ShapeToDxfPathsDto<TopoDS_Shape>): IO.DxfPathDto[] {
        return this.och.dxfService.shapeToDxfPaths(inputs);
    }

    /**
     * Adds layer and color information to DXF paths
     * Important - shapes containing wires must lie on XZ plane (Y=0) for correct 2D DXF export.
     * @param inputs DXF paths, layer name, and color
     * @group dxf
     * @shortname dxf paths with layer
     * @drawable false
     */
    dxfPathsWithLayer(inputs: Inputs.OCCT.DxfPathsWithLayerDto): IO.DxfPathsPartDto {
        return this.och.dxfService.dxfPathsWithLayer(inputs);
    }

    /**
     * Assembles multiple path parts into a complete DXF file.
     * Important - shapes containing wires must lie on XZ plane (Y=0) for correct 2D DXF export.
     * @param inputs Multiple DXF paths parts
     * @group dxf
     * @shortname dxf create
     * @drawable false
     */
    dxfCreate(inputs: Inputs.OCCT.DxfPathsPartsListDto): string {
        return this.och.dxfService.dxfCreate(inputs);
    }

    /**
     * Convert a STEP file to glTF format (binary GLB).
     * 
     * Uses OCCT's native RWGltf_CafWriter for fast conversion with full preservation of:
     * - Assembly hierarchy (as glTF node tree)
     * - Instance/product names
     * - Surface colors and materials
     * - Transformations
     * 
     * The coordinate system is automatically converted from OCCT (Z-up) to glTF (Y-up).
     * 
     * @param inputs - STEP file content and mesh precision settings. Accepts File, Blob, string, ArrayBuffer, or Uint8Array.
     * @returns GLB binary data as Uint8Array (can be used directly with Three.js, Babylon.js, etc.)
     * @group assembly
     * @shortname step to gltf
     * @drawable false
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
     * Convert a STEP file to glTF format with full control over all options.
     * 
     * This advanced method allows fine-grained control over:
     * - STEP reading options (colors, names, materials, layers, props)
     * - Mesh generation options (deflection, angle, parallel, threshold)
     * - glTF export options (merge faces, indices, naming, transforms)
     * 
     * Use this for performance tuning - disable features you don't need for faster processing.
     * 
     * @param inputs - Advanced options including STEP data, mesh settings, and glTF export settings.
     * @returns GLB binary data as Uint8Array
     * @group assembly
     * @shortname step to gltf advanced
     * @drawable false
     * 
     * @example
     * ```typescript
     * // Fast conversion - only colors, no names (for large files)
     * const glbData = await occt.io.convertStepToGltfAdvanced({
     *     stepData: stepContent,
     *     readColors: true,
     *     readNames: false,      // Skip name parsing for speed
     *     readMaterials: true,
     *     readLayers: false,
     *     readProps: false,
     *     meshDeflection: 0.1,
     *     meshParallel: true,
     *     mergeFaces: true
     * });
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
     * Convert a STEP file to glTF format (binary GLB) with explicit Draco geometry
     * compression settings.
     * Same fast path as `convertStepToGltf` but exposes the Draco knobs of the
     * underlying native function.
     * @param inputs - STEP file content, mesh precision settings and Draco knobs.
     *                 Accepts File, Blob, string, ArrayBuffer, or Uint8Array.
     * @returns GLB binary data as Uint8Array
     * @group assembly
     * @shortname step to gltf with draco
     * @drawable false
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
     * Convert a STEP file to glTF format with full control over all reading,
     * meshing and writer options, plus explicit Draco geometry compression
     * settings.
     *
     * Same fast path as `convertStepToGltfAdvanced` but exposes the 8 Draco
     * knobs.
     *
     * @param inputs - Advanced options including STEP data, mesh settings, glTF
     *                 export settings and Draco knobs.
     * @returns GLB binary data as Uint8Array
     * @group assembly
     * @shortname step to gltf advanced with draco
     * @drawable false
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
     * Parse a STEP file and return the assembly structure as JSON.
     * 
     * Uses OCCT's native XCAFPrs_DocumentExplorer for efficient traversal.
     * Runs entirely in C++ for maximum performance.
     * 
     * Returns an object containing an array of nodes with:
     * - id: Unique path identifier for each node
     * - name: Part or assembly name
     * - isAssembly: Whether this is an assembly node (has children)
     * - visible: Visibility flag
     * - colorRgba: Surface color (if set) with r, g, b, a components
     * - transform: 4x4 transformation matrix in column-major order (if not identity)
     * 
     * @param inputs - STEP file content. Accepts File, Blob, string, ArrayBuffer, or Uint8Array.
     * @returns Parsed assembly structure
     * @group assembly
     * @shortname parse step to json
     * @drawable false
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
