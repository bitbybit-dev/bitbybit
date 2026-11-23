/**
 * Shape reference type identifier used in serialized shape objects.
 * When shapes are passed between main thread and worker, they are serialized
 * as objects with this type identifier and a hash reference.
 */
export const SHAPE_TYPE_IDENTIFIER = "occ-shape" as const;

/**
 * Entity reference type identifier used in serialized OCCT objects that are neither shapes nor
 * assembly documents, such as geometry handles.
 * When these objects are passed between main thread and worker, they are serialized
 * as objects with this type identifier and a hash reference.
 */
export const ENTITY_TYPE_IDENTIFIER = "occ-entity" as const;

/**
 * Document reference type identifier used in serialized assembly documents (`Handle_TDocStd_Document`),
 * as `assembly.manager.loadStepToDoc` returns them. A document carries its own identifier so the main
 * thread can tell it from any other kernel object that is not a shape.
 */
export const DOCUMENT_TYPE_IDENTIFIER = "occ-document" as const;

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
    /** Convert a single shape to mesh data for drawing, as typed arrays handed over without a copy */
    SHAPE_TO_MESH_BUFFERS: "shapeToMeshBuffers",
    /** Convert multiple shapes to mesh data for drawing, as typed arrays handed over without a copy */
    SHAPES_TO_MESH_BUFFERS: "shapesToMeshBuffers",
    /** Convert a single document shape to mesh data including per-face colours */
    DOC_TO_MESH: "docToMesh",
    /** Convert multiple document shapes to mesh data including per-face colours */
    DOC_TO_MESHES: "docToMeshes",
    /** Delete a single shape from cache */
    DELETE_SHAPE: "deleteShape",
    /** Delete multiple shapes from cache */
    DELETE_SHAPES: "deleteShapes",
    /** Delete each of the shapes given whose answers counted beside it are every answer that carried it in the epoch named, so no other caller holds it; answers with the current epoch */
    DELETE_UNSHARED_SHAPES: "deleteUnsharedShapes",
    /** Delete an assembly document from cache: given as its creating call answered it, with every version of it; given a version, that version alone */
    DELETE_DOCUMENT: "deleteDocument",
    /** Free the kernel objects of the document versions given, which stay answerable and are made again from their changes when read */
    RELEASE_DOCUMENT_VERSIONS: "releaseDocumentVersions",
    /** Signal that a new run has started (used for cache cleanup) */
    STARTED_THE_RUN: "startedTheRun",
    /** Clean all cached shapes */
    CLEAN_ALL_CACHE: "cleanAllCache",
    /** Set how many triangles meshing may keep on shapes, and report what is kept */
    SET_MESH_RETENTION: "setMeshRetention",
    /** Set the settings the kernel works by, such as the coordinate system, kept for every call after */
    SET_SETTINGS: "setSettings",
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
    ReservedFunctions.SHAPE_TO_MESH_BUFFERS,
    ReservedFunctions.SHAPES_TO_MESH_BUFFERS,
    ReservedFunctions.DOC_TO_MESH,
    ReservedFunctions.DOC_TO_MESHES,
    ReservedFunctions.DELETE_SHAPE,
    ReservedFunctions.DELETE_SHAPES,
    ReservedFunctions.DELETE_UNSHARED_SHAPES,
    ReservedFunctions.DELETE_DOCUMENT,
    ReservedFunctions.RELEASE_DOCUMENT_VERSIONS,
    ReservedFunctions.STARTED_THE_RUN,
    ReservedFunctions.CLEAN_ALL_CACHE,
    ReservedFunctions.SET_MESH_RETENTION,
    ReservedFunctions.SET_SETTINGS,
    ReservedFunctions.ADD_OC,
    ReservedFunctions.SAVE_SHAPE_STEP,
]);

/**
 * How a call reads a reference to an assembly document, which the worker manager stamps on every
 * call it sends (`OCCTWorkerManager.setDocumentReferences`). A reference to a version, what a call
 * that changes a document answers, always reads exactly that version. `latest`, the default, reads a
 * reference to a document as its creating call answered it as the version the last change made in
 * this run under `latest`, as a script that makes its calls one after another and ignores what each
 * change answers expects. `exact` reads that reference as the document as made, as a dataflow graph
 * that runs again only the calls whose inputs changed needs.
 */
export type DocumentReferences = "latest" | "exact";

