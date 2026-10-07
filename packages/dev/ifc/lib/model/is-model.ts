import type { IfcModel } from "./model-types";
import { ModelSnapshot } from "./snapshot";

/**
 * Whether a value is a model this library made, as `model.create`, `model.read` and every method
 * that changes a model return one.
 * @param value - The value to test
 * @returns True for a model
 * @beta
 */
export function isIfcModel(value: unknown): value is IfcModel {
    return value instanceof ModelSnapshot;
}
