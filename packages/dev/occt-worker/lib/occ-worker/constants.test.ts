import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
    CACHE_THRESHOLD,
    DOCUMENT_CHANGING_FUNCTIONS,
    DOCUMENT_LABEL_SETTING_FUNCTIONS,
    DOCUMENT_READING_FUNCTIONS,
    DOCUMENT_TYPE_IDENTIFIER,
    ENTITY_TYPE_IDENTIFIER,
    NON_CACHEABLE_FUNCTIONS,
    ReservedFunctions,
    SHAPE_TYPE_IDENTIFIER,
    WorkerMessages,
    createDocumentReference,
    createEntityReference,
    createShapeReference,
    isDocumentReference,
    isEntityReference,
    isShapeReference,
} from "./constants";

const WORKER_API = fileURLToPath(new URL("../api/occt", import.meta.url));
const WORKER_METHOD = /^ {4}(?:async )?\w+\(inputs: ([^\n]*)\): Promise<[^\n]*\{\n([\s\S]*?)\n {4}\}$/gm;
const SENT_PATH = /genericCallToWorkerPromise(?:<[^>]*>)?\("([^"]+)"/;

const workerApiFiles = (directory: string): string[] => readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
        return workerApiFiles(path);
    }
    return entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts") ? [path] : [];
});

const ANSWERED_METHOD = /^ {4}(?:async )?\w+\(inputs: [^\n]*\): Promise<([^\n]*)> \{\n([\s\S]*?)\n {4}\}$/gm;

const answerOfEachPathSent = (): Map<string, string> => new Map(workerApiFiles(WORKER_API)
    .flatMap(file => [...readFileSync(file, "utf8").matchAll(ANSWERED_METHOD)])
    .map(([, answer, body]): [string, string] => [SENT_PATH.exec(body!)?.[1] ?? "", answer!]));

