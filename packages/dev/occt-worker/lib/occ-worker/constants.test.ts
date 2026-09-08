import { describe, it, expect } from "vitest";
import {
    CACHE_THRESHOLD,
    ENTITY_TYPE_IDENTIFIER,
    NON_CACHEABLE_FUNCTIONS,
    ReservedFunctions,
    SHAPE_TYPE_IDENTIFIER,
    WorkerMessages,
    createEntityReference,
    createShapeReference,
    isEntityReference,
    isShapeReference,
} from "./constants";

// These are the protocol between the main thread and the worker: the two message names, the reserved
// function names, and the two reference shapes a kernel object crosses a postMessage as. Users' saved
// scripts and the worker both spell them out, so a value changing here is a breaking change.
// The handlers behind the reserved names have their own suite, in command-handlers.test.ts.

describe("the worker protocol constants", () => {
    describe("WorkerMessages", () => {
        it("should announce initialisation under the name the manager listens for", () => {
            expect(WorkerMessages.INITIALIZED).toBe("occ-initialised");
        });

        it("should announce work under the name the manager listens for", () => {
            expect(WorkerMessages.BUSY).toBe("busy");
        });
    });

    describe("ReservedFunctions", () => {
        it("should name every command the worker answers itself", () => {
            expect(ReservedFunctions).toEqual({
                SHAPE_TO_MESH: "shapeToMesh",
                SHAPES_TO_MESHES: "shapesToMeshes",
                DOC_TO_MESH: "docToMesh",
                DOC_TO_MESHES: "docToMeshes",
                DELETE_SHAPE: "deleteShape",
                DELETE_SHAPES: "deleteShapes",
                DELETE_DOCUMENT: "deleteDocument",
                STARTED_THE_RUN: "startedTheRun",
                CLEAN_ALL_CACHE: "cleanAllCache",
                ADD_OC: "addOc",
                SAVE_SHAPE_STEP: "saveShapeSTEP",
            });
        });
    });

    describe("NON_CACHEABLE_FUNCTIONS", () => {
        it("should hold every reserved command but the two mesh conversions of a document", () => {
            expect([...NON_CACHEABLE_FUNCTIONS].sort()).toEqual([
                "addOc",
                "cleanAllCache",
                "deleteDocument",
                "deleteShape",
                "deleteShapes",
                "docToMesh",
                "docToMeshes",
                "saveShapeSTEP",
                "shapeToMesh",
                "shapesToMeshes",
                "startedTheRun",
            ]);
        });

        it("should not hold a kernel method", () => {
            expect(NON_CACHEABLE_FUNCTIONS.has("shapes.wire.createCircleWire")).toBe(false);
        });
    });

    describe("CACHE_THRESHOLD", () => {
        it("should be the number of hashes a run may hold before the cache is dropped", () => {
            expect(CACHE_THRESHOLD).toBe(10000);
        });
    });

    describe("the type identifiers", () => {
        it("should name a shape as saved scripts spell it", () => {
            expect(SHAPE_TYPE_IDENTIFIER).toBe("occ-shape");
        });

        it("should name an entity as saved scripts spell it", () => {
            expect(ENTITY_TYPE_IDENTIFIER).toBe("occ-entity");
        });
    });

    describe("createShapeReference", () => {
        it("should stamp the hash with the shape identifier", () => {
            expect(createShapeReference(42)).toEqual({ type: "occ-shape", hash: 42 });
        });
    });

    describe("isShapeReference", () => {
        it("should recognise what createShapeReference makes", () => {
            expect(isShapeReference(createShapeReference(42))).toBe(true);
        });

        it("should not mistake an entity reference for a shape", () => {
            expect(isShapeReference(createEntityReference(42))).toBe(false);
        });

        it("should not mistake an object without a hash for a shape", () => {
            expect(isShapeReference({ type: "occ-shape" })).toBe(false);
        });

        it("should not mistake nothing for a shape", () => {
            expect(isShapeReference(null)).toBe(false);
        });

        it("should not mistake a number for a shape", () => {
            expect(isShapeReference(42)).toBe(false);
        });
    });

    describe("createEntityReference", () => {
        it("should stamp the hash with the entity identifier", () => {
            expect(createEntityReference("doc-1")).toEqual({ type: "occ-entity", hash: "doc-1" });
        });
    });

    describe("isEntityReference", () => {
        it("should recognise what createEntityReference makes", () => {
            expect(isEntityReference(createEntityReference("doc-1"))).toBe(true);
        });

        it("should not mistake a shape reference for an entity", () => {
            expect(isEntityReference(createShapeReference(42))).toBe(false);
        });

        it("should not mistake an object without a hash for an entity", () => {
            expect(isEntityReference({ type: "occ-entity" })).toBe(false);
        });

        it("should not mistake nothing for an entity", () => {
            expect(isEntityReference(null)).toBe(false);
        });

        it("should not mistake a number for an entity", () => {
            expect(isEntityReference(42)).toBe(false);
        });
    });
});
