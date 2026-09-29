/**
 * Whether a kernel call failed on what it was given, inside the kernel itself, by crashing the
 * kernel - a WebAssembly trap such as an out-of-bounds access, after which the kernel's memory can no
 * longer be trusted and every object it held is gone - or was cancelled: stopped on request before it
 * finished, keeping nothing it made.
 */
export type KernelFailureKind = "input" | "kernel" | "crash" | "cancelled";

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

/** A value a failure's message names, such as the numbers of the edges a fillet could not follow. */
export type KernelFailureDetail = string | number | boolean | readonly string[] | readonly number[];

/**
 * The values a failure's message names, each under the placeholder it fills in the message's
 * template: `{ edges: [3, 7] }` fills `{edges}`.
 */
export type KernelFailureDetails = Readonly<Record<string, KernelFailureDetail>>;

/**
 * An operation the kernel ran but could not complete, such as a fillet whose radius does not fit
 * the faces around an edge. `code` names the failure the same way in every release and every
 * language, such as `occt.fillet.failedOnEdges`, so a host can translate it; the message says it in
 * English, and `details` carries the values it names, so a translated template can name them too.
 */
export class KernelOperationError extends Error {
    /** The stable name of the failure, such as `occt.fillet.failedOnEdges`. */
    readonly code: string;
    /** The values the message names, by placeholder, such as `{ edges: [3, 7] }`; unset when it names none. */
    readonly details: KernelFailureDetails | undefined;

    constructor(code: string, message: string, details?: KernelFailureDetails) {
        super(message);
        this.name = "KernelOperationError";
        this.code = code;
        this.details = details;
    }
}

/**
 * The rejection of a call a kernel worker could not complete: the dotted path that was called,
 * whether the inputs or the kernel failed or the kernel crashed, the stable code and the details of a
 * failure the kernel named (see `KernelOperationError`), and the stack the worker reported, kept apart
 * from the message.
 */
export class KernelCallError extends Error {
    /** The dotted path of the operation that was called. */
    readonly functionName: string;
    /** Whether the inputs or the kernel were at fault, the kernel crashed, or the call was cancelled. */
    readonly kind: KernelFailureKind;
    /** The stack of the failure inside the worker, when it reported one. */
    readonly workerStack: string | undefined;
    /** The stable code of the failure, when the kernel named it, such as `occt.fillet.failed`. */
    readonly code: string | undefined;
    /** The values the named failure's message names, by placeholder, when it names any. */
    readonly details: KernelFailureDetails | undefined;

    constructor(message: string, functionName: string, kind: KernelFailureKind = "kernel", workerStack?: string, code?: string, details?: KernelFailureDetails) {
        super(message);
        this.name = "KernelCallError";
        this.functionName = functionName;
        this.kind = kind;
        this.workerStack = workerStack;
        this.code = code;
        this.details = details;
    }
}
