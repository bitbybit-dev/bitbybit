import type { BitbybitSettings, KernelFailureDetails, KernelFailureKind, KernelSteps } from "@bitbybit-dev/base";
import { InputError, KernelCallError, SettingsRelay } from "@bitbybit-dev/base";
import { Subject } from "rxjs";
import type { OccInfo } from "./occ-info";
import type { DocumentReference, DocumentReferences, MeshRetention } from "./constants";
import { DOCUMENT_REFERENCES } from "./constants";
import { OccStateEnum } from "./occ-state.enum";
import type { OCCTWorkerMock } from "./occ-worker-mock";

type WorkerResponse = "occ-initialised" | "busy" | { progressWords: Int32Array, stepWords?: Int32Array | undefined } | { steps: KernelSteps } | { uid: string, result?: unknown, error?: string, errorKind?: KernelFailureKind, code?: string, details?: KernelFailureDetails, stack?: string };

/** How far the OCCT call running now has got. */
export type OccProgress = {
    /** The dotted path of the call. */
    functionName: string;
    /** How far the algorithm running inside it has got, from 0 to 1. */
    fraction: number;
    /** How many kernel algorithms the call has started so far; each reports from 0 to 1 again. */
    algorithms: number;
    /** For a call that works in steps, such as a design build making its features, how many are done of how many. */
    steps?: KernelSteps;
};

const PROGRESS_INTERVAL_MS = 100;
const STOP_REQUEST_WORD = 0;
const PERMILLE_WORD = 1;
const ALGORITHMS_STARTED_WORD = 2;
const STEPS_DONE_WORD = 0;
const STEPS_TOTAL_WORD = 1;
type PendingCall = { promise?: Promise<unknown>, uid: string, functionName: string, resolve?: (value: unknown) => void, reject?: (reason?: unknown) => void };

/**
 * This is a manager of OpenCascade worker. Promisified API allows to deal with the worker in a more natural
 * way and because all those CAD algorithms are quite heavy this does make a lot of sense at this time.
 */

export class OCCTWorkerManager {

    occWorkerState$: Subject<OccInfo> = new Subject();
    /**
     * The progress of the call running now, read ten times a second while calls are pending, when
     * the worker can share its progress: in a browser, only on a cross-origin isolated page. Without
     * that, only a call that works in steps, such as a design build, reports, as each step is done,
     * with `fraction` and `algorithms` 0.
     */
    occWorkerProgress$: Subject<OccProgress> = new Subject();
    errorCallback!: (err: string) => void;
    private occWorker!: Worker | OCCTWorkerMock;
    private promisesMade: PendingCall[] = [];
    private progressWords: Int32Array | undefined;
    private stepWords: Int32Array | undefined;
    private progressTimer: ReturnType<typeof setInterval> | undefined;
    private lastProgress = "";
    private references: DocumentReferences = "latest";
    private readonly settingsRelay = new SettingsRelay((settings) => this.genericCallToWorkerPromise("setSettings", settings), (reason) => this.settingsRefused(reason));

    /** True when calls can be cancelled and report progress: the worker shared its progress words. */
    canCancel(): boolean {
        return this.progressWords !== undefined;
    }

    /**
     * Asks the OCCT call running now to stop at its next check. It rejects with a `KernelCallError`
     * of kind `cancelled` and keeps nothing it made; calls queued behind it run as usual. Returns
     * false, and changes nothing, when the worker cannot be reached while it computes (see `canCancel`).
     */
    cancelCurrentCall(): boolean {
        if (this.progressWords === undefined || this.promisesMade.length === 0) {
            return false;
        }
        Atomics.store(this.progressWords, STOP_REQUEST_WORD, 1);
        return true;
    }

