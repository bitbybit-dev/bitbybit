import { callByPath } from "@bitbybit-dev/base";
import type { CacheHelper } from "./cache-helper";
import { isShapeReference, isEntityReference, createShapeReference, createEntityReference } from "./constants";

/**
 * ShapeResolver handles the recursive resolution of shape and document references in input objects.
 * 
 * When shapes or documents are passed from the main thread to the worker, they are serialized as
 * reference objects containing a hash. This class recursively traverses any
 * data structure to find and replace these references with the actual cached objects.
 * 
 * This solves the limitation of only resolving shapes at the top level of inputs,
 * allowing shapes and documents to be nested at any depth within the input structure.
 */
export class ShapeResolver {
    constructor(private readonly cacheHelper: CacheHelper) {}

    /**
     * Recursively resolves all shape and document references in the given value.
     * 
     * @param value - Any value that may contain shape/document references at any nesting level
     * @returns The value with all references replaced by actual cached objects
     * @throws Error if a reference hash is not found in cache
     */
    resolveShapeReferences<T>(value: T): T {
        return this.resolveRecursively(value) as T;
    }

    private resolveRecursively(value: unknown): unknown {
        if (value === null || value === undefined) {
            return value;
        }

        if (typeof value !== "object") {
            return value;
        }

        if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) {
            return value;
        }

        if (typeof Blob !== "undefined" && value instanceof Blob) {
            throw new Error(
                "File/Blob objects cannot be passed directly to the worker. " +
                "The data should have been converted to ArrayBuffer on the main thread. " +
                "This is a bug in the API layer - please report it."
            );
        }

        if (isShapeReference(value)) {
            return this.resolveFromCache(value.hash, "shape");
        }

        if (isEntityReference(value)) {
            return this.resolveFromCache(value.hash, "entity");
        }

        if (Array.isArray(value)) {
            return value.map(item => this.resolveRecursively(item));
        }

        return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, this.resolveRecursively(item)]));
    }

    private resolveFromCache(hash: number | string, type: "shape" | "entity"): unknown {
        const cached = this.cacheHelper.checkCache(hash);
        if (!cached) {
            throw new Error(
                `${type === "shape" ? "Shape" : "Entity"} with hash ${hash} not found in cache. ` +
                "The cache may have been cleaned. Please regenerate the object."
            );
        }
        return cached;
    }
}

/**
 * ResultSerializer handles the conversion of OCCT shapes and documents back to serializable references.
 * 
 * When returning results from the worker, actual shape/document objects cannot be passed directly
 * to the main thread. Instead, they are cached and a reference is returned.
 * 
 * This class provides methods to serialize various result types:
 * - Single shapes -> ShapeReference
 * - Assembly documents -> DocumentReference
 * - Arrays of shapes  
 * - ObjectDefinition structures (compound shapes with associated data)
 * - Arbitrary nested structures containing shapes/documents
 * - Non-shape values (passed through unchanged)
 * 
 * The serialization is **recursive**, meaning shapes and documents nested at any depth within
 * objects or arrays will be properly converted to references.
 */
export class ResultSerializer {
    constructor(private readonly cacheHelper: CacheHelper) {}

    /**
     * Serializes a result for transmission back to the main thread.
     * Recursively traverses the result to find and serialize all OCCT shapes and documents.
     * 
     * @param result - The result from an OCCT operation
     * @returns A serializable version with references instead of actual objects
     */
    serializeResult(result: unknown): unknown {
        return this.serializeRecursively(result);
    }

    private serializeRecursively(value: unknown): unknown {
        if (value === null || value === undefined) {
            return value;
        }

        if (typeof value !== "object") {
            return value;
        }

        if (ArrayBuffer.isView(value)) {
            return value;
        }

        if (this.cacheHelper.isShape(value) && !Array.isArray(value)) {
            return createShapeReference((value as { hash: number | string }).hash);
        }

        if (this.cacheHelper.isEntityHandle(value) && !Array.isArray(value)) {
            return createEntityReference((value as { hash: number | string }).hash);
        }

        if (Array.isArray(value)) {
            if (value.length > 0 && this.cacheHelper.isShape(value[0])) {
                return value.map(shape => createShapeReference(shape.hash));
            }
            return value.map(item => this.serializeRecursively(item));
        }

        if (this.isObjectDefinition(value)) {
            return this.serializeObjectDefinition(value);
        }

        return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, this.serializeRecursively(item)]));
    }

    private isObjectDefinition(value: unknown): value is ObjectDefinitionLike {
        const obj = value as Record<string, unknown>;
        return (
            "compound" in obj &&
            "data" in obj &&
            "shapes" in obj &&
            Array.isArray(obj["shapes"]) &&
            obj["shapes"].length > 0
        );
    }

    private serializeObjectDefinition(objDef: ObjectDefinitionLike): ObjectDefinitionLike {
        return {
            ...objDef,
            compound: createShapeReference((objDef.compound as { hash: number | string }).hash),
            shapes: objDef.shapes.map(s => ({
                id: s.id,
                shape: createShapeReference(s.shape.hash),
            })),
        };
    }
}

interface ObjectDefinitionLike {
    compound: unknown;
    data: unknown;
    shapes: Array<{ id: string | number; shape: { hash: number | string } }>;
}

/**
 * FunctionPathResolver handles calling functions on nested objects by path.
 * 
 * Instead of hardcoded path depth checks, this resolver can handle any depth
 * of nesting in the OpenCascade service object.
 * 
 * @example
 * // Calling "shapes.wire.createCircleWire" 
 * resolver.callFunction(openCascade, "shapes.wire.createCircleWire", inputs)
 * // Equivalent to: openCascade.shapes.wire.createCircleWire(inputs)
 */
export class FunctionPathResolver {
    /**
     * Resolves a function path and calls it with the provided inputs.
     * 
     * @param root - The root object (OpenCascade service)
     * @param functionPath - Dot-separated path to the function (e.g., "shapes.wire.createCircleWire")
     * @param inputs - The inputs to pass to the function
     * @returns The result of calling the function
     * @throws Error if the path cannot be resolved or the function doesn't exist
     */
    callFunction(root: unknown, functionPath: string, inputs: unknown): unknown {
        if (root === null || typeof root !== "object") {
            throw new Error(`Cannot resolve "${functionPath}": the root is not an object`);
        }
        return callByPath(root, functionPath, inputs);
    }
}
