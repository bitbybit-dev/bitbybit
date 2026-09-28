import { BitbybitOcctModule } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Models from "../../api/models";

/** What the kernel reports of one input's history, typed arrays of indexes. */
export type KernelHistory = ReturnType<BitbybitOcctModule["HistoryOfFillet"]>;

/** The kernel's history as plain arrays, which cross to a worker's caller as they are. */
export function historyFromKernel(history: KernelHistory): Models.OCCT.ShapeHistory {
    const lists = (groups: Int32Array[]): number[][] => groups.map(group => Array.from(group));
    return {
        faces: lists(history.faces),
        edges: lists(history.edges),
        facesFromEdges: lists(history.facesFromEdges),
        facesFromVertices: lists(history.facesFromVertices),
        edgesFromVertices: lists(history.edgesFromVertices),
        firstFaces: Array.from(history.firstFaces),
        lastFaces: Array.from(history.lastFaces),
    };
}
