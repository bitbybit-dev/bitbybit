import { BitbybitOcctModule } from "@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt";
import { Models } from "@bitbybit-dev/occt";

export class CacheHelper {

    hashesFromPreviousRun = {};
    usedHashes = {};
    argCache = {};

    constructor(private readonly occ: BitbybitOcctModule) { }

    cleanAllCache(): void {
        // Clean all entries in argCache, not just usedHashes
        const allCacheKeys = Object.keys(this.argCache);

        allCacheKeys.forEach(hash => {
            if (this.argCache[hash]) {
                try {
                    const cachedItem = this.argCache[hash];
                    // Only attempt to clean and delete OCCT objects
                    if (this.isOCCTObject(cachedItem)) {
                        // Handle arrays of OCCT objects
                        if (Array.isArray(cachedItem)) {
                            cachedItem.forEach(item => {
                                try {
                                    // Shape-specific cleanup only for TopoDS_Shape objects
                                    if (this.isShape(item)) {
                                        this.occ.BRepTools_Clean_Force(item, true);
                                        this.occ.BRepTools_CleanGeometry(item);
                                    }
                                    item.delete();
                                } catch (error) {
                                    // Ignore errors for already deleted objects
                                }
                            });
                        } else {
                            // Shape-specific cleanup only for TopoDS_Shape objects
                            if (this.isShape(cachedItem)) {
                                this.occ.BRepTools_Clean_Force(cachedItem, true);
                                this.occ.BRepTools_CleanGeometry(cachedItem);
                            }
                            cachedItem.delete();
                        }
                    }
                }
                catch (error) {
                    // Ignore errors when cleaning objects that may already be deleted
                }
            }
        });

        this.argCache = {};
        this.usedHashes = {};
        this.hashesFromPreviousRun = {};
    }

    cleanCacheForHash(hash: string): void {
        if (this.argCache[hash]) {
            try {
                const cachedItem = this.argCache[hash];
                // Only attempt to clean and delete OCCT objects
                if (this.isOCCTObject(cachedItem)) {
                    // Handle arrays of OCCT objects
                    if (Array.isArray(cachedItem)) {
                        cachedItem.forEach(item => {
                            try {
                                // Shape-specific cleanup only for TopoDS_Shape objects
                                if (this.isShape(item)) {
                                    this.occ.BRepTools_Clean_Force(item, true);
                                    this.occ.BRepTools_CleanGeometry(item);
                                }
                                item.delete();
                            } catch (error) {
                                // Ignore errors for already deleted objects
                            }
                        });
                    } else {
                        // Shape-specific cleanup only for TopoDS_Shape objects
                        if (this.isShape(cachedItem)) {
                            this.occ.BRepTools_Clean_Force(cachedItem, true);
                            this.occ.BRepTools_CleanGeometry(cachedItem);
                        }
                        cachedItem.delete();
                    }
                }
            }
            catch (error) {
                // Ignore errors when cleaning objects that may already be deleted
            }
        }
        delete this.argCache[hash];
        delete this.usedHashes[hash];
        delete this.hashesFromPreviousRun[hash];
    }

