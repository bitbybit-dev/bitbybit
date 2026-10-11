import { isReference } from "../step/values";
import type { EntityReader } from "./build-types";
import { MIN_OUTLINE_POINTS, POINT2_SIZE } from "./constants";

const COUNT_WORDS = ["no", "one", "two", "three"];

export function requirePoint(point: unknown, size: number, what: string): void {
    if (!Array.isArray(point) || point.length !== size || !point.every(Number.isFinite)) {
        throw new TypeError(`The ${what} must be ${COUNT_WORDS[size] ?? size} finite numbers`);
    }
}

export function requireOutline(points: unknown, what: string): void {
    if (!Array.isArray(points) || points.length < MIN_OUTLINE_POINTS) {
        throw new TypeError(`The ${what} must be a list of at least ${MIN_OUTLINE_POINTS} [x, y] points`);
    }
    points.forEach((point, index) => requirePoint(point, POINT2_SIZE, `${what}'s point ${index}`));
}

export function requirePositive(value: number, what: string): void {
    if (!(value > 0) || !Number.isFinite(value)) {
        throw new RangeError(`The ${what} must be more than zero, got ${value}`);
    }
}

export function requireFinite(value: number, what: string): void {
    if (!Number.isFinite(value)) {
        throw new RangeError(`The ${what} must be a finite number, got ${value}`);
    }
}

export function requiredReference(reader: EntityReader, id: number, attribute: string): number {
    const value = reader.attribute(id, attribute);
    if (!isReference(value)) {
        throw new Error(`#${id} has no ${attribute}`);
    }
    return value.ref;
}
