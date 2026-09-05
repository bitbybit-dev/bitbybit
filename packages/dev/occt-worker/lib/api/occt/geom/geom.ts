
import { OCCTCurves } from "./curves";
import { OCCTSurfaces } from "./surfaces";
import { OCCTWorkerManager } from "../../../occ-worker/occ-worker-manager";

/**
 * The geometric layer beneath the topology: the mathematical curves and surfaces themselves,
 * separate from the edges and faces that carry them. Use it when you need to evaluate a curve at a
 * parameter, ask a surface for its normal, or build geometry that has no topological wrapper yet.
 */
export class OCCTGeom {

    public readonly curves: OCCTCurves;
    public readonly surfaces: OCCTSurfaces;

    constructor(
        occWorkerManager: OCCTWorkerManager
    ) {
        this.curves = new OCCTCurves(occWorkerManager);
        this.surfaces = new OCCTSurfaces(occWorkerManager);
    }

}
