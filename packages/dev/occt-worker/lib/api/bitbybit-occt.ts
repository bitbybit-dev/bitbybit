import { OCCT } from "./occt/occt";
import { OCCTWorkerManager } from "../occ-worker/occ-worker-manager";

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
