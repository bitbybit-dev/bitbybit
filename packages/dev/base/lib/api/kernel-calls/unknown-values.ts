/**
 * Whether a value is an object with string keys: not null, and not an array.
 * @param value - The value to test
 * @returns Whether it is such an object
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * The message of a thrown value: an error's own message, or anything else written as text.
 * @param thrown - What was thrown
 * @returns Its message
 */
export function messageOf(thrown: unknown): string {
    return thrown instanceof Error ? thrown.message : String(thrown);
}
