import type { BitbybitOcctModule } from "@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt";
import type { CacheHelper } from "./cache-helper";
import type { MeshRetention } from "./constants";
import { ReservedFunctions, CACHE_THRESHOLD, MAX_RETAINED_TRIANGLES, isShapeReference } from "./constants";
import type { ShapeResolver } from "./shape-resolver";
import { Inputs, releaseDesignCaches } from "@bitbybit-dev/occt";
import type { OccHelper, OCCTService, TopoDS_Shape } from "@bitbybit-dev/occt";
import { InputError, resolveDto } from "@bitbybit-dev/base";
import { meshBuffersOf } from "./mesh-transfer";

const meshRetentionOf = (kernel: BitbybitOcctModule): MeshRetention => ({
    budget: kernel.MeshRetentionBudget(),
    faces: kernel.KeptMeshFaces(),
    triangles: kernel.KeptMeshTriangles(),
});

/**
 * What the worker may pass with an answer: the buffers it hands over with the message rather than
 * copying them.
 */
export interface ReplyOptions {
    transfer?: ArrayBuffer[];
}

/**
 * How the worker answers the thread that called it: the message and, for an answer that hands
 * buffers over, its options. A worker's own `postMessage` takes both, typed as a worker's or as a
 * window's.
 */
export type PostMessage = (message: unknown, options?: ReplyOptions) => void;

/**
 * CommandResult represents the outcome of a command handler.
 */
export interface CommandResult {
    /** Whether the command was handled (if false, default processing should occur) */
    handled: boolean;
    /** The result to return to the caller (if handled is true) */
    result?: unknown;
    /** The buffers the result's typed arrays view, handed to the caller rather than copied; nothing else may hold them */
    transfer?: ArrayBuffer[];
}

/**
 * CommandContext provides dependencies needed by command handlers.
 */
