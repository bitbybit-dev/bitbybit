import { InputError } from "@bitbybit-dev/base";
import { MAX_RECIPE_COORDINATE } from "@bitbybit-dev/base/lib/api/recipes/limits.constants";
import { radiansOf } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/scalars";
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

export function requireTurn(degrees: number, property: string): void {
    requireFinite(degrees, `${property} in degrees`);
    if (!Number.isFinite(radiansOf(degrees))) {
        throw new InputError(`The ${property} in degrees is too large to turn by, got ${degrees}: give the same turn within 360 degrees`, property);
    }
}

export function requireWithinRecipes(length: number, what: string, property: string): void {
    if (length > MAX_RECIPE_COORDINATE) {
        throw new InputError(`The ${what} must be at most ${MAX_RECIPE_COORDINATE}, the largest coordinate a geometry recipe holds, got ${length}`, property);
    }
}

export function requiredReference(reader: EntityReader, id: number, attribute: string): number {
    const value = reader.attribute(id, attribute);
    if (!isReference(value)) {
        throw new Error(`#${id} has no ${attribute}`);
    }
    return value.ref;
}
