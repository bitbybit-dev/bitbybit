import { hashOfText } from "@bitbybit-dev/base";

export class CacheHelper {

    usedHashes: Record<string, string | number> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    argCache: Record<string, any> = {};
    jscadObjectHashes = new Set<string | number>();

    cleanAllCache(): void {
        const allCacheKeys = Object.keys(this.argCache);

        allCacheKeys.forEach(hash => {
            if (this.argCache[hash]) {
                try {
                    const cachedItem = this.argCache[hash];
                    if (this.isJSCADObject(cachedItem)) {
                        if (Array.isArray(cachedItem)) {
                            cachedItem.forEach(obj => {
                                try {
                                    if (obj.delete) {
                                        obj.delete();
                                    }
                                } catch {
                                }
                            });
                        } else {
                            if (cachedItem.delete) {
                                cachedItem.delete();
                            }
                        }
                    }
                }
                catch {
                }
            }
        });

        this.argCache = {};
        this.usedHashes = {};
        this.jscadObjectHashes.clear();
    }

    cleanCacheForHash(hash: string): void {
        if (this.argCache[hash]) {
            try {
                const cachedItem = this.argCache[hash];
                if (this.isJSCADObject(cachedItem)) {
                    if (Array.isArray(cachedItem)) {
                        cachedItem.forEach(obj => {
                            try {
                                if (obj.delete) {
                                    obj.delete();
                                }
                            } catch {
                            }
                        });
                    } else {
                        if (cachedItem.delete) {
                            cachedItem.delete();
                        }
                    }
                }
            }
            catch {
            }
        }
        delete this.argCache[hash];
        delete this.usedHashes[hash];
        this.jscadObjectHashes.delete(hash);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isJSCADObject(obj: any): boolean {
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
        let toReturn;
        const curHash = this.computeHash(args);
        this.usedHashes[curHash] = curHash;
        const check = this.checkCache(curHash);
        if (check) {
            if (this.isJSCADObject(check)) {
                toReturn = check;
                toReturn.hash = check.hash;
            } else {
                toReturn = check.value;
            }
        } else {
            toReturn = cacheMiss();
            if (Array.isArray(toReturn) && this.isJSCADObject(toReturn)) {
                toReturn.forEach((r, index) => {
                    const itemHash = this.stringToHash(`${curHash}:${index}`);
                    r.hash = itemHash;
                    this.addToCache(itemHash, r);
                    this.usedHashes[itemHash] = itemHash;
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
        
        if (cachedObject.value !== undefined && !this.isJSCADObject(cachedObject)) {
            return cachedObject;
        }
        
        if (this.jscadObjectHashes.has(hash)) {
            const isStillValid = this.isJSCADObject(cachedObject);
            if (!isStillValid) {
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
        if (cacheObject !== null && typeof cacheObject === "object") {
            cacheObject.hash = hash;
        }
        this.argCache[hash] = cacheObject;
        
        if (this.isJSCADObject(cacheObject)) {
            this.jscadObjectHashes.add(hash);
        }
        
        return hash;
    }

    /** Computes the cache key of a set of `arguments`: a 53-bit hash of their JSON form, or that
     * JSON string itself when `raw` is true. A geometry rehydrated into the arguments is plain data
     * and keys by its content and the cache hash it carries; nothing has to be scrubbed from the string.
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
        return hashOfText(str);
    }

}