export interface CommandContext {
    /** The OpenCascade service instance */
    openCascade: OCCTService;
    /** The meshing the service runs on, for the drawing layouts the service does not offer */
    meshing: OccHelper["meshingService"];
    /** The kernel module the service runs on, for the switches that live on the kernel itself */
    kernel: BitbybitOcctModule;
    /** Sets the kernel's mesh retention budget, kept by the worker for a kernel that replaces a crashed one */
    setMeshRetention: (triangles: number) => void;
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
        const shapesInput = inputs["shapes"] as unknown[];
        if (!shapesInput || !Array.isArray(shapesInput) || shapesInput.length === 0) {
            throw new InputError("`shapes` is not a list of at least one shape, so there is nothing to mesh.", "shapes");
        }
        const resolvedInputs = context.shapeResolver.resolveShapeReferences(inputs);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = context.openCascade.shapesToMeshes(resolvedInputs as any);
        return { handled: true, result };
    },

    /**
     * Meshes one shape for drawing: typed arrays, their buffers handed to the caller rather than copied.
     */
    [ReservedFunctions.SHAPE_TO_MESH_BUFFERS]: (inputs, context): CommandResult => {
        const resolvedInputs = resolveDto<Inputs.OCCT.ShapeToMeshDto<TopoDS_Shape>>(Inputs.OCCT.ShapeToMeshDto, context.shapeResolver.resolveShapeReferences(inputs));
        const result = context.meshing.shapeToMeshBuffers(resolvedInputs);
        return { handled: true, result, transfer: meshBuffersOf([result]) };
    },

    /**
     * Meshes several shapes for drawing, as `shapeToMeshBuffers` does one.
     */
    [ReservedFunctions.SHAPES_TO_MESH_BUFFERS]: (inputs, context): CommandResult => {
        const shapesInput = inputs["shapes"] as unknown[];
        if (!shapesInput || !Array.isArray(shapesInput) || shapesInput.length === 0) {
            throw new InputError("`shapes` is not a list of at least one shape, so there is nothing to mesh.", "shapes");
        }
        const resolvedInputs = resolveDto<Inputs.OCCT.ShapesToMeshesDto<TopoDS_Shape>>(Inputs.OCCT.ShapesToMeshesDto, context.shapeResolver.resolveShapeReferences(inputs));
        const result = context.meshing.shapesToMeshBuffers(resolvedInputs);
        return { handled: true, result, transfer: meshBuffersOf(result) };
    },

    /**
     * Handles document shape to mesh conversion (with per-face colours).
     * Resolves the document and shape from cache and converts them to coloured mesh data.
     */
    [ReservedFunctions.DOC_TO_MESH]: (inputs, context): CommandResult => {
        const resolvedInputs = context.shapeResolver.resolveShapeReferences(inputs);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = context.openCascade.docToMesh(resolvedInputs as any);
        return { handled: true, result };
    },

    /**
     * Handles a document to multiple meshes conversion (with per-face colours).
     * Resolves the document from cache and converts each of its free shapes to coloured mesh data.
     */
    [ReservedFunctions.DOC_TO_MESHES]: (inputs, context): CommandResult => {
        const resolvedInputs = context.shapeResolver.resolveShapeReferences(inputs);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = context.openCascade.docToMeshes(resolvedInputs as any);
        return { handled: true, result };
    },

    /**
     * Handles single shape deletion from cache.
     */
    [ReservedFunctions.DELETE_SHAPE]: (inputs, context): CommandResult => {
        const shapeRef = inputs["shape"] as { hash: number | string };
        context.cacheHelper.cleanCacheForHash(shapeRef.hash as string);
        return { handled: true, result: {} };
    },

    /**
     * Handles multiple shapes deletion from cache.
     */
    [ReservedFunctions.DELETE_SHAPES]: (inputs, context): CommandResult => {
        const shapesInput = inputs["shapes"] as Array<{ hash: number | string }>;
        shapesInput.forEach(shape => context.cacheHelper.cleanCacheForHash(shape.hash as string));
        return { handled: true, result: {} };
    },

    /**
     * Deletes each shape given whose `answers`, the answers the caller counted carrying it, are every
     * answer that has carried a shape under its key in this epoch, so no other caller was handed it:
     * the cache answers an identical call with the same shape. Any other shape stays. Only an `epoch`
     * that is still the cache's deletes anything, since emptying the cache began a new one and what a
     * key holds since is another caller's; without one, nothing is deleted. Answers `{ epoch }`, the
     * cache's epoch now.
     */
    [ReservedFunctions.DELETE_UNSHARED_SHAPES]: (inputs, context): CommandResult => {
        const shapesInput = inputs["shapes"];
        const epoch = inputs["epoch"];
        if (!Array.isArray(shapesInput)) {
            throw new InputError("`shapes` is not a list of shapes, each with the answers that carried it.", "shapes");
        }
        if (epoch !== undefined && typeof epoch !== "number") {
            throw new InputError("`epoch` is not a number: it is the epoch an earlier answer of deleteUnsharedShapes named.", "epoch");
        }
        if (epoch === context.cacheHelper.epoch) {
            shapesInput.forEach((shape: unknown) => {
                if (isShapeReference(shape) && "answers" in shape && context.cacheHelper.answersOf(shape.hash) === shape.answers) {
                    context.cacheHelper.cleanCacheForHash(String(shape.hash));
                }
            });
        }
        return { handled: true, result: { epoch: context.cacheHelper.epoch } };
    },

    /**
     * Handles assembly document deletion from cache. A document handle lives in the same cache
     * as shapes; releasing it here frees the OCCT object and forgets the reference, exactly as
     * shape deletion does. Previously this was dispatched to a kernel method that does not exist.
     */
    [ReservedFunctions.DELETE_DOCUMENT]: (inputs, context): CommandResult => {
        const documentRef = inputs["document"] as { hash: number | string };
        context.cacheHelper.cleanCacheForHash(documentRef.hash as string);
        return { handled: true, result: {} };
    },

    /**
     * Handles the start of a new run.
     * Cleans cache if threshold is exceeded.
     */
    [ReservedFunctions.STARTED_THE_RUN]: (_inputs, context): CommandResult => {
        if (Object.keys(context.cacheHelper.usedHashes).length > CACHE_THRESHOLD) {
            context.kernel.ReleaseKeptMeshes();
            context.cacheHelper.cleanAllCache();
            releaseDesignCaches(context.openCascade);
        }
        return { handled: true, result: {} };
    },

    /**
     * Handles full cache cleanup.
     */
    [ReservedFunctions.CLEAN_ALL_CACHE]: (_inputs, context): CommandResult => {
        context.kernel.ReleaseKeptMeshes();
        context.cacheHelper.cleanAllCache();
        releaseDesignCaches(context.openCascade);
        return { handled: true, result: {} };
    },

    /**
     * Handles the mesh retention budget: how many triangles meshing may keep on shapes, so a shape
     * meshed again with the same settings, or a shape sharing its faces, reuses them. 0 turns keeping
     * off and releases what was kept. Answers with what is kept after the change.
     */
    [ReservedFunctions.SET_MESH_RETENTION]: (inputs, context): CommandResult => {
        const triangles = inputs["triangles"];
        if (typeof triangles !== "number" || !Number.isInteger(triangles) || triangles < 0 || triangles > MAX_RETAINED_TRIANGLES) {
            throw new Error(`setMeshRetention: triangles must be a whole number from 0 to ${MAX_RETAINED_TRIANGLES}.`);
        }
        context.setMeshRetention(triangles);
        return { handled: true, result: meshRetentionOf(context.kernel) };
    },

    /**
     * Handles adding OpenCascade dependencies/plugins.
     * Dependencies are stored and added to plugins when available.
     */
    [ReservedFunctions.ADD_OC]: (inputs, context): CommandResult => {
        if (context.openCascade?.plugins) {
            const plugins = context.openCascade.plugins;
            Object.keys(inputs).forEach(key => {
                plugins.dependencies[key] = inputs[key];
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
    return hasCommandHandler(functionName) ? CommandHandlers[functionName] : undefined;
}

/**
 * Checks if a function name has a special command handler. Only the handlers listed here count, so
 * a name such as `constructor` or `toString` is not answered by the object's prototype.
 */
export function hasCommandHandler(functionName: string): boolean {
    return Object.prototype.hasOwnProperty.call(CommandHandlers, functionName);
}
