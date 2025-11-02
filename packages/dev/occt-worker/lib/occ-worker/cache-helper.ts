import { OpenCascadeInstance } from "@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt";
import { Models } from "@bitbybit-dev/occt";

export class CacheHelper {

    hashesFromPreviousRun = {};
    usedHashes = {};
    argCache = {};

    constructor(private readonly occ: OpenCascadeInstance) { }

    cleanAllCache(): void {
        const usedHashKeys = Object.keys(this.usedHashes);

        usedHashKeys.forEach(hash => {
            if (this.argCache[hash]) {
                try {
                    const shape = this.argCache[hash];
                    this.occ.BRepTools.Clean(shape, true);
                    this.occ.BRepTools.CleanGeometry(shape);
                    shape.delete();
                }
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
                const shape = this.argCache[hash];
                this.occ.BRepTools.Clean(shape, true);
                this.occ.BRepTools.CleanGeometry(shape);
                shape.delete();
            }
            catch {
            }
        }
        delete this.argCache[hash];
        delete this.usedHashes[hash];
        delete this.hashesFromPreviousRun[hash];
    }

    cleanUpCache(): void {
        // TODO seems to have problems, not exactly sure what is the real cause. For now users will build up cache during the whole session.
        // and will be able to manually clean it up if it gets out of hand.


        // const usedHashKeys = Object.keys(this.usedHashes);
        // const hashesFromPreviousRunKeys = Object.keys(this.hashesFromPreviousRun);
        // const newArgsCache = {};
        // const newUsedHashKeys = {};

        // let hashesToDelete = [];
        // if (usedHashKeys.length > 0 && hashesFromPreviousRunKeys.length > 0) {
        //     hashesToDelete = usedHashKeys.filter(hash => !hashesFromPreviousRunKeys.includes(hash));
        // }
        // hashesFromPreviousRunKeys.forEach(hash => {
        //     newArgsCache[hash] = this.argCache[hash];
        //     newUsedHashKeys[hash] = this.usedHashes[hash];
        // });

        // if (hashesToDelete.length > 0) {
        //     hashesToDelete.forEach(hash => {
        //         if (this.argCache[hash]) {
        //             this.argCache[hash].delete();
        //         }
        //     });
        // }
        // this.argCache = newArgsCache;
        // this.usedHashes = newUsedHashKeys;
        // this.hashesFromPreviousRun = {};
    }

    isOCCTObject(obj): boolean {
        return obj !== undefined && obj !== null && (!Array.isArray(obj) && obj.$$ !== undefined) || (Array.isArray(obj) && obj.length > 0 && obj[0].$$ !== undefined);
    }

    /** Hashes input arguments and checks the cache for that hash.
     * It returns a copy of the cached object if it exists, but will
     * call the `cacheMiss()` callback otherwise. The result will be
     * added to the cache if `GUIState["Cache?"]` is true.
     */
    cacheOp(args, cacheMiss): any {
        let toReturn = null;
        const curHash = this.computeHash(args);
        this.usedHashes[curHash] = curHash;
        this.hashesFromPreviousRun[curHash] = curHash;
        const check = this.checkCache(curHash);
        if (check) {
            // TODO I need to check if and why cloning is required.
            // toReturn = new this.occ.TopoDS_Shape(check);
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
            }

        }
        return toReturn;
    }
    /** Returns the cached object if it exists and is valid, or null otherwise. */
    checkCache(hash): any {
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
    addToCache(hash, shape): any {
        // TODO I need to check if and why casting is required. Having real objects in the cache can be used to free up memory?
        const cacheShape = shape;
        cacheShape.hash = hash; // This is the cached version of the object
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

    dupShape(shape): any {
        if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_WIRE) {
            return this.occ.TopoDS.Wire_1(shape);
        } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_SHELL) {
            return this.occ.TopoDS.Shell_1(shape);
        } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_EDGE) {
            return this.occ.TopoDS.Edge_1(shape);
        } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_SOLID) {
            return this.occ.TopoDS.Solid_1(shape);
        } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_FACE) {
            return this.occ.TopoDS.Face_1(shape);
        } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_COMPOUND) {
            return this.occ.TopoDS.Compound_1(shape);
        } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_COMPSOLID) {
            return this.occ.TopoDS.CompSolid_1(shape);
        } else if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_VERTEX) {
            return this.occ.TopoDS.Vertex_1(shape);
        }
    }

}
