/**
 * The part of a kernel module that can read a C++ exception which escaped a call. Kernels built with
 * the exception helpers exported have both functions; an older kernel has neither.
 */
export type KernelExceptionReader = {
    getExceptionMessage?: (exception: unknown) => [string, string | undefined];
    decrementExceptionRefcount?: (exception: unknown) => void;
};

function isCppException(thrown: unknown): boolean {
    if (typeof thrown === "number") {
        return true;
    }
    const nativeException: unknown = typeof WebAssembly === "undefined" ? undefined : Reflect.get(WebAssembly, "Exception");
    return typeof nativeException === "function" && thrown instanceof nativeException;
}

function release(kernel: KernelExceptionReader, thrown: unknown): void {
    try {
        kernel.decrementExceptionRefcount?.(thrown);
    } catch {
        return;
    }
}

/**
 * Turns what a failed kernel call threw into an Error that says what happened. A C++ exception reaches
 * JavaScript as a bare pointer - a number - or, from a kernel built with native wasm exceptions, as a
 * `WebAssembly.Exception`; the kernel reads its type and message and the exception is freed. The
 * result reads `StdFail_NotDone: BRep_API: command not done`, or the type alone when the exception
 * carries no message. Anything else, and anything a kernel without the helpers threw, comes back as it
 * was thrown.
 * @param kernel - The kernel module the call ran in
 * @param thrown - What the call threw
 * @returns An Error naming the exception, or `thrown` unchanged
 */
export function readKernelException(kernel: KernelExceptionReader, thrown: unknown): unknown {
    if (typeof kernel.getExceptionMessage !== "function" || !isCppException(thrown)) {
        return thrown;
    }
    try {
        const [type, message] = kernel.getExceptionMessage(thrown);
        return new Error(message ? `${type}: ${message}` : type);
    } catch {
        return thrown;
    } finally {
        release(kernel, thrown);
    }
}
