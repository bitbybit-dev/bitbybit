import { Subject } from "rxjs";
import { ManifoldInfo } from "./manifold-info";
import { ManifoldStateEnum } from "./manifold-state.enum";
import { ManifoldWorkerMock } from "./manifold-worker-mock";

type WorkerResponse = "manifold-initialised" | "busy" | { uid: string, result?: unknown, error?: string };
type PendingCall = { promise?: Promise<unknown>, uid: string, resolve?: (value: unknown) => void, reject?: (reason?: unknown) => void };

/**
 * This is a manager of Manifold worker. Promisified API allows to deal with the worker in a more natural
 * way and because all those CAD algorithms are quite heavy this does make a lot of sense at this time.
 */
export class ManifoldWorkerManager {

    manifoldWorkerState$: Subject<ManifoldInfo> = new Subject();
    errorCallback!: (err: string) => void;
    private manifoldWorker!: Worker | ManifoldWorkerMock;
    private promisesMade: PendingCall[] = [];

    manifoldWorkerAlreadyInitialised(): boolean {
        return this.manifoldWorker ? true : false;
    }

    setManifoldWorker(worker: Worker | ManifoldWorkerMock): void {
        this.manifoldWorker = worker;
        this.manifoldWorker.onmessage = ({ data }: { data: WorkerResponse }) => {
            if (data === "manifold-initialised") {
                this.manifoldWorkerState$.next({
                    state: ManifoldStateEnum.initialised,
                });
            } else if (data === "busy") {
                this.manifoldWorkerState$.next({
                    state: ManifoldStateEnum.computing,
                });
            }
            else {
                const promise = this.promisesMade.find(made => made.uid === data.uid);
                if (promise && data.result !== undefined && !data.error) {
                    promise.resolve!(data.result);
                } else if (data.error) {
                    if (this.errorCallback) {
                        this.errorCallback(data.error);
                    }
                    if (promise) {
                        promise.reject!(data.error);
                    }
                }
                this.promisesMade = this.promisesMade.filter(i => i.uid !== data.uid);

                if (this.promisesMade.length === 0) {
                    this.manifoldWorkerState$.next({
                        state: ManifoldStateEnum.loaded,
                    });
                } else {
                    this.manifoldWorkerState$.next({
                        state: ManifoldStateEnum.computing,
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
        this.manifoldWorker.postMessage({
            action: {
                functionName, inputs
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
