import { Subject } from "rxjs";
import { OccInfo } from "./occ-info";
import { OccStateEnum } from "./occ-state.enum";
import { OCCTWorkerMock } from "./occ-worker-mock";

type WorkerResponse = "occ-initialised" | "busy" | { uid: string, result?: unknown, error?: string };
type PendingCall = { promise?: Promise<unknown>, uid: string, resolve?: (value: unknown) => void, reject?: (reason?: unknown) => void };

/**
 * This is a manager of OpenCascade worker. Promisified API allows to deal with the worker in a more natural
 * way and because all those CAD algorithms are quite heavy this does make a lot of sense at this time.
 */

export class OCCTWorkerManager {

    occWorkerState$: Subject<OccInfo> = new Subject();
    errorCallback!: (err: string) => void;
    private occWorker!: Worker | OCCTWorkerMock;
    private promisesMade: PendingCall[] = [];

    occWorkerAlreadyInitialised(): boolean {
        return this.occWorker ? true : false;
    }

    /**
     * Convert File/Blob to Uint8Array if needed, before sending to worker.
     * File/Blob objects cannot be cloned for postMessage, so we convert them first.
     * ArrayBuffer is also converted to Uint8Array for WASM compatibility.
     */
    async prepareStepData(data: string | ArrayBuffer | Uint8Array | File | Blob): Promise<string | Uint8Array> {
        if (typeof File !== "undefined" && data instanceof File) {
            return new Uint8Array(await data.arrayBuffer());
        }
        if (typeof Blob !== "undefined" && data instanceof Blob) {
            return new Uint8Array(await data.arrayBuffer());
        }
        if (data instanceof ArrayBuffer) {
            return new Uint8Array(data);
        }
        return data as string | Uint8Array;
    }

    setOccWorker(worker: Worker | OCCTWorkerMock): void {
        this.occWorker = worker;
        this.occWorker.onmessage = ({ data }: { data: WorkerResponse }) => {
            if (data === "occ-initialised") {
                this.occWorkerState$.next({
                    state: OccStateEnum.initialised,
                });
            } else if (data === "busy") {
                this.occWorkerState$.next({
                    state: OccStateEnum.computing,
                });
            }
            else {
                const promise = this.promisesMade.find(made => made.uid === data.uid);
                if (promise && data.result !== undefined && !data.error) {
                    promise.resolve!(data.result);
                } else if (data.error) {
                    if (this.errorCallback) {
                        try {
                            this.errorCallback(data.error);
                        } catch (cbErr) {
                            console.error("OCCT errorCallback threw:", cbErr);
                        }
                    }
                    if (promise) {
                        promise.reject!(data.error);
                    }
                }
                this.promisesMade = this.promisesMade.filter(i => i.uid !== data.uid);
                if (this.promisesMade.length === 0) {
                    this.occWorkerState$.next({
                        state: OccStateEnum.loaded,
                    });
                } else {
                    this.occWorkerState$.next({
                        state: OccStateEnum.computing,
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
     */
    genericCallToWorkerPromise<T = unknown>(functionName: string, inputs: unknown): Promise<T> {
        const uid = `call${Math.random()}${Date.now()}`;
        const obj: PendingCall = { uid };
        const prom = new Promise((resolve, reject) => {
            obj.resolve = resolve;
            obj.reject = reject;
        });
        obj.promise = prom;
        this.promisesMade.push(obj);

        this.occWorker.postMessage({
            action: {
                functionName,
                inputs: inputs as Record<string, unknown>,
            },
            uid,
        });

        return prom as Promise<T>;
    }

    /**
     * This needs to be done before every run and the promise needs to be awaited before run executes again
     * This makes sure that cache keeps the objects and hashes from the previous run and the rest is deleted
     * In this way it is possible to hace the cache of manageable size
     */
    startedTheRun(): Promise<void> {
        return this.genericCallToWorkerPromise("startedTheRun", {});
    }

    /**
     * This needs to be done before every run and the promise needs to be awaited before run executes again
     * This makes sure that cache keeps the objects and hashes from the previous run and the rest is deleted
     * In this way it is possible to hace the cache of manageable size
     */
    cleanAllCache(): Promise<void> {
        return this.genericCallToWorkerPromise("cleanAllCache", {});
    }
}
