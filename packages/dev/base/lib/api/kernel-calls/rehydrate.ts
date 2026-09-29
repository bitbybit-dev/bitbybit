/**
 * The hash a reference carries, or undefined when the value is not a reference.
 */
export type ReferenceHash = (value: object) => string | number | undefined;

const isPlainObject = (value: object): boolean => {
    const prototype = Object.getPrototypeOf(value) as unknown;
    return prototype === Object.prototype || prototype === null;
};

/**
 * Replaces every reference in `value` with the object it stands for, at any depth of arrays and
 * plain objects, and returns a new structure: the value passed in is never changed. Binary data is
 * returned as it is, and so is any object that is not a plain object or an array, and any the
 * caller marks `opaque` - a large value known to hold no reference, which is not walked.
 * @param value - The inputs as they arrived
 * @param hashOf - The hash a reference carries, or undefined for any other value
 * @param lookup - The object a hash stands for; it throws when there is none
 * @param opaque - True for an object that is returned as it is without being walked
 * @returns The inputs with every reference replaced
 */
export function rehydrateReferences(value: unknown, hashOf: ReferenceHash, lookup: (hash: string | number) => unknown, opaque?: (value: object) => boolean): unknown {
    if (value === null || typeof value !== "object") {
        return value;
    }
    if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) {
        return value;
    }
    const hash = hashOf(value);
    if (hash !== undefined) {
        return lookup(hash);
    }
    if (Array.isArray(value)) {
        return value.map((item) => rehydrateReferences(item, hashOf, lookup, opaque));
    }
    if (!isPlainObject(value) || opaque?.(value)) {
        return value;
    }
    const rehydrated: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
        rehydrated[key] = rehydrateReferences(item, hashOf, lookup, opaque);
    }
    return rehydrated;
}
