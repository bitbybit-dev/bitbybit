import { Inputs } from "@bitbybit-dev/occt";
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

}
