import { Injectable } from '@angular/core';
import { Context } from '../../context';

@Injectable()
export class OCCHelper {
    // should be user preference on UI side
    GUIState = [];
    sceneShapes: any[] = [];

    // Miscellaneous Helper Functions used in the Standard Library

    // Caching functions to speed up evaluation of slow redundant operations
    argCache = {}; usedHashes = {}; opNumber = 0; currentOp = ''; currentLineNumber: string|number = 0;

    constructor(private readonly context: Context) {

    }
    /** Hashes input arguments and checks the cache for that hash.
     * It returns a copy of the cached object if it exists, but will
     * call the `cacheMiss()` callback otherwise. The result will be
     * added to the cache if `GUIState["Cache?"]` is true.
     */
    CacheOp(args, cacheMiss): any {
        // this.currentOp = args.callee.name;
        this.currentLineNumber = this.getCallingLocation()[0];
        // postMessage({ "type": "Progress", "payload": { "opNumber": opNumber++, "opType": args.callee.name } }); // Poor Man's Progress Indicator
        let toReturn = null;
        const curHash = this.ComputeHash(args);
        this.usedHashes[curHash] = curHash;
        const check = this.CheckCache(curHash);
        if (check && this.GUIState['Cache?']) {
            // console.log("HIT    "+ ComputeHash(args) +  ", " +ComputeHash(args, true));
            toReturn = new this.context.occ.TopoDS_Shape(check);
            toReturn.hash = check.hash;
        } else {
            // console.log("MISSED " + ComputeHash(args) + ", " + ComputeHash(args, true));
            toReturn = cacheMiss();
            toReturn.hash = curHash;
            if (this.GUIState['Cache?']) { this.AddToCache(curHash, toReturn); }
        }
        // postMessage({ "type": "Progress", "payload": { "opNumber": opNumber, "opType": null } }); // Poor Man's Progress Indicator
        return toReturn;
    }
    /** Returns the cached object if it exists, or null otherwise. */
    CheckCache(hash): any { return this.argCache[hash] || null; }
    /** Adds this `shape` to the cache, indexable by `hash`. */
    AddToCache(hash, shape): any {
        const cacheShape = new this.context.occ.TopoDS_Shape(shape);
        cacheShape.hash = hash; // This is the cached version of the object
        this.argCache[hash] = cacheShape;
        return hash;
    }

    /** This function computes a 32-bit integer hash given a set of `arguments`.
     * If `raw` is true, the raw set of sanitized arguments will be returned instead. 
     */
    ComputeHash(args, raw?: any): any {
        let argsString = JSON.stringify(args);
        argsString = argsString.replace(/(\"ptr\"\:(-?[0-9]*?)\,)/g, '');
        argsString = argsString.replace(/(\"ptr\"\:(-?[0-9]*))/g, '');
        if (argsString.includes('ptr')) { console.error('YOU DONE MESSED UP YOUR REGEX.'); }
        const hashString = Math.random.toString() + argsString; // + GUIState["MeshRes"];
        if (raw) { return hashString; }
        return this.stringToHash(hashString);
    }

    // Random Javascript Utilities

    /** This function recursively traverses x and calls `callback()` on each subelement. */
    recursiveTraverse(x, callback): any {
        if (Object.prototype.toString.call(x) === '[object Array]') {
            x.forEach(function(x1) {
                this.recursiveTraverse(x1, callback);
            });
        } else if ((typeof x === 'object') && (x !== null)) {
            if (x.HashCode) {
                callback(x);
            } else {
                for (const key in x) {
                    if (x.hasOwnProperty(key)) {
                        this.recursiveTraverse(x[key], callback);
                    }
                }
            }
        } else {
            callback(x);
        }
    }

    /** This function returns a version of the `inputArray` without the `objectToRemove`. */
    Remove(inputArray, objectToRemove): any {
        return inputArray.filter((el) => {
            return el.hash !== objectToRemove.hash ||
                el.ptr !== objectToRemove.ptr;
        });
    }

    /** This function returns true if item is indexable like an array. */
    isArrayLike(item): any {
        return (
            Array.isArray(item) ||
            (!!item &&
                typeof item === 'object' &&
                item.hasOwnProperty('length') &&
                typeof item.length === 'number' &&
                item.length > 0 &&
                (item.length - 1) in item
            )
        );
    }

    /**  Mega Brittle Line Number Finding algorithm for Handle Backpropagation; only works in Chrome and FF.
     * Eventually this should be replaced with Microsoft's Typescript interpreter, but that's a big dependency...
     */
    getCallingLocation(): any {
        const errorStack = (new Error).stack;
        // console.log(errorStack);
        // console.log(navigator.userAgent);
        let lineAndColumn: (string|number)[] = [0, 0];

        let matchingString = ', <anonymous>:';
        if (navigator.userAgent.includes('Chrom')) {
            matchingString = ', <anonymous>:';
        } else if (navigator.userAgent.includes('Moz')) {
            matchingString = 'eval:';
        } else {
            lineAndColumn[0] = '-1';
            lineAndColumn[1] = '-1';
            return lineAndColumn;
        }

        errorStack.split('\n').forEach((line) => {
            if (line.includes(matchingString)) {
                lineAndColumn = line.split(matchingString)[1].split(':');
            }
        });
        lineAndColumn[0] = parseFloat(lineAndColumn[0] as string);
        lineAndColumn[1] = parseFloat(lineAndColumn[1] as string);

        return lineAndColumn;
    }

    /** This function converts either single dimensional
     * array or a gp_Pnt to a gp_Pnt.  Does not accept
     * `TopoDS_Vertex`'s yet! 
     */
    convertToPnt(pnt): any {
        let point = pnt; // Accept raw gp_Points if we got 'em
        if (point.length) {
            point = new this.context.occ.gp_Pnt_3(point[0], point[1], (point[2]) ? point[2] : 0);
        }
        return point;
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

    CantorPairing(x, y): number {
        return ((x + y) * (x + y + 1)) / 2 + y;
    }
}
