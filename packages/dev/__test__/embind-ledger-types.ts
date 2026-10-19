import type { SerializedConfig, WorkerGlobalState } from "vitest";

export interface KernelHandle {
    isDeleted(): boolean;
    delete(): void;
}

export type Callable = (...args: unknown[]) => unknown;

export type ProxyTrap = (...args: never[]) => unknown;

export interface EmbindLedgerOptions {
    readonly kernel: string;
    readonly runtime: ReadonlySet<string>;
    readonly borrowing?: (className: string, method: string) => boolean;
    readonly libraryScript?: (fileName: string) => boolean;
}

export interface ServiceSurface {
    readonly root: object;
    readonly paths: readonly string[];
    readonly context?: () => string | undefined;
}

export interface LedgerRun<T> {
    readonly result: T | undefined;
    readonly thrown: unknown;
    readonly made: number;
    readonly leaked: KernelHandle[];
}

export interface LedgerWindow {
    readonly made: () => KernelHandle[];
    readonly close: () => void;
}

export type FrameOutcome = "ok" | "threw" | "trapped" | "deferred";

export type ClassCounts = Record<string, number>;

export interface OutcomeTally {
    calls: number;
    made: number;
    retained: number;
    leakedCalls: number;
    leaked: ClassCounts;
    leakedMost: ClassCounts;
    leakedIn: Record<string, ClassCounts>;
    foreignCalls: number;
    foreign: ClassCounts;
    foreignMost: ClassCounts;
    firstLeak?: string;
}

export type PathTallies = Partial<Record<FrameOutcome, OutcomeTally>>;

export interface LedgerReport {
    readonly kernel: string;
    readonly file: string;
    readonly bookkeepingMs: number;
    readonly ledgerErrors: readonly string[];
    readonly nested: Readonly<Record<string, number>>;
    readonly paths: Readonly<Record<string, PathTallies>>;
}

export type LedgerReportMoment = "loaded" | "finished";

export interface LedgerReportFile extends LedgerReport {
    readonly complete: boolean;
    readonly partial?: string;
}

export type RunSpecification = WorkerGlobalState["ctx"]["files"][number];

export interface LedgerRunFilters {
    readonly spec: RunSpecification | undefined;
    readonly config: Pick<SerializedConfig, "testNamePattern" | "tagsFilter">;
}
