import type { KernelHandle } from "../../../__test__/embind-ledger-types";

export type Act = () => unknown;

export type ExpectedRefusal =
    | { readonly kind: "input"; readonly property: string; readonly says?: string }
    | { readonly kind: "operation"; readonly code: string }
    | { readonly kind: "kernel"; readonly says: string };

export interface CaseNotes {
    readonly refusedBy?: ExpectedRefusal;
    readonly changesItsInput?: string;
}

export type Arranged = [name: string, arrange: () => Act, notes?: CaseNotes];

export interface LifetimeCases {
    readonly succeeding: Arranged[];
    readonly succeedingAsToday: Arranged[];
    readonly refused: Arranged[];
    readonly refusedAsToday: Arranged[];
}

export type RefusalKind = "input" | "operation" | "kernel" | "stubbed" | "other";

export type SeenRefusal =
    | { readonly kind: "input"; readonly property: string | undefined; readonly message: string }
    | { readonly kind: "operation"; readonly code: string; readonly message: string }
    | { readonly kind: "kernel" | "stubbed" | "other"; readonly message: string };

export interface WatchedCall {
    readonly path: string;
    readonly before: unknown;
    readonly after: unknown;
}

export interface WatchedRun<R> {
    readonly value: R;
    readonly calls: readonly WatchedCall[];
}

export interface CallWatcher {
    readonly watched: <T extends object>(root: T) => T;
    readonly callsDuring: <R>(act: () => R) => WatchedRun<R>;
}

export type InputContents = ReadonlyMap<KernelHandle, string>;

export type KernelReading = (...args: number[]) => unknown;
