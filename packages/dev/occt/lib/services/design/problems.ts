import { messageOf } from "@bitbybit-dev/base";
import type * as Models from "../../api/models";

/** A problem found while reading a document, with the JSON pointer of the value it is about. */
export class DesignProblem extends Error {
    constructor(readonly path: string, message: string) {
        super(message);
        this.name = "DesignProblem";
    }
}

/**
 * Whether `error` is a trap inside the kernel's WebAssembly. After one the kernel's state cannot be
 * trusted, so it is never reported as a feature that failed: it goes on to whoever can restart the
 * kernel.
 */
export function isKernelTrap(error: unknown): boolean {
    return typeof WebAssembly !== "undefined" && error instanceof WebAssembly.RuntimeError;
}

/**
 * What `read` returns, or what `otherwise` makes of the error it throws; a kernel trap is thrown on,
 * since nothing that runs after one can be trusted.
 */
export function unlessTrapped<T>(read: () => T, otherwise: (error: unknown) => T): T {
    try {
        return read();
    } catch (error) {
        if (isKernelTrap(error)) {
            throw error;
        }
        return otherwise(error);
    }
}

/** A fallback for `unlessTrapped` that turns any failure into nothing. */
export function nothing(): undefined {
    return undefined;
}

/** A fallback for `unlessTrapped` that turns a failure into a reason: `how` and what failed. */
export function failedWith(how: string): (error: unknown) => string {
    return error => `${how}: ${messageOf(error)}`;
}

/** The JSON pointer of `path` below `base`, with `~` and `/` escaped as JSON pointers escape them. */
export function pointer(base: string, ...path: (string | number)[]): string {
    return base + path.map(part => "/" + String(part).replace(/~/g, "~0").replace(/\//g, "~1")).join("");
}

/** What a pending script feature hands the caller: the script to run and the inputs to run it on. */
export type ScriptRequest = Omit<Models.OCCT.DesignPendingScript<unknown>, "hash">;

/**
 * A feature whose outcome the caller must make, such as a script's: thrown where the feature would be
 * made, carrying what the caller needs to make it. The run reports the feature pending and skips what
 * reads it, as it does for one that failed.
 */
export class DesignPending extends Error {
    constructor(readonly pending: ScriptRequest) {
        super(`${pending.id} waits for its script to run`);
        this.name = "DesignPending";
    }
}
