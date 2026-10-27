import type { BitbybitOcctModule } from "../bitbybit-dev-occt/bitbybit-dev-occt";
import type { Act } from "../lib/__test__/lifetime-cases-types";

export interface KernelGlue {
    readonly default: (options: object) => Promise<BitbybitOcctModule>;
}

export interface LoadedKernel {
    readonly label: string;
    readonly occ: BitbybitOcctModule;
}

export interface HeapCounter {
    readonly name: "bytes in use" | "heap size";
    readonly read: () => number;
}

export interface ChosenCase {
    readonly name: string;
    readonly arrange: () => Act;
    readonly refused: boolean;
}

export interface HeapRow {
    readonly case: string;
    readonly bytesPerCall: number[];
    readonly meanBytesPerCall: number;
    readonly leaks: boolean;
    readonly unexpected: number;
}

export interface HeapAllowance {
    readonly reason: string;
    readonly mostBytesPerCall: number;
}

export interface HeapAllowList {
    readonly allow: Readonly<Record<string, HeapAllowance>>;
}

export interface HeapReport {
    readonly kernel: string;
    readonly counter: HeapCounter["name"];
    readonly calls: number;
    readonly thresholdBytesPerCall: number;
    readonly leaking: string[];
    readonly known: string[];
    readonly stale: string[];
    readonly misbehaving: string[];
    readonly overgrown: string[];
    readonly rows: HeapRow[];
}
