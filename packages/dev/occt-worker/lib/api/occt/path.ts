import { Inputs } from "@bitbybit-dev/occt";
import { OCCTWorkerManager } from "../../occ-worker/occ-worker-manager";

/**
 * Generic 2D-path builder (worker facade). Describe a complex path with the
 * line/quadratic/cubic/arc vocabulary and build a wire or face in a single call.
 * SVG-agnostic; also used by the SVG importer.
 */
export class OCCTPath {

    constructor(
        readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }

    /**
     * Builds a single shape (wire, compound of wires, or a face when makeFaces is set) from path subpaths.
     * @param inputs Subpaths described with the line/quadratic/cubic/arc vocabulary plus placement options
     * @group create
     * @shortname shape from path
     * @drawable true
     */
    shapeFromPath(inputs: Inputs.OCCT.ShapeFromPathDto): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("path.shapeFromPath", inputs);
    }
}
