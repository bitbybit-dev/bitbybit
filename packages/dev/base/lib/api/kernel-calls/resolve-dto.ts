/**
 * A DTO class that can be constructed with no arguments, which gives every defaulted property its
 * default.
 */
export type DtoConstructor<T extends object = object> = new () => T;

/**
 * What an operation takes: its inputs DTO, and the properties of that DTO that hold another DTO
 * whose defaults apply too. An operation that takes no DTO has neither.
 */
export type DtoEntry = {
    readonly dto?: DtoConstructor;
    readonly nested?: Readonly<Record<string, DtoConstructor>>;
};

/**
 * Every public operation of a kernel by its dotted path, and what it takes.
 */
export type DtoRegistry = Readonly<Record<string, DtoEntry>>;

/**
 * A DTO as its defaults leave it: the defaulted keys `K` are present and never undefined, and every
 * other property keeps its declared type.
 */
export type WithDefaults<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: Exclude<T[P], undefined> };

const isRecord = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object" && !Array.isArray(value);

/**
 * Builds the DTO a service reads from what a caller passed: the defaults a new `Dto` holds, with the
 * caller's properties laid over them. A property the caller set to undefined keeps its default, and
 * a caller that passed nothing gets the defaults alone. The result is a new plain object - a DTO
 * carries data and no behaviour, and a plain object is what crosses a worker boundary and what a
 * walk over the inputs treats as data - and the caller's object is never changed. Properties named
 * in `nested` hold a DTO of their own and get its defaults the same way.
 * @param Dto - The DTO class whose initializers are the defaults
 * @param inputs - What the caller passed, usually an object literal
 * @param nested - The properties that hold a DTO, and its class
 * @returns A new plain object holding every default the caller did not override
 */
export function resolveDto<T extends object>(Dto: DtoConstructor<T>, inputs: unknown, nested?: Readonly<Record<string, DtoConstructor>>): T {
    const resolved: Record<string, unknown> = {};
    Object.assign(resolved, new Dto());
    if (isRecord(inputs)) {
        for (const [key, value] of Object.entries(inputs)) {
            if (value !== undefined) {
                resolved[key] = value;
            }
        }
    }
    if (nested) {
        for (const [key, NestedDto] of Object.entries(nested)) {
            const value = resolved[key];
            if (isRecord(value)) {
                resolved[key] = resolveDto(NestedDto, value);
            }
        }
    }
    return resolved as T;
}

/**
 * Whether `path` names an operation the registry lists.
 * @param registry - A kernel's operations by dotted path
 * @param path - The dotted path to look up
 * @returns True when the registry lists the path
 */
export function isRegisteredOperation(registry: DtoRegistry, path: string): boolean {
    return Object.prototype.hasOwnProperty.call(registry, path);
}

/**
 * The inputs an operation should receive: `inputs` over the defaults of the DTO the registry names
 * for `path`. Inputs to an operation the registry does not list, or that takes no DTO, are returned
 * as they are.
 * @param registry - A kernel's operations by dotted path
 * @param path - The dotted path of the operation
 * @param inputs - What the caller passed
 * @returns The inputs with the DTO's defaults applied
 */
export function resolveInputs(registry: DtoRegistry, path: string, inputs: unknown): unknown {
    if (!isRegisteredOperation(registry, path)) {
        return inputs;
    }
    const entry = registry[path]!;
    return entry.dto ? resolveDto(entry.dto, inputs, entry.nested) : inputs;
}
