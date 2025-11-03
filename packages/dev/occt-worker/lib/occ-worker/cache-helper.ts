import { OpenCascadeInstance } from "@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt";
import { Models } from "@bitbybit-dev/occt";

export class CacheHelper {

    hashesFromPreviousRun = {};
    usedHashes = {};
    argCache = {};

    constructor(private readonly occ: OpenCascadeInstance) { }

    cleanAllCache(): void {
        // Clean all entries in argCache, not just usedHashes
        const allCacheKeys = Object.keys(this.argCache);

        allCacheKeys.forEach(hash => {
            if (this.argCache[hash]) {
                try {
                    const cachedItem = this.argCache[hash];
                    // Only attempt to clean and delete OCCT shapes
                    if (this.isOCCTObject(cachedItem)) {
                        // Handle arrays of OCCT objects
                        if (Array.isArray(cachedItem)) {
                            cachedItem.forEach(shape => {
                                try {
                                    this.occ.BRepTools.Clean(shape, true);
                                    this.occ.BRepTools.CleanGeometry(shape);
                                    shape.delete();
                                } catch (error) {
                                    // Ignore errors for already deleted shapes
                                }
                            });
                        } else {
                            this.occ.BRepTools.Clean(cachedItem, true);
                            this.occ.BRepTools.CleanGeometry(cachedItem);
                            cachedItem.delete();
                        }
                    }
                }
                catch (error) {
                    // Ignore errors when cleaning shapes that may already be deleted
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
                // Only attempt to clean and delete OCCT shapes
                if (this.isOCCTObject(cachedItem)) {
                    // Handle arrays of OCCT objects
                    if (Array.isArray(cachedItem)) {
                        cachedItem.forEach(shape => {
                            try {
                                this.occ.BRepTools.Clean(shape, true);
                                this.occ.BRepTools.CleanGeometry(shape);
                                shape.delete();
                            } catch (error) {
                                // Ignore errors for already deleted shapes
                            }
                        });
                    } else {
                        this.occ.BRepTools.Clean(cachedItem, true);
                        this.occ.BRepTools.CleanGeometry(cachedItem);
                        cachedItem.delete();
                    }
                }
            }
            catch (error) {
                // Ignore errors when cleaning shapes that may already be deleted
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
        
        // Delete unused shapes and clean them from cache
        if (hashesToDelete.length > 0) {
            hashesToDelete.forEach(hash => {
                if (this.argCache[hash]) {
                    try {
                        const shape = this.argCache[hash];
                        // Only try to clean and delete if it's an OCCT object
                        if (this.isOCCTObject(shape)) {
                            // Handle arrays of OCCT objects
                            if (Array.isArray(shape)) {
                                shape.forEach(s => {
                                    try {
                                        this.occ.BRepTools.Clean(s, true);
                                        this.occ.BRepTools.CleanGeometry(s);
                                        s.delete();
                                    } catch {
                                        // Ignore errors for already deleted shapes
                                    }
                                });
                            } else {
                                this.occ.BRepTools.Clean(shape, true);
                                this.occ.BRepTools.CleanGeometry(shape);
                                shape.delete();
                            }
                        }
                    } catch {
                        // Ignore errors for already deleted or invalid shapes
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

    /** Hashes input arguments and checks the cache for that hash.
     * It returns a copy of the cached object if it exists, but will
     * call the `cacheMiss()` callback otherwise. The result will be
     * added to the cache if `GUIState["Cache?"]` is true.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cacheOp(args: any, cacheMiss: () => any): any {
        let toReturn = null;
        const curHash = this.computeHash(args);
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
                    const itemHash = this.computeHash({ ...args, index });
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
                        const compoundHash = this.computeHash({ ...args, index: "compound" });
                        objDef.compound.hash = compoundHash;
                        this.addToCache(compoundHash, objDef.compound);
                        objDef.shapes.forEach((s, index) => {
                            const itemHash = this.computeHash({ ...args, index });
                            s.shape.hash = itemHash;
                            this.addToCache(itemHash, s.shape);
                        });
                        this.addToCache(curHash, { value: objDef });
                    }
                    else {
                        this.addToCache(curHash, { value: toReturn });
                    }
                }        }
        return toReturn;
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
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    computeHash(args: any, raw?: boolean): number | string {
        let argsString = JSON.stringify(args);
        argsString = argsString.replace(/("ptr":(-?[0-9]*?),)/g, "");
        argsString = argsString.replace(/("ptr":(-?[0-9]*))/g, "");
        if (argsString.includes("ptr")) { console.error("YOU DONE MESSED UP YOUR REGEX."); }
        const hashString = Math.random.toString() + argsString;
        if (raw) { return hashString; }
        return this.stringToHash(hashString);
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
