import { Inputs } from "@bitbybit-dev/occt";
import { Models } from "@bitbybit-dev/occt";
import { OCCTWorkerManager } from "../../occ-worker/occ-worker-manager";
import { IO } from "@bitbybit-dev/base/lib/api/inputs";

export class OCCTIO {

    constructor(
        readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }

    /**
     * Saves the step file
     * @param inputs STEP filename and shape to be saved
     * @group io
     * @shortname save step
     * @drawable false
     */
    async saveShapeSTEP(inputs: Inputs.OCCT.SaveStepDto<Inputs.OCCT.TopoDSShapePointer>): Promise<void> {
        this.saveSTEP(inputs);
    }

    /**
     * Saves the step file and returns the text value
     * @param inputs STEP filename and shape to be saved
     * @group io
     * @shortname save step and return
     * @drawable false
     */
    async saveShapeSTEPAndReturn(inputs: Inputs.OCCT.SaveStepDto<Inputs.OCCT.TopoDSShapePointer>): Promise<string> {
        return this.saveSTEP(inputs);
    }

    /**
     * Saves the stl file
     * @param inputs STL filename and shape to be saved
     * @group io
     * @shortname save stl
     * @drawable false
     */
    async saveShapeStl(inputs: Inputs.OCCT.SaveStlDto<Inputs.OCCT.TopoDSShapePointer>): Promise<void> {
        this.saveStl(inputs);
    }

    /**
     * Saves the stl file and returns
     * @param inputs STL filename and shape to be saved
     * @group io
     * @shortname save stl return
     * @drawable false
     */
    async saveShapeStlAndReturn(inputs: Inputs.OCCT.SaveStlDto<Inputs.OCCT.TopoDSShapePointer>): Promise<string> {
        return this.saveStl(inputs);
    }

    private saveSTEP(inputs: Inputs.OCCT.SaveStepDto<Inputs.OCCT.TopoDSShapePointer>): Promise<string> {
        return this.occWorkerManager.genericCallToWorkerPromise("io.saveShapeSTEP", inputs).then(s => {
            if (inputs.tryDownload && document) {
                const blob = new Blob([s], { type: "text/plain" });
                const blobUrl = URL.createObjectURL(blob);

                let fileName = inputs.fileName ? inputs.fileName : "bitbybit-dev.step";
                if (!fileName.toLowerCase().includes(".step")) {
                    fileName += ".step";
                }
                const fileLink = document.createElement("a");
                fileLink.href = blobUrl;
                fileLink.target = "_self";
                fileLink.download = fileName;
                fileLink.click();
                fileLink.remove();
            }
            return s;
        });
    }

    private saveStl(inputs: Inputs.OCCT.SaveStlDto<Inputs.OCCT.TopoDSShapePointer>): Promise<string> {
        return this.occWorkerManager.genericCallToWorkerPromise("io.saveShapeStl", inputs).then(s => {
            if (inputs.tryDownload && document) {
                const blob = new Blob([s], { type: "application/stl" });
                const blobUrl = URL.createObjectURL(blob);

                const fileName = inputs.fileName ? inputs.fileName : "bitbybit-dev.stl";

                const fileLink = document.createElement("a");
                fileLink.href = blobUrl;
                fileLink.target = "_self";
                fileLink.download = fileName;
                fileLink.click();
                fileLink.remove();
            }
            return s;
        });
    }

    /**
     * Creates DXF paths from an OCCT shape
     * Important - shapes containing wires must lie on XZ plane (Y=0) for correct 2D DXF export.
     * @param inputs Shape to convert to DXF paths
     * @group dxf
     * @shortname shape to dxf paths
     * @drawable false
     */
    shapeToDxfPaths(inputs: Inputs.OCCT.ShapeToDxfPathsDto<Inputs.OCCT.TopoDSShapePointer>): Promise<IO.DxfPathDto[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("io.shapeToDxfPaths", inputs);
    }

    /**
     * Adds layer and color information to DXF paths
     * Important - shapes containing wires must lie on XZ plane (Y=0) for correct 2D DXF export.
     * @param inputs DXF paths, layer name, and color
     * @group dxf
     * @shortname dxf paths with layer
     * @drawable false
     */
    dxfPathsWithLayer(inputs: Inputs.OCCT.DxfPathsWithLayerDto): Promise<IO.DxfPathsPartDto> {
        return this.occWorkerManager.genericCallToWorkerPromise("io.dxfPathsWithLayer", inputs);
    }

    /**
     * Assembles multiple path parts into a complete DXF file.
     * Important - shapes containing wires must lie on XZ plane (Y=0) for correct 2D DXF export.
     * @param inputs Multiple DXF paths parts
     * @group dxf
     * @shortname dxf create
     * @drawable false
     */
    dxfCreate(inputs: Inputs.OCCT.DxfPathsPartsListDto): Promise<string> {
        return this.occWorkerManager.genericCallToWorkerPromise("io.dxfCreate", inputs).then(s => {
            if (inputs.tryDownload && document) {
                const blob = new Blob([s], { type: "application/stl" });
                const blobUrl = URL.createObjectURL(blob);

                const fileName = inputs.fileName ? inputs.fileName : "bitbybit-dev.dxf";

                const fileLink = document.createElement("a");
                fileLink.href = blobUrl;
                fileLink.target = "_self";
                fileLink.download = fileName;
                fileLink.click();
                fileLink.remove();
            }
            return s;
        });
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
    async convertStepToGltf(inputs: Inputs.OCCT.ConvertStepToGltfDto): Promise<Uint8Array> {
        // Convert File/Blob to ArrayBuffer before sending to worker
        const stepData = await this.occWorkerManager.prepareStepData(inputs.stepData);
        const preparedInputs = {
            ...inputs,
            stepData
        };
        return this.occWorkerManager.genericCallToWorkerPromise("io.convertStepToGltf", preparedInputs);
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
    async convertStepToGltfAdvanced(inputs: Inputs.OCCT.ConvertStepToGltfAdvancedDto): Promise<Uint8Array> {
        // Convert File/Blob to ArrayBuffer before sending to worker
        const stepData = await this.occWorkerManager.prepareStepData(inputs.stepData);
        const preparedInputs = {
            ...inputs,
            stepData
        };
        return this.occWorkerManager.genericCallToWorkerPromise("io.convertStepToGltfAdvanced", preparedInputs);
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
     * - color: Surface color (if set) with r, g, b, a components
     * - transform: 4x4 transformation matrix in column-major order (if not identity)
     * 
     * @param inputs - STEP file content. Accepts File, Blob, string, ArrayBuffer, or Uint8Array.
     * @returns Parsed assembly structure
     * @group assembly
     * @shortname parse step to json
     * @drawable false
     */
    async parseStepToJson(inputs: Inputs.OCCT.ParseStepAssemblyToJsonDto): Promise<Models.OCCT.AssemblyJsonResult> {
        // Convert File/Blob to ArrayBuffer before sending to worker
        const stepData = await this.occWorkerManager.prepareStepData(inputs.stepData);
        const preparedInputs = {
            ...inputs,
            stepData
        };
        return this.occWorkerManager.genericCallToWorkerPromise("io.parseStepToJson", preparedInputs);
    }

}
