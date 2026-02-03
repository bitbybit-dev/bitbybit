import { Handle_TDocStd_Document, IGESControl_Reader, BitbybitOcctModule, STEPControl_Reader, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
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
        // Convert to a .STEP File

        let transferResult;
        try {
            transferResult = writer.Transfer(
                transferShape,
                this.occ.STEPControl_StepModelType.AsIs
            );
        } catch (ex) {
            throw (new Error("Failed when calling writer.Transfer."));
        }
        let result: string;
        if (transferResult === this.occ.IFSelect_ReturnStatus.RetDone) {
            // Write the STEP File to the virtual Emscripten Filesystem Temporarily
            const writeResult = writer.Write(fileName);
            if (writeResult === this.occ.IFSelect_ReturnStatus.RetDone) {
                // Read the STEP File from the filesystem and clean up
                const stepFileText = this.occ.FS.readFile("/" + fileName, { encoding: "utf8" }) as string;
                this.occ.FS.unlink("/" + fileName);

                // Return the contents of the STEP File
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

    saveShapeStl(inputs: Inputs.OCCT.SaveStlDto<TopoDS_Shape>): string {
        const shapeToUse = inputs.shape;

        // This could be made optional...
        // Clean cached triangulation data for the shape.
        // This allows to get lower res models out of higher res that was once computed and cached.
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

        // Write the STL File to the virtual Emscripten Filesystem Temporarily
        const writeResult = writer.Write(transferShape, fileName);
        if (writeResult) {
            // Read the STL File from the filesystem and clean up
            const stlFile = this.occ.FS.readFile("/" + fileName, { encoding: "utf8" }) as string;
            this.occ.FS.unlink("/" + fileName);
            // Return the contents of the STL File
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
        
        // Determine file type based on extension
        const fileType = (() => {
            switch (extension) {
                case "step":
                case "stp":
                case "stpz":  // Compressed STEP
                    return "step";
                case "iges":
                case "igs":
                case "igz":   // Compressed IGES
                    return "iges";
                default:
                    return undefined;
            }
        })();
        
        if (!fileType) {
            console.error("opencascade can't parse this extension!");
            return undefined;
        }
        
        // Check if input is binary (ArrayBuffer) - use binary functions
        const isBinaryInput = fileText instanceof ArrayBuffer;
        
        let stepShape: TopoDS_Shape | undefined;
        
        if (isBinaryInput) {
            // Use binary functions for compressed files or binary content
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
            // Use traditional file-based approach for text files
            this.occ.FS.createDataFile("/", `file.${fileType}`, fileText as string, true, true, true);
            
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
            } else {
                console.error("Something in OCCT went wrong trying to read " + fileName);
                this.occ.FS.unlink(`/file.${fileType}`);
                return undefined;
            }
        }
        
        // Apply coordinate system adjustment if requested
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
    
    shapeToDxfPaths(inputs: Inputs.OCCT.ShapeToDxfPathsDto<TopoDS_Shape>): IO.DxfPathDto[] {
        return this.och.dxfService.shapeToDxfPaths(inputs);
    }

    dxfPathsWithLayer(inputs: Inputs.OCCT.DxfPathsWithLayerDto): IO.DxfPathsPartDto {
        return this.och.dxfService.dxfPathsWithLayer(inputs);
    }

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
     * Note: File/Blob inputs must be converted to ArrayBuffer before calling this method.
     * The worker layer handles this conversion automatically.
     * 
     * @param inputs - STEP file content and mesh precision settings. Accepts string, ArrayBuffer, or Uint8Array.
     * @returns GLB binary data as Uint8Array (can be used directly with Three.js, Babylon.js, etc.)
     */
    convertStepToGltf(inputs: Inputs.OCCT.ConvertStepToGltfDto): Uint8Array {
        try {
            const stepData = inputs.stepData;
            let result: Uint8Array;
            
            // Check if input is binary (Uint8Array or ArrayBuffer) - use for STEP-Z compressed files
            if (stepData instanceof Uint8Array) {
                result = this.occ.ConvertStepToGltfFromBinary(
                    stepData,
                    inputs.meshPrecision ?? 0.1,
                    50000
                );
            } else if (stepData instanceof ArrayBuffer) {
                // ArrayBuffer needs to be wrapped as Uint8Array
                result = this.occ.ConvertStepToGltfFromBinary(
                    new Uint8Array(stepData),
                    inputs.meshPrecision ?? 0.1,
                    50000
                );
            } else if (typeof stepData === "string") {
                // String input - plain text STEP files
                result = this.occ.ConvertStepToGltfFromMemory(
                    stepData,
                    inputs.meshPrecision ?? 0.1
                );
            } else {
                // File or Blob - should have been converted by worker layer
                throw new Error("File/Blob must be converted to ArrayBuffer before calling this method. Use the worker layer for automatic conversion.");
            }

            if (result.length === 0) {
                throw new Error("Failed to convert STEP to glTF");
            }

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`STEP to glTF conversion failed: ${errorMessage}`);
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
     */
    convertStepToGltfAdvanced(inputs: Inputs.OCCT.ConvertStepToGltfAdvancedDto): Uint8Array {
        try {
            const stepData = inputs.stepData;
            let result: Uint8Array;
            
            // Convert enum string values to OCCT numeric values
            const nodeNameFormatNum = this.gltfNameFormatEnumToOcct(inputs.nodeNameFormat ?? Inputs.OCCT.gltfNameFormatEnum.instance);
            const meshNameFormatNum = this.gltfNameFormatEnumToOcct(inputs.meshNameFormat ?? Inputs.OCCT.gltfNameFormatEnum.instance);
            const transformFormatNum = this.gltfTransformFormatEnumToOcct(inputs.transformFormat ?? Inputs.OCCT.gltfTransformFormatEnum.compact);
            
            // Check if input is binary (Uint8Array or ArrayBuffer) - use for STEP-Z compressed files
            if (stepData instanceof Uint8Array) {
                result = this.occ.ConvertStepToGltfFromBinaryAdvanced(
                    stepData,
                    inputs.readColors ?? true,
                    inputs.readNames ?? true,
                    inputs.readMaterials ?? true,
                    inputs.readLayers ?? false,
                    inputs.readProps ?? false,
                    inputs.meshDeflection ?? 0.1,
                    inputs.meshAngle ?? 0.5,
                    inputs.meshParallel ?? true,
                    inputs.faceCountThreshold ?? 50000,
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
                // ArrayBuffer needs to be wrapped as Uint8Array
                result = this.occ.ConvertStepToGltfFromBinaryAdvanced(
                    new Uint8Array(stepData),
                    inputs.readColors ?? true,
                    inputs.readNames ?? true,
                    inputs.readMaterials ?? true,
                    inputs.readLayers ?? false,
                    inputs.readProps ?? false,
                    inputs.meshDeflection ?? 0.1,
                    inputs.meshAngle ?? 0.5,
                    inputs.meshParallel ?? true,
                    inputs.faceCountThreshold ?? 50000,
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
                // String input - cannot use ConvertStepToGltfFromBinaryAdvanced, convert to Uint8Array
                const encoder = new TextEncoder();
                const binaryData = encoder.encode(stepData);
                result = this.occ.ConvertStepToGltfFromBinaryAdvanced(
                    binaryData,
                    inputs.readColors ?? true,
                    inputs.readNames ?? true,
                    inputs.readMaterials ?? true,
                    inputs.readLayers ?? false,
                    inputs.readProps ?? false,
                    inputs.meshDeflection ?? 0.1,
                    inputs.meshAngle ?? 0.5,
                    inputs.meshParallel ?? true,
                    inputs.faceCountThreshold ?? 50000,
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
                // File or Blob - should have been converted by worker layer
                throw new Error("File/Blob must be converted to ArrayBuffer before calling this method. Use the worker layer for automatic conversion.");
            }

            if (result.length === 0) {
                throw new Error("Failed to convert STEP to glTF");
            }

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`STEP to glTF advanced conversion failed: ${errorMessage}`);
        }
    }

    /**
     * Parse a STEP file and return the assembly structure as JSON.
     * 
     * Uses OCCT's native XCAFPrs_DocumentExplorer for efficient traversal.
     * Runs entirely in C++ for maximum performance.
     * 
     * Note: File/Blob inputs must be converted to ArrayBuffer before calling this method.
     * The worker layer handles this conversion automatically.
     * 
     * Returns an object containing an array of nodes with:
     * - id: Unique path identifier for each node
     * - name: Part or assembly name
     * - isAssembly: Whether this is an assembly node (has children)
     * - visible: Visibility flag
     * - colorRgba: Surface colorRgba (if set) with r, g, b, a components
     * - transform: 4x4 transformation matrix in column-major order (if not identity)
     * 
     * @param inputs - STEP file content. Accepts string, ArrayBuffer, or Uint8Array.
     * @returns Parsed assembly structure
     */
    parseStepToJson(inputs: Inputs.OCCT.ParseStepAssemblyToJsonDto): Models.OCCT.AssemblyJsonResult {
        try {
            const stepData = inputs.stepData;
            let jsonString: string;
            
            // Check if input is binary (Uint8Array or ArrayBuffer) - use for STEP-Z compressed files
            if (stepData instanceof Uint8Array) {
                jsonString = this.occ.ParseStepAssemblyToJsonFromBinary(stepData);
            } else if (stepData instanceof ArrayBuffer) {
                // ArrayBuffer needs to be wrapped as Uint8Array
                jsonString = this.occ.ParseStepAssemblyToJsonFromBinary(new Uint8Array(stepData));
            } else if (typeof stepData === "string") {
                // String input - plain text STEP files
                jsonString = this.occ.ParseStepAssemblyToJsonFromMemory(stepData);
            } else {
                // File or Blob - should have been converted by worker layer
                throw new Error("File/Blob must be converted to ArrayBuffer before calling this method. Use the worker layer for automatic conversion.");
            }

            // Parse JSON result
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
            default: return 2; // Default to instance
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
