// Hand-written members of the generated class of the same name (see scripts/gen-worker-api.mjs).
// Each member's marker says where it lands: `// replaces <path>` takes the kernel method's slot (and its doc,
// when the member has none), `// after <path>` follows that slot, `// first` and `// last` frame the class.
import { Inputs } from "@bitbybit-dev/occt";
import { Models } from "@bitbybit-dev/occt";
import { OCCTWorkerManager } from "../../occ-worker/occ-worker-manager";

export class OCCTIO {
    constructor(readonly occWorkerManager: OCCTWorkerManager) { }

    // replaces io.saveShapeSTEP
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

    // replaces io.saveShapeSTEP
    async saveShapeSTEPAndReturn(inputs: Inputs.OCCT.SaveStepDto<Inputs.OCCT.TopoDSShapePointer>): Promise<string> {
        return this.saveSTEP(inputs);
    }

    // replaces io.saveShapeStl
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

    // replaces io.saveShapeStl
    async saveShapeStlAndReturn(inputs: Inputs.OCCT.SaveStlDto<Inputs.OCCT.TopoDSShapePointer>): Promise<string> {
        return this.saveStl(inputs);
    }

    // after io.saveShapeStl
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

    // after io.saveShapeStl
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

    // replaces io.dxfCreate
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

    // replaces io.convertStepToGltf
    async convertStepToGltf(inputs: Inputs.OCCT.ConvertStepToGltfDto): Promise<Uint8Array> {
        // Convert File/Blob to ArrayBuffer before sending to worker
        const stepData = await this.occWorkerManager.prepareStepData(inputs.stepData);
        const preparedInputs = {
            ...inputs,
            stepData
        };
        return this.occWorkerManager.genericCallToWorkerPromise("io.convertStepToGltf", preparedInputs);
    }

    // replaces io.convertStepToGltfAdvanced
    async convertStepToGltfAdvanced(inputs: Inputs.OCCT.ConvertStepToGltfAdvancedDto): Promise<Uint8Array> {
        // Convert File/Blob to ArrayBuffer before sending to worker
        const stepData = await this.occWorkerManager.prepareStepData(inputs.stepData);
        const preparedInputs = {
            ...inputs,
            stepData
        };
        return this.occWorkerManager.genericCallToWorkerPromise("io.convertStepToGltfAdvanced", preparedInputs);
    }

    // replaces io.convertStepToGltfWithDraco
    async convertStepToGltfWithDraco(inputs: Inputs.OCCT.ConvertStepToGltfWithDracoDto): Promise<Uint8Array> {
        // Convert File/Blob to ArrayBuffer before sending to worker
        const stepData = await this.occWorkerManager.prepareStepData(inputs.stepData);
        const preparedInputs = {
            ...inputs,
            stepData
        };
        return this.occWorkerManager.genericCallToWorkerPromise("io.convertStepToGltfWithDraco", preparedInputs);
    }

    // replaces io.convertStepToGltfAdvancedWithDraco
    async convertStepToGltfAdvancedWithDraco(inputs: Inputs.OCCT.ConvertStepToGltfAdvancedWithDracoDto): Promise<Uint8Array> {
        // Convert File/Blob to ArrayBuffer before sending to worker
        const stepData = await this.occWorkerManager.prepareStepData(inputs.stepData);
        const preparedInputs = {
            ...inputs,
            stepData
        };
        return this.occWorkerManager.genericCallToWorkerPromise("io.convertStepToGltfAdvancedWithDraco", preparedInputs);
    }

    // replaces io.parseStepToJson
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
