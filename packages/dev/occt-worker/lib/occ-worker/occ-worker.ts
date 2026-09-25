import type { BitbybitOcctModule } from "@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt";
import { ShapesHelperService, VectorHelperService, OccHelper, OCCTService, occtDtoRegistry } from "@bitbybit-dev/occt";
import { describeKernelFailure, resolveInputs } from "@bitbybit-dev/base";
import { CacheHelper } from "./cache-helper";
import { WorkerMessages, NON_CACHEABLE_FUNCTIONS } from "./constants";
import { ShapeResolver, ResultSerializer, FunctionPathResolver } from "./shape-resolver";
import { getCommandHandler, CommandContext } from "./command-handlers";

let openCascade: OCCTService;
let cacheHelper: CacheHelper;
let shapeResolver: ShapeResolver;
let resultSerializer: ResultSerializer;
let functionPathResolver: FunctionPathResolver;

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
 * @param occ - The BitbybitOcctModule instance
 * @param plugins - Optional plugins to add to the OpenCascade service (e.g., AdvancedOCCT)
 * @param doNotPost - If true, skip posting the initialization message (used for testing)
 * @returns The CacheHelper instance for testing purposes
 */

export const initializationComplete = (
    occ: BitbybitOcctModule,
    plugins: any,
    doNotPost?: boolean
): CacheHelper => {
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

    if (!doNotPost) {
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

/**
 * Executes a standard (cacheable) OCCT function.
 * 
 * This handles the common flow:
 * 1. Lay the inputs over the defaults of the DTO the operation takes, so a property left out or
 *    passed as undefined gets its default, and cache the call under those inputs
 * 2. Recursively resolve shape references in inputs
 * 3. Execute the function with caching
 * 4. Serialize the result for transmission
 */
function executeStandardFunction(
    action: DataInput["action"]
): unknown {
    const inputs = resolveInputs(occtDtoRegistry, action.functionName, action.inputs);
    const resolvedInputs = shapeResolver.resolveShapeReferences(inputs);

    const res = cacheHelper.cacheOp({ functionName: action.functionName, inputs }, () => {
        return functionPathResolver.callFunction(openCascade, action.functionName, resolvedInputs);
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
    postMessage(WorkerMessages.BUSY);

    let result: unknown;

    try {
        const { functionName, inputs } = d.action;

        const commandHandler = getCommandHandler(functionName);

        if (commandHandler) {
            const commandResult = commandHandler(inputs, createCommandContext());
            result = commandResult.result;
        } else if (!NON_CACHEABLE_FUNCTIONS.has(functionName)) {
            result = executeStandardFunction(d.action);
        }

        postMessage({
            uid: d.uid,
            result,
        });
    } catch (e) {
        try {
            const failure = describeKernelFailure("OCCT", d.action?.functionName ?? "", d.action?.inputs, e);
            postMessage({
                uid: d.uid,
                result: undefined,
                error: failure.message,
                errorKind: failure.kind,
                stack: failure.stack,
            });
        } catch (fmtErr) {
            postMessage({
                uid: d.uid,
                result: undefined,
                error: `OCCT computation failed: ${e instanceof Error ? e.message : String(e)} (additionally, error formatting failed: ${fmtErr instanceof Error ? fmtErr.message : String(fmtErr)})`,
            });
        }
    }
};
