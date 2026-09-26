// Hand-written members of the generated class of the same name (see scripts/gen-worker-api.mjs).
// Each member's marker says where it lands: `// replaces <path>` takes the kernel method's slot (and its doc,
// when the member has none), `// after <path>` follows that slot, `// first` and `// last` frame the class.
import { Inputs } from "@bitbybit-dev/occt";
import { Models } from "@bitbybit-dev/occt";
import { Resolved } from "@bitbybit-dev/occt";
import { resolveDto } from "@bitbybit-dev/base";
import { OCCTWorkerManager } from "../../occ-worker/occ-worker-manager";

export class OCCTIO {
    constructor(readonly occWorkerManager: OCCTWorkerManager) { }

    // replaces io.saveShapeSTEP
    /**
     * Writes a shape as STEP, the standard exchange format for exact CAD geometry, and starts a
     * browser download of the file.
     *
     * With `adjustYtoZ` true the shape is turned so this library's Y-up becomes STEP's Z-up;
     * `fromRightHanded` skips the mirror that swap otherwise includes. `fileName` names the download
     * and `tryDownload` false skips it. `saveShapeSTEPAndReturn` gives the file's text instead.
     * @param inputs - The shape, the file name, the axis adjustment and the download options
     * @returns Nothing; the download starts when the file is ready
     * @group io
     * @shortname save step
     * @drawable false
     * @example
     * ```typescript
     * await bitbybit.occt.io.saveShapeSTEP({ shape: box, fileName: "box.step", adjustYtoZ: true, tryDownload: true });
     * ```
     */
    async saveShapeSTEP(inputs: Inputs.OCCT.SaveStepDto<Inputs.OCCT.TopoDSShapePointer>): Promise<void> {
        const resolved = resolveDto(Inputs.OCCT.SaveStepDto, inputs) as Resolved.OCCT.SaveStepDto<Inputs.OCCT.TopoDSShapePointer>;
        await this.saveShapeSTEPAndReturn(resolved);
    }

    // replaces io.saveShapeSTEP
    async saveShapeSTEPAndReturn(inputs: Inputs.OCCT.SaveStepDto<Inputs.OCCT.TopoDSShapePointer>): Promise<string> {
        const resolved = resolveDto(Inputs.OCCT.SaveStepDto, inputs) as Resolved.OCCT.SaveStepDto<Inputs.OCCT.TopoDSShapePointer>;
        const text = await this.occWorkerManager.genericCallToWorkerPromise<string>("io.saveShapeSTEP", resolved);
        this.downloadStep(text, resolved);
        return text;
    }

    // replaces io.saveShapeStl
    /**
     * Triangulates a shape, writes it as STL, the mesh format 3D printers read, and starts a browser
     * download of the file.
     *
     * `precision` is the meshing tolerance in model units; smaller values follow curved surfaces more
     * closely and make a bigger file. `adjustYtoZ` turns Y-up into Z-up. `fileName` names the
     * download, `tryDownload` false skips it. `saveShapeStlAndReturn` gives the text instead.
     * @param inputs - The shape, the file name, the meshing precision, the axis adjustment and the download options
     * @returns Nothing; the download starts when the file is ready
     * @group io
     * @shortname save stl
     * @drawable false
     * @example
     * ```typescript
     * await bitbybit.occt.io.saveShapeStl({ shape: box, fileName: "box.stl", precision: 0.01, adjustYtoZ: true, tryDownload: true });
     * ```
     */
    async saveShapeStl(inputs: Inputs.OCCT.SaveStlDto<Inputs.OCCT.TopoDSShapePointer>): Promise<void> {
        const resolved = resolveDto(Inputs.OCCT.SaveStlDto, inputs) as Resolved.OCCT.SaveStlDto<Inputs.OCCT.TopoDSShapePointer>;
        await this.saveShapeStlAndReturn(resolved);
    }

    // replaces io.saveShapeStl
    async saveShapeStlAndReturn(inputs: Inputs.OCCT.SaveStlDto<Inputs.OCCT.TopoDSShapePointer>): Promise<string> {
        const resolved = resolveDto(Inputs.OCCT.SaveStlDto, inputs) as Resolved.OCCT.SaveStlDto<Inputs.OCCT.TopoDSShapePointer>;
        const text = await this.occWorkerManager.genericCallToWorkerPromise<string>("io.saveShapeStl", resolved);
        this.downloadStl(text, resolved);
        return text;
    }

