export declare class ManifoldWithId<U> {
    id: string;
    manifold: U;
}
export declare class ObjectDefinition<M, U> {
    compound?: U;
    manifolds?: ManifoldWithId<U>[];
    data?: M;
}

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
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    computeHash(args: any, raw?: boolean): number | string {
        const argsString = JSON.stringify(args);
        if (raw) { return argsString; }
        return this.stringToHash(argsString);
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
