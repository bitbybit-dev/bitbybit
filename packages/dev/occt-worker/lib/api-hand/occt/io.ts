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
     * `precision` is the meshing tolerance in model units, `adjustYtoZ` turns Y-up into Z-up and
     * `binary` writes the smaller binary form. `fileName` names the download, `tryDownload` false
     * skips it. `saveShapeStlAndReturn` gives the file instead.
     * @param inputs - The shape, the file name, the meshing precision, the axis adjustment, the form and the download options
     * @returns Nothing; the download starts when the file is ready
     * @group io
     * @shortname save stl
     * @drawable false
     * @example
     * ```typescript
     * await bitbybit.occt.io.saveShapeStl({ shape: box, fileName: "box.stl", precision: 0.01, adjustYtoZ: true, tryDownload: true, binary: true });
     * ```
     */
    async saveShapeStl(inputs: Inputs.OCCT.SaveStlDto<Inputs.OCCT.TopoDSShapePointer>): Promise<void> {
        const resolved = resolveDto(Inputs.OCCT.SaveStlDto, inputs) as Resolved.OCCT.SaveStlDto<Inputs.OCCT.TopoDSShapePointer>;
        await this.saveShapeStlAndReturn(resolved);
    }

    // replaces io.saveShapeStl
    async saveShapeStlAndReturn(inputs: Inputs.OCCT.SaveStlDto<Inputs.OCCT.TopoDSShapePointer>): Promise<string | Uint8Array> {
        const resolved = resolveDto(Inputs.OCCT.SaveStlDto, inputs) as Resolved.OCCT.SaveStlDto<Inputs.OCCT.TopoDSShapePointer>;
        const stl = await this.occWorkerManager.genericCallToWorkerPromise<string | Uint8Array>("io.saveShapeStl", resolved);
        this.downloadStl(stl, resolved);
        return stl;
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
    private downloadStl(stl: string | Uint8Array, resolved: Resolved.OCCT.SaveStlDto<Inputs.OCCT.TopoDSShapePointer>): void {
        if (resolved.tryDownload) {
            this.downloadFile(stl, resolved.fileName, "application/stl");
        }
    }

    // replaces io.saveShapeBrep
    /**
     * Writes a shape as BREP, the text format that keeps its exact geometry and topology, and starts
     * a browser download of the file.
     *
     * `io.loadBrep` reads the file back into the same shape. `fileName` names the download and
     * `tryDownload` false skips it; `saveShapeBrepAndReturn` gives the text instead.
     * @param inputs - The shape, the file name and the download option
     * @returns Nothing; the download starts when the file is ready
     * @group io
     * @shortname save brep
     * @drawable false
     * @example
     * ```typescript
     * await bitbybit.occt.io.saveShapeBrep({ shape: box, fileName: "box.brep", tryDownload: true });
     * ```
     */
    async saveShapeBrep(inputs: Inputs.OCCT.SaveBrepDto<Inputs.OCCT.TopoDSShapePointer>): Promise<void> {
        const resolved = resolveDto(Inputs.OCCT.SaveBrepDto, inputs) as Resolved.OCCT.SaveBrepDto<Inputs.OCCT.TopoDSShapePointer>;
        await this.saveShapeBrepAndReturn(resolved);
    }

    // replaces io.saveShapeBrep
    async saveShapeBrepAndReturn(inputs: Inputs.OCCT.SaveBrepDto<Inputs.OCCT.TopoDSShapePointer>): Promise<string> {
        const resolved = resolveDto(Inputs.OCCT.SaveBrepDto, inputs) as Resolved.OCCT.SaveBrepDto<Inputs.OCCT.TopoDSShapePointer>;
        const text = await this.occWorkerManager.genericCallToWorkerPromise<string>("io.saveShapeBrep", resolved);
        if (resolved.tryDownload) {
            this.downloadFile(text, resolved.fileName, "text/plain");
        }
        return text;
    }

    // replaces io.saveShapeBrepBinary
    /**
     * Writes a shape as binary BREP, the exact geometry and topology `saveShapeBrep` writes as text,
     * in bytes, and starts a browser download of the file.
     *
     * `io.loadBrepBinary` reads the file back into the same shape. `fileName` names the download and
     * `tryDownload` false skips it; `saveShapeBrepBinaryAndReturn` gives the bytes instead.
     * @param inputs - The shape, the file name, the download option and whether to keep the mesh
     * @returns Nothing; the download starts when the file is ready
     * @group io
     * @shortname save brep binary
     * @drawable false
     * @example
     * ```typescript
     * await bitbybit.occt.io.saveShapeBrepBinary({ shape: box, fileName: "box.bbrep", tryDownload: true, withTriangulation: false });
     * ```
     */
    async saveShapeBrepBinary(inputs: Inputs.OCCT.SaveBrepBinaryDto<Inputs.OCCT.TopoDSShapePointer>): Promise<void> {
        const resolved = resolveDto(Inputs.OCCT.SaveBrepBinaryDto, inputs) as Resolved.OCCT.SaveBrepBinaryDto<Inputs.OCCT.TopoDSShapePointer>;
        await this.saveShapeBrepBinaryAndReturn(resolved);
    }

    // replaces io.saveShapeBrepBinary
    async saveShapeBrepBinaryAndReturn(inputs: Inputs.OCCT.SaveBrepBinaryDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Uint8Array> {
        const resolved = resolveDto(Inputs.OCCT.SaveBrepBinaryDto, inputs) as Resolved.OCCT.SaveBrepBinaryDto<Inputs.OCCT.TopoDSShapePointer>;
        const bytes = await this.occWorkerManager.genericCallToWorkerPromise<Uint8Array>("io.saveShapeBrepBinary", resolved);
        if (resolved.tryDownload) {
            this.downloadFile(bytes, resolved.fileName, "application/octet-stream");
        }
        return bytes;
    }

    // replaces io.saveShapeObj
    /**
     * Triangulates a shape, writes it as OBJ, the mesh format most 3D programs read, and starts a
     * browser download of the file.
     *
     * `precision` is the meshing tolerance in model units and `adjustYtoZ` turns Y-up into Z-up. The
     * file name may hold no spaces or slashes; `tryDownload` false skips the download, and
     * `saveShapeObjAndReturn` gives the text instead.
     * @param inputs - The shape, the file name, the meshing precision, the axis adjustment and the download option
     * @returns Nothing; the download starts when the file is ready
     * @group io
     * @shortname save obj
     * @drawable false
     * @example
     * ```typescript
     * await bitbybit.occt.io.saveShapeObj({ shape: box, fileName: "box.obj", precision: 0.01, adjustYtoZ: false, tryDownload: true });
     * ```
     */
    async saveShapeObj(inputs: Inputs.OCCT.SaveObjDto<Inputs.OCCT.TopoDSShapePointer>): Promise<void> {
        const resolved = resolveDto(Inputs.OCCT.SaveObjDto, inputs) as Resolved.OCCT.SaveObjDto<Inputs.OCCT.TopoDSShapePointer>;
        await this.saveShapeObjAndReturn(resolved);
    }

    // replaces io.saveShapeObj
    async saveShapeObjAndReturn(inputs: Inputs.OCCT.SaveObjDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Models.OCCT.ObjFiles> {
        const resolved = resolveDto(Inputs.OCCT.SaveObjDto, inputs) as Resolved.OCCT.SaveObjDto<Inputs.OCCT.TopoDSShapePointer>;
        const files = await this.occWorkerManager.genericCallToWorkerPromise<Models.OCCT.ObjFiles>("io.saveShapeObj", resolved);
        if (resolved.tryDownload) {
            this.downloadObj(files, resolved.fileName);
        }
        return files;
    }

    // replaces io.saveShapePly
    /**
     * Triangulates a shape, writes it as ASCII PLY with a normal per vertex, and starts a browser
     * download of the file.
     *
     * `precision` is the meshing tolerance in model units and `adjustYtoZ` turns Y-up into Z-up.
     * `fileName` names the download and `tryDownload` false skips it; `saveShapePlyAndReturn` gives
     * the text instead.
     * @param inputs - The shape, the file name, the meshing precision, the axis adjustment and the download option
     * @returns Nothing; the download starts when the file is ready
     * @group io
     * @shortname save ply
     * @drawable false
     * @example
     * ```typescript
     * await bitbybit.occt.io.saveShapePly({ shape: box, fileName: "box.ply", precision: 0.01, adjustYtoZ: false, tryDownload: true });
     * ```
     */
    async saveShapePly(inputs: Inputs.OCCT.SavePlyDto<Inputs.OCCT.TopoDSShapePointer>): Promise<void> {
        const resolved = resolveDto(Inputs.OCCT.SavePlyDto, inputs) as Resolved.OCCT.SavePlyDto<Inputs.OCCT.TopoDSShapePointer>;
        await this.saveShapePlyAndReturn(resolved);
    }

    // replaces io.saveShapePly
    async saveShapePlyAndReturn(inputs: Inputs.OCCT.SavePlyDto<Inputs.OCCT.TopoDSShapePointer>): Promise<string> {
        const resolved = resolveDto(Inputs.OCCT.SavePlyDto, inputs) as Resolved.OCCT.SavePlyDto<Inputs.OCCT.TopoDSShapePointer>;
        const text = await this.occWorkerManager.genericCallToWorkerPromise<string>("io.saveShapePly", resolved);
        if (resolved.tryDownload) {
            this.downloadFile(text, resolved.fileName, "text/plain");
        }
        return text;
    }

    // replaces io.saveShapeSvg
    /**
     * Draws the edges a view of a shape sees as an SVG drawing, with the hidden edges dashed when
     * asked, and starts a browser download of the file.
     *
     * The drawing shows the view from the frame's normal side, x running right along its direction.
     * `tryDownload` false skips the download; `saveShapeSvgAndReturn` gives the text instead.
     * @param inputs - The shape, the view, whether to draw hidden edges, the precision and the download options
     * @returns Nothing; the download starts when the file is ready
     * @group io
     * @shortname save svg
     * @drawable false
     * @example
     * ```typescript
     * const view = { origin: [0, 0, 0], normal: [0, 1, 0], direction: [1, 0, 0] };
     * await bitbybit.occt.io.saveShapeSvg({ shape: part, frame: view, drawHidden: true, precision: 0.01, fileName: "top.svg", tryDownload: true });
     * ```
     */
    async saveShapeSvg(inputs: Inputs.OCCT.SaveSvgDto<Inputs.OCCT.TopoDSShapePointer>): Promise<void> {
        const resolved = resolveDto(Inputs.OCCT.SaveSvgDto, inputs) as Resolved.OCCT.SaveSvgDto<Inputs.OCCT.TopoDSShapePointer>;
        await this.saveShapeSvgAndReturn(resolved);
    }

    // replaces io.saveShapeSvg
    async saveShapeSvgAndReturn(inputs: Inputs.OCCT.SaveSvgDto<Inputs.OCCT.TopoDSShapePointer>): Promise<string> {
        const resolved = resolveDto(Inputs.OCCT.SaveSvgDto, inputs) as Resolved.OCCT.SaveSvgDto<Inputs.OCCT.TopoDSShapePointer>;
        const text = await this.occWorkerManager.genericCallToWorkerPromise<string>("io.saveShapeSvg", resolved);
        if (resolved.tryDownload) {
            this.downloadFile(text, resolved.fileName, "image/svg+xml");
        }
        return text;
    }

    // after io.saveShapeSvg
    private downloadObj(files: Models.OCCT.ObjFiles, fileName: string): void {
        this.downloadFile(files.obj, fileName, "model/obj");
        const library = /^mtllib (.+)$/m.exec(files.obj)?.[1]?.trim();
        if (library !== undefined && files.mtl !== "") {
            this.downloadFile(files.mtl, library, "model/mtl");
        }
    }

    // after io.saveShapeSvg
    private downloadFile(content: string | Uint8Array, fileName: string, type: string): void {
        if (typeof document === "undefined") {
            return;
        }
        const blob = new Blob([typeof content === "string" ? content : content.slice()], { type });
        const fileLink = document.createElement("a");
        fileLink.href = URL.createObjectURL(blob);
        fileLink.target = "_self";
        fileLink.download = fileName;
        fileLink.click();
        fileLink.remove();
    }

    // replaces io.loadStl
    async loadStl(inputs: Inputs.OCCT.LoadStlDto): Promise<Inputs.OCCT.TopoDSShapePointer> {
        const resolved = resolveDto(Inputs.OCCT.LoadStlDto, inputs) as Resolved.OCCT.LoadStlDto;
        const stlData = await this.occWorkerManager.prepareStepData(resolved.stlData);
        return this.occWorkerManager.genericCallToWorkerPromise("io.loadStl", { ...resolved, stlData });
    }

    // replaces io.loadBrep
    async loadBrep(inputs: Inputs.OCCT.LoadBrepDto): Promise<Inputs.OCCT.TopoDSShapePointer> {
        const brepData = await this.occWorkerManager.prepareStepData(inputs.brepData);
        return this.occWorkerManager.genericCallToWorkerPromise("io.loadBrep", { ...inputs, brepData });
    }

    // replaces io.loadBrepBinary
    async loadBrepBinary(inputs: Inputs.OCCT.LoadBrepBinaryDto): Promise<Inputs.OCCT.TopoDSShapePointer> {
        const brepData = await this.occWorkerManager.prepareStepData(inputs.brepData);
        return this.occWorkerManager.genericCallToWorkerPromise("io.loadBrepBinary", { ...inputs, brepData });
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
