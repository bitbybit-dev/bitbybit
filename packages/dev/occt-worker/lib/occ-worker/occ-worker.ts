import type { BitbybitOcctModule } from "@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt";
import { ShapesHelperService, VectorHelperService, OccHelper, OCCTService, occtDtoRegistry, occtDtoRules, readKernelException } from "@bitbybit-dev/occt";
import { describeKernelFailure, prepareKernelCall } from "@bitbybit-dev/base";
import { CacheHelper } from "./cache-helper";
import { WorkerMessages, NON_CACHEABLE_FUNCTIONS } from "./constants";
import { ShapeResolver, ResultSerializer, FunctionPathResolver } from "./shape-resolver";
import { getCommandHandler, CommandContext } from "./command-handlers";

let kernel: BitbybitOcctModule;
let openCascade: OCCTService;
let cacheHelper: CacheHelper;
let shapeResolver: ShapeResolver;
let resultSerializer: ResultSerializer;
let functionPathResolver: FunctionPathResolver;

/** Starts the worker again after the kernel crashed, by calling initializationComplete anew. */
let restartKernel: (() => unknown) | undefined;
/** Counts the kernels the worker has been given, so a restart can tell whether one arrived. */
let kernelGeneration = 0;
/** Set while a crashed kernel is being replaced; calls wait for it. */
let restarting: Promise<void> | undefined;
/** What crashed the kernel, when it was not replaced; every later call is refused. */
let lostKernel: string | undefined;
/**
 * The kernel's three progress words, shared with the manager: word 0 asks the running call to stop,
 * word 1 is its progress in thousandths, word 2 counts the algorithms it started. Undefined where
 * memory cannot be shared (a page that is not cross-origin isolated) or the kernel predates them.
 */
let progressWords: Int32Array | undefined;

/**
 * The words the kernel reports progress in and reads a stop request from, over memory the manager
 * can share: the multithreaded kernel's own memory, or for the other kernels a SharedArrayBuffer
 * handed to the module, which the kernel keeps in step with its own words.
 */
function progressWordsOf(occ: BitbybitOcctModule): Int32Array | undefined {
    const control = (occ as Partial<BitbybitOcctModule>).ProgressControl;
    if (typeof SharedArrayBuffer === "undefined" || control === undefined) {
        return undefined;
    }
    const kernelWords = control();
    if (kernelWords.buffer instanceof SharedArrayBuffer) {
        return kernelWords;
    }
    const hostWords = new Int32Array(new SharedArrayBuffer(3 * Int32Array.BYTES_PER_ELEMENT));
    (occ as BitbybitOcctModule & { bitbybitControl?: Int32Array }).bitbybitControl = hostWords;
    return hostWords;
}

/** True when the manager asked the running call to stop. */
function stopRequested(): boolean {
    return progressWords !== undefined && Atomics.load(progressWords, 0) !== 0;
}

/** Thrown inside a call the manager stopped, so nothing it made is cached. */
class CallStopped extends Error { }

/**
 * Pending dependencies that need to be added to plugins once OpenCascade is initialized.
 * This handles the case where addOc is called before full initialization.
 */
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
    kernelGeneration++;
    lostKernel = undefined;
    restartKernel = restart;
    cacheHelper = new CacheHelper(occ);

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

/**
 * Creates the command context for command handlers.
 */
function createCommandContext(): CommandContext {
    return {
        openCascade,
        cacheHelper,
        shapeResolver,
        addPendingDependency: (key: string, value: unknown) => {
            pendingDependencies[key] = value;
        },
    };
}

/** What the worker answers when a call failed and even its failure could not be sent back. */
const UNREPORTABLE_FAILURE = "OCCT computation failed, and the failure could not be reported.";

/**
 * Stops running the crashed kernel: starts it over when the worker can, or remembers the crash so
 * every later call is refused. Returns what the caller of the crashed call is told happens next.
 */
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

/**
 * Executes a standard (cacheable) OCCT function.
 * 
 * This handles the common flow:
 * 1. Lay the inputs over the defaults of the DTO the operation takes, so a property left out, or
 *    passed as undefined or as null where it has a default, gets its default, and cache the call
 *    under those inputs
 * 2. Only on a cache miss: report what the inputs would be rejected for, resolve the shape
 *    references in them recursively, and run the function - a hit touches no referenced shape
 * 3. Serialize the result for transmission
 */
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
    (kernel as Partial<BitbybitOcctModule>).ProgressBeginCall?.();

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
