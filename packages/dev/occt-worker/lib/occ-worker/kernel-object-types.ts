export interface KernelObject {
    readonly $$: unknown;
    delete(): void;
    isDeleted(): boolean;
}

/** The items of a document's PMI as the kernel lists them, each held under a label of its own. */
export interface KernelPmiItems {
    readonly dimensions: readonly unknown[];
    readonly tolerances: readonly unknown[];
    readonly datums: readonly unknown[];
}
