import { OCCT } from "./occt/occt";
import { OCCTWorkerManager } from "../occ-worker/occ-worker-manager";

/**
 * The entry point to the OpenCascade kernel, gathering the shape, geometry, boolean, fillet,
 * operation, transform, assembly, dimension and IO groups. Every call is asynchronous because the
 * kernel runs as WebAssembly, usually in a worker, so the main thread stays responsive while a
 * heavy boolean runs.
 */
export class BitByBitOCCT {

    public occtWorkerManager: OCCTWorkerManager;
    public occt: OCCT;

    constructor(
    ) {
        this.occtWorkerManager = new OCCTWorkerManager();
        this.occt = new OCCT(this.occtWorkerManager);
    }

    init(occt: Worker) {
        if (occt) {
            this.occtWorkerManager.setOccWorker(occt);
        }
    }
}
