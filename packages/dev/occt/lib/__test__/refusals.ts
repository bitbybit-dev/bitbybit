import { expect } from "vitest";
import { InputError, KernelOperationError } from "@bitbybit-dev/base";
import { wasReadFromKernel } from "../kernel-exception-reads";
import type { ExpectedRefusal, SeenRefusal } from "./lifetime-cases-types";

export function causeChainOf(thrown: unknown): unknown[] {
    const chain: unknown[] = [];
    let current = thrown;
    while (current !== undefined && !chain.includes(current)) {
        chain.push(current);
        current = typeof current === "object" && current !== null ? Reflect.get(current, "cause") : undefined;
    }
    return chain;
}

export function trapsAlong(thrown: unknown): unknown[] {
    return causeChainOf(thrown).filter(link => link instanceof WebAssembly.RuntimeError);
}

export function rawKernelExceptionsAlong(thrown: unknown): unknown[] {
    const nativeException = Reflect.get(WebAssembly, "Exception") as new (...args: never[]) => object;
    return causeChainOf(thrown).filter(link => typeof link === "number" || link instanceof nativeException);
}

export function refusalOf(thrown: unknown, isStubbed: (thrown: unknown) => boolean): SeenRefusal {
    if (thrown instanceof InputError) {
        return { kind: "input", property: thrown.property, message: thrown.message };
    }
    if (thrown instanceof KernelOperationError) {
        return { kind: "operation", code: thrown.code, message: thrown.message };
    }
    const message = thrown instanceof Error ? `${thrown.name}: ${thrown.message}` : String(thrown);
    if (wasReadFromKernel(thrown)) {
        return { kind: "kernel", message };
    }
    return { kind: isStubbed(thrown) ? "stubbed" : "other", message };
}

export function patternOf(expected: ExpectedRefusal | undefined): Record<string, unknown> {
    if (expected === undefined) {
        return {};
    }
    if (expected.kind === "input") {
        return expected.says === undefined ? { kind: "input", property: expected.property } : { kind: "input", property: expected.property, message: expect.stringContaining(expected.says) };
    }
    if (expected.kind === "operation") {
        return { kind: "operation", code: expected.code };
    }
    return { kind: "kernel", message: expect.stringContaining(expected.says) };
}
