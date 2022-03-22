import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { JscadInfo } from './jscad-info';
import { JscadStateEnum } from './jscad-state.enum';

/**
 * This is a manager of JSCAD worker. Promisified API allows to deal with the worker in a more natural way
 * and because all those CAD algorithms are quite heavy this does make a lot of sense at this time.
 */

export class JSCADWorkerManager {

    jscadWorkerState: Subject<JscadInfo> = new Subject();
    errorCallback: (err: string) => void;
    private jscadWorker: Worker;
    private promisesMade: { promise?: Promise<any>, uid: string, resolve?, reject?}[] = [];

    constructor(
    ) {
    }

    jscadWorkerAlreadyInitialised(): boolean {
        return this.jscadWorker ? true : false;
    }

    setJscadWorker(worker: Worker): void {
        this.jscadWorker = worker;
        this.jscadWorker.onmessage = ({ data }) => {
            if (data === 'jscad-initialised') {
                this.jscadWorkerState.next({
                    state: JscadStateEnum.initialised,
                });
            } else if (data === 'busy') {
                this.jscadWorkerState.next({
                    state: JscadStateEnum.computing,
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
                    this.jscadWorkerState.next({
                        state: JscadStateEnum.loaded,
                    });
                } else {
                    this.jscadWorkerState.next({
                        state: JscadStateEnum.computing,
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
        this.jscadWorker.postMessage({
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
