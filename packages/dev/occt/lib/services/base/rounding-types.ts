import type { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type { KernelHistory } from "./history";

export interface RepairedIndexes {
    readonly faces: readonly number[];
    readonly edges: readonly number[];
}

export interface FlatRoundingFailures {
    readonly broken: () => Error;
    readonly beyond: () => Error;
}

export interface RoundingFailures extends FlatRoundingFailures {
    readonly insideOut: () => Error;
    readonly unnumbered: () => Error;
}

export type HistoryReindex = (history: KernelHistory) => KernelHistory;

export interface Rounding {
    readonly shape: TopoDS_Shape;
    readonly made: TopoDS_Shape;
    readonly reindexed: HistoryReindex;
    readonly release: () => void;
}

export type MakerRead<M> = (maker: M, made: TopoDS_Shape, reindexed: HistoryReindex) => void;
