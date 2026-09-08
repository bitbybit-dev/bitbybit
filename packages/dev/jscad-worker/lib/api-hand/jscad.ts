// Hand-written members of the generated class of the same name (see scripts/gen-worker-api.mjs).
// Each member's marker says where it lands: `// replaces <path>` takes the kernel method's slot (and its doc,
// when the member has none), `// after <path>` follows that slot, `// first` and `// last` frame the class.
import * as Inputs from "@bitbybit-dev/jscad/lib/api/inputs";
import { JSCADWorkerManager } from "../jscad-worker/jscad-worker-manager";

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
        const res = await this.jscadWorkerManager.genericCallToWorkerPromise<{ blob: Blob }>("downloadGeometryDxf", inputs);
        this.downloadFile(res.blob, inputs.fileName, "dxf");
    }

    // replaces downloadGeometry3MF
    async downloadGeometry3MF(inputs: Inputs.JSCAD.DownloadGeometryDto): Promise<void> {
        const res = await this.jscadWorkerManager.genericCallToWorkerPromise<{ blob: Blob }>("downloadGeometry3MF", inputs);
        this.downloadFile(res.blob, inputs.fileName, "3mf");
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