/** Every way a call can read document references, `latest` first. */
export const DOCUMENT_REFERENCES: readonly DocumentReferences[] = ["latest", "exact"];

/**
 * How many versions of one document the worker keeps as kernel objects; beyond it the least recently
 * used is freed and made again from the changes that made it when something reads it.
 */
export const MAX_DOCUMENT_VERSIONS_KEPT = 8;

/**
 * How much the worker keeps of document versions as kernel objects, all documents together, counted
 * in labels: each part or sub-assembly, each of its placements and each dimension, tolerance and
 * datum counts one in every version kept. Beyond it the least recently used versions are freed as
 * above.
 */
export const MAX_DOCUMENT_VERSION_LABELS = 20000;

/**
 * The calls that change an assembly document they are given, each with the input that names it.
 * The worker never changes a document as its creating call made it: each of these makes a new
 * version, which the call answers a reference to, kept as the change that made it applied to the
 * version it read. How a later call reads a reference is its `DocumentReferences`.
 */
export const DOCUMENT_CHANGING_FUNCTIONS: ReadonlyMap<string, string> = new Map<string, string>([
    ["assembly.manager.buildAssemblyDocument", "existingDocument"],
    ["assembly.manager.setDocLabelColor", "document"],
    ["assembly.manager.setDocLabelName", "document"],
    ["assembly.manager.setDocLabelColors", "document"],
    ["assembly.manager.setDocLabelNames", "document"],
    ["assembly.manager.addDocumentPmi", "document"],
    ["assembly.manager.removeDocumentPmi", "document"],
]);

/**
 * The changes that set what labels of a document hold, a colour or a name, and never add or remove
 * a label: a version one of them makes holds the labels of the version it was made from, so it is
 * weighed as that version rather than counted again.
 */
export const DOCUMENT_LABEL_SETTING_FUNCTIONS: ReadonlySet<string> = new Set<string>([
    "assembly.manager.setDocLabelColor",
    "assembly.manager.setDocLabelName",
    "assembly.manager.setDocLabelColors",
    "assembly.manager.setDocLabelNames",
]);

/**
 * The calls that take an assembly document and only read it. With `DOCUMENT_CHANGING_FUNCTIONS` and
 * `deleteDocument` they name every call that takes a document, so a new one is declared in one of
 * the two.
 */
export const DOCUMENT_READING_FUNCTIONS: ReadonlySet<string> = new Set<string>([
    ReservedFunctions.DOC_TO_MESH,
    ReservedFunctions.DOC_TO_MESHES,
    "assembly.manager.exportDocumentToStep",
    "assembly.manager.exportDocumentToGltf",
    "assembly.manager.exportDocumentToGltfWithDraco",
    "assembly.manager.exportDocumentToObj",
    "assembly.manager.exportDocumentToPly",
    "assembly.query.getDocumentParts",
    "assembly.query.getShapeFromLabel",
    "assembly.query.getLabelColor",
    "assembly.query.getLabelTransform",
    "assembly.query.getLabelInfo",
    "assembly.query.getAssemblyHierarchy",
    "assembly.query.getDocumentPmi",
    "assembly.query.getDocumentAnnotations",
]);

/** The largest mesh retention budget the kernel takes, in triangles: its counter is a 32-bit integer. */
export const MAX_RETAINED_TRIANGLES = 2147483647;

/**
 * What the kernel keeps of the meshes it made: the budget in triangles (0 when keeping is off), how
 * many faces carry a kept triangulation and how many triangles those hold together.
 */
export interface MeshRetention {
    budget: number;
    faces: number;
    triangles: number;
}

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

/**
 * Type for a serialized assembly document reference that can be passed between threads.
 */
export interface DocumentReference {
    type: typeof DOCUMENT_TYPE_IDENTIFIER;
    hash: number | string;
}

/**
 * Type guard to check if a value is a DocumentReference.
 */
export function isDocumentReference(value: unknown): value is DocumentReference {
    return (
        value !== null &&
        typeof value === "object" &&
        "type" in value &&
        "hash" in value &&
        (value as DocumentReference).type === DOCUMENT_TYPE_IDENTIFIER
    );
}

/**
 * Creates a document reference object for serialization.
 */
export function createDocumentReference(hash: number | string): DocumentReference {
    return {
        type: DOCUMENT_TYPE_IDENTIFIER,
        hash,
    };
}
