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

    constructor() { }

    cleanAllCache(): void {
        const usedHashKeys = Object.keys(this.usedHashes);

        usedHashKeys.forEach(hash => {
            if (this.argCache[hash]) {
                try {
                    const manifold = this.argCache[hash];
                    manifold.delete();
                }
                // eslint-disable-next-line no-empty
                catch {
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
                const manifold = this.argCache[hash];
                manifold.delete();
            }
            // eslint-disable-next-line no-empty
            catch {
            }
        }
        delete this.argCache[hash];
        delete this.usedHashes[hash];
        delete this.hashesFromPreviousRun[hash];
    }

    isManifoldObject(obj): boolean {
        return obj !== undefined && obj !== null && (!Array.isArray(obj) && obj.$$ !== undefined) || (Array.isArray(obj) && obj.length > 0 && obj[0].$$ !== undefined);
    }

    cacheOp(args, cacheMiss): any {
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
                });
            } else {
                if (this.isManifoldObject(toReturn)) {
                    toReturn.hash = curHash;
                    this.addToCache(curHash, toReturn);
                } else if (toReturn.compound && toReturn.data && toReturn.manifolds && toReturn.manifolds.length > 0) {
                    const objDef: ObjectDefinition<any, any> = toReturn;
                    const compoundHash = this.computeHash({ ...args, index: "compound" });
                    objDef.compound.hash = compoundHash;
                    this.addToCache(compoundHash, objDef.compound);
                    objDef.manifolds.forEach((s, index) => {
                        const itemHash = this.computeHash({ ...args, index });
                        s.manifold.hash = itemHash;
                        this.addToCache(itemHash, s.manifold);
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
    /** Returns the cached object if it exists, or null otherwise. */
    checkCache(hash): any {
        return this.argCache[hash] || null;
    }
    /** Adds this `manifold` to the cache, indexable by `hash`. */
    addToCache(hash, manifold): any {
        const cacheShape = manifold;
        cacheShape.hash = hash;
        this.argCache[hash] = cacheShape;
        return hash;
    }

    /** This function computes a 32-bit integer hash given a set of `arguments`.
     * If `raw` is true, the raw set of sanitized arguments will be returned instead.
     */
    computeHash(args, raw?: any): any {
        let argsString = JSON.stringify(args);
        argsString = argsString.replace(/(\"ptr\"\:(-?[0-9]*?)\,)/g, "");
        argsString = argsString.replace(/(\"ptr\"\:(-?[0-9]*))/g, "");
        if (argsString.includes("ptr")) { console.error("YOU DONE MESSED UP YOUR REGEX."); }
        const hashString = Math.random.toString() + argsString;
        if (raw) { return hashString; }
        return this.stringToHash(hashString);
    }

    /** This function converts a string to a 32bit integer. */
    stringToHash(str: string): any {
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
    remove(inputArray, objectToRemove): any {
        return inputArray.filter((el) => {
            return el.hash !== objectToRemove.hash ||
                el.ptr !== objectToRemove.ptr;
        });
    }

}
