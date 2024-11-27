import { ManifoldBitByBit } from "./manifold-bitbybit";
import { ManifoldWorkerManager } from "../manifold-worker/manifold-worker-manager";

/**
 * This should be used only if you want to use only Manifold worker without other of the bitbybit packages
 */
export class BitByBitManifold {

    public manifoldWorkerManager: ManifoldWorkerManager;
    public manifold: ManifoldBitByBit;

    constructor(
    ) {
        this.manifoldWorkerManager = new ManifoldWorkerManager();
        this.manifold = new ManifoldBitByBit(this.manifoldWorkerManager);
    }

    init(manifold: Worker) {
        if (manifold) {
            this.manifoldWorkerManager.setManifoldWorker(manifold);
        }
    }
}