    cleanUpCache(): void {
        // Clean up cache entries that were used in previous run but not in current run
        // This helps manage memory by removing unused cached shapes

        const usedHashKeys = Object.keys(this.usedHashes);
        const hashesFromPreviousRunKeys = Object.keys(this.hashesFromPreviousRun);

        // Find hashes that exist in previous run but not in current run
        // These are the ones we should clean up
        let hashesToDelete: string[] = [];
        if (hashesFromPreviousRunKeys.length > 0) {
            hashesToDelete = hashesFromPreviousRunKeys.filter(hash => !usedHashKeys.includes(hash));
        }

        // Delete unused objects and clean them from cache
        if (hashesToDelete.length > 0) {
            hashesToDelete.forEach(hash => {
                if (this.argCache[hash]) {
                    try {
                        const cachedItem = this.argCache[hash];
                        // Only try to clean and delete if it's an OCCT object
                        if (this.isOCCTObject(cachedItem)) {
                            // Handle arrays of OCCT objects
                            if (Array.isArray(cachedItem)) {
                                cachedItem.forEach(item => {
                                    try {
                                        // Shape-specific cleanup only for TopoDS_Shape objects
                                        if (this.isShape(item)) {
                                            this.occ.BRepTools_Clean_Force(item, true);
                                            this.occ.BRepTools_CleanGeometry(item);
                                        }
                                        item.delete();
                                    } catch {
                                        // Ignore errors for already deleted objects
                                    }
                                });
                            } else {
                                // Shape-specific cleanup only for TopoDS_Shape objects
                                if (this.isShape(cachedItem)) {
                                    this.occ.BRepTools_Clean_Force(cachedItem, true);
                                    this.occ.BRepTools_CleanGeometry(cachedItem);
                                }
                                cachedItem.delete();
                            }
                        }
                    } catch {
                        // Ignore errors for already deleted or invalid objects
                    }
                    delete this.argCache[hash];
                }
                delete this.usedHashes[hash];
            });
        }

        // Update hashesFromPreviousRun to be current usedHashes for next cleanup cycle
        this.hashesFromPreviousRun = { ...this.usedHashes };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isOCCTObject(obj: any): boolean {
        return obj !== undefined && obj !== null && (!Array.isArray(obj) && obj.$$ !== undefined) || (Array.isArray(obj) && obj.length > 0 && obj[0].$$ !== undefined);
    }

    /**
     * Checks if an object is a TopoDS_Shape (or subclass).
     * Shapes have ShapeType() method which returns the shape type enum.
     * This is a performant check - just property access + typeof, no function call.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isShape(obj: any): boolean {
        return obj !== undefined && 
               obj !== null && 
               obj.$$ !== undefined && 
               typeof obj.ShapeType === "function";
    }

    /**
     * Checks if an object is a non-shape OCCT entity (e.g., document handle, other handles).
     * These are OCCT objects (have $$) but do NOT have ShapeType() method.
     * This distinguishes them from TopoDS_Shape objects.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isEntityHandle(obj: any): boolean {
        return obj !== undefined && 
               obj !== null && 
               obj.$$ !== undefined && 
               typeof obj.ShapeType !== "function"; // Key differentiator: entities don't have ShapeType
    }

    /** Hashes input arguments and checks the cache for that hash.
     * It returns a copy of the cached object if it exists, but will
     * call the `cacheMiss()` callback otherwise. The result will be
     * added to the cache if `GUIState["Cache?"]` is true.
     *
     * If `args.inputs` contains a large/binary payload (e.g. STEP file data
     * as a string > LARGE_STRING_THRESHOLD, ArrayBuffer, TypedArray, Blob or
     * File), the payload itself is NOT fed into the hash. Instead a compact
     * content digest (length/byteLength + a rolling hash of the content) is
     * used so that the operation can still be cached normally. This avoids
     * JSON.stringify crashes / memory blowups on huge inputs while keeping
     * the hash content-sensitive - two different payloads produce different
     * digests, identical payloads produce identical digests (a cache hit).
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cacheOp(args: any, cacheMiss: () => any): any {
        let toReturn = null;
        // Replace any large/binary payloads with a compact digest before hashing
        // so huge STEP/IGES inputs can still participate in the cache.
        const hashableArgs = this.toHashableArgs(args);
        const curHash = this.computeHash(hashableArgs);
        this.usedHashes[curHash] = curHash;
        this.hashesFromPreviousRun[curHash] = curHash;
        const check = this.checkCache(curHash);
        if (check) {
            if (this.isOCCTObject(check)) {
                toReturn = check;
                toReturn.hash = check.hash;
            } else if (check.value) {
                toReturn = check.value;
            }
        } else {
            toReturn = cacheMiss();
            if (Array.isArray(toReturn) && this.isOCCTObject(toReturn)) {
                toReturn.forEach((r, index) => {
                    const itemHash = this.computeHash({ ...hashableArgs, index });
                    r.hash = itemHash;
                    this.addToCache(itemHash, r);
                });
            } else {
                if (this.isOCCTObject(toReturn)) {
                    toReturn.hash = curHash;
                    this.addToCache(curHash, toReturn);
                } else if (toReturn && toReturn.compound && toReturn.data && toReturn.shapes && toReturn.shapes.length > 0) {
                    // Handle ObjectDefinition structure
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const objDef: Models.OCCT.ObjectDefinition<any, any> = toReturn;
                    const compoundHash = this.computeHash({ ...hashableArgs, index: "compound" });
                    objDef.compound.hash = compoundHash;
                    this.addToCache(compoundHash, objDef.compound);
                    objDef.shapes.forEach((s, index) => {
                        const itemHash = this.computeHash({ ...hashableArgs, index });
                        s.shape.hash = itemHash;
                        this.addToCache(itemHash, s.shape);
                    });
                    this.addToCache(curHash, { value: objDef });
                } else if (toReturn && typeof toReturn === "object" && "success" in toReturn && "document" in toReturn && this.isEntityHandle(toReturn.document)) {
                    // Handle AssemblyDocumentResult structure - cache the document separately
                    const docHash = this.computeHash({ ...hashableArgs, index: "document" });
                    toReturn.document.hash = docHash;
                    this.addToCache(docHash, toReturn.document);
                    this.addToCache(curHash, { value: toReturn });
                }
                else {
                    // Some other structure (e.g. the SVG importer returns
                    // { shapes: [{ shape, ...metadata }], viewBox, warnings }). Recursively hash and
                    // cache every shape nested at any depth so they get valid hashes - the result
                    // serializer turns hashed shapes into references and the input resolver restores
                    // them. Mirrors the per-shape handling of the ObjectDefinition branch above.
                    this.hashNestedShapes(toReturn, hashableArgs, "result");
                    this.addToCache(curHash, { value: toReturn });
                }
            }
        }
        return toReturn;
    }

    /**
     * Recursively assign a stable hash to every TopoDS_Shape nested anywhere in a result value and
     * add it to the cache, so shapes returned inside arbitrary structures (e.g. the SVG importer's
     * `{ shapes: [{ shape, ... }], ... }`) are cached exactly like shapes returned directly or inside
     * an ObjectDefinition. The hash is derived from the operation hash plus the value's path, so it is
     * stable across runs (enabling cache hits) and unique per shape. embind objects (shapes/entity
     * handles) are never recursed into; only shapes are hashed here.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hashNestedShapes(value: any, hashableArgs: any, path: string): void {
        if (value === null || value === undefined || typeof value !== "object") {
            return;
        }
        // An embind object (shape or entity handle): hash shapes, never recurse into its internals.
        if (value.$$ !== undefined) {
            if (this.isShape(value) && value.hash === undefined) {
                const itemHash = this.computeHash({ ...hashableArgs, path });
                value.hash = itemHash;
                this.addToCache(itemHash, value);
            }
            return;
        }
        if (Array.isArray(value)) {
            value.forEach((item, index) => this.hashNestedShapes(item, hashableArgs, `${path}[${index}]`));
            return;
        }
        for (const key of Object.keys(value)) {
            this.hashNestedShapes(value[key], hashableArgs, `${path}.${key}`);
        }
    }

    /** Returns the cached object if it exists and is valid, or null otherwise. */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    checkCache(hash: string | number): any {
        const cachedShape = this.argCache[hash];
        if (!cachedShape) {
            return null;
        }

        // Check if the cached shape is still valid (not deleted)
        if (this.isOCCTObject(cachedShape)) {
            // Handle arrays of OCCT objects
            if (Array.isArray(cachedShape)) {
                // Check if any shape in the array has been deleted
                for (const shape of cachedShape) {
                    try {
                        if (shape.IsNull && shape.IsNull()) {
                            // One of the shapes is null, invalidate entire cache entry
                            delete this.argCache[hash];
                            return null;
                        }
                    } catch (e) {
                        // If calling IsNull() throws an error, the object has been deleted
                        delete this.argCache[hash];
                        return null;
                    }
                }
            } else {
                // Handle single OCCT object
                try {
                    // Check if the shape has been deleted by checking if IsNull() can be called
                    // and if the shape is null or invalid
                    if (cachedShape.IsNull && cachedShape.IsNull()) {
                        // Shape is null, remove from cache and return null
                        delete this.argCache[hash];
                        return null;
                    }
                } catch (e) {
                    // If calling IsNull() throws an error, the object has been deleted
                    // Remove from cache and return null
                    delete this.argCache[hash];
                    return null;
                }
            }
        }

        return cachedShape;
    }
    /** Adds this `shape` to the cache, indexable by `hash`. */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addToCache(hash: string | number, shape: any): string | number {
        const cacheShape = shape;
        // Only set hash property on objects, not primitives
        if (cacheShape !== null && typeof cacheShape === "object") {
            cacheShape.hash = hash; // This is the cached version of the object
        }
        this.argCache[hash] = cacheShape;
        return hash;
    }

    /** This function computes a 32-bit integer hash given a set of `arguments`.
     * If `raw` is true, the raw set of sanitized arguments will be returned instead.
     *
     * Large / binary inputs (e.g. STEP file data) are replaced by a compact
     * content digest via `toHashableArgs` before stringifying, so this method
     * is safe to call with huge payloads - it neither crashes nor stringifies
     * megabytes of data, while keeping the hash content-sensitive.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    computeHash(args: any, raw?: boolean): number | string {
        let argsString = JSON.stringify(this.toHashableArgs(args));
        argsString = argsString.replace(/("ptr":(-?[0-9]*?),)/g, "");
        argsString = argsString.replace(/("ptr":(-?[0-9]*))/g, "");
        if (argsString.includes("ptr")) { console.error("YOU DONE MESSED UP YOUR REGEX."); }
        const hashString = Math.random.toString() + argsString;
        if (raw) { return hashString; }
        return this.stringToHash(hashString);
    }

    /** Threshold above which a string value is considered "large" and triggers
     * cache bypass. 64 KB is comfortably above any realistic DTO field but well
     * below a typical STEP/IGES payload. */
    static readonly LARGE_STRING_THRESHOLD = 64 * 1024;

    /** Returns true when `args.inputs` (or `args` itself, if no `inputs`
     * wrapper is present) contains a value that is binary or an oversized
     * string. Only the immediate properties of `inputs` are inspected -
     * STEP/IGES payloads always sit at the top level of the DTO
     * (`stepData`, `filetext`, etc.), so a shallow O(N) check is enough.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hasLargeOrBinaryInput(args: any): boolean {
        const inputs = (args && typeof args === "object" && args.inputs && typeof args.inputs === "object")
            ? args.inputs
            : args;
        if (!inputs || typeof inputs !== "object") return false;
        for (const key of Object.keys(inputs)) {
            const v = inputs[key];
            if (v === null || v === undefined) continue;
            if (typeof v === "string") {
                if (v.length > CacheHelper.LARGE_STRING_THRESHOLD) return true;
                continue;
            }
            if (typeof v !== "object") continue;
            if (typeof ArrayBuffer !== "undefined" && v instanceof ArrayBuffer) return true;
            if (ArrayBuffer.isView && ArrayBuffer.isView(v as ArrayBufferView)) return true;
            if (typeof Blob !== "undefined" && v instanceof Blob) return true;
        }
        return false;
    }

    /** Builds a representation of `args` that is cheap and safe to JSON.stringify
     * for hashing, by replacing any large string / binary payload found in the
     * immediate input properties with a compact content digest. Returns the
     * original `args` unchanged when there is nothing large/binary to replace,
     * so hashes for ordinary inputs are byte-for-byte identical to before.
     * Idempotent - running it on already-digested args is a cheap no-op.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toHashableArgs(args: any): any {
        if (!args || typeof args !== "object") return args;
        const hasInputsWrapper = args.inputs && typeof args.inputs === "object";
        const source = hasInputsWrapper ? args.inputs : args;
        if (!source || typeof source !== "object") return args;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let sanitized: any = null;
        for (const key of Object.keys(source)) {
            const digest = this.digestIfLargeOrBinary(source[key]);
            if (digest !== undefined) {
                if (!sanitized) { sanitized = Array.isArray(source) ? [...source] : { ...source }; }
                sanitized[key] = digest;
            }
        }
        if (!sanitized) return args;
        return hasInputsWrapper ? { ...args, inputs: sanitized } : sanitized;
    }

    /** Returns a compact, JSON-serializable content digest for a value that is a
     * large string, ArrayBuffer, TypedArray, Blob or File - or `undefined` when
     * the value is small/ordinary and should be hashed as-is. The digest is
     * content-sensitive (different payloads produce different digests) but tiny,
     * so it keeps the cache key stable without stringifying the whole payload.
     * Blob/File content cannot be read synchronously, so those fall back to
     * metadata (size/type, plus name/lastModified for File).
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    digestIfLargeOrBinary(v: any): any {
        if (v === null || v === undefined) return undefined;
        if (typeof v === "string") {
            if (v.length > CacheHelper.LARGE_STRING_THRESHOLD) {
                return { __largeStringDigest__: this.stringToHash(v), length: v.length };
            }
            return undefined;
        }
        if (typeof v !== "object") return undefined;
        if (typeof ArrayBuffer !== "undefined" && v instanceof ArrayBuffer) {
            return { __binaryDigest__: this.bytesToHash(new Uint8Array(v)), byteLength: v.byteLength };
        }
        if (ArrayBuffer.isView && ArrayBuffer.isView(v as ArrayBufferView)) {
            const view = v as ArrayBufferView;
            const bytes = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
            return { __binaryDigest__: this.bytesToHash(bytes), byteLength: view.byteLength };
        }
        if (typeof Blob !== "undefined" && v instanceof Blob) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const meta: any = { __blobDigest__: true, size: v.size, type: v.type };
            if (typeof File !== "undefined" && v instanceof File) {
                meta.name = v.name;
                meta.lastModified = v.lastModified;
            }
            return meta;
        }
        return undefined;
    }

    /** Computes a 32-bit rolling hash over raw bytes, mirroring `stringToHash`. */
    bytesToHash(bytes: Uint8Array): number {
        let hash = 0;
        if (bytes.length === 0) { return hash; }
        for (let i = 0; i < bytes.length; i++) {
            // tslint:disable-next-line: no-bitwise
            hash = ((hash << 5) - hash) + bytes[i];
            // tslint:disable-next-line: no-bitwise
            hash = hash & hash;
        }
        return hash;
    }

    /** This function converts a string to a 32bit integer. */
    stringToHash(str: string): number {
        let hash = 0;
        if (str.length === 0) { return hash; }
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            // tslint:disable-next-line: no-bitwise
            hash = ((hash << 5) - hash) + char;
            // tslint:disable-next-line: no-bitwise
            hash = hash & hash;
        }
        return hash;
    }

    /** This function returns a version of the `inputArray` without the `objectToRemove`. */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    remove(inputArray: any[], objectToRemove: any): any[] {
        return inputArray.filter((el) => {
            return el.hash !== objectToRemove.hash ||
                el.ptr !== objectToRemove.ptr;
        });
    }

}
