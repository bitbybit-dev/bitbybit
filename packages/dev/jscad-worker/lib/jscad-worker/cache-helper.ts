
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
                    this.argCache[hash].delete();
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


    cacheOp(args, cacheMiss): any {
        let toReturn = null;
        const curHash = this.computeHash(args);
        this.usedHashes[curHash] = curHash;
        this.hashesFromPreviousRun[curHash] = curHash;
        const check = this.checkCache(curHash);
        if (check) {
            // TODO I need to check if and why cloning is required.
            // toReturn = new this.occ.TopoDS_Shape(check);
            toReturn = check;
            toReturn.hash = check.hash;
        } else {
            toReturn = cacheMiss();
            toReturn.hash = curHash;
            this.addToCache(curHash, toReturn);
        }
        return toReturn;
    }
    /** Returns the cached object if it exists, or null otherwise. */
    checkCache(hash): any {
        return this.argCache[hash] || null;
    }
    /** Adds this `shape` to the cache, indexable by `hash`. */
    addToCache(hash, shape): any {
        const cacheShape = shape;
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
