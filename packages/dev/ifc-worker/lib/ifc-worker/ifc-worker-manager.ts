import { KernelCallError } from "@bitbybit-dev/base";
import { Subject } from "rxjs";
import type { PendingCall } from "./handler-types";
import type { IFCInfo } from "./ifc-info";
import { IFCStateEnum } from "./ifc-state.enum";
import type { IFCWorkerMock } from "./ifc-worker-mock";
import type { IFCWorkerEvent, IFCWorkerResponse } from "./worker-types";

const READY_CHECK = "isReady";

/**
 * Manages the worker that runs the IFC library: sends each call to it, settles the call's promise
 * with the answer, and reports the worker's state.
 * @beta
 */
export class IFCWorkerManager {
    /**
     * Reports each change of the worker's state.
     */
    ifcWorkerState$: Subject<IFCInfo> = new Subject();
    /**
     * Called with the message of every failed call, when set.
     */
    errorCallback: ((error: string) => void) | undefined;
    private ifcWorker: Worker | IFCWorkerMock | undefined;
    private readonly pending = new Map<string, PendingCall>();
    private calls = 0;
    private started = false;

    /**
     * Whether a worker has been handed to this manager.
     * @returns True once `setIfcWorker` has been called
     */
    ifcWorkerAlreadyInitialised(): boolean {
        return this.ifcWorker !== undefined;
    }

    /**
     * Whether the worker has started and takes calls, which `ifcWorkerState$` reports once as
     * `initialised`.
     * @returns True once the worker has started
     */
    ifcWorkerStarted(): boolean {
        return this.started;
    }

    /**
     * Hands the manager the worker that runs the IFC library. The manager asks the worker whether
     * it has started, so a start announced before this call is not missed.
     * @param worker - The worker, or a stand-in that runs the library on the same thread
     */
    setIfcWorker(worker: Worker | IFCWorkerMock): void {
        this.ifcWorker = worker;
        this.started = false;
        worker.onmessage = ({ data }: IFCWorkerEvent): void => this.receive(data);
        if ("addEventListener" in worker) {
            worker.addEventListener("error", (event) => this.fail(event.message));
        }
        this.ifcWorkerState$.next({ state: IFCStateEnum.loading });
        this.genericCallToWorkerPromise(READY_CHECK, {}).catch(() => undefined);
    }

    /**
     * Forgets every call still waiting for an answer, without settling them.
     */
    cleanPromisesMade(): void {
        this.pending.clear();
    }

    /**
     * Sends one call to the worker and resolves with its answer, or rejects with a
     * `KernelCallError` when it fails. Inputs the worker cannot receive reject at once.
     * @param functionName - The dotted path of the method to call
     * @param inputs - The method's inputs
     * @returns What the method returned, after crossing from the worker
     */
    genericCallToWorkerPromise<T = unknown>(functionName: string, inputs: unknown): Promise<T> {
        this.calls++;
        const uid = `ifc-call-${this.calls}`;
        return new Promise<T>((resolve, reject) => {
            const worker = this.ifcWorker;
            if (!worker) {
                reject(new KernelCallError(`${functionName}: no IFC worker was set up`, functionName, "input"));
                return;
            }
            this.pending.set(uid, { functionName, resolve: (value: unknown) => resolve(value as T), reject });
            try {
                worker.postMessage({ action: { functionName, inputs }, uid });
            } catch (error) {
                this.pending.delete(uid);
                reject(new KernelCallError(`${functionName}: the inputs could not be sent to the worker${error instanceof Error ? `: ${error.message}` : ""}`, functionName, "input"));
                this.reportIdleOrBusy();
            }
        });
    }

    /**
     * Tells the worker a run is starting; await it before the run. The worker drops its whole cache
     * here once it has made more than its threshold of results.
     * @returns Settles when the worker has answered
     */
    startedTheRun(): Promise<void> {
        return this.genericCallToWorkerPromise("startedTheRun", {});
    }

    /**
     * Drops every model and result the worker holds. Every model handle given out before stops
     * resolving.
     * @returns Settles when the worker has answered
     */
    cleanAllCache(): Promise<void> {
        return this.genericCallToWorkerPromise("cleanAllCache", {});
    }

    private markStarted(): void {
        if (!this.started) {
            this.started = true;
            this.ifcWorkerState$.next({ state: IFCStateEnum.initialised });
        }
    }

    private fail(message: string | undefined): void {
        const reason = `The IFC worker failed to run its script${message ? `: ${message}` : ""}`;
        const waiting = [...this.pending.values()];
        this.pending.clear();
        waiting.forEach((call) => call.reject(new KernelCallError(reason, call.functionName, "kernel")));
        this.notifyError(reason);
        this.ifcWorkerState$.next({ state: IFCStateEnum.failed });
    }

    private receive(data: IFCWorkerResponse): void {
        if (data === "ifc-initialised") {
            this.markStarted();
            return;
        }
        if (data === "busy") {
            this.ifcWorkerState$.next({ state: IFCStateEnum.computing });
            return;
        }
        const call = this.pending.get(data.uid);
        this.pending.delete(data.uid);
        if (call?.functionName === READY_CHECK && data.error === undefined) {
            this.markStarted();
        }
        if (data.error !== undefined) {
            this.notifyError(data.error);
            call?.reject(new KernelCallError(data.error, call.functionName, data.errorKind ?? "kernel", data.stack, data.code, data.details));
        } else {
            call?.resolve(data.result);
        }
        this.reportIdleOrBusy();
    }

    private notifyError(error: string): void {
        if (!this.errorCallback) {
            return;
        }
        try {
            this.errorCallback(error);
        } catch (callbackError) {
            console.error("IFC errorCallback threw:", callbackError);
        }
    }

    private reportIdleOrBusy(): void {
        this.ifcWorkerState$.next({ state: this.pending.size ? IFCStateEnum.computing : IFCStateEnum.loaded });
    }
}
