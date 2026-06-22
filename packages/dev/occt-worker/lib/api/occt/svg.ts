import { Inputs } from "@bitbybit-dev/occt";
import { OCCTWorkerManager } from "../../occ-worker/occ-worker-manager";

/**
 * SVG importer (worker facade). Parses an SVG document and builds OCCT
 * wires/faces for each drawable element, returning shape references bundled
 * with their resolved colour/stroke metadata.
 */
export class OCCTSVG {

    constructor(
        readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }

    /**
     * Parses an SVG document and builds an OCCT shape per drawable element, each bundled with its
     * resolved fill/stroke/stroke-width metadata. Faces are optional and best-effort.
     * @param inputs SVG text and import/placement options
     * @group io
     * @shortname load svg
     * @drawable false
     */
    loadSVG(inputs: Inputs.OCCT.LoadSVGDto): Promise<Inputs.OCCT.SVGResult<Inputs.OCCT.TopoDSShapePointer>> {
        return this.occWorkerManager.genericCallToWorkerPromise("svg.loadSVG", inputs);
    }
}
