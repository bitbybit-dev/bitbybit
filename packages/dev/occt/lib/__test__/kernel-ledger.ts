import type { BitbybitOcctModule, ClassHandle } from "../../bitbybit-dev-occt/bitbybit-dev-occt";

const UNRECORDED_METHODS = new Set(["constructor", "isAliasOf", "clone", "delete", "isDeleted", "deleteLater"]);
const RUNTIME_FUNCTIONS = new Set(["addRunDependency", "removeRunDependency", "decrementExceptionRefcount", "getExceptionMessage", "_BitbybitOcct_Init"]);
const BORROWING_METHODS = new Set(["get", "surface"]);
const isBorrowed = (className: string, method: string): boolean => className.startsWith("Handle_") && BORROWING_METHODS.has(method);

type Callable = (this: unknown, ...args: unknown[]) => unknown;

export interface KernelLedger {
    readonly made: ClassHandle[];
    readonly live: (kept?: unknown) => ClassHandle[];
    readonly stop: () => void;
}

export interface LedgerRun<T> {
    readonly result: T | undefined;
    readonly thrown: unknown;
    readonly made: number;
    readonly leaked: ClassHandle[];
}

export function isHandle(value: unknown): value is ClassHandle {
    return typeof value === "object" && value !== null && typeof (value as { isDeleted?: unknown }).isDeleted === "function";
}

export function handlesIn(value: unknown, found: Set<ClassHandle> = new Set(), seen: Set<object> = new Set()): Set<ClassHandle> {
    if (typeof value !== "object" || value === null || seen.has(value) || ArrayBuffer.isView(value) || value instanceof ArrayBuffer) {
        return found;
    }
    seen.add(value);
    if (isHandle(value)) {
        found.add(value);
        return found;
    }
    Object.values(value).forEach(item => handlesIn(item, found, seen));
    return found;
}

function isClass(value: unknown): value is Callable & { prototype: object } {
    return typeof value === "function" && typeof (value.prototype as { isDeleted?: unknown } | undefined)?.isDeleted === "function";
}

function isEnum(value: Callable): boolean {
    return Object.prototype.hasOwnProperty.call(value, "values");
}

export function kernelLedger(occt: BitbybitOcctModule): KernelLedger {
    const made: ClassHandle[] = [];
    const restores: (() => void)[] = [];
    const patchedPrototypes = new Set<object>();
    const collect = (value: unknown): void => {
        handlesIn(value).forEach(handle => made.push(handle));
    };
    const recording = (original: Callable, self?: unknown): Callable => function (this: unknown, ...args: unknown[]): unknown {
        const value = original.apply(self ?? this, args);
        collect(value);
        return value;
    };
    const patchPrototype = (className: string, prototype: object): void => {
        if (patchedPrototypes.has(prototype)) {
            return;
        }
        patchedPrototypes.add(prototype);
        Object.getOwnPropertyNames(prototype).filter(name => !UNRECORDED_METHODS.has(name) && !isBorrowed(className, name)).forEach(name => {
            const descriptor = Object.getOwnPropertyDescriptor(prototype, name);
            if (descriptor === undefined || typeof descriptor.value !== "function" || descriptor.writable !== true) {
                return;
            }
            const original = descriptor.value as Callable;
            Reflect.set(prototype, name, recording(original));
            restores.push(() => Reflect.set(prototype, name, original));
        });
    };
    Object.keys(occt).forEach(name => {
        const original: unknown = Reflect.get(occt, name);
        if (typeof original !== "function" || RUNTIME_FUNCTIONS.has(name)) {
            return;
        }
        if (isClass(original)) {
            patchPrototype(name, original.prototype);
            const statics = new Map<PropertyKey, Callable>();
            Reflect.set(occt, name, new Proxy(original, {
                construct(target, args): object {
                    const object: ClassHandle = Reflect.construct(target, args);
                    made.push(object);
                    return object;
                },
                get(target, property): unknown {
                    const value: unknown = Reflect.get(target, property);
                    if (typeof value !== "function" || property === "prototype") {
                        return value;
                    }
                    const known = statics.get(property);
                    if (known !== undefined) {
                        return known;
                    }
                    const wrapped = recording(value as Callable, target);
                    statics.set(property, wrapped);
                    return wrapped;
                },
            }));
        } else if (!isEnum(original as Callable)) {
            Reflect.set(occt, name, recording(original as Callable, occt));
        } else {
            return;
        }
        restores.push(() => Reflect.set(occt, name, original));
    });
    return {
        made,
        live: (kept?: unknown): ClassHandle[] => {
            const keptHandles = handlesIn(kept);
            return [...new Set(made)].filter(handle => !handle.isDeleted() && !keptHandles.has(handle));
        },
        stop: (): void => {
            restores.splice(0).reverse().forEach(restore => restore());
        },
    };
}

export function ledgerRun<T>(occt: BitbybitOcctModule, act: () => T): LedgerRun<T> {
    const ledger = kernelLedger(occt);
    let result: T | undefined;
    let thrown: unknown;
    try {
        result = act();
    } catch (error) {
        thrown = error;
    } finally {
        ledger.stop();
    }
    return { result, thrown, made: new Set(ledger.made).size, leaked: ledger.live(result) };
}

export function namesOf(handles: readonly ClassHandle[]): string[] {
    return handles.map(handle => (Object.getPrototypeOf(handle) as { constructor: { name: string } }).constructor.name).sort();
}