    /**
     * How every call sent from now on reads a reference to an assembly document. A reference to a
     * version, what a call that changes a document answers, always reads exactly that version. With
     * `latest`, the default, a reference to a document as its creating call answered it reads the
     * version the last change sent under `latest` made of it in the run: a script that changes a
     * document and then exports it, ignoring what the change answered, exports the change, and each
     * run, begun with `startedTheRun`, starts from the documents as they were made. With `exact` that
     * reference reads the document as made, so two branches of a dataflow graph made from one
     * document never see each other's change, and running one branch again gives what running every
     * call again gives. The worker keeps no way of reading of its own: each call carries the one in
     * force when it was sent.
     * @param references - `latest` or `exact`
     */
    setDocumentReferences(references: DocumentReferences): void {
        if (!DOCUMENT_REFERENCES.includes(references)) {
            throw new InputError(`\`references\` is ${JSON.stringify(references)}; it is ${DOCUMENT_REFERENCES.join(" or ")}.`, "references");
        }
        this.references = references;
    }

    /** How the calls sent now read a reference to an assembly document (`setDocumentReferences`). */
    get documentReferences(): DocumentReferences {
        return this.references;
    }

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
        this.progressWords = undefined;
        this.stepWords = undefined;
        this.stopWatchingProgress();
        this.occWorker.onmessage = ({ data }: { data: WorkerResponse }) => {
            if (typeof data === "object" && "steps" in data) {
                const running = this.promisesMade[0];
                if (running !== undefined) {
                    this.occWorkerProgress$.next({ functionName: running.functionName, fraction: 0, algorithms: 0, steps: data.steps });
                }
                return;
            }
            if (typeof data === "object" && "progressWords" in data) {
                this.progressWords = data.progressWords;
                this.stepWords = data.stepWords;
                this.stopWatchingProgress();
                if (this.promisesMade.length > 0) {
                    this.watchProgress();
                }
                return;
            }
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
                if (data.error !== undefined) {
                    if (this.errorCallback) {
                        try {
                            this.errorCallback(data.error);
                        } catch (cbErr) {
                            console.error("OCCT errorCallback threw:", cbErr);
                        }
                    }
                    if (promise) {
                        promise.reject!(new KernelCallError(data.error, promise.functionName, data.errorKind ?? "kernel", data.stack, data.code, data.details));
                    }
                } else if (promise) {
                    promise.resolve!(data.result);
                }
                this.promisesMade = this.promisesMade.filter(i => i.uid !== data.uid);
                if (this.promisesMade.length === 0) {
                    this.stopWatchingProgress();
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
        this.settingsRelay.workerSet();
    }

    cleanPromisesMade(): void {
        this.promisesMade = [];
        this.stopWatchingProgress();
    }

    private watchProgress(): void {
        const words = this.progressWords;
        if (words === undefined || this.progressTimer !== undefined) {
            return;
        }
        this.progressTimer = setInterval(() => this.readProgress(words), PROGRESS_INTERVAL_MS);
    }

    private stopWatchingProgress(): void {
        if (this.progressTimer !== undefined) {
            clearInterval(this.progressTimer);
            this.progressTimer = undefined;
        }
        this.lastProgress = "";
    }

    private readProgress(words: Int32Array): void {
        const running = this.promisesMade[0]!;
        const permille = Atomics.load(words, PERMILLE_WORD);
        const algorithms = Atomics.load(words, ALGORITHMS_STARTED_WORD);
        const total = this.stepWords === undefined ? 0 : Atomics.load(this.stepWords, STEPS_TOTAL_WORD);
        const done = this.stepWords === undefined ? 0 : Math.min(Atomics.load(this.stepWords, STEPS_DONE_WORD), total);
        const key = `${running.uid}:${permille}:${algorithms}:${done}/${total}`;
        if (key !== this.lastProgress) {
            this.lastProgress = key;
            this.occWorkerProgress$.next({ functionName: running.functionName, fraction: permille / 1000, algorithms, ...(total > 0 ? { steps: { done, total } } : {}) });
        }
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
        this.watchProgress();

        try {
            this.occWorker.postMessage({
                action: {
                    functionName,
                    inputs: inputs as Record<string, unknown>,
                },
                uid,
                documentReferences: this.references,
            });
        } catch (error) {
            this.promisesMade = this.promisesMade.filter(i => i.uid !== uid);
            obj.reject!(new KernelCallError(`${functionName}: the inputs could not be sent to the worker${error instanceof Error ? `: ${error.message}` : ""}`, functionName, "input"));
            if (this.promisesMade.length === 0) {
                this.stopWatchingProgress();
                this.occWorkerState$.next({
                    state: OccStateEnum.loaded,
                });
            }
        }

        return prom as Promise<T>;
    }

    /**
     * Tells the worker a run is starting; await it before the run executes. Under `latest`
     * (`setDocumentReferences`) every assembly document is read again as its creating call made it
     * until a change of the run makes a version of it, so a run made again starts from the
     * documents as made, not from what the run before changed. The worker keeps its cache from one
     * run to the next, and drops all of it here once more than its threshold of 10,000 hashes has
     * been used.
     */
    startedTheRun(): Promise<void> {
        return this.genericCallToWorkerPromise("startedTheRun", {});
    }

    /**
     * Frees the kernel objects of document versions the caller no longer holds, as a dataflow graph
     * does once no node's output names them. Each stays answerable: a call that reads one makes it
     * again from the change that made it. A document as its creating call made it is left alone;
     * `deleteDocument` frees that, with every version of it.
     * @param documents - References to the versions, as the changes answered them
     */
    releaseDocumentVersions(documents: readonly DocumentReference[]): Promise<void> {
        return this.genericCallToWorkerPromise("releaseDocumentVersions", { documents: [...documents] });
    }

    /**
     * Drops everything the worker has cached and frees the kernel memory it held. Every reference
     * handed out before stops resolving, so the objects a script still needs have to be made again.
     */
    cleanAllCache(): Promise<void> {
        return this.genericCallToWorkerPromise("cleanAllCache", {});
    }

    /**
     * Sets how many triangles the kernel may keep on the shapes it meshes, so drawing a shape again
     * with the same settings, or drawing a shape that shares faces with one drawn before, reuses
     * their triangulation instead of meshing them anew. With a budget every mesh is kept, and the
     * least recently used faces are freed once the kept triangles exceed it; a mesh made with other
     * settings is never reused. Kept meshes cost about 40 bytes a triangle. 0, the default, keeps
     * nothing and frees what was kept; `cleanAllCache` frees it too.
     * @param triangles - The budget, a whole number of triangles from 0
     * @returns What the kernel keeps after the change
     */
    setMeshRetention(triangles: number): Promise<MeshRetention> {
        return this.genericCallToWorkerPromise("setMeshRetention", { triangles });
    }

    /**
     * Tells the worker the settings the calls made from here work by, such as the coordinate
     * system their numbers are in. Exactly the settings given are in force for every call made
     * after this one: the worker keeps them for every call, a kernel restarted after a crash
     * included, and keeps results made under different settings apart. A setting left out goes
     * back to the behaviour from before it existed; a name that is no setting, or a value it does
     * not take, rejects the call and changes nothing. The call does not wait for the worker, which
     * takes calls in the order they were made and holds those made before its kernel is ready:
     * given before a worker is set, the settings are kept and sent when it is, and a worker set
     * later, in place of another, is told them too. A worker that refuses them all the same, one
     * built before a setting existed, says so through `errorCallback`, or on the console when none
     * is set.
     * @param settings - The settings to work by; an empty object for none
     * @returns The settings now in force
     */
    setSettings(settings: BitbybitSettings): Promise<BitbybitSettings> {
        return this.settingsRelay.set(settings, this.occWorkerAlreadyInitialised());
    }

    private settingsRefused(reason: unknown): void {
        if (!this.errorCallback) {
            console.error("OCCT refused the settings it was sent:", reason);
        }
    }
}
