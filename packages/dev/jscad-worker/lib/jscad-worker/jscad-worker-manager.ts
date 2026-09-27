import { KernelCallError, KernelFailureKind } from "@bitbybit-dev/base";
import { Subject } from "rxjs";
import { JscadInfo } from "./jscad-info";
import { JscadStateEnum } from "./jscad-state.enum";
import { JSCADWorkerMock } from "./jscad-worker-mock";

type WorkerResponse = "jscad-initialised" | "busy" | { uid: string, result?: unknown, error?: string, errorKind?: KernelFailureKind, code?: string, stack?: string };
type PendingCall = { promise?: Promise<unknown>, uid: string, functionName: string, resolve?: (value: unknown) => void, reject?: (reason?: unknown) => void };

/**
 * This is a manager of JSCAD worker. Promisified API allows to deal with the worker in a more natural way
 * and because all those CAD algorithms are quite heavy this does make a lot of sense at this time.
 */

export class JSCADWorkerManager {

    jscadWorkerState$: Subject<JscadInfo> = new Subject();
    errorCallback!: (err: string) => void;
    private jscadWorker!: Worker | JSCADWorkerMock;
    private promisesMade: PendingCall[] = [];

    jscadWorkerAlreadyInitialised(): boolean {
        return this.jscadWorker ? true : false;
    }

    setJscadWorker(worker: Worker | JSCADWorkerMock): void {
        this.jscadWorker = worker;
        this.jscadWorker.onmessage = ({ data }: { data: WorkerResponse }) => {
            if (data === "jscad-initialised") {
                this.jscadWorkerState$.next({
                    state: JscadStateEnum.initialised,
                });
            } else if (data === "busy") {
                this.jscadWorkerState$.next({
                    state: JscadStateEnum.computing,
                });
            }
            else {
                const promise = this.promisesMade.find(made => made.uid === data.uid);
                if (data.error !== undefined) {
                    if (this.errorCallback) {
                        try {
                            this.errorCallback(data.error);
                        } catch (cbErr) {
                            console.error("JSCAD errorCallback threw:", cbErr);
                        }
                    }
                    if (promise) {
                        promise.reject!(new KernelCallError(data.error, promise.functionName, data.errorKind ?? "kernel", data.stack, data.code));
                    }
                } else if (promise) {
                    promise.resolve!(data.result);
                }
                this.promisesMade = this.promisesMade.filter(i => i.uid !== data.uid);

                if (this.promisesMade.length === 0) {
                    this.jscadWorkerState$.next({
                        state: JscadStateEnum.loaded,
                    });
                } else {
                    this.jscadWorkerState$.next({
                        state: JscadStateEnum.computing,
                    });
                }
            }
        };
    }

    cleanPromisesMade(): void {
        this.promisesMade = [];
    }

    /**
     * The one call across to the worker. `T` is what the worker answers with, and it arrives here by
     * inference from the API method that declares it; a call that declares nothing gets `unknown`
     * and has to say what it expects. Nothing can check the answer - it crossed a postMessage - so
     * the assertion below is where an untyped wire value becomes the caller's declared type, and a
     * wrong `T` is a wrong declaration rather than a cast that failed.
     *
     * Inputs that cannot cross to the worker - a function, an engine material, anything structured
     * clone refuses - reject the call at once with a `KernelCallError` of kind `input`, and the call
     * is not left outstanding.
     */
    genericCallToWorkerPromise<T = unknown>(functionName: string, inputs: unknown): Promise<T> {
        const uid = `call${Math.random()}${Date.now()}`;
        const obj: PendingCall = { uid, functionName };
        const prom = new Promise((resolve, reject) => {
            obj.resolve = resolve;
            obj.reject = reject;
        });
        obj.promise = prom;
        this.promisesMade.push(obj);
        try {
            this.jscadWorker.postMessage({
                action: {
                    functionName, inputs
                },
                uid,
            });
        } catch (error) {
            this.promisesMade = this.promisesMade.filter(i => i.uid !== uid);
            obj.reject!(new KernelCallError(`${functionName}: the inputs could not be sent to the worker${error instanceof Error ? `: ${error.message}` : ""}`, functionName, "input"));
            if (this.promisesMade.length === 0) {
                this.jscadWorkerState$.next({
                    state: JscadStateEnum.loaded,
                });
            }
        }

        return prom as Promise<T>;
    }

    /**
     * Tells the worker a run is starting; await it before the run executes. The worker keeps its cache
     * from one run to the next, and drops all of it here once more than its threshold of 10,000 hashes
     * has been used - the only automatic bound on the kernel memory the cache holds.
     */
    startedTheRun(): Promise<void> {
        return this.genericCallToWorkerPromise("startedTheRun", {});
    }

    /**
     * Drops everything the worker has cached and frees the kernel memory it held. Every reference
     * handed out before stops resolving, so the objects a script still needs have to be made again.
     */
    cleanAllCache(): Promise<void> {
        return this.genericCallToWorkerPromise("cleanAllCache", {});
    }

}
