export function isKernelTrap(error: unknown): boolean {
    return typeof WebAssembly !== "undefined" && error instanceof WebAssembly.RuntimeError;
}

export function trapOr(error: unknown, wrapped: () => Error): unknown {
    return isKernelTrap(error) ? error : wrapped();
}
