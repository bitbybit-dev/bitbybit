
export class CacheHelper {

    hashesFromPreviousRun = {};
    usedHashes = {};
    argCache = {};
    jscadObjectHashes = new Set<string | number>(); // Track which hashes contain JSCAD objects

    cleanAllCache(): void {
        // Clean all entries in argCache, not just usedHashes
        const allCacheKeys = Object.keys(this.argCache);

        allCacheKeys.forEach(hash => {
            if (this.argCache[hash]) {
                try {
                    const cachedItem = this.argCache[hash];
                    // Only attempt to delete JSCAD objects
                    if (this.isJSCADObject(cachedItem)) {
                        // Handle arrays of JSCAD objects
                        if (Array.isArray(cachedItem)) {
                            cachedItem.forEach(obj => {
                                try {
                                    if (obj.delete) {
                                        obj.delete();
                                    }
                                } catch (error) {
                                    // Ignore errors for already deleted objects
                                }
                            });
                        } else {
                            if (cachedItem.delete) {
                                cachedItem.delete();
                            }
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
        this.jscadObjectHashes.clear();
    }

    cleanCacheForHash(hash: string): void {
        if (this.argCache[hash]) {
            try {
                const cachedItem = this.argCache[hash];
                // Only attempt to delete JSCAD objects
                if (this.isJSCADObject(cachedItem)) {
                    // Handle arrays of JSCAD objects
                    if (Array.isArray(cachedItem)) {
                        cachedItem.forEach(obj => {
                            try {
                                if (obj.delete) {
                                    obj.delete();
                                }
                            } catch (error) {
                                // Ignore errors for already deleted objects
                            }
                        });
                    } else {
                        if (cachedItem.delete) {
                            cachedItem.delete();
                        }
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
        this.jscadObjectHashes.delete(hash);
    }

    cleanUpCache(): void {
        // Clean up cache entries that were used in previous run but not in current run
        // This helps manage memory by removing unused cached objects
        
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
                        const obj = this.argCache[hash];
                        // Only try to delete if it's a JSCAD object
                        if (this.isJSCADObject(obj)) {
                            // Handle arrays of JSCAD objects
                            if (Array.isArray(obj)) {
                                obj.forEach(o => {
                                    try {
                                        if (o.delete) {
                                            o.delete();
                                        }
                                    } catch {
                                        // Ignore errors for already deleted objects
                                    }
                                });
                            } else {
                                if (obj.delete) {
                                    obj.delete();
                                }
                            }
                        }
                    } catch {
                        // Ignore errors for already deleted or invalid objects
                    }
                    delete this.argCache[hash];
                }
                delete this.usedHashes[hash];
                this.jscadObjectHashes.delete(hash);
            });
        }
        
        // Update hashesFromPreviousRun to be current usedHashes for next cleanup cycle
        this.hashesFromPreviousRun = { ...this.usedHashes };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isJSCADObject(obj: any): boolean {
        // JSCAD objects typically have specific properties or methods
        // Check for common JSCAD object characteristics
        return obj !== undefined && obj !== null && (
            (!Array.isArray(obj) && typeof obj === "object" && obj.delete !== undefined) ||
            (Array.isArray(obj) && obj.length > 0 && typeof obj[0] === "object" && obj[0].delete !== undefined)
        );
    }

    /** Hashes input arguments and checks the cache for that hash.
     * It returns a copy of the cached object if it exists, but will
     * call the `cacheMiss()` callback otherwise. The result will be
     * added to the cache.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cacheOp(args: any, cacheMiss: () => any): any {
        let toReturn = null;
        const curHash = this.computeHash(args);
        this.usedHashes[curHash] = curHash;
        this.hashesFromPreviousRun[curHash] = curHash;
        const check = this.checkCache(curHash);
        if (check) {
            if (this.isJSCADObject(check)) {
                toReturn = check;
                toReturn.hash = check.hash;
            } else if (check.value) {
                toReturn = check.value;
            }
        } else {
            toReturn = cacheMiss();
            if (Array.isArray(toReturn) && this.isJSCADObject(toReturn)) {
                toReturn.forEach((r, index) => {
                    const itemHash = this.computeHash({ ...args, index });
                    r.hash = itemHash;
                    this.addToCache(itemHash, r);
                    // Track individual element hashes so they can be cleaned up
                    this.usedHashes[itemHash] = itemHash;
                    this.hashesFromPreviousRun[itemHash] = itemHash;
                });
            } else {
                if (this.isJSCADObject(toReturn)) {
                    toReturn.hash = curHash;
                    this.addToCache(curHash, toReturn);
                }
                else {
                    this.addToCache(curHash, { value: toReturn });
                }
            }
        }
        return toReturn;
    }
    /** Returns the cached object if it exists and is valid, or null otherwise. */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    checkCache(hash: string | number): any {
        const cachedObject = this.argCache[hash];
        if (!cachedObject) {
            return null;
        }
        
        // For wrapped values (non-JSCAD objects stored as { value: ... })
        if (cachedObject.value !== undefined && !this.isJSCADObject(cachedObject)) {
            return cachedObject;
        }
        
        // If this hash was tracked as a JSCAD object, verify it's still valid
        if (this.jscadObjectHashes.has(hash)) {
            const isStillValid = this.isJSCADObject(cachedObject);
            if (!isStillValid) {
                // Object was a JSCAD object but is no longer valid
                delete this.argCache[hash];
                this.jscadObjectHashes.delete(hash);
                return null;
            }
        }
        
        return cachedObject;
    }
    /** Adds this `object` to the cache, indexable by `hash`. */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addToCache(hash: string | number, object: any): string | number {
        const cacheObject = object;
        // Only set hash property on objects, not primitives
        if (cacheObject !== null && typeof cacheObject === "object") {
            cacheObject.hash = hash;
        }
        this.argCache[hash] = cacheObject;
        
        // Track if this is a JSCAD object
        if (this.isJSCADObject(cacheObject)) {
            this.jscadObjectHashes.add(hash);
        }
        
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
            // Keep elements where hash is different OR ptr is different
            // (remove only when BOTH hash AND ptr match)
            return el.hash !== objectToRemove.hash ||
                el.ptr !== objectToRemove.ptr;
        });
    }

}
