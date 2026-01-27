import type { BitbybitOcctModule } from "@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt";
import { ShapesHelperService, VectorHelperService, OccHelper, OCCTService } from "@bitbybit-dev/occt";
import { CacheHelper } from "./cache-helper";
import { WorkerMessages, NON_CACHEABLE_FUNCTIONS } from "./constants";
import { ShapeResolver, ResultSerializer, FunctionPathResolver } from "./shape-resolver";
import { getCommandHandler, CommandContext } from "./command-handlers";

// Module-level state
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const initializationComplete = (
    occ: BitbybitOcctModule,
    plugins: any,
    doNotPost?: boolean
): CacheHelper => {
    // Initialize cache helper
    cacheHelper = new CacheHelper(occ);
    
    // Initialize helper services
    const vecService = new VectorHelperService();
    const shapesService = new ShapesHelperService();
    
    // Initialize OpenCascade service
    openCascade = new OCCTService(occ, new OccHelper(vecService, shapesService, occ));
    
    // Initialize resolver utilities
    shapeResolver = new ShapeResolver(cacheHelper);
    resultSerializer = new ResultSerializer(cacheHelper);
    functionPathResolver = new FunctionPathResolver();
    
    // Set up plugins if provided
    if (plugins) {
        openCascade.plugins = plugins;
        // Add any pending dependencies that were registered before initialization
        Object.entries(pendingDependencies).forEach(([key, value]) => {
            openCascade.plugins.dependencies[key] = value;
        });
    }
    
    // Notify that initialization is complete
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
 * 1. Recursively resolve shape references in inputs
 * 2. Execute the function with caching
 * 3. Serialize the result for transmission
 */
function executeStandardFunction(
    action: DataInput["action"]
): unknown {
    // Recursively resolve all shape references in inputs
    const resolvedInputs = shapeResolver.resolveShapeReferences(action.inputs);
    
    // Execute with caching - the cache helper will return cached result if available
    const res = cacheHelper.cacheOp(action, () => {
        return functionPathResolver.callFunction(openCascade, action.functionName, resolvedInputs);
    });
    
    // Serialize the result for transmission back to main thread
    return resultSerializer.serializeResult(res);
}

/**
 * Formats error information for transmission.
 */
function formatError(error: unknown, action: DataInput["action"]): string {
    let props = "";
    if (action?.inputs) {
        const inputDetails = Object.entries(action.inputs)
            .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
            .join(",");
        props = `Input values were: {${inputDetails}}. `;
    }
    
    const funcName = action?.functionName ? `- ${action.functionName}` : "";
    
    return `OCCT computation failed. ${error} While executing function ${funcName}. ${props}`;
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
    // Notify that processing has started
    postMessage(WorkerMessages.BUSY);
    
    let result: unknown;
    
    try {
        const { functionName, inputs } = d.action;
        
        // Check if this is a reserved function with special handling
        const commandHandler = getCommandHandler(functionName);
        
        if (commandHandler) {
            // Execute special command handler
            const commandResult = commandHandler(inputs, createCommandContext());
            result = commandResult.result;
        } else if (!NON_CACHEABLE_FUNCTIONS.has(functionName)) {
            // Execute standard cacheable function
            result = executeStandardFunction(d.action);
        }
        
        // Send successful response
        postMessage({
            uid: d.uid,
            result,
        });
    } catch (e) {
        // Send error response
        postMessage({
            uid: d.uid,
            result: undefined,
            error: formatError(e, d.action),
        });
    }
};