    // after io.saveShapeStl
    private downloadStep(text: string, resolved: Resolved.OCCT.SaveStepDto<Inputs.OCCT.TopoDSShapePointer>): void {
        if (resolved.tryDownload && document) {
            const blob = new Blob([text], { type: "text/plain" });
            const blobUrl = URL.createObjectURL(blob);

            let fileName = resolved.fileName;
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
    }

    // after io.saveShapeStl
    private downloadStl(text: string, resolved: Resolved.OCCT.SaveStlDto<Inputs.OCCT.TopoDSShapePointer>): void {
        if (resolved.tryDownload && document) {
            const blob = new Blob([text], { type: "application/stl" });
            const blobUrl = URL.createObjectURL(blob);

            const fileLink = document.createElement("a");
            fileLink.href = blobUrl;
            fileLink.target = "_self";
            fileLink.download = resolved.fileName;
            fileLink.click();
            fileLink.remove();
        }
    }

    // replaces io.dxfCreate
    dxfCreate(inputs: Inputs.OCCT.DxfPathsPartsListDto): Promise<string> {
        const resolved = resolveDto(Inputs.OCCT.DxfPathsPartsListDto, inputs) as Resolved.OCCT.DxfPathsPartsListDto;
        return this.occWorkerManager.genericCallToWorkerPromise<string>("io.dxfCreate", resolved).then(s => {
            if (resolved.tryDownload && document) {
                const blob = new Blob([s], { type: "application/stl" });
                const blobUrl = URL.createObjectURL(blob);

                const fileName = resolved.fileName;

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
        const resolved = resolveDto(Inputs.OCCT.ConvertStepToGltfDto, inputs) as Resolved.OCCT.ConvertStepToGltfDto;
        const stepData = await this.occWorkerManager.prepareStepData(resolved.stepData);
        return this.occWorkerManager.genericCallToWorkerPromise("io.convertStepToGltf", { ...resolved, stepData });
    }

    // replaces io.convertStepToGltfAdvanced
    async convertStepToGltfAdvanced(inputs: Inputs.OCCT.ConvertStepToGltfAdvancedDto): Promise<Uint8Array> {
        const resolved = resolveDto(Inputs.OCCT.ConvertStepToGltfAdvancedDto, inputs) as Resolved.OCCT.ConvertStepToGltfAdvancedDto;
        const stepData = await this.occWorkerManager.prepareStepData(resolved.stepData);
        return this.occWorkerManager.genericCallToWorkerPromise("io.convertStepToGltfAdvanced", { ...resolved, stepData });
    }

    // replaces io.convertStepToGltfWithDraco
    async convertStepToGltfWithDraco(inputs: Inputs.OCCT.ConvertStepToGltfWithDracoDto): Promise<Uint8Array> {
        const resolved = resolveDto(Inputs.OCCT.ConvertStepToGltfWithDracoDto, inputs) as Resolved.OCCT.ConvertStepToGltfWithDracoDto;
        const stepData = await this.occWorkerManager.prepareStepData(resolved.stepData);
        return this.occWorkerManager.genericCallToWorkerPromise("io.convertStepToGltfWithDraco", { ...resolved, stepData });
    }

    // replaces io.convertStepToGltfAdvancedWithDraco
    async convertStepToGltfAdvancedWithDraco(inputs: Inputs.OCCT.ConvertStepToGltfAdvancedWithDracoDto): Promise<Uint8Array> {
        const resolved = resolveDto(Inputs.OCCT.ConvertStepToGltfAdvancedWithDracoDto, inputs) as Resolved.OCCT.ConvertStepToGltfAdvancedWithDracoDto;
        const stepData = await this.occWorkerManager.prepareStepData(resolved.stepData);
        return this.occWorkerManager.genericCallToWorkerPromise("io.convertStepToGltfAdvancedWithDraco", { ...resolved, stepData });
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
