export interface KernelObject {
    readonly $$: unknown;
    delete(): void;
    isDeleted(): boolean;
}
