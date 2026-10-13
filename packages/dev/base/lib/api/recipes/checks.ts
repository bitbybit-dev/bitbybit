import type { Base } from "../inputs/base-inputs";
import type { Checker, Kind } from "./checker-types";
import { MAX_ISSUES, MAX_RECIPE_COORDINATE, POINT3_SIZE } from "./limits.constants";
import type { RecipeIssue } from "./recipe-types";

export const COORDINATE_RANGE = `from -${MAX_RECIPE_COORDINATE} to ${MAX_RECIPE_COORDINATE}`;

export function report(issues: RecipeIssue[], path: string, message: string): void {
    if (issues.length < MAX_ISSUES) {
        issues.push({ path, message });
    }
}

export function isCoordinate(value: unknown, limit = MAX_RECIPE_COORDINATE): value is number {
    return typeof value === "number" && Math.abs(value) <= limit;
}

export function coordinates(value: unknown, size: number, limit = MAX_RECIPE_COORDINATE): value is number[] {
    if (!Array.isArray(value) || value.length !== size) {
        return false;
    }
    for (let index = 0; index < size; index++) {
        if (!isCoordinate(value[index], limit)) {
            return false;
        }
    }
    return true;
}

export function isCount(value: unknown): value is number {
    return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

export function positive(issues: RecipeIssue[], value: unknown, path: string): void {
    if (typeof value !== "number" || !Number.isFinite(value) || !(value > 0)) {
        report(issues, path, "must be a finite number above zero");
    }
}

export function extent(issues: RecipeIssue[], value: unknown, path: string): void {
    if (!isCoordinate(value) || !(value > 0)) {
        report(issues, path, `must be a number above zero and at most ${MAX_RECIPE_COORDINATE}`);
    }
}

export function vector(issues: RecipeIssue[], value: unknown, path: string, nonZero: boolean): void {
    if (!coordinates(value, POINT3_SIZE)) {
        report(issues, path, `must be three numbers, each ${COORDINATE_RANGE}`);
    } else if (nonZero && value.every((item) => item === 0)) {
        report(issues, path, "must not be a zero vector");
    }
}

export function range(checker: Checker, value: unknown, length: number, multiple: number, minimum: number, path: string): Base.RecipeRange | undefined {
    if (!Array.isArray(value) || value.length !== 2 || !isCount(value[0]) || !isCount(value[1])) {
        report(checker.issues, path, "must be a range of two whole numbers, a start and a count");
        return undefined;
    }
    const checked = value as Base.RecipeRange;
    const [start, count] = checked;
    if (start + count > length) {
        report(checker.issues, path, `runs past the end of its buffer, which holds ${length} numbers`);
        return undefined;
    }
    if (count % multiple !== 0 || count < minimum) {
        report(checker.issues, path, `must hold a multiple of ${multiple} numbers, at least ${minimum}`);
        return undefined;
    }
    checker.referenced += count;
    return checked;
}

export function reference(checker: Checker, value: unknown, at: number, accepted: readonly Kind[], path: string): number {
    if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0 || value >= at) {
        report(checker.issues, path, at === 0 ? "must be the index of an earlier node, and none comes before it" : `must be the index of an earlier node, from 0 to ${at - 1}`);
        return 0;
    }
    const kind = checker.kinds[value];
    if (kind !== undefined && !accepted.includes(kind)) {
        report(checker.issues, path, `refers to a ${kind} node where ${accepted.join(" or ")} is needed`);
    }
    return checker.depths[value]!;
}

export function references(checker: Checker, value: unknown, at: number, accepted: readonly Kind[], path: string, allowEmpty: boolean): number {
    if (!Array.isArray(value) || (!allowEmpty && value.length === 0)) {
        report(checker.issues, path, allowEmpty ? "must be a list of node indices" : "must be a list of at least one node index");
        return 0;
    }
    let deepest = 0;
    for (let index = 0; index < value.length; index++) {
        deepest = Math.max(deepest, reference(checker, value[index], at, accepted, `${path}[${index}]`));
    }
    return deepest;
}
