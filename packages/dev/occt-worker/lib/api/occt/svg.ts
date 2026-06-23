import { Inputs } from "@bitbybit-dev/occt";
import { OCCTWorkerManager } from "../../occ-worker/occ-worker-manager";

/**
 * SVG importer (worker facade). Parses an SVG document and builds OCCT
 * wires/faces, laid on the ground and aligned per the import options.
 */
export class OCCTSVG {

    constructor(
        readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }

    /**
     * Parses an SVG document and builds a single compound shape containing every drawable element,
     * laid on the ground and aligned per the import options. Use this to draw, extrude or transform
     * the whole drawing as one shape.
     * @param inputs SVG text and import/placement options
     * @group io
     * @shortname load svg
     * @drawable true
     */
    loadSVG(inputs: Inputs.OCCT.LoadSVGDto): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("svg.loadSVG", inputs);
    }

    /**
     * Parses an SVG document and builds an OCCT shape per drawable element, each bundled with its
     * resolved fill/stroke/stroke-width metadata, plus warnings and the SVG view box. Use this when
     * you need per-element shapes and their colours/styles. Faces are optional and best-effort.
     * @param inputs SVG text and import/placement options
     * @group io
     * @shortname load svg structured
     * @drawable false
     */
    loadSVGStructured(inputs: Inputs.OCCT.LoadSVGDto): Promise<Inputs.OCCT.SVGResult<Inputs.OCCT.TopoDSShapePointer>> {
        return this.occWorkerManager.genericCallToWorkerPromise("svg.loadSVGStructured", inputs);
    }
}
