import { CacheHelper } from "./cache-helper";
import { ReservedFunctions, CACHE_THRESHOLD } from "./constants";
import { ShapeResolver } from "./shape-resolver";
import { OCCTService } from "@bitbybit-dev/occt";

/**
 * CommandResult represents the outcome of a command handler.
 */
export interface CommandResult {
    /** Whether the command was handled (if false, default processing should occur) */
    handled: boolean;
    /** The result to return to the caller (if handled is true) */
    result?: unknown;
}

/**
 * CommandContext provides dependencies needed by command handlers.
 */
export interface CommandContext {
    /** The OpenCascade service instance */
    openCascade: OCCTService;
    /** The cache helper for managing shape cache */
    cacheHelper: CacheHelper;
    /** The shape resolver for resolving cached shapes */
    shapeResolver: ShapeResolver;
    /** Function to add dependencies when OpenCascade isn't ready yet */
    addPendingDependency: (key: string, value: unknown) => void;
}

/**
 * CommandHandler is a function that handles a specific reserved function.
 */
export type CommandHandler = (
    inputs: Record<string, unknown>,
    context: CommandContext
) => CommandResult;

/**
 * CommandHandlers provides specialized handling for reserved functions.
 * 
 * These functions have custom logic that differs from the standard
 * cache-and-execute flow used by most OCCT operations.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CommandHandlers: Record<string, CommandHandler> = {
    /**
     * Handles shape to mesh conversion.
     * Resolves the shape from cache and converts it to mesh data for rendering.
     */
    [ReservedFunctions.SHAPE_TO_MESH]: (inputs, context): CommandResult => {
        const resolvedInputs = context.shapeResolver.resolveShapeReferences(inputs);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = context.openCascade.shapeToMesh(resolvedInputs as any);
        return { handled: true, result };
    },

    /**
     * Handles multiple shapes to meshes conversion.
     * Resolves all shapes from cache and converts them to mesh data.
     */
    [ReservedFunctions.SHAPES_TO_MESHES]: (inputs, context): CommandResult => {
        const shapesInput = inputs.shapes as unknown[];
        if (!shapesInput || !Array.isArray(shapesInput) || shapesInput.length === 0) {
            throw new Error("No shapes detected");
        }
        const resolvedInputs = context.shapeResolver.resolveShapeReferences(inputs);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = context.openCascade.shapesToMeshes(resolvedInputs as any);
        return { handled: true, result };
    },

    /**
     * Handles single shape deletion from cache.
     */
    [ReservedFunctions.DELETE_SHAPE]: (inputs, context): CommandResult => {
        const shapeRef = inputs.shape as { hash: number | string };
        context.cacheHelper.cleanCacheForHash(shapeRef.hash as string);
        return { handled: true, result: {} };
    },

    /**
     * Handles multiple shapes deletion from cache.
     */
    [ReservedFunctions.DELETE_SHAPES]: (inputs, context): CommandResult => {
        const shapesInput = inputs.shapes as Array<{ hash: number | string }>;
        shapesInput.forEach(shape => context.cacheHelper.cleanCacheForHash(shape.hash as string));
        return { handled: true, result: {} };
    },

    /**
     * Handles the start of a new run.
     * Cleans cache if threshold is exceeded.
     */
    [ReservedFunctions.STARTED_THE_RUN]: (_inputs, context): CommandResult => {
        if (Object.keys(context.cacheHelper.usedHashes).length > CACHE_THRESHOLD) {
            context.cacheHelper.cleanAllCache();
        }
        return { handled: true, result: {} };
    },

    /**
     * Handles full cache cleanup.
     */
    [ReservedFunctions.CLEAN_ALL_CACHE]: (_inputs, context): CommandResult => {
        context.cacheHelper.cleanAllCache();
        return { handled: true, result: {} };
    },

    /**
     * Handles adding OpenCascade dependencies/plugins.
     * Dependencies are stored and added to plugins when available.
     */
    [ReservedFunctions.ADD_OC]: (inputs, context): CommandResult => {
        if (context.openCascade?.plugins) {
            Object.keys(inputs).forEach(key => {
                context.openCascade.plugins.dependencies[key] = inputs[key];
            });
        } else {
            Object.keys(inputs).forEach(key => {
                context.addPendingDependency(key, inputs[key]);
            });
        }
        return { handled: true, result: undefined };
    },

    /**
     * Handles saving a shape to STEP format.
     * Resolves the shape from cache and exports it.
     */
    [ReservedFunctions.SAVE_SHAPE_STEP]: (inputs, context): CommandResult => {
        const resolvedInputs = context.shapeResolver.resolveShapeReferences(inputs);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = context.openCascade.io.saveShapeSTEP(resolvedInputs as any);
        return { handled: true, result };
    },
};

/**
 * Gets the command handler for a given function name.
 * Returns undefined if no special handler exists for the function.
 */
export function getCommandHandler(functionName: string): CommandHandler | undefined {
    return CommandHandlers[functionName];
}

/**
 * Checks if a function name has a special command handler.
 */
export function hasCommandHandler(functionName: string): boolean {
    return functionName in CommandHandlers;
}
