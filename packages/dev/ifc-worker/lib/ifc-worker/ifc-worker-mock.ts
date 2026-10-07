import { IFCWorkerHandler } from "./ifc-worker";
import type { DataInput, IFCWorkerEvent } from "./worker-types";

/**
 * Runs the IFC library on the same thread, answering through the same messages a web worker would,
 * for tests and for scripts that need no worker. Each mock holds its own models, and every message
 * is copied as a worker's would be, so nothing is shared by reference across the boundary.
 * @beta
 */
export class IFCWorkerMock {
    /**
     * Receives what the library answers.
     */
    onmessage: ((event: IFCWorkerEvent) => void) | null = null;

    private readonly handler = new IFCWorkerHandler();

    /**
     * Starts the library, announcing it unless `doNotPost` is set.
     * @param doNotPost - When true, the start is not announced
     */
    initializationComplete(doNotPost?: boolean): void {
        this.handler.initializationComplete((message) => this.deliver(message), doNotPost);
    }

    /**
     * Sends a call to the library and delivers its answers to `onmessage`.
     * @param data - The call, as a worker receives it
     */
    postMessage(data: DataInput): void {
        this.handler.onMessageInput(structuredClone(data), (message) => this.deliver(message));
    }

    private deliver(message: unknown): void {
        this.onmessage?.({ data: structuredClone(message) as IFCWorkerEvent["data"] });
    }
}
