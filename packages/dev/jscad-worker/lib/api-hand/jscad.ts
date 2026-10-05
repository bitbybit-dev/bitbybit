import * as Inputs from "@bitbybit-dev/jscad/lib/api/inputs";
import type * as Resolved from "@bitbybit-dev/jscad/lib/api/resolved-inputs";
import { resolveDto } from "@bitbybit-dev/base";
import type { JSCADWorkerManager } from "../jscad-worker/jscad-worker-manager";

export class JSCAD {
    constructor(private readonly jscadWorkerManager: JSCADWorkerManager) { }

    // replaces downloadSolidSTL
    async downloadSolidSTL(inputs: Inputs.JSCAD.DownloadSolidDto): Promise<void> {
        const res = await this.jscadWorkerManager.genericCallToWorkerPromise<{ blob: Blob }>("downloadSolidSTL", inputs);
        this.downloadFile(res.blob, inputs.fileName, "stl");
    }

    // replaces downloadSolidsSTL
    async downloadSolidsSTL(inputs: Inputs.JSCAD.DownloadSolidsDto): Promise<void> {
        const res = await this.jscadWorkerManager.genericCallToWorkerPromise<{ blob: Blob }>("downloadSolidsSTL", inputs);
        this.downloadFile(res.blob, inputs.fileName, "stl");
    }

    // replaces downloadGeometryDxf
    async downloadGeometryDxf(inputs: Inputs.JSCAD.DownloadGeometryDto): Promise<void> {
        const resolved = resolveDto(Inputs.JSCAD.DownloadGeometryDto, inputs) as Resolved.JSCAD.DownloadGeometryDto;
        const res = await this.jscadWorkerManager.genericCallToWorkerPromise<{ blob: Blob }>("downloadGeometryDxf", resolved);
        this.downloadFile(res.blob, resolved.fileName, "dxf");
    }

    // replaces downloadGeometry3MF
    async downloadGeometry3MF(inputs: Inputs.JSCAD.DownloadGeometryDto): Promise<void> {
        const resolved = resolveDto(Inputs.JSCAD.DownloadGeometryDto, inputs) as Resolved.JSCAD.DownloadGeometryDto;
        const res = await this.jscadWorkerManager.genericCallToWorkerPromise<{ blob: Blob }>("downloadGeometry3MF", resolved);
        this.downloadFile(res.blob, resolved.fileName, "3mf");
    }

    // after downloadGeometry3MF
    private downloadFile(blob: Blob, fileName: string, extension: string): void {
        const blobUrl = URL.createObjectURL(blob);

        const fileLink = document.createElement("a");
        fileLink.href = blobUrl;
        fileLink.target = "_self";
        fileLink.download = fileName + "." + extension;
        fileLink.click();
        fileLink.remove();
    }
}
