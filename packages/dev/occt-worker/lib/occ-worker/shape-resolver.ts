import { CacheHelper } from "./cache-helper";
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

    /**
     * Internal recursive resolution method.
     * Handles all cases: primitives, shape references, document references, arrays, and objects.
     * 
     * NOTE: This method is synchronous. File/Blob objects that slip through from the main thread
     * cannot be converted here (would require async). They should be converted on the API side
     * using prepareStepData() before being sent to the worker.
     */
    private resolveRecursively(value: unknown): unknown {
        // Handle null/undefined
        if (value === null || value === undefined) {
            return value;
        }

        // Handle primitives (string, number, boolean, etc.)
        if (typeof value !== "object") {
            return value;
        }

        // Preserve typed arrays (Uint8Array, Float32Array, ArrayBuffer, etc.) as-is
        // These are used for binary data like STEP/glTF file contents
        if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) {
            return value;
        }

        // Detect File/Blob objects that were incorrectly passed to worker
        // File extends Blob, so checking Blob covers both
        if (typeof Blob !== "undefined" && value instanceof Blob) {
            throw new Error(
                "File/Blob objects cannot be passed directly to the worker. " +
                "The data should have been converted to ArrayBuffer on the main thread. " +
                "This is a bug in the API layer - please report it."
            );
        }

        // Check if this is a shape reference
        if (isShapeReference(value)) {
            return this.resolveFromCache(value.hash, "shape");
        }

        // Check if this is an entity reference (non-shape OCCT object)
        if (isEntityReference(value)) {
            return this.resolveFromCache(value.hash, "entity");
        }

        // Handle arrays - recursively resolve each element
        if (Array.isArray(value)) {
            return value.map(item => this.resolveRecursively(item));
        }

        // Handle plain objects - recursively resolve each property
        const resolved: Record<string, unknown> = {};
        for (const key of Object.keys(value as object)) {
            resolved[key] = this.resolveRecursively((value as Record<string, unknown>)[key]);
        }
        return resolved;
    }

    /**
     * Retrieves an object from the cache by its hash.
     * 
     * @param hash - The hash identifier of the cached object
     * @param type - The type of object ("shape" or "entity")
     * @returns The cached object
     * @throws Error if the object is not found in cache
     */
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

    /**
     * Recursively serializes a value, converting OCCT objects to references.
     */
    private serializeRecursively(value: unknown): unknown {
        // Handle null/undefined
        if (value === null || value === undefined) {
            return value;
        }

        // Handle primitives (string, number, boolean, etc.)
        if (typeof value !== "object") {
            return value;
        }

        // Preserve typed arrays (Uint8Array, Float32Array, etc.) as-is
        // These are used for binary data like STEP/glTF exports
        if (ArrayBuffer.isView(value)) {
            return value;
        }

        // Check if this is a shape (TopoDS_Shape - has ShapeType method)
        if (this.cacheHelper.isShape(value) && !Array.isArray(value)) {
            return createShapeReference((value as { hash: number | string }).hash);
        }

        // Check if this is a non-shape OCCT entity (e.g., document handle)
        if (this.cacheHelper.isEntityHandle(value) && !Array.isArray(value)) {
            return createEntityReference((value as { hash: number | string }).hash);
        }

        // Handle arrays - check if it's an array of OCCT shapes or mixed content
        if (Array.isArray(value)) {
            // Check if it's an array of shapes (all items have ShapeType)
            if (value.length > 0 && this.cacheHelper.isShape(value[0])) {
                return value.map(shape => createShapeReference(shape.hash));
            }
            // Otherwise recursively serialize each element
            return value.map(item => this.serializeRecursively(item));
        }

        // Check for ObjectDefinition structure (compound + shapes + data)
        // This is a special case that needs specific handling
        if (this.isObjectDefinition(value)) {
            return this.serializeObjectDefinition(value);
        }

        // Handle plain objects - recursively serialize each property
        const serialized: Record<string, unknown> = {};
        for (const key of Object.keys(value as object)) {
            serialized[key] = this.serializeRecursively((value as Record<string, unknown>)[key]);
        }
        return serialized;
    }

    /**
     * Type guard to check if value is an ObjectDefinition.
     * ObjectDefinition has compound, data, and shapes properties.
     */
    private isObjectDefinition(value: unknown): value is ObjectDefinitionLike {
        if (value === null || typeof value !== "object") {
            return false;
        }
        const obj = value as Record<string, unknown>;
        return (
            "compound" in obj &&
            "data" in obj &&
            "shapes" in obj &&
            Array.isArray(obj.shapes) &&
            obj.shapes.length > 0
        );
    }

    /**
     * Serializes an ObjectDefinition structure.
     * Converts the compound and individual shapes to references while preserving data.
     */
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

/**
 * Type for ObjectDefinition-like structures.
 */
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
        const pathParts = functionPath.split(".");
        
        // Navigate to the parent object containing the function
        let current: unknown = root;
        for (let i = 0; i < pathParts.length - 1; i++) {
            if (current === null || current === undefined || typeof current !== "object") {
                throw new Error(`Cannot resolve path "${functionPath}": "${pathParts[i]}" is not an object`);
            }
            current = (current as Record<string, unknown>)[pathParts[i]];
        }

        // Get and call the function
        const functionName = pathParts[pathParts.length - 1];
        if (current === null || current === undefined || typeof current !== "object") {
            throw new Error(`Cannot resolve path "${functionPath}": parent is not an object`);
        }
        
        const fn = (current as Record<string, unknown>)[functionName];
        if (typeof fn !== "function") {
            throw new Error(`"${functionPath}" is not a function`);
        }

        return fn.call(current, inputs);
    }
}
