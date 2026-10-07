import { IFCBitByBit } from "./ifc-bitbybit";
import { IFCWorkerManager } from "../ifc-worker/ifc-worker-manager";
import type { IFCWorkerMock } from "../ifc-worker/ifc-worker-mock";

/**
 * The IFC library behind a web worker, for use on its own without the other bitbybit packages:
 * `ifc` holds every method, each answering with a promise. Experimental, as the IFC library is.
 * @beta
 */
export class BitByBitIFC {

    /**
     * Sends the calls to the worker and reports its state.
     */
    public ifcWorkerManager: IFCWorkerManager;
    /**
     * Every method of the IFC library, each answering with a promise.
     */
    public ifc: IFCBitByBit;

    constructor() {
        this.ifcWorkerManager = new IFCWorkerManager();
        this.ifc = new IFCBitByBit(this.ifcWorkerManager);
    }

    /**
     * Hands over the web worker that runs the IFC library.
     *
     * Create the worker from a script that calls the package's `initializationComplete` and passes
     * every message to `onMessageInput`, hand it over here, and wait for it to report that it has
     * started before making calls. An `IFCWorkerMock` runs the library on the same thread instead.
     * @param worker - The worker running the IFC library, or a stand-in on the same thread
     */
    init(worker: Worker | IFCWorkerMock): void {
        this.ifcWorkerManager.setIfcWorker(worker);
    }
}
