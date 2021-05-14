import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { OccInfo } from './occ-info';
import { OccStateEnum } from './occ-state.enum';

/**
 * This is a manager of OpenCascade worker. Promisified API allows to deal with the worker in a more natural way
 * and because all those CAD algorithms are quite heavy this does make a lot of sense at this time.
 */
@Injectable()
export class OCCTWorkerManager {

    occWorkerState: Subject<OccInfo> = new Subject();
    errorCallback: (err: string) => void;
    private occWorker: Worker;
    private promisesMade: { promise?: Promise<any>, uid: string, resolve?, reject?}[] = [];

    constructor(
    ) {
    }

    occWorkerAlreadyInitialised(): boolean {
        return this.occWorker ? true : false;
    }

    setOccWorker(worker: Worker): void {
        this.occWorker = worker;
        this.occWorker.onmessage = ({ data }) => {
            if (data === 'occ initialised') {
                this.occWorkerState.next({
                    state: OccStateEnum.loaded,
                });
            } else if (data === 'busy') {
                this.occWorkerState.next({
                    state: OccStateEnum.computing,
                });
            }
            else {
                const promise = this.promisesMade.find(made => made.uid === data.uid);
                if (promise && data.result && !data.error) {
                    promise.resolve(data.result);
                } else if (data.error) {
                    if (this.errorCallback) {
                        this.errorCallback(data.error);
                    }
                    promise.reject(data.error);
                }
                this.promisesMade = this.promisesMade.filter(i => i.uid !== data.uid);

                if (this.promisesMade.length === 0) {
                    this.occWorkerState.next({
                        state: OccStateEnum.loaded,
                    });
                } else {
                    this.occWorkerState.next({
                        state: OccStateEnum.computing,
                    });
                }
            }
        };
    }

    cleanPromisesMade(): void {
        this.promisesMade = [];
    }

    genericCallToWorkerPromise(functionName: string, inputs: any): Promise<any> {
        const uid = `call${Math.random()}${Date.now()}`;
        const obj: { promise?: Promise<any>, uid: string, resolve?, reject?} = { uid };
        const prom = new Promise((resolve, reject) => {
            obj.resolve = resolve;
            obj.reject = reject;
        });
        obj.promise = prom;
        this.promisesMade.push(obj);

        this.occWorker.postMessage({
            action: {
                functionName, inputs
            },
            uid,
        });

        return prom;
    }

    /**
     * This needs to be done before every run and the promise needs to be awaited before run executes again
     * This makes sure that cache keeps the objects and hashes from the previous run and the rest is deleted
     * In this way it is possible to hace the cache of manageable size
     */
    startedTheRun(): Promise<any> {
        return this.genericCallToWorkerPromise('startedTheRun', {});
    }

    /**
     * This needs to be done before every run and the promise needs to be awaited before run executes again
     * This makes sure that cache keeps the objects and hashes from the previous run and the rest is deleted
     * In this way it is possible to hace the cache of manageable size
     */
    cleanAllCache(): Promise<any> {
        return this.genericCallToWorkerPromise('cleanAllCache', {});
    }
}
