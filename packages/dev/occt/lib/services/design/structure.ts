import { isRecord } from "@bitbybit-dev/base";
import { DesignProblem, pointer } from "./problems";

const EXTENSION_NAME = /^[a-z][a-z0-9-]*(\.[A-Za-z][A-Za-z0-9_-]*)+$/;
const LOCALE = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/;

/**
 * Refuses a property the format does not define. `extras` and `extensions` are allowed on every
 * object `extensible` is true for, and checked: `extensions` holds objects under namespaced names.
 */
export function checkKeys(value: Record<string, unknown>, allowed: readonly string[], path: string, extensible: boolean): void {
    for (const key of Object.keys(value)) {
        if (allowed.includes(key) || (extensible && (key === "extras" || key === "extensions"))) {
            continue;
        }
        throw new DesignProblem(pointer(path, key), `"${key}" is not a property here: use ${[...allowed, ...(extensible ? ["extras", "extensions"] : [])].join(", ")}`);
    }
    const extensions = value["extensions"];
    if (extensible && extensions !== undefined) {
        if (!isRecord(extensions)) {
            throw new DesignProblem(pointer(path, "extensions"), "extensions is an object of namespaced names");
        }
        for (const [name, inner] of Object.entries(extensions)) {
            if (!EXTENSION_NAME.test(name)) {
                throw new DesignProblem(pointer(path, "extensions", name), `"${name}" is not a namespaced name such as "acme.costing"`);
            }
            if (!isRecord(inner)) {
                throw new DesignProblem(pointer(path, "extensions", name), "an extension is an object");
            }
        }
    }
}

/** Refuses what is not an object with only the `allowed` properties. */
export function checkObject(value: unknown, allowed: readonly string[], path: string, extensible: boolean, what: string): Record<string, unknown> {
    if (!isRecord(value)) {
        throw new DesignProblem(path, `${what} is an object`);
    }
    checkKeys(value, allowed, path, extensible);
    return value;
}

/** Refuses a label that is neither text nor text by locale code. */
export function checkLabel(value: unknown, path: string): void {
    if (typeof value === "string") {
        return;
    }
    if (!isRecord(value) || Object.keys(value).length === 0) {
        throw new DesignProblem(path, "a label is text, or text by locale code such as { \"en\": \"Width\" }");
    }
    for (const [locale, text] of Object.entries(value)) {
        if (!LOCALE.test(locale) || typeof text !== "string") {
            throw new DesignProblem(pointer(path, locale), `"${locale}" is not a locale code with text, such as "en" or "pt-BR"`);
        }
    }
}

/** Refuses what is not a string. */
export function checkText(value: unknown, path: string, what: string): string {
    if (typeof value !== "string") {
        throw new DesignProblem(path, `${what} is text`);
    }
    return value;
}

/** Refuses a list whose items are not objects with distinct ids made of letters, digits, `_` and `-`. */
export function checkIdList(value: unknown, path: string, what: string): Record<string, unknown>[] {
    if (!Array.isArray(value)) {
        throw new DesignProblem(path, `${what} is a list`);
    }
    const ids = new Set<string>();
    return value.map((item, index) => {
        if (!isRecord(item)) {
            throw new DesignProblem(pointer(path, index), `each of ${what} is an object`);
        }
        const id = item["id"];
        if (typeof id !== "string" || !/^[A-Za-z_][A-Za-z0-9_-]*$/.test(id) || ids.has(id)) {
            throw new DesignProblem(pointer(path, index, "id"), "ids are distinct, start with a letter or _ and hold letters, digits, _ and -");
        }
        ids.add(id);
        return item;
    });
}

/** The value `record` holds under `key` itself, never one it inherits, such as `constructor`. */
export function ownValue<T>(record: Readonly<Record<string, T>> | undefined, key: string): T | undefined {
    return record !== undefined && Object.prototype.hasOwnProperty.call(record, key) ? record[key] : undefined;
}
