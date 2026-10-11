import { hashOfBytes, hashOfText } from "@bitbybit-dev/base";
export declare class ManifoldWithId<U> {
    id: string;
    manifold: U;
}
export declare class ObjectDefinition<M, U> {
    compound?: U;
    manifolds?: ManifoldWithId<U>[];
    data?: M;
}

type ItemList = { itemHashes: (string | number)[] };

const isItemList = (entry: unknown): entry is ItemList => typeof entry === "object" && entry !== null && "itemHashes" in entry && Array.isArray(entry.itemHashes);

const holdsNoObject = (list: readonly unknown[]): boolean => list.every((item) => item === null || typeof item !== "object");

function toHashable(value: unknown, digest: (bytes: Uint8Array) => number, ancestors = new Set<object>()): unknown {
    if (value === null || typeof value !== "object") {
        return value;
    }
    if (value instanceof ArrayBuffer) {
        return { __binaryDigest__: digest(new Uint8Array(value)), byteLength: value.byteLength };
    }
    if (ArrayBuffer.isView(value)) {
        return { __binaryDigest__: digest(new Uint8Array(value.buffer, value.byteOffset, value.byteLength)), byteLength: value.byteLength };
    }
    if ((Array.isArray(value) && holdsNoObject(value)) || ancestors.has(value)) {
        return value;
    }
    ancestors.add(value);
    const hashable = Array.isArray(value) ? hashableList(value, digest, ancestors) : hashableRecord(value as Record<string, unknown>, digest, ancestors);
    ancestors.delete(value);
    return hashable;
}

function hashableList(list: readonly unknown[], digest: (bytes: Uint8Array) => number, ancestors: Set<object>): readonly unknown[] {
    let copy: unknown[] | undefined;
    for (let i = 0; i < list.length; i++) {
        const item: unknown = list[i];
        const next = toHashable(item, digest, ancestors);
        if (next !== item) {
            copy ??= [...list];
            copy[i] = next;
        }
    }
    return copy ?? list;
}

function hashableRecord(record: Record<string, unknown>, digest: (bytes: Uint8Array) => number, ancestors: Set<object>): Record<string, unknown> {
    let copy: Record<string, unknown> | undefined;
    for (const key of Object.keys(record)) {
        const item = record[key];
        const next = toHashable(item, digest, ancestors);
        if (next !== item) {
            copy ??= { ...record };
            copy[key] = next;
        }
    }
    return copy ?? record;
}

export class CacheHelper {

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
                                }
                            });
                        } else {
                            cachedItem.delete();
                        }
                    }
                }
                catch {
                }
            }
        });

        this.argCache = {};
        this.usedHashes = {};
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
                            }
                        });
                    } else {
                        cachedItem.delete();
                    }
                }
            }
            catch {
            }
        }
        delete this.argCache[hash];
        delete this.usedHashes[hash];
        this.manifoldObjectHashes.delete(hash);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isManifoldObject(obj: any): boolean {
        return obj !== undefined && obj !== null && (!Array.isArray(obj) && obj.$$ !== undefined) || (Array.isArray(obj) && obj.length > 0 && obj[0].$$ !== undefined);
    }

    /** Hashes input arguments and checks the cache for that hash.
     * It returns the cached result if it exists, but will call the
     * `cacheMiss()` callback otherwise. The result will be added to the cache.
     *
     * A result that is a list of kernel objects is stored item by item, each under a key derived
     * from the call's key and its position, and the call's own key holds the list of those keys, so
     * an identical call is answered from the cache with the same objects under the same hashes. When
     * one of the items has since been deleted the list is computed again, and every item of the old
     * list that is still alive is deleted as its new one takes its key.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cacheOp(args: any, cacheMiss: () => any): any {
        const curHash = this.computeHash(args);
        this.usedHashes[curHash] = curHash;
        const check = this.checkCache(curHash);
        if (check) {
            if (this.isManifoldObject(check)) {
                return check;
            }
            if (!isItemList(check)) {
                return check.value;
            }
            const items = this.cachedItems(check.itemHashes);
            if (items) {
                return items;
            }
        }
        const toReturn = cacheMiss();
        if (Array.isArray(toReturn) && this.isManifoldObject(toReturn)) {
            const itemHashes = toReturn.map((_item, index) => this.itemHash(curHash, index));
            this.storeItems(itemHashes.map((hash, index) => [hash, toReturn[index]]));
            this.addToCache(curHash, { itemHashes });
        } else if (this.isManifoldObject(toReturn)) {
            this.addToCache(curHash, toReturn);
        } else if (toReturn && toReturn.compound && toReturn.data && toReturn.manifolds && toReturn.manifolds.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const objDef: ObjectDefinition<any, any> = toReturn;
            this.storeItems([[this.itemHash(curHash, "compound"), objDef.compound], ...objDef.manifolds!.map((s, index): [number, unknown] => [this.itemHash(curHash, index), s.manifold])]);
            this.addToCache(curHash, { value: objDef });
        } else {
            this.addToCache(curHash, { value: toReturn });
        }
        return toReturn;
    }

    /** The key of one kernel object inside a call's result: derived from the call's key and where the
     * object sits, so it costs nothing however large the call's inputs were. */
    itemHash(callHash: string | number, position: string | number): number {
        return this.stringToHash(`${callHash}:${position}`);
    }

    private storeItems(items: readonly (readonly [string | number, unknown])[]): void {
        const kept = new Set(items.map(([, object]) => object));
        for (const [hash, object] of items) {
            const previous: unknown = this.argCache[hash];
            if (!kept.has(previous) && this.isManifoldObject(previous) && !Array.isArray(previous)) {
                try {
                    (previous as { delete: () => void }).delete();
                } catch {
                }
            }
            this.addToCache(hash, object);
            this.usedHashes[hash] = hash;
        }
    }

    private cachedItems(itemHashes: readonly (string | number)[]): unknown[] | undefined {
        const items: unknown[] = [];
        for (const hash of itemHashes) {
            const item = this.checkCache(hash);
            if (!item) {
                return undefined;
            }
            items.push(item);
        }
        return items;
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
     *
     * Binary data anywhere in the arguments - a mesh's vertex and triangle arrays - is keyed by a
     * digest of its bytes and its length rather than written out, which JSON would do one element
     * at a time as an object; the digest still tells two different payloads apart.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    computeHash(args: any, raw?: boolean): number | string {
        const argsString = JSON.stringify(toHashable(args, (bytes) => this.bytesToHash(bytes)));
        if (raw) { return argsString; }
        return this.stringToHash(argsString);
    }

    /** Hashes raw bytes the way `stringToHash` hashes code units, so ASCII text digests to the same
     * number whether it arrives as a string or as bytes. */
    bytesToHash(bytes: Uint8Array): number {
        return hashOfBytes(bytes);
    }

    /** Hashes a string to a non-negative 53-bit safe integer with cyrb53. Both lanes are mixed with
     * `Math.imul`, so the result is the same on every JavaScript engine. */
    stringToHash(str: string): number {
        return hashOfText(str);
    }

}
