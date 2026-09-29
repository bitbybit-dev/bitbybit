import { KernelFailureDetail, KernelFailureDetails, KernelFailureKind } from "./errors";

/**
 * What a kernel worker reports when a call fails: the message a caller reads, whether the inputs
 * or the kernel were at fault, the stable code and the details of a failure the kernel named, and
 * the stack, kept out of the message.
 */
export type KernelFailure = {
    message: string;
    kind: KernelFailureKind;
    code: string | undefined;
    details: KernelFailureDetails | undefined;
    stack: string | undefined;
};

const MAX_INPUT_TEXT = 200;
const MAX_ERROR_TEXT = 1000;
const TRUNCATED = "…(truncated)";

function cut(text: string, limit: number): string {
    return text.length > limit ? `${text.slice(0, limit)}${TRUNCATED}` : text;
}

function binaryText(value: unknown): string | undefined {
    if (value === null || typeof value !== "object") {
        return undefined;
    }
    const kind = Object.prototype.toString.call(value).slice(8, -1);
    if (ArrayBuffer.isView(value)) {
        return "length" in value && typeof value.length === "number" ? `[${kind} length=${value.length}]` : `[${kind} byteLength=${value.byteLength}]`;
    }
    if ((kind === "ArrayBuffer" || kind === "SharedArrayBuffer") && "byteLength" in value && typeof value.byteLength === "number") {
        return `[${kind} byteLength=${value.byteLength}]`;
    }
    return undefined;
}

function boundedJson(value: unknown, limit: number): string | undefined {
    let written = 0;
    return JSON.stringify(value, (_key: string, item: unknown): unknown => {
        if (written > limit) {
            return undefined;
        }
        const binary = binaryText(item);
        if (binary !== undefined) {
            written += binary.length;
            return binary;
        }
        if (typeof item === "string") {
            written += item.length;
            return item.length > limit ? item.slice(0, limit + 1) : item;
        }
        if (Array.isArray(item)) {
            written += 1;
            return item.length > limit ? item.slice(0, limit + 1) : item;
        }
        if (item !== undefined && typeof item !== "function" && typeof item !== "symbol") {
            written += 1;
        }
        return item;
    });
}

function plainText(value: unknown): string {
    try {
        return String(value);
    } catch {
        return Object.prototype.toString.call(value);
    }
}

function errorText(error: unknown): string {
    if (error instanceof Error) {
        return error.name === "Error" ? error.message : `${error.name}: ${error.message}`;
    }
    if (typeof error === "string") {
        return error;
    }
    try {
        const text = boundedJson(error, MAX_ERROR_TEXT);
        if (text !== undefined) {
            return cut(text, MAX_ERROR_TEXT);
        }
    } catch {
        return plainText(error);
    }
    return plainText(error);
}

function inputText(key: string, value: unknown): string {
    const binary = binaryText(value);
    if (binary !== undefined) {
        return `${key}: ${binary}`;
    }
    try {
        const text = boundedJson(value, MAX_INPUT_TEXT);
        return text === undefined ? `${key}: undefined` : `${key}: ${cut(text, MAX_INPUT_TEXT)}`;
    } catch {
        return `${key}: [unserializable]`;
    }
}

/** Whether a thrown value is a WebAssembly trap, which leaves the kernel's memory in an unknown state. */
function isTrap(error: unknown): boolean {
    return error instanceof Error && error.name === "RuntimeError";
}

/**
 * The code and details of a `KernelOperationError`, whichever copy of the class threw it; undefined
 * for any other error, and for one whose code is not a string.
 */
function namedFailure(error: unknown): { code: string; details: KernelFailureDetails | undefined } | undefined {
    if (!(error instanceof Error) || error.name !== "KernelOperationError") {
        return undefined;
    }
    const code: unknown = Reflect.get(error, "code");
    return typeof code === "string" ? { code, details: checkedDetails(Reflect.get(error, "details")) } : undefined;
}

function isDetail(value: unknown): value is KernelFailureDetail {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        return true;
    }
    return Array.isArray(value) && (value.every((item: unknown) => typeof item === "number") || value.every((item: unknown) => typeof item === "string"));
}

/**
 * A failure's details, when they are a plain record of strings, numbers, booleans and lists of
 * either, which is all that crosses to another thread and fills a template.
 */
function checkedDetails(details: unknown): KernelFailureDetails | undefined {
    if (details === null || typeof details !== "object" || Array.isArray(details)) {
        return undefined;
    }
    const checked: Record<string, KernelFailureDetail> = {};
    for (const [name, value] of Object.entries(details)) {
        if (!isDetail(value)) {
            return undefined;
        }
        checked[name] = value;
    }
    return checked;
}

/** Ends a sentence with a full stop unless it already ends with one. */
function sentence(text: string): string {
    return /[.!?]$/.test(text) ? text : `${text}.`;
}

/**
 * Describes a failed kernel call in one shape for every kernel. An `InputError` reads
 * `<path>: <message>`, because the message already names the input at fault. A WebAssembly trap
 * (`RuntimeError`, such as an out-of-bounds access) is a `crash`: it reads `<kernel> crashed while
 * executing function '<path>': <message>.`, then the inputs. Any other failure
 * reads `<kernel> computation failed while executing function '<path>': <message>.` followed by the
 * inputs; a `KernelOperationError` gives its message without its type's name, its code and its
 * details, when they are a plain record of strings, numbers, booleans and lists of them. A message
 * that already ends a sentence gets no second full stop. The inputs are each cut at 200 characters, with binary data at any depth given only by its kind and size -
 * `[Float32Array length=6000000]` - and a long list or text read only as far as the cut, so a huge
 * input costs no more to describe than a small one. A call that named no function leaves the path
 * out of either form. It never throws: a failure that cannot be described is still reported, as one.
 * @param kernel - The kernel's name as a reader knows it, such as `OCCT`
 * @param functionName - The dotted path that was called
 * @param inputs - The inputs as the call received them
 * @param error - What the call threw
 * @returns The message, the kind of failure and the stack
 */
export function describeKernelFailure(kernel: string, functionName: string, inputs: unknown, error: unknown): KernelFailure {
    try {
        const stack = error instanceof Error ? error.stack : undefined;
        if (error instanceof Error && error.name === "InputError") {
            return { message: functionName ? `${functionName}: ${error.message}` : error.message, kind: "input", code: undefined, details: undefined, stack };
        }
        const where = functionName ? ` while executing function '${functionName}'` : "";
        const entries = inputs !== null && typeof inputs === "object" && binaryText(inputs) === undefined ? Object.entries(inputs) : [];
        const props = entries.length > 0 ? ` Input values were: {${entries.map(([key, value]) => inputText(key, value)).join(", ")}}.` : "";
        if (isTrap(error)) {
            return { message: `${kernel} crashed${where}: ${sentence(errorText(error))}${props}`, kind: "crash", code: undefined, details: undefined, stack };
        }
        const named = namedFailure(error);
        const text = named !== undefined && error instanceof Error ? error.message : errorText(error);
        return { message: `${kernel} computation failed${where}: ${sentence(text)}${props}`, kind: "kernel", code: named?.code, details: named?.details, stack };
    } catch {
        const where = typeof functionName === "string" && functionName !== "" ? ` while executing function '${functionName}'` : "";
        return { message: `${kernel} computation failed${where}, and the failure could not be described.`, kind: "kernel", code: undefined, details: undefined, stack: undefined };
    }
}