const pathsSentWithADocument = (): string[] => workerApiFiles(WORKER_API)
    .flatMap(file => [...readFileSync(file, "utf8").matchAll(WORKER_METHOD)])
    .filter(([, parameter]) => parameter!.includes("TDocStdDocumentPointer"))
    .map(([method, , body]) => SENT_PATH.exec(body!)?.[1] ?? `a method sending no path: ${method.split("\n")[0]!.trim()}`)
    .sort();

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
                SHAPE_TO_MESH_BUFFERS: "shapeToMeshBuffers",
                SHAPES_TO_MESH_BUFFERS: "shapesToMeshBuffers",
                DOC_TO_MESH: "docToMesh",
                DOC_TO_MESHES: "docToMeshes",
                DELETE_SHAPE: "deleteShape",
                DELETE_SHAPES: "deleteShapes",
                DELETE_UNSHARED_SHAPES: "deleteUnsharedShapes",
                DELETE_DOCUMENT: "deleteDocument",
                RELEASE_DOCUMENT_VERSIONS: "releaseDocumentVersions",
                STARTED_THE_RUN: "startedTheRun",
                CLEAN_ALL_CACHE: "cleanAllCache",
                SET_MESH_RETENTION: "setMeshRetention",
                SET_SETTINGS: "setSettings",
                ADD_OC: "addOc",
                SAVE_SHAPE_STEP: "saveShapeSTEP",
            });
        });
    });

    describe("NON_CACHEABLE_FUNCTIONS", () => {
        it("should hold every reserved command", () => {
            expect([...NON_CACHEABLE_FUNCTIONS].sort()).toEqual([
                "addOc",
                "cleanAllCache",
                "deleteDocument",
                "deleteShape",
                "deleteShapes",
                "deleteUnsharedShapes",
                "docToMesh",
                "docToMeshes",
                "releaseDocumentVersions",
                "saveShapeSTEP",
                "setMeshRetention",
                "setSettings",
                "shapeToMesh",
                "shapeToMeshBuffers",
                "shapesToMeshBuffers",
                "shapesToMeshes",
                "startedTheRun",
            ]);
        });

        it("should not hold a kernel method", () => {
            expect(NON_CACHEABLE_FUNCTIONS.has("shapes.wire.createCircleWire")).toBe(false);
        });
    });

    describe("the calls that take an assembly document", () => {
        it("should declare every worker call that takes a document as changing it or reading it, deleteDocument aside", () => {
            // Act
            const declared = [...DOCUMENT_CHANGING_FUNCTIONS.keys(), ...DOCUMENT_READING_FUNCTIONS, ReservedFunctions.DELETE_DOCUMENT].sort();

            // Assert
            expect(pathsSentWithADocument()).toEqual(declared);
        });

        it("should weigh as the version it read only a change of a document that sets what its labels hold", () => {
            // Act
            const setting = [...DOCUMENT_LABEL_SETTING_FUNCTIONS].filter(path => DOCUMENT_CHANGING_FUNCTIONS.has(path));

            // Assert
            expect(setting).toEqual([...DOCUMENT_LABEL_SETTING_FUNCTIONS]);
            expect(setting.every(path => /^assembly\.manager\.setDocLabel(Color|Name)s?$/.test(path))).toBe(true);
        });

        it("should declare no call as both changing and reading a document", () => {
            // Act
            const both = [...DOCUMENT_CHANGING_FUNCTIONS.keys()].filter(path => DOCUMENT_READING_FUNCTIONS.has(path));

            // Assert
            expect(both).toEqual([]);
        });

        it("should have each call that changes a document answer the document, so the worker can answer a reference to the version it made", () => {
            // Arrange
            const answers = answerOfEachPathSent();

            // Act
            const answered = [...DOCUMENT_CHANGING_FUNCTIONS.keys()].map(path => [path, answers.get(path)]);

            // Assert
            expect(answered).toEqual([...DOCUMENT_CHANGING_FUNCTIONS.keys()].map(path => [path, "Inputs.OCCT.TDocStdDocumentPointer"]));
        });

        it("should name, for each call that changes a document, the input that holds it", () => {
            expect(Object.fromEntries(DOCUMENT_CHANGING_FUNCTIONS)).toEqual({
                "assembly.manager.addDocumentPmi": "document",
                "assembly.manager.buildAssemblyDocument": "existingDocument",
                "assembly.manager.removeDocumentPmi": "document",
                "assembly.manager.setDocLabelColor": "document",
                "assembly.manager.setDocLabelColors": "document",
                "assembly.manager.setDocLabelName": "document",
                "assembly.manager.setDocLabelNames": "document",
            });
        });
    });

    describe("CACHE_THRESHOLD", () => {
        it("should be the number of hashes a run may hold before the cache is dropped", () => {
            expect(CACHE_THRESHOLD).toBe(10000);
        });
    });

    describe("the type identifiers", () => {
        it("should name a shape as users' scripts spell it", () => {
            expect(SHAPE_TYPE_IDENTIFIER).toBe("occ-shape");
        });

        it("should name an entity as users' scripts spell it", () => {
            expect(ENTITY_TYPE_IDENTIFIER).toBe("occ-entity");
        });

        it("should name an assembly document as the document pointer type spells it", () => {
            expect(DOCUMENT_TYPE_IDENTIFIER).toBe("occ-document");
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

        it("should not mistake a document reference for a shape", () => {
            expect(isShapeReference(createDocumentReference(42))).toBe(false);
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

        it("should not mistake a document reference for an entity", () => {
            expect(isEntityReference(createDocumentReference("doc-1"))).toBe(false);
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

    describe("createDocumentReference", () => {
        it("should stamp the hash with the document identifier", () => {
            expect(createDocumentReference("doc-1")).toEqual({ type: "occ-document", hash: "doc-1" });
        });
    });

    describe("isDocumentReference", () => {
        it("should recognise what createDocumentReference makes", () => {
            expect(isDocumentReference(createDocumentReference("doc-1"))).toBe(true);
        });

        it("should not mistake an entity reference for a document", () => {
            expect(isDocumentReference(createEntityReference("doc-1"))).toBe(false);
        });

        it("should not mistake a shape reference for a document", () => {
            expect(isDocumentReference(createShapeReference(42))).toBe(false);
        });

        it("should not mistake an object without a hash for a document", () => {
            expect(isDocumentReference({ type: "occ-document" })).toBe(false);
        });

        it("should not mistake nothing for a document", () => {
            expect(isDocumentReference(null)).toBe(false);
        });
    });
});
