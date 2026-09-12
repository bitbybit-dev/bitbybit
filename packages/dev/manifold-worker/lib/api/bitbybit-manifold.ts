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

    /**
     * Connects this facade to the web worker that runs the Manifold kernel.
     *
     * Create the worker yourself from the package's worker entry, hand it over here, and wait for the
     * kernel to report that it is loaded before making calls; without a worker every call would hang.
     * @param manifold - The worker running the Manifold kernel
     */
    init(manifold: Worker) {
        if (manifold) {
            this.manifoldWorkerManager.setManifoldWorker(manifold);
        }
    }
}
