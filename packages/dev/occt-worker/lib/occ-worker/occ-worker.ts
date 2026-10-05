import type { BitbybitOcctModule } from "@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt";
import { ShapesHelperService, VectorHelperService, OccHelper, OCCTService, occtDtoRegistry, occtDtoRules, readKernelException } from "@bitbybit-dev/occt";
import { describeKernelFailure, prepareKernelCall } from "@bitbybit-dev/base";
import { CacheHelper } from "./cache-helper";
import { WorkerMessages, NON_CACHEABLE_FUNCTIONS } from "./constants";
import { ShapeResolver, ResultSerializer, FunctionPathResolver } from "./shape-resolver";
import type { CommandContext } from "./command-handlers";
import { getCommandHandler } from "./command-handlers";

let kernel: BitbybitOcctModule;
let openCascade: OCCTService;
let cacheHelper: CacheHelper;
let shapeResolver: ShapeResolver;
let resultSerializer: ResultSerializer;
let functionPathResolver: FunctionPathResolver;

const STOP_REQUEST_WORD = 0;
const PROGRESS_WORD_COUNT = 3;

let restartKernel: (() => unknown) | undefined;
let kernelGeneration = 0;
let restarting: Promise<void> | undefined;
let lostKernel: string | undefined;
let meshRetention = 0;
let progressWords: Int32Array | undefined;

function progressWordsOf(occ: BitbybitOcctModule): Int32Array | undefined {
    const control = (occ as Partial<BitbybitOcctModule>).ProgressControl;
    if (typeof SharedArrayBuffer === "undefined" || control === undefined) {
        return undefined;
    }
    const kernelWords = control();
    if (kernelWords.buffer instanceof SharedArrayBuffer) {
        return kernelWords;
    }
    const hostWords = new Int32Array(new SharedArrayBuffer(PROGRESS_WORD_COUNT * Int32Array.BYTES_PER_ELEMENT));
    (occ as BitbybitOcctModule & { bitbybitControl?: Int32Array }).bitbybitControl = hostWords;
    return hostWords;
}

function stopRequested(): boolean {
    return progressWords !== undefined && Atomics.load(progressWords, STOP_REQUEST_WORD) !== 0;
}

class CallStopped extends Error { }

const pendingDependencies: Record<string, unknown> = {};

/**
 * Input structure for worker messages.
 */
export type DataInput = {
    /**
     * Action data containing the function to call and its inputs.
     * The inputs are hashed for caching purposes.
     */
    action: {
        functionName: string;
        inputs: Record<string, unknown>;
    };
    /**
     * Unique identifier used to match responses with their corresponding requests.
     */
    uid: string;
};

/**
 * Initializes the OpenCascade worker with the given module and plugins.
 *
 * A WebAssembly trap in the kernel (an out-of-bounds access, a stack overflow) leaves its memory in
 * an unknown state, so the worker answers that call as a `crash` and never runs the crashed kernel
 * again. Pass `restart` to have the worker start over: it is called once per crash and must end by
 * calling `initializationComplete` again with a new module and new plugins, and calls wait until it
 * has. Without it, every later call is refused.
 *
 * @param occ - The BitbybitOcctModule instance
 * @param plugins - Optional plugins to add to the OpenCascade service (e.g., AdvancedOCCT)
 * @param doNotPost - If true, skip posting the initialization message (used for testing)
 * @param restart - Optional: starts a new kernel after a crash, as the worker's own start-up does
 * @returns The CacheHelper instance for testing purposes
 */

export const initializationComplete = (
    occ: BitbybitOcctModule,
    plugins: any,
    doNotPost?: boolean,
    restart?: () => unknown
): CacheHelper => {
    kernel = occ;
    if (restarting === undefined) {
        meshRetention = 0;
    } else if (meshRetention > 0) {
        occ.SetMeshRetention(meshRetention);
    }
    kernelGeneration++;
    lostKernel = undefined;
    restartKernel = restart;
    cacheHelper = new CacheHelper();

    const vecService = new VectorHelperService();
    const shapesService = new ShapesHelperService();

    openCascade = new OCCTService(occ, new OccHelper(vecService, shapesService, occ));

    shapeResolver = new ShapeResolver(cacheHelper);
    resultSerializer = new ResultSerializer(cacheHelper);
    functionPathResolver = new FunctionPathResolver();

    if (plugins) {
        openCascade.plugins = plugins;
        Object.entries(pendingDependencies).forEach(([key, value]) => {
            plugins.dependencies[key] = value;
        });
    }

    progressWords = progressWordsOf(occ);
    if (!doNotPost && progressWords !== undefined) {
        postMessage({ progressWords });
    }
    if (!doNotPost && restarting === undefined) {
        postMessage(WorkerMessages.INITIALIZED);
    }

    return cacheHelper;
};

