/**
 * Whether a kernel call failed on what it was given or inside the kernel itself.
 */
export type KernelFailureKind = "input" | "kernel";

/**
 * An input the operation cannot accept, thrown before the kernel runs. `property` names the input
 * at fault when one property is.
 */
export class InputError extends Error {
    /** The input at fault, or undefined when no single input is. */
    readonly property: string | undefined;

    constructor(message: string, property?: string) {
        super(message);
        this.name = "InputError";
        this.property = property;
    }
}

/**
 * The rejection of a call a kernel worker could not complete: the dotted path that was called,
 * whether the inputs or the kernel failed, and the stack the worker reported, kept apart from the
 * message.
 */
export class KernelCallError extends Error {
    /** The dotted path of the operation that was called. */
    readonly functionName: string;
    /** Whether the inputs or the kernel were at fault. */
    readonly kind: KernelFailureKind;
    /** The stack of the failure inside the worker, when it reported one. */
    readonly workerStack: string | undefined;

    constructor(message: string, functionName: string, kind: KernelFailureKind = "kernel", workerStack?: string) {
        super(message);
        this.name = "KernelCallError";
        this.functionName = functionName;
        this.kind = kind;
        this.workerStack = workerStack;
    }
}
