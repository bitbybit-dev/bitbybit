import { DesignProblem, pointer } from "./problems";
import { namesIn } from "./expressions";
import { isRecord } from "@bitbybit-dev/base";
import { parsed } from "./values";
import type { Check, Known } from "./document-check-types";

export const NAME_ID = /^[A-Za-z_][A-Za-z0-9_-]*$/;

export function inputsOf(known: Known, path: string): string[] | undefined {
    const entry = known.registry[path];
    return entry?.constraints === undefined ? undefined : Object.keys(entry.constraints);
}

export function checkNames(tree: ReturnType<typeof parsed>, path: string, known: Known): void {
    for (const name of namesIn(tree)) {
        if (!known.parameters.has(name)) {
            throw new DesignProblem(path, `"${name}" is not a parameter of this document`);
        }
    }
}

export const checkNumber: Check = (value, path, known) => {
    if (typeof value === "number") {
        if (!Number.isFinite(value)) {
            throw new DesignProblem(path, "the value is not a finite number");
        }
        return;
    }
    if (typeof value !== "string") {
        throw new DesignProblem(path, "a number or an expression is expected");
    }
    checkNames(parsed(value, path), path, known);
};

export function checkNumbersIn(value: unknown, path: string, known: Known): void {
    if (typeof value === "number" || typeof value === "string") {
        checkNumber(value, path, known);
    } else if (Array.isArray(value)) {
        value.forEach((inner, index) => checkNumbersIn(inner, pointer(path, index), known));
    } else if (isRecord(value)) {
        Object.entries(value).forEach(([key, inner]) => checkNumbersIn(inner, pointer(path, key), known));
    }
}
