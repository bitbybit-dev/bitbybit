import type { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type * as Models from "../../api/models";
import { release } from "./release";

/** What the kernel reports of one input's history, typed arrays of indexes. */
export type KernelHistory = ReturnType<BitbybitOcctModule["HistoryOfFillet"]>;

/** The kernel's history as plain arrays, which cross to a worker's caller as they are. */
export function historyFromKernel(history: KernelHistory): Models.OCCT.ShapeHistory {
    const lists = (groups: Int32Array[]): number[][] => groups.map(group => Array.from(group));
    return {
        faces: lists(history.faces),
        edges: lists(history.edges),
        facesFromFaces: lists(history.facesFromFaces),
        edgesFromFaces: lists(history.edgesFromFaces),
        facesFromEdges: lists(history.facesFromEdges),
        facesFromVertices: lists(history.facesFromVertices),
        edgesFromVertices: lists(history.edgesFromVertices),
        firstFaces: Array.from(history.firstFaces),
        lastFaces: Array.from(history.lastFaces),
    };
}

/** Several of the kernel's histories as plain arrays, in the order the kernel gave them. */
export function historiesFromKernel(histories: KernelHistory[]): Models.OCCT.ShapeHistory[] {
    return histories.map(historyFromKernel);
}

export function withHistory<A extends [unknown, TopoDS_Shape, ...unknown[]]>(historyOf: (...read: A) => KernelHistory, build: (read: (...read: A) => void) => TopoDS_Shape, inputs?: readonly TopoDS_Shape[]): Models.OCCT.ShapeWithHistory<TopoDS_Shape> {
    let history: Models.OCCT.ShapeHistory | undefined;
    const shape = build((...read: A) => {
        history = historyFromKernel(historyOf(...read));
    });
    if (history === undefined) {
        throw unreadBuild(shape, inputs);
    }
    return { shape, history };
}

export function withHistories<A extends [unknown, TopoDS_Shape, ...unknown[]]>(historiesOf: (...read: A) => KernelHistory[], build: (read: (...read: A) => void) => TopoDS_Shape, inputs?: readonly TopoDS_Shape[]): Models.OCCT.ShapeWithHistories<TopoDS_Shape> {
    let histories: Models.OCCT.ShapeHistory[] | undefined;
    const shape = build((...read: A) => {
        histories = historiesFromKernel(historiesOf(...read));
    });
    if (histories === undefined) {
        throw unreadBuild(shape, inputs);
    }
    return { shape, histories };
}

function unreadBuild(shape: TopoDS_Shape, inputs: readonly TopoDS_Shape[] | undefined): Error {
    if (inputs !== undefined && !inputs.includes(shape)) {
        release(shape);
    }
    return new Error("The operation gave a shape without reading what it made of its input, so it has no history to give.");
}
