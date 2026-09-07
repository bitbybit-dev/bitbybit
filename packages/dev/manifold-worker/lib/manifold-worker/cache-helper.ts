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

    hashesFromPreviousRun: Record<string, string | number> = {};
    usedHashes: Record<string, string | number> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    argCache: Record<string, any> = {};
    manifoldObjectHashes = new Set<string | number>();

    cleanAllCache(): void {
        const allCacheKeys = Object.keys(this.argCache);

        allCacheKeys.forEach(hash => {
            if (this.argCache[hash]) {
                try {
                    const cachedItem = this.argCache[hash];
                    if (this.isManifoldObject(cachedItem)) {
                        if (Array.isArray(cachedItem)) {
                            cachedItem.forEach(manifold => {
                                try {
                                    manifold.delete();
                                } catch {
                                    // Ignore errors for already deleted manifolds
                                }
                            });
                        } else {
                            cachedItem.delete();
                        }
                    }
                }
                catch {
                    // Ignore errors when cleaning manifolds that may already be deleted
                }
            }
        });

        this.argCache = {};
        this.usedHashes = {};
        this.hashesFromPreviousRun = {};
        this.manifoldObjectHashes.clear();
    }

    cleanCacheForHash(hash: string | number): void {
        if (this.argCache[hash]) {
            try {
                const cachedItem = this.argCache[hash];
                if (this.isManifoldObject(cachedItem)) {
                    if (Array.isArray(cachedItem)) {
                        cachedItem.forEach(manifold => {
                            try {
                                manifold.delete();
                            } catch {
                                // Ignore errors for already deleted manifolds
                            }
                        });
                    } else {
                        cachedItem.delete();
                    }
                }
            }
            catch {
                // Ignore errors when cleaning manifolds that may already be deleted
            }
        }
        delete this.argCache[hash];
        delete this.usedHashes[hash];
        delete this.hashesFromPreviousRun[hash];
        this.manifoldObjectHashes.delete(hash);
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
                        const manifold = this.argCache[hash];
                        if (this.isManifoldObject(manifold)) {
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
                    this.usedHashes[compoundHash] = compoundHash;
                    this.hashesFromPreviousRun[compoundHash] = compoundHash;
                    objDef.manifolds!.forEach((s, index) => {
                        const itemHash = this.computeHash({ ...args, index });
                        s.manifold.hash = itemHash;
                        this.addToCache(itemHash, s.manifold);
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
        
        if (cachedManifold.value !== undefined && !this.isManifoldObject(cachedManifold)) {
            return cachedManifold;
        }
        
        if (this.manifoldObjectHashes.has(hash)) {
            const isStillValid = this.isManifoldObject(cachedManifold);
            if (!isStillValid) {
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
        if (cacheShape !== null && typeof cacheShape === "object") {
            cacheShape.hash = hash;
        }
        this.argCache[hash] = cacheShape;
        
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
            hash = ((hash << 5) - hash) + char;
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