function createCommandContext(): CommandContext {
    return {
        openCascade,
        kernel,
        setMeshRetention: (triangles: number) => {
            kernel.SetMeshRetention(triangles);
            meshRetention = triangles;
        },
        cacheHelper,
        shapeResolver,
        addPendingDependency: (key: string, value: unknown) => {
            pendingDependencies[key] = value;
        },
    };
}

const UNREPORTABLE_FAILURE = "OCCT computation failed, and the failure could not be reported.";

function afterCrash(crash: string): string {
    const restart = restartKernel;
    if (restart === undefined) {
        lostKernel = crash;
        return " Every shape made before it is gone; create a new worker to continue, or give initializationComplete a restart function.";
    }
    const generation = kernelGeneration;
    restarting = Promise.resolve()
        .then(restart)
        .then(
            () => {
                if (kernelGeneration === generation) {
                    lostKernel = crash;
                }
            },
            () => {
                lostKernel = crash;
            }
        )
        .finally(() => {
            restarting = undefined;
        });
    return " The kernel is restarting, and every shape made before it is gone.";
}

function executeStandardFunction(
    action: DataInput["action"]
): unknown {
    const call = prepareKernelCall("OCCT", occtDtoRegistry, action.functionName, action.inputs, occtDtoRules);

    const res = cacheHelper.cacheOp({ functionName: action.functionName, inputs: call.inputs }, () => {
        call.reportIssues();
        const computed = functionPathResolver.callFunction(openCascade, action.functionName, shapeResolver.resolveShapeReferences(call.inputs));
        if (stopRequested()) {
            throw new CallStopped();
        }
        return computed;
    });

    return resultSerializer.serializeResult(res);
}

/**
 * Main message handler for the OCCT worker.
 * 
 * Processes incoming messages from the main thread, executes the requested
 * OCCT operations, and sends results back.
 * 
 * @param d - The data input containing the action to perform
 * @param postMessage - Function to send messages back to the main thread
 */
export const onMessageInput = (
    d: DataInput,
    postMessage: (message: unknown) => void
): void => {
    if (restarting !== undefined) {
        void restarting.then(() => onMessageInput(d, postMessage));
        return;
    }
    if (lostKernel !== undefined) {
        postMessage({ uid: d?.uid, result: undefined, error: `OCCT cannot run '${d?.action?.functionName ?? ""}': the kernel crashed earlier and was not restarted (${lostKernel}).`, errorKind: "crash" });
        return;
    }
    postMessage(WorkerMessages.BUSY);
    (kernel as Partial<BitbybitOcctModule> | undefined)?.ProgressBeginCall?.();

    let result: unknown;
    let started = "";

    try {
        const { functionName, inputs } = d.action;
        started = functionName;

        const commandHandler = getCommandHandler(functionName);

        if (commandHandler) {
            const commandResult = commandHandler(inputs, createCommandContext());
            result = commandResult.result;
        } else if (!NON_CACHEABLE_FUNCTIONS.has(functionName)) {
            result = executeStandardFunction(d.action);
        }

        if (stopRequested()) {
            throw new CallStopped();
        }
        postMessage({
            uid: d.uid,
            result,
        });
    } catch (e) {
        const cancelled = (): void => postMessage({ uid: d.uid, result: undefined, error: `OCCT '${started}' was cancelled before it finished; nothing it made was kept.`, errorKind: "cancelled" });
        if (e instanceof CallStopped) {
            cancelled();
            return;
        }
        try {
            const read = readKernelException(kernel, e);
            const failure = describeKernelFailure("OCCT", d.action?.functionName ?? "", d.action?.inputs, read);
            if (failure.kind !== "crash" && started !== "" && stopRequested()) {
                cancelled();
                return;
            }
            const next = read instanceof Error && failure.kind === "crash" ? afterCrash(read.message) : "";
            postMessage({
                uid: d.uid,
                result: undefined,
                error: `${failure.message}${next}`,
                errorKind: failure.kind,
                code: failure.code,
                details: failure.details,
                stack: failure.stack,
            });
        } catch {
            postMessage({ uid: d?.uid, result: undefined, error: UNREPORTABLE_FAILURE, errorKind: "kernel" });
        }
    }
};
