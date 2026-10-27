import { markedReadFromKernel } from "./kernel-exception-reads";
import { isKernelTrap } from "./kernel-traps";

/**
 * The part of a kernel module that can read a C++ exception which escaped a call. Kernels built with
 * the exception helpers exported have both functions; an older kernel has neither.
 */
export type KernelExceptionReader = {
    getExceptionMessage?: (exception: unknown) => [string, string | undefined];
    decrementExceptionRefcount?: (exception: unknown) => void;
};

const UNREADABLE_EXCEPTION = "A C++ exception was thrown whose type and message the kernel could not read";

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
 * carries no message. An exception the kernel cannot read is freed all the same and comes back as an
 * Error saying so, never as the freed exception. A trap the kernel hits while reading it - a
 * `WebAssembly.RuntimeError`, after which nothing the kernel holds can be trusted - is thrown on, the
 * exception freed first, so that a crash is never reported as an unreadable exception. Anything else,
 * and anything a kernel without the helpers threw, comes back as it was thrown.
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
        return markedReadFromKernel(new Error(message ? `${type}: ${message}` : type));
    } catch (problem) {
        if (isKernelTrap(problem)) {
            throw problem;
        }
        return markedReadFromKernel(new Error(UNREADABLE_EXCEPTION));
    } finally {
        release(kernel, thrown);
    }
}
