import { JSCAD } from "./jscad";
import { JSCADWorkerManager } from "../jscad-worker/jscad-worker-manager";

/**
 * This should be used only if you want to use only JSCAD worker without other of the bitbybit packages
 */
export class BitByBitJSCAD {

    public jscadWorkerManager: JSCADWorkerManager;
    public jscad: JSCAD;

    constructor(
    ) {
        this.jscadWorkerManager = new JSCADWorkerManager();
        this.jscad = new JSCAD(this.jscadWorkerManager);
    }

    /**
     * Connects this facade to the web worker that runs the JSCAD kernel.
     *
     * Create the worker yourself from the package's worker entry, hand it over here, and wait for the
     * kernel to report that it is loaded before making calls; without a worker every call would hang.
     * @param jscad - The worker running the JSCAD kernel
     */
    init(jscad: Worker) {
        if (jscad) {
            this.jscadWorkerManager.setJscadWorker(jscad);
        }
    }
}
