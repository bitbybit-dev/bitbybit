import { KernelFailureKind } from "./errors";

/**
 * What a kernel worker reports when a call fails: the message a caller reads, whether the inputs
 * or the kernel were at fault, and the stack, kept out of the message.
 */
export type KernelFailure = {
    message: string;
    kind: KernelFailureKind;
    stack: string | undefined;
};

const MAX_INPUT_TEXT = 200;

function errorText(error: unknown): string {
    if (error instanceof Error) {
        return error.name === "Error" ? error.message : `${error.name}: ${error.message}`;
    }
    if (typeof error === "string") {
        return error;
    }
    try {
        return JSON.stringify(error) ?? String(error);
    } catch {
        return String(error);
    }
}

function inputText(key: string, value: unknown): string {
    if (ArrayBuffer.isView(value)) {
        return `${key}: [${value.constructor.name} byteLength=${value.byteLength}]`;
    }
    if (value instanceof ArrayBuffer) {
        return `${key}: [ArrayBuffer byteLength=${value.byteLength}]`;
    }
    try {
        const text = JSON.stringify(value);
        if (text === undefined) {
            return `${key}: undefined`;
        }
        return text.length > MAX_INPUT_TEXT ? `${key}: ${text.slice(0, MAX_INPUT_TEXT)}…(truncated)` : `${key}: ${text}`;
    } catch {
        return `${key}: [unserializable]`;
    }
}

/**
 * Describes a failed kernel call in one shape for every kernel. An `InputError` reads
 * `<path>: <message>`, because the message already names the input at fault. Any other failure
 * reads `<kernel> computation failed while executing function '<path>': <message>.` followed by the
 * inputs, each cut at 200 characters and binary data given only by its size. A call that named no
 * function leaves the path out of either form.
 * @param kernel - The kernel's name as a reader knows it, such as `OCCT`
 * @param functionName - The dotted path that was called
 * @param inputs - The inputs as the call received them
 * @param error - What the call threw
 * @returns The message, the kind of failure and the stack
 */
export function describeKernelFailure(kernel: string, functionName: string, inputs: unknown, error: unknown): KernelFailure {
    const stack = error instanceof Error ? error.stack : undefined;
    if (error instanceof Error && error.name === "InputError") {
        return { message: functionName ? `${functionName}: ${error.message}` : error.message, kind: "input", stack };
    }
    const entries = inputs !== null && typeof inputs === "object" && !ArrayBuffer.isView(inputs) && !(inputs instanceof ArrayBuffer) ? Object.entries(inputs) : [];
    const props = entries.length > 0 ? ` Input values were: {${entries.map(([key, value]) => inputText(key, value)).join(", ")}}.` : "";
    const where = functionName ? ` while executing function '${functionName}'` : "";
    return { message: `${kernel} computation failed${where}: ${errorText(error)}.${props}`, kind: "kernel", stack };
}
