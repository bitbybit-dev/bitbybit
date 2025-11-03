export declare class ManifoldWithId<U> {
    id: string;
    manifold: U;
}
export declare class ObjectDefinition<M, U> {
    compound?: U;
    manifolds?: ManifoldWithId<U>[];
    data?: M;
}

export class CacheHelper {

    hashesFromPreviousRun = {};
    usedHashes = {};
    argCache = {};
    manifoldObjectHashes = new Set<string | number>(); // Track which hashes contain Manifold objects

    cleanAllCache(): void {
        // Clean all entries in argCache, not just usedHashes
        const allCacheKeys = Object.keys(this.argCache);

        allCacheKeys.forEach(hash => {
            if (this.argCache[hash]) {
                try {
                    const cachedItem = this.argCache[hash];
                    // Only attempt to delete Manifold objects
                    if (this.isManifoldObject(cachedItem)) {
                        // Handle arrays of Manifold objects
                        if (Array.isArray(cachedItem)) {
                            cachedItem.forEach(manifold => {
                                try {
                                    manifold.delete();
                                } catch (error) {
                                    // Ignore errors for already deleted manifolds
                                }
                            });
                        } else {
                            cachedItem.delete();
                        }
                    }
                }
                catch (error) {
                    // Ignore errors when cleaning manifolds that may already be deleted
                }
            }
        });

        this.argCache = {};
        this.usedHashes = {};
        this.hashesFromPreviousRun = {};
        this.manifoldObjectHashes.clear();
    }

    cleanCacheForHash(hash: string): void {
        if (this.argCache[hash]) {
            try {
                const cachedItem = this.argCache[hash];
                // Only attempt to delete Manifold objects
                if (this.isManifoldObject(cachedItem)) {
                    // Handle arrays of Manifold objects
                    if (Array.isArray(cachedItem)) {
                        cachedItem.forEach(manifold => {
                            try {
                                manifold.delete();
                            } catch (error) {
                                // Ignore errors for already deleted manifolds
                            }
                        });
                    } else {
                        cachedItem.delete();
                    }
                }
            }
            catch (error) {
                // Ignore errors when cleaning manifolds that may already be deleted
            }
        }
        delete this.argCache[hash];
        delete this.usedHashes[hash];
        delete this.hashesFromPreviousRun[hash];
        this.manifoldObjectHashes.delete(hash);
    }

    cleanUpCache(): void {
        // Clean up cache entries that were used in previous run but not in current run
        // This helps manage memory by removing unused cached manifolds
        
        const usedHashKeys = Object.keys(this.usedHashes);
        const hashesFromPreviousRunKeys = Object.keys(this.hashesFromPreviousRun);
        
        // Find hashes that exist in previous run but not in current run
        // These are the ones we should clean up
        let hashesToDelete: string[] = [];
        if (hashesFromPreviousRunKeys.length > 0) {
            hashesToDelete = hashesFromPreviousRunKeys.filter(hash => !usedHashKeys.includes(hash));
        }
        
        // Delete unused manifolds and clean them from cache
        if (hashesToDelete.length > 0) {
            hashesToDelete.forEach(hash => {
                if (this.argCache[hash]) {
                    try {
                        const manifold = this.argCache[hash];
                        // Only try to delete if it's a Manifold object
                        if (this.isManifoldObject(manifold)) {
                            // Handle arrays of Manifold objects
                            if (Array.isArray(manifold)) {
                                manifold.forEach(m => {
                                    try {
                                        m.delete();
                                    } catch {
                                        // Ignore errors for already deleted manifolds
                                    }
                                });
                            } else {
                                manifold.delete();
                            }
                        }
                    } catch {
                        // Ignore errors for already deleted or invalid manifolds
                    }
                    delete this.argCache[hash];
                }
                delete this.usedHashes[hash];
                this.manifoldObjectHashes.delete(hash);
            });
        }
        
        // Update hashesFromPreviousRun to be current usedHashes for next cleanup cycle
        this.hashesFromPreviousRun = { ...this.usedHashes };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isManifoldObject(obj: any): boolean {
        return obj !== undefined && obj !== null && (!Array.isArray(obj) && obj.$$ !== undefined) || (Array.isArray(obj) && obj.length > 0 && obj[0].$$ !== undefined);
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
            if (this.isManifoldObject(check)) {
                toReturn = check;
                toReturn.hash = check.hash;
            } else if (check.value) {
                toReturn = check.value;
            }
        } else {
            toReturn = cacheMiss();
            if (Array.isArray(toReturn) && this.isManifoldObject(toReturn)) {
                toReturn.forEach((r, index) => {
                    const itemHash = this.computeHash({ ...args, index });
                    r.hash = itemHash;
                    this.addToCache(itemHash, r);
                    // Track individual element hashes so they can be cleaned up
                    this.usedHashes[itemHash] = itemHash;
                    this.hashesFromPreviousRun[itemHash] = itemHash;
                });
            } else {
                if (this.isManifoldObject(toReturn)) {
                    toReturn.hash = curHash;
                    this.addToCache(curHash, toReturn);
                } else if (toReturn && toReturn.compound && toReturn.data && toReturn.manifolds && toReturn.manifolds.length > 0) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const objDef: ObjectDefinition<any, any> = toReturn;
                    const compoundHash = this.computeHash({ ...args, index: "compound" });
                    objDef.compound.hash = compoundHash;
                    this.addToCache(compoundHash, objDef.compound);
                    // Track compound hash
                    this.usedHashes[compoundHash] = compoundHash;
                    this.hashesFromPreviousRun[compoundHash] = compoundHash;
                    objDef.manifolds.forEach((s, index) => {
                        const itemHash = this.computeHash({ ...args, index });
                        s.manifold.hash = itemHash;
                        this.addToCache(itemHash, s.manifold);
                        // Track individual manifold hashes
                        this.usedHashes[itemHash] = itemHash;
                        this.hashesFromPreviousRun[itemHash] = itemHash;
                    });
                    this.addToCache(curHash, { value: objDef });
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
        const cachedManifold = this.argCache[hash];
        if (!cachedManifold) {
            return null;
        }
        
        // For wrapped values (non-Manifold objects stored as { value: ... })
        if (cachedManifold.value !== undefined && !this.isManifoldObject(cachedManifold)) {
            return cachedManifold;
        }
        
        // If this hash was tracked as a Manifold object, verify it's still valid
        if (this.manifoldObjectHashes.has(hash)) {
            const isStillValid = this.isManifoldObject(cachedManifold);
            if (!isStillValid) {
                // Object was a Manifold object but is no longer valid
                delete this.argCache[hash];
                this.manifoldObjectHashes.delete(hash);
                return null;
            }
        }
        
        return cachedManifold;
    }
    /** Adds this `manifold` to the cache, indexable by `hash`. */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addToCache(hash: string | number, object: any): string | number {
        const cacheShape = object;
        // Only set hash property on objects, not primitives
        if (cacheShape !== null && typeof cacheShape === "object") {
            cacheShape.hash = hash;
        }
        this.argCache[hash] = cacheShape;
        
        // Track if this is a Manifold object
        if (this.isManifoldObject(cacheShape)) {
            this.manifoldObjectHashes.add(hash);
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
            return el.hash !== objectToRemove.hash ||
                el.ptr !== objectToRemove.ptr;
        });
    }

}
