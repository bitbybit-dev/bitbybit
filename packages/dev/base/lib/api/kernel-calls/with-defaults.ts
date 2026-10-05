import type { DtoRegistry } from "./resolve-dto";
import { isRegisteredOperation, resolveInputs } from "./resolve-dto";

/**
 * A kernel used in the same thread, whose operations lay a caller's inputs over the defaults of the
 * DTO each takes - what a worker does for a call that crossed to it. `occt.shapes.solid.createBox({
 * width: 2 })` then builds the box the DTO's other defaults describe, where the kernel on its own
 * would read the missing properties as undefined.
 *
 * Only the objects on the way to a listed operation are wrapped, so everything else on the kernel -
 * its helpers, the engine objects it holds - is reached as it is, and a listed operation runs with
 * the kernel object itself as `this`. The same object is wrapped once, so a path read twice gives
 * the same object both times.
 * @param root - The kernel's root object
 * @param registry - The kernel's operations by dotted path, as its package exports them
 * @returns The kernel, applying the defaults on every listed operation
 */
export function withDefaults<T extends object>(root: T, registry: DtoRegistry): T {
    const prefixes = new Set<string>([""]);
    for (const path of Object.keys(registry)) {
        const segments = path.split(".");
        for (let i = 1; i < segments.length; i++) {
            prefixes.add(segments.slice(0, i).join("."));
        }
    }
    const wrapped = new WeakMap<object, object>();
    const wrap = (target: object, prefix: string): object => {
        const known = wrapped.get(target);
        if (known) {
            return known;
        }
        const proxy = new Proxy(target, {
            get(object, key) {
                const value: unknown = Reflect.get(object, key);
                if (typeof key !== "string") {
                    return value;
                }
                const path = prefix ? `${prefix}.${key}` : key;
                if (typeof value === "function") {
                    if (isRegisteredOperation(registry, path)) {
                        return (inputs: unknown): unknown => (value as (inputs: unknown) => unknown).call(object, resolveInputs(registry, path, inputs));
                    }
                    return value;
                }
                if (value !== null && typeof value === "object" && prefixes.has(path)) {
                    return wrap(value, path);
                }
                return value;
            },
        });
        wrapped.set(target, proxy);
        return proxy;
    };
    return wrap(root, "") as T;
}
