import type { KernelExceptionReader } from "../../kernel-exception";
import { readKernelException } from "../../kernel-exception";

export function withKernelRefusals<T>(occ: KernelExceptionReader, call: () => T, refusalOf: (message: string) => Error | undefined): T {
    try {
        return call();
    } catch (thrown) {
        const read = readKernelException(occ, thrown);
        throw (read instanceof Error ? refusalOf(read.message) : undefined) ?? read;
    }
}

export function withKernelFailure<T>(occ: KernelExceptionReader, call: () => T, failure: () => Error): T {
    try {
        return call();
    } catch (thrown) {
        const read = readKernelException(occ, thrown);
        throw read === thrown ? thrown : failure();
    }
}
