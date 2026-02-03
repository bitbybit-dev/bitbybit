/**
 * Constants for OCCT worker communication and shape handling.
 * These constants define the protocol between the main thread and the worker.
 */

/**
 * Shape reference type identifier used in serialized shape objects.
 * When shapes are passed between main thread and worker, they are serialized
 * as objects with this type identifier and a hash reference.
 */
export const SHAPE_TYPE_IDENTIFIER = "occ-shape" as const;

/**
 * Entity reference type identifier used in serialized OCCT objects that are not shapes.
 * This includes assembly documents, handles, and other OCCT objects.
 * When these objects are passed between main thread and worker, they are serialized
 * as objects with this type identifier and a hash reference.
 */
export const ENTITY_TYPE_IDENTIFIER = "occ-entity" as const;

/**
 * Worker lifecycle and status messages.
 */
export const WorkerMessages = {
    /** Sent when the worker has completed initialization */
    INITIALIZED: "occ-initialised",
    /** Sent when the worker is processing a request */
    BUSY: "busy",
} as const;

/**
 * Reserved function names that have special handling in the worker.
 * These functions bypass the standard caching mechanism and have custom logic.
 */
export const ReservedFunctions = {
    /** Convert a single shape to mesh data for rendering */
    SHAPE_TO_MESH: "shapeToMesh",
    /** Convert multiple shapes to mesh data for rendering */
    SHAPES_TO_MESHES: "shapesToMeshes",
    /** Delete a single shape from cache */
    DELETE_SHAPE: "deleteShape",
    /** Delete multiple shapes from cache */
    DELETE_SHAPES: "deleteShapes",
    /** Signal that a new run has started (used for cache cleanup) */
    STARTED_THE_RUN: "startedTheRun",
    /** Clean all cached shapes */
    CLEAN_ALL_CACHE: "cleanAllCache",
    /** Add OpenCascade dependencies/plugins */
    ADD_OC: "addOc",
    /** Save shape to STEP file format */
    SAVE_SHAPE_STEP: "saveShapeSTEP",
} as const;

/**
 * Set of function names that should not go through the standard caching flow.
 * These functions either handle their own caching or don't need caching.
 */
export const NON_CACHEABLE_FUNCTIONS = new Set<string>([
    ReservedFunctions.SHAPE_TO_MESH,
    ReservedFunctions.SHAPES_TO_MESHES,
    ReservedFunctions.DELETE_SHAPE,
    ReservedFunctions.DELETE_SHAPES,
    ReservedFunctions.STARTED_THE_RUN,
    ReservedFunctions.CLEAN_ALL_CACHE,
    ReservedFunctions.ADD_OC,
    ReservedFunctions.SAVE_SHAPE_STEP,
]);

/**
 * Maximum number of cached hashes before triggering a full cache cleanup.
 * This prevents memory issues from accumulating too many cached shapes.
 */
export const CACHE_THRESHOLD = 10000;

/**
 * Type for a serialized shape reference that can be passed between threads.
 */
export interface ShapeReference {
    type: typeof SHAPE_TYPE_IDENTIFIER;
    hash: number | string;
}

/**
 * Type guard to check if a value is a ShapeReference.
 */
export function isShapeReference(value: unknown): value is ShapeReference {
    return (
        value !== null &&
        typeof value === "object" &&
        "type" in value &&
        "hash" in value &&
        (value as ShapeReference).type === SHAPE_TYPE_IDENTIFIER
    );
}

/**
 * Creates a shape reference object for serialization.
 */
export function createShapeReference(hash: number | string): ShapeReference {
    return {
        type: SHAPE_TYPE_IDENTIFIER,
        hash,
    };
}

/**
 * Type for a serialized entity reference (non-shape OCCT objects) that can be passed between threads.
 */
export interface EntityReference {
    type: typeof ENTITY_TYPE_IDENTIFIER;
    hash: number | string;
}

/**
 * Type guard to check if a value is an EntityReference.
 */
export function isEntityReference(value: unknown): value is EntityReference {
    return (
        value !== null &&
        typeof value === "object" &&
        "type" in value &&
        "hash" in value &&
        (value as EntityReference).type === ENTITY_TYPE_IDENTIFIER
    );
}

/**
 * Creates an entity reference object for serialization.
 */
export function createEntityReference(hash: number | string): EntityReference {
    return {
        type: ENTITY_TYPE_IDENTIFIER,
        hash,
    };
}
