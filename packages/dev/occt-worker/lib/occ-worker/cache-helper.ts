import { BitbybitOcctModule } from "@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt";
import { Models } from "@bitbybit-dev/occt";

/** Finishes a cyrb53 hash: the two 32-bit lanes are avalanched into each other and 21 bits of one
 * are stacked above the 32 bits of the other, giving a non-negative safe integer below 2^53. */
function foldHashLanes(lane1: number, lane2: number): number {
    let h1 = Math.imul(lane1 ^ (lane1 >>> 16), 2246822507);
    h1 ^= Math.imul(lane2 ^ (lane2 >>> 13), 3266489909);
    let h2 = Math.imul(lane2 ^ (lane2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

export class CacheHelper {

    hashesFromPreviousRun: Record<string, string | number> = {};
    usedHashes: Record<string, string | number> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    argCache: Record<string, any> = {};

    constructor(private readonly occ: BitbybitOcctModule) { }

    cleanAllCache(): void {
        const allCacheKeys = Object.keys(this.argCache);

        allCacheKeys.forEach(hash => {
            if (this.argCache[hash]) {
                try {
                    const cachedItem = this.argCache[hash];
                    if (this.isOCCTObject(cachedItem)) {
                        if (Array.isArray(cachedItem)) {
                            cachedItem.forEach(item => {
                                try {
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
                            if (this.isShape(cachedItem)) {
                                this.occ.BRepTools_Clean_Force(cachedItem, true);
                                this.occ.BRepTools_CleanGeometry(cachedItem);
                            }
                            cachedItem.delete();
                        }
                    }
                }
                catch {
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
                if (this.isOCCTObject(cachedItem)) {
                    if (Array.isArray(cachedItem)) {
                        cachedItem.forEach(item => {
                            try {
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
                        if (this.isShape(cachedItem)) {
                            this.occ.BRepTools_Clean_Force(cachedItem, true);
                            this.occ.BRepTools_CleanGeometry(cachedItem);
                        }
                        cachedItem.delete();
                    }
                }
            }
            catch {
                // Ignore errors when cleaning objects that may already be deleted
            }
        }
        delete this.argCache[hash];
        delete this.usedHashes[hash];
        delete this.hashesFromPreviousRun[hash];
    }

    cleanUpCache(): void {
        const usedHashKeys = Object.keys(this.usedHashes);
        const hashesFromPreviousRunKeys = Object.keys(this.hashesFromPreviousRun);

        let hashesToDelete: string[] = [];
        if (hashesFromPreviousRunKeys.length > 0) {
            hashesToDelete = hashesFromPreviousRunKeys.filter(hash => !usedHashKeys.includes(hash));
        }

        if (hashesToDelete.length > 0) {
            hashesToDelete.forEach(hash => {
                if (this.argCache[hash]) {
                    try {
                        const cachedItem = this.argCache[hash];
                        if (this.isOCCTObject(cachedItem)) {
                            if (Array.isArray(cachedItem)) {
                                cachedItem.forEach(item => {
                                    try {
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
               typeof obj.ShapeType !== "function";
    }

    /** Hashes input arguments and checks the cache for that hash.
     * It returns a copy of the cached object if it exists, but will
     * call the `cacheMiss()` callback otherwise. The result will be
     * added to the cache if `GUIState["Cache?"]` is true.
     *
     * If `args.inputs` contains a large/binary payload (e.g. STEP file data
     * as a string > LARGE_STRING_THRESHOLD, ArrayBuffer, TypedArray, Blob or
     * File), the payload itself is NOT fed into the hash. Instead a compact
     * content digest (length/byteLength + a hash of the content) is
     * used so that the operation can still be cached normally. This avoids
     * JSON.stringify crashes / memory blowups on huge inputs while keeping
     * the hash content-sensitive - two different payloads produce different
     * digests, identical payloads produce identical digests (a cache hit).
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cacheOp(args: any, cacheMiss: () => any): any {
        let toReturn = null;
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
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const objDef: Models.OCCT.ObjectDefinition<any, any> = toReturn;
                    const compoundHash = this.computeHash({ ...hashableArgs, index: "compound" });
                    objDef.compound.hash = compoundHash;
                    this.addToCache(compoundHash, objDef.compound);
                    objDef.shapes!.forEach((s, index) => {
                        const itemHash = this.computeHash({ ...hashableArgs, index });
                        s.shape.hash = itemHash;
                        this.addToCache(itemHash, s.shape);
                    });
                    this.addToCache(curHash, { value: objDef });
                } else if (toReturn && typeof toReturn === "object" && "success" in toReturn && "document" in toReturn && this.isEntityHandle(toReturn.document)) {
                    const docHash = this.computeHash({ ...hashableArgs, index: "document" });
                    toReturn.document.hash = docHash;
                    this.addToCache(docHash, toReturn.document);
                    this.addToCache(curHash, { value: toReturn });
                }
                else {
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

        if (this.isOCCTObject(cachedShape)) {
            if (Array.isArray(cachedShape)) {
                for (const shape of cachedShape) {
                    try {
                        if (shape.IsNull && shape.IsNull()) {
                            delete this.argCache[hash];
                            return null;
                        }
                    } catch {
                        delete this.argCache[hash];
                        return null;
                    }
                }
            } else {
                try {
                    if (cachedShape.IsNull && cachedShape.IsNull()) {
                        delete this.argCache[hash];
                        return null;
                    }
                } catch {
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
        if (cacheShape !== null && typeof cacheShape === "object") {
            cacheShape.hash = hash;
        }
        this.argCache[hash] = cacheShape;
        return hash;
    }

    /** Computes the cache key of a set of `arguments`: a 53-bit hash of their JSON form, or that
     * JSON string itself when `raw` is true. A kernel handle among the arguments serializes as
     * nothing but the cache hash it carries - embind keeps the pointer under a non-enumerable `$$` -
     * so pointer identity never reaches the key and nothing has to be scrubbed from the string.
     *
     * The key is a pure function of the arguments, so equal inputs get equal keys across runs and
     * JavaScript engines, and a hit is served on the key alone, without comparing the arguments.
     * The key therefore has to separate distinct inputs by itself: among n live entries the chance
     * that two share a 53-bit key is about n^2 / 2^54, negligible at the cache threshold, where a
     * 32-bit key gives about n^2 / 2^33 - around one wrong hit per hundred runs at 10,000 entries.
     *
     * Large / binary inputs (e.g. STEP file data) are replaced by a compact
     * content digest via `toHashableArgs` before stringifying, so this method
     * is safe to call with huge payloads - it neither crashes nor stringifies
     * megabytes of data, while keeping the hash content-sensitive.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    computeHash(args: any, raw?: boolean): number | string {
        const argsString = JSON.stringify(this.toHashableArgs(args));
        if (raw) { return argsString; }
        return this.stringToHash(argsString);
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

    /** Hashes raw bytes the way `stringToHash` hashes code units, so ASCII text digests to the same
     * number whether it arrives as a string or as bytes. */
    bytesToHash(bytes: Uint8Array): number {
        let h1 = 0xdeadbeef;
        let h2 = 0x41c6ce57;
        for (let i = 0; i < bytes.length; i++) {
            const byte = bytes[i]!;
            h1 = Math.imul(h1 ^ byte, 2654435761);
            h2 = Math.imul(h2 ^ byte, 1597334677);
        }
        return foldHashLanes(h1, h2);
    }

    /** Hashes a string to a non-negative 53-bit safe integer with cyrb53. Both lanes are mixed with
     * `Math.imul`, so the result is the same on every JavaScript engine. */
    stringToHash(str: string): number {
        let h1 = 0xdeadbeef;
        let h2 = 0x41c6ce57;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            h1 = Math.imul(h1 ^ char, 2654435761);
            h2 = Math.imul(h2 ^ char, 1597334677);
        }
        return foldHashLanes(h1, h2);
    }

}
