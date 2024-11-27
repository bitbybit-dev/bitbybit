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

    init(jscad: Worker) {
        if (jscad) {
            this.jscadWorkerManager.setJscadWorker(jscad);
        }
    }
}
