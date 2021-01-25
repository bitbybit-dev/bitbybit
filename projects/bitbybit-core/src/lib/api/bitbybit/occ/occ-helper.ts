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

    CantorPairing(x, y): number {
        return ((x + y) * (x + y + 1)) / 2 + y;
    }
}
