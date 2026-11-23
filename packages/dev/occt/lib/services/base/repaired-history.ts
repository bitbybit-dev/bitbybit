import type { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type { KernelHistory } from "./history";
import { kernelObjects } from "./release";
import type { RepairedIndexes } from "./rounding-types";

const HASH_BOUND = 2147483647;

type Own = ReturnType<typeof kernelObjects>["own"];

class SameShapes {
    private readonly byHash = new Map<number, number[]>();

    constructor(private readonly occ: BitbybitOcctModule, private readonly shapes: readonly TopoDS_Shape[]) {
        shapes.forEach((shape, index) => {
            const hash = occ.TopoDS_Shape_HashCode(shape, HASH_BOUND);
            this.byHash.set(hash, [...(this.byHash.get(hash) ?? []), index]);
        });
    }

    indexOf(shape: TopoDS_Shape): number | undefined {
        return (this.byHash.get(this.occ.TopoDS_Shape_HashCode(shape, HASH_BOUND)) ?? []).find(index => this.shapes[index]!.IsSame(shape));
    }
}

const edgeMapOf = (rawEdges: readonly TopoDS_Shape[], edges: SameShapes, count: number): number[] | undefined => {
    const mapped = rawEdges.map(edge => edges.indexOf(edge));
    const found = mapped.filter((index): index is number => index !== undefined);
    return found.length === rawEdges.length && rawEdges.length === count && new Set(found).size === count ? found : undefined;
};

const signaturesOf = (occ: BitbybitOcctModule, faces: readonly TopoDS_Shape[], edges: SameShapes, own: Own): (string | undefined)[] => faces.map(face => {
    const indexes = occ.EdgesOf(face, true).map(edge => edges.indexOf(own(edge)));
    return indexes.includes(undefined) ? undefined : [...new Set(indexes)].sort((a, b) => a! - b!).join(" ");
});

const faceMapOf = (raw: readonly (string | undefined)[], repaired: readonly (string | undefined)[]): number[] | undefined => {
    const at = new Map<string, number>();
    repaired.forEach((signature, index) => {
        if (signature !== undefined) {
            at.set(signature, at.has(signature) ? -1 : index);
        }
    });
    const mapped = raw.map(signature => signature === undefined ? undefined : at.get(signature));
    const found = mapped.filter((index): index is number => index !== undefined && index >= 0);
    return found.length === raw.length && raw.length === repaired.length && new Set(found).size === found.length ? found : undefined;
};

const remapped = (list: Int32Array, to: readonly number[]): Int32Array => Int32Array.from(list, index => to[index]!).sort();

/**
 * The maps from the faces and edges of the copy of what a fillet or chamfer made to those of the
 * solid a repair of that copy turned right, numbered as `getFaces` and `getEdges` number them, or
 * undefined when they cannot be told apart. The repair rewrites the copy's edges in place, their
 * curves on the faces included, and builds the solid it hands back from them, so an edge is found as
 * itself and a face by its edges. The copy numbers its faces and edges as what was made numbers them.
 */
export function repairedIndexes(occ: BitbybitOcctModule, made: TopoDS_Shape, repaired: TopoDS_Shape): RepairedIndexes | undefined {
    const { own, releaseAll } = kernelObjects();
    try {
        const rawEdges = occ.EdgesOf(made, true).map(own);
        const repairedEdges = occ.EdgesOf(repaired, true).map(own);
        const edgeIndexes = new SameShapes(occ, repairedEdges);
        const edges = edgeMapOf(rawEdges, edgeIndexes, repairedEdges.length);
        if (edges === undefined) {
            return undefined;
        }
        const rawFaces = occ.FacesOf(made, false).map(own);
        const repairedFaces = occ.FacesOf(repaired, false).map(own);
        const faces = faceMapOf(signaturesOf(occ, rawFaces, edgeIndexes, own), signaturesOf(occ, repairedFaces, edgeIndexes, own));
        return faces === undefined ? undefined : { faces, edges };
    } finally {
        releaseAll();
    }
}

/** A history read against what a fillet or chamfer made, numbered on the repaired solid instead. */
export function reindexedHistory(history: KernelHistory, indexes: RepairedIndexes): KernelHistory {
    const faces = (lists: Int32Array[]): Int32Array[] => lists.map(list => remapped(list, indexes.faces));
    const edges = (lists: Int32Array[]): Int32Array[] => lists.map(list => remapped(list, indexes.edges));
    return {
        faces: faces(history.faces),
        edges: edges(history.edges),
        facesFromFaces: faces(history.facesFromFaces),
        edgesFromFaces: edges(history.edgesFromFaces),
        facesFromEdges: faces(history.facesFromEdges),
        facesFromVertices: faces(history.facesFromVertices),
        edgesFromVertices: edges(history.edgesFromVertices),
        firstFaces: remapped(history.firstFaces, indexes.faces),
        lastFaces: remapped(history.lastFaces, indexes.faces),
    };
}
