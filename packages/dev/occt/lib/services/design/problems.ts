import { InputError, isRecord, messageOf } from "@bitbybit-dev/base";
import type * as Models from "../../api/models";
import type { OcctFailureCode, OcctFailureDetails } from "../../kernel-failures";
import { readKernelException } from "../../kernel-exception";
import type { KernelExceptionReader } from "../../kernel-exception";
import { isKernelTrap } from "../../kernel-traps";

/** A problem found while reading a document, with the JSON pointer of the value it is about. */
export class DesignProblem extends Error {
    constructor(readonly path: string, message: string) {
        super(message);
        this.name = "DesignProblem";
    }
}

export { isKernelTrap };

const CRASHED: OcctFailureCode = "occt.design.crashed";

export function tagTrap(error: unknown, feature: string, path: string): void {
    if (error instanceof Error && Reflect.get(error, "code") === undefined) {
        const details: OcctFailureDetails[typeof CRASHED] = { feature, path };
        Reflect.set(error, "code", CRASHED);
        Reflect.set(error, "details", details);
    }
}

/**
 * What `run` returns; a kernel trap it throws is thrown on with the path of the feature it was tagged
 * with put under `at`, the position of the document an assembly placed, as its problems are.
 */
export function trapsPlacedUnder<T>(at: string, run: () => T): T {
    try {
        return run();
    } catch (error) {
        const details: unknown = error instanceof Error && isKernelTrap(error) && Reflect.get(error, "code") === CRASHED ? Reflect.get(error, "details") : undefined;
        if (error instanceof Error && isRecord(details) && typeof details["feature"] === "string" && typeof details["path"] === "string") {
            const placed: OcctFailureDetails[typeof CRASHED] = { feature: details["feature"], path: `${at}${details["path"]}` };
            Reflect.set(error, "details", placed);
        }
        throw error;
    }
}

/**
 * What `read` returns, or what `otherwise` makes of the error it throws; a kernel trap is thrown on,
 * since nothing that runs after one can be trusted.
 */
export function unlessTrapped<T>(occ: KernelExceptionReader, read: () => T, otherwise: (error: unknown) => T): T {
    try {
        return read();
    } catch (error) {
        if (isKernelTrap(error)) {
            throw error;
        }
        return otherwise(readKernelException(occ, error));
    }
}

export function cleanedUpOnError<T>(use: () => T, cleanup: () => void): T {
    try {
        return use();
    } catch (error) {
        if (!isKernelTrap(error)) {
            cleanup();
        }
        throw error;
    }
}

export function cleanedUp<T>(use: () => T, cleanup: () => void): T {
    const result = cleanedUpOnError(use, cleanup);
    cleanup();
    return result;
}

/** A fallback for `unlessTrapped` that turns any failure into nothing. */
export function nothing(): undefined {
    return undefined;
}

/** A fallback for `unlessTrapped` that turns a failure into a reason: `how` and what failed. */
export function failedWith(how: string): (error: unknown) => string {
    return error => `${how}: ${messageOf(error)}`;
}

export function problemsAt<T>(at: string, make: () => T): T {
    try {
        return make();
    } catch (error) {
        if (error instanceof InputError) {
            throw new DesignProblem(error.property === undefined ? at : pointer(at, error.property), error.message);
        }
        throw error;
    }
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

/**
 * A component whose part waits for the outcome of a script in the document it comes from: the
 * assembly reports it pending rather than failed, and skips what is joined to it.
 */
export class DesignWaiting extends DesignProblem {
    constructor(path: string, message: string) {
        super(path, message);
        this.name = "DesignWaiting";
    }
}
