import type { IFCStateEnum } from "./ifc-state.enum";

/**
 * A change of the IFC worker's state, as `IFCWorkerManager.ifcWorkerState$` reports it.
 */
export class IFCInfo {
    /**
     * The worker's new state.
     */
    state!: IFCStateEnum;
}
